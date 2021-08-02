import {
  Injectable
} from '@angular/core';
import {
  BehaviorSubject
} from 'rxjs/internal/BehaviorSubject';
import {
  Router
} from '@angular/router';
import {
  LOGGED_IN,
  PARTNER,
  PRODUCTS,
  USER,
  LANDING_PAGE
} from '../constants/local.storage';
import {
  UserDetail
} from '../objects/userDetail';
import {
  Partner
} from '../objects/partner';
import {
  Product
} from '../objects/product';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public loggedIn = new BehaviorSubject < boolean > (localStorage.getItem(LOGGED_IN) == "true" || false);
  public userDetails = new BehaviorSubject < UserDetail > (JSON.parse(localStorage.getItem(USER) || "{}"));
  public initialLandingPage = new BehaviorSubject < string > (localStorage.getItem(LANDING_PAGE) || "login");
  public partner = new BehaviorSubject < Partner > (JSON.parse(localStorage.getItem(PARTNER) || "{}"));
  public products = new BehaviorSubject < Array<Product> > (JSON.parse(localStorage.getItem(PRODUCTS) || "{}"));

  constructor(private router: Router) {}

  // *** LOGGED IN ***

  get login() {
    return this.loggedIn.asObservable();
  }

  getLoginVal() {
    return this.loggedIn.getValue();
  }

  setLogin(loggedIn: boolean) {
    if (loggedIn != null) {
      localStorage.setItem(LOGGED_IN, loggedIn.toString());
    } else {
      localStorage.removeItem(LOGGED_IN);
    }

    this.loggedIn.next(loggedIn);
  }

  // *** USER DETAIL ***

  get userDetail() {
    return this.userDetails.asObservable();
  }

  getUserDetails() {
    return this.userDetails.getValue();
  }

  setUserDetails(userDetails: UserDetail) {
    let details = null;
    if (userDetails != null) {
      localStorage.setItem(USER, JSON.stringify(userDetails));
      details = JSON.parse(localStorage.getItem(USER) || "{}");
    } else {
      localStorage.removeItem(USER);
    }

    this.userDetails.next(details);
  }

  // *** LANDING PAGE ***

  get landingPage() {
    return this.initialLandingPage.asObservable();
  }

  getLandingPage() {
    return this.initialLandingPage.getValue();
  }

  setLandingPage(initialPage: string) {
    if (initialPage != null) {
      localStorage.setItem(LANDING_PAGE, initialPage);
    } else {
      localStorage.removeItem(LANDING_PAGE);
    }

    this.initialLandingPage.next(localStorage.getItem(LANDING_PAGE));
  }

  // *** PARTNER ***

  get Partner() {
    return this.partner.asObservable();
  }

  getPartner() {
    return this.partner.getValue();
  }

  setPartner(details: Partner) {
    if (details != null) {
      localStorage.setItem(PARTNER, JSON.stringify(details));
      details = JSON.parse(localStorage.getItem(PARTNER) || "{}");
    } else {
      localStorage.removeItem(PARTNER);
    }

    this.partner.next(details);
  }

  // *** PRODUCTS ***

  get Products() {
    return this.products.asObservable();
  }

  getProducts() {
    return this.products.getValue();
  }

  setProducts(list: Array<Product>) {
    if (list != null) {
      localStorage.setItem(PRODUCTS, JSON.stringify(list));
      list = JSON.parse(localStorage.getItem(PRODUCTS) || "[]");
    } else {
      localStorage.removeItem(PRODUCTS);
    }

    this.products.next(list);
  }

  // *** DATE FORMAT ***

  setDateFormat(datee: string) {
    localStorage.setItem("dateFormat", datee);
  }

  getDateFormat() {
    return localStorage.getItem("dateFormat");
  }

  // *** CLEAR ALL AUTHENTICATION ***

  clearAuth() {
    this.setUserDetails(null);
    this.setLogin(null);
    this.setLandingPage(null);
    this.setPartner(null);
    localStorage.clear();
  }
}
