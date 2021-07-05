import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import Swal from 'sweetalert2';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-technical-control',
  templateUrl: './technical-control.component.html',
  styleUrls: ['./technical-control.component.css']
})
export class TechnicalControlComponent implements OnInit {

  constructor(private caller: AuthService) { }

  @Input() marsh: Marsh;
  @Input() line: String;
  @Output() nextStep = new EventEmitter();

  title: String;
  buyNowStep : String;
  technicalControl : String[] = [];

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

  	console.log(this.marsh);
    console.log(this.line);

    this.marsh.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.grossPrem));
    this.marsh.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.netPrem));
    this.marsh.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.docStamp));
    this.marsh.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.lgt));
    this.marsh.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.eVat));
    this.marsh.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.premiumTax));
    this.marsh.premiumBreakdown.others = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.others));
    this.marsh.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.fireTax));

    this.title = "Household";
    this.buyNowStep = "riskInformation";
    if(this.line == "motorQuotationIssuance"){
      this.title = "Motor";
      this.buyNowStep = "motorPolicyIssuance";
    }else if(this.line == "personalInformation"){
      this.title = "Personal Accident";
      this.buyNowStep = "riskInformation";
    }


    for(let i = 1; i < this.marsh.techControl.length; i++){
      if(this.marsh.techControl[i].split("@")[1] != "1"){
        this.technicalControl.push(this.marsh.techControl[i].split("@")[0]);
      }
    }

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;


  }

  nextStepAction(){

    if(this.marsh.productId == "10002"){

      this.caller.doCallService("afnty/cocaf/checkWsdl", null).subscribe(
        result => {
          console.log(result);
          if(result != ""){

            Swal.fire({
              type: 'error',
              title: 'LTO Authentication system',
              text: 'There has been a problem connecting with LTO Authentication system. Please try again later.'
            });

          }else{
           this.nextStep.emit(this.buyNowStep); 
          }
          
      });

    }else{
      this.nextStep.emit(this.buyNowStep);
    }

  	
  }

}
