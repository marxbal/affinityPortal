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
import {
  Return
} from '../objects/return';
import * as c from './../objects/const';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  post(param: any, endpoint: string) : Observable <any>{
    // let headers = new HttpHeaders();
    // headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    // headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    // headers = headers.set(InterceptorSkipHeader, '');

    this.spinner.show();
    return this.http.post(this.apiUrl + endpoint, param, this.getHeaders())
    .pipe(catchError((err: any) => {
      this.alertErr(err);
      this.spinner.hide();
      return throwError(err.error);
    }));
  }

  get(endpoint: string): Observable < any > {
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
      // .toPromise()
      // .then(ret => ret as Return)
      // // .catch(err => console.log(err));
      // .catch(err => this.alertErr(err));
  }

  getHeaders() {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    return {
      headers
    };
  }

  alertErr(err: string) {
    Swal.fire({
      type: 'error',
      title: 'Unable to proceed',
      text: 'Error! Problem encountered and unable to process request at this time due to ' + err
    });
  }
}