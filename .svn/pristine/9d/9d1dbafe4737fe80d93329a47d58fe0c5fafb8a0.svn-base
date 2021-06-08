import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ResolveStart } from '@angular/router';
import {Observable} from 'rxjs';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from './services/authentication.service';
import { EventManager } from '@angular/platform-browser';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  pageCheck: Observable<string>;
  screenList: Observable<any[]>;
  url: String;
  baseUrl = environment.baseUrl;
  collapse: String = "1";
  userType: String;

  constructor(
    public router: Router,
    public auth: AuthenticationService)
  {
  }

 ngOnInit(){
   this.updateActivePage();
 	this.pageCheck = this.auth.page;
  this.screenList = this.auth.ScreenList;
  

  if(this.auth.getUserRole() == "1"){
     this.userType = "System Administrator";
  }else if(this.auth.getUserRole() == "2"){
     this.userType = "Underwriting";
  }else if(this.auth.getUserRole() == "3"){
     this.userType = "Manning Agency Administrator";
  }else if(this.auth.getUserRole() == "4"){
     this.userType = "Insurance Company Administrator";
  }else if(this.auth.getUserRole() == "5"){
     this.userType = "Insurance Company Sales";
  }else if(this.auth.getUserRole() == "6"){
     this.userType = "Manning Agency Sales";
  }else if(this.auth.getUserRole() == "7"){
     this.userType = "Insurance Company Agent";
  }else if(this.auth.getUserRole() == "8"){
     this.userType = "Insurance Company Cashier";
  }else if(this.auth.getUserRole() == "9"){
     this.userType = "Insurance Company Super User";
  }
  
 }

 sidebarCollapse(toggleType : String){

   if(toggleType == "menu"){
     if(this.collapse == "0"){
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('active');
        $('.route-description').toggleClass('hidden');
        $('#sidebar ul li a').toggleClass('text-center');
        $('.welcome-user').toggleClass('hidden');
        $('.sidebar-footer').toggleClass('hidden');
        $('#sidebarCollapse').toggleClass('pull-right');
        this.collapse = "1";
     }
   }else{
     if(this.collapse == "0"){
        this.collapse = "1";
     }else{
        this.collapse = "0";
     }
    $('#sidebar').toggleClass('active');
    $('#content').toggleClass('active');
    $('.route-description').toggleClass('hidden');
    $('#sidebar ul li a').toggleClass('text-center');
    $('.welcome-user').toggleClass('hidden');
    $('.sidebar-footer').toggleClass('hidden');
    $('#sidebarCollapse').toggleClass('pull-right');
   }

 }

 updateActivePage(){
   $(".parent-menus").removeClass("active");
   var n = window.location.href.split("/");
   this.auth.setActiveScreen(window.location.href);
 }

 showHidePageClass() {
    if (this.auth.getLoginVal() == "false") {
       return "hidden";
    } else {
      return "";
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
    this.router.navigate(['/login']);
    window.location.reload();

  }

}
