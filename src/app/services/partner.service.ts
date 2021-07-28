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
  Return
} from '../objects/return';
import {
  first
} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  BehaviorSubject
} from 'rxjs';
import {
  Product
} from '../objects/product';
import {
  AddPartner
} from '../objects/add-partner';
import {
  AddProduct
} from '../objects/add-product';
import {
  UserDetail
} from '../objects/userDetail';
import {
  Partner
} from '../objects/partner';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private map: string = '/partner/';

  constructor(
    private spinner: NgxSpinnerService,
    private app: AppService) {}

  getProductContract(product: Product) {
    let ret: any = new BehaviorSubject < any > ([]);

    this.app.post(product, this.map + 'getProductContract')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

    return ret.asObservable();
  }

  getPartnerDetails(userDetail: UserDetail) {
    let ret: any = new BehaviorSubject < any > ([]);

    const user = new UserDetail();
    this.app.post(userDetail, this.map + 'getPartnerDetails')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

    return ret.asObservable();
  }

  getPartnerDetailsByPartnerCode(partner: Partner) {
    let ret: any = new BehaviorSubject < any > ([]);

    const user = new UserDetail();
    this.app.post(partner, this.map + 'getPartnerDetailsByPartnerCode')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

    return ret.asObservable();
  }

  insertPartner(partner: AddPartner) {
    this.app.post(partner, this.map + 'insertPartner')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        const ret = res as Return;
        if (ret.status) {
          Swal.fire({
            type: 'success',
            title: 'Partner added.',
            text: ret.message
          });
        } else {
          Swal.fire({
            type: 'error',
            title: 'Error! unable to add Partner.',
            text: ret.message
          });
        }
      }));
  }

  insertProduct(product: AddProduct) {
    this.app.post(product, this.map + 'insertProduct')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        const ret = res as Return;
        if (ret.status) {
          Swal.fire({
            type: 'success',
            title: 'Product Contract added.',
            text: ret.message
          });
        } else {
          Swal.fire({
            type: 'error',
            title: 'Error! unable to add Product Contract.',
            text: ret.message
          });
        }
      }));
  }
}