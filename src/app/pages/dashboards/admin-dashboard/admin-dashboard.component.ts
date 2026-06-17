import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { AdminStatsService, AdminStats } from '../../../core/services/admin-stats.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
  refreshing       = false;
  lastUpdated: Date | null = null;

  // ── Gauge ─────────────────────────────────────────────────────────
  reparationsTerminees     = 0;
  reparationsEnCours       = 0;
  reparationsEnAttente     = 0;
  reparationsFailed        = 0;
  reparationsEnAttenteDevis = 0;
  reparationsRefuseeClient  = 0;
  completionRate       = 0;
  completionDash       = 0;

  // ── Devis ────────────────────────────────────────────────────────
  devisTotal      = 0;
  devisEnAttente  = 0;
  devisAccepte    = 0;
  devisRefuse     = 0;
  tauxAcceptation = 0;

  // ── Activité récente ─────────────────────────────────────────────
  recentActivity: any[] = [];

  // ── Chart data ───────────────────────────────────────────────────
  private statusData:     { label: string; value: number; color: string }[] = [];
  private monthlyData:    number[] = new Array(12).fill(0);
  private revenueMonthly: number[] = new Array(12).fill(0);
  private rolesData:      { label: string; value: number }[] = [];
  techData:               { label: string; value: number }[] = [];

  private charts: Chart[] = [];
  roleChartHeight = 200;
  currentYear = new Date().getFullYear();
  exporting = false;

  constructor(
    private authService: AuthService,
    private adminStatsService: AdminStatsService,
    private auditLogService: AuditLogService,
    private translate: TranslateService
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? this.translate.instant('adminDashboard.fallbackLogin');
    this.loadStats();
    this.loadRecentActivity();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  // ── Actions ──────────────────────────────────────────────────────

  refresh(): void {
    this.refreshing = true;
    this.loadStats();
    this.loadRecentActivity();
  }

  // ── Data loaders ─────────────────────────────────────────────────

  private loadStats(): void {
    this.adminStatsService.getStats().subscribe({
      next: (stats: AdminStats) => {
        this.loading    = false;
        this.refreshing = false;
        this.lastUpdated = new Date();

        // KPI (animated count-up)
        this.animateValue(v => this.totalUsers       = v, this.totalUsers,       stats.users.total);
        this.animateValue(v => this.activeUsers      = v, this.activeUsers,      stats.users.active);
        this.animateValue(v => this.totalClients     = v, this.totalClients,     stats.clients.total);
        this.animateValue(v => this.totalReparations = v, this.totalReparations, stats.reparations.total);
        this.animateValue(v => this.totalRevenue     = v, this.totalRevenue,     stats.revenue.total);
        this.animateValue(v => this.totalFactures    = v, this.totalFactures,    stats.revenue.totalFactures);

        // Gauge
        this.reparationsTerminees      = stats.reparations.done;
        this.reparationsEnCours        = stats.reparations.inProgress;
        this.reparationsEnAttente      = stats.reparations.pending;
        this.reparationsFailed         = stats.reparations.failed;
        this.reparationsEnAttenteDevis = stats.reparations.enAttenteDevis;
        this.reparationsRefuseeClient  = stats.reparations.refuseeClient;

        // Animate the gauge ring + percentage together
        this.animateValue(v => {
          this.completionRate = v;
          this.completionDash = Math.round((v / 100) * 339.29);
        }, this.completionRate, stats.reparations.completionRate);

        // Devis
        this.devisTotal     = stats.devis.total;
        this.devisEnAttente = stats.devis.enAttente;
        this.devisAccepte   = stats.devis.accepte;
        this.devisRefuse    = stats.devis.refuse;
        this.animateValue(v => this.tauxAcceptation = v, this.tauxAcceptation, stats.devis.tauxAcceptation);

        // Status donut data (6 catégories)
        this.statusData = [
          { label: this.translate.instant('adminDashboard.status.done'),           value: stats.reparations.done,           color: '#059669' },
          { label: this.translate.instant('adminDashboard.status.inProgress'),     value: stats.reparations.inProgress,     color: '#2563eb' },
          { label: this.translate.instant('adminDashboard.status.pending'),        value: stats.reparations.pending,        color: '#d97706' },
          { label: this.translate.instant('adminDashboard.status.quotePending'),   value: stats.reparations.enAttenteDevis, color: '#7c3aed' },
          { label: this.translate.instant('adminDashboard.status.refusedClient'),  value: stats.reparations.refuseeClient,  color: '#ec4899' },
          { label: this.translate.instant('adminDashboard.status.failed'),         value: stats.reparations.failed,         color: '#dc2626' }
        ].filter(d => d.value > 0);

        this.monthlyData    = stats.reparations.monthly;
        this.revenueMonthly = stats.revenue.monthly;
        this.techData       = stats.topTechs;

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
          this.buildRevenueChart();
        }, 0);
      },
      error: () => {
        this.loading    = false;
        this.refreshing = false;
      }
    });
  }

  private loadRecentActivity(): void {
    this.auditLogService.getAll({ limit: 6 }).subscribe({
      next: (res) => this.recentActivity = res.data ?? [],
      error: () => {}
    });
  }

  // ── Animation helper ─────────────────────────────────────────────

  private animateValue(setter: (v: number) => void, from: number, to: number, duration = 800): void {
    if (from === to) { setter(to); return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;
      setter(progress < 1 ? Math.round(value * 100) / 100 : to);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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

    const months = this.translate.instant('adminDashboard.months') as string[];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: this.translate.instant('adminDashboard.charts.repairs'),
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
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} ${this.translate.instant('adminDashboard.charts.repairsLower')}` } }
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
          label: this.translate.instant('adminDashboard.charts.members'),
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
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} ${this.translate.instant('adminDashboard.charts.membersUnit')}` } }
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
          label: this.translate.instant('adminDashboard.charts.repairs'),
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
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} ${this.translate.instant('adminDashboard.charts.repairsLower')}` } }
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

  private buildRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();

    const months = this.translate.instant('adminDashboard.months') as string[];

    let bg: string | CanvasGradient = 'rgba(5,150,105,0.18)';
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 220);
      gradient.addColorStop(0, 'rgba(5,150,105,0.35)');
      gradient.addColorStop(1, 'rgba(5,150,105,0.02)');
      bg = gradient;
    }

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: this.translate.instant('adminDashboard.charts.revenue'),
          data: this.revenueMonthly,
          borderColor: '#059669',
          backgroundColor: bg,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${this.formatRevenue(ctx.parsed.y ?? 0)}` } }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 }, color: '#9ca3af' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              color: '#9ca3af',
              font: { size: 11 },
              callback: (v) => this.formatRevenue(Number(v))
            }
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

      const drawHeader = (title: string) => {
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, pw, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(17);
        doc.text(title, mg, 17);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(this.translate.instant('adminDashboard.pdf.generatedBy', { date: dateStr, login: this.login }), mg, 28);
      };

      // ── PAGE 1 ──────────────────────────────────────────────────
      drawHeader(this.translate.instant('adminDashboard.pdf.reportTitle'));

      // KPI Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(this.translate.instant('adminDashboard.pdf.keyIndicators'), mg, 46);

      autoTable(doc, {
        startY: 50,
        head: [[this.translate.instant('adminDashboard.pdf.indicator'), this.translate.instant('adminDashboard.pdf.value')]],
        body: [
          [this.translate.instant('adminDashboard.pdf.usersExclAdmin'), `${this.totalUsers}  (${this.activeUsers} ${this.translate.instant('adminDashboard.pdf.activeLower')})`],
          [this.translate.instant('adminDashboard.pdf.registeredClients'), `${this.totalClients}`],
          [this.translate.instant('adminDashboard.pdf.totalRepairs'), `${this.totalReparations}`],
          [this.translate.instant('adminDashboard.pdf.completionRate'), `${this.completionRate} %`],
          [this.translate.instant('adminDashboard.pdf.invoicesIssued'), `${this.totalFactures}`],
          [this.translate.instant('adminDashboard.pdf.revenue'), this.formatRevenuePdf(this.totalRevenue)],
          [this.translate.instant('adminDashboard.pdf.quotesIssued'), `${this.devisTotal}`],
          [this.translate.instant('adminDashboard.pdf.quoteAcceptanceRate'), `${this.tauxAcceptation} %`],
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
      doc.text(this.translate.instant('adminDashboard.pdf.repairsByStatus'), mg, y);
      y += 4;

      const safe = (n: number) =>
        this.totalReparations ? Math.round((n / this.totalReparations) * 100) : 0;

      autoTable(doc, {
        startY: y,
        head: [[this.translate.instant('adminDashboard.pdf.statusCol'), this.translate.instant('adminDashboard.pdf.countCol'), '%']],
        body: [
          [this.translate.instant('adminDashboard.status.done'),          `${this.reparationsTerminees}`,      `${safe(this.reparationsTerminees)} %`],
          [this.translate.instant('adminDashboard.status.inProgress'),    `${this.reparationsEnCours}`,        `${safe(this.reparationsEnCours)} %`],
          [this.translate.instant('adminDashboard.status.pending'),       `${this.reparationsEnAttente}`,      `${safe(this.reparationsEnAttente)} %`],
          [this.translate.instant('adminDashboard.status.quotePending'),  `${this.reparationsEnAttenteDevis}`, `${safe(this.reparationsEnAttenteDevis)} %`],
          [this.translate.instant('adminDashboard.status.refusedClient'), `${this.reparationsRefuseeClient}`,  `${safe(this.reparationsRefuseeClient)} %`],
          [this.translate.instant('adminDashboard.status.failed'),        `${this.reparationsFailed}`,         `${safe(this.reparationsFailed)} %`],
        ],
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 } },
        margin: { left: mg, right: pw - mg - 78 }
      });

      const donutImg = getImg('statusChart');
      if (donutImg) doc.addImage(donutImg, 'PNG', pw - mg - 74, y - 2, 74, 68);

      // ── PAGE 2 ──────────────────────────────────────────────────
      doc.addPage();

      // Monthly chart
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(`${this.translate.instant('adminDashboard.pdf.monthlyActivity')} — ${this.currentYear}`, mg, 18);

      const monthlyImg = getImg('monthlyChart');
      if (monthlyImg) doc.addImage(monthlyImg, 'PNG', mg, 22, pw - mg * 2, 52);

      const months = this.translate.instant('adminDashboard.months') as string[];
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
      doc.text(this.translate.instant('adminDashboard.pdf.teamByRole'), mg, y);
      y += 4;

      const rolesImg = getImg('rolesChart');
      if (rolesImg) doc.addImage(rolesImg, 'PNG', mg, y, 85, 52);

      autoTable(doc, {
        startY: y,
        head: [[this.translate.instant('adminDashboard.pdf.roleCol'), this.translate.instant('adminDashboard.charts.members')]],
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
      doc.text(this.translate.instant('adminDashboard.pdf.topTechnicians'), mg, y);
      y += 4;

      const techImg = getImg('techChart');
      if (techImg) doc.addImage(techImg, 'PNG', mg, y, 85, 52);

      if (this.techData.length) {
        autoTable(doc, {
          startY: y,
          head: [[this.translate.instant('adminDashboard.pdf.technicianCol'), this.translate.instant('adminDashboard.charts.repairs')]],
          body: this.techData.map(t => [t.label, String(t.value)]),
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [217, 119, 6], textColor: 255 },
          columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 30 } },
          margin: { left: mg + 90, right: mg }
        });
      }

      // ── PAGE 3 ──────────────────────────────────────────────────
      doc.addPage();
      drawHeader(this.translate.instant('adminDashboard.pdf.financeTitle'));

      // Revenue chart
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(`${this.translate.instant('adminDashboard.pdf.monthlyRevenue')} — ${this.currentYear}`, mg, 46);

      const revenueImg = getImg('revenueChart');
      if (revenueImg) doc.addImage(revenueImg, 'PNG', mg, 50, pw - mg * 2, 52);

      autoTable(doc, {
        startY: 106,
        head: [months],
        body: [this.revenueMonthly.map(v => v.toFixed(0))],
        styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        margin: { left: mg, right: mg }
      });

      // Devis breakdown table + Recent activity table
      y = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(this.translate.instant('adminDashboard.pdf.quotes'), mg, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [[this.translate.instant('adminDashboard.pdf.quotes'), this.translate.instant('adminDashboard.pdf.value')]],
        body: [
          [this.translate.instant('adminDashboard.pdf.totalIssued'), `${this.devisTotal}`],
          [this.translate.instant('adminDashboard.devis.pending'), `${this.devisEnAttente}`],
          [this.translate.instant('adminDashboard.devis.accepted'), `${this.devisAccepte}`],
          [this.translate.instant('adminDashboard.devis.refused'), `${this.devisRefuse}`],
          [this.translate.instant('adminDashboard.pdf.acceptanceRate'), `${this.tauxAcceptation} %`],
        ],
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255 },
        columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 30 } },
        margin: { left: mg, right: pw - mg - 95 }
      });

      y = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 75);
      doc.text(this.translate.instant('adminDashboard.recentActivity'), mg, y);
      y += 4;

      if (this.recentActivity.length) {
        autoTable(doc, {
          startY: y,
          head: [[this.translate.instant('adminDashboard.pdf.dateCol'), this.translate.instant('adminDashboard.pdf.userCol'), this.translate.instant('adminDashboard.pdf.actionCol'), this.translate.instant('adminDashboard.pdf.itemCol')]],
          body: this.recentActivity.map(log => [
            new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
            log.userLogin || this.translate.instant('adminDashboard.system'),
            this.actionLabel(log.action),
            `${this.entityLabel(log.entity)} #${log.entityId ?? '—'}`
          ]),
          styles: { fontSize: 9, cellPadding: 2.5 },
          headStyles: { fillColor: [217, 119, 6], textColor: 255 },
          margin: { left: mg, right: mg }
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175);
        doc.text(this.translate.instant('adminDashboard.pdf.noActivityRecorded'), mg, y + 4);
      }

      // Footer on every page
      const total = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          this.translate.instant('adminDashboard.pdf.footer', { date: dateStr, page: i, total }),
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
      admin: this.translate.instant('adminDashboard.roles.admin'),
      client: this.translate.instant('adminDashboard.roles.client'),
      technicien: this.translate.instant('adminDashboard.roles.technicien'),
      reception: this.translate.instant('adminDashboard.roles.reception'),
      responsable_reparation: this.translate.instant('adminDashboard.roles.reparation'),
      achat_stock: this.translate.instant('adminDashboard.roles.stock')
    };
    return map[role?.toLowerCase()] ?? role;
  }

  formatRevenue(value: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(value);
  }

  /** jsPDF's standard fonts can't render the Unicode narrow space used by Intl currency formatting — use plain ASCII for PDF text. */
  private formatRevenuePdf(value: number): string {
    return `${Math.round(value).toLocaleString('en-US').replace(/,/g, ' ')} TND`;
  }

  // ── Activité récente — helpers ────────────────────────────────────

  actionClass(action: string): string {
    const m: Record<string, string> = {
      CREATE: 'act-create',
      UPDATE: 'act-update',
      DELETE: 'act-delete',
      STATUS_CHANGE: 'act-status'
    };
    return m[action] ?? 'act-default';
  }

  actionIcon(action: string): string {
    const m: Record<string, string> = {
      CREATE: 'bi-plus-circle-fill',
      UPDATE: 'bi-pencil-square',
      DELETE: 'bi-trash-fill',
      STATUS_CHANGE: 'bi-arrow-repeat'
    };
    return m[action] ?? 'bi-circle-fill';
  }

  actionLabel(action: string): string {
    const m: Record<string, string> = {
      CREATE: this.translate.instant('adminDashboard.actions.create'),
      UPDATE: this.translate.instant('adminDashboard.actions.update'),
      DELETE: this.translate.instant('adminDashboard.actions.delete'),
      STATUS_CHANGE: this.translate.instant('adminDashboard.actions.statusChange')
    };
    return m[action] ?? action;
  }

  actionVerb(action: string): string {
    const m: Record<string, string> = {
      CREATE: this.translate.instant('adminDashboard.verbs.create'),
      UPDATE: this.translate.instant('adminDashboard.verbs.update'),
      DELETE: this.translate.instant('adminDashboard.verbs.delete'),
      STATUS_CHANGE: this.translate.instant('adminDashboard.verbs.statusChange')
    };
    return m[action] ?? this.translate.instant('adminDashboard.verbs.default');
  }

  entityLabel(entity: string): string {
    const m: Record<string, string> = {
      Reparation: this.translate.instant('adminDashboard.entities.reparation'),
      Demande: this.translate.instant('adminDashboard.entities.demande'),
      Client: this.translate.instant('adminDashboard.entities.client'),
      Planning: this.translate.instant('adminDashboard.entities.planning'),
      User: this.translate.instant('adminDashboard.entities.user'),
      Devis: this.translate.instant('adminDashboard.entities.devis')
    };
    return m[entity] ?? entity;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60)   return this.translate.instant('adminDashboard.time.now');
    const min = Math.floor(sec / 60);
    if (min < 60)   return this.translate.instant('adminDashboard.time.minutesAgo', { value: min });
    const hr = Math.floor(min / 60);
    if (hr < 24)    return this.translate.instant('adminDashboard.time.hoursAgo', { value: hr });
    const day = Math.floor(hr / 24);
    if (day < 7)    return this.translate.instant('adminDashboard.time.daysAgo', { value: day });
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}
