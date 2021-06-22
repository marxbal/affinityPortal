import {
  Injectable
} from '@angular/core';
import {
  BehaviorSubject
} from 'rxjs/internal/BehaviorSubject';
// import {
//   Configuration
// } from '../objects/configuration';

import {
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public pageChecker = new BehaviorSubject < string > (localStorage.getItem('isLoggedIn') || "false");
  public screenList = new BehaviorSubject < any > (JSON.parse(localStorage.getItem("allScreens") || "[]"));
  public userDetails = new BehaviorSubject < any > (JSON.parse(localStorage.getItem("userDetail") || "[]"));
  public userRoles = new BehaviorSubject < any > (JSON.parse(localStorage.getItem("userRoles") || "[]"));
  public loginChecker = new BehaviorSubject < string > (localStorage.getItem('isLoggedIn') || "false");
  public initialLandingPage = new BehaviorSubject < string > (localStorage.getItem('landingPage') || "login");
  public accessibleScreens = new BehaviorSubject < any > (JSON.parse(localStorage.getItem("accessibleScreen") || "[]"));

  constructor(private router: Router) {}

  get page() {
    return this.pageChecker.asObservable();
  }

  getPageValue() {
    return this.pageChecker.getValue();
  }

  setPage(valPage: string) {
    this.pageChecker.next(valPage);
  }

  get login() {
    return this.loginChecker.asObservable();
  }

  getLoginVal() {
    return this.loginChecker.getValue();
  }

  setLogin(logged: string) {
    localStorage.setItem("isLoggedIn", logged);
    this.loginChecker.next(localStorage.getItem('isLoggedIn'));
  }

  get ScreenList() {
    return this.screenList.asObservable();
  }

  getScreens() {
    return this.screenList.getValue();
  }

  setScreens(screens: any) {
    localStorage.setItem("allScreens", JSON.stringify(screens));
    let screenList = JSON.parse(localStorage.getItem("allScreens") || "[]");

    this.screenList.next(screenList);
  }

  setActiveScreen(url: any) {
    var n = url.split("/");
    let currentPage = n[n.length - 1];
    let isPrime = false;

    for (let i = 0; i < this.screenList.getValue().length; i++) {
      if (this.screenList.getValue()[i].routeLink == currentPage) {
        if (this.screenList.getValue()[i].subLink.length > 0) {
          for (let x = 0; x < this.screenList.getValue()[i].subLink.length; x++) {
            if (this.screenList.getValue()[i].subLink[x].routeLink === currentPage) {
              isPrime = false;
              break;
            } else {
              isPrime = true;
            }
          }
        } else {
          isPrime = true;
          break;
        }
        break;
      }
    }

    if (isPrime) {
      for (let i = 0; i < this.screenList.getValue().length; i++) {
        this.screenList.getValue()[i].isActive = "";
      }

      for (let i = 0; i < this.screenList.getValue().length; i++) {
        if (this.screenList.getValue()[i].routeLink == currentPage) {
          this.screenList.getValue()[i].isActive = "active";
        } else {
          this.screenList.getValue()[i].isActive = "";
        }

        for (let x = 0; x < this.screenList.getValue()[i].subLink.length; x++) {
          this.screenList.getValue()[i].subLink[x].isActive = "";
        }
      }
    } else {
      for (let i = 0; i < this.screenList.getValue().length; i++) {
        this.screenList.getValue()[i].isActive = "";
      }

      for (let i = 0; i < this.screenList.getValue().length; i++) {
        this.screenList.getValue()[i].isActive = "";
        for (let x = 0; x < this.screenList.getValue()[i].subLink.length; x++) {
          if (this.screenList.getValue()[i].subLink[x].routeLink == currentPage) {
            this.screenList.getValue()[i].subLink[x].isActive = "active";
            this.screenList.getValue()[i].isActive = "active show";
          } else {
            this.screenList.getValue()[i].subLink[x].isActive = "";
          }
        }
      }
    }
  }

  get userDetail() {
    return this.userDetails.asObservable();
  }

  getUserDetails() {
    return this.userDetails.getValue();
  }

  setUserDetails(userDetails: any) {
    localStorage.setItem("userDetail", JSON.stringify(userDetails));
    let details = JSON.parse(localStorage.getItem("userDetail") || "[]");

    this.userDetails.next(details);
  }

  getUserRoles() {
    return this.userRoles.getValue();
  }

  setUserRoles(userRoles: any) {
    localStorage.setItem("userRoles", JSON.stringify(userRoles));
    let details = JSON.parse(localStorage.getItem("userRoles") || "[]");

    this.userRoles.next(details);
  }

  getUserType() {

    let userType = "";
    for (let i = 0; i < this.userRoles.getValue().length; i++) {

      if (this.userRoles.getValue()[i].roleId == 3 || this.userRoles.getValue()[i].roleId == 6) {
        userType = "MA";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 4 || this.userRoles.getValue()[i].roleId == 5) {
        userType = "IC";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 1) {
        userType = "SA";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 2) {
        userType = "UW";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 7) {
        userType = "ICA";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 8) {
        userType = "ICASH";
        break;
      }

      if (this.userRoles.getValue()[i].roleId == 9) {
        userType = "ICSS";
        break;
      }

    }

    return userType;

  }

  getUserRole() {
    let userRoleId = "";
    for (let i = 0; i < this.userRoles.getValue().length; i++) {
      userRoleId = this.userRoles.getValue()[i].roleId;
      break;
    }

    return userRoleId;
  }

  setDateFormat(datee: string) {
    localStorage.setItem("dateFormat", datee);
  }

  getDateFormat() {
    return localStorage.getItem("dateFormat");
  }

  get landingPage() {
    return this.initialLandingPage.asObservable();
  }

  getLandingPage() {
    return this.initialLandingPage.getValue();
  }

  setLandingPage(initialPage: string) {
    localStorage.setItem("landingPage", initialPage);
    this.initialLandingPage.next(localStorage.getItem('landingPage'));
  }

  get AccessibleScreen() {
    return this.accessibleScreens.asObservable();
  }

  getAccessibleScreen() {
    return this.accessibleScreens.getValue();
  }

  setAccessibleScreen(screens: any) {
    localStorage.setItem("accessibleScreen", JSON.stringify(screens));
    let accessibleScreen = JSON.parse(localStorage.getItem("accessibleScreen") || "[]");
    this.accessibleScreens.next(accessibleScreen);
  }
}
