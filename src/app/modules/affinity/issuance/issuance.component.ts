import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Affinity
} from '../../../objects/affinity';
import {
  AuthService
} from '../../../services/auth.service';
import {
  Coverages
} from '../../../objects/coverages';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  CommonService
} from '../../../services/common.service';
import {
  MotorIssuanceService
} from '../../../services/motor-issuance.service';
import {
  PersonalAccidentIssuanceService
} from '../../../services/personal-accident-issuance.service';
import {
  MotorAccessories
} from '../../../objects/motor-accessories';
import * as _ from 'lodash';
import {
  EMAIL
} from 'src/app/constants/local.storage';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  ACCIDENT,
  CAR
} from 'src/app/objects/line';

@Component({
  selector: 'app-issuance',
  templateUrl: './issuance.component.html',
  styleUrls: ['./issuance.component.css']
})
export class IssuanceComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private common: CommonService,
    private motorIssuance: MotorIssuanceService,
    private paIssuance: PersonalAccidentIssuanceService,
    private auth: AuthenticationService) {}

  templateRouter: String;
  line: String;
  backButton: String;
  affinity: Affinity;

  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();

  product: string;
  description: String;

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    // this.templateRouter = "riskInformation";
    this.affinity = new Affinity();
    this.affinity.clientId = localStorage.getItem(EMAIL);

    if (this.affinity.clientId === null) {
      this.router.navigate(['login']);
    } else {
      // this.affinity.clientId = localStorage.getItem("userCardId");

      let numPoliza = this.route.snapshot.paramMap.get("numPoliza");
      let type = this.route.snapshot.paramMap.get("type");

      this.line = "";
      this.templateRouter = "initialize";

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

      if (numPoliza) {
        switch (type) {
          case "988fd738de9c6d177440c5dcf69e73ce":
            this.router.navigate([], {
              queryParams: {
                numPoliza: numPoliza,
                clientId: this.affinity.clientId
              },
              queryParamsHandling: 'merge',
            });

            this.processPayment(numPoliza);
            break;
          case "51359e8b51c63b87d50cb1bab73380e2":
            this.returnPayment(numPoliza, "policy");
            break;
          case "c453a4b8e8d98e82f35b67f433e3b4da":
            this.returnPayment(numPoliza, "payment");
            break;
          default:
            this.retrieveQuote(numPoliza);
            break;
        }
      }
    }
  }

  processPayment(numPoliza) {
    this.route.queryParams.subscribe(params => {
      if (!params.clientId) {
        return null;
      }

      if (params.vpc_Message == null) {
        //for OTC transaction
      } else if (params.vpc_Message != 'Approved') {
        window.location.href = params.AgainLink + "?s=f";
      } else {
        if (params != null) {
          this.affinity.paymentConfirmed = params.vpc_Message;
          this.validateGlobalPay(JSON.stringify(params), numPoliza);
        }
      }
    });
  }

  validateGlobalPay(params, numPoliza) {
    this.caller.doCallService('/afnty/validateGlobalPay', params).subscribe(
      result => {
        this.returnPayment(numPoliza, "policy");
      });
  }

  returnPayment(numPoliza, action) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrievePolicyDetails', numPoliza).subscribe(
      result => {
        const line = this.common.getLinebySubline(result.p2000030.codRamo);

        switch (line) {
          // case 251:
          //   this.propertyIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
          //     (resulta) => {
          //       this.affinity = resulta;
          //       this.retrivePolicyNavigate(result, action);
          //     });
          //   break;
          case ACCIDENT:
            this.paIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (resulta) => {
                this.affinity = resulta;
                this.retrievePolicyNavigate(result, action);
              });
            break;
          default:
            this.motorIssuance.mapRetrievePolicy(this.affinity, result).subscribe(
              (resulta) => {
                this.affinity = resulta;
                this.retrievePolicyNavigate(result, action);
              });
            break;
        }
      });
  }

  retrievePolicyNavigate(result, action) {
    if (this.affinity.premiumBreakdown) {
      this.templateRouter = action;
      if (result.p2000030.mcaProvisional == "S") {
        this.affinity.techControl = result.techControlMessage.split("~");
        this.affinity = this.common.identifyTechControl(this.affinity);

        this.templateRouter = "techControl";
      // } else if (result.a2990700_mph.mcaCollectMivo == null) {
      //   this.affinity.paymentReferenceNumber = result.a2990700_mph.numPaymentReference;
      //   this.templateRouter = "payment";
      }

      this.line = "motorQuotationIssuance";
      this.spinner.hide();

      // if (this.templateRouter == "policy") {
      //   this.router.navigateByUrl("/payment-result/" + this.affinity.policyNumber + "/" + result.a2990700_mph.numPaymentReference);
      // }
    }
  }

  retrieveQuote(numPoliza) {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrieveQuotationDetails', numPoliza).subscribe(
      result => {
        const line = this.common.getLinebySubline(result.p2000030.codRamo);

        switch (line) {
          // case 251:
          //   this.propertyIssuance.mapRetrieveQuote(this.affinity, result).subscribe(
          //     (resulta) => {
          //       this.affinity = resulta;
          //       this.retrieveQuoteNavigate(result, 'householdQuotationIssuance');
          //     });

          //   // this.affinity = this.motorIssuance.mapRetrieveQuote(this.affinity, result);
          //   break;
          case ACCIDENT:
            this.paIssuance.mapRetrieveQuote(this.affinity, result).subscribe(
              (resulta) => {
                this.affinity = resulta;
                this.retrieveQuoteNavigate(result, 'personalInformation');
              });
            break;
          default:
            this.motorIssuance.mapRetrieveQuote(this.affinity, result).subscribe(
              (resulta) => {
                this.affinity = resulta;
                this.retrieveQuoteNavigate(result, 'motorQuotationIssuance');
              });
            break;
        }
      });
  }

  retrieveQuoteNavigate(result, route) {
    if (this.affinity.premiumBreakdown) {
      this.assignP2161ToAccessory(result.p2100610List);
      this.templateRouter = "issueQuotation";
      if (result.p2000030.mcaProvisional == "S") {

        this.affinity.techControl = result.techControlMessage.split("~");
        this.affinity = this.common.identifyTechControl(this.affinity);

        this.templateRouter = "techControl";
      }
      this.line = route;
      this.spinner.hide();
    }
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  assignP2161ToAccessory(p21006100) {
    for (let i = 0; i < p21006100.length; i++) {
      let temp: MotorAccessories = new MotorAccessories();

      temp.accessoryId = p21006100[i]['codAccesorio'];
      temp.accessoryName = p21006100[i]['nomAccesorio'];
      temp.accessoryValue = p21006100[i]['impAccesorio'];
      temp.accessoryDescription = p21006100[i]['txtAccesorio'];

      // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) + parseInt(p21006100[i]['impAccesorio'])).toString();

      this.affinity.motorDetails.accessories.push(temp);
    }
  }

  backButtonAction(backButton) {
    this.backButton = backButton;
  }

  productDetails(param: any) {
    this.product = param.product;
    this.description = param.description;
  }

  nextStepAction(nextStep) {
    this.templateRouter = nextStep;
    this.scrollToTop();
  }

  nextStepActionQuoteIssuance(nextStep: string) {
    const productId = nextStep
    this.affinity.productId = productId;

    const line = this.common.getLinebyProduct(productId);

    switch (line) {
      case CAR:
        this.line = "motorQuotationIssuance";
        this.affinity.lineId = "100"
        break;
      case ACCIDENT:
        this.line = "personalInformation";
        const products = this.auth.getProducts();
        products.forEach((p) => {
          const id = p.productId.toString();
          if (productId == id) {
            this.affinity.lineId = p.subline.toString();
          }
        });
        break;
      default:
        this.line = "motorQuotationIssuance";
        this.affinity.lineId = "100"
        break;
    }

    this.templateRouter = this.line;
    this.scrollToTop();
  }

  affinityOutput(affinityOutput) {
    this.affinity = affinityOutput;
  }

  scrollToTop() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 50); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }
}