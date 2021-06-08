import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {ReportManagement} from '../../../objects/report-management';
import {AuthService} from '../../../services/auth.service';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import {Customer} from '../../../objects/customer';
import {PolicyType} from '../../../objects/policy-type';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import {AllCustomerDetails} from '../../../objects/all-customer-details';
import {PolicyStatus} from '../../../objects/policy-status';
import {ICMRR} from '../../../objects/ICMRR';
import {DeclarationReport} from '../../../objects/declaration-report';
import Swal from 'sweetalert2';
import {PocSoa} from '../../../objects/poc-soa';
import {ExcelService} from '../../../services/excel.service';

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.component.html',
  styleUrls: ['./report-management.component.css']
})
export class ReportManagementComponent implements OnInit, ComponentCanDeactivate  {

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,
private auth: AuthenticationService,private caller : AuthService,private router: Router,
    private spinner: NgxSpinnerService,private excelService:ExcelService) {this.__componentInspectorService.getComp(this);
 }

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  reportExportType: String;
  reportType: String;
  pageSize: string;
  reportError: String;
  reportSuccess: String;
  reportRequestDetails: ReportManagement;
  customerList : AllCustomerDetails[];
  manningAgencyList : Customer[];
  policyTypeList : PolicyType[];
  policyStatusList : PolicyStatus[];
  pageLength : String[];
  ICMRRReport : ICMRR[];
  declarationReport : DeclarationReport[];
  cancellationReport : PocSoa[];
  currentPage: number;

  ngOnInit() {

    this.pageSize = "10";
    this.declarationReport = [];
    this.ICMRRReport = [];
    this.reportExportType = "1";
  	this.reportType = "0";
  	this.reportError = "";
  	this.reportSuccess = "";
  	this.reportRequestDetails = new ReportManagement();
  	this.customerList = [];
    this.manningAgencyList = [];
  	this.pageLength = [];

  	let param =  {action: "select-policy-type", values: {}};

    this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        result => {
          this.policyTypeList = result.msg;
        }
      );

    let param2 =  {action: "select-all-policy-status", values: {}};

    this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param2).subscribe(
        result => {
          this.policyStatusList = result.msg;
          this.spinner.hide();
        }
      );


  }

  chooseReportType(){

  	if(this.reportType == '1'){

      let param = '2';

      if(this.auth.getUserType() == "ICA"){
        param += ",ICA-" + this.auth.getUserDetails().userId;
      }else{
        param += ",O-";
      }

  		this.caller.callPaginated("/client/select-all-customer-by-type", param,"0","1000").subscribe(
	      result => {
	        this.manningAgencyList = result;
	      }
	    );

  		this.reportRequestDetails.policyTypeId = "";
      this.reportRequestDetails.manningAgencyId = "";
  		this.reportRequestDetails.policyStatusId = "";

  	}

    $("#policyStatusSelect").removeAttr("readonly");
    this.reportRequestDetails.policyStatusId = "";
    this.reportRequestDetails.policyTypeId = "";

    if(this.reportExportType == '3'){
      $("#policyStatusSelect").attr("readonly", true);
      this.reportRequestDetails.policyStatusId = "4";
      this.reportRequestDetails.policyTypeId = "2";
    }else if(this.reportExportType == '5'){
      $("#policyStatusSelect").attr("readonly", true);
      this.reportRequestDetails.policyStatusId = "3";
      this.reportRequestDetails.policyTypeId = "2";
    }



  	

  }

  initialFilter(){


    let message = [];
    let proceed = "1";
    let endingMessage = "";

    if(this.reportType == '1'){

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
      $('#content').animate({ scrollTop: 0 }, 'slow');
      $("#reportError").removeClass("hidden");
      $("#reportError").addClass("show");
      this.reportError = finalMessage;
    }else{
      this.spinner.show();

      if(this.reportType == '1'){
        this.reportRequestDetails.reportTypeId = "1";

        let param =  {action: "select-customer-by-type", values: {"countType": 'count',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

        this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
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
            this.filter("0");
          }
        );

      }    
    }

  }

  filter(pageNumber: string){
    this.currentPage = parseInt(pageNumber) + 1;

  	let message = [];
    let proceed = "1";
    let endingMessage = "";

  	if(this.reportType == '1'){

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
      $('#content').animate({ scrollTop: 0 }, 'slow');
      $("#reportError").removeClass("hidden");
      $("#reportError").addClass("show");
      this.reportError = finalMessage;
    }else{

    	if(this.reportType == '1'){
  			this.reportRequestDetails.reportTypeId = "1";
        this.customerList = [];
		  	let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

		    this.caller.callPaginated("/digitalinnopolicyservice/?action=policy", param,pageNumber,this.pageSize).subscribe(
			    result => {
			      this.customerList = result.msg;
			      this.spinner.hide();
			    }
			  );

  		}		
  	}
  	

  }

  export(){

  	if(this.reportType == '1'){

      let message = [];
    let proceed = "1";
    let endingMessage = "";
    this.spinner.show();
    if(!this.reportRequestDetails.dateFrom || !this.reportRequestDetails.dateTo){

      Swal.fire(
        'Export to CSV',
        'Date From and Date To are a required fields.',
        'error'
      );

    }else{

      if(this.reportExportType == '1'){

        this.reportRequestDetails.reportTypeId = "1";
          this.customerList = [];
          let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

          this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
            result => {
              this.customerList = result.msg;

              this.ICMRRReport = [];
              let totalPremium = 0;
              for(var i = 0; i < this.customerList.length; i++){
                //this.customerList[i].customerDetails.age = m().diff(this.customerList[i].customerDetails.policyDateAdded, 'days').toString();
                
                let temp: ICMRR = new ICMRR();
                temp.itemNo = (i+1).toString();
                temp.manningAgency = this.customerList[i].customerDetails.masterFullName;
                temp.policyHolder = this.customerList[i].customerDetails.fullName;
                temp.policyNo = this.customerList[i].customerDetails.policyNumber;
                temp.termInMonths = this.customerList[i].customerDetails.coverageTermInMonth;
                temp.areaOfDeployment = this.customerList[i].customerDetails.areaOfDeployment;
                temp.premiumAmount = (parseFloat(this.customerList[i].customerDetails.premiumAmount).toFixed(2)).toString();
                temp.ORNo = "";

                totalPremium += parseFloat(this.customerList[i].customerDetails.premiumAmount);

                this.ICMRRReport.push(temp);
              }

              var data = this.ICMRRReport;

              let soaForPrint = {reportCode : 'ICMRRExcelReport',reportFileName: 'Insurance Commission Monthly Reportorial Requirement ' + m().format('YYYY-MM-DD'), ICMMR: this.ICMRRReport, key : 'ICMMR'};

              this.caller.generateExcel(soaForPrint).subscribe(result => {
                this.initialFilter();

              this.spinner.hide();
              });

              
            }
          );

      }else if(this.reportExportType == '2'){


        this.reportRequestDetails.reportTypeId = "1";
          this.customerList = [];
          let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

          this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
            result => {
              this.customerList = result.msg;

              this.declarationReport = [];
              for(var i = 0; i < this.customerList.length; i++){
                //this.customerList[i].customerDetails.age = m().diff(this.customerList[i].customerDetails.policyDateAdded, 'days').toString();
                
                let temp: DeclarationReport = new DeclarationReport();
                temp.itemNo = (i+1).toString();
                temp.manningAgency = this.customerList[i].customerDetails.masterFullName;
                temp.policyNo = this.customerList[i].customerDetails.policyNumber;
                temp.issueDate = this.customerList[i].customerDetails.policyDateAdded;
                temp.expiryDate = this.customerList[i].customerDetails.expiryDate;
                temp.policyHolder = this.customerList[i].customerDetails.fullName;
                temp.lastName = this.customerList[i].customerDetails.lastName;
                temp.firstName = this.customerList[i].customerDetails.firstName;
                temp.middleName = this.customerList[i].customerDetails.middleName;
                temp.birthday = this.customerList[i].customerDetails.birthDay;
                temp.gender = "Male";

                if(this.customerList[i].customerDetails.gender == '2'){
                  temp.gender = "Female";
                }

                temp.passport = this.customerList[i].customerDetails.passportId;
                temp.pocBased = this.customerList[i].customerDetails.pocBased;
                temp.otherCharges = (parseFloat(this.customerList[i].customerDetails.otherCharges).toFixed(2)).toString();

                this.declarationReport.push(temp);
              }

              var data = this.declarationReport;

              let soaForPrint = {reportCode : 'DeclarationReportExcel',reportFileName: 'Declaration Report ' + m().format('YYYY-MM-DD'), declarationReport: this.declarationReport, key : 'declarationReport'};

              this.caller.generateExcelReport(soaForPrint).subscribe(result => {
                this.initialFilter();

              this.spinner.hide();
              });

              
            }
          );



      }else if(this.reportExportType == '3'){


        this.reportRequestDetails.reportTypeId = "1";
          this.customerList = [];
          let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

          this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
            result => {
              this.customerList = result.msg;

              this.cancellationReport = [];
              for(var i = 0; i < this.customerList.length; i++){
                //this.customerList[i].customerDetails.age = m().diff(this.customerList[i].customerDetails.policyDateAdded, 'days').toString();
                
                let temp: PocSoa = new PocSoa();
                temp.itemNo = (i+1).toString();
                temp.masterPolicyName = this.customerList[i].customerDetails.masterFullName;
                temp.masterPolicyNumber = this.customerList[i].customerDetails.masterPolicyNumber;
                temp.policyHolder = this.customerList[i].customerDetails.fullName;
                temp.pocNo = this.customerList[i].customerDetails.policyNumber;
                temp.productVariant = this.customerList[i].customerDetails.pocBased + ' - ' + this.customerList[i].customerDetails.coverageTermInMonth;
                temp.dateIssued = this.customerList[i].customerDetails.policyDateAdded;
                temp.grossPremiumOthers = (parseFloat(this.customerList[i].customerDetails.premiumAmount).toFixed(2));
                temp.reasonCancellation = this.customerList[i].customerDetails.reasonCancellation;
                temp.requestorCancellation = this.customerList[i].customerDetails.requestorCancellation;
                temp.approverCancellation = this.customerList[i].customerDetails.approverCancellation;
                temp.dateCancellationRequested = this.customerList[i].customerDetails.dateCancellationRequested;
                temp.dateCancellationApproved = this.customerList[i].customerDetails.dateCancellationApproved;
                this.cancellationReport.push(temp);
              }

              var data = this.cancellationReport;
              let soaForPrint = {title: 'Cancellation Report',period: 'FROM ' +  this.reportRequestDetails.dateFrom + ' TO ' + this.reportRequestDetails.dateTo,reportCode : 'cancelReport',reportFileName: 'Cancellation Report ' + m().format('YYYY-MM-DD'), cancelReport: data, key : 'cancelReport'};


              this.caller.generateExcel(soaForPrint).subscribe(result => {

                this.initialFilter();

              this.spinner.hide();

              });

              
            }
          );



      }else if(this.reportExportType == '4'){


        this.reportRequestDetails.reportTypeId = "1";
          this.customerList = [];
          let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

          this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
            result => {
              this.customerList = result.msg;

              this.declarationReport = [];
              for(var i = 0; i < this.customerList.length; i++){
                //this.customerList[i].customerDetails.age = m().diff(this.customerList[i].customerDetails.policyDateAdded, 'days').toString();
                
                let temp: DeclarationReport = new DeclarationReport();
                temp.itemNo = (i+1).toString();
                temp.manningAgency = this.customerList[i].customerDetails.masterFullName;
                temp.masterPolicyNo = this.customerList[i].customerDetails.masterPolicyNumber;
                temp.policyNo = this.customerList[i].customerDetails.policyNumber;
                temp.issueDate = this.customerList[i].customerDetails.policyDateAdded;
                temp.expiryDate = this.customerList[i].customerDetails.expiryDate;
                temp.policyHolder = this.customerList[i].customerDetails.fullName;
                temp.lastName = this.customerList[i].customerDetails.lastName;
                temp.firstName = this.customerList[i].customerDetails.firstName;
                temp.middleName = this.customerList[i].customerDetails.middleName;
                temp.birthday = this.customerList[i].customerDetails.birthDay;
                temp.gender = "Male";

                if(this.customerList[i].customerDetails.gender == '2'){
                  temp.gender = "Female";
                }
                temp.passport = this.customerList[i].customerDetails.passportId;
                temp.pocBased = this.customerList[i].customerDetails.pocBased;
                temp.grossPremium = ((parseFloat(this.customerList[i].customerDetails.premiumAmount))).toFixed(2);
                temp.otherCharges = ((parseFloat(this.customerList[i].customerDetails.otherCharges))).toFixed(2);
                temp.pbacPremium = ((parseFloat(this.customerList[i].customerDetails.premiumAmount) - parseFloat(this.customerList[i].customerDetails.otherCharges)).toFixed(2));
                temp.exchangeRate = ((parseFloat(this.customerList[i].customerDetails.exchangeRate))).toFixed(2);
                temp.pbacPremiumPhp = ((parseFloat(this.customerList[i].customerDetails.exchangeRate) * parseFloat(temp.pbacPremium)).toFixed(2));
        				temp.agentName = this.customerList[i].customerDetails.agentFullName;
        				temp.issuedBy = this.customerList[i].customerDetails.issuerName;
                temp.status = this.customerList[i].customerDetails.policyStatusDescription;
				
                this.declarationReport.push(temp);
              }

              var data = this.declarationReport;

              let policyType = "ALL";
              if(this.reportRequestDetails.policyTypeId !== "0"){
                for(let i = 0; i < this.policyTypeList.length; i++){
                  if(this.policyTypeList[i].policyTypeId == this.reportRequestDetails.policyTypeId){
                    policyType = this.policyTypeList[i].typeDescription;
                    break;
                  }
                }
              }

              let status = "ALL";
              if(this.reportRequestDetails.policyStatusId !== "0"){
                for(let i = 0; i < this.policyStatusList.length; i++){
                  if(this.policyStatusList[i].policyStatusId == this.reportRequestDetails.policyStatusId){
                    status = this.policyStatusList[i].statusDescription;
                    break;
                  }
                }
              }

              let soaForPrint = {policyType: policyType,status: status,title: 'Production Report',period: 'FROM ' +  this.reportRequestDetails.dateFrom + ' TO ' + this.reportRequestDetails.dateTo,reportCode : 'productionReport',reportFileName: 'Production Report ' + m().format('YYYY-MM-DD'), prodReport: data, key: 'prodReport'};

              this.caller.generateExcel(soaForPrint).subscribe(result => {

                this.initialFilter();

              this.spinner.hide();

              });
              
            }
          );



      }else if(this.reportExportType == '5'){


        this.reportRequestDetails.reportTypeId = "1";
          this.customerList = [];
          let param =  {action: "select-customer-by-type", values: {"countType": 'all',"select_type": 'report',"report_request_details" : this.reportRequestDetails}};

          this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
            result => {
              this.customerList = result.msg;

              this.declarationReport = [];
              for(var i = 0; i < this.customerList.length; i++){
                //this.customerList[i].customerDetails.age = m().diff(this.customerList[i].customerDetails.policyDateAdded, 'days').toString();
                
                let temp: DeclarationReport = new DeclarationReport();
                temp.itemNo = (i+1).toString();
                temp.manningAgency = this.customerList[i].customerDetails.masterFullName;
                temp.masterPolicyNo = this.customerList[i].customerDetails.masterPolicyNumber;
                temp.policyNo = this.customerList[i].customerDetails.policyNumber;
                temp.issueDate = this.customerList[i].customerDetails.policyDateAdded;
                temp.expiryDate = this.customerList[i].customerDetails.expiryDate;
                temp.policyHolder = this.customerList[i].customerDetails.fullName;
                temp.lastName = this.customerList[i].customerDetails.lastName;
                temp.firstName = this.customerList[i].customerDetails.firstName;
                temp.middleName = this.customerList[i].customerDetails.middleName;
                temp.birthday = this.customerList[i].customerDetails.birthDay;
                temp.gender = "Male";

                if(this.customerList[i].customerDetails.gender == '2'){
                  temp.gender = "Female";
                }
                temp.passport = this.customerList[i].customerDetails.passportId;
                temp.pocBased = this.customerList[i].customerDetails.pocBased;
                temp.grossPremium = ((parseFloat(this.customerList[i].customerDetails.premiumAmount))).toFixed(2);
                temp.otherCharges = ((parseFloat(this.customerList[i].customerDetails.otherCharges))).toFixed(2);
                temp.pbacPremium = ((parseFloat(this.customerList[i].customerDetails.premiumAmount) - parseFloat(this.customerList[i].customerDetails.otherCharges)).toFixed(2));
                temp.exchangeRate = ((parseFloat(this.customerList[i].customerDetails.exchangeRate))).toFixed(2);
                temp.pbacPremiumPhp = ((parseFloat(this.customerList[i].customerDetails.exchangeRate) * parseFloat(temp.pbacPremium)).toFixed(2));
                temp.agentName = this.customerList[i].customerDetails.agentFullName;
                temp.issuedBy = this.customerList[i].customerDetails.issuerName;
                temp.referenceCode = this.customerList[i].customerDetails.referenceCode;
                temp.paymentForm = this.customerList[i].customerDetails.paymentForm;
                temp.currency = this.customerList[i].customerDetails.currency;
                temp.paymentDate = this.customerList[i].customerDetails.paymentDate;
                temp.TAT = this.customerList[i].customerDetails.TAT;
                temp.paymentPostedById = this.customerList[i].customerDetails.paymentPostedById;

                this.declarationReport.push(temp);
              }

              var data = this.declarationReport;

              let soaForPrint = {title: 'Paid Remittance Report',period: 'FROM ' +  this.reportRequestDetails.dateFrom + ' TO ' + this.reportRequestDetails.dateTo,reportCode : 'paidProductionReport',reportFileName: 'Paid Remittance Report ' + m().format('YYYY-MM-DD'), paidReport: data, key: 'paidReport'};

              this.caller.generateExcel(soaForPrint).subscribe(result => {

                this.initialFilter();

              this.spinner.hide();

              });
              
            }
          );



      }

    }

    
    
	}
  }

  clear(){

  	this.reportRequestDetails = new ReportManagement();
  	if(this.reportType == '1'){
	  	this.customerList = [];
  	}

  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }


}
