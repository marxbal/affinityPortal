import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import {
  Affinity
} from '../../../objects/affinity';
import {
  Payment
} from '../../../objects/payment';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  AuthService
} from '../../../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService,
    private caller: AuthService,
    private route: ActivatedRoute) {}

  @Input() line: String;
  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });
  grossPremSend: string;
  retStatus = "";

  ngOnInit() {
    console.log(this.affinity);
    this.grossPremSend = this.affinity.premiumBreakdown.grossPrem;
    this.affinity.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.grossPrem));
    this.affinity.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.netPrem));
    this.affinity.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.docStamp));
    this.affinity.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.lgt));
    this.affinity.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.eVat));
    this.affinity.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.premiumTax));
    this.affinity.premiumBreakdown.others = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.others));
    this.affinity.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.fireTax));

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;

    console.log(this.affinity);

    this.route.queryParams.subscribe(params => {
      if (params.s) {
        this.retStatus = "failed";
      }
    });
  }

  requestPayment() {
    this.spinner.show();
    let pDTO: Payment = new Payment();
    pDTO.numPoliza = this.affinity.policyNumber;
    pDTO.grossPrem = this.grossPremSend;
    pDTO.numRecibo = this.affinity.premiumBreakdown.numRecibo;
    console.log(pDTO);
    this.caller.doCallService('/afnty/Payment/Request', pDTO).subscribe(
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

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  nextStepAction(nextStep) {
    this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }

}