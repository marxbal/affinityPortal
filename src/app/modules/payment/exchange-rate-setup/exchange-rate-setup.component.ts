import { Component, OnInit,OnDestroy, HostListener } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {ExchangeRate} from '../../../objects/exchange-rate';
import {ExchangeRateType} from '../../../objects/exchange-rate-type';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exchange-rate-setup',
  templateUrl: './exchange-rate-setup.component.html',
  styleUrls: ['./exchange-rate-setup.component.css']
})
export class ExchangeRateSetupComponent implements OnInit, ComponentCanDeactivate,OnDestroy {


  constructor(private auth: AuthenticationService,private caller : AuthService,private router: Router) { }

  private subscription: Subscription = new Subscription();

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  exchangeRateNew: ExchangeRate;

  exchangeRateList: ExchangeRate[];
  exchangeRateTypeList: ExchangeRateType[];

  exchangeType: String;
  addExchangeRateError: String;
  addExchangeRateSuccess: String;

  ngOnInit() {

  	this.exchangeRateNew = new ExchangeRate();
    this.exchangeType = "0";
    this.addExchangeRateError = "";
  	this.addExchangeRateSuccess = "";

  	this.subscription.add(this.caller.doCallService("/payment/select-all-exchange-rate-type", "").subscribe(
      result => { 

      	this.exchangeRateTypeList = result;

      }
    ));

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  chooseExchangeRateType(){

  	this.subscription.add(this.caller.doCallService("/payment/select-all-exchange-rate", "ST," + this.exchangeType).subscribe(
      result => { 

      	this.exchangeRateList = result;

        for(let i = 0; i < this.exchangeRateList.length; i++){
          this.exchangeRateList[i].dateAdded = m(this.exchangeRateList[i].dateAdded).format(this.auth.getDateFormat());
        }

      }
    ));

  }

  clearModalContent(){
  	this.exchangeRateNew = new ExchangeRate();
  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

  deleteExchangeRate(ex: ExchangeRate){
    var ask = confirm("Are you sure you want to delete exchange rate setup ID no. " + ex.exchangeRateId + "?");
    
    if(ask){

      this.subscription.add(this.caller.doCallService("/payment/deleteExchangeRate", ex.exchangeRateId).subscribe(
        result => { 

          if(result == "1"){
            this.addExchangeRateSuccess = "Successful deletion of Exchange Rate Setup ID " + ex.exchangeRateId;
            $("#addExchangeRateSuccess").addClass("show");
            $("#addExchangeRateSuccess").removeClass("hidden");
            $("#closeModalSetup").trigger("click");
            this.chooseExchangeRateType();

          }

        }
      ));

    }

  }

  addNewRate(){

    if(m().isBefore(this.exchangeRateNew.dateAdded)){
      this.addExchangeRateError = "Date should not be greater than date today.";
      $("#addExchangeRateError").removeClass("hidden");
      $("#addExchangeRateError").addClass("show");
    }else{

      this.subscription.add(this.caller.doCallService("/payment/insertNewERSetup", {ExchangeRate: this.exchangeRateNew}).subscribe(
          result => { 

            if(result == "1"){
              this.addExchangeRateSuccess = "Successful adding of new Exchange Rate Setup.";
              $("#addExchangeRateSuccess").addClass("show");
              $("#addExchangeRateSuccess").removeClass("hidden");
              $("#closeModalSetup").trigger("click");
              this.chooseExchangeRateType();
            }else{
              var ask = confirm(result);

              if(ask){

                this.subscription.add(this.caller.doCallService("/payment/updateERSetup", {ExchangeRate: this.exchangeRateNew}).subscribe(
                  result => { 

                    if(result == "1"){
                      this.addExchangeRateSuccess = "Successful adding of new Exchange Rate Setup.";
                      $("#addExchangeRateSuccess").addClass("show");
                      $("#addExchangeRateSuccess").removeClass("hidden");
                      $("#closeModalSetup").trigger("click");
                      this.chooseExchangeRateType();

                    }

                  }
                ));

              }

            }


          }
        ));

    }

  }

}
