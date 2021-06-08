import { Component, OnInit, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Product} from '../../../objects/product';
import {PremiumAmount} from '../../../objects/premium-amount';
import {AllPremiumDetails} from '../../../objects/all-premium-details';
import {PremiumBreakdownType} from '../../../objects/premium-breakdown-type';
import {PremiumBreakdown} from '../../../objects/premium-breakdown';
import {AuthService} from '../../../services/auth.service';
import * as m from 'moment';
import {Customer} from '../../../objects/customer';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-premium-amount-setup',
  templateUrl: './premium-amount-setup.component.html',
  styleUrls: ['./premium-amount-setup.component.css']
})
export class PremiumAmountSetupComponent implements OnInit, ComponentCanDeactivate {

  constructor(private auth: AuthenticationService,private router: Router, private caller: AuthService,
    private spinner: NgxSpinnerService) { }

  latestProductList: Product[];
  premiumAmountList: AllPremiumDetails[];
  premiumBreakdownTypeList: PremiumBreakdownType[];
  premiumBreakdownFinal: PremiumBreakdown[];
  agentList : Customer[];
  manningAgencyList : Customer[];
  newPremiumAmount: PremiumAmount;
  productHolder: Product;
  addPremiumSetupError: String;
  addPremiumSetupSuccess: String;
  submitType: String;

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  ngOnInit() {

  	this.productHolder = new Product();
    this.newPremiumAmount = new PremiumAmount();
    this.premiumBreakdownTypeList = [];
  	this.premiumBreakdownFinal = [];
  	this.latestProductList = [];
  	this.premiumAmountList = [];
  	this.addPremiumSetupError = "";
  	this.addPremiumSetupSuccess = "";
  	this.submitType = "";
    this.productHolder.product_detail_id = "0";

  	let param =  `{"action": "selectProducts", "values": {}}`;

    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          this.latestProductList = result.msg;
        }
      );

    let param2 =  `{"action": "select-premium-breakdown-type", "values": {}}`;

    this.caller.doCallService("/digitalinnoproductservice/?action=product", param2).subscribe(
        result => {
          this.premiumBreakdownTypeList = result.msg;
        }
      );

    let param3 = '3';
    this.spinner.show();
    if(this.auth.getUserType() == "ICA"){
      param3 += ",ICA-" + this.auth.getUserDetails().userId;
    }else{
      param3 += ",O-";
    }

    this.caller.callPaginated("/client/select-all-customer-by-type", param3,"0","1000").subscribe(
      result => {
        this.agentList = result;
        this.spinner.hide();
      }
    );

    let param4 = '2';

    if(this.auth.getUserType() == "ICA"){
      param4 += ",ICA-" + this.auth.getUserDetails().userId;
    }else{
      param4 += ",O-";
    }

    this.caller.callPaginated("/client/select-all-customer-by-type", param4,"0","1000").subscribe(
      result => {
        this.manningAgencyList = result;
      }
    );

  }

  chooseProduct(){

  	let pid = this.productHolder.product_detail_id.split("-")[0];

  	this.productHolder.description = this.productHolder.product_detail_id.split("-")[1];
  	// this.productHolder.product_detail_id = this.productHolder.product_detail_id.split("-")[0];


  	let param =  {"action": "selectAllPremiumAmount", "values": {product_detail_id: pid}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          this.spinner.hide();
          this.premiumAmountList = result.msg;
          for(let i = 0; i < this.premiumAmountList.length; i++){
            this.premiumAmountList[i].premiumDetails.effectiveDate = m(this.premiumAmountList[i].premiumDetails.effectiveDate).format('YYYY-MM-DD');
            if(this.premiumAmountList[i].premiumDetails.ineffectiveDate){
              this.premiumAmountList[i].premiumDetails.ineffectiveDate = m(this.premiumAmountList[i].premiumDetails.ineffectiveDate).format('YYYY-MM-DD');
            }
           }
        }
      );

  }

  clearModalContents(){
  	this.newPremiumAmount = new PremiumAmount();
  	this.newPremiumAmount.productDetailId = this.productHolder.product_detail_id;
    this.newPremiumAmount.premiumAmount = "0";
  	this.submitType = "add";
    this.clearBreakdown();
  }

  clearBreakdown(){

    for(let i = 0; i < this.premiumBreakdownTypeList.length; i++){

      $("#breakdown-" + this.premiumBreakdownTypeList[i].premiumBreakdownTypeId).val("");

    }

    $("#breakdown-1").val("0");
    $("#breakdown-2").val("0");

  }

  updateProductCoverage(pal: AllPremiumDetails){
    this.clearBreakdown();
    for(let i = 0; i < pal.premiumBreakdown.length; i++){
      $("#breakdown-" + pal.premiumBreakdown[i].premiumBreakdownTypeId).val(pal.premiumBreakdown[i].amountVal);
    }
    this.newPremiumAmount = pal.premiumDetails;
  	this.submitType = "edit";
  }

  deleteProductCoverage(pal: AllPremiumDetails){

  	let param =  {"action": 'deletePremiumSetup', "values": {premiumAmountDetails: pal.premiumDetails}};

    Swal.fire({
      title: 'Premium Setup Deletion',
      text: "Are you sure you want to delete setup ID " + pal.premiumDetails.premiumAmountId + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {

          if(result.status == "0"){
            this.spinner.hide();
            Swal.fire(
              'Deleted!',
              result.msg,
              'success'
            );

              let scrollToTop = window.setInterval(() => {
              let pos = window.pageYOffset;
              if (pos > 0) {
                  window.scrollTo(0, pos - 20); // how far to scroll on each step
              } else {
                  window.clearInterval(scrollToTop);
              }
          }, 16);

          }else{

              let param =  {"action": "selectAllPremiumAmount", "values": {product_detail_id: this.productHolder.product_detail_id.split("-")[0]}};

          this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
              resulta => {
                this.premiumAmountList = resulta.msg;

                for(let i = 0; i < this.premiumAmountList.length; i++){
                  this.premiumAmountList[i].premiumDetails.effectiveDate = m(this.premiumAmountList[i].premiumDetails.effectiveDate).format(this.auth.getDateFormat());
                  if(this.premiumAmountList[i].premiumDetails.ineffectiveDate){
                    this.premiumAmountList[i].premiumDetails.ineffectiveDate = m(this.premiumAmountList[i].premiumDetails.ineffectiveDate).format(this.auth.getDateFormat());
                  }
                 }

                Swal.fire(
                  'Deleted!',
                  "Success deletion of setup ID "+ pal.premiumDetails.premiumAmountId +" for product " + this.productHolder.product_detail_id.split("-")[1],
                  'success'
                );
                this.spinner.hide();
              }
            );

          }

        }
      );
        
      }
    })


  }

  computeCommission(){
    let net = $("#breakdown-1").val();
    let gross = this.newPremiumAmount.premiumAmount;

    $("#breakdown-2").val((parseFloat(gross) - parseFloat(net)).toString());

  }

  addNewPremiumAmountSetup(){

  	let action = 'insertNewPremiumAmount';
  	let msg = "adding of new setup";

  	if(this.submitType == "edit"){
  		action = 'updatePremiumAmount';
  		msg = "updating of existing setup";
  	}

  	this.newPremiumAmount.productDetailId = this.productHolder.product_detail_id.split("-")[0];

    this.premiumBreakdownFinal = [];
    for(let i = 0; i < this.premiumBreakdownTypeList.length; i++){

      let tempPB : PremiumBreakdown = new PremiumBreakdown();
      tempPB.premiumBreakdownTypeId = this.premiumBreakdownTypeList[i].premiumBreakdownTypeId;
      tempPB.amountVal = $("#breakdown-" + this.premiumBreakdownTypeList[i].premiumBreakdownTypeId).val();
      tempPB.dateAdded = m().format('YYYY/MM/DD HH:mm:ss');

      this.premiumBreakdownFinal.push(tempPB);

    }


  	let param =  {"action": action, "values": {premiumAmountDetails: this.newPremiumAmount, premiumBreakdownDetails: this.premiumBreakdownFinal}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {

        	if(result.msg.includes('Failed')){

              this.spinner.hide();
            Swal.fire(
              'Ooppsss...',
              result.msg,
              'warning'
            );

            	let scrollToTop = window.setInterval(() => {
			        let pos = window.pageYOffset;
			        if (pos > 0) {
			            window.scrollTo(0, pos - 20); // how far to scroll on each step
			        } else {
			            window.clearInterval(scrollToTop);
			        }
			        }, 16);
            
        	}else{

            	$("#closeModalSetup").trigger("click");

            	let param =  {"action": "selectAllPremiumAmount", "values": {product_detail_id: this.productHolder.product_detail_id.split("-")[0]}};

			        this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
			        resulta => {
			          this.premiumAmountList = resulta.msg;

                for(let i = 0; i < this.premiumAmountList.length; i++){
                  this.premiumAmountList[i].premiumDetails.effectiveDate = m(this.premiumAmountList[i].premiumDetails.effectiveDate).format(this.auth.getDateFormat());
                  if(this.premiumAmountList[i].premiumDetails.ineffectiveDate){
                    this.premiumAmountList[i].premiumDetails.ineffectiveDate = m(this.premiumAmountList[i].premiumDetails.ineffectiveDate).format(this.auth.getDateFormat());
                  }
                 }

                this.spinner.hide();
                Swal.fire(
                  'Success!',
                  "Success " + msg + " for product " + this.productHolder.product_detail_id.split("-")[1],
                  'success'
                );
			        }
			      );


        	}

        }
      );

  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

}
