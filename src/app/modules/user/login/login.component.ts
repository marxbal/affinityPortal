import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {
  Users
} from '../../../objects/user';
import {
  UploadParams
} from '../../../objects/upload-params';
import {
  ChangePasswordRequest
} from '../../../objects/change-password-request';
import {
  AuthenticationService
} from '../../../services/authentication.service';
import {
  AuthService
} from '../../../services/auth.service';
import {
  Router
} from '@angular/router';
import {
  CommonService
} from '../../../services/common.service';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  catchError,
  first,
  map
} from 'rxjs/operators';
import * as _ from 'lodash';
import {
  LogService
} from '../../../services/log.service';
import {
  FileUploader,
  FileSelectDirective
} from 'ng2-file-upload/ng2-file-upload';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as m from 'moment';
import {
  ActivatedRoute
} from "@angular/router";
import {
  filter,
  takeWhile
} from 'rxjs/operators';
import * as jsonToXML from 'jsontoxml';
import {
  Base64
} from 'js-base64';
import * as hash from 'js-sha512';
import {
  PaynamicsPayment
} from '../../../objects/paynamics-payment';

import {
  environment
} from '../../../../environments/environment';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  OTPService
} from 'src/app/services/otp.service';
import {
  CURRENT_USER
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

  pageCheck: Observable < string > ;


  loginMsgStatus: string = "alert-info";
  loginMsg: string = "";

  landingPage: string;
  token: string;
  accountId: string;
  up: UploadParams;
  changePasswordRequest: ChangePasswordRequest;
  isValid: string;
  showOTPBtn: boolean = true;
  showSubmitBtn: boolean = false;

  email: string = "";

  // public uploader: FileUploader = new FileUploader({
  //   url: '/api-non-auth/upload',
  //   itemAlias: 'file'
  // });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private otp: OTPService,
  ) {
    this.currentUserSubject = new BehaviorSubject < Users > (
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        var err = params.error;
        var email = params.email;
        var resend = params.resend == 'true';
        if (err != undefined) {
          this.loginMsgStatus = "alert-danger";
          this.loginMsg = params.error == 1 ?
            'Email does not exist, please make sure to enter your correct email.' :
            'OTP Expired. Please generate new OTP.';
        } else {
          this.showSubmitBtn = email != '' && email != undefined;
          this.showOTPBtn = !this.showSubmitBtn;

          if (this.showSubmitBtn) {
            this.email = email;
            this.loginMsg = resend ?
              'OTP was resent to your email. OTP is valid for 5 minutes only.' :
              'Use the OTP sent to your email to proceed. OTP is valid for 5 minutes only. If you are unable to receive an email, click resend OTP button to generate new OTP.';
          }
        }

      });

    this.createForm();

    // this.up = new UploadParams();
    // this.changePasswordRequest = new ChangePasswordRequest();
    // this.showButton = "false";

    // this.user = new Users();
    // this.auth.setLogin("false");

    // this.loginMsg = localStorage.getItem('logoutMessage');
    // localStorage.clear();

    var body = document.querySelector("body");
    body.setAttribute("style", "background-image: url('/assets/images/bg.jpg'); background-size: cover; background-repeat: no-repeat; background-position: fixed;");

    // if(this.auth.getLoginVal() == "true") {
    //   this.router.navigate([this.auth.getLandingPage()]);
    // }

    // this.catchFopm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      otp: ["", this.showSubmitBtn ? Validators.required : null]
    });
  }

  // catchFopm(){

  //   this.route.queryParams.subscribe(params => {
  //     console.log('1');

  //     localStorage.setItem("tempECCard", Base64.decode(params.e));
  //     localStorage.setItem("tempUnit", Base64.decode(params.u));

  //     // this.user.accountNumber = Base64.decode(params.e);
  //     // this.user.unitNo = Base64.decode(params.u);

  //   });
  // }

  // validateAccountNumber(e : any){

  //   if(this.user.accountNumber.length == 6 && !environment.production){
  //     this.proceedNextStep();
  //     return null;
  //   }

  //   if((localStorage.getItem("tempECCard") != this.user.accountNumber) || localStorage.getItem("tempUnit") != this.user.unitNo){

  //     Swal.fire(
  //       'Invalid EC Card Number or Unit Number',
  //       'Given EC Card Number and Unit Number did not match any of our records. Please try again.',
  //       'error'
  //     );
  //     return null;
  //   }else{

  //     this.caller.doCallServiceGet('/api/EcVerification/VerifyEc?EcNo=' + this.user.accountNumber,null).subscribe(
  //       result => {

  //         console.log(result[0].isok);
  //         if(result[0].isok != 1){
  //           Swal.fire(
  //             'Invalid EC Card Number or Unit Number',
  //             'Given EC Card Number and Unit Number did not match any of our records. Please try again.',
  //             'error'
  //           );
  //           return null;
  //         }

  //         this.proceedNextStep();

  //     });

  //   }
  //   return null;

  // }

  // proceedNextStep() {
  //   let add_minutes =  function (dt, minutes) {
  //     return new Date(dt.getTime() + minutes*60000);
  //   }
  //   this.caller.loginUser('m@rsh','m@rsh@2020').subscribe(
  //       result => {
  //           localStorage.setItem("token", result.access_token);

  //           this.auth.setLogin("true");
  //           var body = document.querySelector("body");
  //           body.setAttribute("style","background: nothing;");
  //           this.auth.setLandingPage("issuance");
  //           localStorage.setItem("userCardId", this.user.accountNumber);
  //           this.router.navigate([this.auth.getLandingPage()]);
  //           setTimeout(function(){
  //             window.location.reload();
  //           },10);
  //       },error => {
  //         console.log(error.error);
  //         this.loginMsg = "*Invalid username or password";
  //         this.spinner.hide();
  //       }
  //   );
  // }

  requestOTP(resend: boolean) {
    var email = this.loginForm.value.email;
    this.otp.requestOTP(email, resend);
  }

  request() {
    this.requestOTP(false);
  }

  resend() {
    this.requestOTP(true);
  }

  verifyOTP() {
    var email = this.loginForm.value.email;
    var otp = this.loginForm.value.otp;
    this.otp.verifyOTP(email, otp).pipe(first()).subscribe((res) => {
      if (res.status) {
        this.router.navigateByUrl('/home');
        window.location.href = "/home";
      } else {
        this.router.navigateByUrl('?error=3');
      }
    });
  }
}
