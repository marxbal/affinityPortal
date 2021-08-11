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
  CommonService
} from 'src/app/services/common.service';

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
    private spinner: NgxSpinnerService,
    private motorIssuance: MotorIssuanceService,
    private paIssuance: PersonalAccidentIssuanceService,
    private common: CommonService) {}

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    this.affinity.clientId = localStorage.getItem(EMAIL);

    if (this.affinity.clientId === null) {
      this.router.navigate(['login']);
    } else {
      this.policyNumber = this.route.snapshot.paramMap.get("policyNumber");
      if (!_.isEmpty(this.policyNumber)) {
        this.retrievePolicyDetails(this.policyNumber);
      } else {
        this.router.navigate([this.auth.getLandingPage()]);
      }
    }
  }

  retrievePolicyDetails(policyNumber) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrievePolicyDetails', policyNumber).subscribe(
      result => {
        this.spinner.hide();
        this.affinity = result;

        this.affinity.paymentReferenceNumber = result.a2990700_mph.numPaymentReference;

        switch (result.p2000030.codRamo) {
          case 337:
            this.paIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res: Affinity) => {
                this.affinity = res;
              });
            break;
          default:
            this.motorIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (res: Affinity) => {
                this.affinity = res;
              });
            break;
        }

        console.log(this.affinity);
        const productId = this.affinity.productId;
        // const type = this.getType(productId);
        if (productId == "33701" || productId == "33702") {
          this.nameLabel = "Primary Insured Name:"
        }

        this.getCoverageDescription(productId);
        this.retrievePaymentStatus(this.policyNumber);
      });
  }

  getCoverageDescription(productId: string) {
    this.common.viewCoverage(productId).subscribe(
      (result: any) => {
        if (!_.isEmpty(result)) {
          this.coverageList = result;
          this.affinity.coverages = result;
        }
      }
    );
  }

  retrievePaymentStatus(policyNumber) {
    this.spinner.show();
    this.paymentStatus = false;
    this.caller.doCallService('/afnty/retrievePaymentStatus', policyNumber).subscribe(
      result => {
        this.spinner.hide();
      });
  }

  retryPayment() {
    this.router.navigate(['issuance/51359e8b51c63b87d50cb1bab73380e2/' + this.policyNumber]);
  }

}
