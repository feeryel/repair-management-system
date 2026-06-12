import { Routes } from '@angular/router';

import { LoginComponent }        from './pages/auth/login/login.component';
import { MainLayoutComponent }   from './layouts/main-layout/main-layout.component';
import { authGuard }             from './core/guards/auth.guard';
import { roleGuard }             from './core/guards/role.guard';
import { Role }                  from './core/services/auth.service';

import { AdminDashboardComponent }      from './pages/dashboards/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent }     from './pages/dashboards/client-dashboard/client-dashboard.component';
import { ReceptionDashboardComponent }  from './pages/dashboards/reception-dashboard/reception-dashboard.component';
import { TechnicienDashboardComponent } from './pages/dashboards/technicien-dashboard/technicien-dashboard.component';
import { ReparationDashboardComponent } from './pages/dashboards/reparation-dashboard/reparation-dashboard.component';
import { StockDashboardComponent }      from './pages/dashboards/stock-dashboard/stock-dashboard.component';

import { AdminUsersComponent }     from './pages/admin/admin-users/admin-users.component';
import { ClientListComponent }     from './pages/clients/client-list/client-list.component';
import { ClientFormComponent }     from './pages/clients/client-form/client-form.component';
import { AppareilListComponent }   from './pages/appareils/appareil-list/appareil-list.component';
import { AppareilFormComponent }   from './pages/appareils/appareil-form/appareil-form.component';
import { DemandeListComponent }    from './pages/demandes/demande-list/demande-list.component';
import { DemandeFormComponent }    from './pages/demandes/demande-form/demande-form.component';
import { ReparationListComponent } from './pages/reparations/reparation-list/reparation-list.component';
import { ReparationFormComponent } from './pages/reparations/reparation-form/reparation-form.component';
import { PlanningListComponent }   from './pages/planning/planning-list/planning-list.component';
import { PlanningFormComponent }   from './pages/planning/planning-form/planning-form.component';
import { FactureListComponent }    from './pages/factures/facture-list/facture-list.component';
import { FactureAddComponent }     from './pages/factures/facture-add/facture-add.component';
import { PieceListComponent }      from './pages/pieces/piece-list/piece-list.component';
import { PieceFormComponent }      from './pages/pieces/piece-form/piece-form.component';
import { LigneListComponent }      from './pages/ligne-reparations/ligne-list/ligne-list.component';
import { LigneFormComponent }      from './pages/ligne-reparations/ligne-form/ligne-form.component';
import { GarantieComponent }       from './pages/garantie/garantie.component';
import { DashboardComponent }      from './pages/dashboard/dashboard.component';

// ── Alias courts ─────────────────────────────────────────────────────────────
const A   = Role.ADMIN;
const C   = Role.CLIENT;
const T   = Role.TECHNICIEN;
const REC = Role.RECEPTION;
const REP = Role.RESPONSABLE_REPARATION;
const STK = Role.ACHAT_STOCK;

export const routes: Routes = [

  // ── Page publique ─────────────────────────────────────────────────────────
  { path: '', component: LoginComponent },
  { path: 'public/garantie/:id', component: GarantieComponent },

  // ── Zone protégée ─────────────────────────────────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      // ── DASHBOARDS ──────────────────────────────────────────────────────
      { path: 'admin/dashboard',      component: AdminDashboardComponent,      canActivate: [roleGuard([A])] },
      { path: 'admin/users',          component: AdminUsersComponent,          canActivate: [roleGuard([A])] },
      { path: 'client/dashboard',     component: ClientDashboardComponent,     canActivate: [roleGuard([C])] },
      { path: 'reception/dashboard',  component: ReceptionDashboardComponent,  canActivate: [roleGuard([REC])] },
      { path: 'technicien/dashboard', component: TechnicienDashboardComponent, canActivate: [roleGuard([T])] },
      { path: 'reparation/dashboard', component: ReparationDashboardComponent, canActivate: [roleGuard([REP])] },
      { path: 'stock/dashboard',      component: StockDashboardComponent,      canActivate: [roleGuard([STK])] },

      // ── CLIENTS (RECEPTION uniquement) ───────────────────────────────────
      { path: 'clients',           component: ClientListComponent,  canActivate: [roleGuard([REC])] },
      { path: 'clients/add',       component: ClientFormComponent,  canActivate: [roleGuard([REC])] },
      { path: 'clients/edit/:id',  component: ClientFormComponent,  canActivate: [roleGuard([REC])] },

      // ── APPAREILS (RECEPTION) ────────────────────────────────────────────
      { path: 'appareils',          component: AppareilListComponent, canActivate: [roleGuard([REC])] },
      { path: 'appareils/add',      component: AppareilFormComponent, canActivate: [roleGuard([REC])] },
      { path: 'appareils/edit/:id', component: AppareilFormComponent, canActivate: [roleGuard([REC])] },

      // ── DEMANDES (RECEPTION) ─────────────────────────────────────────────
      { path: 'demandes',           component: DemandeListComponent, canActivate: [roleGuard([REC])] },
      { path: 'demandes/add',       component: DemandeFormComponent, canActivate: [roleGuard([REC])] },
      { path: 'demandes/edit/:id',  component: DemandeFormComponent, canActivate: [roleGuard([REC])] },

      // ── RÉPARATIONS (CLIENT + TECHNICIEN + RECEPTION + RESP. REPARATION) ──────────
      { path: 'reparations',        component: ReparationListComponent, canActivate: [roleGuard([C, T, REC, REP])] },
      { path: 'reparations/form',   component: ReparationFormComponent, canActivate: [roleGuard([REC, REP])] },

      // ── LIGNES RÉPARATION (TECHNICIEN écriture ; ACHAT_STOCK lecture) ─────
      { path: 'ligne-reparations',      component: LigneListComponent, canActivate: [roleGuard([T, STK])] },
      { path: 'ligne-reparations/add',  component: LigneFormComponent, canActivate: [roleGuard([T])] },

      // ── PLANNING (TECHNICIEN + RESP. REPARATION) ─────────────────────────
      { path: 'planning',           component: PlanningListComponent, canActivate: [roleGuard([T, REP])] },
      { path: 'planning/add',       component: PlanningFormComponent, canActivate: [roleGuard([REP])] },
      { path: 'planning/edit/:id',  component: PlanningFormComponent, canActivate: [roleGuard([REP])] },

      // ── FACTURES (CLIENT + RECEPTION) ─────────────────────────────────────────────
      { path: 'factures',           component: FactureListComponent, canActivate: [roleGuard([C, REC])] },
      { path: 'factures/add',       component: FactureAddComponent,  canActivate: [roleGuard([REC])] },

      // ── PIÈCES (ACHAT_STOCK lecture + écriture ; TECHNICIEN lecture seule) ─
      { path: 'pieces',             component: PieceListComponent, canActivate: [roleGuard([STK, T])] },
      { path: 'pieces/add',         component: PieceFormComponent, canActivate: [roleGuard([STK])] },
      { path: 'pieces/edit/:id',    component: PieceFormComponent, canActivate: [roleGuard([STK])] },

      // ── GARANTIE ─────────────────────────────────────────────────────────
      { path: 'garantie', component: GarantieComponent, canActivate: [roleGuard([REC, REP])] },

      // ── Legacy ───────────────────────────────────────────────────────────
      { path: 'dashboard', component: DashboardComponent }
    ]
  }

];
