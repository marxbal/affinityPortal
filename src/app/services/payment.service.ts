import {
  Injectable
} from '@angular/core';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  AppService
} from './app.service';
import {
  first
} from 'rxjs/operators';
import {
  BehaviorSubject
} from 'rxjs';
import {
  PaymentPaynamics
} from '../objects/payment-paynamics';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private map: string = '/payment/';

  constructor(
    private spinner: NgxSpinnerService,
    private app: AppService) {}

  request(payment: PaymentPaynamics) {
    let ret: any = new BehaviorSubject < any > ([]);

    this.app.post(payment, this.map + 'request')
      .pipe(first())
      .subscribe((res => {
        ret.next(res);
      }));

    return ret.asObservable();
  }

  getResponseCode(requestId: string) {
    let ret: any = new BehaviorSubject < any > ([]);
    const payment = new PaymentPaynamics();
    payment.requestId = requestId;
    this.app.post(payment, this.map + 'getResponseCode')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

    return ret.asObservable();
  }

  checkAuthentication(subline: number, policyNumber: string) {
    let ret: any = new BehaviorSubject < any > ([]);
    this.app.post({subline, policyNumber}, '/afnty/cocaf/checkAuthentication?subline=' + subline + '&' + 'policyNumber=' + policyNumber)
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

    return ret.asObservable();
  }
}