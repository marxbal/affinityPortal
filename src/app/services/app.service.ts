import {
  Injectable
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import Swal from 'sweetalert2';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  environment
} from '../../environments/environment';
import * as c from './../objects/const';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  Observable,
  throwError
} from 'rxjs';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  post(param: any, endpoint: string): Observable < any > {
    this.spinner.show();
    return this.http.post(this.apiUrl + endpoint, param, this.getHeaders())
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        console.log(err);
        this.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  get(endpoint: string): Observable < any > {
    this.spinner.show();
    return this.http.get(this.apiUrl + endpoint, this.getHeaders())
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  getHeaders() {
    let headers = new HttpHeaders();
    // headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    return {
      headers
    };
  }

  alertErr(err: any) {
    const error = err.error;
    Swal.fire({
      type: 'error',
      title: 'Ooops! ' + error.error,
      text: 'Error! We are unable to process your request at the moment. ' + error.message + '. Path: ' + error.path
    });
  }
}