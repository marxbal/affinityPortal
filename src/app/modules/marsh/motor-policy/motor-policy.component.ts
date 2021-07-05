import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import * as dz from 'dropzone/dist/dropzone.js';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import * as m from 'moment';
import {IsRequired} from '../../../guard/is-required';
import {MotorAccessories} from '../../../objects/motor-accessories';
import {AuthService} from '../../../services/auth.service';
import {CommonService} from '../../../services/common.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-motor-policy',
  templateUrl: './motor-policy.component.html',
  styleUrls: ['./motor-policy.component.css']
})
export class MotorPolicyComponent  implements OnInit {

  constructor(private caller : AuthService, private checker : IsRequired, private commonService : CommonService, private spinner : NgxSpinnerService) { }

  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();

  accessory: MotorAccessories;

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  minRetro : String = m().subtract(6 , 'month').format('YYYY-MM-DD');

  ngOnInit() {

  	if(!this.marsh){
      this.marsh = new Marsh();
    }

    this.accessory = new MotorAccessories();

    // this.chooseModelYear();

    this.caller.getLOV("A2100800","1",'').subscribe(
      result => {
        this.marsh.lov.colorLOV = result;
    });

    this.caller.doCallService('afnty/getMortgagees',null).subscribe(
      result => {
        this.marsh.lov.mortgageeLOV = result;
    });

  }

  validateEngine(){
    let valid = this.validateEngineChassis(this.marsh.motorDetails.motorNumber);
   if(!valid){
    Swal.fire({
      type: 'error',
      title: 'Policy Issuance',
      text: "Invalid Engine Number format, please make sure Engine Number includes number and alphabet characters."
    });

   }
   return valid;
  }

  validateChassis(){
    let valid = this.validateEngineChassis(this.marsh.motorDetails.serialNumber);
   if(!valid){
    Swal.fire({
      type: 'error',
      title: 'Policy Issuance',
      text: "Invalid Chassis Number format, please make sure Chassis Number includes number and alphabet characters."
    });
   }
   return valid;
  }

  validateEngineChassis(numb){
    const alphaNumeric = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;

    if(numb.length < 5){ return false; }
    if(!alphaNumeric.test(numb)){ return false; }

    return true;

  }

  changePlateNumber(){

    if(this.marsh.productId == "10002"){
      this.marsh.motorDetails.policyPeriodFrom = m("2020-" + this.getMonthBasedOnPlate(this.marsh.motorDetails.plateNumber) + "-01").format('YYYY-MM-DD');
      this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
    }

    this.validatePlateNumber();
  }

  getMonthBasedOnPlate(plate:string){
    var lastDigitPlate = plate.charAt(plate.length-1);
    let monthValue = "";
    switch (lastDigitPlate) {
      case "1":
        monthValue = "02"//FEBRUARY 1 ending plate 1
        break;
      case "2":
        monthValue = "03" //MARCH 1 ending plate 2
        break;
      case "3":
        monthValue = "04" //APRIL 1 ending plate 3
        break;
      case "4":
        monthValue = "05" //MAY 1 ending plate 4
        break;
      case "5":
        monthValue = "06" //JUNE 1 ending plate 5
        break;
      case "6":
        monthValue = "07" //JULY 1 ending plate 6
        break;
      case "7":
        monthValue = "08" //AUGUST 1 ending plate 7
        break;
      case "8":
        monthValue = "09" //SEPTEMBER 1 ending plate 8
        break;
      case "9":
        monthValue = "10" //OCTOBER 1 ending plate 9
        break;
      case "0":
        monthValue = "11" //NOVEMBER 1 ending plate 0
        break;                
      default:
        monthValue = "01"
        break;
    }

    return monthValue;
  }

  validatePlateNumber(){
    if(this.marsh.productId == "10002"){
      return true;
    }
    const userKeyRegExpPlate = /^[A-Z]{3}[0-9]{4}?$/;

    this.marsh.motorDetails.plateNumber = this.marsh.motorDetails.plateNumber.toUpperCase();

      let valid = userKeyRegExpPlate.test(this.marsh.motorDetails.plateNumber);

      if(!valid){
        Swal.fire({
          type: 'error',
          title: 'Policy Issuance',
          text: "Invalid Plate Number format, please make sure you follow the format ABC1234."
        });
        
      }

      return valid;
  }

  validateConduction(){
    const userKeyRegExpConduction = /^[A-Z]{2}[0-9]{4}?$/;

    this.marsh.motorDetails.conductionNumber = this.marsh.motorDetails.conductionNumber.toUpperCase();

      let validCond = userKeyRegExpConduction.test(this.marsh.motorDetails.conductionNumber);

      if(!validCond){
        Swal.fire({
          type: 'error',
          title: 'Policy Issuance',
          text: "Invalid Conduction Number format, please make sure you follow the format AB1234."
        });
        
      }

      return validCond;
  }

  chooseVTPL(){
    this.marsh.motorDetails.propertyDamageLimit = this.marsh.motorDetails.bodilyInjuryLimit;
  }

  chooseType(){

    this.caller.getLOV("A2100400","5",'COD_CIA~1|COD_RAMO~' + this.marsh.motorDetails.motorTypeId).subscribe(
      result => {
        this.marsh.lov.makeLOV = result;
    });

  }

  chooseMake(){

    this.caller.getLOV('A2100410', '5', 'COD_RAMO~' + this.marsh.motorDetails.motorTypeId + '|COD_MARCA~' + this.marsh.motorDetails.manufacturerId + '|COD_CIA~1').subscribe(
      result => {
        console.log(result);
        this.marsh.lov.modelLOV = result;
        this.marsh.motorDetails.modelIdHolder = "";
        this.marsh.motorDetails.vehicleTypeIdHolder = "";
        this.marsh.motorDetails.modelYear = "";
        this.marsh.motorDetails.subModelIdHolder = "";
        this.marsh.motorDetails.FMV = "";

        this.marsh.lov.variantLOV = [];
        this.marsh.lov.yearList = [];
        this.marsh.lov.subModelLOV = [];
    });

  }

  chooseModel(){
    
    this.caller.getLOV('A2100100','4','NUM_COTIZACION~1|COD_MARCA~' + this.marsh.motorDetails.manufacturerId +'|COD_MODELO~' + this.marsh.motorDetails.modelId +'|COD_CIA~1').subscribe(
    result => {
      console.log(result);
      this.marsh.lov.variantLOV = result;
      this.marsh.motorDetails.vehicleTypeIdHolder = "";
      this.marsh.motorDetails.modelYear = "";
      this.marsh.motorDetails.subModelIdHolder = "";
      this.marsh.motorDetails.FMV = "";

      this.marsh.lov.yearList = [];
      this.marsh.lov.subModelLOV = [];
    });
  }

  chooseEffectivityDate(){
    this.spinner.show();
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
    this.spinner.hide(); 

    let isRetro = m().isAfter(this.marsh.motorDetails.policyPeriodFrom, 'day');
    let isBelowSix = m(this.marsh.motorDetails.policyPeriodFrom).isBefore(m().subtract(6 , 'month'));

    $("#vehiclePhotosContainer").addClass("hidden");

    if(!isRetro){
      return null;
    }

    $("#vehiclePhotosContainer").removeClass("hidden");

    Swal.fire({
      type: 'warning',
      title: 'Policy Issuance',
      text: "Submission of current pictures of all sides of the motor vehicle is required for evaluation of acceptance of MAPFRE Insurance  prior to the issuance of the Policy."
    });

    if(isBelowSix){
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Effectivity date should not below Six (6) months from current date."
      });
      this.marsh.motorDetails.policyPeriodFrom = m().subtract(6, 'month').format('YYYY-MM-DD');
      this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
      return null; 
    }
    
  }

  chooseVariant(){

    this.caller.getLOV('A2100430','4','NUM_COTIZACION~1|COD_MARCA~' + this.marsh.motorDetails.manufacturerId +'|COD_MODELO~' + this.marsh.motorDetails.modelId +'|COD_TIP_VEHI~' + this.marsh.motorDetails.vehicleTypeId + '|COD_CIA~1').subscribe(
    result => {
      console.log(result);
      this.marsh.lov.yearList = result;
      this.marsh.motorDetails.modelYear = "";
      this.marsh.motorDetails.subModelIdHolder = "";
      this.marsh.motorDetails.FMV = "";

      this.marsh.lov.subModelLOV = [];
    });

    this.marsh.lineId = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.marsh.motorDetails.motorTypeId = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.marsh.motorDetails.subline = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.marsh.motorDetails.validityDate = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[0];

    this.caller.getLOV('A2100601','2','COD_CIA~1|cod_tip_vehi~'+
      $("#vehicleTypeId").val().split("-")[0]+'|fec_validez~' + 
      this.marsh.motorDetails.validityDate ).subscribe(
    result => {
      for(let i = 0; i < result.length; i++){
        let accesoryType = "Additional";
        if(result[i].ABR_AGRUP_ACCESORIO == "B"){
          accesoryType = "Built-in";
        }else if(result[i].ABR_AGRUP_ACCESORIO == "F"){
          accesoryType = "Free";

        }
        result[i].ABR_AGRUP_ACCESORIO = accesoryType;
      }
      this.marsh.lov.accessoryLOV = result;
    });

  }

  chooseModelYear(){
    $("#vehiclePhotosContainer").addClass("hidden");
    if((m().year() - parseInt(this.marsh.motorDetails.modelYear)) > 8 ){
      $("#vehiclePhotosContainer").removeClass("hidden");

      Swal.fire({
        type: 'warning',
        title: 'Policy Issuance',
        text: "Vehicle more than eight (8) years old is subject to approval. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });

    }

    this.caller.getLOV('A2100420','4','NUM_COTIZACION~1|COD_MARCA~' + 
      this.marsh.motorDetails.manufacturerId +'|COD_MODELO~' +
       this.marsh.motorDetails.modelId +'|COD_TIP_VEHI~' +
        this.marsh.motorDetails.vehicleTypeId + '|ANIO_SUB_MODELO~' + this.marsh.motorDetails.modelYear).subscribe(
    result => {
      console.log(result);
      this.marsh.lov.subModelLOV = result;
      this.marsh.motorDetails.subModelIdHolder = "";
      this.marsh.motorDetails.FMV = "";
    });
  }

  chooseSubModel(){
    
    this.caller.getLOV('A2100200','5','NUM_COTIZACION~1' + 
      '|COD_RAMO~' + this.marsh.motorDetails.motorTypeId + 
      '|COD_MARCA~' + this.marsh.motorDetails.manufacturerId +
      '|COD_MODELO~' + this.marsh.motorDetails.modelId + 
      '|COD_TIP_VEHI~' + this.marsh.motorDetails.vehicleTypeId + 
      '|ANIO_SUB_MODELO~' + this.marsh.motorDetails.modelYear).subscribe(
    result => {
      console.log(result);
      this.marsh.lov.typeOfUseLOV = result;

      this.caller.doCallService('afnty/getFMV?codCia=1&codMarca='+ 
                                  this.marsh.motorDetails.manufacturerId + '&codModelo=' +
                                  this.marsh.motorDetails.modelId + '&codSubModelo=' +
                                  this.marsh.motorDetails.subModelId + '&anioSubModelo='+
                                  this.marsh.motorDetails.modelYear,null).subscribe(
        resulta => {
          console.log(resulta);
          this.marsh.motorDetails.FMV = resulta;
      });

    });

  }

  onSelect(event) {
    console.log(event);
    this.marsh.motorDetails.vehiclePhotos.push(...event.addedFiles);
  }
   
  onRemove(event) {
    console.log(event);
    this.marsh.motorDetails.vehiclePhotos.splice(this.marsh.motorDetails.vehiclePhotos.indexOf(event), 1);
  }

  addAccessory(){
    let accessoryy = this.accessory.accessoryIdHolder;
    this.accessory.accessoryId = accessoryy.split("-")[0];
    this.accessory.accessoryName = accessoryy.split("-")[1];

    // this.marsh.motorDetails.FMV = (parseInt(this.marsh.motorDetails.FMV) + parseInt(this.accessory.accessoryValue)).toString();

    this.marsh.motorDetails.accessories.push(this.accessory);
    this.accessory = new MotorAccessories();
  }

  removeAccessory(accessory: MotorAccessories){
    const index: number = this.marsh.motorDetails.accessories.indexOf(accessory);

    // this.marsh.motorDetails.FMV = (parseInt(this.marsh.motorDetails.FMV) - parseInt(this.accessory.accessoryValue)).toString();

    if (index !== -1) {
      this.marsh.motorDetails.accessories.splice(index, 1);
    }
  }

  nextStepAction(){

    if(this.checker.checkIfRequired('motor-policy-issuance') == "0"){
      return null;
    }

    if(!this.marsh.motorDetails.plateNumber && !this.marsh.motorDetails.conductionNumber){
        Swal.fire({
          type: 'error',
          title: 'Quotation Issuance',
          text: "Conduction Sticker No. or Plate No. is required"
        });
        return null;
      }

      let pass = "0";

      if(this.marsh.motorDetails.plateNumber){
        if(!this.validatePlateNumber()){
          return null;
        }

        pass = "1";
      }

      if(this.marsh.motorDetails.conductionNumber || pass == "0"){
        if(!this.validateConduction()){
          return null;
        }
      }

      if(!this.validateEngine()){
        return null;
      }

      if(!this.validateChassis()){
        return null;
      }

    if(((m().year() - parseInt(this.marsh.motorDetails.modelYear)) > 8)  && this.marsh.motorDetails.vehiclePhotos.length < 1 ){

      Swal.fire({
        type: 'warning',
        title: 'Policy Issuance',
        text: "Vehicle more than eight (8) years old is subject to approval. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });

      $("#vehiclePhotosContainer").removeClass("hidden");
      return null;

    }

    if(this.marsh.productId == "10002"){
      let currentYearDiff = (m().year() - parseInt(this.marsh.motorDetails.modelYear));
      let incepExpiryDiff = m(new Date(this.marsh.motorDetails.policyPeriodTo)).diff(new Date(this.marsh.motorDetails.policyPeriodFrom), 'months', true);
      

      if(currentYearDiff <= 2){
        if(incepExpiryDiff != 36){
          Swal.fire({
            type: 'error',
            title: 'Policy Issuance',
            text: "Three (3) years policy period is required when vehicle age is below two (2) years old."
          });
          return null;
        }
      }else{
        if(incepExpiryDiff < 12 || incepExpiryDiff > 23){
          Swal.fire({
            type: 'error',
            title: 'Policy Issuance',
            text: "One (1) year to Twenty Three (23) months policy period is required when vehicle age is more than two (2) years old."
          });
          return null;
        }
      }
      
    }

    let isRetro = m().isAfter(this.marsh.motorDetails.policyPeriodFrom, 'day');

    if(isRetro && this.marsh.motorDetails.vehiclePhotos.length < 1){
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Policy inception should not be prior date today. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });
      $("#vehiclePhotosContainer").removeClass("hidden");
      return null;
    }

    let totalCheck = 0;
      if(this.marsh.motorDetails.accessories.length > 0){
        for(let i = 0; i < this.marsh.motorDetails.accessories.length; i++){
          totalCheck = totalCheck + parseFloat(this.marsh.motorDetails.accessories[i].accessoryValue);
        }
      }
      totalCheck = totalCheck + parseFloat(this.marsh.motorDetails.FMV);

      if(totalCheck > 5000000){

      Swal.fire({
      title: 'Policy Issuance',
      text: "Motor vehicle with more than 5 million total sum insured requires underwriting approval.",
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

        if(this.marsh.motorDetails.isMortgaged){
          this.marsh.motorDetails.mortgageeId = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[0];
          this.marsh.motorDetails.mortgagee = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[1];
        }

        this.nextStep.emit("riskInformation");
        this.marshOutput.emit(this.marsh);

      });

    }else{
      if(this.marsh.motorDetails.isMortgaged){
        this.marsh.motorDetails.mortgageeId = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[0];
        this.marsh.motorDetails.mortgagee = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[1];
      }
      this.nextStep.emit("riskInformation");
      this.marshOutput.emit(this.marsh);
    }

    

  	
  }

}
