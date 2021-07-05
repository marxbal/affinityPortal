import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {IsRequired} from '../../../guard/is-required';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {MarshCoverages} from '../../../objects/marsh-coverages';
import {Property} from '../../../objects/property';
import {AuthService} from '../../../services/auth.service';
import {CommonService} from '../../../services/common.service';
import * as m from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import {PersonalAccidentIssuanceService} from '../../../services/personal-accident-issuance.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css'] 
})
export class PropertyComponent implements OnInit {

  constructor(private caller : AuthService, private checker : IsRequired, private common : CommonService,
    private spinner : NgxSpinnerService, private paSvc : PersonalAccidentIssuanceService) { }

  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();
  @Output() backButton = new EventEmitter();

  tempWOA: Property = new Property();
  showAll : String = "0";
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();
  title: String = "";

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

  	if(!this.marsh){
      this.marsh = new Marsh();
    }

    this.caller.doCallService('afnty/getBuildings',null).subscribe(
      result => {
        console.log(result);
        this.marsh.lov.buildingsLOV = result;
        this.marsh.propertyDetails.propertyId = "0";
    });

    this.caller.getLOV('G2990006', '5', 'cod_cia~1|cod_campo~TXT_DESCRIPTION_PROPERTY_2356|cod_ramo~200|fec_validez~15102014|DVCOD_MODALIDAD~20001').subscribe(
      result => {
        console.log(result);
        this.marsh.lov.workOfArtsLOV = result;
        
    });

    this.marsh.propertyDetails.EVFurnishing = "0";

    if(this.marsh.propertyDetails.EVFurnishing){
      let g = parseFloat((this.marsh.propertyDetails.EVFurnishing).toString().replace(/\,/g,''));
      this.marsh.propertyDetails.EVFurnishing = g.toLocaleString();
      if(this.marsh.propertyDetails.EVFurnishing == "NaN"){
        this.marsh.propertyDetails.EVFurnishing = "";
      }
    }

     this.marsh.propertyDetails.EVImprovements = "0";
    if(this.marsh.propertyDetails.EVImprovements){
      let g = parseFloat((this.marsh.propertyDetails.EVImprovements).toString().replace(/\,/g,''));
      this.marsh.propertyDetails.EVImprovements = g.toLocaleString();
      if(this.marsh.propertyDetails.EVImprovements == "NaN"){
        this.marsh.propertyDetails.EVImprovements = "";
      }
    }



  }

  iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  onKey(evt){

    let g = parseFloat((evt.target.value).toString().replace(/\,/g,''));
    evt.target.value = g.toLocaleString();
    if(evt.target.value == "NaN"){
      evt.target.value = "";
    }
    console.log(evt.target.value);

  } 

  checkIfNumber(evt,type){
    let re = /^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?$/;

    if(!re.test(evt.target.value)){
      Swal.fire({
        type: 'error',
        title: 'Quotation Issuance',
        text: "Value should only be a number."
      });
      evt.target.value = "0";
      if(type == 1){
        this.marsh.propertyDetails.EVFurnishing = "0";
      }else{
        this.marsh.propertyDetails.EVImprovements = "0";
      }
    }

  }

  addWorkOfArt(){
    if(this.checker.checkIfRequired('property-woa') == "0"){
      return null;
    }

    if(this.marsh.propertyDetails.EVFurnishing == "0" && this.marsh.propertyDetails.EVImprovements == "0"){
      Swal.fire({
        type: 'error',
        title: 'Quotation Issuance',
        text: "Estimated value of Furnishings and/or Improvements are required before including Works of Art."
      });
      return null;
    }

    this.tempWOA.workOfArtsValues = this.tempWOA.workOfArtsValues.toUpperCase();
    this.tempWOA.workOfArtsDescription = this.tempWOA.workOfArtsDescription.toUpperCase();
    this.tempWOA.workOfArtsAmount = (this.tempWOA.workOfArtsAmount).toString().replace(/\,/g,'');

    this.marsh.propertyDetails.workOfArtsList.push(this.tempWOA);

    this.tempWOA = new Property();

  }

  removeWorkOfArt(woa){
    const index: number = this.marsh.propertyDetails.workOfArtsList.indexOf(woa);

    if (index !== -1) {
      this.marsh.propertyDetails.workOfArtsList.splice(index, 1);
    }
  }

  selectProduct(product,description){
    this.marsh.motorDetails.productId = product;
    this.marsh.productId = product;
    this.marsh.motorDetails.motorTypeIdHolder = "100-PRIVATE CAR"; 
    this.marsh.motorDetails.motorTypeId = "100"; 
    this.marsh.motorDetails.motorType = "PRIVATE CAR"; 
    this.viewCoverage(description,'');
 
    this.common.sleep(1000).then(() => {
      this.common.scrollToElement("property",500);
    });

    $("#compreCard").removeClass("card-shadow");
    $("#ctplCard").removeClass("card-shadow");

    if(this.marsh.productId == "10001"){
      $("#compreCard").addClass("card-shadow");
    }else{
      $("#ctplCard").addClass("card-shadow");
    }

    this.showAll = "1";

  }

  viewCoverage(type,description){
    this.spinner.show();
    this.title = description;

    this.caller.doCallService("afnty/coverage/getCoverageDescriptions", type).subscribe(
      result => {
        this.coverageList = [];
        console.log(result);
        let coverageHolder = result;
        for(let c in coverageHolder){
          for(let d in coverageHolder[c]){
            this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
            this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
          }
          this.coverageList.push(this.coverage);
          this.coverage = new MarshCoverages();
          
        }
        this.spinner.hide();
        this.marsh.coverages = this.coverageList;
    });

  }



  nextStepAction(){

    if(this.checker.checkIfRequired('property-quote') == "0"){
      return null;
    }

    if(this.marsh.propertyDetails.EVFurnishing == "0" && this.marsh.propertyDetails.EVImprovements == "0"){
      Swal.fire({
        type: 'error',
        title: 'Quotation Issuance',
        text: "Estimated value of Furnishings and/or Improvements are required."
      });
      return null;
    }

    this.marsh.propertyDetails.unitNumber = this.marsh.propertyDetails.unitNumber.toUpperCase();
    this.marsh.propertyDetails.workOfArtsAmount = "0";

    if(this.marsh.propertyDetails.workOfArtsList.length > 0){

      let total = 0;
      for(let i = 0; i < this.marsh.propertyDetails.workOfArtsList.length; i++){
        total = total + parseFloat(this.marsh.propertyDetails.workOfArtsList[i].workOfArtsAmount);
      }



      this.marsh.propertyDetails.workOfArtsAmount = total.toString();

    }

    let tsi = 0;
    tsi = parseFloat(this.marsh.propertyDetails.EVFurnishing.replace(/\,/g,'')) + 
          parseFloat(this.marsh.propertyDetails.EVImprovements.replace(/\,/g,'')) + 
          parseFloat(this.marsh.propertyDetails.workOfArtsAmount);
          console.log(tsi);

    if(tsi >= 30000000){

      Swal.fire({
      title: 'Quotation Issuance',
      text: "MAX AMOUNT OF TOTAL SUM INSURED IS 30M. THIS IS SUBJECT TO UW APPROVAL.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Revise Values',
      confirmButtonText: 'Proceed to Next Step'
      }).then((result) => {

         if(!result.value){
          return null;
        }

        this.nextStep.emit("personalInformation");
        this.backButton.emit("householdQuotationIssuance");
        this.marshOutput.emit(this.marsh);

      });

    }else{
      this.nextStep.emit("personalInformation");
      this.backButton.emit("householdQuotationIssuance");
      this.marshOutput.emit(this.marsh);
    }
    

  	
  }

  backButtonAction(){
    this.nextStep.emit("initialize");
    this.backButton.emit("");
    this.marshOutput.emit(this.marsh);
  }

}
