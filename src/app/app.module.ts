import {
  BrowserModule
} from '@angular/platform-browser';
import {
  NgModule
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  HttpClientModule,
} from '@angular/common/http';
import {
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import {
  AppComponent
} from './app.component';
import {
  AppRoutingModule
} from './app-routing/app-routing.module';
import {
  LoginComponent
} from './modules/user/login/login.component';
import {
  InterceptorService
} from './interceptor/interceptor.service';
import {
  IsRequired
} from './guard/is-required';
import {
  FileUploadModule
} from 'ng2-file-upload/ng2-file-upload';
import {
  NgxSpinnerModule
} from 'ngx-spinner';
import {
  Ng2CompleterModule
} from 'ng2-completer';
import {
  LandingpageComponent
} from './modules/affinity/landingpage/landingpage.component';
import {
  IssuanceComponent
} from './modules/affinity/issuance/issuance.component';
import {
  PropertyComponent
} from './modules/affinity/property/property.component';
import {
  PersonalComponent
} from './modules/affinity/personal/personal.component';
import {
  QuotationComponent
} from './modules/affinity/quotation/quotation.component';
import {
  FooterComponent
} from './modules/affinity/footer/footer.component';
import {
  PolicyComponent
} from './modules/affinity/policy/policy.component';
import {
  RiskComponent
} from './modules/affinity/risk/risk.component';
import {
  MotorComponent
} from './modules/affinity/motor/motor.component';
import {
  MotorPolicyComponent
} from './modules/affinity/motor-policy/motor-policy.component';
import {
  PaymentComponent
} from './modules/affinity/payment/payment.component';
import {
  NgxDropzoneModule
} from 'ngx-dropzone';
import {
  AccidentComponent
} from './modules/affinity/accident/accident.component';
import {
  RiskMotorComponent
} from './modules/affinity/risk-motor/risk-motor.component';
import {
  RiskHouseholdComponent
} from './modules/affinity/risk-household/risk-household.component';
import {
  RiskAccidentComponent
} from './modules/affinity/risk-accident/risk-accident.component';
import {
  AddressComponent
} from './modules/affinity/address/address.component';
import {
  TechnicalControlComponent
} from './modules/affinity/technical-control/technical-control.component';
import {
  AlternativeHolderComponent
} from './modules/affinity/risk-motor/alternative-holder/alternative-holder.component';
import {
  InsuredDetailsComponent
} from './modules/affinity/personal/insured-details/insured-details.component';
import {
  DashboardComponent
} from './modules/admin/dashboard/dashboard.component';
import {
  HeaderComponent
} from './modules/affinity/header/header.component';
import {
  SidebarComponent
} from './modules/admin/sidebar/sidebar.component';
import {
  AdminHeaderComponent
} from './modules/admin/admin-header/admin-header.component';
import {
  AdminFooterComponent
} from './modules/admin/admin-footer/admin-footer.component';
import {
  ProductListComponent
} from './modules/admin/product-list/product-list.component';
import {
  PartnerListComponent
} from './modules/admin/partner-list/partner-list.component';
import {
  ProductComponent
} from './modules/admin/product/product.component';
import {
  PartnerComponent
} from './modules/admin/partner/partner.component';
import {
  DecimalPipe
} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingpageComponent,
    IssuanceComponent,
    PropertyComponent,
    PersonalComponent,
    QuotationComponent,
    FooterComponent,
    PolicyComponent,
    RiskComponent,
    MotorComponent,
    MotorPolicyComponent,
    PaymentComponent,
    AccidentComponent,
    RiskMotorComponent,
    RiskHouseholdComponent,
    RiskAccidentComponent,
    AddressComponent,
    TechnicalControlComponent,
    AlternativeHolderComponent,
    InsuredDetailsComponent,
    DashboardComponent,
    HeaderComponent,
    SidebarComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
    ProductListComponent,
    PartnerListComponent,
    ProductComponent,
    PartnerComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FileUploadModule,
    NgxSpinnerModule,
    Ng2CompleterModule,
    NgxDropzoneModule
  ],
  providers: [{
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    IsRequired,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
