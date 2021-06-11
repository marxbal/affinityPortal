import {
  Injectable
} from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
// import {
//   Observable,
//   BehaviorSubject
// } from 'rxjs';
import Swal from 'sweetalert2';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  environment
} from '../../environments/environment';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = environment.apiUrl;

  // private dataSubject: BehaviorSubject < any > = new BehaviorSubject({});
  // data$: Observable < any > = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}
  
  async post(param: any, endpoint: string): Promise < any > {
    this.spinner.show();
    return this.http.post(this.apiUrl + endpoint, param)
      .toPromise()
      .then(response => response)
      // .catch(err => console.log(err));
      .catch(err => Swal.fire({
        type: 'error',
        title: 'Unable to proceed',
        text: 'Error! Problem encountered and unable to process request at this time.'
      }));
  }

  async get(endpoint: string): Promise < any > {
    return this.http.get(this.apiUrl + endpoint)
      .toPromise()
      .then(response => response)
      // .catch(err => console.log(err));
      .catch(err => Swal.fire({
        type: 'error',
        title: 'Unable to proceed',
        text: 'Error! Problem encountered and unable to process request at this time.'
      }));
  }
}