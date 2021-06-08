import { Component, OnInit,OnDestroy, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Customer} from '../../../objects/customer';
import {PolicyStatus} from '../../../objects/policy-status';
import {PocSoa} from '../../../objects/poc-soa';
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
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import {ExcelService} from '../../../services/excel.service';

@Component({
  selector: 'app-soa-management',
  templateUrl: './soa-management.component.html',
  styleUrls: ['./soa-management.component.css']
})
export class SoaManagementComponent implements OnInit, ComponentCanDeactivate,OnDestroy {

  constructor(private auth: AuthenticationService,private caller : AuthService,private router: Router,
    private spinner: NgxSpinnerService, private excelService:ExcelService) { }

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
  pocSoaList : Customer[];
  pocSoaFinalList : PocSoa[];
  previewPolicy : PolicyDetails[];
  PPDetail : PaymentPolicyDetail[];
  manningAgencyList : AllCustomerDetails[];
  tempSoa: PocSoa;
  PPHeader: PaymentPolicyHeader;
  PPHeaderFilter: PaymentPolicyHeader;
  templateRouter: String;
  previousPage: String;
  searchReferenceCode: String;
  updatePPHeader: PaymentPolicyHeader;
  newPphPaymentDetails: PphPaymentDetails;
  pphPaymentDetailsList: PphPaymentDetails[];
  paymentMgmt: String;
  pageSize: string;
  pocPageSize: string;
  pocCurrentPage: number;
  currentPage: number;

  PPHeaderSelectList: PaymentPolicyHeader[];
  statusList : PolicyStatus[];
  paymentFormList : PaymentFormDetail[];
  paymentModeList : PaymentModeDetail[];
  userType: String;
  masterPolicyList: PolicyDetails[];
  agentList : AllCustomerDetails[];
  pageLength: String[];
  pocPageLength: String[];

  ngOnInit() {
  	this.paymentManagementSuccess = "";
    this.pageSize = "10";
    this.pocPageSize = "10";
    this.policyStatus = "";
  	this.masterPolicy = "";
    this.pocSoaList = [];
    this.pocPageLength = [];
    this.previewPolicy = [];
    this.masterPolicyList = [];
    this.pageLength = [];
    this.PPDetail = [];
    this.customerList = [];
    this.pocSoaFinalList = [];
    this.PPHeaderSelectList = [];
    this.pphPaymentDetailsList = [];
    this.agentList = [];
    this.PPHeader = new PaymentPolicyHeader();
    this.PPHeaderFilter = new PaymentPolicyHeader();
    this.updatePPHeader = new PaymentPolicyHeader();
    this.newPphPaymentDetails = new PphPaymentDetails();
    this.previousPage = "";
    this.searchReferenceCode = "";
    this.paymentMgmt = "";
    this.manningAgencyList = [];
    this.PPHeaderFilter.manningAgencyId = "0";

    this.templateRouter = "ma-initialize";
    this.spinner.show();
      let paramAgents = '3';

      if(this.auth.getUserType() == "ICA"){
        this.PPHeaderFilter.agentId = this.auth.getUserDetails().customerId;
        this.initialChooseAgentFilter();
      }else{
        paramAgents += ",O-";

        this.subscription.add(this.caller.callPaginated("/client/select-all-customer-by-type", paramAgents,"0","1000").subscribe(
        result => {
          this.agentList = result;
          this.PPHeaderFilter.agentId = this.agentList[0].customerDetails.customerId;
          this.spinner.hide();
        }
      ));

      }

      this.spinner.hide();



  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  searchRC(){

    this.initialViewRequest();

  }

  backPage(previousPage : String){
    this.templateRouter = this.previousPage;
    this.previousPage = previousPage;
  }

  addToSOA(customerDetail: Customer){

    this.spinner.show();
    const index: number = this.pocSoaList.indexOf(customerDetail);

    if (index != -1) {
      this.pocSoaList.splice(index, 1);
    }else{
      this.pocSoaList.push(customerDetail);
    }
    this.spinner.hide();


  }

  selectAgent(){
    let param =  {action: "select-ma-by-agent", values: {"agent_id": this.PPHeaderFilter.agentId}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.manningAgencyList = result.msg;
        }));
  }

  submitSoaRequest(){

    this.spinner.show();
    this.PPDetail = [];
    let agentCode = "";
    let masterPolicyNumber = "";
    let masterPolicyName = "";
    let masterPolicyId = "";


    for(let i = 0; i < this.pocSoaList.length; i++){

        let ppTemp = new PaymentPolicyDetail();
        ppTemp.policyId = this.pocSoaList[i].policyId;
        ppTemp.premium = (parseFloat(this.pocSoaList[i].premiumAmount) * parseFloat(this.pocSoaList[i].exchangeRate)).toString();

        this.PPDetail.push(ppTemp);

        agentCode = this.pocSoaList[i].agentCode;
        masterPolicyNumber = this.pocSoaList[i].masterPolicyNumber;
        masterPolicyName = this.pocSoaList[i].masterFullName;
        masterPolicyId = this.pocSoaList[i].masterPolicyId;
    }

    this.PPHeader.masterPolicyId = masterPolicyId;
    this.PPHeader.agentId = agentCode;
    this.PPHeader.paymentForm = "0";
    this.PPHeader.paymentMode = "0";
    this.PPHeader.requestTypeId = "0";
    this.PPHeader.paymentPolicyStatusId = "4";
    this.PPHeader.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

    let pmc = this;
    this.subscription.add(this.caller.doCallService("/payment/insertSOARequest", {PaymentPolicyHeader: this.PPHeader, PaymentPolicyDetails: this.PPDetail}).subscribe(
      result => {

        let finalSoa = JSON.parse(result.header);

        
        this.printAgain(finalSoa);
        this.spinner.hide();
        // this.pocSoaList = [];

      }
    ));

  }

  openApprovePayment(pph: PaymentPolicyHeader){
    this.spinner.show();
    let param1 =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param1).subscribe(
          result => {
            this.previewPolicy = result.msg;

            for(let i = 0; i < this.previewPolicy.length; i++){

              if(this.previewPolicy[i].policyStatusId == "8"){

                this.previewPolicy[i].premiumAmount = (-Math.abs(parseFloat(this.previewPolicy[i].premiumAmount)).toFixed(2)).toString();
       
              }

            }

            
            this.spinner.hide();
          }
        ));

  }

  printAgain(pph: PaymentPolicyHeader){
    this.spinner.show();
    let param =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.pocSoaFinalList = [];
          this.PPDetail = [];
          this.PPHeader = new PaymentPolicyHeader();
          let agentCode = "";
          let masterPolicyNumber = "";
          let masterPolicyName = "";
          for(let i = 0; i < result.msg.length; i++){
              this.tempSoa = new PocSoa;
              this.tempSoa.itemNo = result.msg[i].soaSequence;
              this.tempSoa.policyHolder = result.msg[i].fullName;
              this.tempSoa.pocNo = result.msg[i].policyNumber;
              this.tempSoa.productVariant = result.msg[i].pocBased + "-" + result.msg[i].coverageTermInMonth;
              this.tempSoa.dateIssued = m(result.msg[i].effectivityDate).format(this.auth.getDateFormat());

              this.tempSoa.grossPremiumOthers = parseFloat(result.msg[i].premiumAmount).toFixed(2);
              this.tempSoa.exchangeRate = parseFloat(result.msg[i].exchangeRate).toFixed(2);
              this.tempSoa.grossPremiumPhp = (parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate)).toFixed(2);
              

              if(result.msg[i].policyStatusId == "8"){

                this.tempSoa.grossPremiumOthers = (-Math.abs(parseFloat(result.msg[i].premiumAmount))).toFixed(2);
                this.tempSoa.exchangeRate = (-Math.abs(parseFloat(result.msg[i].exchangeRate))).toFixed(2);
                this.tempSoa.grossPremiumPhp = (-Math.abs(parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate))).toFixed(2);
              }
              
              this.pocSoaFinalList.push(this.tempSoa);

              agentCode = result.msg[i].agentCode;
              masterPolicyNumber = result.msg[i].masterPolicyNumber;
              masterPolicyName = result.msg[i].masterFullName;
          }

          let soaForPrint = {
            reportLogos : ['phBankAssurance.png'],
            reportCode : 'SOA',
            reportFileName : pph.referenceCode,
            manningAgency : masterPolicyName,
            masterPolicyNumber : masterPolicyNumber,
            intermediaryCode : agentCode,
            soaNo : pph.referenceCode,
            dateGenerated : m().format(this.auth.getDateFormat()),
            pocs : this.pocSoaFinalList
          };

          this.subscription.add(this.caller.generatePDF(soaForPrint).subscribe(result => {
            

            let fileNameDelete : String = pph.referenceCode + ".pdf";
            this.subscription.add(this.caller.doCallServiceDeleteFile(fileNameDelete).subscribe(
              resultend => {
                this.initialChooseAgentFilter();
                this.spinner.hide();
              }
            ));

          }));

        }
      ));

  }

  generateExcel(pph: PaymentPolicyHeader){
    this.spinner.show();
    let param =  {action: "select-for-view-print-soa", values: {"pp_header_id": pph.paymentPolicyHeaderId}};
    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.pocSoaFinalList = [];
          this.PPDetail = [];
          this.PPHeader = new PaymentPolicyHeader();
          let agentCode = "";
          let masterPolicyNumber = "";
          let masterPolicyName = "";

          for(let i = 0; i < result.msg.length; i++){
              this.tempSoa = new PocSoa;
              this.tempSoa.itemNo = result.msg[i].soaSequence;
              this.tempSoa.policyHolder = result.msg[i].fullName;
              this.tempSoa.pocNo = result.msg[i].policyNumber;
              this.tempSoa.productVariant = result.msg[i].pocBased + "-" + result.msg[i].coverageTermInMonth;
              this.tempSoa.dateIssued = m(result.msg[i].effectivityDate).format(this.auth.getDateFormat());

              this.tempSoa.grossPremiumOthers = parseFloat(result.msg[i].premiumAmount).toFixed(2);
              this.tempSoa.exchangeRate = parseFloat(result.msg[i].exchangeRate).toFixed(2);
              this.tempSoa.grossPremiumPhp = (parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate)).toFixed(2);
              

              if(result.msg[i].policyStatusId == "8"){

                this.tempSoa.grossPremiumOthers = (-Math.abs(parseFloat(result.msg[i].premiumAmount))).toFixed(2);
                this.tempSoa.exchangeRate = (-Math.abs(parseFloat(result.msg[i].exchangeRate))).toFixed(2);
                this.tempSoa.grossPremiumPhp = (-Math.abs(parseFloat(this.tempSoa.grossPremiumOthers) * parseFloat(this.tempSoa.exchangeRate))).toFixed(2);

              }

              
              this.pocSoaFinalList.push(this.tempSoa);

              agentCode = result.msg[i].agentCode;
              masterPolicyNumber = result.msg[i].masterPolicyNumber;
              masterPolicyName = result.msg[i].masterFullName;

          }

          let soaForPrint = {
            reportLogos : ['phBankAssurance.png'],
            reportCode : 'SOAExcel',
            reportFileName : pph.referenceCode,
            manningAgency : masterPolicyName,
            masterPolicyNumber : masterPolicyNumber,
            intermediaryCode : agentCode,
            soaNo : pph.referenceCode,
            dateGenerated : m().format(this.auth.getDateFormat()),
            pocs : this.pocSoaFinalList
          };


          this.subscription.add(this.caller.generateExcel(soaForPrint).subscribe(result => {
            this.initialChooseAgentFilter();
            this.spinner.hide();
          }));

          // this.excelService.exportAsExcelFile(this.pocSoaFinalList,'SOA-'+pph.referenceCode)
          // this.initialChooseAgentFilter();
          // this.spinner.hide();
        }
      ));

  }

  initialViewRequest(){
    this.spinner.show();
    let task = "SRC,0," + this.searchReferenceCode;

    if(this.searchReferenceCode == ""){
      task = "SIC,0,";

      if(this.auth.getUserType() == "MA"){
        task = "SMA,0," + this.auth.getUserDetails().manningAgencyId;
      }else if(this.auth.getUserType() == "ICA"){
        task = "SICA,0," + this.auth.getUserDetails().customerId;
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

          let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ agentName +"</b>,</p><p>Please see attached SOA report as requested.</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

          let paramEmail =  {toName: agentName,file_name: pph.referenceCode + ".pdf", to: agentEmail, subject: "Remittance Request for REM No. " + pph.referenceCode, body: mailBody};
          this.spinner.show();

          if(!agentEmail){
            Swal.fire(
              'Email Not Found',
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

  viewRequest(pageNumber: string){
    this.previousPage = this.templateRouter;
    this.templateRouter = "view-requests";
    this.currentPage = parseInt(pageNumber) + 1;
    this.spinner.show();
    let task = "SRC,0," + this.searchReferenceCode;

    if(this.searchReferenceCode == ""){
      task = "SIC,0,";

      if(this.auth.getUserType() == "MA"){
        task = "SMA,0," + this.auth.getUserDetails().manningAgencyId;
      }else if(this.auth.getUserType() == "ICA"){
        task = "SICA,0," + this.auth.getUserDetails().customerId;
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

  initialChooseAgentFilter(){

    if(this.PPHeaderFilter.agentId){
      this.spinner.show();
      this.customerList = [];
      this.pocSoaList = [];
      let param =  {action: "select-customer-by-type", values: {"countType": 'count',"select_type": 'soa',"report_request_details" : this.PPHeaderFilter}};

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
      this.spinner.hide();
      this.pocCurrentPage = parseInt(pageNumber) + 1;
      this.customerList = [];
      this.pocSoaList = [];
      let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'soa',"report_request_details" : this.PPHeaderFilter}};

      this.subscription.add(this.caller.callPaginated("/digitalinnopolicyservice/?action=policy", param, pageNumber, this.pocPageSize).subscribe(
        result => {
          this.customerList = result.msg;

          for(let i = 0; i < this.customerList.length; i++){
            this.customerList[i].customerDetails.policyDateAdded = m(this.customerList[i].customerDetails.policyDateAdded).format(this.auth.getDateFormat());
          
            this.addToSOA(this.customerList[i].customerDetails);
          }
          this.selectAgent();
          this.spinner.hide();

        }
      ));

    }

  }

  beforePrint(){
    this.spinner.show();
      this.customerList = [];
      this.pocSoaList = [];
      let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'soa',"report_request_details" : this.PPHeaderFilter}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.customerList = result.msg;

          for(let i = 0; i < this.customerList.length; i++){
            this.addToSOA(this.customerList[i].customerDetails);
          }

          let uniqs = _.uniqBy(this.pocSoaList, 'masterPolicyId');
          let tempSoa = [];

          for(let i = 0; i < uniqs.length; i++){
            let tempiSoa = [];

            for(let x = 0; x < this.pocSoaList.length; x++){
              if(uniqs[i].masterPolicyId == this.pocSoaList[x].masterPolicyId){
                tempiSoa.push(this.pocSoaList[x]);
              }
            }

            tempSoa.push(tempiSoa);

          }

          let proceed = true;
          for(let i = 0; i < this.customerList.length; i++){
            if(!this.customerList[i].customerDetails.exchangeRate){
              proceed = false;
              break;
            }
          }

          if(!proceed){
            this.paymentMgmt = "Please complete setup of exchange rate before submission of SOA.";
            $("#paymentMgmt").addClass("show");
            $("#paymentMgmt").removeClass("hidden");
          }else{

            Swal.fire({
              title: 'SOA Request',
              text: "Are you sure you want to Submit this SOA Request?",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Proceed'
            }).then((result) => {
              if (result.value) {

                this.spinner.show();
                for(let i = 0; i < tempSoa.length; i++){

                this.pocSoaList = [];
                this.pocSoaList = tempSoa[i];
                this.submitSoaRequest();
                
              }

              this.spinner.hide();

              }
            });

          }
          
        }
      ));


    this.spinner.hide();


    

  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }


}
