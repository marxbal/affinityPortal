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
import {InboxHeader} from '../../../objects/inbox-header';
import {InboxRequestType} from '../../../objects/inbox-request-type';
import {InboxRequestStatus} from '../../../objects/inbox-request-status';
import {AllInboxDetails} from '../../../objects/all-inbox-details';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import {AllCustomerDetails} from '../../../objects/all-customer-details';
import * as _ from 'lodash';
import {InboxRemarks} from '../../../objects/inbox-remarks';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inbox-management',
  templateUrl: './inbox-management.component.html',
  styleUrls: ['./inbox-management.component.css']
})
export class InboxManagementComponent implements OnInit, ComponentCanDeactivate,OnDestroy {

  constructor(private auth: AuthenticationService,private caller : AuthService,private router: Router,
    private spinner: NgxSpinnerService) { }

  private subscription: Subscription = new Subscription();

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  inboxHeaderApproval : AllInboxDetails;
  inboxHeaderFilter : InboxHeader;
  inboxNewRemarks : InboxRemarks;
  inboxRequestType : InboxRequestType[];
  inboxRequestStatus : InboxRequestStatus[];
  inboxDetailsList : AllInboxDetails[];
  inboxDetails : AllInboxDetails;
  templateRouter: String;
  previousPage: String;
  pageSize: string;
  pageLength: String[];
  currentPage: number;
  addCustomerNotice: String;

  ngOnInit() {

    this.inboxHeaderApproval = new AllInboxDetails();
    this.inboxDetails = new AllInboxDetails();
    this.inboxHeaderFilter = new InboxHeader();
  	this.inboxNewRemarks = new InboxRemarks();
    this.inboxDetailsList = [];
    this.pageLength = [];
    this.templateRouter = "initialize";
    this.pageSize = "10";

  let param =  {action: "select-inbox-request-type", values: {}};

	this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
    result => {
      this.inboxRequestType = result.msg;
      if(this.auth.getUserRole() == "4"){
        this.inboxRequestType.splice(1,1);
        this.inboxRequestType.splice(1,1);
        this.inboxHeaderFilter.requestTypeId = this.inboxRequestType[0].requestTypeId;
      }else if(this.auth.getUserRole() == "2"){
        this.inboxHeaderFilter.requestTypeId = this.inboxRequestType[1].requestTypeId;
        this.inboxRequestType.splice(0,1);
      }else{
        this.inboxHeaderFilter.requestTypeId = "";
      }

    }
  ));

  param =  {action: "select-inbox-status", values: {}};

  this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
  	result => {
  		this.inboxRequestStatus = result.msg;
      this.inboxHeaderFilter.requestStatusId = "";
  	}
	));

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

  viewMoreDetails(detail: AllInboxDetails){
    this.inboxDetails = detail;
    this.previousPage = this.templateRouter;
    this.templateRouter = "viewDetails";
  }

  backPage(previousPage : String){
    this.templateRouter = this.previousPage;
    this.previousPage = previousPage;
  }

  initialFilterInbox(){
    this.spinner.show();
    this.inboxHeaderFilter.approverRoleId = this.auth.getUserRole();
    this.inboxHeaderFilter.approverUserId = this.auth.getUserDetails().userId;

    let param =  {action: "select-inbox", values: {countType: 'count',inboxFilter: this.inboxHeaderFilter}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
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
        this.filterInbox("0");

      }
    ));

  }

  filterInbox(pageNumber: string){
    this.currentPage = parseInt(pageNumber) + 1;
    this.inboxHeaderFilter.approverRoleId = this.auth.getUserRole();
    this.inboxHeaderFilter.approverUserId = this.auth.getUserDetails().userId;

    let param =  {action: "select-inbox", values: {countType: 'all',inboxFilter: this.inboxHeaderFilter}};

    this.subscription.add(this.caller.callPaginated("/digitalinnopolicyservice/?action=inbox", param, pageNumber, this.pageSize).subscribe(
      result => {
        this.inboxDetailsList = result.msg;
        this.spinner.hide();
        for(let i = 0; i < this.inboxDetailsList.length; i++){
          this.inboxDetailsList[i].inboxHeader.dateAdded = m(this.inboxDetailsList[i].inboxHeader.dateAdded).format(this.auth.getDateFormat());
          this.inboxDetailsList[i].inboxHeader.dateModified = m(this.inboxDetailsList[i].inboxHeader.dateModified).format(this.auth.getDateFormat());
          if(this.inboxDetailsList[i].inboxHeader.dateCompleted){
            this.inboxDetailsList[i].inboxHeader.dateCompleted = m(this.inboxDetailsList[i].inboxHeader.dateCompleted).format(this.auth.getDateFormat());
          }

          for(let x = 0; x < this.inboxDetailsList[i].inboxRemarks.length; x++){
            this.inboxDetailsList[i].inboxRemarks[x].dateAdded = m(this.inboxDetailsList[i].inboxRemarks[x].dateAdded).format(this.auth.getDateFormat());
          }
          
        }

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

  addNewRemark(header: InboxHeader){
    this.spinner.show();
    this.inboxNewRemarks.inboxHeaderId = header.inboxHeaderId;
    this.inboxNewRemarks.fromUserId = this.auth.getUserDetails().userId;
    this.inboxNewRemarks.description = $("#new-remark-" + header.inboxHeaderId).val();
    this.inboxNewRemarks.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

    if(this.inboxNewRemarks.description == ""){
      this.spinner.hide();
      Swal.fire(
        'Remark',
        'Remark should not be empty.',
        'error'
      );
    }else{

      $(".required-remarks-notice").addClass("hidden");

      let param =  {action: "insert-new-remark", values: {inboxRemarks: this.inboxNewRemarks}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
        result => {

          let param2 =  {action: "select-all-remarks", values: {inboxHeaderId: header.inboxHeaderId}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.inboxDetails.inboxRemarks = [];
              this.inboxDetails.inboxRemarks = result.msg;
              $("#new-remark-" + header.inboxHeaderId).val("");
              this.initialFilterInbox();
              this.spinner.hide();
            }
          ));

          $("#action-fields").removeClass("hidden");

        }
      ));

    }

    

  }

  submitDecision(decision: string, header: AllInboxDetails){

    let msg = "Are you sure you want to ";
    let policyStatusId = header.inboxDetails['policyDetails'].policyStatusId;
    switch (decision) {
      case "2":
          msg += " return this request?";
        break;

      case "3":
          msg += " approve this request?";
          if(header.inboxDetails['policyDetails'].policyStatusId == '10'){
            policyStatusId = '8';
          }else if(header.inboxDetails['policyDetails'].policyStatusId == '6'){
            policyStatusId = '4';
          }
        break;

      case "4":
          msg += " reject this request?";
          if(header.inboxDetails['policyDetails'].policyStatusId == '10'){
            policyStatusId = '3';
          }else if(header.inboxDetails['policyDetails'].policyStatusId == '6'){
            policyStatusId = '2';
          }
        break;

      case "5":
          msg += " cancel this request?";
          if(header.inboxDetails['policyDetails'].policyStatusId == '10'){
            policyStatusId = '3';
          }else if(header.inboxDetails['policyDetails'].policyStatusId == '6'){
            policyStatusId = '2';
          }
        break;
      
      default:
        // code...
        break;
    }

    Swal.fire({
      title: 'Request Approval',
      text: msg,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (result.value) {

        this.spinner.show();
        this.inboxHeaderApproval = header;
        this.inboxHeaderApproval.inboxHeader.requestStatusId = decision;
        this.inboxHeaderApproval.inboxHeader.approverUserId = this.auth.getUserDetails().userId;

        let param =  {action: "update-approval-header", values: {pocStatusId: policyStatusId, inboxHeader: this.inboxHeaderApproval}};

        this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
          result => {

            this.spinner.hide();
            this.initialFilterInbox();
            Swal.fire(
              'Success!',
              'Success update of request status.',
              'success'
            );
            this.templateRouter = 'initialize';
            this.previousPage = '';

          }
        ));

        
      }
    });

  }

}
