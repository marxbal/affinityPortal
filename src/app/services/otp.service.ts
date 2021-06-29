import {
  Injectable,
  // Input
} from '@angular/core';
import * as c from './../objects/const';
// import {
//   HttpClient
// } from '@angular/common/http';
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
  first
} from 'rxjs/operators';
import {
  EMAIL,
  LOGIN_MSG,
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

@Injectable({
  providedIn: 'root'
})
export class OTPService {
  private map: string = 'otp/';

  constructor(
    private auth: AuthenticationService,
    private caller: AuthService,
    private spinner: NgxSpinnerService,
    private app: AppService,
    private router: Router) {
  }

  requestOTP(email: string, resend: boolean) {
    var otp = new OTP();
    otp.email = email;
    this.app.post(otp, this.map + 'request')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        var r = res as Return;

        localStorage.setItem(LOGIN_MSG, r.message);
        this.router.navigateByUrl(
          r.status ?
          '?email=' + email + '&resend=' + resend :
          '?error=true');
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

        localStorage.setItem(LOGIN_MSG, r.message);
        if (r.status) {
          this.login(email);
        } else {
          this.router.navigateByUrl('?error=true');
        }
      }));
  }

  login(email: string) {
    this.caller.loginUser(c.LOGIN_EMAIL, c.LOGIN_PWD).subscribe(
      result => {
        localStorage.setItem(TOKEN, "Bearer " + result.access_token);
        localStorage.setItem(EMAIL, email);

        //TODO
        //to be removed soon
        // localStorage.setItem("userCardId", this.user.accountNumber);
        // localStorage.setItem("userCardId", email);

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
        localStorage.setItem(LOGIN_MSG, "Error! Unable to Login.")
        this.router.navigateByUrl('?error=true');
      }
    );
  }
}