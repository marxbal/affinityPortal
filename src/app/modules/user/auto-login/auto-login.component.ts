import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import { Partner } from 'src/app/objects/partner';
import { Return } from 'src/app/objects/return';
import {
  OTPService
} from 'src/app/services/otp.service';
import { PartnerService } from 'src/app/services/partner.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auto-login',
  templateUrl: './auto-login.component.html',
  styleUrls: ['./auto-login.component.css']
})
export class AutoLoginComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private otp: OTPService,
    private pService: PartnerService,
    ){ }

  ngOnInit() {
    let partnerName = this.route.snapshot.paramMap.get("partner");
    Swal.fire({
      type: 'success',
      title: 'Redirecting',
      text: "Please standby. You are being redirected to " + partnerName,
    });
    
    const _this = this;
    setTimeout(function(){
      const partner = new Partner();
      partner.partnerName = partnerName;
      _this.pService.getPartnerEmail(partner).subscribe(
        (result: any) => {
          const ret = result as Return;
          if (ret.status) {
            const email = ret.obj.toString();
            _this.otp.login(email, false);
          }
        });
    }, 3000);
    
  }

}
