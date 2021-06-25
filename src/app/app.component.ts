import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  Observable
} from 'rxjs';
import * as $ from 'jquery/dist/jquery.min';
import * as _ from 'lodash';
import {
  AuthenticationService
} from './services/authentication.service';
import {
  environment
}
from '../environments/environment';
import {
  Partner
} from './objects/partner';
import {
  LOGGED_IN
} from './constants/local.storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  pageCheck: Observable < string > ;
  screenList: Observable < any[] > ;
  url: String;
  baseUrl = environment.baseUrl;
  collapse: String = "1";
  userType: String;
  partnerName: string = "";
  isLoggedIn: boolean = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public auth: AuthenticationService) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.getLoginVal() == "true" ? true : false;

    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.partnerName = partner.name;
    }

    this.updateActivePage();
    this.pageCheck = this.auth.page;
    this.screenList = this.auth.ScreenList;

    if (this.auth.getUserRole() == "1") {
      this.userType = "System Administrator";
    } else if (this.auth.getUserRole() == "2") {
      this.userType = "Underwriting";
    } else if (this.auth.getUserRole() == "3") {
      this.userType = "Manning Agency Administrator";
    } else if (this.auth.getUserRole() == "4") {
      this.userType = "Insurance Company Administrator";
    } else if (this.auth.getUserRole() == "5") {
      this.userType = "Insurance Company Sales";
    } else if (this.auth.getUserRole() == "6") {
      this.userType = "Manning Agency Sales";
    } else if (this.auth.getUserRole() == "7") {
      this.userType = "Insurance Company Agent";
    } else if (this.auth.getUserRole() == "8") {
      this.userType = "Insurance Company Cashier";
    } else if (this.auth.getUserRole() == "9") {
      this.userType = "Insurance Company Super User";
    }

  }

  sidebarCollapse(toggleType: String) {
    if (toggleType == "menu") {
      if (this.collapse == "0") {
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('active');
        $('.route-description').toggleClass('hidden');
        $('#sidebar ul li a').toggleClass('text-center');
        $('.welcome-user').toggleClass('hidden');
        $('.sidebar-footer').toggleClass('hidden');
        $('#sidebarCollapse').toggleClass('pull-right');
        this.collapse = "1";
      }
    } else {
      if (this.collapse == "0") {
        this.collapse = "1";
      } else {
        this.collapse = "0";
      }
      $('#sidebar').toggleClass('active');
      $('#content').toggleClass('active');
      $('.route-description').toggleClass('hidden');
      $('#sidebar ul li a').toggleClass('text-center');
      $('.welcome-user').toggleClass('hidden');
      $('.sidebar-footer').toggleClass('hidden');
      $('#sidebarCollapse').toggleClass('pull-right');
    }
  }

  updateActivePage() {
    $(".parent-menus").removeClass("active");
    // var n = window.location.href.split("/");
    this.auth.setActiveScreen(window.location.href);
  }

  logout() {
    // this.auth.setPage("false");
    // localStorage.setItem(ALL_SCREEN, "[]");
    // localStorage.setItem(USER, "[]");
    // localStorage.setItem(LOGGED_IN, "false");

    // this.auth.setScreens(JSON.parse(localStorage.getItem(ALL_SCREEN) || "[]"));
    // this.auth.setUserDetails(JSON.parse(localStorage.getItem(USER) || "[]"));
    // this.auth.setLogin(localStorage.getItem(LOGGED_IN));
    // localStorage.removeItem(LOGGED_IN);
    // localStorage.removeItem(ALL_SCREEN);
    // localStorage.removeItem(USER);
    // localStorage.removeItem(LANDING_PAGE);
    localStorage.clear();
    this.isLoggedIn = false;

    this.router.navigate(['login']);
  }
}
