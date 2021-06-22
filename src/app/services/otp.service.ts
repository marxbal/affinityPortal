import {
  Injectable,
  Input
} from '@angular/core';
import * as c from './../objects/const';
import {
  HttpClient
} from '@angular/common/http';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  AppService
} from './app.service';
import {
  Return
} from '../objects/return';
import {
  environment
} from 'src/environments/environment';
import {
  first
} from 'rxjs/operators';
import {
  Users
} from '../objects/user';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  CURRENT_USER,
  EMAIL,
  TOKEN
} from '../constants/local.storage';
import {
  Router
} from '@angular/router';
import {
  OTP
} from '../objects/otp';
import {
  AuthService
} from './auth.service';
import {
  AuthenticationService
} from './authentication.service';

// export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class OTPService {
  // private currentUserSubject: BehaviorSubject < Users > ;
  // public currentUser: Observable < Users > ;
  // private user: Users;
  private map: string = 'otp/';

  constructor(
    private auth: AuthenticationService,
    private caller: AuthService,
    private spinner: NgxSpinnerService,
    private app: AppService,
    private router: Router) {
    // this.currentUserSubject = new BehaviorSubject < Users > (
    //   JSON.parse(localStorage.getItem(CURRENT_USER))
    // );
    // this.currentUser = this.currentUserSubject.asObservable();
  }

  requestOTP(email: string, resend: boolean) {
    var otp = new OTP();
    otp.email = email;
    this.app.post(otp, this.map + 'request')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        var r = res as Return;
        this.router.navigateByUrl(
          r.status ?
          '?email=' + email + '&resend=' + resend :
          '?error=' + r.statusCode);
      }));
  }

  verifyOTP(email: string, requestOTP: string) {
    var otp = new OTP();
    otp.email = email;
    otp.otp = requestOTP;
    this.app.post(otp, this.map + 'verify')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        var r = res as Return;
        if (r.status) {
          this.login(email);
        } else {
          this.router.navigateByUrl('?error=' + r.statusCode);
        }
      }));
  }

  login(email: string) {
    // let add_minutes = function (dt, minutes) {
    //   return new Date(dt.getTime() + minutes * 60000);
    // }
    this.caller.loginUser('m@rsh', 'm@rsh@2020').subscribe(
      result => {
        localStorage.setItem(TOKEN, "Bearer " + result.access_token);
        localStorage.setItem(EMAIL, email);

        //TODO
        //to be removed soon
        // localStorage.setItem("userCardId", this.user.accountNumber);
        localStorage.setItem("userCardId", email);

        this.auth.setLogin("true");
        this.auth.setLandingPage("issuance");

        //TODO
        var body = document.querySelector("body");
        body.setAttribute("style", "background: nothing;");
        
        this.router.navigate([this.auth.getLandingPage()]);
        setTimeout(function () {
          window.location.reload();
        }, 10);
      }, error => {
        this.spinner.hide();
        this.router.navigateByUrl('?error=1');
      }
    );
  }
}