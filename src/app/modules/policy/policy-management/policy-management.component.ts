import { Component, OnInit,OnDestroy, HostListener, Input } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {AuthService} from '../../../services/auth.service';
import {Customer} from '../../../objects/customer';
import {CustomerType} from '../../../objects/customer-type';
import {AllCustomerDetails} from '../../../objects/all-customer-details';
import {PolicyType} from '../../../objects/policy-type';
import {Product} from '../../../objects/product';
import {Line} from '../../../objects/line';
import { SubLine } from '../../../objects/subLine';
import {PolicyDetails} from '../../../objects/policy-details';
import {CountryDetail} from '../../../objects/country-detail';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {PolicyCoverages} from '../../../objects/policy-coverages';
import {CancellationReason} from '../../../objects/cancellation-reason';
import {InboxDetails} from '../../../objects/inbox-details';
import {InboxRemarks} from '../../../objects/inbox-remarks';
import {InboxHeader} from '../../../objects/inbox-header';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.component.html',
  styleUrls: ['./policy-management.component.css']
})
export class PolicyManagementComponent implements OnInit, ComponentCanDeactivate,OnDestroy {

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private caller : AuthService,
    private spinner: NgxSpinnerService) { }

  private subscription: Subscription = new Subscription();

  //individuals
  customerDetailHolder : Customer;
  allCustomerDetailsSingle : AllCustomerDetails;
  formattedDate: String;
  addCustomerNotice: String;
  templateRouter: String;
  previousPage: String;
  isMaster: String;
  customerBirthday: number;
  policyDetails : PolicyDetails;
  inboxRemarks : InboxRemarks;
  inboxHeader : InboxHeader;
  inboxDetails : InboxDetails[];

  //list
  policyTypeList : PolicyType[];
  customerList : AllCustomerDetails[];
  productCoveragesList: PolicyCoverages[];
  productCoveragesListA: PolicyCoverages[];
  productCoveragesListB: PolicyCoverages[];
  lineList: Line[];
  sublineList: SubLine[];
  productList: Product[];
  agentList : Customer[];
  customerListIssuance : Customer[];
  beneficiaryList : Customer[];
  finalBeneficiaryList : Customer[];
  POCListUnderMaster : AllCustomerDetails[];
  countryList : CountryDetail[];
  cancellationReasonList : CancellationReason[];
  inboxDetailsFinal : InboxDetails[];
  pageSize: string;
  currentPage: number;
  pageLength: String[];

  previousMasterPolicy: AllCustomerDetails;

  //Variables for showing fields in component
  newCustomerTypeHolder: string;
  showJuridicalFields: string;
  issuePolicyShowFields: string;
  beneficiarySearch: string;
  holderSearch: string;
  signatory1: string;
  signatory1title: string;
  signatory2: string;
  signatory2title: string;
  showHideMasterPolicy: string;
  issuanceDetailsHeader: string;
  minAge: string;
  maxAge: string;

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }


  ngOnInit() {
    this.customerDetailHolder = new Customer();
    this.previousMasterPolicy = new AllCustomerDetails();
    this.inboxRemarks = new InboxRemarks();
    this.inboxHeader = new InboxHeader();
    this.inboxDetails = [];
    this.pageLength = [];
    this.pageSize = "10";
    this.showHideMasterPolicy = "";
    this.customerDetailHolder.policyTypeId = "1";
    this.customerDetailHolder.fullName = "";
    this.customerDetailHolder.policyNumber = "";
    this.beneficiarySearch = "";
    this.holderSearch = "";
    this.customerBirthday = 0;
    this.issuanceDetailsHeader = "";

    let temp = new InboxDetails();
    temp.detailTypeId = '1';
    this.inboxDetails.push(temp);

    temp = new InboxDetails();
    temp.detailTypeId = '2';
    this.inboxDetails.push(temp);

    temp = new InboxDetails();
    temp.detailTypeId = '7';
    this.inboxDetails.push(temp);

    temp = new InboxDetails();
    temp.detailTypeId = '8';
    this.inboxDetails.push(temp);

    this.allCustomerDetailsSingle = null;
    this.formattedDate = "";
    this.isMaster = "0";

    this.customerList = [];
    this.lineList = [];
    this.sublineList = [];
    this.productList = [];
    this.productCoveragesList = [];
    this.productCoveragesListA = [];
    this.productCoveragesListB = [];
    this.agentList = [];
    this.finalBeneficiaryList = [];
    this.beneficiaryList = [];
    this.customerListIssuance = [];
    this.POCListUnderMaster = [];
    this.countryList = [];
    this.inboxDetailsFinal = [];
    this.cancellationReasonList = [];
    this.policyDetails = new PolicyDetails();
    this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');

    /*GET SIGNATORIES*/
    let signatoryInput =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", signatoryInput).subscribe(
      result => {
        this.signatory1 = result.msg[0].configValue;
    }));

    signatoryInput =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", signatoryInput).subscribe(
      result => {
        this.signatory2 = result.msg[0].configValue;
    }));

    signatoryInput =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1TITLE'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", signatoryInput).subscribe(
      result => {
        this.signatory1title = result.msg[0].configValue;
    }));

    signatoryInput =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2TITLE'}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", signatoryInput).subscribe(
      result => {
        this.signatory2title = result.msg[0].configValue;
    }));
    /*GET SIGNATORIES*/
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

      
    this.spinner.show();

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

    let paramCountry =  {action: "select-all-country-list", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramCountry).subscribe(
        result => {
          this.countryList = result.msg;
          this.spinner.hide();
        }
      ));

    let param =  {action: "select-policy-type", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.policyTypeList = result.msg;
          this.spinner.hide();
        }
      ));

    this.templateRouter = "initialize";
    this.issuePolicyShowFields = "hide";


  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  showAddBeneficiary(){
    $("#add-beneficiary").removeClass("hidden");
    $("#add-beneficiary-btn").addClass("hidden");
  }

  showAddHolder(){
    $("#add-holder").removeClass("hidden");
    $("#add-holder-btn").addClass("hidden");
  }

  chooseHolder(customer){

    this.policyDetails.fullName = customer.fullName;
    this.policyDetails.customerId = customer.customerId + ":=:" + customer.passportId;
    this.policyDetails.ageUW = "0";
    this.customerBirthday = m().diff(customer.birthDay, 'years');
    if(this.customerBirthday < parseInt(this.minAge)){
      Swal.fire(
        'Age Restriction',
        'Policy holder must be at least '+ this.minAge +' years old.',
        'error'
      );
      this.policyDetails.customerId = "";
       this.policyDetails.fullName = "";
       $("#add-holder").removeClass("hidden");
       $("#add-holder-btn").addClass("hidden");
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
           $("#add-holder").addClass("hidden");
           $("#add-holder-btn").removeClass("hidden");
           this.showHideIssuePolicyFields();
           this.issuePolicyShowFields = "show";
        }else{
           this.policyDetails.customerId = "";
           this.policyDetails.fullName = "";
           $("#add-holder").removeClass("hidden");
           $("#add-holder-btn").addClass("hidden");
           this.issuePolicyShowFields = "hide";
        }
      });
    }else{
      this.showHideIssuePolicyFields();
    }

  }

  showHideIssuePolicyFields(){

    this.issuePolicyShowFields = "show";

    this.spinner.show();

    this.productCoveragesList = [];

    let spl = this.policyDetails.customerId.split(":=:");

    let param1 =  {action: "select-existing-policy", values: {"customerId": spl[0]}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param1).subscribe(
      result => {
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
                 $("#add-holder").addClass("hidden");
                 $("#add-holder-btn").removeClass("hidden");
              }else{
                 this.policyDetails.customerId = "";
                 this.policyDetails.fullName = "";
                 $("#passport-error").addClass('hidden');
                 $("#add-holder").removeClass("hidden");
                 $("#add-holder-btn").addClass("hidden");
              }
            });
            
         }else{
           $("#add-holder").addClass("hidden");
           $("#add-holder-btn").removeClass("hidden");
         }
         this.spinner.hide();
      }
    ));



  }

  searchHolder(){


    this.spinner.show();

      let param1 = '1';

      if(this.auth.getUserType() == "ICA"){
        param1 += ",ICA-" + this.auth.getUserDetails().userId + "-" + this.holderSearch;
      }else{
        param1 += ",O-" + this.holderSearch;
      }

      this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", param1,"0","1000").subscribe(
        result => {
          this.customerListIssuance = result;
          this.spinner.hide();
        }
      ));

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



  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

  emailPolicy(type : string){

    let pdfInput = {};

    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Send',
      showCancelButton: true
    }).queue([
      {
        title: 'Email',
        text: "Please input recipient's email address"
      }
    ]).then((result) => {
      if (result.value) {

        this.spinner.show();
        if(type == '2'){
        let benefits = [];
        _.forEach(this.productCoveragesListA, function(product) {
          let benefit = {
            benefits : product.type_name,
            amountOfBenefits : product.type_description
          };
          benefits.push(benefit);
        });

        for(let i=0; i < this.productCoveragesListB.length;i++){
          _.assign(benefits[i],{
            benefit : this.productCoveragesListB[i].type_name,
            amountOfBenefits2 : this.productCoveragesListB[i].type_description
          });
        }

        this.allCustomerDetailsSingle;
        pdfInput = {
          reportLogos : ['phBankAssurance.png','cocoLife.png','phBank.png','signature1.png','signature2.png'],
          reportCode : 'POCReport',
          signatory1 : this.signatory1,
          signatory2 : this.signatory2,
          signatory1Title : this.signatory1title,
          signatory2Title : this.signatory2title,
          reportFileName : this.allCustomerDetailsSingle.customerDetails.policyNumber,
          policyHolder : this.allCustomerDetailsSingle.customerDetails.fullName,
          manningAgency : this.allCustomerDetailsSingle.customerDetails.masterFullName,
          policyNumber : this.allCustomerDetailsSingle.customerDetails.masterPolicyNumber,
          certificateNumber : this.allCustomerDetailsSingle.customerDetails.policyNumber,
          issueDate : this.allCustomerDetailsSingle.customerDetails.policyDateAdded.split(' ')[0],
          term : this.allCustomerDetailsSingle.customerDetails.coverageTermInMonth,
          coverage : this.allCustomerDetailsSingle.customerDetails.productDescription,
          areaOfDeployment : this.allCustomerDetailsSingle.customerDetails.areaOfDeployment,
          expiryDate : this.allCustomerDetailsSingle.customerDetails.expiryDate.split(' ')[0],
          examinedBy : this.allCustomerDetailsSingle.customerDetails.issuerName,
          benefits : benefits
        };
      }else if(type == '1'){
        pdfInput = {
          reportLogos : ['phBankAssurance.png'],
          reportCode : 'MasterPolicy',
          policyHolderName : this.allCustomerDetailsSingle.customerDetails.fullName,
          reportFileName : this.allCustomerDetailsSingle.customerDetails.policyNumber,
          masterPolicyNumber : this.allCustomerDetailsSingle.customerDetails.policyNumber
        };
      }
      this.subscription.add(this.caller.generatePDF(pdfInput).subscribe(resulta => {

        let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color:white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Good Day!</p><p>Attached is policy "+ this.allCustomerDetailsSingle.customerDetails.policyNumber +" for "+ this.allCustomerDetailsSingle.customerDetails.fullName +".<br></p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";
        let paramEmail =  {file_name: this.allCustomerDetailsSingle.customerDetails.policyNumber + ".pdf", toName: this.allCustomerDetailsSingle.customerDetails.fullName, to: result.value[0], subject: this.allCustomerDetailsSingle.customerDetails.policyNumber + " " + this.allCustomerDetailsSingle.customerDetails.fullName, body: mailBody};

        this.subscription.add(this.caller.doCallService("/digitalinnomailer/", paramEmail).subscribe(
          resulte => {
            let fileNameDelete : String = this.allCustomerDetailsSingle.customerDetails.policyNumber + ".pdf";
            this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
              resultend => {
                this.spinner.hide();

                Swal.fire(
                  'Success!',
                  "We've successfully sent an email to email account "+ result.value[0] +".",
                  'success'
                );
                
              }
            ));

            
          }
        ));

      }));

      }
    });

    

  }

  printPDF(type : string){
    let pdfInput = {};
    if(type == '2'){
      let benefits = [];
      _.forEach(this.productCoveragesListA, function(product) {
        let benefit = {
          benefits : product.type_name,
          amountOfBenefits : product.type_description
        };
        benefits.push(benefit);
      });

      for(let i=0; i < this.productCoveragesListB.length;i++){
        _.assign(benefits[i],{
          benefit : this.productCoveragesListB[i].type_name,
          amountOfBenefits2 : this.productCoveragesListB[i].type_description
        });
      }

      pdfInput = {
        reportLogos : ['phBankAssurance.png','cocoLife.png','phBank.png','signature1.png','signature2.png'],
        reportCode : 'POCReport',
        signatory1 : this.signatory1,
        signatory2 : this.signatory2,
        signatory1Title : this.signatory1title,
        signatory2Title : this.signatory2title,
        reportFileName : this.allCustomerDetailsSingle.customerDetails.policyNumber,
        policyHolder : this.allCustomerDetailsSingle.customerDetails.fullName,
        manningAgency : this.allCustomerDetailsSingle.customerDetails.masterFullName,
        policyNumber : this.allCustomerDetailsSingle.customerDetails.masterPolicyNumber,
        certificateNumber : this.allCustomerDetailsSingle.customerDetails.policyNumber,
        issueDate : this.allCustomerDetailsSingle.customerDetails.policyDateAdded.split(' ')[0],
        term : this.allCustomerDetailsSingle.customerDetails.coverageTermInMonth,
        coverage : this.allCustomerDetailsSingle.customerDetails.productDescription,
        areaOfDeployment : this.allCustomerDetailsSingle.customerDetails.areaOfDeployment,
        expiryDate : this.allCustomerDetailsSingle.customerDetails.expiryDate.split(' ')[0],
        examinedBy : this.allCustomerDetailsSingle.customerDetails.issuerName,
        benefits : benefits
      };

      this.subscription.add(this.caller.generatePDF(pdfInput).subscribe(result => {
        // window.open(result);

        let fileNameDelete : String = this.allCustomerDetailsSingle.customerDetails.policyNumber + ".pdf";
          this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
            resultend => {
              
            }
          ));

      }));

      
    }else if(type == '1'){
      pdfInput = {
        reportLogos : ['phBankAssurance.png'],
        reportCode : 'MasterPolicy',
        policyHolderName : this.allCustomerDetailsSingle.customerDetails.fullName,
        reportFileName : this.allCustomerDetailsSingle.customerDetails.policyNumber,
        masterPolicyNumber : this.allCustomerDetailsSingle.customerDetails.policyNumber
      };

      this.subscription.add(this.caller.generatePDF(pdfInput).subscribe(result => {
        // window.open(result);

        let fileNameDelete : String = this.allCustomerDetailsSingle.customerDetails.policyNumber + ".pdf";
          this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
            resultend => {
              
            }
          ));
        
      }));

    }
    
  }

  updateDetails(){
    this.previousPage = this.templateRouter;
    this.templateRouter = 'issuePOCPolicy';
    this.inboxDetails = [];
    this.issuanceDetailsHeader = "";
    this.issuePolicyShowFields = "show";
    this.productCoveragesList = [];
    this.policyDetails = new PolicyDetails();
    this.policyDetails.effectivityDate = m(this.allCustomerDetailsSingle.customerDetails.effectivityDate).format('YYYY-MM-DD');

    this.policyDetails.agentCode = this.allCustomerDetailsSingle.customerDetails.agentCode;
    this.policyDetails.areaOfDeploymentId = this.allCustomerDetailsSingle.customerDetails.areaOfDeploymentId;
    this.policyDetails.pocBased = this.allCustomerDetailsSingle.customerDetails.pocBased;
    this.policyDetails.termInMonth = this.allCustomerDetailsSingle.customerDetails.coverageTermInMonth;
    this.policyDetails.premiumAmount = this.allCustomerDetailsSingle.customerDetails.premiumAmount;
    this.policyDetails.customerId = this.allCustomerDetailsSingle.customerDetails.customerId;
    this.policyDetails.policyId = this.allCustomerDetailsSingle.customerDetails.policyId;
    this.policyDetails.premiumAmountId = "0";

  }

  submitUpdatePolicy(){
    this.allCustomerDetailsSingle.customerDetails.areaOfDeployment = $("#aod option:selected").text();
    let param2 =  {action: "update-poc", values: {policy_details: this.policyDetails}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
        result => {


          if(result.status == "1"){

            Swal.fire(
              'Success!',
              'POC has been successfully updated.',
              'success'
            );

            this.allCustomerDetailsSingle.customerDetails.areaOfDeploymentId = this.policyDetails.areaOfDeploymentId;
            this.allCustomerDetailsSingle.customerDetails.areaOfDeployment = $("#aod option:selected").text();
            this.allCustomerDetailsSingle.customerDetails.pocBased = this.policyDetails.pocBased;
            this.allCustomerDetailsSingle.customerDetails.coverageTermInMonth = this.policyDetails.termInMonth;
            this.allCustomerDetailsSingle.customerDetails.premiumAmount = this.policyDetails.premiumAmount;

            this.previousPage = "initialize";
            this.templateRouter = "viewCustomer";
            this.policyDetails = new PolicyDetails();
            this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
            this.finalBeneficiaryList = [];
            this.initialChoosePolicyType();
            this.issuePolicyShowFields = "hide";

          }else{
            alert("Something went wrong. Please try again.");
          }

          this.spinner.hide();
        }
      ));
  }

  issuePOCPolicy(){

    this.previousPage = this.templateRouter;
    this.templateRouter = 'issuePOCPolicy';
    this.inboxDetails = [];
    this.issuanceDetailsHeader = "Master ";
    this.policyDetails = new PolicyDetails();
    this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
    this.productCoveragesList = [];
    this.customerListIssuance = [];
    this.finalBeneficiaryList = [];
    this.issuePolicyShowFields = "hide";
    this.policyDetails.agentCode = this.allCustomerDetailsSingle.customerDetails.agentCode;

  }

  submitIssueDraftPolicy(){

    Swal.fire({
      title: 'Policy Issuance',
      text: "You're about to issue this POC, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (result.value) {

        let param2 =  {action: "update-issue-policy", values: {issuer: this.auth.getUserDetails().userId, policy_id: this.allCustomerDetailsSingle.customerDetails.policyId}};
        this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
            result => {


              if(result.status == "1"){

                Swal.fire(
                  'Success!',
                  'POC has been successfully issued.',
                  'success'
                );

                this.previousPage = "";
                this.templateRouter = "initialize";
                this.policyDetails = new PolicyDetails();
                this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
                this.finalBeneficiaryList = [];
                this.initialChoosePolicyType();
                this.issuePolicyShowFields = "hide";

              }else{
                alert("Something went wrong. Please try again.");
              }

              this.spinner.hide();
            }
          ));

        
      }
    });

    

  }

  submitIssuePolicy(type: String){

    if(!this.policyDetails.customerId){

      Swal.fire({
        type: 'error',
        title: 'Incomplete Data',
        text: 'Please choose a policy holder.'
      });

    }else{

      Swal.fire({
      title: 'Policy Request',
      text: "You're about to " + type + " this policy, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (result.value) {
        
        this.spinner.show();
        let spl = this.policyDetails.customerId.split(":=:");
        let beforeSpl = this.policyDetails.customerId;
        this.policyDetails.customerId = spl[0];
        this.policyDetails.policyStatusId = "2";
        this.policyDetails.policyHeaderId = this.allCustomerDetailsSingle.customerDetails.policyId;
        this.policyDetails.policyLevel = "2";
        this.policyDetails.policyTypeId = "2";

        if(type == "draft"){
          this.policyDetails.policyStatusId = "1";
        }else{
          this.policyDetails.policyIssuerId = this.auth.getUserDetails().userId;
        }


        /* VALIDATIONS */

        let message = [];
        let proceed = "1";
        let finalMessage = "";

        if(this.policyDetails.policyTypeId == "2"){

          if(!this.policyDetails.policyHeaderId){

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

            message.push("Term in Month ");
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
            type: 'warning',
            title: 'Oops...',
            text: finalMessage
          })

        }else{

          let param2 =  {action: "insert-policy", values: {issueType: type, policyDetails: this.policyDetails, beneficiaryDetails: this.finalBeneficiaryList}};
        this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
            result => {
        

              if(result.status == "1"){

                let issuanceOf = $( "#policyType option:selected" ).text();

                if(this.policyDetails.policyTypeId == "2"){
                  issuanceOf = "POC";
                }
                this.spinner.hide();

                if(this.policyDetails.ageUW == "1" || this.policyDetails.aodUW == "1" || this.policyDetails.retroUW == "1" || this.policyDetails.passportUW == "1"){
                  this.policyDetails.customerId = beforeSpl;
                  this.submitUnderwriting(result.msg, type);
                }else{

                  Swal.fire(
                    'Success!',
                    "Successful issuance of " + issuanceOf,
                    'success'
                  );
                  this.issuePolicyShowFields = "hide";
                  this.previousPage = "initialize";
                  this.templateRouter = "viewCustomer";
                  this.policyDetails = new PolicyDetails();
                  this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
                  this.finalBeneficiaryList = [];

                }

              }else{
                alert("Something went wrong. Please try again.");
              }

              
            }
          ));
          
        }
        
        

      }
    });

    }

    

    

  }

  initialChoosePolicyType(){
    this.spinner.show();


    let valuesParam = {"countType": 'count',
                        "select_type": 'policy',
                        "agent_user_id" : '', 
                        "holder_name" : this.customerDetailHolder.fullName, 
                        "policy_number" : this.customerDetailHolder.policyNumber, 
                      "policy_type_id" : this.customerDetailHolder.policyTypeId};

    if(this.auth.getUserType() == "ICA"){
      valuesParam = {"countType": 'count',
                      "select_type": 'policy',
                        "holder_name" : this.customerDetailHolder.fullName, 
                        "policy_number" : this.customerDetailHolder.policyNumber, 
                      "agent_user_id" : this.auth.getUserDetails().customerId,
                     "policy_type_id" : this.customerDetailHolder.policyTypeId };
    }

    let param =  {action: "select-customer-by-type", values: valuesParam};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {

          let len = parseFloat(result.msg) / parseFloat(this.pageSize);
          let spl: string[] = len.toString().split(".");

          let fin = parseInt(spl[0]);

          if(parseInt(spl[1]) > 0){
            fin += 1;
          }

          this.pageLength = [];
          if(fin == 0){
            this.pageLength.push("1");
          }else{

            for(let i = 0; i < fin; i++){
              this.pageLength.push((i + 1).toString());
            }

          }

          this.choosePolicyType("0");
          this.spinner.hide();

        }
      ));

  }

  choosePolicyType(pageNumber: string){
    this.spinner.show();
    this.currentPage = parseInt(pageNumber) + 1;

    let valuesParam = {"countType": 'all',
                      "select_type": 'policy',
                      "agent_user_id" : '',
                        "holder_name" : this.customerDetailHolder.fullName, 
                        "policy_number" : this.customerDetailHolder.policyNumber, 
                      "policy_type_id" : this.customerDetailHolder.policyTypeId};

    if(this.auth.getUserType() == "ICA"){
      valuesParam = {"countType": 'all',
                      "select_type": 'policy',
                        "holder_name" : this.customerDetailHolder.fullName, 
                        "policy_number" : this.customerDetailHolder.policyNumber, 
                      "agent_user_id" : this.auth.getUserDetails().customerId,
                     "policy_type_id" : this.customerDetailHolder.policyTypeId };
    }
    let param =  {action: "select-customer-by-type", values: valuesParam};

    this.subscription.add(this.caller.callPaginated("/digitalinnopolicyservice/?action=policy", param, pageNumber, this.pageSize).subscribe(
        result => {
          this.customerList = result.msg;

          this.showHideMasterPolicy = "";
          if(this.customerDetailHolder.policyTypeId == "2"){
            this.showHideMasterPolicy = "show";
          }

          for(let i = 0; i < this.customerList.length; i++){
            this.customerList[i].customerDetails.dateAdded = m(this.customerList[i].customerDetails.dateAdded).format(this.auth.getDateFormat());
            this.customerList[i].customerDetails.effectivityDate = m(this.customerList[i].customerDetails.effectivityDate).format(this.auth.getDateFormat());
            this.customerList[i].customerDetails.expiryDate = m(this.customerList[i].customerDetails.expiryDate).format(this.auth.getDateFormat());
            this.customerList[i].customerDetails.policyDateAdded = m(this.customerList[i].customerDetails.policyDateAdded).format(this.auth.getDateFormat());
          }
          
          this.spinner.hide();
        }
      ));

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

  openMoreInfo(customerAllDetails : AllCustomerDetails){
  this.spinner.show();

  if(this.isMaster == "0"){
    this.previousPage = this.templateRouter;
    this.templateRouter = "viewCustomer";
  }

  this.isMaster = "0";
  if(customerAllDetails.customerDetails.policyTypeId == "1"){
    this.previousMasterPolicy = customerAllDetails;
  }

    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);

    this.allCustomerDetailsSingle = customerAllDetails;

    this.formattedDate = this.allCustomerDetailsSingle.customerDetails.dateAdded;

    let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'policy',"policy_header_id" : this.allCustomerDetailsSingle.customerDetails.policyId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.POCListUnderMaster = result.msg;
          for(let i = 0; i < this.POCListUnderMaster.length; i++){
            this.POCListUnderMaster[i].customerDetails.dateAdded = m(this.POCListUnderMaster[i].customerDetails.dateAdded).format(this.auth.getDateFormat());
            this.POCListUnderMaster[i].customerDetails.effectivityDate = m(this.POCListUnderMaster[i].customerDetails.effectivityDate).format(this.auth.getDateFormat());
            this.POCListUnderMaster[i].customerDetails.expiryDate = m(this.POCListUnderMaster[i].customerDetails.expiryDate).format(this.auth.getDateFormat());
            this.POCListUnderMaster[i].customerDetails.policyDateAdded = m(this.POCListUnderMaster[i].customerDetails.policyDateAdded).format(this.auth.getDateFormat());
          }

        }
      ));


    let param2 =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.allCustomerDetailsSingle.customerDetails.productDetailId}};

    this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=product", param2).subscribe(
        result => {

          this.productCoveragesListA = [];
          this.productCoveragesListB = [];

          if(result.msg.length > 0){
            for(var i = 0; i < result.msg.length; i++){
              if(i % 2 == 0){
                this.productCoveragesListA.push(result.msg[i]);
              }else{
                this.productCoveragesListB.push(result.msg[i]);
              }
            }
          }

          this.spinner.hide();
        }
      ));


  }

  openMoreInfoPOC(customerAllDetails : AllCustomerDetails){

    this.spinner.show();
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);

    this.isMaster = "1";

    this.POCListUnderMaster = [];

    this.allCustomerDetailsSingle = customerAllDetails;
    this.formattedDate = m(this.allCustomerDetailsSingle.customerDetails.dateAdded, 'YYYY/MM/DD hh:mm:ss').format('dddd, MMMM Do YYYY');

    let param2 =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.allCustomerDetailsSingle.customerDetails.productDetailId}};

    this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=product", param2).subscribe(
        result => {

          this.productCoveragesListA = [];
          this.productCoveragesListB = [];

          if(result.msg.length > 0){
            for(var i = 0; i < result.msg.length; i++){
              if(i % 2 == 0){
                this.productCoveragesListA.push(result.msg[i]);
              }else{
                this.productCoveragesListB.push(result.msg[i]);
              }
            }
          }

          this.spinner.hide();
        }
      ));


  }

  chooseProduct(){

    this.policyDetails.productId = this.allCustomerDetailsSingle.customerDetails.productDetailId;

    if(this.policyDetails.productId && this.policyDetails.termInMonth && this.policyDetails.pocBased){

      this.spinner.show();

      let param2 =  {action: "select-premium-by-product-and-term", values: {variant: this.policyDetails.pocBased, manning_agency_id: this.allCustomerDetailsSingle.customerDetails.customerId, agent_id: this.allCustomerDetailsSingle.customerDetails.agentCode, product_detail_id: this.policyDetails.productId, term_in_month: this.policyDetails.termInMonth}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
          result => {
            if(result.msg == "0"){
              Swal.fire({
                  type: 'warning',
                  title: 'Oops...',
                  text: 'No Premium setup retrieved.'
                });
                this.policyDetails.termInMonth = "";
                this.policyDetails.premiumAmount = "";
                this.policyDetails.premiumAmountId = "";
            }else{
              this.policyDetails.premiumAmount = result.msg[0].premiumAmount;
              this.policyDetails.premiumAmountId = result.msg[0].premiumAmountId;

              let param =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.policyDetails.productId}};

              this.subscription.add(this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
                  result => {
                    this.productCoveragesList = result.msg;
                    this.spinner.hide();
                  }
                ));
              
            }

            this.spinner.hide();
          }
        ));

    }



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

    let param =  {"action": "select-product-by-subline", "values": {"sublineDetailId" : this.policyDetails.sublineId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {

          this.productList = result.msg;
          this.spinner.hide();

        }
      ));

  }

  enableDisableIssuance(type: String){

    let param =  {action: "update-enable-disable-issuance", values: {status_id: type,policy_id: this.allCustomerDetailsSingle.customerDetails.policyId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {

          if(result.status == "1"){

            $("#addCustomerSuccess").removeClass("hidden");
            $("#addCustomerSuccess").addClass("show");
            this.addCustomerNotice = "Successful update of Master Policy.";
            this.previousPage = "";
            this.templateRouter = "initialize";
            this.initialChoosePolicyType();

          }else{
            alert("Something went wrong. Please try again.");
          }

        }
      ));

  }

  requestCancellation(){
    let param =  {action: "select-cancellation-reason", values: {}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.cancellationReasonList = result.msg;

        this.inboxDetails = [];
        this.inboxRemarks = new InboxRemarks();

        let temp = new InboxDetails();
        temp.detailTypeId = '1';
        this.inboxDetails.push(temp);

        temp = new InboxDetails();
        temp.detailTypeId = '2';
        this.inboxDetails.push(temp);

        temp = new InboxDetails();
        temp.detailTypeId = '7';
        this.inboxDetails.push(temp);

        temp = new InboxDetails();
        temp.detailTypeId = '8';
        this.inboxDetails.push(temp);

      }

    ));
  }

  requestEndorsement(){
    
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Send',
      showCancelButton: true
    }).queue([
      {
        title: 'Request for Endorsement',
        text: "Please enter details of request"
      }
    ]).then((result) => {
      if (result.value) {
        if(result.value[0] == ""){

          Swal.fire(
            'Endorsement Details',
            "Please enter details of request.",
            'error'
          );

        }else{

          this.inboxDetails = [];
          let temp = new InboxDetails();
          temp.detailTypeId = '9';
          temp.detailValue = result.value[0];
          this.inboxDetails.push(temp);

          temp = new InboxDetails();
          temp.detailTypeId = '2';
          temp.detailValue = this.allCustomerDetailsSingle.customerDetails.policyId;
          this.inboxDetails.push(temp);

          this.inboxRemarks = new InboxRemarks();
          this.inboxRemarks.description = "For endorsement approval.";
          this.inboxRemarks.fromUserId = this.auth.getUserDetails().userId;
          this.inboxRemarks.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

          this.inboxHeader.requestTypeId = "3";
          
          this.inboxHeader.requestorUserId = this.auth.getUserDetails().userId;
          this.inboxHeader.requestorRoleId = this.auth.getUserRole();
          this.inboxHeader.approverUserId = "0";
          this.inboxHeader.approverRoleId = "2";
          this.inboxHeader.requestStatusId = "1";
          this.inboxHeader.distributionTypeId = "1";
          this.inboxHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
          this.inboxHeader.dateModified = m().format('YYYY/MM/DD HH:mm:ss');

          let param =  {action: "insert-inbox-request", values: {inboxHeader: this.inboxHeader, inboxDetails: this.inboxDetails, inboxRemarks: this.inboxRemarks}};
              this.spinner.show();
          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
          result => {

              if(result.status == "1"){

                  Swal.fire(
                    'Success!',
                    "Successful request for endorsement of POC Issuance.",
                    'success'
                  );

                }else{
                  alert("Something went wrong. Please try again.");
                }

              this.spinner.hide();

            this.previousPage = "";
            this.templateRouter = "initialize";
            this.initialChoosePolicyType();
            this.policyDetails = new PolicyDetails();
            this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
            this.inboxDetails = [];
            this.finalBeneficiaryList = [];

            
          }

        ));

        }

        

      }
    });

  }

  submitUnderwriting(policyId: string, type: String){
    let spl = this.policyDetails.customerId.split(":=:");
    this.policyDetails.customerId = spl[0];
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
        temp.detailValue = (this.customerBirthday).toString();
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
        temp.detailValue = spl[1];
        this.inboxDetails.push(temp);
      }

      let temp = new InboxDetails();
        temp.detailTypeId = '2';
        temp.detailValue = policyId;
        this.inboxDetails.push(temp);

      this.inboxRemarks = new InboxRemarks();
      this.inboxRemarks.description = "For underwriting approval.";
      this.inboxRemarks.fromUserId = this.auth.getUserDetails().userId;
      this.inboxRemarks.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

      this.inboxHeader.requestTypeId = "2";
      
      this.inboxHeader.requestorUserId = this.auth.getUserDetails().userId;
      this.inboxHeader.requestorRoleId = this.auth.getUserRole();
      this.inboxHeader.approverUserId = "0";
      this.inboxHeader.approverRoleId = "2";
      this.inboxHeader.requestStatusId = "1";
      this.inboxHeader.distributionTypeId = "1";
      this.inboxHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
      this.inboxHeader.dateModified = m().format('YYYY/MM/DD HH:mm:ss');
      let pocStatus = "7";

      if(type == "draft"){
        pocStatus = "1";
        this.inboxHeader.requestStatusId = "6";
      }

      let paramUpdate =  {action: "update-policy-status", values: {status_id: pocStatus, policy_id: policyId}};
      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramUpdate).subscribe(
          result => {

            let param =  {action: "insert-inbox-request", values: {inboxHeader: this.inboxHeader, inboxDetails: this.inboxDetails, inboxRemarks: this.inboxRemarks}};
            this.spinner.show();
              this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
              result => {

                if(type !== "draft"){
                  if(result.status == "1"){

                      Swal.fire(
                        'Success!',
                        "Successful request for underwriting approval of POC Issuance.",
                        'success'
                      );

                    }else{
                      alert("Something went wrong. Please try again.");
                    }

                }else{
                  this.spinner.hide();
                }

                this.previousPage = "";
                this.templateRouter = "initialize";
                $("#closeAlertCancellation").trigger("click");
                this.initialChoosePolicyType();
                this.policyDetails = new PolicyDetails();
                this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
                this.inboxDetails = [];
                this.finalBeneficiaryList = [];

                
              }

            ));

          }
        ));

    }else{
      this.policyDetails = new PolicyDetails();
      this.policyDetails.effectivityDate = m().format('YYYY-MM-DD');
      this.finalBeneficiaryList = [];
    }

  }

  requestCancellationSubmit(){
    

    let message = [];
    let proceed = "1";
    let endingMessage = "";

    if(!this.inboxDetails[0].detailValue){
      message.push("Cancellation Reason");
      proceed = "0";
    }

    if(!this.inboxDetails[3].detailValue){
        message.push("Attachment Provided");
        proceed = "0";
    }

    if(!this.inboxDetails[2].detailValue){
      message.push("Requested By");
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
        title: 'Incomplete Request Details',
        text: finalMessage
      })

    }else{

      Swal.fire({
      title: 'Request for Cancellation',
      text: "You're about to request cancellation of this POC, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (result.value) {

        this.inboxDetails[1].detailValue = this.allCustomerDetailsSingle.customerDetails.policyId;

        this.inboxRemarks.fromUserId = this.auth.getUserDetails().userId;
        this.inboxRemarks.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

        this.inboxHeader.requestTypeId = "1";
        this.inboxHeader.requestStatusId = "1";
        this.inboxHeader.requestorUserId = this.auth.getUserDetails().userId;
        this.inboxHeader.requestorRoleId = this.auth.getUserRole();
        this.inboxHeader.approverUserId = "0";
        this.inboxHeader.approverRoleId = "4";
        this.inboxHeader.distributionTypeId = "1";
        this.inboxHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
        this.inboxHeader.dateModified = m().format('YYYY/MM/DD HH:mm:ss');

        let statusId = '6';

        if(this.allCustomerDetailsSingle.customerDetails.policyStatusId == '3'){
          statusId = '10';
        }
        if(this.inboxDetails[0].detailValue == "6" && !this.inboxRemarks.description){

            Swal.fire(
              'Remark',
              "Remark is required when Others is choosen.",
              'error'
            );


        }else if(this.inboxDetails[0].detailValue == "6" && this.inboxRemarks.description == ""){

            Swal.fire(
              'Remark',
              "Remark is required when Others is choosen.",
              'error'
            );

        }else{

          let param =  {action: "insert-inbox-request", values: {policyStatusId: statusId,inboxHeader: this.inboxHeader, inboxDetails: this.inboxDetails, inboxRemarks: this.inboxRemarks}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
          result => {

            if(result.status == "1"){

                this.previousPage = "";
                this.templateRouter = "initialize";
                $("#closeAlertCancellation").trigger("click");
                this.initialChoosePolicyType();

                Swal.fire(
                  'Success!',
                  'Your request successfully submitted.',
                  'success'
                )

                this.inboxDetails = [];

                let temp = new InboxDetails();
                temp.detailTypeId = '1';
                this.inboxDetails.push(temp);

                temp = new InboxDetails();
                temp.detailTypeId = '2';
                this.inboxDetails.push(temp);

                temp = new InboxDetails();
                temp.detailTypeId = '7';
                this.inboxDetails.push(temp);

                temp = new InboxDetails();
                temp.detailTypeId = '8';
                this.inboxDetails.push(temp);

              }else{
                alert("Something went wrong. Please try again.");
              }

          }

        ));

        }

        

        
      }
    });

    }

    

    

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

            }

          ));
        break;
      
      case "4":
          let isRetro = m().isAfter(this.policyDetails.effectivityDate, 'day');
            this.policyDetails.retroUW = "0";
            if(!isRetro){
              $("#retro-error").addClass("hidden");
              this.policyDetails.retroUW = "0";
            }else{
              $("#retro-error").removeClass("hidden");
              this.policyDetails.retroUW = "1";
            }

      break;

      default:
        // code...
        break;
    }

  }

  backPage(previousPage : String){

      this.templateRouter = this.previousPage;
      this.previousPage = previousPage;

  }



}
