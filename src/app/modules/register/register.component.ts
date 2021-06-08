import { Component, OnInit, Input } from '@angular/core';
import { formatDate } from '@angular/common';
import {Users} from '../../objects/user';
import {UserRoles} from '../../objects/role';
import * as $ from 'jquery/dist/jquery.min';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as m from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import {Customer} from '../../objects/customer';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    @Input() register: Users;
	  cpassword: string;
    errorMessage: string = "";
	  successMessage: string = "";
	  toProceed: string = "1";
    rolesList: any[];
    rolesInputList: UserRoles[];
    customerList : Customer[];
    customerAgentList : Customer[];
    passwordError: string = "";

  constructor(
    private authRegister: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit() {
    this.register = new Users();
    this.register.roleId = "";
    this.rolesInputList = [];
  	

    this.customerAgentList = [];
    this.customerList = [];

    setTimeout(function(){
      var body = document.querySelector("body");
      body.setAttribute("style","background: linear-gradient(to right, rgba(0,194,146,1), rgba(0,106,128,1));");
    },10);

  	// body.setAttribute("style","background-image: url('/assets/images/register-bg.jpg'); background-size: cover; background-repeat: no-repeat; background-position: fixed;");
  	

    this.authRegister.callNonAuth("/api-non-auth/getAllRoles", "").subscribe(
        result => { 
          this.rolesList = result;
        }
      );

  }

  toLogin(){
    this.router.navigate(['login']);
  }

  addRole(){

    this.rolesInputList = [];
    for(let i = 0; i < this.rolesList.length; i++){
      if(this.rolesList[i]['roleId'] == this.register.roleId){
        this.rolesInputList.push(this.rolesList[i]);
        break;
      }
    }

    if(this.register.roleId == "3" || this.register.roleId == "6"){

      let param = '2,O-';
      this.authRegister.callNonAuthPaginated("/client/select-all-customer-by-type", param, "0", "10000").subscribe(
        result => {
          this.customerList = result;
          this.register.manningAgencyId = "0";
          this.spinner.hide();
        }
      );

      $("#manningAgencyField").removeClass("hidden");
      $("#agentField").addClass("hidden");

    }else if(this.register.roleId == "7"){

      let param = '3,O-';

      this.authRegister.callNonAuthPaginated("/client/select-all-customer-by-type", param, "0", "10000").subscribe(
        result => {
          this.customerAgentList = result;
          this.register.customerId = "0";
          this.spinner.hide();
        }
      );

      $("#manningAgencyField").addClass("hidden");
      $("#agentField").removeClass("hidden");

    }else{
      $("#agentField").addClass("hidden");
      $("#manningAgencyField").addClass("hidden");
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

  checkPassword(){

    if(this.validatePassword(this.register.password) !== "proceed"){
      this.passwordError = this.validatePassword(this.register.password);
    }else{
      this.passwordError = "";
    }

  }

  registerSubmit(e : any){

    this.errorMessage = "";
    this.toProceed = "1";

  	if(this.validatePassword(this.register.password) !== "proceed"){
  		this.errorMessage += this.validatePassword(this.register.password);
  		this.toProceed = "0";
  	}
  	
  	if(this.register.password != this.cpassword){
  		this.errorMessage += "Password and confirm password do not match.";
  		this.toProceed = "0";
  	}

    if(!this.register.middleName){
      this.register.middleName = "";
    }

    if(this.register.roleId == ""){

      this.errorMessage += "Please Choose a role.";
      this.toProceed = "0";

    }else{

      if(this.register.roleId == "3" || this.register.roleId == "6"){
        if(this.register.manningAgencyId == "0"){
          this.errorMessage += "Please Choose a manning agency.";
          this.toProceed = "0";
        }
      }else if(this.register.roleId == "7"){
        if(this.register.customerId == "0"){
          this.errorMessage += "Please Choose an agent Id";
          this.toProceed = "0";
        }
      }

    }

    this.register.firstName = this.register.firstName.trim();
    this.register.middleName = this.register.middleName.trim();
    this.register.lastName = this.register.lastName.trim();

  	if(this.toProceed == "1"){
    this.register.status = "0";
    this.register.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
    let param = {User:this.register , UserRoles:this.rolesInputList};
    this.spinner.show();
    this.authRegister.callNonAuth("/api-non-auth/signUp", param ).subscribe(
        result => {

          if(result.status == "SUCCESS") {

            this.spinner.hide();
            this.successMessage = "User successfully created! Please wait for the activation of your account. Thank you!";
            
            Swal.fire({
              title: 'Success!',
              text: "User successfully created! Please wait for the activation of your account. Thank you!",
              type: 'success',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Proceed'
            }).then((result) => {
              if (result.value) {
                this.router.navigate(["/login"]);
              }
            });

            let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ this.register.firstName +"</b>,</p><p>Welcome!<br><br>As of now, you're already registered but your account is pending for approval of System Admin, we will send another email if your account were already activated.</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

            let paramEmail =  {body: mailBody, toName: this.register.firstName + ' ' + this.register.lastName, to: this.register.email, subject: "Welcome to PBAC OFW System"};

              this.authRegister.callNonAuth("/digitalinnomailer/", paramEmail).subscribe(
                result => {
                  
                  
                  
                }
              );
            
          }else{
            this.spinner.hide();
            Swal.fire(
              'Registration Failed.',
              result.status,
              'warning'
            );
          }
        }
      );

  	}else{
      Swal.fire(
        'Registration Failed.',
        this.errorMessage,
        'warning'
      );
    }


  }

}
