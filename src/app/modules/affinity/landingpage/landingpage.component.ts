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
  NgxSpinnerService
} from 'ngx-spinner';
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

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit {

  constructor(
    private authenticate: AuthenticationService,
    private auth: AuthService,
    private router: Router,
    private common: CommonService,
    private spinner: NgxSpinnerService,
    private caller: AuthService) {}

  partner: Partner;
  partnerPath: string = "";
  products: ProductLine[] = [];
  availableProducts = [];

  previousPolicies = [];
  previousQuotations = [];

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
    }

    this.getPartnerProducts();
  }

  viewPreviousPolicy() {
    this.previousPolicies = [];
    if (this.affinity.previousIssuances) {
      for (let i = 0; i < this.affinity.previousIssuances.length; i++) {
        if (this.affinity.previousIssuances[i].policyNumber) { 
          const include = _.indexOf(this.availableProducts, this.affinity.previousIssuances[i].productId) != -1;
          if (include) {
            this.previousPolicies.push(this.affinity.previousIssuances[i]);
          }
        }
      }
    }
  }

  viewPreviousQuotation() {
    this.previousQuotations = [];
    if (this.affinity.previousIssuances) {
      for (let i = 0; i < this.affinity.previousIssuances.length; i++) {
        if (this.affinity.previousIssuances[i].quotationNumber) { 
          const include = _.indexOf(this.availableProducts, this.affinity.previousIssuances[i].productId) != -1;
          if (include) {
            this.previousQuotations.push(this.affinity.previousIssuances[i]);
          }
        }
      }
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
    this.auth.getLOV(
      "G6009902_MPH",
      "1",
      'cod_partner~' + this.partner.partnerCode).subscribe(
      result => {
        const productList: Product[] = [];

        if (result.length) {
          result.forEach((r) => {
            const productId = r.COD_MODALIDAD;

            const p: Product = new Product();
            p.productId = productId;
            p.agentCode = r.COD_AGT;
            p.subline = r.COD_RAMO;
            p.groupPolicy = r.NUM_POLIZA_GRUPO;
            p.contract = r.NUM_CONTRATO;
            p.subContract = r.NUM_SUBCONTRATO;
            const active = r.MCA_INH === "N";

            if (active) {
              this.availableProducts.push(productId);
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
    l1.name = "Car";
    l1.thumbnail = "car";
    l1.issuanceType = "motorQuotationIssuance";
    l1.description =
      "Covers the contents such as improvements, furnishings, fixtures, personal effect. <br /> With this policy you’re covered against events such as: " +
      "<br /> - fire, flood, typhoon, and earthquake damages" +
      "<br /> - robbery and burglary <br /> - personal liability";
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
    p3.productId = "33701";
    p3.name = 'Individual Personal';
    const hasIndividual = _.indexOf(this.availableProducts, "33701") != -1;
    if (hasIndividual) {
      l2.products.push(p3);
    }

    const p4 = new ProductList;
    p4.description = 'personalFamilyAccident';
    p4.productId = "33702";
    p4.name = 'Personal Family';
    const hasFamily = _.indexOf(this.availableProducts, "33702") != -1;
    if (hasFamily) {
      l2.products.push(p4);
    }

    if (hasIndividual || hasFamily) {
      this.products.push(l2);
    }
  }

  loadPolicy(issue, type, numPoliza) {
    type = "";

    switch (issue.process) {
      case '1':
        type = "73015b3208cdee70a4497235463b63d7";
        break;
      case '2':
        type = "51359e8b51c63b87d50cb1bab73380e2";
        break;
      case '3':
        type = "73015b3208cdee70a4497235463b63d7";
        break;
      default:
        type = "c453a4b8e8d98e82f35b67f433e3b4da";
        break;
    }

    this.router.navigate(['issuance/' + type + '/' + numPoliza]);
    setTimeout(function () {
      window.location.reload();
    }, 10);
  }

  issuance(product: string, description: String, issuanceType: String) {
    this.issuanceType.emit(issuanceType);
    this.backButton.emit("initialize");
    this.productDetails.emit({
      product,
      description
    });
  }

  // viewCoverage(type, description) {
  //   this.spinner.show();
  //   this.title = description;

  //   this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
  //     result => {
  //       this.coverageList = [];
  //       let coverageHolder = result;
  //       for (let c in coverageHolder) {
  //         for (let d in coverageHolder[c]) {
  //           this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
  //           this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
  //         }
  //         this.coverageList.push(this.coverage);
  //         this.coverage = new Coverages();

  //       }
  //       this.spinner.hide();
  //       this.affinity.coverages = this.coverageList;
  //     });
  // }

  viewCoverage(productId: string) {
    this.common.viewCoverage(productId).subscribe(
      (result: any) => {
        this.affinity.coverages = result;
        console.log('coverageList');
        console.log(result);
      }
    );
    
  }

}