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
import {
  Partner
} from '../objects/partner';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private map: string = '/partner/';

  constructor(
    private spinner: NgxSpinnerService,
    private app: AppService) {}

  getPartnerDetails(agentCode: number) {
    let ret: any = new BehaviorSubject < any > ([]);

    const partner = new Partner();
    partner.agentCode = agentCode;
    this.app.post(partner, this.map + 'getPartnerDetails')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        ret.next(res);
      }));

      return ret.asObservable();
  }

  insertContract(partner: Partner) {
    this.app.post(partner, this.map + 'insertContract')
      .pipe(first())
      .subscribe((res => {
        this.spinner.hide();
        const ret = res as Return;
        if (ret.status) {
          Swal.fire({
            type: 'success',
            title: 'Partner contract added.',
            text: ret.message
          });
        } else {
          Swal.fire({
            type: 'error',
            title: 'Error! unable to add contract.',
            text: ret.message
          });
        }
      }));
  }
}