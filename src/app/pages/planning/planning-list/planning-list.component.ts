import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import Swal from 'sweetalert2';
import { PlanningService } from '../../../core/services/planning.service';
import { AuthService, Role } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  plannings: any[];
}

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './planning-list.component.html',
  styleUrls: ['./planning-list.component.css']
})
export class PlanningListComponent implements OnInit {
isTechnicien = false;
isResponsable = false;

  plannings: any[] = [];
role: Role | '' = '';

  loading: boolean = false;

  // 👉 PAGINATION
  currentPage: number = 1;
  itemsPerPage: number = 7;

  // 👉 VUE GRILLE / CALENDRIER
  viewMode: 'grid' | 'calendar' = 'grid';
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarWeeks: CalendarDay[][] = [];
  weekDayLabels = [
    'planningList.weekday.mon',
    'planningList.weekday.tue',
    'planningList.weekday.wed',
    'planningList.weekday.thu',
    'planningList.weekday.fri',
    'planningList.weekday.sat',
    'planningList.weekday.sun'
  ];

  constructor(
    private service: PlanningService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
      this.role = (this.authService.getRole() as Role) ?? '';
      this.isTechnicien = this.role === Role.TECHNICIEN;
      this.isResponsable = this.role === Role.RESPONSABLE_REPARATION;
    this.loadData();
  }

  // =========================
  // LOAD DATA
  // =========================
  loadData() {

    this.loading = true;

    const userId = this.authService.getUserId();

    const source = this.isTechnicien && userId
      ? this.service.getByTechnicien(userId)
      : this.service.getAll();

    source.subscribe({

      next: (res: any) => {
        this.plannings = res;
        this.loading = false;
        this.currentPage = 1; // reset page
        this.buildCalendarGrid();
      },

      error: (err) => {

        this.loading = false;

        console.log(err);

        Swal.fire({
          icon: 'error',
          title: this.translate.instant('planningList.errorTitle'),
          text: this.translate.instant('planningList.loadError'),
          confirmButtonColor: '#6366f1'
        });

      }

    });

  }

  // =========================
  // STATUT (TECHNICIEN)
  // =========================
  statusLabel(s: string): string {
    const key = s === 'TERMINE'
      ? 'planningList.statusDone'
      : s === 'EN_COURS'
        ? 'planningList.statusInProgress'
        : 'planningList.statusPlanned';
    return this.translate.instant(key);
  }

  statusClass(s: string): string {
    return s === 'TERMINE' ? 'st-done' : s === 'EN_COURS' ? 'st-progress' : 'st-pending';
  }

  changeStatut(p: any, statut: string) {

    this.service.updateStatut(p.id, statut).subscribe({

      next: () => {
        p.statut = statut;
        Swal.fire({ icon: 'success', title: this.translate.instant('planningList.statusUpdated'), timer: 1500, showConfirmButton: false });
      },

      error: () => Swal.fire({
        icon: 'error',
        title: this.translate.instant('planningList.errorTitle'),
        text: this.translate.instant('planningList.statusUpdateError'),
        confirmButtonColor: '#6366f1'
      })

    });

  }

  // =========================
  // DELETE WITH SWEETALERT
  // =========================
  deletePlanning(id: number) {

    Swal.fire({

      title: this.translate.instant('planningList.deleteTitle'),
      text: this.translate.instant('planningList.deleteText'),
      icon: 'warning',

      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',

      confirmButtonText: this.translate.instant('planningList.deleteConfirm'),
      cancelButtonText: this.translate.instant('common.cancel')

    }).then((result) => {

      if (result.isConfirmed) {

        this.service.delete(id).subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: this.translate.instant('planningList.deletedTitle'),
              text: this.translate.instant('planningList.deletedText'),
              timer: 2000,
              showConfirmButton: false
            });

            this.loadData();

          },

          error: () => {

            Swal.fire({
              icon: 'error',
              title: this.translate.instant('planningList.errorTitle'),
              text: this.translate.instant('planningList.deleteError'),
              confirmButtonColor: '#6366f1'
            });

          }

        });

      }

    });

  }

  // =========================
  // PAGINATION GETTERS
  // =========================

  get paginatedPlannings() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.plannings.slice(start, start + this.itemsPerPage);

  }

  get totalPages(): number {

    return Math.ceil(this.plannings.length / this.itemsPerPage);

  }

  changePage(page: number) {

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }

  }

  // =========================
  // VUE GRILLE / CALENDRIER
  // =========================

  setViewMode(mode: 'grid' | 'calendar') {
    this.viewMode = mode;
    if (mode === 'calendar') {
      this.buildCalendarGrid();
    }
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendarGrid();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.buildCalendarGrid();
  }

  get monthLabel(): string {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private getPlanningsForDay(date: Date): any[] {
    return this.plannings.filter(p => {
      if (!p.dateDebut) return false;

      const start = new Date(p.dateDebut);
      start.setHours(0, 0, 0, 0);

      const end = p.dateFin ? new Date(p.dateFin) : start;
      end.setHours(0, 0, 0, 0);

      return date >= start && date <= end;
    });
  }

  buildCalendarGrid() {
    const firstOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Semaine commençant le lundi (getDay() : 0=dimanche..6=samedi)
    const startOffset = (firstOfMonth.getDay() + 6) % 7;

    const startDate = new Date(firstOfMonth);
    startDate.setDate(startDate.getDate() - startOffset);

    const totalCells = Math.ceil((startOffset + lastOfMonth.getDate()) / 7) * 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    for (let i = 0; i < totalCells; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: date.getTime() === today.getTime(),
        plannings: this.getPlanningsForDay(date)
      });
    }

    this.calendarWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.calendarWeeks.push(days.slice(i, i + 7));
    }
  }

  planningStatutClass(statut: string): string {
    return statut === 'TERMINE' ? 'cal-done' : statut === 'EN_COURS' ? 'cal-progress' : 'cal-pending';
  }

  openPlanning(p: any) {
    if (this.isResponsable) {
      this.router.navigate(['/planning/edit', p.id]);
    }
  }

}
