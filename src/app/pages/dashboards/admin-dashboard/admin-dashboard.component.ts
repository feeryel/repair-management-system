import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminStatsService, AdminStats } from '../../../core/services/admin-stats.service';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  // ── KPI ──────────────────────────────────────────────────────────
  totalUsers       = 0;
  activeUsers      = 0;
  totalClients     = 0;
  totalReparations = 0;
  totalRevenue     = 0;
  totalFactures    = 0;
  login            = '';
  loading          = true;

  // ── Gauge ─────────────────────────────────────────────────────────
  reparationsTerminees = 0;
  reparationsEnCours   = 0;
  reparationsEnAttente = 0;
  reparationsFailed    = 0;
  completionRate       = 0;
  completionDash       = 0;

  // ── Chart data ───────────────────────────────────────────────────
  private statusData:  { label: string; value: number; color: string }[] = [];
  private monthlyData: number[] = new Array(12).fill(0);
  private rolesData:   { label: string; value: number }[] = [];
  techData:            { label: string; value: number }[] = [];

  private charts: Chart[] = [];
  roleChartHeight = 200;
  currentYear = new Date().getFullYear();
  exporting = false;

  constructor(
    private authService: AuthService,
    private adminStatsService: AdminStatsService
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? 'Admin';
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  // ── Data loaders ─────────────────────────────────────────────────

  private loadStats(): void {
    this.adminStatsService.getStats().subscribe({
      next: (stats: AdminStats) => {
        this.loading = false;

        // KPI
        this.totalUsers      = stats.users.total;
        this.activeUsers     = stats.users.active;
        this.totalClients    = stats.clients.total;
        this.totalReparations = stats.reparations.total;
        this.totalRevenue    = stats.revenue.total;
        this.totalFactures   = stats.revenue.totalFactures;

        // Gauge
        this.reparationsTerminees = stats.reparations.done;
        this.reparationsEnCours   = stats.reparations.inProgress;
        this.reparationsEnAttente = stats.reparations.pending;
        this.reparationsFailed    = stats.reparations.failed;
        this.completionRate       = stats.reparations.completionRate;
        this.completionDash       = Math.round((this.completionRate / 100) * 339.29);

        // Status donut data
        this.statusData = [
          { label: 'Done',        value: stats.reparations.done,        color: '#059669' },
          { label: 'En cours',    value: stats.reparations.inProgress,  color: '#2563eb' },
          { label: 'En attente',  value: stats.reparations.pending,     color: '#d97706' },
          { label: 'Échoué',      value: stats.reparations.failed,      color: '#dc2626' }
        ].filter(d => d.value > 0);

        this.monthlyData = stats.reparations.monthly;
        this.techData    = stats.topTechs;

        // Roles bar data
        this.rolesData = Object.entries(stats.users.byRole)
          .map(([role, value]) => ({ label: this.roleLabel(role), value }))
          .sort((a, b) => b.value - a.value);
        this.roleChartHeight = Math.max(180, this.rolesData.length * 44 + 80);

        // Build all charts after data is ready
        setTimeout(() => {
          this.buildStatusChart();
          this.buildMonthlyChart();
          this.buildRolesChart();
          this.buildTechChart();
        }, 0);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ── Chart builders ───────────────────────────────────────────────

  private buildStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement | null;
    if (!canvas || !this.statusData.length) return;
    Chart.getChart(canvas)?.destroy();

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.statusData.map(d => d.label),
        datasets: [{
          data:            this.statusData.map(d => d.value),
          backgroundColor: this.statusData.map(d => d.color),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } }
        }
      }
    });
    this.charts.push(chart);

    const legendEl = document.getElementById('statusLegend');
    if (legendEl) {
      legendEl.innerHTML = this.statusData.map(d =>
        `<span>
          <span class="chart-legend-dot" style="background:${d.color}"></span>
          ${d.label} (${d.value})
        </span>`
      ).join('');
    }
  }

  private buildMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();

    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Réparations',
          data: this.monthlyData,
          backgroundColor: 'rgba(124,58,237,0.75)',
          borderColor: '#7c3aed',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} réparations` } }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 }, color: '#9ca3af' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { precision: 0, color: '#9ca3af', font: { size: 11 } }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildRolesChart(): void {
    const canvas = document.getElementById('rolesChart') as HTMLCanvasElement | null;
    if (!canvas || !this.rolesData.length) return;
    Chart.getChart(canvas)?.destroy();

    const palette = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2'];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.rolesData.map(d => d.label),
        datasets: [{
          label: 'Membres',
          data: this.rolesData.map(d => d.value),
          backgroundColor: this.rolesData.map((_, i) => palette[i % palette.length] + 'cc'),
          borderColor:     this.rolesData.map((_, i) => palette[i % palette.length]),
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} membre(s)` } }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { precision: 0, color: '#9ca3af', font: { size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#374151', font: { size: 12 } }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildTechChart(): void {
    const canvas = document.getElementById('techChart') as HTMLCanvasElement | null;
    if (!canvas || !this.techData.length) return;
    Chart.getChart(canvas)?.destroy();

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.techData.map(d => d.label),
        datasets: [{
          label: 'Réparations',
          data: this.techData.map(d => d.value),
          backgroundColor: ['#f59e0b','#fbbf24','#fcd34d','#fde68a','#fef3c7','#fffbeb'],
          borderColor: '#d97706',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} réparations` } }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#374151', font: { size: 11 }, maxRotation: 30 }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { precision: 0, color: '#9ca3af', font: { size: 11 } }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // ── PDF Export ───────────────────────────────────────────────────

  async exportPDF(): Promise<void> {
    this.exporting = true;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = 210;
      const mg = 14;
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

      const getImg = (id: string): string | null => {
        const c = document.getElementById(id) as HTMLCanvasElement | null;
        return c ? c.toDataURL('image/png') : null;
      };

      // ── PAGE 1 ──────────────────────────────────────────────────

      // Header
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pw, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.text('RAPPORT STATISTIQUES — TECHDOCTOR', mg, 17);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Généré le ${dateStr}   •   Administrateur : ${this.login}`, mg, 28);

      // KPI Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text('Indicateurs clés', mg, 46);

      autoTable(doc, {
        startY: 50,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Utilisateurs (hors admin)', `${this.totalUsers}  (${this.activeUsers} actifs)`],
          ['Clients enregistrés', `${this.totalClients}`],
          ['Réparations totales', `${this.totalReparations}`],
          ['Taux de complétion', `${this.completionRate} %`],
          ['Factures émises', `${this.totalFactures}`],
          ["Chiffre d'affaires", this.formatRevenue(this.totalRevenue)],
        ],
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        columnStyles: { 0: { cellWidth: 100 } },
        margin: { left: mg, right: mg }
      });

      // Status section: table left + donut right
      let y: number = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text('Réparations par statut', mg, y);
      y += 4;

      const safe = (n: number) =>
        this.totalReparations ? Math.round((n / this.totalReparations) * 100) : 0;

      autoTable(doc, {
        startY: y,
        head: [['Statut', 'Nb', '%']],
        body: [
          ['Done',        `${this.reparationsTerminees}`, `${safe(this.reparationsTerminees)} %`],
          ['En cours',    `${this.reparationsEnCours}`,   `${safe(this.reparationsEnCours)} %`],
          ['En attente',  `${this.reparationsEnAttente}`, `${safe(this.reparationsEnAttente)} %`],
          ['Échoué',      `${this.reparationsFailed}`,    `${safe(this.reparationsFailed)} %`],
        ],
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 } },
        margin: { left: mg, right: pw - mg - 78 }
      });

      const donutImg = getImg('statusChart');
      if (donutImg) doc.addImage(donutImg, 'PNG', pw - mg - 74, y - 2, 74, 58);

      // ── PAGE 2 ──────────────────────────────────────────────────
      doc.addPage();

      // Monthly chart
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(`Activité mensuelle — ${this.currentYear}`, mg, 18);

      const monthlyImg = getImg('monthlyChart');
      if (monthlyImg) doc.addImage(monthlyImg, 'PNG', mg, 22, pw - mg * 2, 52);

      const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
      autoTable(doc, {
        startY: 78,
        head: [months],
        body: [this.monthlyData.map(v => String(v))],
        styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255 },
        margin: { left: mg, right: mg }
      });

      // Roles: chart left + table right
      y = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text('Équipe par rôle', mg, y);
      y += 4;

      const rolesImg = getImg('rolesChart');
      if (rolesImg) doc.addImage(rolesImg, 'PNG', mg, y, 85, 52);

      autoTable(doc, {
        startY: y,
        head: [['Rôle', 'Membres']],
        body: this.rolesData.map(r => [r.label, String(r.value)]),
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 30 } },
        margin: { left: mg + 90, right: mg }
      });

      // Top techs: chart left + table right
      y = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text('Top techniciens', mg, y);
      y += 4;

      const techImg = getImg('techChart');
      if (techImg) doc.addImage(techImg, 'PNG', mg, y, 85, 52);

      if (this.techData.length) {
        autoTable(doc, {
          startY: y,
          head: [['Technicien', 'Réparations']],
          body: this.techData.map(t => [t.label, String(t.value)]),
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [217, 119, 6], textColor: 255 },
          columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 30 } },
          margin: { left: mg + 90, right: mg }
        });
      }

      // Footer on every page
      const total = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `TECHDOCTOR — Rapport statistiques — ${dateStr}   •   Page ${i} / ${total}`,
          mg, 292
        );
      }

      doc.save(`stats-admin-${now.toISOString().slice(0, 10)}.pdf`);
    } finally {
      this.exporting = false;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      admin: 'Admin', client: 'Client', technicien: 'Technicien',
      reception: 'Réception', responsable_reparation: 'Réparation',
      achat_stock: 'Stock'
    };
    return map[role?.toLowerCase()] ?? role;
  }

  formatRevenue(value: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(value);
  }
}
