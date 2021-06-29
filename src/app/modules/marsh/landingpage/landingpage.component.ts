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
  ComponentCanDeactivate
} from '../../../guard/component-can-deactivate';
import {
  Marsh
} from '../../../objects/marsh';
import {
  Partner
} from 'src/app/objects/partner';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit, ComponentCanDeactivate {

  constructor(private auth: AuthenticationService, private router: Router) {}

  partnerPath: string = "";

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  @Input() marsh: Marsh;
  @Output() issuanceType = new EventEmitter();
  @Output() backButton = new EventEmitter();

  ngOnInit() {
    console.log(this.marsh);

    const partner = this.auth.getPartner() as Partner;
    console.log(partner);
    if (!_.isEmpty(partner)) {
      this.partnerPath = partner.name;
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

  householdIssuance() {
    this.issuanceType.emit("householdQuotationIssuance");
    this.backButton.emit("initialize");
  }

  motorIssuance() {
    this.issuanceType.emit("motorQuotationIssuance");
    this.backButton.emit("initialize");
  }

  PAIssuance() {
    this.issuanceType.emit("personalInformation");
    this.backButton.emit("initialize");
  }

}
