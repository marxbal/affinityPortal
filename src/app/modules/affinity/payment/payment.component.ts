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
  CommonService
} from 'src/app/services/common.service';
import {
  AuthService
} from 'src/app/services/auth.service';
import {
  DecimalPipe
} from '@angular/common';
import {
  ACCIDENT,
  CAR
} from 'src/app/objects/line';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private caller: AuthService,
    private decimalPipe: DecimalPipe) {}

  @Input() line: String;
  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  total: string;
  retStatus = "";

  municipality: string = "";
  province: string = "";

  lineId: number = 1;
  type = {
    car: CAR,
    accident: ACCIDENT
  }

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    const premium = parseFloat(this.affinity.premiumBreakdown.grossPrem);
    this.total =  this.decimalPipe.transform(premium, '1.2-2');
    this.lineId = this.common.getLinebyProduct(this.affinity.productId);

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

  getProductDescription(productId: string) {
    let productName = "";

    switch (productId) {
      case "10001":
        productName = "COMPREHENSIVE 10001";
        break;
      case "10002":
        productName = "CTPL 10002";
        break;
      case "33701":
        productName = "INDIVIDUAL PERSONAL 33701";
        break;
      case "33702":
        productName = "PERSONAL FAMILY 33702";
        break;
    }

    return productName;
  }

  getItemName(productId: string) {
    let itemName = "";

    switch (productId) {
      case "10001":
        itemName = "COMPREHENSIVE: " + this.buildItemName();
        break;
      case "10002":
        itemName = "CTPL: " + this.buildItemName();
        break;
      case "33701":
        itemName = "INDIVIDUAL PERSONAL: " + this.affinity.riskDetails.fullName;
        break;
      case "33702":
        itemName = "PERSONAL FAMILY: " + this.affinity.riskDetails.fullName;
        break;
    }

    return itemName;
  }

  buildItemName() {
    let item = '';
    const motor = this.affinity.motorDetails;

    const modelYear = motor.modelYear + " ";
    const manufacturer = motor.manufacturer + " ";
    const model = motor.model + " ";
    const subModel = motor.subModel + " ";

    item = modelYear + manufacturer + model + subModel + motor.vehicleType;

    return item;
  }

  requestPayment() {
    this.common.payment(this.affinity);
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  nextStepAction(nextStep) {
    this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }

}