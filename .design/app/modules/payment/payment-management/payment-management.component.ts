import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit,OnDestroy, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Customer} from '../../../objects/customer';
import {PolicyStatus} from '../../../objects/policy-status';
import {PocSoa} from '../../../objects/poc-soa';
import {PaymentPolicies} from '../../../objects/payment-policies';
import {PaymentPolicyHeader} from '../../../objects/payment-policy-header';
import {PaymentPolicyDetail} from '../../../objects/payment-policy-details';
import {PaymentModeDetail} from '../../../objects/payment-mode-detail';
import {PaymentFormDetail} from '../../../objects/payment-form-detail';
import {PphPaymentDetails} from '../../../objects/pph-payment-details';
import {AuthService} from '../../../services/auth.service';
import {PolicyDetails} from '../../../objects/policy-details';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import {AllCustomerDetails} from '../../../objects/all-customer-details';
import {Bank} from '../../../objects/bank';
import {Currency} from '../../../objects/currency';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.css']
})
export class PaymentManagementComponent implements OnInit, ComponentCanDeactivate,OnDestroy {

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,
private auth: AuthenticationService,private caller : AuthService,private router: Router,
    private spinner: NgxSpinnerService) {this.__componentInspectorService.getComp(this);
 }

  private subscription: Subscription = new Subscription();

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  paymentManagementSuccess: String;
  policyStatus: String;
  masterPolicy: String;
  customerList : AllCustomerDetails[];
  agentList : AllCustomerDetails[];
  manningAgencyList : AllCustomerDetails[];
  previewPolicy : PolicyDetails[];
  pocSoaList : Customer[];
  pocSoaFinalList : PocSoa[];
  PPDetail : PaymentPolicyDetail[];
  PPForPrinting : PaymentPolicies[];
  tempSoa: PocSoa;
  PPHeader: PaymentPolicyHeader;
  templateRouter: String;
  previousPage: String;
  searchReferenceCode: String;
  updatePPHeader: PaymentPolicyHeader;
  newPphPaymentDetails: PphPaymentDetails;
  pphPaymentDetailsList: PphPaymentDetails[];
  paymentMgmt: String;
  pageSize: string;
  pocPageSize: string;
  PPHeaderFilter: PaymentPolicyHeader;
  pageLength: String[];
  pocPageLength: String[];
  bankList: Bank[];
  currencyList: Currency[];
  totalPHP: number;
  totalPayablePHP: number;
  totalUSD: number;
  totalPayableUSD: number;
  pocCurrentPage: number;
  currentPage: number;
  displayAmount: string;

  PPHeaderSelectList: PaymentPolicyHeader[];
  statusList : PolicyStatus[];
  paymentFormList : PaymentFormDetail[];
  paymentModeList : PaymentModeDetail[];
  userType: String;
  userRole: String;
  masterPolicyList: PolicyDetails[];

  ngOnInit() {

    this.paymentManagementSuccess = "";
    this.totalPayablePHP = 0;
    this.totalPayableUSD = 0;
    this.totalUSD = 0;
    this.totalPHP = 0;
    this.displayAmount = "USD";
    this.policyStatus = "";
  	this.masterPolicy = "";
    this.pageSize = "10";
    this.pocPageSize = "10";
    this.currencyList = [];
    this.PPForPrinting = [];
    this.previewPolicy = [];
    this.pocSoaList = [];
    this.bankList = [];
    this.pageLength = [];
    this.pocPageLength = [];
    this.masterPolicyList = [];
    this.PPDetail = [];
    this.customerList = [];
    this.pocSoaFinalList = [];
    this.PPHeaderSelectList = [];
    this.pphPaymentDetailsList = [];
    this.PPHeader = new PaymentPolicyHeader();
    this.PPHeaderFilter = new PaymentPolicyHeader();
    this.updatePPHeader = new PaymentPolicyHeader();
    this.newPphPaymentDetails = new PphPaymentDetails();
    this.userRole = this.auth.getUserRole();
    this.previousPage = "";
    this.searchReferenceCode = "";
    this.paymentMgmt = "";
    this.manningAgencyList = [];
    this.agentList = [];
    this.PPHeaderFilter.manningAgencyId = "0";

    this.templateRouter = "ma-initialize";
    this.spinner.show();
    let paramAgents = '3';

      if(this.auth.getUserType() == "ICA"){
        this.PPHeaderFilter.agentId = this.auth.getUserDetails().customerId;
        this.initialChooseAgentFilter();
      }else{
        paramAgents += ",O-";

        this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", paramAgents, '0', '1000').subscribe(
        result => {
          this.agentList = result;
          this.PPHeaderFilter.agentId = this.agentList[0].customerDetails.customerId;
          this.spinner.hide();
        }
        ));

      }

      let param2 =  {action: "select-all-policy-status", values: {}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
          result => {
            this.statusList = result.msg;
          }
        ));


      let param3 =  {action: "select-all-master-policies", values: {"customer_id": this.auth.getUserDetails().customerId}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param3).subscribe(
          result => {
            this.masterPolicyList = result.msg;
          }
        ));

    
    this.subscription.add(this.caller.doCallService("/payment/select-all-payment-form", "").subscribe(
      result => { 

        this.paymentFormList = result;

      }
      ));

    this.subscription.add(this.caller.doCallService("/payment/select-all-payment-mode", "").subscribe(
      result => { 

        this.paymentModeList = result;

      }
      ));

    this.spinner.hide();

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  selectAgent(){
    let param =  {action: "select-ma-by-agent", values: {"agent_id": this.PPHeaderFilter.agentId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.manningAgencyList = result.msg;
        }));
  }

  openApprovePayment(pph: PaymentPolicyHeader){
    this.updatePPHeader = pph;
    this.newPphPaymentDetails = new PphPaymentDetails();
    this.newPphPaymentDetails.paymentPolicyHeaderId = pph.paymentPolicyHeaderId;
    this.newPphPaymentDetails.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
    this.spinner.show();
    let currency = "";
    this.subscription.add(this.caller.doCallService("/payment/select-all-payment-details-by-header", this.updatePPHeader.paymentPolicyHeaderId).subscribe(
      result => {

        this.pphPaymentDetailsList = result;
        this.totalPHP = 0;
        this.totalUSD = 0;
        $("#currency-chooser").removeAttr("disabled","disabled");

          for(let i = 0; i < this.pphPaymentDetailsList.length; i++){
            this.pphPaymentDetailsList[i].dateAdded = m(this.pphPaymentDetailsList[i].dateAdded).format(this.auth.getDateFormat());
            currency = this.pphPaymentDetailsList[i].currency;
            
            if("PHP" == this.pphPaymentDetailsList[i].currency){
              this.totalPHP += parseFloat(this.pphPaymentDetailsList[i].amount);
              this.displayAmount = "PHP";
            }else{
              this.totalUSD += parseFloat(this.pphPaymentDetailsList[i].amount);
              this.displayAmount = "USD";
            }
            this.newPphPaymentDetails.currency = this.pphPaymentDetailsList[i].currencyId;
            $("#currency-chooser").attr("disabled","disabled");

          }

          let param1 =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};

            this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param1).subscribe(
                resulta => {
                  this.previewPolicy = resulta.msg;
                  this.totalPayablePHP = 0;
                  this.totalPayableUSD = 0;
                  this.PPDetail = resulta.msg;
                  for(let i = 0; i < this.previewPolicy.length; i++){

                      if(this.previewPolicy[i].policyStatusId == "8" || this.previewPolicy[i].policyStatusId == "9"){
                        this.totalPayablePHP += -Math.abs(parseFloat(parseFloat(this.previewPolicy[i].premiumAmount).toFixed(2)) * parseFloat(parseFloat(this.previewPolicy[i].exchangeRate).toFixed(2))).toFixed(2);
                        this.totalPayableUSD += -Math.abs(parseFloat(parseFloat(this.previewPolicy[i].premiumAmount).toFixed(2)));
                      }else{
                        this.totalPayablePHP += parseFloat(parseFloat(this.previewPolicy[i].premiumAmount).toFixed(2)) * parseFloat(parseFloat(this.previewPolicy[i].exchangeRate).toFixed(2));
                        this.totalPayableUSD += parseFloat(parseFloat(this.previewPolicy[i].premiumAmount).toFixed(2));
                      }

                  }
 
                  this.totalPayablePHP = parseFloat((this.totalPayablePHP).toFixed(2));

                  if(currency == "PHP"){
                    if(this.totalPHP >= this.totalPayablePHP){
                      $("#approve-payment-btn").removeClass("hidden");
                    }else{
                      $("#approve-payment-btn").addClass("hidden");
                    }
                  }else{
                    if(this.totalUSD >= this.totalPayableUSD){
                      $("#approve-payment-btn").removeClass("hidden");
                    }else{
                      $("#approve-payment-btn").addClass("hidden");
                    }
                  }  

                  this.spinner.hide();
                }
              ));

          

      }
    ));

    let param =  {action: "select-currency", values: ""};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
      result => {
        this.currencyList = result.msg;
      }
    ));

    param =  {action: "select-bank", values: ""};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
      result => {
        this.bankList = result.msg;
      }
    ));


  }

  addPayment(){
    

    let message = [];
    let proceed = "1";
    let endingMessage = "";

    if(!this.newPphPaymentDetails.currency){

      message.push("Currency");
      proceed = "0";

    }

    if(!this.newPphPaymentDetails.amount){
        message.push("Amount");
        proceed = "0";
    }

    if(!this.newPphPaymentDetails.paymentForm){

      message.push("Payment Form");
      proceed = "0";

    }else{
      
      if(this.newPphPaymentDetails.paymentForm == "1"){//cheque

        if(!this.newPphPaymentDetails.chequeNumber){
          message.push("Cheque Number");
          proceed = "0";
        }

        if(!this.newPphPaymentDetails.bank){
          message.push("Bank");
          proceed = "0";
        }

      }else if(this.newPphPaymentDetails.paymentForm == "2"){//cash

      }else{//bank deposit

        if(!this.newPphPaymentDetails.bank){
          message.push("Bank");
          proceed = "0";
        }


      }

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
        title: 'Incomplete Payment Details',
        text: finalMessage
      })

    }else{

      this.spinner.show();

      this.subscription.add(this.caller.doCallService("/payment/insertNewPph", {PphPaymentDetails: this.newPphPaymentDetails}).subscribe(
      result => {
      this.subscription.add(this.caller.doCallService("/payment/select-all-payment-details-by-header", this.updatePPHeader.paymentPolicyHeaderId).subscribe(
    result => {
          this.pphPaymentDetailsList = result;
          this.newPphPaymentDetails = new PphPaymentDetails();
          this.newPphPaymentDetails.paymentPolicyHeaderId = this.updatePPHeader.paymentPolicyHeaderId;
          this.newPphPaymentDetails.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
          this.totalPHP = 0;
          this.totalUSD = 0;
          let currency = "";
          $("#currency-chooser").removeAttr("disabled","disabled");
          for(let i = 0; i < this.pphPaymentDetailsList.length; i++){
            this.pphPaymentDetailsList[i].dateAdded = m(this.pphPaymentDetailsList[i].dateAdded).format(this.auth.getDateFormat());
            currency = this.pphPaymentDetailsList[i].currency;
            
            if("PHP" == this.pphPaymentDetailsList[i].currency){
              this.totalPHP += parseFloat(this.pphPaymentDetailsList[i].amount);
            }else{
              this.totalUSD += parseFloat(this.pphPaymentDetailsList[i].amount);
            }
            currency = this.pphPaymentDetailsList[i].currency;
            this.newPphPaymentDetails.currency = this.pphPaymentDetailsList[i].currencyId;
            $("#currency-chooser").attr("disabled","disabled");

          }

          if(currency == "PHP"){
            if(this.totalPHP >= this.totalPayablePHP){
              $("#approve-payment-btn").removeClass("hidden");
            }else{
              $("#approve-payment-btn").addClass("hidden");
            }
            
          }else{
            if(this.totalUSD >= this.totalPayableUSD){
              $("#approve-payment-btn").removeClass("hidden");
            }else{
              $("#approve-payment-btn").addClass("hidden");
            }
          }  

          this.spinner.hide();

        }
      ));
    }
  ));

    }


    
  }

  approvePayment(){
    this.updatePPHeader.dateCompleted = m().format('YYYY/MM/DD HH:mm:ss');
    this.updatePPHeader.paymentPolicyStatusId = "2";
    this.updatePPHeader.paymentPostedById = this.auth.getUserDetails().userId;
    this.spinner.show();
    this.subscription.add(this.caller.doCallService("/payment/updateSOARequest", {PaymentPolicyHeader: this.updatePPHeader}).subscribe(
      result => {
        if(result == "1"){
          this.paymentMgmt = "Success approval of SOA request.";
          $('#content').animate({ scrollTop: 0 }, 'slow');
          $("#paymentMgmt").removeClass("hidden");
          $("#paymentMgmt").addClass("show");
          $("#modalApprovePayment").trigger("click");
          this.spinner.hide();
          this.initialViewRequest();


          let paramPaid =  {action: "update-policy-status-paid", values: {PaymentPolicyDetails: this.PPDetail}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramPaid).subscribe(
              resulta => {
                
                if(resulta.status == "1"){

                  this.customerList = [];
                  this.pocSoaList = [];
                  let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'payment',"pph" : this.PPHeaderFilter}};

                  this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
                    resulta => {
                      this.customerList = resulta.msg;
                    }
                  ));

                }
                

              }
            ));

        }

        

      }
    ));

  }

  cancelPph(pph: PaymentPolicyHeader){

    Swal.fire({
      title: 'Request Payment',
      text: "Are you sure you want to cancel Payment Request reference number " + pph.referenceCode + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.value) {

        this.spinner.show();
        this.updatePPHeader = pph;
        this.updatePPHeader.dateCompleted = m().format('YYYY/MM/DD HH:mm:ss');
        this.updatePPHeader.paymentPolicyStatusId = "3";
        this.subscription.add(this.caller.doCallService("/payment/updateSOARequest", {PaymentPolicyHeader: this.updatePPHeader}).subscribe(
          result => {
            if(result == "1"){

              Swal.fire(
                'Deleted!',
                "Success cancellation of REM request " + pph.referenceCode,
                'success'
              );

              $('#content').animate({ scrollTop: 0 }, 'slow');
              this.initialViewRequest();

            }

            

          }
        ));

        
      }
    });

      
    

  }


  searchRC(){

    this.initialViewRequest();

  }

  backPage(previousPagee : String){
    
    this.templateRouter = this.previousPage;
    this.previousPage = previousPagee;
    this.pocSoaList = [];
  }

  initialViewRequest(){
    this.spinner.show();
    let task = "SRC,1," + this.searchReferenceCode;

    if(this.searchReferenceCode == ""){
      task = "SIC,1,";

      if(this.auth.getUserType() == "MA"){
        task = "SMA,1," + this.auth.getUserDetails().manningAgencyId;
      }else if(this.auth.getUserType() == "ICA"){
        task = "SICA,1," + this.auth.getUserDetails().customerId;
      }

    }

    let paramSub = {"targetEntity" : "payment",
                    "methodToBeCalled" : "",
                    "delimitedParams" : task,
                    "pageSize" : this.pageSize};

      this.subscription.add(this.caller.doCallService("/payment/get-total-page-count", paramSub).subscribe(
        result => { 
          this.pageLength = [];
          if(result == "0"){
            this.pageLength.push("1");
          }else{

            for(let i = 0; i < parseInt(result); i++){
              this.pageLength.push((i + 1).toString());
            }

          }
          this.spinner.hide();
          this.viewRequest("0");

        }
      ));

  }

  viewRequest(pageNumber: string){
    
    this.previousPage = this.templateRouter;
    this.templateRouter = "view-requests";
    this.currentPage = parseInt(pageNumber) + 1;
    this.spinner.show();
    let task = "SRC,1," + this.searchReferenceCode;

    if(this.searchReferenceCode == ""){
      task = "SIC,1,";

      if(this.auth.getUserType() == "MA"){
        task = "SMA,1," + this.auth.getUserDetails().manningAgencyId;
      }else if(this.auth.getUserType() == "ICA"){
        task = "SICA,1," + this.auth.getUserDetails().customerId;
      }

    }

      this.subscription.add(this.caller.callPaginated("/payment/select-all-payment-request-by-reference-code", task, pageNumber, this.pageSize).subscribe(
        result => { 

          this.PPHeaderSelectList = result;

          for(let i = 0; i < this.PPHeaderSelectList.length; i++){
            this.PPHeaderSelectList[i].dateAdded = m(this.PPHeaderSelectList[i].dateAdded).format(this.auth.getDateFormat());
            if(this.PPHeaderSelectList[i].dateCompleted){
              this.PPHeaderSelectList[i].dateCompleted = m(this.PPHeaderSelectList[i].dateCompleted).format(this.auth.getDateFormat());
            }
          }

          this.spinner.hide();

        }
      ));

  }

  beforePrint(){

    let proceed = true;
    for(let i = 0; i < this.pocSoaList.length; i++){
      if(!this.pocSoaList[i].exchangeRate){
        proceed = false;
        break;
      }
    }
    if(!proceed){
      this.paymentMgmt = "Please complete setup of exchange rate before submission of SOA.";
      $("#paymentMgmt").addClass("show");
      $("#paymentMgmt").removeClass("hidden");
    }else{

      let additio = "";

      if(this.auth.getUserRole() == "4"){
        additio = " And since you're an Admin, it will be automatically approved.";
      }else if(this.auth.getUserRole() == "8"){
        additio = " And since you're a Cashier, it will be automatically approved.";
      }else if(this.auth.getUserRole() == "9"){
        additio = " And since you're a Super User, it will be automatically approved.";
      }

      Swal.fire({
        title: 'Payment Request',
        text: "Are you sure you want to Submit this Remittance Request?" + additio,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proceed'
      }).then((result) => {
        if (result.value) {

        this.spinner.show();

        this.submitSoaRequest();

        this.spinner.hide();
        

        }
      });

    }

  }

  addToSOA(customerDetail: Customer){

    this.spinner.show();

    const index: number = this.pocSoaList.indexOf(customerDetail);

    if (index !== -1) {
      this.pocSoaList.splice(index, 1);
    }else{
      this.pocSoaList.push(customerDetail);
    }
    this.spinner.hide();

  }

  submitSoaRequest(){

    this.spinner.show();
    this.PPDetail = [];
    let agentCode = "";
    let masterPolicyNumber = "";
    let masterPolicyName = "";
    let masterPolicyId = "";
    let totalAmount : number = 0;

    for(let i = 0; i < this.pocSoaList.length; i++){

        let ppTemp = new PaymentPolicyDetail();
        ppTemp.policyId = this.pocSoaList[i].policyId;
        ppTemp.premium = (parseFloat(this.pocSoaList[i].premiumAmount) * parseFloat(this.pocSoaList[i].exchangeRate)).toString();


        if(this.pocSoaList[i].policyStatusId == "8"){
          ppTemp.premium = (-Math.abs(parseFloat(this.pocSoaList[i].premiumAmount) * parseFloat(this.pocSoaList[i].exchangeRate))).toString();
        }
        totalAmount = parseFloat(totalAmount.toString()) + parseFloat(ppTemp.premium);
        
        this.PPDetail.push(ppTemp);

        agentCode = this.pocSoaList[i].agentCode;
        masterPolicyNumber = this.pocSoaList[i].masterPolicyNumber;
        masterPolicyName = this.pocSoaList[i].masterFullName;
        masterPolicyId = this.pocSoaList[i].masterPolicyId;
    }

    if(totalAmount < 0){
      Swal.fire(
        'Premium Amount',
        'Total Premium amount should not be lower than 0.',
        'warning'
      );
    }else{

      this.PPHeader.masterPolicyId = masterPolicyId;
      this.PPHeader.agentId = agentCode;
      this.PPHeader.paymentForm = "0";
      this.PPHeader.paymentMode = "0";
      this.PPHeader.requestTypeId = "1";
      this.PPHeader.paymentPolicyStatusId = "1";
      this.PPHeader.paymentPostedById = "0";

      // if(this.auth.getUserRole() == "4" || this.auth.getUserRole() == "8" || this.auth.getUserRole() == "9"){
      //   this.PPHeader.paymentPolicyStatusId = "2";
      //   this.PPHeader.paymentPostedById = this.auth.getUserDetails().userId;
      //   this.PPHeader.dateCompleted = m().format('YYYY/MM/DD HH:mm:ss');
      // }

      this.PPHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
      let pmc = this;
      this.subscription.add(this.caller.doCallService("/payment/insertSOARequest", {PaymentPolicyHeader: this.PPHeader, PaymentPolicyDetails: this.PPDetail}).subscribe(
        result => {

          let finalSoa = JSON.parse(result.header);
          this.printAgain(finalSoa);

          this.pocSoaList = [];

          if(this.auth.getUserRole() == "4" || this.auth.getUserRole() == "8" || this.auth.getUserRole() == "9"){

            let paramPaid =  {action: "update-policy-status-paid", values: {PaymentPolicyDetails: this.PPDetail}};

            this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramPaid).subscribe(
                result => {
                  
                  if(result.status == "1"){

                    this.customerList = [];
                    this.pocSoaList = [];
                    let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'payment',"pph" : this.PPHeaderFilter}};

                    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
                      result => {
                        this.customerList = result.msg;
                      }
                    ));

                  }
                  

                }
              ));

          }else{

            this.customerList = [];
            this.pocSoaList = [];
            let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'payment',"pph" : this.PPHeaderFilter}};

            this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
              result => {
                this.customerList = result.msg;
              }
            ));

          }

          this.spinner.hide();

        }
      ));

    }

    

  }

  printAgain(pph: PaymentPolicyHeader){
    this.spinner.show();
    let param =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.spinner.show();
          this.pocSoaFinalList = [];
          this.PPDetail = [];
          this.PPHeader = new PaymentPolicyHeader();
          let agentCode = "";
          let masterPolicyNumber = "";
          let masterPolicyName = "";
          let agentName = "";
          let agentEmail = "";

          let uniqs = _.uniqBy(result.msg, 'masterPolicyNumber');
          let tempSoa = [];
          for(let i = 0; i < uniqs.length; i++){
            let tempiSoa = [];

            for(let x = 0; x < result.msg.length; x++){
              if(uniqs[i].masterPolicyNumber == result.msg[x].masterPolicyNumber){
                tempiSoa.push(result.msg[x]);
              }
            }

            tempSoa.push(tempiSoa);

          }
          this.PPForPrinting = [];
          let totalGrossDollars = 0;
          let totalGrossPhp = 0;
          let totalNetDollars = 0;
          let totalNetPhp = 0;

          for(let i = 0; i < tempSoa.length; i++){
            this.pocSoaFinalList = [];
            for(let x = 0; x < tempSoa[i].length; x++){
              this.tempSoa = new PocSoa;
              this.tempSoa.itemNo = tempSoa[i][x].soaSequence;
              this.tempSoa.policyHolder = tempSoa[i][x].fullName;
              this.tempSoa.pocNo = tempSoa[i][x].policyNumber;
              this.tempSoa.productVariant = tempSoa[i][x].pocBased + "-" + tempSoa[i][x].coverageTermInMonth;
              this.tempSoa.dateIssued = m(tempSoa[i][x].effectivityDate).format(this.auth.getDateFormat());

              this.tempSoa.grossPremiumOthers = (parseFloat(tempSoa[i][x].premiumAmount).toFixed(2)).toString();
              this.tempSoa.netPremiumOthers = (parseFloat(tempSoa[i][x].netAmount).toFixed(2)).toString();
              this.tempSoa.exchangeRate = (parseFloat(tempSoa[i][x].exchangeRate).toFixed(2)).toString();
              this.tempSoa.grossPremiumPhp = ((parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate)).toFixed(2)).toString();
              this.tempSoa.netPremiumPhp = ((parseFloat(this.tempSoa.netPremiumOthers) * parseFloat(this.tempSoa.exchangeRate)).toFixed(2)).toString();

              if(tempSoa[i][x].policyStatusId == "8"){

                this.tempSoa.grossPremiumOthers = ((-Math.abs(parseFloat(parseFloat(tempSoa[i][x].premiumAmount).toFixed(2)))).toFixed(2)).toString();
                this.tempSoa.netPremiumOthers = ((-Math.abs(parseFloat(parseFloat(tempSoa[i][x].netAmount).toFixed(2)))).toFixed(2)).toString();
                this.tempSoa.grossPremiumPhp = ((-Math.abs((parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate))).toFixed(2)).toFixed(2)).toString();
                this.tempSoa.netPremiumPhp = ((-Math.abs((parseFloat(this.tempSoa.netPremiumOthers) * parseFloat(this.tempSoa.exchangeRate))).toFixed(2)).toFixed(2)).toString();
                
              }

              totalGrossDollars = totalGrossDollars + parseFloat(this.tempSoa.grossPremiumOthers);
              totalGrossPhp = (totalGrossPhp) + parseFloat(this.tempSoa.grossPremiumPhp);
              totalNetDollars = (totalNetDollars) + parseFloat(this.tempSoa.netPremiumOthers);
              totalNetPhp = (totalNetPhp) + parseFloat(this.tempSoa.netPremiumPhp);

              this.pocSoaFinalList.push(this.tempSoa);

              agentCode = tempSoa[i][x].agentCode;
              masterPolicyNumber = tempSoa[i][x].masterPolicyNumber;
              masterPolicyName = tempSoa[i][x].masterFullName;
              agentName = tempSoa[i][x].agentFullName;
              agentEmail = tempSoa[i][x].agentEmail;

            }
            let tempPPForPrinting = new PaymentPolicies();
            tempPPForPrinting.manningAgency = masterPolicyName;
            tempPPForPrinting.masterPolicyNumber = masterPolicyNumber;
            tempPPForPrinting.intermediaryCode = agentCode;
            tempPPForPrinting.soaNo = pph.referenceCode;
            tempPPForPrinting.dateGenerated = m().format(this.auth.getDateFormat());
            tempPPForPrinting.pocs = this.pocSoaFinalList;
            this.PPForPrinting.push(tempPPForPrinting);

          }

          let soaForPrint = {
            reportLogos : ['phBankAssurance1.png'],
            reportCode : 'Remittance',
            reportFileName : pph.referenceCode,
            totalGrossDollars : totalGrossDollars.toFixed(2).toString(),
            totalGrossPhp : totalGrossPhp.toFixed(2).toString(),
            totalNetDollars : totalNetDollars.toFixed(2).toString(),
            totalNetPhp : totalNetPhp.toFixed(2).toString(),
            policies : this.PPForPrinting
          };
        
        this.subscription.add(this.caller.generatePDF(soaForPrint).subscribe(result => {

          

          let fileNameDelete : String = pph.referenceCode + ".pdf";
          this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
            resultend => {
              this.spinner.hide();
            }
          ));

        }));

        }
      ));

  }

  emailRem(pph: PaymentPolicyHeader){

    this.spinner.show();
    let param =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.spinner.show();
          let agentName = "";
          let agentEmail = "";
          for(let i = 0; i < result.msg.length; i++){
              agentName = result.msg[i].agentFullName;
              agentEmail = result.msg[i].agentEmail;
          }

          let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ agentName +"</b>,</p><p>Please see attached remittance report as requested.</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

          let paramEmail =  {toName: agentName,file_name: pph.referenceCode + ".pdf", to: agentEmail, subject: "Remittance Request for REM No. " + pph.referenceCode, body: mailBody};
          this.spinner.show();

          if(!agentEmail){
            Swal.fire(
              'Email Not Found.',
              'Email for agent ' + agentName + ' were not found, please send it manually.',
              'error'
            );
            this.spinner.hide();
          }else{

            this.subscription.add(this.caller.doCallService("/digitalinnomailer/", paramEmail).subscribe(
              result => {
                

                let fileNameDelete : String = pph.referenceCode + ".pdf";
                this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
                  resultend => {
                    this.spinner.hide();
                    Swal.fire(
                      'Success!',
                      'Email for agent ' + agentName + ' were successfully sent to ' + agentEmail,
                      'success'
                    );
                    
                  }
                ));
                
                
              }
            ));

          }



        }
      ));

    
  }

  initialChooseAgentFilter(){

    if(this.PPHeaderFilter.agentId || this.PPHeaderFilter.manningAgencyId){
      this.spinner.show();
      this.customerList = [];
      this.pocSoaList = [];
      let param =  {action: "select-customer-by-type", values: {"countType": 'count',"select_type": 'payment',"report_request_details" : this.PPHeaderFilter}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          let len = parseFloat(result.msg) / parseFloat(this.pocPageSize);
          let spl: string[] = len.toString().split(".");

          let fin = parseInt(spl[0]);

          if(parseInt(spl[1]) > 0){
            fin += 1;
          }

          this.pocPageLength = [];
          if(fin == 0){
            this.pocPageLength.push("1");
          }else{

            for(let i = 0; i < fin; i++){
              this.pocPageLength.push((i + 1).toString());
            }

          }
          this.spinner.hide();
          this.chooseAgentFilter("0");
        }
      ));

    }

  }

  chooseAgentFilter(pageNumber: string){

    if(this.PPHeaderFilter.agentId){
      this.pocCurrentPage = parseInt(pageNumber) + 1;
      this.spinner.show();
      this.customerList = [];
      let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'payment',"pph" : this.PPHeaderFilter}};

      this.subscription.add(this.caller.callPaginated("/digitalinnopolicyservice/?action=policy", param, pageNumber, this.pocPageSize).subscribe(
        result => {
          this.customerList = result.msg;
          for(let i = 0; i < this.customerList.length; i++){
            this.customerList[i].customerDetails.policyDateAdded = m(this.customerList[i].customerDetails.policyDateAdded).format(this.auth.getDateFormat());
          }
          this.selectAgent();
          this.spinner.hide();
        }
      ));

    }

  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

}
