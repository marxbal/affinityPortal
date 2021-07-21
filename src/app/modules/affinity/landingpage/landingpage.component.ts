import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
// import * as $ from 'jquery/dist/jquery.min';
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

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit {

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private caller: AuthService ) {}

  partnerPath: string = "";
  products: ProductLine[] = [];

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
    console.log(this.affinity);

    const partner = this.auth.getPartner() as Partner;
    console.log(partner);

    if (!_.isEmpty(partner)) {
      this.partnerPath = partner.partnerName;
    }

    this.getProducts();
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

  getProducts() {
    const l1 = new ProductLine;
    l1.name = "Car";
    l1.badge = "fa-car";
    l1.thumbnail = "car";
    l1.issuanceType = "motorQuotationIssuance";
    l1.description =
      "Covers the contents such as improvements, furnishings, fixtures, personal effect. <br /> With this policy you’re covered against events such as: " +
      "<br /> - fire, flood, typhoon, and earthquake damages" +
      "<br /> - robbery and burglary <br /> - personal liability";

    const p1 = new ProductList;
    p1.description = 'motorComprehensive';
    p1.productId = "10001";
    p1.name = 'Comprehensive';

    const p2 = new ProductList;
    p2.description = 'motorCTPL';
    p2.productId = "10002";
    p2.name = 'CTPL';

    l1.products = [p1, p2];
    this.products.push(l1);

    const l2 = new ProductLine;
    l2.name = "Accident";
    l2.badge = "fa-shield";
    l2.thumbnail = "accident";
    l2.issuanceType = "personalInformation";
    l2.description =
      "Provides protection 24 hours a day, 7 days a week and 365 days a year for family members.<br /><br />" +
      "This comprehensive personal accident insurance includes additional assistance benefits aside from the " +
      "standard accidental death and permanent disability benefits. ";

    const p3 = new ProductList;
    p3.description = 'personalAccident';
    p3.productId = "33701";
    p3.name = 'Individual Personal';

    const p4 = new ProductList;
    p4.description = 'personalFamilyAccident';
    p4.productId = "33702";
    p4.name = 'Personal Family';

    l2.products = [p3, p4];
    this.products.push(l2);

    console.log(this.products);
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

  // householdIssuance() {
  //   this.issuanceType.emit("householdQuotationIssuance");
  //   this.backButton.emit("initialize");
  // }

  // motorIssuance(product: number, description: String) {
  //   this.issuanceType.emit("motorQuotationIssuance");
  //   this.backButton.emit("initialize");

  //   this.test.emit({product, description});
  // }

  // PAIssuance() {
  //   this.issuanceType.emit("personalInformation");
  //   this.backButton.emit("initialize");
  // }

  issuance(product: string, description: String, issuanceType: String) {
    this.issuanceType.emit(issuanceType);
    this.backButton.emit("initialize");
    this.productDetails.emit({
      product,
      description
    });
  }

  viewCoverage(type, description) {
    this.spinner.show();
    this.title = description;

    this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
      result => {
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
        this.spinner.hide();
        this.affinity.coverages = this.coverageList;
      });
  }

}