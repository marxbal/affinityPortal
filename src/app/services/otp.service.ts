import {
  Injectable
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
  TOKEN
} from '../constants/local.storage';
import {
  Router
} from '@angular/router';
import {
  OTP
} from '../objects/otp';

// export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class OTPService {
  private currentUserSubject: BehaviorSubject < Users > ;
  public currentUser: Observable < Users > ;
  private map: string = 'otp/';

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private app: AppService,
    private router: Router) {
    this.currentUserSubject = new BehaviorSubject < Users > (
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this.currentUserSubject.asObservable();
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
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          const user = new Users(r.obj['users']);
          user.token = 'Bearer ' + r.obj['token'];

          localStorage.setItem(TOKEN, user.token);
          localStorage.setItem(CURRENT_USER, JSON.stringify(user));
          this.currentUserSubject.next(user);

          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('?error=' + r.statusCode);
        }
      }));
  }
}