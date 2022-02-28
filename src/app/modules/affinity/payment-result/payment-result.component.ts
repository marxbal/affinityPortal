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
import { Partner } from 'src/app/objects/partner';

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
  showImage: boolean = false;
  nameLabel: string = "Client Name:";
  requestId: string = "";
  policyNumber: string = "";
  total: number;
  line: number = 1;
  title: string = "";
  address: string = "";
  interestInsured: string = "";
  emailSend: string = "";
  showPrint: boolean = true;
  isCTPL: boolean = false;
  isAuthenticated: boolean = false;
  chatEmail: string = "";
  
  type = {
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

    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.chatEmail = partner.chatEmail;
    }

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
        const subline = result.p2000030.codRamo;
        this.isCTPL = "10002" == productId;
        this.line = this.common.getLinebyProduct(productId);
        this.title = this.getPolicyTitle(productId);

        if (this.isCTPL) {
          this.checkAuthentication(subline, policyNumber);
        }

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
  }

  getPolicyTitle(productId: string) {
    let title = "";
    switch (productId) {
      case "10001":
        title = "COMPREHENSIVE CAR POLICY";
        break;
      case "10002":
        title = "CTPL POLICY";
        break;
      case "32301":
        title = "INDIVIDUAL PERSONAL ACCIDENT POLICY";
        break;
      case "32401":
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
    return this.addComma(affinity.address1) + this.addComma(this.affinity.municipalityName) + this.addComma(this.affinity.provinceName) + affinity.zipCode;
  }

  addComma(val: string) {
    return _.isEmpty(val) ? "" : val.toUpperCase() + ", ";
  }

  getResponseCode(requestId: string) {
    this.spinner.show();
    this.paymentService.getResponseCode(requestId).subscribe(
      (res: Return) => {
        if (!_.isEmpty(res)) {
          this.showImage = true;
          this.spinner.hide();
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

  checkAuthentication(subline: number, policyNumber: string) {
    this.spinner.show();
    this.paymentService.checkAuthentication(subline, policyNumber).subscribe(
      (res: Return) => {
        if (!_.isEmpty(res)) {
          this.spinner.hide();
          if (res.status) {
            this.isAuthenticated = Boolean(res.obj);
            this.showPrint = this.isAuthenticated;
          } else {
            Swal.fire({
              type: 'error',
              title: 'COCAF Check Authentication',
              text: res.message
            });
          }
        }
      }
    )
  }

  sendEmail() {
    this.emailSend = this.affinity.riskDetails.emailAddress.toLowerCase();
  }

  submitSendEmail() {
    this.common.emailPolicy(this.emailSend, this.affinity.policyNumber, "P");
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
