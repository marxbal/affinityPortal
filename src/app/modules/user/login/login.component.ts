import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import {
  Users
} from '../../../objects/user';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import * as c from '../../../objects/const';
import * as _ from 'lodash';
import {
  ActivatedRoute,
  Router
} from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  OTPService
} from 'src/app/services/otp.service';
import {
  CURRENT_USER,
  EMAIL,
  LOGGED_IN,
  LOGIN_MSG
} from 'src/app/constants/local.storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private currentUserSubject: BehaviorSubject < Users > ;
  public currentUser: Observable < Users > ;

  @Input() user: Users;
  loginForm: FormGroup;

  loginMsgStatus: string = "alert-info";
  loginMsg: string = "";

  showOTPBtn: boolean = true;
  showSubmitBtn: boolean = false;
  email: string = "";

  isAdmin: boolean = false;

  version: string = c.VER;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private otp: OTPService,
    private router: Router,
  ) {
    this.currentUserSubject = new BehaviorSubject < Users > (
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  ngOnInit() {
    const isLoggedIn = localStorage.getItem(LOGGED_IN);
    if (isLoggedIn === 'true') {
      this.router.navigate(['issuance']);
    } else {
      this.isAdmin = "/admin" === this.router.url;

      this.route.queryParams
      .subscribe(params => {
        var err = params.error;
        var resend = params.resend == 'true';

        this.email = !_.isEmpty(params.email)
          ? params.email
          : !_.isEmpty(localStorage.getItem(EMAIL))
          ? localStorage.getItem(EMAIL)
          : '';

        if (err != undefined) {
          this.loginMsgStatus = "alert-danger";
          var message = localStorage.getItem(LOGIN_MSG);
          if (_.isNull(message)) {
            message = "Application Error! Please contact administration.";
          }

          this.loginMsg = message;
        } else {
          this.loginMsgStatus = "alert-info";
          this.showSubmitBtn = params.email != '' && params.email != undefined;
          this.showOTPBtn = !this.showSubmitBtn;

          if (this.showSubmitBtn) {
            this.loginMsg = resend ?
              'OTP was resent to your email. OTP is valid for 5 minutes only.' :
              'Use the OTP sent to your email to proceed. OTP is valid for 5 minutes only. If you are unable to receive an email, click resend OTP button to generate new OTP.';
          }
        }
      });

      this.createForm();

      var body = document.querySelector("body");
      body.setAttribute("style", "background-image: url('./assets/images/bg.jpg'); background-size: cover; background-repeat: no-repeat; background-position: fixed;");
    }
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      otp: ["", this.showSubmitBtn ? Validators.required : null]
    });
  }

  requestOTP(resend: boolean) {
    var email = this.loginForm.value.email;
    this.otp.requestOTP(email, resend);
  }

  requestAdminOTP(resend: boolean) {
    var email = this.loginForm.value.email;
    this.otp.requestAdminOTP(email, resend);
  }

  request() {
    if (this.isAdmin) {
      this.requestAdminOTP(false);
    } else {
      this.requestOTP(false);
    }
  }

  resend() {
    if (this.isAdmin) {
      this.requestAdminOTP(true);
    } else {
      this.requestOTP(true);
    }
  }

  verifyOTP() {
    var email = this.loginForm.value.email;
    var otp = this.loginForm.value.otp;
    this.otp.verifyOTP(email, otp, this.isAdmin);
  }
}
