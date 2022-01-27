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
  Partner
} from 'src/app/objects/partner';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  environment
} from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  email: string = "";
  homePageUrl: string = "";

  partner: Partner;
  isAuto: boolean = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public auth: AuthenticationService) {}

  ngOnInit() {
    this.partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(this.partner)) {
      this.isAuto = this.partner.auto;
    }

    this.email = localStorage.getItem(EMAIL);
    this.homePageUrl = environment.baseUrl + this.auth.getLandingPage();
  }

  logout() {
    this.auth.clearAuth();
    this.router.navigate(['login']);
  }

}
