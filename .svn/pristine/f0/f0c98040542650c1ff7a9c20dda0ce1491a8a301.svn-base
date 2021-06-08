import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {AuthService} from '../../../services/auth.service';
import * as m from 'moment';
import {ChangePasswordRequest} from '../../../objects/change-password-request';
import Swal from 'sweetalert2';
import {Users} from '../../../objects/user';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-password-management',
  templateUrl: './password-management.component.html',
  styleUrls: ['./password-management.component.css']
})
export class PasswordManagementComponent implements OnInit {

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,
private auth: AuthenticationService,
    private authLogin: AuthService,
    private spinner: NgxSpinnerService) {this.__componentInspectorService.getComp(this);
 }

  userHolder: Users;
  password: string;
  cpassword: string;
  changePasswordRequest: ChangePasswordRequest;

  ngOnInit() {
  	var body = document.querySelector("body");
  	this.password = "";
  	this.cpassword = "";
  	// body.setAttribute("style","background-image: url('/assets/images/login-bg.jpg'); background-size: cover; background-repeat: no-repeat; background-position: fixed;");
    body.setAttribute("style","background: linear-gradient(to right, #16222a, #3a6073);");
    if(this.auth.getLoginVal() == "true") {
    	this.logout();
    }else{
    	this.spinner.show();
    	let requestId = parseInt(/[^/]*$/.exec(window.location.href)[0]);
    	if(!isNaN(requestId)){

    		this.authLogin.callNonAuth("/api-non-auth/getChangePassRequest", requestId).subscribe(
	            resulta => { 
	            	this.changePasswordRequest = resulta;
	            	this.spinner.hide();

	            	if(resulta.status == "0"){

	            		this.spinner.hide();
						let timerInterval
						Swal.fire({
						  title: 'Request already expired.',
						  html: 'Sorry but this request were already expired. You will be redirected to Login page in <strong></strong>',
						  timer: 10000,
						  onBeforeOpen: () => {
						    Swal.showLoading()
						    timerInterval = setInterval(() => {
						      Swal.getContent().querySelector('strong')
						        .textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
						    }, 100)
						  },
						  onClose: () => {
						    clearInterval(timerInterval)
						  }
						}).then((result) => {
						  if (result.dismiss === Swal.DismissReason.timer) {
						  	window.location.href = "http://pbac.digitalinno.com/";
						  }
						});

	            	}else{

	            		if(m().isAfter(m(resulta.dateAdded).add('24','hours').format('YYYY-MM-DD HH:mm:ss'))){

		              	let timerInterval
						Swal.fire({
						  title: 'Link Expired',
						  html: 'Sorry but this link were already expired. You will be redirected to Login page in <strong></strong>',
						  timer: 10000,
						  onBeforeOpen: () => {
						    Swal.showLoading()
						    timerInterval = setInterval(() => {
						      Swal.getContent().querySelector('strong')
						        .textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
						    }, 100)
						  },
						  onClose: () => {
						    clearInterval(timerInterval)
						  }
						}).then((result) => {
						  if (result.dismiss === Swal.DismissReason.timer) {
						  	window.location.href = "https://www.digitalinno.com/";
						  }
						})

		              }else{
		              	this.authLogin.callNonAuth("/api-non-auth/findUsersViaId", resulta.userId).subscribe(
		                  resulte => {
		                  	this.userHolder = resulte;
		                  	this.spinner.hide();
		                  }
		                );
		              }

	            	}

	              

	            }
	          );
			
		}else{
			this.spinner.hide();
			let timerInterval
			Swal.fire({
			  title: 'Link Invalid',
			  html: 'Sorry but this link is invalid. You will be redirected to Login page in <strong></strong>',
			  timer: 10000,
			  onBeforeOpen: () => {
			    Swal.showLoading()
			    timerInterval = setInterval(() => {
			      Swal.getContent().querySelector('strong')
			        .textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
			    }, 100)
			  },
			  onClose: () => {
			    clearInterval(timerInterval)
			  }
			}).then((result) => {
			  if (result.dismiss === Swal.DismissReason.timer) {
			  	window.location.href = "http://pbac.digitalinno.com/";
			  }
			});
		}
    	

    }
  }

  validatePassword(password : string){

    let msg = "proceed";

    if(password.length > 7){
      for(var i = 0; i < password.length; i++){

        if (password[i] === password[i].toUpperCase()
            && password[i] !== password[i].toLowerCase()) {
            msg = "proceed";
            break;
        } else {
            msg = "Password must contain uppercase letter.";
        }

      }

      if(msg !== "proceed"){
        return msg;
      }

      if(!(/\d/.test(password))){
        msg = "Password must contain number.";
        return msg;
      }

      if(!(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))){
        msg = "Password must contain special character.";
        return msg;
      }

    }else{
      msg = "Password length should be more than 8 characters.";
      return msg;
    }

    return msg;

  }

  updatePassword(){
  	if(this.password == "" || this.cpassword == ""){
  		Swal.fire(
	      'Confirm Password',
	      'Both password and confirm password is required.',
	      'error'
	    );
  	}else{

  		if(this.validatePassword(this.password) !== "proceed"){
	      Swal.fire(
		      'Confirm Password',
		      this.validatePassword(this.password),
		      'error'
		    );
	    }else if(this.password !== this.cpassword){
	  		Swal.fire(
		      'Confirm Password',
		      'Password and confirm password is not the same.',
		      'error'
		    );
	  	}else{
	  		this.userHolder.password = this.password;
	  		this.spinner.show();
	  		this.authLogin.callNonAuth("/api-non-auth/updateUser", {userInfo:this.userHolder}).subscribe(
              result => {
				this.changePasswordRequest.status = "0";
				let param = {ChangePassRequest: this.changePasswordRequest}
              this.authLogin.callNonAuth("/api-non-auth/newChangePassRequest", param).subscribe(
                result => { 
                	this.spinner.hide();
                	Swal.fire(
				      'Success!',
				      'Your password has been changed.',
				      'success'
				    ).then((result) => {
					  if (result.value) {
					  	window.location.href = "https://www.digitalinno.com/";
					  }
					});

                });

              }
            );

	  	}

  	}
  }

  logout() {

    this.auth.setPage("false");
    localStorage.setItem("allScreens", "[]");
    localStorage.setItem("userDetail", "[]");
    localStorage.setItem("isLoggedIn", "false");

    this.auth.setScreens(JSON.parse(localStorage.getItem("allScreens") || "[]"));
    this.auth.setUserDetails(JSON.parse(localStorage.getItem("userDetail") || "[]"));
    this.auth.setLogin(localStorage.getItem('isLoggedIn'));
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('allScreens');
    localStorage.removeItem('userDetail');
    localStorage.removeItem('landingPage');
    localStorage.clear();
    window.location.reload();

  }

}
