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

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}



  async post(param: any, endpoint: string): Promise < any > {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    this.spinner.show();
    return this.http.post(this.apiUrl + endpoint, param, this.getHeaders())
      .toPromise()
      .then(ret => ret as Return)
      // .catch(err => console.log(err));
      .catch(err => this.alertErr(err));
  }

  async get(endpoint: string): Promise < any > {

    return this.http.get(this.apiUrl + endpoint, this.getHeaders())
      .toPromise()
      .then(ret => ret as Return)
      // .catch(err => console.log(err));
      .catch(err => this.alertErr(err));
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