import {
  Injectable
} from '@angular/core';
import {
  HttpClient
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

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  async post(param: any, endpoint: string): Promise < any > {
    this.spinner.show();
    return this.http.post(this.apiUrl + endpoint, param)
      .toPromise()
      .then(ret => ret as Return)
      // .catch(err => console.log(err));
      .catch(err => this.alertErr(err));
  }

  async get(endpoint: string): Promise < any > {
    return this.http.get(this.apiUrl + endpoint)
      .toPromise()
      .then(ret => ret as Return)
      // .catch(err => console.log(err));
      .catch(err => this.alertErr(err));
  }

  alertErr(err: string) {
    Swal.fire({
      type: 'error',
      title: 'Unable to proceed',
      text: 'Error! Problem encountered and unable to process request at this time due to ' + err
    });
  }
}