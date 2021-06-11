import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit, Input } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {Users} from '../../../objects/user';
import {UploadParams} from '../../../objects/upload-params';
import {ChangePasswordRequest} from '../../../objects/change-password-request';
import {AuthenticationService} from '../../../services/authentication.service';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {CommonService} from '../../../services/common.service';
import {Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { LogService } from '../../../services/log.service';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as m from 'moment';
import { ActivatedRoute } from "@angular/router";
import * as jsonToXML from 'jsontoxml';
import { Base64 } from 'js-base64';
import * as hash from 'js-sha512';
import { PaynamicsPayment } from '../../../objects/paynamics-payment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input() user: Users;
  pageCheck: Observable<string>;
  loginMsg : string = "";
  landingPage:string;
  token:string;
  accountId:string;
  up : UploadParams;
  changePasswordRequest: ChangePasswordRequest;
  isValid : string;
  showButton : string;

  public uploader: FileUploader = new FileUploader({url: '/api-non-auth/upload', itemAlias: 'file'});

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,

    private auth: AuthenticationService,
    private caller: AuthService,
    private router: Router,
    private commonService : CommonService,
    private ls : LogService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
              ) {this.__componentInspectorService.getComp(this);
 }

  ngOnInit() {

    this.up = new UploadParams();
    this.changePasswordRequest = new ChangePasswordRequest();
    this.showButton = "false";

  	this.user = new Users();
  	this.auth.setLogin("false");

    this.loginMsg = localStorage.getItem('logoutMessage');
    localStorage.clear();

  	var body = document.querySelector("body");
  	// body.setAttribute("style","background-image: url('/assets/images/login-bg.jpg'); background-size: cover; background-repeat: no-repeat; background-position: fixed;");
    body.setAttribute("style","background: linear-gradient(to right, #bdc3c7, #2c3e50);");

    // if(this.auth.getLoginVal() == "true") {
    //   this.router.navigate([this.auth.getLandingPage()]);
    // }

    this.catchFopm();

  }

  catchFopm(){

    this.route.queryParams.subscribe(params => {
      console.log('1');

      localStorage.setItem("tempECCard", Base64.decode(params.e));
      localStorage.setItem("tempUnit", Base64.decode(params.u));

      // this.user.accountNumber = Base64.decode(params.e);
      // this.user.unitNo = Base64.decode(params.u);

    });

    
 
  }

  validateAccountNumber(e : any){

    if(this.user.accountNumber.length == 6){
      this.proceedNextStep();
      return null;
    }

    if((localStorage.getItem("tempECCard") != this.user.accountNumber) || localStorage.getItem("tempUnit") != this.user.unitNo){

      Swal.fire(
        'Invalid EC Card Number or Unit Number',
        'Given EC Card Number and Unit Number did not match any of our records. Please try again.',
        'error'
      );
      return null;
    }else{

      this.caller.doCallServiceGet('/api/EcVerification/VerifyEc?EcNo=' + this.user.accountNumber,null).subscribe(
        result => {

          console.log(result[0].isok);
          if(result[0].isok != 1){
            Swal.fire(
              'Invalid EC Card Number or Unit Number',
              'Given EC Card Number and Unit Number did not match any of our records. Please try again.',
              'error'
            );
            return null;
          }

          this.proceedNextStep();

      });

    }
    return null;

  }

  proceedNextStep() {
    let add_minutes =  function (dt, minutes) {
      return new Date(dt.getTime() + minutes*60000);
    }
    this.caller.loginUser('m@rsh','m@rsh@2020').subscribe(
        result => {
            localStorage.setItem("token", result.access_token);

            this.auth.setLogin("true");
            var body = document.querySelector("body");
            body.setAttribute("style","background: nothing;");
            this.auth.setLandingPage("issuance");
            localStorage.setItem("userCardId", this.user.accountNumber);
            this.router.navigate([this.auth.getLandingPage()]);
            setTimeout(function(){
              window.location.reload();
            },10);
        },error => {
          console.log(error.error);
          this.loginMsg = "*Invalid username or password";
          this.spinner.hide();
        }
    );
  }
}
