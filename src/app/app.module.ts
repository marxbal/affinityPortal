import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FileSelectDirective } from 'ng2-file-upload';

import { AppComponent } from './app.component';
import { HomeComponent } from './modules/home/home.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LoginComponent } from './modules/user/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { InterceptorService } from './interceptor/interceptor.service';
import { TokenInterceptor } from './interceptor/token-interceptor';
import { UserManagementComponent } from './modules/user/user-management/user-management.component';
import { CustomerManagementComponent } from './modules/customer/customer-management/customer-management.component';
import { PolicyManagementComponent } from './modules/policy/policy-management/policy-management.component';
import { PolicyCoveragesManagementComponent } from './modules/product/policy-coverages-management/policy-coverages-management.component';
import { AddNewCustomerComponent } from './modules/customer/add-new-customer/add-new-customer.component';
import { ProductManagementComponent } from './modules/product/product-management/product-management.component';
import { LineSublineManagementComponent } from './modules/product/line-subline-management/line-subline-management.component';
import { PendingChangesGuard } from './guard/pending-changes-guard';
import { IsRequired } from './guard/is-required';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PremiumAmountSetupComponent } from './modules/product/premium-amount-setup/premium-amount-setup.component';
import { PaymentManagementComponent } from './modules/payment/payment-management/payment-management.component';
import { ExchangeRateSetupComponent } from './modules/payment/exchange-rate-setup/exchange-rate-setup.component';
import { ReportManagementComponent } from './modules/report/report-management/report-management.component';
import { SoaManagementComponent } from './modules/payment/soa-management/soa-management.component';
import { InboxManagementComponent } from './modules/inbox/inbox-management/inbox-management.component';
import { ConfigurationComponent } from './modules/others/configuration/configuration.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { PasswordManagementComponent } from './modules/user/password-management/password-management.component';
import { LandingpageComponent } from './modules/marsh/landingpage/landingpage.component';
import { IssuanceComponent } from './modules/marsh/issuance/issuance.component';
import { PropertyComponent } from './modules/marsh/property/property.component';
import { PersonalComponent } from './modules/marsh/personal/personal.component';
import { QuotationComponent } from './modules/marsh/quotation/quotation.component';
import { FooterComponent } from './modules/marsh/footer/footer.component';
import { PolicyComponent } from './modules/marsh/policy/policy.component';
import { RiskComponent } from './modules/marsh/risk/risk.component';
import { MotorComponent } from './modules/marsh/motor/motor.component';
import { MotorPolicyComponent } from './modules/marsh/motor-policy/motor-policy.component';
import { PaymentComponent } from './modules/marsh/payment/payment.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { AccidentComponent } from './modules/marsh/accident/accident.component';
import { RiskMotorComponent } from './modules/marsh/risk-motor/risk-motor.component';
import { RiskHouseholdComponent } from './modules/marsh/risk-household/risk-household.component';
import { RiskAccidentComponent } from './modules/marsh/risk-accident/risk-accident.component';
import { AddressComponent } from './modules/marsh/address/address.component';
import { TechnicalControlComponent } from './modules/marsh/technical-control/technical-control.component';
import { AlternativeHolderComponent } from './modules/marsh/risk-motor/alternative-holder/alternative-holder.component';
import { InsuredDetailsComponent } from './modules/marsh/personal/insured-details/insured-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    UserManagementComponent,
    CustomerManagementComponent,
    PolicyManagementComponent,
    PolicyCoveragesManagementComponent,
    AddNewCustomerComponent,
    ProductManagementComponent,
    LineSublineManagementComponent,
    PremiumAmountSetupComponent,
    PaymentManagementComponent,
    ExchangeRateSetupComponent,
    ReportManagementComponent,
    SoaManagementComponent,
    InboxManagementComponent,
    ConfigurationComponent,
    PasswordManagementComponent,
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
    InsuredDetailsComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FileUploadModule,
    NgxSpinnerModule,
    Ng2CompleterModule,
    NgxDropzoneModule 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    PendingChangesGuard,
    IsRequired
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
