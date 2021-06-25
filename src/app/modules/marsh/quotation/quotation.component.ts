import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {AuthService} from '../../../services/auth.service';
import {P2000020} from '../../../objects/p2000020';
import {P2000025} from '../../../objects/p2000025';
import {P2000030} from '../../../objects/p2000030';
import {P2000040} from '../../../objects/p2000040';
import {P2000031} from '../../../objects/p2000031';
import {P1001331} from '../../../objects/p1001331';
import {P2100610} from '../../../objects/p2100610';
import {P2000060} from '../../../objects/p2000060';
import {CommonService} from '../../../services/common.service';
import * as m from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.css']
})
export class QuotationComponent implements OnInit {

  constructor(private caller: AuthService, private common : CommonService,
    private spinner : NgxSpinnerService,
    private router : Router) { }

  @Input() marsh: Marsh;
  @Input() line: String;
  @Output() nextStep = new EventEmitter();

  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000025: P2000025[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000060: P2000060[] = [];
  p1001331List: P1001331[] = [];
  p2000031: P2000031 = new P2000031();
  p1001331: P1001331 = new P1001331();

  title: String;
  buyNowStep : String;
  emailSend: String;

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

  	console.log(this.marsh);
    console.log(this.line);

    this.title = "Household";
    this.buyNowStep = "riskInformation";
    if(this.line == "motorQuotationIssuance"){
      this.title = "Motor";
      this.buyNowStep = "motorPolicyIssuance";
    }else if(this.line == "personalInformation"){
      this.title = "Personal Accident";
      this.buyNowStep = "riskInformation";
    }

    this.caller.doCallService("/marsh/getCoverageLimits?codRamo=100&codCob=1004", null).subscribe(
      result => {
        this.marsh.lov.bodilyInjuryLOV = result;

        for(let i = 0; i < this.marsh.lov.bodilyInjuryLOV.length; i++){
          this.marsh.lov.bodilyInjuryLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.marsh.lov.bodilyInjuryLOV[i].impLimite));
        }

        this.marsh.lov.bodilyInjuryLOV.splice(-1,1);
        this.marsh.lov.bodilyInjuryLOV.splice(-1,1);

    });

    this.caller.doCallService("/marsh/getCoverageLimits?codRamo=100&codCob=1005", null).subscribe(
      result => {
        this.marsh.lov.propertyDamageLOV = result;

        for(let i = 0; i < this.marsh.lov.propertyDamageLOV.length; i++){
          this.marsh.lov.propertyDamageLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.marsh.lov.propertyDamageLOV[i].impLimite));
        }

        this.marsh.lov.propertyDamageLOV.splice(-1,1);
        this.marsh.lov.propertyDamageLOV.splice(-1,1);
        
        this.spinner.hide();
    });

    console.log(this.buyNowStep);

    this.formatAmount();

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;

  }

  printQuotation(){
    this.spinner.show();
    this.caller.generatePDFTW("/marsh/printPolicy?numPoliza="+this.marsh.quotationNumber+"&printType=Q", null).subscribe(
      result => {
        this.spinner.hide();
    });
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

        this.caller.doCallService("/marsh/sendEmail?email="+ emailFinal.slice(0, -1) +"&numPoliza=" 
          + this.marsh.quotationNumber + "&subject=MAPFRE Online Quotation Number " + this.marsh.quotationNumber + "&type=Q" , null).subscribe(
          resulta => {
            
            console.log(resulta);

            if(resulta.status == 1){
              Swal.fire({
                type: 'success',
                title: 'Email Sent!',
                text: "Your insurance proposal was sent to " + emailFinal.slice(0, -1) + ". Please ensure that fopmsecure@mapfreinsurance.com.ph is NOT on your spam/blocked email list. Do check your spam/junk folder in case you have not received any email confirmation and updates from us."
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

  validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  sendEmail(){

    this.emailSend = this.marsh.riskDetails.emailAddress.toLowerCase();

  }

  formatAmount(){
    this.marsh.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.grossPrem));
    this.marsh.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.netPrem));
    this.marsh.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.docStamp));
    this.marsh.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.lgt));
    this.marsh.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.eVat));
    this.marsh.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.premiumTax));
    this.marsh.premiumBreakdown.others = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.others));
    this.marsh.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.fireTax));
  }

  reSubmitQuote(){

    Swal.fire({
      title: 'Quotation Issuance',
      text: "You're about to request another computation of premium for this Quotation, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {

       if(!result.value){
        return null;
      }

      this.marsh.motorDetails.reCompute = "1";

      this.spinner.show();
      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031 = this.common.assignP2000031(this.marsh,this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.common.assignP1001331(this.marsh));
      this.p2000020 = this.common.assignP2000020(this.marsh);
      this.p2000040 = this.common.assignP2000040(this.marsh);
      this.p2000060 = this.common.assignP2000060(this.marsh, 'quote');
      this.p2100610 = this.common.assignP2100610(this.marsh);
      this.p2000025 = this.common.assignP2000025(this.marsh);

      let param = {
        "fName": this.marsh.riskDetails.firstName,
        "mName": this.marsh.riskDetails.middleName,
        "lName": this.marsh.riskDetails.lastName,
        "codDoc": this.marsh.riskDetails.validIDValue,
        "tipDoc": this.marsh.riskDetails.validID,
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "make": this.marsh.motorDetails.manufacturerId,
        "model": this.marsh.motorDetails.modelId,
        "variant": this.marsh.motorDetails.vehicleTypeId,
        "mvNumber": this.marsh.motorDetails.MVFileNumber,
        "plateNumber": this.marsh.motorDetails.plateNumber,
        "engineNumber": this.marsh.motorDetails.motorNumber,
        "chassisNumber":  this.marsh.motorDetails.serialNumber,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.marsh.motorDetails.colorId,
        "year": this.marsh.motorDetails.modelYear,
        "subModel": this.marsh.motorDetails.subModelId,
        "typeOfUse": this.marsh.motorDetails.vehicleUsedId,
        "tipCocafRegistration": "R",
        "reCompute": "1",
        "codRamo": this.marsh.motorDetails.motorTypeId,
        "codModalidad": this.marsh.productId,
        "clientId" : this.marsh.clientId,
        "p2000030" : this.p2000030,
        "p2000031" : this.p2000031,
        "p1001331" : this.p1001331,
        "p1001331List" : this.p1001331List,
        "p2000020List" : this.p2000020,
        "p2000040List" : this.p2000040,
        "p2000060List" : this.p2000060,
        "p2100610List" : this.p2100610,
        "p2000025List" : this.p2000025
      };
      console.log(param);
      this.caller.doCallService('/marsh/issueQuote',param).subscribe(
        result => {
          console.log(result);

          switch(result.status) {
            case 0:
            this.spinner.hide();
              Swal.fire({
                  type: 'error',
                  title: 'Quotation Issuance',
                  text: result.message
                });

              break;

            default:
              this.marsh.quotationNumber = result.message;

              this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ result.message +'&type=C',null).subscribe(
                resultpb => {
                  console.log(resultpb);
                  this.marsh.premiumBreakdown = resultpb;
                  this.router.navigate(['issuance/73015b3208cdee70a4497235463b63d7/'+ result.message ]);
                  this.formatAmount();
                  this.common.scrollToElement("toppest",100);
                  this.spinner.hide();
              });
              break;
          }
          
      });
    
    });
  }

  nextStepAction(){

    if(this.marsh.productId == "10002"){

      this.caller.checkWsdl()
       .subscribe(data => {
         console.log(data);
        var error = data;
            if(error != ""){
               Swal.fire({
                  type: 'error',
                  title: 'LTO Authentication system',
                  text: 'There has been a problem connecting with LTO Authentication system. Please try again later.'
                });
            }else{
              this.nextStep.emit(this.buyNowStep);
            }
       },
       err => {
           Swal.fire({
              type: 'error',
              title: 'LTO Authentication system',
              text: 'There has been a problem connecting with LTO Authentication system. Please try again later.'
            });
       }
       );

    }else{
      this.nextStep.emit(this.buyNowStep);
    }

  	
  }

}
