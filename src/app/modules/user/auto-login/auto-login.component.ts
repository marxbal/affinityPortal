import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import {
  OTPService
} from 'src/app/services/otp.service';

@Component({
  selector: 'app-auto-login',
  templateUrl: './auto-login.component.html',
  styleUrls: ['./auto-login.component.css']
})
export class AutoLoginComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private otp: OTPService,
    ){ }

  ngOnInit() {
    let user = this.route.snapshot.paramMap.get("user");
    this.otp.login(user, false);
  }

}
