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

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent implements OnInit {

  affinity: Affinity = new Affinity();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caller: AuthService,
    private auth: AuthenticationService,
    private spinner: NgxSpinnerService,
    private motorIssuance: MotorIssuanceService,
    private paIssuance: PersonalAccidentIssuanceService) {}

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    this.affinity.clientId = localStorage.getItem(EMAIL);

    if (this.affinity.clientId === null) {
      this.router.navigate(['login']);
    } else {
      const policyNumber = this.route.snapshot.paramMap.get("policyNumber");
      this.retrieveTransactions();
      if (!_.isEmpty(policyNumber)) {
        this.retrievePolicyDetails(policyNumber);
        console.log(this.affinity);
        const type = this.getType(this.affinity.productId);
        this.getCoverageDescriptions(type);
      } else {
        this.router.navigate([this.auth.getLandingPage()]);
      }
    }
  }

  getType(productId: string) {
    let itemName = "";

    switch (productId) {
      case "10001":
        itemName = "motorComprehensice";
        break;
      case "10002":
        itemName = "motorCTPL";
        break;
      case "33701":
        itemName = "personalAccident";
        break;
      case "33702":
        itemName = "personalFamilyAccident";
        break;
    }

    return itemName;
  }

  retrieveTransactions() {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrieveTransactions', this.affinity.clientId).subscribe(
      result => {
        this.spinner.hide();
        let newResult = _.orderBy(result, ['transactionNumber'], ['desc']);
        this.affinity.previousIssuances = newResult;

        for (let i = 0; i < this.affinity.previousIssuances.length; i++) {
          if (this.affinity.previousIssuances[i].policyNumber) {
            for (let x = 0; x < this.affinity.previousIssuances[i].iDTO.a2000020List.length; x++) {
              switch (this.affinity.previousIssuances[i].iDTO.a2000020List[x].codCampo) {
                case "COD_MODALIDAD":
                  this.affinity.previousIssuances[i].productId = this.affinity.previousIssuances[i].iDTO.a2000020List[x].valCampo;
                  break;
                default:
                  break;
              }
            }
          } else {
            for (let x = 0; x < this.affinity.previousIssuances[i].iDTO.p2000020List.length; x++) {
              switch (this.affinity.previousIssuances[i].iDTO.p2000020List[x].codCampo) {
                case "COD_MODALIDAD":
                  this.affinity.previousIssuances[i].productId = this.affinity.previousIssuances[i].iDTO.p2000020List[x].valCampo;
                  break;
                default:
                  break;
              }
            }
          }
        }
      });
  }

  retrievePolicyDetails(policyNumber) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrievePolicyDetails', policyNumber).subscribe(
      result => {
        this.spinner.hide();

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
      });
  }

  getCoverageDescriptions(type: string) {
    this.spinner.show();
    this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
      result => {
        this.spinner.hide();
        this.coverageList = [];
        let coverageHolder = result;
        for (let c in coverageHolder) {
          for (let d in coverageHolder[c]) {
            this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
            this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
          }
          this.coverageList.push(this.coverage);
          this.coverage = new Coverages();
        }

        this.affinity.coverages = this.coverageList;
      });
  }

}
