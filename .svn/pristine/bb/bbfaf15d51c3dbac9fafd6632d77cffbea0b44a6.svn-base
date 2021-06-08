import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit,OnDestroy, Input, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthService} from '../../../services/auth.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {Observable} from 'rxjs';
import {Users} from '../../../objects/user';
import {UserRoles} from '../../../objects/role';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import {Customer} from '../../../objects/customer';
import Swal from 'sweetalert2';
import {ChangePasswordRequest} from '../../../objects/change-password-request';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, ComponentCanDeactivate, OnDestroy {

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,

    private authRegister: AuthService,
  	private auth: AuthenticationService,
  	private router: Router,
    private spinner: NgxSpinnerService
  	) {this.__componentInspectorService.getComp(this);
 }
  private subscription: Subscription = new Subscription();

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  @Input() register: Users;

  usersList: Users[];
  userRolesInputList: UserRoles[];
  usersViewInfo: Users[] = [];
  usersViewInfoRoles: UserRoles[] = [];
  changePasswordRequest: ChangePasswordRequest;
  selectedUser: Users;
  finalStatus: string;
  rolesList: any[];
  rolesInputList: UserRoles[];
  errorMessage: string = "";
  successMessage: string = "";
  passwordError: string = "";
  toProceed: string = "1";
  cpassword: string;
  addUserNotice: string;
  customerList : Customer[];
  customerAgentList : Customer[];

  ngOnInit() {
    this.rolesInputList = [];
    this.register = new Users();
    this.register.roleId = "";
    this.changePasswordRequest = new ChangePasswordRequest();
    this.userRolesInputList = [];
    this.usersList = [];
  	this.customerAgentList = [];
    let temp = new Users();
    let temp2 = new UserRoles();
  	this.usersViewInfo.push(temp);
  	this.usersViewInfoRoles.push(temp2);

    this.spinner.show();
  	this.subscription.add(this.authRegister.callPaginated("/api-auth/findByStatusIn", [1,0], "0","10000").subscribe(
        result => { 

          this.usersList = result;

          for(let i = 0; i < this.usersList.length; i++){

            this.usersList[i].dateAdded = m(this.usersList[i].dateAdded).format(this.auth.getDateFormat());

          }

          this.spinner.hide();
        }
      ));

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  addRoleNewUser(){

    this.rolesInputList = [];
    for(let i = 0; i < this.rolesList.length; i++){
      if(this.rolesList[i]['roleId'] == this.register.roleId){
        this.rolesInputList.push(this.rolesList[i]);
        break;
      }
    }

    if(this.register.roleId == "3" || this.register.roleId == "6"){

      let param = '2,O-';
      this.subscription.add(this.authRegister.callNonAuthPaginated("/client/select-all-customer-by-type", param, "0", "10000").subscribe(
        result => {
          this.customerList = result;
          this.register.manningAgencyId = "0";
          this.spinner.hide();
        }
      ));

      $("#manningAgencyField").removeClass("hidden");
      $("#agentField").addClass("hidden");

    }else if(this.register.roleId == "7"){

      let param = '3,O-';

      this.subscription.add(this.authRegister.callNonAuthPaginated("/client/select-all-customer-by-type", param, "0", "10000").subscribe(
        result => {
          this.customerAgentList = result;
          this.register.customerId = "0";
          this.spinner.hide();
        }
      ));

      $("#manningAgencyField").addClass("hidden");
      $("#agentField").removeClass("hidden");

    }else{
      $("#agentField").addClass("hidden");
      $("#manningAgencyField").addClass("hidden");
    }
    
  }

  addRoleRegister(role: UserRoles){

    const index: number = this.rolesInputList.indexOf(role);

    if (index !== -1) {
      this.rolesInputList.splice(index, 1);
    }else{
      this.rolesInputList.push(role);
    }

    if(role.roleId == "3" || role.roleId == "6"){

      let param = '2';

      if(this.auth.getUserType() == "ICA"){
        param += ",ICA-" + this.auth.getUserDetails().userId;
      }else{
        param += ",O-";
      }

      this.subscription.add(this.authRegister.doCallService("/client/select-all-customer-by-type", param).subscribe(
        result => {
          this.customerList = result;
          this.spinner.hide();
        }
      ));

      $("#manningAgencyField").removeClass("hidden");
      $("#agentField").addClass("hidden");

    }else if(role.roleId == "7"){

      let param = '3';

      if(this.auth.getUserType() == "ICA"){
        param += ",ICA-" + this.auth.getUserDetails().userId;
      }else{
        param += ",O-";
      }

      this.subscription.add(this.authRegister.doCallService("/client/select-all-customer-by-type", param).subscribe(
        result => {
          this.customerAgentList = result;
          this.spinner.hide();
        }
      ));

      $("#manningAgencyField").addClass("hidden");
      $("#agentField").removeClass("hidden");

    }else{
      $("#agentField").addClass("hidden");
      $("#manningAgencyField").addClass("hidden");
    }


  }

  openNewUser(){
    this.spinner.show();
    this.subscription.add(this.authRegister.callNonAuth("/api-non-auth/getAllRoles", "").subscribe(
        result => { 
          this.rolesList = result;
          this.spinner.hide();
        }
      ));

  }

  checkPassword(){

    if(this.validatePassword(this.register.password) !== "proceed"){
      this.passwordError = this.validatePassword(this.register.password);
    }else{
      this.passwordError = "";
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

  forgotPassword(user){
    let username = user.username;
    this.spinner.show();
    if(username == ""){
      this.spinner.hide();
      Swal.fire(
        'Ooppsss...',
        'Please input your valid username to proceed.',
        'warning'
      );
      $("#username").attr("style","border: 1px solid red;");

    }else{
      $("#username").removeAttr("style");
      this.spinner.hide();
      Swal.fire({
        title: 'Are you sure?',
        text: "You're about to request for change of password, proceed?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proceed'
      }).then((result) => {
        if (result.value) {
          this.spinner.show();
          this.subscription.add(this.authRegister.doCallService("/api-non-auth/getByUsername", username).subscribe(
            resulta => { 
              this.changePasswordRequest.userId = resulta.userId;
              this.changePasswordRequest.dateAdded = m().format('YYYY-MM-DD HH:mm:ss');
              let param = {ChangePassRequest: this.changePasswordRequest}
              this.subscription.add(this.authRegister.doCallService("/api-non-auth/newChangePassRequest", param).subscribe(
                result => { 
                  if(result.status == "SUCCESS"){

                    let fullName = resulta.firstName + " " + resulta.lastName;
                    let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color:white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ fullName +"</b>,</p><p>We have received a request to change your OFW System account password associated with this email address. If you have not placed this request, you can safely ignore this email.If you do need to change your password, you can use the link given below. <br><br><b><a href='https://www.digitalinno.com/passwordmanagement/"+ result.changePasswordRequestId +"'>CHANGE PASSWORD</a></b></p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";
                    let paramEmail =  {toName: fullName, to: resulta.email, subject: "OFW System Change Password Request", body: mailBody};

                    this.subscription.add(this.authRegister.doCallService("/digitalinnomailer/", paramEmail).subscribe(
                      resulte => {
                        this.spinner.hide();

                        Swal.fire(
                          'Success!',
                          "We've sent an email to email account "+ resulta.email +", please check and follow steps.",
                          'success'
                        );
                        
                      }
                    ));

                    
                  }else{

                    this.spinner.hide();

                    Swal.fire(
                      'Ooppsss...',
                      'Please input your valid username to proceed.',
                      'warning'
                    );
                  }
                  
                }
              ));

            }
          ));

        }
      });

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

    if(!this.register.middleName){
      this.register.middleName = "";
    }

    this.register.firstName = this.register.firstName.trim();
    this.register.middleName = this.register.middleName.trim();
    this.register.lastName = this.register.lastName.trim();

    if(this.toProceed == "1"){
    this.register.status = "1";
    this.register.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');
    let param = {User:this.register , UserRoles:this.rolesInputList};
    this.spinner.show();
    this.subscription.add(this.authRegister.callNonAuth("/api-non-auth/signUp", param ).subscribe(
        result => {
          if(result.status == "SUCCESS") {

            Swal.fire({
              title: 'Success!',
              text: "User successfully created and activated! Thank you!",
              type: 'success'
            }).then((result) => {
              if (result.value) {
                this.addUserNotice = "User successfully created and activated! Thank you!";
                this.spinner.hide();

                this.spinner.show();
                this.subscription.add(this.authRegister.callPaginated("/api-auth/findByStatusIn", [1,0], "0","10000").subscribe(
                    result => { 

                      this.usersList = result;

                      for(let i = 0; i < this.usersList.length; i++){

                        this.usersList[i].dateAdded = m(this.usersList[i].dateAdded).format(this.auth.getDateFormat());

                      }

                      this.spinner.hide();
                    }
                  ));

                $("#addUserSuccess").addClass('show');
                $("#addUserSuccess").removeClass('hidden');
                $("#closeAddUserBtn").trigger('click');
              }
            });

            let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ this.register.firstName +"</b>,</p><p>Welcome!<br><br>Your account is now activated!</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

            let paramEmail =  {body: mailBody, toName: this.register.firstName + ' ' + this.register.lastName, to: this.register.email, subject: "Welcome to PBAC OFW System"};

              this.subscription.add(this.authRegister.callNonAuth("/digitalinnomailer/", paramEmail).subscribe(
                result => {
                  
                  
                }
              ));

          }else{
            Swal.fire(
              'Registration Failed',
              result.status,
              'error'
            );
          }

          this.spinner.hide();

        }
      ));

    }else{

      Swal.fire(
        'Invalid Input',
        this.errorMessage,
        'error'
      );

    }


  }


  addRole(role: UserRoles){

    const index: number = this.userRolesInputList.indexOf(role);

    if (index !== -1) {
        this.userRolesInputList.splice(index, 1);
    }else{
      this.userRolesInputList.push(role);
    }


  }

  updateUser(){
    
  	let param = {User:this.selectedUser , UserRoles:this.userRolesInputList};
  	if(this.userRolesInputList.length <= 0 && this.finalStatus == "1"){
      Swal.fire(
        'User Update',
        'Please choose atleast one role.',
        'error'
      );
  	}else{
    this.spinner.show();
  	this.selectedUser.status = this.finalStatus;
    this.selectedUser.dateAdded = m(this.selectedUser.dateAdded).format('YYYY/MM/DD HH:mm:ss');
  	this.subscription.add(this.authRegister.doCallService("/api-auth/approveUser", param).subscribe(
        result => { 
          if(result.status == "SUCCESS") {
            this.addUserNotice = "User successfully created! Please wait for the activation of your account.";
          }else{
            Swal.fire(
              'Update Failed.',
              result.status,
              'error'
            );
          }

          $("#addUserSuccess").addClass('show');
          $("#addUserSuccess").removeClass('hidden');
          $("#closeUpdateUserModalBtn").trigger('click');
          this.spinner.hide();

        },
        error =>{
          if(error.text == "SUCCESS") {
          	if(this.finalStatus == "1"){
          		this.addUserNotice = "User successfully activated!";

              let scrollToTop = window.setInterval(() => {
              let pos = window.pageYOffset;
              if (pos > 0) {
                  window.scrollTo(0, pos - 20); // how far to scroll on each step
              } else {
                  window.clearInterval(scrollToTop);
              }
              });

              let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ this.selectedUser.firstName +"</b>,</p><p>Welcome!<br><br>Your account is now activated!</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

              let paramEmail =  {body: mailBody, toName: this.selectedUser.firstName + ' ' + this.selectedUser.lastName, to: this.selectedUser.email, subject: "PBAC System Account Update"};

                this.subscription.add(this.authRegister.doCallService("/digitalinnomailer/", paramEmail).subscribe(
                  result => {

                    this.spinner.hide();
                    
                  }
                ));

          	}else{
          		this.addUserNotice = "User "+ this.selectedUser.username +" successfully deactivated!";

              let scrollToTop = window.setInterval(() => {
              let pos = window.pageYOffset;
              if (pos > 0) {
                  window.scrollTo(0, pos - 20); // how far to scroll on each step
              } else {
                  window.clearInterval(scrollToTop);
              }
              });

              let mailBody = "<html><body style='margin: 0; font-family: century gothic;'><div style='border-bottom: 25px solid #16519e; width: 100%; background-color: white; text-align: center;'><img style='width: 25%' src='http://www.philbritish.com/wp-content/uploads/2016/12/new-footer.png' /></div><table style='width: 100%; margin-top: 50px;'><tbody><tr><td width='10%'></td><td width='80%'><p>Dear <b>"+ this.selectedUser.firstName +"</b>,</p><p>For your information,<br><br>Your account has been deactivated, please contact your administrator for more information.</p><br><p>Truly yours,</p><p>Philippine British Assurance Corporation</p><p style='margin-top: 100px;'><b>This is an automated Email. Please do not reply.</b></p></td><td width='10%'></td></tr></tbody></table></body></html>";

              let paramEmail =  {body: mailBody, toName: this.selectedUser.firstName + ' ' + this.selectedUser.lastName, to: this.selectedUser.email, subject: "PBAC System Account Update"};

                this.subscription.add(this.authRegister.doCallService("/digitalinnomailer/", paramEmail).subscribe(
                  result => {

                    this.spinner.hide();
                    
                  }
                ));
          	}

          }else{
            this.spinner.hide();
            Swal.fire(
              'Update Failed',
              error.text,
              'error'
            );
          }

          $("#addUserSuccess").addClass('show');
          $("#addUserSuccess").removeClass('hidden');
          $("#closeUpdateUserModalBtn").trigger('click');
          this.spinner.hide();

        }
      ));

  	}

  }

  openUserActivate(user: Users){

    this.spinner.show();
    this.finalStatus = "1";    
    this.selectedUser = user;
    this.userRolesInputList = [];
    this.subscription.add(this.authRegister.doCallService("/api-auth/findUsersViaIds", [user.userId]).subscribe(
        result => { 
          
          this.usersViewInfo = [];
          this.usersViewInfo = result;

          this.subscription.add(this.authRegister.doCallService("/api-auth/findRolesByUserId", user.userId).subscribe(
            resulta => { 
              this.usersViewInfoRoles = [];
              this.usersViewInfoRoles = resulta;
              this.spinner.hide();
            }
          ));

        }
      ));

    
           


  }

  openUserDeactivate(user: Users){
    this.spinner.show();
    this.finalStatus = "0";    
    this.selectedUser = user;
    this.userRolesInputList = [];
    this.subscription.add(this.authRegister.doCallService("/api-auth/findUsersViaIds", [user.userId]).subscribe(
        result => { 
          this.usersViewInfo = [];
          this.usersViewInfo = result;

          this.subscription.add(this.authRegister.doCallService("/api-auth/findRolesByUserId", user.userId).subscribe(
            resulta => { 
              this.usersViewInfoRoles = [];
              this.usersViewInfoRoles = resulta;
              this.userRolesInputList = resulta;
              this.spinner.hide();
              
            }
          ));

        }
      ));

  }

}
