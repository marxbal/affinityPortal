import {
  NgModule
} from '@angular/core';
import {
  LoginComponent
} from '../modules/user/login/login.component';
import {
  IssuanceComponent
} from '../modules/affinity/issuance/issuance.component';
import {
  RouterModule,
  Routes
} from '@angular/router';
import {
  AuthGuardClient
} from '../guard/auth.guard.client';
import {
  AuthGuardAdmin
} from '../guard/auth.guard.admin';
import {
  DashboardComponent
} from '../modules/admin/dashboard/dashboard.component';
import {
  PartnerListComponent
} from '../modules/admin/partner-list/partner-list.component';
import {
  PartnerComponent
} from '../modules/admin/partner/partner.component';
import {
  ProductListComponent
} from '../modules/admin/product-list/product-list.component';

const routes: Routes = [{
    path: '',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [AuthGuardAdmin],
  },
  {
    path: 'partner-list',
    component: PartnerListComponent,
    // canActivate: [AuthGuardAdmin],
  },
  {
    path: 'partner',
    component: PartnerComponent,
    // canActivate: [AuthGuardAdmin],
  },

  {
    path: 'product-list',
    component: ProductListComponent,
    canActivate: [AuthGuardAdmin],
  },

  {
    path: 'issuance',
    component: IssuanceComponent,
    canActivate: [AuthGuardClient],
  },
  {
    path: 'issuance/:type/:numPoliza',
    component: IssuanceComponent,
    canActivate: [AuthGuardClient],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
