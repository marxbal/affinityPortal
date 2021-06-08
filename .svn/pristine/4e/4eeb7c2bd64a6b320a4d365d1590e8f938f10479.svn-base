import { Component, OnInit, OnDestroy, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {AuthService} from '../../../services/auth.service';
import {Customer} from '../../../objects/customer';
import {AddressDetails} from '../../../objects/address-details';
import {AddressType} from '../../../objects/address-type';
import {CustomerType} from '../../../objects/customer-type';
import {ProvinceDetails} from '../../../objects/province-detail';
import {MunicipalityDetails} from '../../../objects/municipality-details';
import {BarangayDetails} from '../../../objects/barangay-detail';
import {CustomerContactDetail} from '../../../objects/customer-contact-detail';
import {CustomerContactType} from '../../../objects/customer-contact-type';
import {AllCustomerDetails} from '../../../objects/all-customer-details';
import {AdditionalAttributeType} from '../../../objects/additional-attribute-type';
import {AdditionalAttribute} from '../../../objects/additional-attribute';
import {PolicyDetails} from '../../../objects/policy-details';
import {PolicyType} from '../../../objects/policy-type';
import {Product} from '../../../objects/product';
import {Line} from '../../../objects/line';
import { SubLine } from '../../../objects/subLine';
import {PolicyCoverages} from '../../../objects/policy-coverages';
import {PaymentTermType} from '../../../objects/payment-term-type';
import {CountryDetail} from '../../../objects/country-detail';
import {CustomerPaymentTermMap} from '../../../objects/customer-payment-term';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import {CancellationReason} from '../../../objects/cancellation-reason';
import {InboxDetails} from '../../../objects/inbox-details';
import {InboxRemarks} from '../../../objects/inbox-remarks';
import {InboxHeader} from '../../../objects/inbox-header';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.css']
})


export class CustomerManagementComponent implements OnInit, ComponentCanDeactivate, OnDestroy {

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private caller : AuthService,
    private spinner: NgxSpinnerService
    ) { }
  private subscription: Subscription = new Subscription();

  //final for submission
  @Input() newCustomerHolder : Customer;
  allAddressDetailList: AddressDetails[];
  customerContactList: CustomerContactDetail[];
  additionalAttributeFinal: AdditionalAttribute[];

  //individuals
  singleAddressDetail: AddressDetails;
  customerContact: CustomerContactDetail;
  customerDetailHolder : Customer;
  allCustomerDetailsSingle : AllCustomerDetails;
  formattedDate: String;
  addCustomerNotice: String;
  customerManagementType: String;
  additionalAttribute: AdditionalAttribute;
  templateRouter: String;
  previousPage: String;
  policyDetails : PolicyDetails;
  customerPaymentTerm : CustomerPaymentTermMap;
  addEditCustmerShow: String;
  addAddress: String;
  addContact: String;
  pageSize: string;
  currentPage: number;
  pageLength: String[];

  inboxRemarks : InboxRemarks;
  inboxHeader : InboxHeader;
  inboxDetails : InboxDetails[];

  //list
  customerTypeList : CustomerType[];
  addressTypeList : AddressType[];
  provinceList : ProvinceDetails[];
  municipalityList : MunicipalityDetails[];
  barangayList : BarangayDetails[];
  customerList : AllCustomerDetails[];
  agentList : Customer[];
  beneficiaryList : Customer[];
  finalBeneficiaryList : Customer[];
  customerContactTypeList : CustomerContactType[];
  customerContactReturnDetails : CustomerContactDetail[];
  attributeTypeList : AdditionalAttributeType[];
  policyTypeList : PolicyType[];
  lineList: Line[];
  sublineList: SubLine[];
  productList: Product[];
  productCoveragesList: PolicyCoverages[];
  paymentTermType: PaymentTermType[];
  masterPolicyList: PolicyDetails[];
  countryList : CountryDetail[];


  //Variables for showing fields in component
  newCustomerTypeHolder: string;
  showJuridicalFields: string;
  issuePolicyShowFields: string;
  beneficiarySearch: string;
  clientSearch: string;
  customerBirthday: number;
  tempMasterPolicyHolder: string;
  minAge: string;
  maxAge: string;
  showPassport: string;

  userData: string[];

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  ngOnInit() {
    this.customerBirthday = 0;
    this.userData = [];
    this.newCustomerHolder = new Customer();
    this.customerDetailHolder = new Customer();
    this.customerDetailHolder.fullName = "";
    this.singleAddressDetail = new AddressDetails();
    this.customerContact = new CustomerContactDetail();
    this.allCustomerDetailsSingle = null;
    this.formattedDate = "";
    this.beneficiarySearch = "";
    this.clientSearch = "";
    this.tempMasterPolicyHolder = "";
    this.additionalAttribute = new AdditionalAttribute();
    this.templateRouter = "initialize";
    this.previousPage = "";
    this.pageSize = "10";
    this.pageLength = [];
    this.policyDetails = new PolicyDetails();
    this.customerPaymentTerm = new CustomerPaymentTermMap();
    this.inboxRemarks = new InboxRemarks();
    this.inboxHeader = new InboxHeader();
    this.inboxDetails = [];
    this.customerDetailHolder.customerTypeId = "1";
    this.allAddressDetailList = [];
    this.customerList = [];
    this.municipalityList = [];
    this.barangayList = [];
    this.customerContactTypeList = [];
    this.customerContactList = [];
    this.customerContactReturnDetails = [];
    this.attributeTypeList = [];
    this.additionalAttributeFinal = [];
    this.policyTypeList = [];
    this.lineList = [];
    this.sublineList = [];
    this.productList = [];
    this.productCoveragesList = [];
    this.paymentTermType = [];
    this.agentList = [];
    this.masterPolicyList = [];
    this.beneficiaryList = [];
    this.finalBeneficiaryList = [];
    this.countryList = [];
    this.issuePolicyShowFields = "hide";
    this.addEditCustmerShow = "hidden";
    this.addAddress = "hidden";
    this.addContact = "hidden";
    this.showPassport = "hidden";

    this.spinner.show();

    this.subscription.add(this.caller.doCallService("/client/select-all-customer-type-by-user-role", this.auth.getUserType()).subscribe(
        result => {
          this.customerTypeList = result;
        }
      ));

    this.subscription.add(this.caller.doCallService("/client/select-all-address-type", "").subscribe(
        result => {
          this.addressTypeList = result;
        }
      ));

    this.subscription.add(this.caller.doCallService("/client/select-all-additional-attribute-type", "").subscribe(
        result => {
          this.attributeTypeList = result;
        }
      ));

    this.subscription.add(this.caller.doCallService("/client/select-all-customer-contact-type", "").subscribe(
        result => {
          this.customerContactTypeList = result;
        }
      ));

    this.subscription.add(this.caller.doCallService("/client/select-all-payment-term-type", "").subscribe(
        result => {
          this.paymentTermType = result;
        }
      ));

    this.subscription.add(this.caller.doCallService("/client/select-all-province", "").subscribe(
        result => {
          this.provinceList = result;
          this.spinner.hide();
        }
      ));

    /*GET AGE RESTRICTION*/
    let ageInput =  {action: "select-configuration", values: {"config_name": 'AGEMINIMUM'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", ageInput).subscribe(
      result => {
        this.minAge = result.msg[0].configValue;
    }));
    ageInput =  {action: "select-configuration", values: {"config_name": 'AGEMAXIMUM'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", ageInput).subscribe(
      result => {
        this.maxAge = result.msg[0].configValue;
    }));
    /*GET AGE RESTRICTION*/

  }

  ngOnDestroy(){
    this.subDestroy();
  }

  subDestroy(){
    this.subscription.unsubscribe();
  }

  issueCustomerPolicy(customerAllDetails : AllCustomerDetails){

  this.spinner.show();
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);

    this.previousPage = this.templateRouter;
    this.templateRouter = "viewCustomer";
    this.allCustomerDetailsSingle = customerAllDetails;
    this.formattedDate = this.allCustomerDetailsSingle.customerDetails.dateAdded;

    let param =  {action: "select-all-country-list", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.countryList = result.msg;
          this.spinner.hide();
        }
      ));

  this.spinner.hide();

  }

  showAddBeneficiary(){
    $("#add-beneficiary").removeClass("hidden");
    $("#add-beneficiary-btn").addClass("hidden");
  }

  backPage(previousPage : String){
    this.templateRouter = this.previousPage;
    this.previousPage = previousPage;
    this.addEditCustmerShow = "hidden";
  }

  issuePolicy(){
    this.spinner.show();
    this.previousPage = this.templateRouter;
    this.templateRouter = 'issuePolicy';
    this.productCoveragesList = [];
    this.policyDetails = new PolicyDetails();
    this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
    this.tempMasterPolicyHolder = "";

    let param =  {action: "select-policy-type-by-natural-flag", values: {naturalFlag: this.allCustomerDetailsSingle.customerDetails.naturalFlag}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.policyTypeList = result.msg;
        }
      ));

    let param2 =  {action: "select", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=line", param2).subscribe(
        result => {
          this.lineList = result.msg;
        }
      ));

    let param3 = '3';

    if(this.auth.getUserType() == "ICA"){
      param3 += ",ICA-" + this.auth.getUserDetails().userId;
    }else{
      param3 += ",O-";
    }

    this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", param3,"0","1000").subscribe(
      result => {
        this.agentList = result;
        this.spinner.hide();
      }
    ));

    if(this.allCustomerDetailsSingle.customerDetails.customerTypeId == "1"){
      this.policyDetails.ageUW = "0";
      this.customerBirthday = m().diff(this.allCustomerDetailsSingle.customerDetails.birthDay, 'years');
      if(this.customerBirthday < parseInt(this.minAge)){
        Swal.fire(
          'Age Restriction',
          'Policy holder must be at least '+ this.minAge +' years old.',
          'error'
        );
        this.backPage('initialize');
       this.policyDetails.customerId = "";
       $("#passport-error").addClass('hidden');
      }else if(this.customerBirthday >= parseInt(this.maxAge)){
        Swal.fire({
          title: 'Age Restriction',
          text: "Policy holder must not be more than "+this.maxAge+" years old.  Would you like to refer to Underwriting for approval?",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Proceed'
        }).then((result) => {
          if (result.value) {
            this.policyDetails.ageUW = "1";
             $("#passport-error").removeClass('hidden');
             this.checkPassport();
          }else{
             this.backPage('initialize');
             this.policyDetails.customerId = "";
             $("#passport-error").addClass('hidden');
          }
        });
      }else{
        this.checkPassport();
      }

      

    }else if(this.allCustomerDetailsSingle.customerDetails.customerTypeId == "2"){
      this.policyDetails.policyTypeId = "1";
      this.showHideIssuePolicyFields();
    }


  }

  checkUniquePolicyNumber(){
    
    if(!this.policyDetails.policyNumber){
      
      Swal.fire(
        'Master Policy Number',
        'Master Policy Number is a required field.',
        'error'
      );
      this.policyDetails.policyNumber = "";

    }else{

      let param =  {action: "select-check-policy-number", values: {"policyNumber": this.policyDetails.policyNumber}};
      this.spinner.show();
      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.spinner.hide();
           if(result.msg[0]['total'] != "0"){

              Swal.fire(
                'Master Policy Number',
                'Master Policy Number already exists.',
                'error'
              );

              this.policyDetails.policyNumber = "";

           }

        }
      ));

    }
  }

  checkPassportComplexity(pwd) {
    let letter = /^[A-Z0-9]+$/i; 
    let valid = false;
    valid = letter.test(pwd);
    return valid;
  }

  checkUniquePassport(){
    

    if(!this.newCustomerHolder.passportId){
      
      Swal.fire(
        'Passport',
        'Passport is a required field.',
        'error'
      );
      this.newCustomerHolder.passportId = "";

    }else if(!this.checkPassportComplexity(this.newCustomerHolder.passportId)){

      Swal.fire(
        'Passport',
        'Passport is should be Alphanumeric.',
        'error'
      );
      this.newCustomerHolder.passportId = "";

    }else if(this.newCustomerHolder.passportId.length == 9){

      let param =  {action: "select-same-passport", values: {"passportId": this.newCustomerHolder.passportId}};
      this.spinner.show();
      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.spinner.hide();
           if(result.msg[0]['total'] != "0"){

              Swal.fire(
                'Passport',
                'Passport Number already exists.',
                'error'
              );

              this.newCustomerHolder.passportId = "";

           }

        }
      ));

    }

  }

  checkPassport(){
    this.policyDetails.policyTypeId = "2";

      let param4 =  {action: "select-existing-policy", values: {"customerId": this.allCustomerDetailsSingle.customerDetails.customerId}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param4).subscribe(
        result => {

          this.showHideIssuePolicyFields();

           if(result.msg[0]['total'] > 0){
             this.policyDetails.passportUW = "0";

             Swal.fire({
              title: 'Active Policy',
              text: "This customer has an active policy. Do you wish to continue and request underwriting approval?",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Proceed',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.value) {
                this.policyDetails.passportUW = "1";
                 $("#passport-error").removeClass('hidden');
              }else{
                this.backPage('initialize');
                 this.policyDetails.customerId = "";
                 $("#passport-error").addClass('hidden');
              }
            });


           }
        }
      ));
  }

  checkForUnderwriting(type: string){
    
    
    switch (type) {
      case "3":
          let param =  {action: "select-check-aod", values: {country_id: this.policyDetails.areaOfDeploymentId}};

            this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
            result => {
              this.policyDetails.aodUW = "0";
              if(result.msg[0].total == "0"){
                $("#aod-error").addClass("hidden");
              }else{
                $("#aod-error").removeClass("hidden");
                this.policyDetails.aodUW = "1";
              }

              this.changePremiumParameters();

            }

          ));
        break;
      
      case "4":
          this.policyDetails.retroUW = "0";
          if(this.allCustomerDetailsSingle.customerDetails.customerTypeId == "1"){

            let isRetro = m().isAfter(this.policyDetails.effectivityDate, 'day');
            
            if(!isRetro){
              $("#retro-error").addClass("hidden");
            }else{
              $("#retro-error").removeClass("hidden");
              this.policyDetails.retroUW = "1";
            }

          }

          

      break;

      default:
        // code...
        break;
    }

  }

  submitUnderwriting(policyId: string){
    if(this.policyDetails.ageUW == "1" || this.policyDetails.aodUW == "1" || this.policyDetails.retroUW == "1" || this.policyDetails.passportUW == "1"){
      this.inboxDetails = [];
      if(this.policyDetails.aodUW == "1"){
        let temp = new InboxDetails();
        temp.detailTypeId = '3';
        temp.detailValue = this.policyDetails.areaOfDeploymentId;
        this.inboxDetails.push(temp);
      }

      if(this.policyDetails.ageUW == "1"){
        let temp = new InboxDetails();
        temp.detailTypeId = '6';
        temp.detailValue = this.customerBirthday.toString();
        this.inboxDetails.push(temp);
      }

      if(this.policyDetails.retroUW == "1"){
        let temp = new InboxDetails();
        temp.detailTypeId = '4';
        temp.detailValue = this.policyDetails.effectivityDate;
        this.inboxDetails.push(temp);
      }

      if(this.policyDetails.passportUW == "1"){
        let temp = new InboxDetails();
        temp.detailTypeId = '5';
        temp.detailValue = this.allCustomerDetailsSingle.customerDetails.passportId;
        this.inboxDetails.push(temp);
      }

      let temp = new InboxDetails();
        temp.detailTypeId = '2';
        temp.detailValue = policyId;
        this.inboxDetails.push(temp);

      this.spinner.show();

      this.inboxRemarks.description = "For underwriting approval.";
      this.inboxRemarks.fromUserId = this.auth.getUserDetails().userId;
      this.inboxRemarks.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

      this.inboxHeader.requestTypeId = "2";
      this.inboxHeader.requestStatusId = "1";
      this.inboxHeader.requestorUserId = this.auth.getUserDetails().userId;
      this.inboxHeader.requestorRoleId = this.auth.getUserRole();
      this.inboxHeader.approverUserId = "0";
      this.inboxHeader.approverRoleId = "2";
      this.inboxHeader.distributionTypeId = "1";
      this.inboxHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
      this.inboxHeader.dateModified = m().format('YYYY/MM/DD HH:mm:ss');

      let paramUpdate =  {action: "update-policy-status", values: {status_id: '7', policy_id: policyId}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramUpdate).subscribe(
          result => {

          }
        ));

      let param =  {action: "insert-inbox-request", values: {inboxHeader: this.inboxHeader, inboxDetails: this.inboxDetails, inboxRemarks: this.inboxRemarks}};

        this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
        result => {

          if(result.status == "1"){

              Swal.fire(
                'Success!',
                'Successful request for underwriting approval of POC Issuance.',
                'success'
              );

              this.previousPage = "";
              this.templateRouter = "initialize";
              this.initialChooseCustomerType();

              this.inboxDetails = [];

              this.spinner.hide();

            }else{
              alert("Something went wrong. Please try again.");
            }

        }

      ));

    }

  }

  changePremiumParameters(){

    this.policyDetails.termInMonth = "";
    this.policyDetails.premiumAmount = "";
    this.policyDetails.premiumAmountId = "";

  }

  selectMasterPolicy(){

    if(this.tempMasterPolicyHolder){
      if(this.tempMasterPolicyHolder != ""){

        let holdFinal : PolicyDetails = new PolicyDetails();
        let prev = this.tempMasterPolicyHolder;
        let hold = prev.split("-");
        let masterId = prev.split("-")[hold.length - 1];
        let proceed = 0;

        for(let i = 0; i < this.masterPolicyList.length; i++){
          if(this.masterPolicyList[i].policyId == masterId){
            holdFinal = this.masterPolicyList[i];
            proceed = 1;
            break;
          }
        }
        this.policyDetails.policyHeaderId = "";
        if(proceed == 1){
          this.policyDetails.policyHeaderId = holdFinal.policyId +"-"+ holdFinal.productId +"-"+ holdFinal.agentCode +"-"+ holdFinal.customerId;
        }else{
          $(".master-policy-auto").val("");
        }



      }
    }

    this.changePremiumParameters();
    

  }

  showHideIssuePolicyFields(){

    this.issuePolicyShowFields = "show";
    if(this.policyDetails.policyTypeId == "2"){
      this.spinner.show();

      let param =  {action: "select-all-master-policies", values: {customer_id : ''}};

      if(this.auth.getUserRole() == "7"){

        param = {action: "select-all-master-policies", values: {customer_id: this.auth.getUserDetails().customerId}};

      }

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
          result => {
            this.masterPolicyList = result.msg;
            this.userData = [];

            for(let i = 0; i < this.masterPolicyList.length; i++){
              this.userData.push(this.masterPolicyList[i].fullName + " ("+ this.masterPolicyList[i].policyNumber +")-" + this.masterPolicyList[i].policyId);
            }

            this.spinner.hide();
          }
        ));
    }

    setTimeout(function(){
      $(".completer-input").addClass("form-control");
      $(".completer-input").addClass("master-policy-auto");
    },10);

    this.chooseSubline();

  }

  searchBeneficiary(){


    this.spinner.show();

      let param1 = '4';

      if(this.auth.getUserType() == "ICA"){
        param1 += ",ICA-" + this.auth.getUserDetails().userId + "-" + this.beneficiarySearch;
      }else{
        param1 += ",O-" + this.beneficiarySearch;
      }

      this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", param1,"0","1000").subscribe(
        result => {
          this.beneficiaryList = result;
          this.spinner.hide();
        }
      ));

  }

  addBeneficiary(customer){

    const index: number = this.beneficiaryList.indexOf(customer);

    if (index !== -1) {
      this.beneficiaryList.splice(index, 1);
    }

    this.finalBeneficiaryList.push(customer);


    $("#add-beneficiary").addClass("hidden");
    $("#add-beneficiary-btn").removeClass("hidden");

  }

  removeBeneficiary(customer){

    const index: number = this.finalBeneficiaryList.indexOf(customer);

    if (index !== -1) {
      this.finalBeneficiaryList.splice(index, 1);
    }

    this.beneficiaryList.push(customer);


  }

  chooseProduct(){

    if(this.policyDetails.policyTypeId == "1"){

      let param =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.policyDetails.productId}};

      this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
          result => {
            this.productCoveragesList = result.msg;
            this.spinner.hide();
          }
        ));

    }else{ 

      let proceed = "1";

      if(!this.policyDetails.policyHeaderId){

        Swal.fire(
          'Compute Premium',
          'Master Policy is required field to compute Premium.',
          'error'
        );

      }else if(!this.policyDetails.termInMonth){

        Swal.fire(
          'Compute Premium',
          'Term is required field to compute Premium.',
          'error'
        );

      }else if(!this.policyDetails.pocBased){

        Swal.fire(
          'Compute Premium',
          'Poduct Variant is required field to compute Premium.',
          'error'
        );

      }else{
        this.policyDetails.productId = this.policyDetails.policyHeaderId.split("-")[1];

        this.spinner.show();

          let param2 =  {action: "select-premium-by-product-and-term", values: {variant: this.policyDetails.pocBased, manning_agency_id: this.policyDetails.policyHeaderId.split("-")[3], agent_id: this.policyDetails.policyHeaderId.split("-")[2],product_detail_id: this.policyDetails.productId, term_in_month: this.policyDetails.termInMonth}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
              result => {
                if(result.msg == "0"){
                  Swal.fire({
                    type: 'error',
                    title: 'Premium Amount',
                    text: 'No Premium setup retrieved.'
                  });
                  this.policyDetails.termInMonth = "";
                  this.policyDetails.premiumAmount = "";
                  this.policyDetails.premiumAmountId = "";
                  this.spinner.hide();
                }else{
                  this.policyDetails.premiumAmount = result.msg[0].premiumAmount;
                  this.policyDetails.premiumAmountId = result.msg[0].premiumAmountId;

                        let param =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.policyDetails.productId}};

                        this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
                            result => {
                              this.productCoveragesList = result.msg;
                              this.spinner.hide();
                            }
                          );
                  
                }
              }
            ));

      }

    }

  }

  chooseLine(){
  this.spinner.show();


    let param =  {"action": "select", "values": {"line_detail_id" : this.policyDetails.lineId}};

    this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {
          this.sublineList = result.msg;
          this.spinner.hide();

        }
      ));

  }

  chooseSubline(){
    this.spinner.show();

    let param =  {"action": "select-product-by-subline", "values": {"sublineDetailId" : '4'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {

          this.productList = result.msg;
          this.spinner.hide();

        }
      ));

  }

  initialChooseCustomerType(){

    this.spinner.show();

    let param = this.customerDetailHolder.customerTypeId;
    this.showPassport = "";
    if(param == "1"){
      this.showPassport = "show";
    }

    if(this.auth.getUserType() == "ICA"){
      param += ":=:ICA-" + this.auth.getUserDetails().userId + "-" + this.clientSearch;
    }else{
      param += ":=:O-" + this.clientSearch;
    }

    let paramSub = {"targetEntity" : "client",
                    "methodToBeCalled" : "",
                    "delimitedParams" : param,
                    "pageSize" : this.pageSize};


    this.subscription.add(this.caller.doCallService("/client/get-total-page-count", paramSub).subscribe(
      result => {
        this.pageLength = [];
        if(result == "0"){
          this.pageLength.push("1");
        }else{

          for(let i = 0; i < parseInt(result); i++){
            this.pageLength.push((i + 1).toString());
          }

        }
        
        this.chooseCustomerType('0');
        this.spinner.hide();
      }
    ));

  }

  chooseCustomerType(pageNumber: string){

    this.spinner.show();
    this.currentPage = parseInt(pageNumber) + 1;

    let param = this.customerDetailHolder.customerTypeId;

    if(this.auth.getUserType() == "ICA"){
      param += ",ICA-" + this.auth.getUserDetails().userId + "-" + this.clientSearch;
    }else{
      param += ",O-" + this.clientSearch;
    }

    this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", param,pageNumber,this.pageSize).subscribe(
      result => {
        this.customerList = result;

        for(let i = 0; i < this.customerList.length; i++){
          this.customerList[i].customerDetails.dateAdded = m(this.customerList[i].customerDetails.dateAdded).format(this.auth.getDateFormat());
        }

        this.spinner.hide();
      }
    ));

    
  }

  chooseAttribType(){
    $("#attribute-detail-holder").removeAttr("type");
    $("#attribute-detail-holder").attr("type",this.additionalAttribute.attributeTypeId.split("-")[1]);
    $("#attribute-detail-holder").removeAttr("disabled");
    $("#attribute-detail-holder").val("");
  }

  addNewAttribute(){
    this.spinner.show();

    if(this.additionalAttribute.attributeTypeId && this.additionalAttribute.attributeValue){

      this.additionalAttribute.attributeType = this.additionalAttribute.attributeTypeId.split("-")[2];
      this.additionalAttribute.attributeTypeId = this.additionalAttribute.attributeTypeId.split("-")[0];
      this.additionalAttributeFinal.push(this.additionalAttribute);
      this.additionalAttribute = new AdditionalAttribute();
      $("#attribute-detail-holder").attr("disabled", true);
      


    }else{

      Swal.fire(
        'Attribute Details',
        'Attribute Type and Details are required fields.',
        'error'
      );

    }

    this.spinner.hide();

  }

  removeAttribList(additionalAttrib : AdditionalAttribute){

    this.spinner.show();
    const index: number = this.additionalAttributeFinal.indexOf(additionalAttrib);

    if (index !== -1) {
      this.additionalAttributeFinal.splice(index, 1);
    }

    this.spinner.hide();

  }

  openMoreInfo(customerAllDetails : AllCustomerDetails){

  this.spinner.show();
    this.allCustomerDetailsSingle = customerAllDetails;
  this.spinner.hide();

  }

  chooseNewCustomerType(){
  this.spinner.show();

  this.newCustomerHolder = new Customer();
  $("#accordions .customer-accordion").removeClass("hidden");
  this.newCustomerHolder.gender = "0";

  this.newCustomerHolder.customerTypeId = this.newCustomerTypeHolder.split("-")[0];
  this.showJuridicalFields = this.newCustomerTypeHolder.split("-")[1];

  if(this.showJuridicalFields == "0"){
    $("#main-details-holder").html("Customer Details");
  }else{
    $("#main-details-holder").html("Personal Details");
  }

  setTimeout(function(){
    $('#firstname').keyup(function(){
        this.value = this.value.toUpperCase();
    });

    $('#middlename').keyup(function(){
        this.value = this.value.toUpperCase();
    });

    $('#lastname').keyup(function(){
        this.value = this.value.toUpperCase();
    });

    $('#fullname').keyup(function(){
        this.value = this.value.toUpperCase();
    });

    $('#passport').keyup(function(){
        this.value = this.value.toUpperCase();
    });

    $('#occupation').keyup(function(){
        this.value = this.value.toUpperCase();
    });
  },10);

  this.spinner.hide();
  }

  openAccordion(accordionId: string){

    if($("#" + accordionId + " span i").hasClass('fa-chevron-down')){
      $("#" + accordionId + " span i").removeClass("fa-chevron-down");
      $("#" + accordionId + " span i").addClass("fa-chevron-up");
    }else{
      $("#" + accordionId + " span i").removeClass("fa-chevron-up");
      $("#" + accordionId + " span i").addClass("fa-chevron-down");
    }

  }

  modalAddCustomer(){
  this.spinner.show();
    this.newCustomerHolder = new Customer();
    this.allAddressDetailList = [];
    this.customerContactList = [];
    this.additionalAttributeFinal = [];
    this.newCustomerTypeHolder = "";
    this.newCustomerHolder.gender = "0";
    this.customerManagementType = "add";
    this.previousPage = this.templateRouter;
    this.templateRouter = "addCustomer";
    this.addEditCustmerShow = "";

    $("#accordions .customer-accordion").addClass("hidden");


    $("#addCustomerError2").addClass("hidden");
    $("#addCustomerSuccess").addClass("hidden");
    $("#addCustomerError").addClass("hidden");

    

    this.spinner.hide();
  }

  closeAlert(alertId){

    $("#" + alertId).addClass("hidden");

  }

  showAddingFields(field: String){
    switch (field) {
      case "address":
        this.addAddress = "";
        break;
      
      default:
        this.addContact = "";
        break;
    }
  }

  modalUpdateCustomer(customerAllDetails : AllCustomerDetails){
    this.spinner.show();

      this.previousPage = this.templateRouter;
      this.templateRouter = "addCustomer";
      this.addEditCustmerShow = "";
      $("#addCustomerError").addClass("hidden");

      this.newCustomerHolder = customerAllDetails.customerDetails;
      this.allAddressDetailList = customerAllDetails.addressDetails;
      this.customerContactList = customerAllDetails.contactDetails;
      this.additionalAttributeFinal = customerAllDetails.attributeDetails;
      this.customerPaymentTerm = customerAllDetails.paymentTermDetails;

      this.newCustomerTypeHolder = this.newCustomerHolder.customerTypeId + '-' + this.newCustomerHolder.naturalFlag

      $("#accordions .customer-accordion").removeClass("hidden");
      $("#address-holder").removeClass("hidden");
      // $("#attachements-holder").removeClass("hidden");
      $("#contact-holder").removeClass("hidden");

      this.showJuridicalFields = this.newCustomerHolder.naturalFlag;

      if(this.showJuridicalFields == "0"){
        $("#main-details-holder").html("Customer Details");
      }else{
        $("#main-details-holder").html("Personal Details");
      }

      $("#addCustomerError2").addClass("hidden");
      $("#addCustomerSuccess").addClass("hidden");
      this.customerManagementType = "update";
      this.spinner.hide();

  }

  chooseNewProvince(){
    this.spinner.show();
    this.singleAddressDetail.provinceDetail = this.singleAddressDetail.provinceDetailId.split("-")[1];

    this.subscription.add(this.caller.doCallService("/client/select-all-municipality-by-province", this.singleAddressDetail.provinceDetailId.split("-")[0]).subscribe(
        result => {
          this.municipalityList = result;
          $("#city-holder").removeClass("hidden");
          this.spinner.hide();
        }
      ));

  }

  chooseNewMunicipality(){
    this.spinner.show();
    this.singleAddressDetail.municipalityDetail = this.singleAddressDetail.municipalityDetailId.split("-")[1];
    this.singleAddressDetail.barangayDetailId = "0";

    this.subscription.add(this.caller.doCallService("/client/select-all-barangay-by-municipality", this.singleAddressDetail.municipalityDetailId.split("-")[0]).subscribe(
        result => {
          this.barangayList = result;
          $("#barangay-holder").removeClass("hidden");
          this.spinner.hide();
        }
      ));

    $("#other-addr-details").removeClass("hidden");

  }

  chooseNewBarangay(){
    this.spinner.show();
    this.singleAddressDetail.barangayDetail = this.singleAddressDetail.barangayDetailId.split("-")[1];
    this.spinner.hide();
  }

  addNewAddress(){


    let message = [];
    let proceed = "1";
    let endingMessage = "";

    
    if(!this.singleAddressDetail.municipalityDetailId){
        message.push("Municipality");
        proceed = "0";
    }

    if(!this.singleAddressDetail.provinceDetailId){

      message.push("Province");
      proceed = "0";

    }

    if(!this.singleAddressDetail.addressTypeId){

      message.push("Address Type");
      proceed = "0";

    }

    if(!this.singleAddressDetail.zipCode){

      message.push("Zip Code");
      proceed = "0";

    }

    if(!this.singleAddressDetail.addressDetails){

      message.push("Address Details");
      proceed = "0";

    }

    let finalMessage = "";

    if(message.length == 1){
      finalMessage = message[0] + " is required field.";
    }

    if(message.length == 2){
      finalMessage = message[0] + " and " + message[1] + " are required fields.";
    }

    if(message.length > 2){
      finalMessage += message[0];
      for(var i = 1; i < message.length - 1; i++){
        finalMessage += ", " + message[i];
      }
      finalMessage += " and " + message[message.length - 1] + " are required fields.";

    }

    if(message.length > 0){

      Swal.fire({
        type: 'error',
        title: 'Incomplete Address Details',
        text: finalMessage
      })

    }else{

      this.spinner.show();

      this.addAddress = "hidden";

      $("#city-holder").addClass("hidden");
      $("#barangay-holder").addClass("hidden");
      $("#other-addr-details").addClass("hidden");

      if(this.singleAddressDetail.barangayDetailId){
        this.singleAddressDetail.barangayDetailId = this.singleAddressDetail.barangayDetailId.split("-")[0];
      }

      this.singleAddressDetail.municipalityDetailId = this.singleAddressDetail.municipalityDetailId.split("-")[0];
      this.singleAddressDetail.provinceDetailId = this.singleAddressDetail.provinceDetailId.split("-")[0];
      this.singleAddressDetail.addressType = this.singleAddressDetail.addressTypeId.split("-")[1];
      this.singleAddressDetail.addressTypeId = this.singleAddressDetail.addressTypeId.split("-")[0];
      this.allAddressDetailList.push(this.singleAddressDetail);
      this.singleAddressDetail = new AddressDetails();
      $("#contact-holder").removeClass("hidden");
      this.spinner.hide();

    }

    

  }

  removeAddressList(address: AddressDetails){
    this.spinner.show();
    const index: number = this.allAddressDetailList.indexOf(address);

    if (index !== -1) {
      this.allAddressDetailList.splice(index, 1);
    }

    this.spinner.hide();

  }

  showAddressPanel(){
    this.spinner.show();
      $("#address-holder").removeClass("hidden");
    this.spinner.hide();
  }

  addNewContact(){

    let message = [];
    let proceed = "1";
    let endingMessage = "";

    
    if(!this.customerContact.customerContactTypeId){
        message.push("Contact Type");
        proceed = "0";
    }

    if(!this.customerContact.detail){

      message.push("Contact Detail");
      proceed = "0";

    }

    let finalMessage = "";

    if(message.length == 1){
      finalMessage = message[0] + " is required field.";
    }

    if(message.length == 2){
      finalMessage = message[0] + " and " + message[1] + " are required fields.";
    }

    if(message.length > 2){
      finalMessage += message[0];
      for(var i = 1; i < message.length - 1; i++){
        finalMessage += ", " + message[i];
      }
      finalMessage += " and " + message[message.length - 1] + " are required fields.";

    }

    if(message.length > 0){

      Swal.fire({
        type: 'error',
        title: 'Incomplete Contact Details',
        text: finalMessage
      })

    }else{

      this.spinner.show();
      this.addContact = "hidden";
      this.customerContact.customerContactType = this.customerContact.customerContactTypeId.split("-")[1];
      this.customerContact.customerContactTypeId = this.customerContact.customerContactTypeId.split("-")[0];
      this.customerContactList.push(this.customerContact);
      this.customerContact = new CustomerContactDetail();
      $("#contact-detail-holder").attr("disabled", true);
      // $("#attachements-holder").removeClass("hidden");
      this.spinner.hide();

    }

    
  }

  chooseContactType(){
    this.spinner.show();
    $("#contact-detail-holder").removeAttr("disabled");
    this.spinner.hide();
  }

  removeContactDetail(contactDetail: CustomerContactDetail){
  this.spinner.show();
  const index: number = this.customerContactList.indexOf(contactDetail);

    if (index !== -1) {
      this.customerContactList.splice(index, 1);
    }

  this.spinner.hide();

  }



  saveCustomer(){

    let message = [];
    let proceed = "1";
    let endingMessage = "";

    if(this.showJuridicalFields == "0"){

      if(!this.newCustomerHolder.fullName){
        message.push("Full Company name");
        proceed = "0";
      }else{
        this.newCustomerHolder.fullName = this.newCustomerHolder.fullName.toUpperCase();
      }

      if(this.newCustomerHolder.birthDay){

        if(m().isBefore(this.newCustomerHolder.birthDay)){
          message.push("Valid Birthday");
          proceed = "0";
        }

      }

      if(!this.customerPaymentTerm.paymentTermId){

        message.push("Credit Term");
        proceed = "0";
      }

    }else{


      if(!this.newCustomerHolder.lastName){
        message.push("Last name");
        proceed = "0";
      }else{
        this.newCustomerHolder.lastName = this.newCustomerHolder.lastName.toUpperCase();
      }

      if(!this.newCustomerHolder.firstName){
        message.push("First name");
        proceed = "0";
      }else{
        this.newCustomerHolder.firstName = this.newCustomerHolder.firstName.toUpperCase();
      }

      if(!this.newCustomerHolder.middleName){
        this.newCustomerHolder.middleName = "";
      }else{
        this.newCustomerHolder.middleName = this.newCustomerHolder.middleName.toUpperCase();
      }

      if(!this.newCustomerHolder.birthDay){
        message.push("Birthday");
        proceed = "0";
      }else{

        if(m().isBefore(this.newCustomerHolder.birthDay)){
          message.push("Valid Birthday");
          proceed = "0";
        }

      }

      if(!this.newCustomerHolder.gender){
        this.newCustomerHolder.gender = "0";
      }

      if(this.newCustomerHolder.customerTypeId == "1"){

        if(!this.newCustomerHolder.passportId){
          message.push("Passport");
          proceed = "0";
        }else{

          if(this.newCustomerHolder.passportId.length != 9){
            message.push("9 Passport Character");
            proceed = "0";
          }

          this.newCustomerHolder.passportId = this.newCustomerHolder.passportId.toUpperCase();

        }

        if(!this.newCustomerHolder.occupation){
          message.push("Occupation");
          proceed = "0";
        }else{
          this.newCustomerHolder.occupation = this.newCustomerHolder.occupation.toUpperCase();
        }

      }

      this.newCustomerHolder.fullName = this.newCustomerHolder.lastName + ", " + this.newCustomerHolder.firstName + " " + this.newCustomerHolder.middleName;
      this.newCustomerHolder.fullName = this.newCustomerHolder.fullName.toUpperCase();
    }

    let finalMessage = "";

    if(message.length == 1){
      finalMessage = message[0] + " is required field.";
    }

    if(message.length == 2){
      finalMessage = message[0] + " and " + message[1] + " are required fields.";
    }

    if(message.length > 2){
      finalMessage += message[0];
      for(var i = 1; i < message.length - 1; i++){
        finalMessage += ", " + message[i];
      }
      finalMessage += " and " + message[message.length - 1] + " are required fields.";

    }

    if(message.length > 0){

      Swal.fire({
        type: 'error',
        title: 'Incomplete Information.',
        text: finalMessage
      })

    }else{

      Swal.fire({
        title: 'Customer Request',
        text: "You're about to "+ this.customerManagementType +" customer, Proceed?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proceed'
      }).then((result) => {
        if (result.value) {
          
          this.spinner.show();
          let finalAction = "insert-new-customer";
          endingMessage = "Successful addition of new Customer " + this.newCustomerHolder.fullName;
          if(this.customerManagementType == "update"){
            finalAction = "update-customer";

            let oldContactHolder : CustomerContactDetail[] = this.customerContactList;

            this.customerContactList = [];
            for(let i = 0; i < oldContactHolder.length; i++){

              let temp : CustomerContactDetail = new CustomerContactDetail();
              temp.detail = oldContactHolder[i].detail;
              temp.customerContactTypeId = oldContactHolder[i].customerContactTypeId;
              temp.customerContactType = oldContactHolder[i].customerContactType;
              this.customerContactList.push(temp);

            }

            let oldAttributeHolder : AdditionalAttribute[] = this.additionalAttributeFinal;

            this.additionalAttributeFinal = [];

            for(let i = 0; i < oldAttributeHolder.length; i++){

              let temp : AdditionalAttribute = new AdditionalAttribute();
              temp.attributeValue = oldAttributeHolder[i].attributeValue;
              temp.attributeTypeId = oldAttributeHolder[i].attributeTypeId;
              temp.attributeType = oldAttributeHolder[i].attributeType;
              this.additionalAttributeFinal.push(temp);

            }

            endingMessage = "Successful update of Customer " + this.newCustomerHolder.fullName;

          }

          this.newCustomerHolder.createdBy = this.auth.getUserDetails().userId;
          this.newCustomerHolder.createdByRole = this.auth.getUserType();
          this.newCustomerHolder.status = "1";
          this.newCustomerHolder.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

          this.subscription.add(this.caller.doCallService("/client/" + finalAction, {AddressDetails: this.allAddressDetailList, CustomerDetails: this.newCustomerHolder, ContactDetails: this.customerContactList, AttributeDetails: this.additionalAttributeFinal, PaymentTerm: this.customerPaymentTerm}).subscribe(
              result => { 
                if(result.status == "SUCCESS"){
                  $('#content').animate({ scrollTop: 0 }, 'slow');
                  $("#closeAddNewCustomerModal").trigger("click");

                  this.customerDetailHolder.customerTypeId = this.newCustomerHolder.customerTypeId;

                  this.initialChooseCustomerType();

                  this.backPage('initialize');
                  this.customerList = result;

                }

              }
            ));

        }
      });

      

    }

  }

  submitIssuePolicy(){

    Swal.fire({
      title: 'Submit Policy Request',
      text: "Are you sure you want to proceed on submission of Policy Request?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        
        this.spinner.show();
    
        this.policyDetails.policyStatusId = "2";
        this.policyDetails.policyIssuerId = this.auth.getUserDetails().userId;

        if(!this.policyDetails.policyHeaderId){
          this.policyDetails.policyHeaderId = "0";
        }

        this.policyDetails.policyLevel = "1";

        if(this.policyDetails.policyTypeId == "2"){
          this.policyDetails.policyLevel = "2";
          this.policyDetails.policyStatusId = "2";
          this.policyDetails.agentCode = this.policyDetails.policyHeaderId.split("-")[2];
          this.policyDetails.policyHeaderId = this.policyDetails.policyHeaderId.split("-")[0];
        }

        if(this.policyDetails.policyTypeId == "1"){
          this.policyDetails.premiumAmount = "0";
          this.policyDetails.termInMonth = "0";
          this.policyDetails.premiumAmountId = "0";
        }

        this.policyDetails.customerId = this.allCustomerDetailsSingle.customerDetails.customerId;

        /* VALIDATIONS */

        let message = [];
        let proceed = "1";
        let finalMessage = "";

        if(this.policyDetails.policyTypeId == "1"){

          if(!this.policyDetails.policyNumber){

            message.push("Policy Number ");
            proceed = "0";

          }

          if(!this.policyDetails.productId){

            message.push("Product ");
            proceed = "0";

          }

          if(!this.policyDetails.agentCode){

            message.push("Agent ");
            proceed = "0";

          }

        }else if(this.policyDetails.policyTypeId == "2"){
          if(this.policyDetails.policyHeaderId == "0"){

            message.push("Master Policy ");
            proceed = "0";

          }

          if(!this.policyDetails.areaOfDeploymentId){

            message.push("Area of Deployment ");
            proceed = "0";

          }

          if(!this.policyDetails.pocBased){

            message.push("Product Variant ");
            proceed = "0";

          }

          if(!this.policyDetails.termInMonth){

            message.push("Terms ");
            proceed = "0";

          }

          if(this.policyDetails.premiumAmount == ""){

            message.push("Premium Amount ");
            proceed = "0";

          }



        }

        if(message.length == 1){
          finalMessage = message[0] + " is a required field.";
        }

        if(message.length == 2){
          finalMessage = message[0] + " and " + message[1] + " are required fields.";
        }

        if(message.length > 2){
          finalMessage += message[0];
          for(var i = 1; i < message.length - 1; i++){
            finalMessage += ", " + message[i];
          }
          finalMessage += " and " + message[message.length - 1] + " are required fields.";

        }

        /* VALIDATIONS */

        if(message.length > 0){

          Swal.fire({
            type: 'error',
            title: 'Incomplete Information',
            text: finalMessage
          });

          this.spinner.hide();

        }else{

          let param2 =  {action: "insert-policy", values: {issueType: '',policyDetails: this.policyDetails, beneficiaryDetails: this.finalBeneficiaryList}};
          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
              result => {

                if(result.status == "1"){

                  if(this.policyDetails.policyTypeId == "2" && (this.policyDetails.ageUW == "1" || this.policyDetails.aodUW == "1" || this.policyDetails.retroUW == "1" || this.policyDetails.passportUW == "1")){
                  
                    this.submitUnderwriting(result.msg);

                  }else{

                    Swal.fire(
                      'Success!',
                      'Policy has been succesfully issued.',
                      'success'
                    );

                    this.previousPage = "initialize";
                    this.templateRouter = "viewCustomer";

                  }

                }else{
                  alert("Something went wrong. Please try again.");
                }

                this.spinner.hide();
              }
            ));

        }

      }
    });

  }

}
