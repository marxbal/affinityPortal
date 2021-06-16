import {
  Injectable
} from '@angular/core';
import * as c from './../objects/const';
import {
  HttpClient,
  HttpHeaders
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
  catchError,
  first,
  map
} from 'rxjs/operators';
import {
  Users
} from '../objects/user';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import {
  CURRENT_USER
} from '../constants/local.storage';
import Swal from 'sweetalert2';
import {
  InterceptorSkipHeader
} from './auth.service';
import {
  Router
} from '@angular/router';

// export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class OTPService {
  private currentUserSubject: BehaviorSubject < Users > ;
  public currentUser: Observable < Users > ;

  private apiUrl = environment.apiUrl;
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
    this.app.post({
        email
      }, this.map + 'request')
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

  verifyOTP(email: string, otp: string) {
    return this.http.post(this.apiUrl + 'otp/login', {
      email,
      otp
    }, this.app.getHeaders()).pipe(map((res) => {
      var r = res as Return;
      if (r.status) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        const user = new Users(r.obj['users']);
        user.token = 'Bearer ' + r.obj['token'];

        localStorage.setItem(CURRENT_USER, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      } else {
        return null;
      }
    }));
  }

  testOTP(email: string) {
    const as = this;
    // const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    return this.http.post(this.apiUrl + "otp/request", {
        email
      }, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        console.log('An error occurred:', err.error);
        Swal.fire({
          type: 'error',
          title: 'Unable to proceed.',
          text: "We are unable to process your request."
        });

        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  // loginUser(username: string, password: string) {
  //   const as = this;
  //   const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`;

  //   let headers = new HttpHeaders();
  //   headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
  //   headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
  //   headers = headers.set(InterceptorSkipHeader, '');

  //   return this.http.post(this.apiUrl + "/oauth/token", body, {
  //       headers
  //     })
  //     .pipe(map((res: any) => {
  //       if (res) {
  //         return res;
  //       }
  //     })).pipe(catchError((err: any) => {
  //       console.log('An error occurred:', err.error);
  //       Swal.fire({
  //         type: 'error',
  //         title: 'Unable to proceed.',
  //         text: "We are unable to process your request."
  //       });

  //       this.spinner.hide();
  //       return throwError(err.error);
  //     }));
  // }
}