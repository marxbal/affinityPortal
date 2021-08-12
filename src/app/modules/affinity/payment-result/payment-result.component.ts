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
  policyNumber: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caller: AuthService,
    private auth: AuthenticationService,
    private authService: AuthenticationService,
    private spinner: NgxSpinnerService,
    private motorIssuance: MotorIssuanceService,
    private paIssuance: PersonalAccidentIssuanceService,
    private paymentService: PaymentService) {}

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
      this.route.queryParams
        .subscribe(params => {
          var requestId = params.requestId;
          this.policyNumber = this.route.snapshot.paramMap.get("policyNumber");
          if (!_.isEmpty(this.policyNumber)) {
            this.getResponseCode(requestId);
            this.retrievePolicyDetails(this.policyNumber);
          } else {
            this.router.navigate([this.auth.getLandingPage()]);
          }
        });
    }
  }

  retrievePolicyDetails(policyNumber: string) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrievePolicyDetails', policyNumber).subscribe(
      result => {
        this.spinner.hide();

        this.affinity.paymentReferenceNumber = result.a2990700_mph.numPaymentReference;

        switch (result.p2000030.codRamo) {
          case 337:
            this.paIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res) => {
                if (!_.isEmpty(res)) {
                  this.affinity = res;
                  this.getMoreDetails();
                }
              });
            break;
          default:
            this.motorIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res) => {
                if (!_.isEmpty(res)) {
                  this.affinity = res;
                  this.getMoreDetails();
                }
              });
            break;
        }
      });
  }

  getMoreDetails() {
    const productId = this.affinity.productId;
    if (productId == "33701" || productId == "33702") {
      this.nameLabel = "Primary Insured Name:"
    }
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

  retryPayment() {
    this.router.navigate(['issuance/51359e8b51c63b87d50cb1bab73380e2/' + this.policyNumber]);
  }

  returnToHomepage() {
    const landingPage  =this.authService.getLandingPage();
    this.router.navigate([landingPage]);
  }

}
