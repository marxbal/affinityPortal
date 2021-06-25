import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {IsRequired} from '../../../guard/is-required';
import {Marsh} from '../../../objects/marsh';
import {Risk} from '../../../objects/risk';
import {AuthService} from '../../../services/auth.service';
import {AddressDetails} from '../../../objects/address-details';
import * as m from 'moment';
import {P2000020} from '../../../objects/p2000020';
import {P2000025} from '../../../objects/p2000025';
import {P2000030} from '../../../objects/p2000030';
import {P2000040} from '../../../objects/p2000040';
import {P2000031} from '../../../objects/p2000031';
import {P1001331} from '../../../objects/p1001331';
import {P2100610} from '../../../objects/p2100610';
import {P2000060} from '../../../objects/p2000060';
import {A1000131_MPH} from '../../../objects/a1000131_mph';
import {CommonService} from '../../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'app-risk-motor',
  templateUrl: './risk-motor.component.html',
  styleUrls: ['./risk-motor.component.css']
})
export class RiskMotorComponent implements OnInit {

  constructor(private caller : AuthService, private common : CommonService,
   private spinner : NgxSpinnerService, private checker : IsRequired, private router : Router) { }
  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutputt = new EventEmitter();

  director: Risk;
  stockholder: Risk;
  beneficiary: Risk;
  permanentAddressTitle: String = "Permanent Address";
  presentAddressTitle: String = "Present Address";
  pbAddressTitle: String = "Principal Business Address";
  tempAddresses: AddressDetails[] = [];

  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000060: P2000060[] = [];
  p2000025: P2000025[] = [];
  a1000131_MPH: A1000131_MPH[] = [];
  p2000031: P2000031 = new P2000031();
  p1001331: P1001331 = new P1001331();
  p1001331List: P1001331[] = [];

  addAddress: String = "";
  addAlternativeShow: String = "";
  addressTypeLov: any[] = [];

  alternativeHolder: Marsh[] = [];

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

    this.director = new Risk();
    this.stockholder = new Risk();
    this.beneficiary = new Risk();

    this.spinner.show();

    this.caller.getLOV('A1000100', '9', 'COD_PAIS~PHL').subscribe(
      result => {
        console.log(result);
        this.marsh.lov.provinceLOV = result;
    });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        console.log(result);
        this.marsh.lov.documentLOV = result;
        
    });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.marsh.lov.civilStatusLOV = result;
    });

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.marsh.lov.suffixLOV = result;
    });

    this.caller.getLOV("A1000101","1","").subscribe(
      result => {
        this.marsh.lov.nationalityLOV = result;
    });

    this.caller.getOptionList('EN', 'TIP_ETIQUETA', '999').subscribe(
      result => {

        result.splice(2, 1);
        this.addressTypeLov = result;
        this.marsh.lov.addressLOV = result;
        console.log(result);
        this.spinner.hide();
    });

  }

  addAlternativeHolderModal(){
    this.addAlternativeShow = "";

    this.common.sleep(10).then(() => {
      this.addAlternativeShow = "show";
    });

    
  }

  addAlternative(alternative : Marsh){
    console.log(alternative);
    this.alternativeHolder.push(alternative);
    console.log(this.alternativeHolder);
  }

  modalAction(action){
    $("#closeModal").trigger("click");
  }

  openAddress(){
    this.addAddress = "add";
  }

  removeAddressList(address){
    const index: number = this.tempAddresses.indexOf(address);

    if (index !== -1) {
      this.tempAddresses.splice(index, 1);
    }
    let temp = null;
    if(address.addressTypeId == "1"){
      temp = {"NOM_VALOR":"HOME","TIP_ETIQUETA":"1"};
    }else{
      temp = {"NOM_VALOR":"OFFICE","TIP_ETIQUETA":"2"};
    }

    this.marsh.lov.addressLOV.push(temp);
    console.log(this.marsh.lov.addressLOV);

  }

  setCorrespondent(corrAddress){
    this.marsh.riskDetails.mailingAddressId = corrAddress.addressTypeId;

    for(let i = 0; i < this.tempAddresses.length; i++){
      this.tempAddresses[i].mailingAddress = "0";
    }

    const index: number = this.tempAddresses.indexOf(corrAddress);
    this.tempAddresses[index].mailingAddress = "1";
  }

  catchAddress(permAddress){
    this.removeAddressType(permAddress.addressTypeId);
    this.addAddress = "";
    permAddress.mailingAddress = "0";
    if(this.tempAddresses.length == 0){
      permAddress.mailingAddress = "1";
    }

    this.tempAddresses.push(permAddress);
    if(permAddress.addressTypeId == "1"){
      this.marsh.riskDetails.homeAddress = permAddress;
      console.log(this.marsh);
      return null;
    }

    this.marsh.riskDetails.officeAddress = permAddress;
    console.log(this.marsh);

  }

  removeAddressType(addressTypeId){
    let index = 0;
    for(let i = 0; i < this.marsh.lov.addressLOV.length; i++){
      console.log(this.marsh.lov.addressLOV[i].TIP_ETIQUETA);
      console.log(addressTypeId);
      if(addressTypeId == this.marsh.lov.addressLOV[i].TIP_ETIQUETA){
        index = i;
        break;
      }
    }
    this.marsh.lov.addressLOV.splice(index, 1);
    
  }

  addCompanyDetail(type){
    switch (type) {
      case "director":
        this.marsh.motorDetails.directors.push(this.director);
        this.director = new Risk();
        break;
      case "stockholder":
        this.marsh.motorDetails.stockholders.push(this.stockholder);
        this.stockholder = new Risk();
        break;
      
      default:
        this.marsh.motorDetails.beneficiaries.push(this.beneficiary);
        this.beneficiary = new Risk();
        break;
    }
  }

  removeCompanyDetail(detail: Risk, type){
    switch (type) {
      case "director":
        let index1: number = this.marsh.motorDetails.directors.indexOf(detail);

        if (index1 !== -1) {
          this.marsh.motorDetails.directors.splice(index1, 1);
        }
        break;
      case "stockholder":
        let index2: number = this.marsh.motorDetails.stockholders.indexOf(detail);

        if (index2 !== -1) {
          this.marsh.motorDetails.stockholders.splice(index2, 1);
        }
        break;
      
      default:
        let index: number = this.marsh.motorDetails.beneficiaries.indexOf(detail);

        if (index !== -1) {
          this.marsh.motorDetails.beneficiaries.splice(index, 1);
        }
        break;
    }
  }

  reAssign(value,field){
    let originalValue = value;
    this.marsh.motorDetails[field] = originalValue.split("-")[0];
    this.marsh.motorDetails[field.slice(0, -1)] = originalValue.split("-")[1];
  } 

  nextStepAction(nextStep){

    if(this.checker.checkIfRequired('motor-policy-details') == "0"){
      return null;
    }

    if(this.tempAddresses.length < 1){
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "At least one address is required."
      });
      return null;
    }

    let option = "Over the Counter as your payment option, please make sure that your email is " + this.marsh.riskDetails.emailAddress;
    let imges = "";

    if(this.marsh.paymentOption == "cc"){
      option = "Credit Card as your payment option";
      imges = "<img class='logo-collection' src='assets/images/authProgram_SC.gif' /><img class='logo-collection' src='assets/images/authProgram_VBV.gif' />";
    }

    Swal.fire({
      title: 'Policy Issuance',
      html: "<p>You've selected "+option+", Proceed to Payment?</p>" + imges,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {

       if(!result.value){
        return null;
      }

      this.spinner.show();
      let motorFields = ["manufacturerId","modelId","vehicleTypeId","subModelId","vehicleUsedId","colorId","usageAreaId"];

      for(let i = 0; i < motorFields.length; i++){
        this.reAssign(this.marsh.motorDetails[motorFields[i] + "Holder"],motorFields[i]);
      }

      this.p2000030 = new P2000030();
      this.p2000020 = [];
      this.p2000040 = [];
      this.p2100610 = [];
      this.p2000060 = [];
      this.p2000025 = [];
      this.p2000031 = new P2000031();
      this.p1001331 = new P1001331();
      this.p1001331List = [];

      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.p1001331);

      if(this.alternativeHolder.length > 0){
        this.marsh.alternativeHolders = [];
        for(let i = 0; i < this.alternativeHolder.length; i++){
          let tempP1331 : P1001331 = new P1001331();
          tempP1331 = this.common.assignP1001331(this.alternativeHolder[i]);
          this.p1001331List.push(tempP1331);

          this.marsh.alternativeHolders.push(this.alternativeHolder[i].riskDetails);
        }
        
      }

      this.p2000025 = this.common.assignP2000025(this.marsh);
      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031 = this.common.assignP2000031(this.marsh,this.p2000030);
      this.p2000020 = this.common.assignP2000020(this.marsh);
      this.p2000040 = this.common.assignP2000040(this.marsh);
      this.p2000060 = this.common.assignP2000060(this.marsh, 'policy');
      this.p2100610 = this.common.assignP2100610(this.marsh);
      this.a1000131_MPH = this.common.assignA1000131_MPH(this.marsh);

      let param = {
        "fName": this.marsh.riskDetails.firstName,
        "mName": this.marsh.riskDetails.middleName,
        "lName": this.marsh.riskDetails.lastName,
        "codDoc": this.marsh.riskDetails.validIDValue,
        "tipDoc": this.marsh.riskDetails.validID,
        "province": this.marsh.riskDetails.correspondentAddress.provinceDetailId,
        "municipality": this.marsh.riskDetails.correspondentAddress.municipalityDetailId,
        "address1": this.marsh.riskDetails.correspondentAddress.addressDetails,
        "zipCode": this.marsh.riskDetails.correspondentAddress.zipCode,
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "make": this.marsh.motorDetails.manufacturerId,
        "model": this.marsh.motorDetails.modelId,
        "variant": this.marsh.motorDetails.vehicleTypeId,
        "mvNumber": this.marsh.motorDetails.MVFileNumber,
        "plateNumber": this.marsh.motorDetails.plateNumber,
        "engineNumber": this.marsh.motorDetails.motorNumber,
        "chassisNumber":  this.marsh.motorDetails.serialNumber,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.marsh.motorDetails.colorId,
        "year": this.marsh.motorDetails.modelYear,
        "subModel": this.marsh.motorDetails.subModelId,
        "typeOfUse": this.marsh.motorDetails.vehicleUsedId,
        "paymentOption": this.marsh.paymentOption,
        "tipCocafRegistration": "R",
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
        "codRamo": this.marsh.motorDetails.motorTypeId,
        "p2000030" : this.p2000030,
        "p2000031" : this.p2000031,
        "p1001331" : this.p1001331,
        "p1001331List" : this.p1001331List,
        "p2000020List" : this.p2000020,
        "p2000040List" : this.p2000040,
        "p2000060List" : this.p2000060,
        "p2100610List" : this.p2100610,
        "p2000025List" : this.p2000025,
        "a1000131_mphList" : this.a1000131_MPH
      };
      console.log(param);
      this.spinner.show();
      this.caller.doCallService('/marsh/issuePolicy',param).subscribe(
        result => {
          console.log(result);

          switch(result.status) {
            case 1:
              if(this.marsh.paymentOption == "cc"){
                window.open(result.message, "_self");
              }else{
                this.router.navigate(['issuance/51359e8b51c63b87d50cb1bab73380e2/'+ result.message2 ]);
                setTimeout(function(){
                  window.location.reload();
                },10);
              }
              break;
            case 2:
              this.marsh.policyNumber = result.message;

              this.marsh.techControl = result.message2.split("~");
              this.marsh = this.common.identifyTechControl(this.marsh);

              console.log(this.marsh);

              if(this.marsh.techControlLevel == "1"){
                window.open(result.message, "_self");
              }else{
                this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ result.message +'&type=P',null).subscribe(
                paymentBreakdown => {
                  this.marsh.premiumBreakdown = paymentBreakdown;
                  this.getCoverages(result.message, this.marsh, "techControl");
                });
                
              }



              if(this.marsh.motorDetails.vehiclePhotos.length > 0){

                let formData = this.common.assignFormDataUpload(this.marsh);
                formData.append('numPoliza',this.marsh.policyNumber);
                formData.append('fullName',this.marsh.riskDetails.firstName + " " + (this.marsh.riskDetails.firstName) ? this.marsh.riskDetails.firstName : "");
                this.caller.doCallService("/marsh/uploadFile", formData).subscribe(
                  resultado => {

                });

              }

                  
              break;
            default:
              Swal.fire({
                  type: 'error',
                  title: 'Policy Issuance',
                  text: result.message
                });
              this.spinner.hide();
              break;
          }

          
          
      });

    });

  	
  }

  getCoverages(numPoliza, marsh : Marsh, nextStep){
    this.common.getCoverageByPolicy("A",numPoliza,marsh.motorDetails.subline
    ).subscribe(
    (result) => {
        marsh.coveragesValue = [];
        let totalLossDamagePrem = 0;

        for(let c = 0; c < result.length; c++){
          if(result[c].codCob == "1003" || result[c].codCob == "1002"){
            totalLossDamagePrem = totalLossDamagePrem + parseFloat(result[c].totalPremium);
          }
        }

        for(let i = 0; i < result.length; i++){

          switch(result[i].codCob){
            case "1004":
              marsh.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
            break;
            case "1005":
              marsh.motorDetails.propertyDamageLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Property Damage".toUpperCase();
            break;
            case "1100":
              result[i].nomCob = "Loss or Damage".toUpperCase();
              result[i].totalPremium = totalLossDamagePrem.toString();
            break;

          }

          result[i].numSecu = parseInt(result[i].numSecu) + 0;
          // result[i].sumaAseg = this.formatter.format(parseFloat(result[i].sumaAseg));
          result[i].totalPremium = ((result[i].totalPremium != "0") ? this.formatter.format(parseFloat(result[i].totalPremium)) : "INCL");
          
          if(result[i].codCob != "1003" && result[i].codCob != "1002"){
            marsh.coveragesValue.push(result[i]);
          }

        }

        marsh.coveragesValue = _.orderBy(marsh.coveragesValue,'numSecu','asc');

      this.spinner.hide();
      this.nextStep.emit(nextStep);
      this.marshOutputt.emit(marsh);

    });
  }

  backButtonAction(){
    this.nextStep.emit("motorPolicyIssuance");
    this.marshOutputt.emit(this.marsh);
  }

}
