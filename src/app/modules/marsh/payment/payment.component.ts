import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router,ActivatedRoute} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {Payment} from '../../../objects/payment';
import {Items} from '../../../objects/items';
import { NgxSpinnerService } from 'ngx-spinner';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  
  constructor(private spinner: NgxSpinnerService,
    private caller : AuthService, 
    private route : ActivatedRoute) { }

  @Input() line: String;
  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });
  grossPremSend : string;
  retStatus = "";
  ngOnInit() {

    console.log(this.marsh);
    this.grossPremSend = this.marsh.premiumBreakdown.grossPrem;
    this.marsh.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.grossPrem));
    this.marsh.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.netPrem));
    this.marsh.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.docStamp));
    this.marsh.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.lgt));
    this.marsh.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.eVat));
    this.marsh.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.premiumTax));
    this.marsh.premiumBreakdown.others = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.others));
    this.marsh.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.marsh.premiumBreakdown.fireTax));

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;

    console.log(this.marsh);

    this.route.queryParams.subscribe(params => {
        if(params.s){
          this.retStatus = "failed";
        }
    });

  }

  requestPayment(){
    this.spinner.show();
    let pDTO : Payment = new Payment();
    pDTO.numPoliza = this.marsh.policyNumber;
    pDTO.grossPrem = this.grossPremSend;
    pDTO.numRecibo = this.marsh.premiumBreakdown.numRecibo;
    console.log(pDTO);
    this.caller.doCallService('/afnty/Payment/Request',pDTO).subscribe(
      response => {
        var mapForm = document.createElement("form");
        mapForm.method = "POST"; // or "post" if appropriate
        mapForm.action = response.url;

        Object.entries(response).forEach((attribute: any[]) => {
          if (attribute[0] === 'url') {
            return;
          }

          var mapInput = document.createElement("input");
          mapInput.type = "hidden";
          mapInput.name = attribute[0].replaceAll('vpc', 'vpc_');
          mapInput.setAttribute("value", attribute[1]);
          mapForm.appendChild(mapInput);
        });

        document.body.appendChild(mapForm);
        mapForm.submit();
    });
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  nextStepAction(nextStep){
  	this.nextStep.emit(nextStep);
    this.marshOutput.emit(this.marsh);
  }

}