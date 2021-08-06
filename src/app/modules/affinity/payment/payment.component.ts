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
  CommonService
} from 'src/app/services/common.service';
import {
  PaymentPaynamics
} from 'src/app/objects/payment-paynamics';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private caller: AuthService) {}

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

  municipality: string = "";
  province: string = "";

  ngOnInit() {
    console.log(this.affinity);
    console.log('address1 ' + this.affinity.address1);
    console.log('province ' + this.affinity.province);

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

    this.route.queryParams.subscribe(params => {
      if (params.s) {
        this.retStatus = "failed";
      }
    });

    this.getMunicipalityName();
    this.getProvinceName();
  }

  getProvinceName() {
    const provinceDetailId = this.affinity.province;
    this.caller.getLOV('A1000100', '9', 'COD_PAIS~PHL').subscribe(
      result => {
        result.forEach(province => {
          if (province.COD_PROV == provinceDetailId) {
            this.province = province.NOM_PROV;
          }
        });
      });
  }

  getMunicipalityName() {
    const municipalityDetailId = this.affinity.municipality;
    const provinceDetailId = this.affinity.province;
    this.caller.getLOV('A1000102', '7', 'cod_pais~PHL|cod_prov~' + provinceDetailId).subscribe(
      result => {
        result.forEach(municipality => {
          if (municipality.COD_LOCALIDAD === municipalityDetailId) {
            this.municipality = municipality.NOM_LOCALIDAD;
          }
        });
      });
  }

  requestPayment() {
    const payment = new PaymentPaynamics();

    // payment.requestId = "TEST0000008"; //
    // payment.ipAddress = "192.168.1.1"; //
    // payment.cancelUrl = "https://prd2.mapfreinsurance.com.ph/mivo2/terms-and-condition";
    // payment.mtacUrl = "https://prd2.mapfreinsurance.com.ph/mivo2/terms-and-condition";
    // payment.descriptorNote = "TEST PAYMENT"; //
    payment.firstName = this.affinity.riskDetails.firstName;
    payment.middleName = this.affinity.riskDetails.middleName;
    payment.lastName = this.affinity.riskDetails.lastName;
    payment.address1 = this.affinity.address1;
    // payment.address2 = "Test";

    payment.city = this.municipality;
    payment.state = this.province;
    // payment.country = this.affinity.riskDetails.nationality;
    payment.zip = this.affinity.zipCode;
    payment.email = this.affinity.riskDetails.emailAddress;
    payment.phone = this.affinity.riskDetails.phoneNumber;
    // payment.mobile = "";
    // payment.itemName = "Test Item 1"; //
    // payment.quantity = "1"; //
    payment.amount = this.grossPremSend; //
    // payment.trxType = "sale"; //
    // payment.paymentMethod = "cc"; //
    // payment.responseUrl = "https://prd2.mapfreinsurance.com.ph/paymentservice"; //
    // payment.appNotifUrl = "https://prd2.mapfreinsurance.com.ph/paymentservice/payment/test-payment-notification"; //
    payment.policyNo = this.affinity.policyNumber;

    this.common.payment(payment, "cc");

    // let pDTO: Payment = new Payment();
    // pDTO.numPoliza = this.affinity.policyNumber;
    // pDTO.grossPrem = this.grossPremSend;
    // pDTO.numRecibo = this.affinity.premiumBreakdown.numRecibo;
    // this.caller.doCallService('/afnty/Payment/Request', pDTO).subscribe(
    //   response => {
    //     var mapForm = document.createElement("form");
    //     mapForm.method = "POST"; // or "post" if appropriate
    //     mapForm.action = response.url;

    //     Object.entries(response).forEach((attribute: any[]) => {
    //       if (attribute[0] === 'url') {
    //         return;
    //       }

    //       var mapInput = document.createElement("input");
    //       mapInput.type = "hidden";
    //       mapInput.name = attribute[0].replaceAll('vpc', 'vpc_');
    //       mapInput.setAttribute("value", attribute[1]);
    //       mapForm.appendChild(mapInput);
    //     });

    //     document.body.appendChild(mapForm);
    //     mapForm.submit();
    //   });
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  nextStepAction(nextStep) {
    this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }

}