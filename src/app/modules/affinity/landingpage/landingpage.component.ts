import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import {
  AuthenticationService
} from '../../../services/authentication.service';
import {
  Router
} from '@angular/router';
import {
  Affinity
} from '../../../objects/affinity';
import {
  Partner
} from 'src/app/objects/partner';
import {
  ProductLine
} from 'src/app/objects/product-line';
import {
  ProductList
} from 'src/app/objects/product-list';
import {
  AuthService
} from 'src/app/services/auth.service';
import {
  Coverages
} from 'src/app/objects/coverages';
import {
  Product
} from 'src/app/objects/product';
import {
  CommonService
} from 'src/app/services/common.service';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import * as m from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private authenticate: AuthenticationService,
    private auth: AuthService,
    private router: Router,
    private common: CommonService,
    private spinner: NgxSpinnerService) {}

  partner: Partner;
  partnerPath: string = "";
  products: ProductLine[] = [];
  availableProducts = [];
  availableSubline = [];

  viewPolicies = false;
  previousPolicies = [];

  viewQuotations = false;
  previousQuotations = [];

  showTransactions = true;

  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();
  title: String = "";

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  @Input() affinity: Affinity;
  @Output() issuanceType = new EventEmitter();
  @Output() backButton = new EventEmitter();
  @Output() productDetails = new EventEmitter();

  ngOnInit() {
    this.partner = this.authenticate.getPartner() as Partner;
    if (!_.isEmpty(this.partner)) {
      this.partnerPath = _.toLower(this.partner.partnerName);
      this.showTransactions = !this.partner.auto;
    }

    this.common.storeSuffixList();
    this.getPartnerProducts();
    this.retrieveTransactions();
  }

  retrieveTransactions() {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrieveTransactions', this.affinity.clientId).subscribe(
      result => {
        this.spinner.hide();
        let newResult = _.orderBy(result, ['numTransaction'], ['desc']);

        this.affinity.previousIssuances = newResult;
        for (let i = 0; i < this.affinity.previousIssuances.length; i++) {
          const details = this.affinity.previousIssuances[i];
          const process = details.codProcess;

          const status = details.tipStatus;
          if (process == 1) {
            this.previousQuotations.push(details);
            details.buttonTitle = status == 2 ? 'Quotation with TC' : 'Load Quotation';
          } else {
            this.previousPolicies.push(details);
            if (process == 2) {
              details.buttonTitle = status == 2 ? 'Policy with TC' : 'Load Policy';
            } else if (process == 3) {
              details.buttonTitle = status == 2 ? 'Payment Failed' : 'Paid';
            } else if (process == 4) {
              details.buttonTitle = status == 2 ? 'Verication Failed' : 'COC Verified';
            }
          }

          const subline = details.codRamo;
          const issuedDate = m(details.fecActu);
          var iscurrentDate = issuedDate.isSame(new Date(), "day");

          details.isRetro = false;
          switch (subline) {
            case 120:
              details.title = 'Motorcycle Vehicle';
              details.icon = 'fa-car';
              break;
            case 323:
              details.title = 'Individual Personal';
              details.icon = 'fa-shield';
              details.isRetro = !iscurrentDate;
              break;
            case 324:
              details.title = 'Family Personal';
              details.icon = 'fa-shield';
              details.isRetro = !iscurrentDate;
              break;
            default:
              details.title = 'Private Vehicle';
              details.icon = 'fa-car';
              break;
          }
        }
      });
  }

  viewPreviousPolicy() {
    this.viewPolicies = !this.viewPolicies;
    if (this.viewPolicies) {
      this.common.scrollToElement("quotation-wrapper", 100);
    }
  }

  viewPreviousQuotation() {
    this.viewQuotations = !this.viewQuotations;
    if (this.viewPolicies) {
      this.common.scrollToElement("policy-wrapper", 100);
    }
  }

  //smooth scroll to preferred html element
  scroll(id: string) {
    //buffer if id is hidden
    setTimeout(() => {
      var el = document.getElementById(id);
      if (!_.isUndefined(el)) {
        el.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }, 500);
  }

  getPartnerProducts() {
    this.spinner.show();
    this.auth.getLOV(
      "G6009902_MPH",
      "1",
      'cod_partner~' + this.partner.partnerCode).subscribe(
      result => {
        this.spinner.hide();
        const productList: Product[] = [];

        if (result.length) {
          result.forEach((r) => {
            const productId = r.COD_MODALIDAD;
            const subline = r.COD_RAMO;

            const p: Product = new Product();
            p.productId = productId;
            p.agentCode = r.COD_AGT;
            p.subline = subline;
            p.groupPolicy = r.NUM_POLIZA_GRUPO;
            p.contract = r.NUM_CONTRATO;
            p.subContract = r.NUM_SUBCONTRATO;
            const active = r.MCA_INH === "N";

            if (active) {
              this.availableProducts.push(productId);
              this.availableSubline.push(subline);
              productList.push(p);
            }
          });

          this.authenticate.setProducts(productList);

          this.displayProducts();
        }
      });
  }

  displayProducts() {
    const l1 = new ProductLine;
    // l1.name = "Car and Motorcycle";
    l1.thumbnail = "car";
    l1.issuanceType = "motorQuotationIssuance";
    // l1.description =
    //   "Comprehensive insurance with all your basic coverage needs.<br /> <br /> " +
    //   "This policy covers you against loss and accidental damage to the vehicle as well as " +
    //   "legal liabilities to third parties in case of bodily injury and physical damage to properties.";
    l1.products = [];

    const p1 = new ProductList;
    p1.description = 'motorComprehensive';
    p1.productId = "10001";
    p1.name = 'Comprehensive';
    const hasComprehensive = _.indexOf(this.availableProducts, "10001") != -1;
    if (hasComprehensive) {
      l1.products.push(p1);
    }

    const p2 = new ProductList;
    p2.description = 'motorCTPL';
    p2.productId = "10002";
    p2.name = 'CTPL';
    const hasCTPL = _.indexOf(this.availableProducts, "10002") != -1;
    if (hasCTPL) {
      l1.products.push(p2);
    }

    if (hasComprehensive && !hasCTPL) {
      l1.description =
      "Comprehensive insurance with all your basic coverage needs.<br /> <br /> " +
      "This policy covers you against loss and accidental damage to the vehicle as well as " +
      "legal liabilities to third parties in case of bodily injury and physical damage to properties.";
    } else if (!hasComprehensive && hasCTPL) {
      l1.description =
      "CTPL insurance covers you against accidental damage to third parties in case of bodily injury.";
    } else {
      l1.description =
      "Comprehensive and CTPL insurance with all your basic coverage needs.<br /> <br /> " +
      "This policy covers you against loss and accidental damage to the vehicle as well as " +
      "legal liabilities to third parties in case of bodily injury and physical damage to properties.";
    }

    const hasCar = _.indexOf(this.availableSubline, "100") != -1;
    const hasMotor = _.indexOf(this.availableSubline, "120") != -1;

    if (hasCar && !hasMotor) {
      l1.name = "Car";
    } else if (!hasCar && hasMotor) {
      l1.name = "Motorcycle"
    } else {
      l1.name = "Car and Motorcycle";
    }

    if (hasCTPL || hasComprehensive) {
      this.products.push(l1);
    }

    const l2 = new ProductLine;
    l2.name = "Accident";
    l2.thumbnail = "accident";
    l2.issuanceType = "personalInformation";
    l2.description =
      "Provides protection 24 hours a day, 7 days a week and 365 days a year for family members.<br /><br />" +
      "This comprehensive personal accident insurance includes additional assistance benefits aside from the " +
      "standard accidental death and permanent disability benefits. ";
    l2.products = [];

    const p3 = new ProductList;
    p3.description = 'personalAccident';
    p3.productId = "32301";
    p3.name = 'Individual Personal Accident';
    const hasIndividual = _.indexOf(this.availableProducts, "32301") != -1;
    if (hasIndividual) {
      l2.products.push(p3);
    }

    const p4 = new ProductList;
    p4.description = 'personalFamilyAccident';
    p4.productId = "32401";
    p4.name = 'Family Personal Accident';
    const hasFamily = _.indexOf(this.availableProducts, "32401") != -1;
    if (hasFamily) {
      l2.products.push(p4);
    }

    if (hasIndividual || hasFamily) {
      this.products.push(l2);
    }
  }

  loadPolicy(issue: any, type: string, numPoliza: string) {
    type = "";

    switch (issue.codProcess) {
      case 1:
        type = "73015b3208cdee70a4497235463b63d7";
        break;
      case 2:
        type = "51359e8b51c63b87d50cb1bab73380e2";
        break;
      case 3:
        type = "51359e8b51c63b87d50cb1bab73380e2";
        break;
      case 4:
        // type = "73015b3208cdee70a4497235463b63d7";
        type = "51359e8b51c63b87d50cb1bab73380e2";
        break;
      default:
        type = "c453a4b8e8d98e82f35b67f433e3b4da";
        break;
    }

    this.router.navigateByUrl('issuance/' + type + '/' + numPoliza);

    // this.router.navigate(['issuance/' + type + '/' + numPoliza]).then(() => {
    //   window.location.reload();
    // });
    // setTimeout(function () {
    //   window.location.reload();
    // }, 10);
  }

  openRetroInfo() {
    Swal.fire({
      type: 'warning',
      title: 'Unable to Load Quotation',
      text: "Your quotation's effectivity date is earlier than today, please create a new quotation."
    });
  }

  issuance(product: string, description: String) {
    this.issuanceType.emit(product);
    this.backButton.emit("initialize");
    this.productDetails.emit({
      product,
      description
    });
  }

  viewCoverage(productId: string) {
    this.common.viewCoverage(productId).subscribe(
      (result: any) => {
        if (!_.isEmpty(result)) {
          this.coverageList = result;
          this.affinity.coverages = result;
        }
      }
    );
  }

}