import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  EMAIL
} from 'src/app/constants/local.storage';
import {
  Affinity
} from 'src/app/objects/affinity';
import {
  AuthService
} from 'src/app/services/auth.service';
import * as _ from 'lodash';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  MotorIssuanceService
} from 'src/app/services/motor-issuance.service';
import {
  PersonalAccidentIssuanceService
} from 'src/app/services/personal-accident-issuance.service';
import {
  Coverages
} from 'src/app/objects/coverages';
import {
  Return
} from 'src/app/objects/return';
import Swal from 'sweetalert2';
import {
  PaymentService
} from 'src/app/services/payment.service';
import {
  CommonService
} from 'src/app/services/common.service';
import {
  ACCIDENT,
  CAR
} from 'src/app/objects/line';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent implements OnInit {

  affinity: Affinity = new Affinity();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();
  paymentStatus: boolean = false;
  nameLabel: string = "Client Name:";
  requestId: string = "";
  policyNumber: string = "";
  total: number;
  line: number = 1;
  title: string = "";
  address: string = "";
  interestInsured: string = "";
  type: Object = {
    car: CAR,
    accident: ACCIDENT
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caller: AuthService,
    private auth: AuthenticationService,
    private authService: AuthenticationService,
    private spinner: NgxSpinnerService,
    private motorIssuance: MotorIssuanceService,
    private paIssuance: PersonalAccidentIssuanceService,
    private paymentService: PaymentService,
    private common: CommonService) {}

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    this.affinity = new Affinity();
    this.affinity.clientId = localStorage.getItem(EMAIL);

    if (this.affinity.clientId === null) {
      this.router.navigate(['login']);
    } else {
      this.requestId = this.route.snapshot.paramMap.get("requestId");
      this.policyNumber = this.route.snapshot.paramMap.get("policyNumber");
      if (!_.isEmpty(this.policyNumber)) {
        this.getResponseCode(this.requestId);
        this.retrievePolicyDetails(this.policyNumber);
      } else {
        this.router.navigate([this.auth.getLandingPage()]);
      }
    }
  }

  retrievePolicyDetails(policyNumber: string) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrievePolicyDetails', policyNumber).subscribe(
      result => {
        this.spinner.hide();
        this.affinity.paymentReferenceNumber = result.a2990700_mph.numPaymentReference;
        const productId = this.common.getP20Value(result.a2000020List, 'COD_MODALIDAD');

        this.line = this.common.getLinebyProduct(productId);
        this.title = this.getPolicyTitle(productId);

        switch (this.line) {
          case ACCIDENT:
            this.nameLabel = "Primary Insured Name:";
            this.paIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res: Affinity) => {
                if (!_.isEmpty(res)) {
                  this.affinity = res;
                  this.getMoreDetails();
                }
              });
            break;
          default:
            this.nameLabel = "Client Name:";
            this.motorIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res: Affinity) => {
                if (!_.isEmpty(res)) {
                  this.affinity = res;
                  this.buildInterstInsured(this.affinity);
                  this.getMoreDetails();
                }
              });
            break;
        }
      });
  }

  getMoreDetails() {
    this.total = parseFloat(this.affinity.premiumBreakdown.grossPrem);
    this.address = this.buildAddress(this.affinity);
    console.log(this.affinity);
  }

  getPolicyTitle(productId: string) {
    let title = "";
    switch (productId) {
      case "10001":
        title = "COMPREHENSIVE CAR POLICY";
        break;
      case "10002":
        title = "CTPL CAR POLICY";
        break;
      case "33701":
        title = "INDIVIDUAL PERSONAL ACCIDENT POLICY";
        break;
      case "33702":
        title = "PERSONAL FAMILY ACCIDENT POLICY";
        break;
    }
    return title;
  }

  buildInterstInsured(affinity: Affinity) {
    const motor = affinity.motorDetails;
    this.interestInsured = motor.modelYear + " " + motor.manufacturer + " " + motor.model + " " + motor.subModel + " " + motor.vehicleType;
  }

  buildAddress(affinity: Affinity) {
    return this.addComma(affinity.address1) + this.addComma(affinity.municipality) + this.addComma(affinity.province) + affinity.zipCode;
  }

  addComma(val: string) {
    return _.isEmpty(val) ? "" : val.toUpperCase() + ", ";
  }

  getResponseCode(requestId: string) {
    this.paymentService.getResponseCode(requestId).subscribe(
      (res: Return) => {
        if (!_.isEmpty(res)) {
          if (res.status) {
            const code = res.obj.toString();
            this.paymentStatus = code == "GR001" || code == "GR002";
          } else {
            Swal.fire({
              type: 'error',
              title: 'Payment Transaction',
              text: res.message
            });
          }
        }
      }
    )
  }

  printPolicy(){
    this.common.print(this.policyNumber, "P");
  }

  retryPayment() {
    this.router.navigate(['issuance/51359e8b51c63b87d50cb1bab73380e2/' + this.policyNumber]);
  }

  returnToHomepage() {
    const landingPage  =this.authService.getLandingPage();
    this.router.navigate([landingPage]);
  }

}
