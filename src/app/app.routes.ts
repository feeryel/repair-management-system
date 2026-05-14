import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { authGuard } from './core/guards/auth.guard';
import { AppareilListComponent } from './pages/appareils/appareil-list/appareil-list.component';

import { AppareilFormComponent } from './pages/appareils/appareil-form/appareil-form.component';
import { ClientListComponent } from './pages/clients/client-list/client-list.component';
import { ClientFormComponent } from './pages/clients/client-form/client-form.component';
import { DemandeListComponent } from './pages/demandes/demande-list/demande-list.component';

import { DemandeFormComponent } from './pages/demandes/demande-form/demande-form.component';
import { ReparationListComponent } from './pages/reparations/reparation-list/reparation-list.component';
import { ReparationFormComponent } from './pages/reparations/reparation-form/reparation-form.component';
import { PlanningListComponent } from './pages/planning/planning-list/planning-list.component';
import { PlanningFormComponent } from './pages/planning/planning-form/planning-form.component';
import { FactureListComponent } from './pages/factures/facture-list/facture-list.component';
import { FactureAddComponent } from './pages/factures/facture-add/facture-add.component';
import { PieceListComponent } from './pages/pieces/piece-list/piece-list.component';
import { PieceFormComponent } from './pages/pieces/piece-form/piece-form.component';
import { LigneListComponent } from './pages/ligne-reparations/ligne-list/ligne-list.component';
import { LigneFormComponent } from './pages/ligne-reparations/ligne-form/ligne-form.component';
export const routes: Routes = [

  {
    path: '',
    component: LoginComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'clients',
        component: ClientListComponent
      },{
  path: 'clients/add',
  component: ClientFormComponent
},
{
  path:'clients/edit/:id',
  component: ClientFormComponent
},
{
  path: 'appareils',
  component: AppareilListComponent
},

{
  path: 'appareils/add',
  component: AppareilFormComponent
},
{
  path:'appareils/edit/:id',
  component: AppareilFormComponent
},
{
  path: 'demandes',
  component: DemandeListComponent
},

{
  path: 'demandes/add',
  component: DemandeFormComponent
},
{
  path:'demandes/edit/:id',
  component: DemandeFormComponent
},
{
  path:'reparations',
  component: ReparationListComponent
},
{
  path:'reparations/form',
  component: ReparationFormComponent
},{
  path:'factures',
  component: FactureListComponent
},
{
  path:'factures/add',
  component: FactureAddComponent
},
{
  path:'planning',
  component: PlanningListComponent
},
{
  path:'planning/add',
  component: PlanningFormComponent
},{
  path:'planning/edit/:id',
  component: PlanningFormComponent
},{
  path:'pieces',
  component: PieceListComponent
},

{
  path:'pieces/add',
  component: PieceFormComponent
},

{
  path:'pieces/edit/:id',
  component: PieceFormComponent
},{
  path:'ligne-reparations',
  component:LigneListComponent
},

{
  path:'ligne-reparations/add',
  component:LigneFormComponent
}
    ]
  }

];
