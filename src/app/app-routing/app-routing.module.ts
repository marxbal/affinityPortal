import {
  NgModule
} from '@angular/core';
// import {
//   CommonModule
// } from '@angular/common';
import {
  HomeComponent
} from '../modules/home/home.component';
import {
  LoginComponent
} from '../modules/user/login/login.component';
import {
  PasswordManagementComponent
} from '../modules/user/password-management/password-management.component';
import {
  UserManagementComponent
} from '../modules/user/user-management/user-management.component';
import {
  RegisterComponent
} from '../modules/register/register.component';
import {
  CustomerManagementComponent
} from '../modules/customer/customer-management/customer-management.component';
import {
  PolicyManagementComponent
} from '../modules/policy/policy-management/policy-management.component';
import {
  PolicyCoveragesManagementComponent
} from '../modules/product/policy-coverages-management/policy-coverages-management.component';
import {
  AddNewCustomerComponent
} from '../modules/customer/add-new-customer/add-new-customer.component';
import {
  ProductManagementComponent
} from '../modules/product/product-management/product-management.component';
import {
  LineSublineManagementComponent
} from '../modules/product/line-subline-management/line-subline-management.component';
import {
  PremiumAmountSetupComponent
} from '../modules/product/premium-amount-setup/premium-amount-setup.component';
import {
  PaymentManagementComponent
} from '../modules/payment/payment-management/payment-management.component';
import {
  ExchangeRateSetupComponent
} from '../modules/payment/exchange-rate-setup/exchange-rate-setup.component';
import {
  ReportManagementComponent
} from '../modules/report/report-management/report-management.component';
import {
  SoaManagementComponent
} from '../modules/payment/soa-management/soa-management.component';
import {
  InboxManagementComponent
} from '../modules/inbox/inbox-management/inbox-management.component';
import {
  ConfigurationComponent
} from '../modules/others/configuration/configuration.component';
import {
  LandingpageComponent
} from '../modules/affinity/landingpage/landingpage.component';
import {
  IssuanceComponent
} from '../modules/affinity/issuance/issuance.component';
import {
  RouterModule,
  Routes
} from '@angular/router';
import {
  AuthGuard
} from '../guard/auth.guard';
import {
  PendingChangesGuard
} from '../guard/pending-changes-guard';

const routes: Routes = [{
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'issuance',
    component: IssuanceComponent
  },
  {
    path: 'issuance/:type/:numPoliza',
    component: IssuanceComponent
  },
  {
    path: 'landingpage',
    component: LandingpageComponent
  },
  {
    path: 'fopm',
    component: LoginComponent
  },
  {
    path: 'digitalinno/',
    component: LoginComponent
  },
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'passwordmanagement/:id',
    component: PasswordManagementComponent
  },
  {
    path: 'passwordmanagement',
    component: PasswordManagementComponent
  },
  {
    path: 'usermanagement',
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'customermanagement',
    component: CustomerManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'policymanagement',
    component: PolicyManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'policycoveragesmanagement',
    component: PolicyCoveragesManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'addnewcustomer',
    component: AddNewCustomerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'productmanagement',
    component: ProductManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'linesublinemanagement',
    component: LineSublineManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'premiumamount',
    component: PremiumAmountSetupComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'managepayment',
    component: PaymentManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'exchangerate',
    component: ExchangeRateSetupComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'reportmanagement',
    component: ReportManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'soamanagement',
    component: SoaManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'inbox',
    component: InboxManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'config',
    component: ConfigurationComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
