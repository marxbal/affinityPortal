import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Affinity} from '../../../objects/affinity';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {
  
  constructor(private spinner : NgxSpinnerService, private caller : AuthService) { }

  @Input() line: String;
  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  emailSend : String = "";

  ngOnInit() {

    this.affinity.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.grossPrem));
    this.affinity.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.netPrem));
    this.affinity.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.docStamp));
    this.affinity.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.lgt));
    this.affinity.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.eVat));
    this.affinity.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.premiumTax));
    this.affinity.premiumBreakdown.others = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.others));
    this.affinity.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.fireTax));

    console.log(this.affinity);

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;

  }

  validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  sendEmail(){

    this.emailSend = this.affinity.riskDetails.emailAddress.toLowerCase();

  }

  submitSendEmail(){

    let emailTemp = this.emailSend.split(";");
    let emailFinal = "";

    for(let i = 0; i < emailTemp.length; i++){
      
      if(!this.validateEmail(emailTemp[i].trim())){
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + emailTemp[i] + "</b> is invalid, please fix and try again."
        });
        return null;
      }

      emailFinal += emailTemp[i].trim() + ";";

    }

    Swal.fire({
      title: 'Send Email',
      text: "You're about to send email, proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Send Email'
    }).then((result) => {
      if (result.value) {

        this.caller.doCallService("/afnty/sendEmail?email="+ emailFinal.slice(0, -1) +"&numPoliza=" 
          + this.affinity.policyNumber + "&subject=MAPFRE Online Policy Number " + this.affinity.policyNumber + "&type=P", null).subscribe(
          resulta => { 
            
            console.log(resulta);

            if(resulta.status == 1){
              Swal.fire({
                type: 'success',
                title: 'Email Sent!',
                text: "Your insurance policy was sent to " + emailFinal.slice(0, -1) + ". Please ensure that fopmsecure@mapfreinsurance.com.ph is NOT on your spam/blocked email list. Do check your spam/junk folder in case you have not received any email confirmation and updates from us."
              });
              $("#emailModalClose").click();
            }else{
              Swal.fire({
                type: 'error',
                title: 'Unable to proceed.',
                text: "We are unable to process your request."
              });
            }

        });

      }

    });

  }
 
  printPolicy(){
    this.spinner.show();
    this.caller.generatePDFTW("/afnty/printPolicy?numPoliza="+this.affinity.policyNumber+"&printType=P", null).subscribe(
      result => {
        this.spinner.hide();
    });
  }

  nextStepAction(nextStep){
  	this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }


}
