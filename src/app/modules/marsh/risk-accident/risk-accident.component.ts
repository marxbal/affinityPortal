import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {Risk} from '../../../objects/risk';
import {AuthService} from '../../../services/auth.service';
import {AddressDetails} from '../../../objects/address-details';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
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
import * as m from 'moment';
import {IsRequired} from '../../../guard/is-required';
import * as _ from 'lodash';

@Component({
  selector: 'app-risk-accident',
  templateUrl: './risk-accident.component.html',
  styleUrls: ['./risk-accident.component.css']
})
export class RiskAccidentComponent implements OnInit {

  constructor(private router : Router, private caller : AuthService, private spinner : NgxSpinnerService, private common : CommonService, private checker : IsRequired) { }

  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutputt = new EventEmitter();

  familyMember: Risk = new Risk();
  presentAddressTitle: String = "Present Address";
  tempAddresses: AddressDetails[] = [];

  addFamily: String = "";
  loadType : string = "";
  showAddButton: String = "1";
  addAddress: String = "";
  addAlternativeShow: String = "";
  addressTypeLov: any[] = [];

  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000060: P2000060[] = [];
  p2000025: P2000025[] = [];
  p2000031List: P2000031[] = [];
  a1000131_MPH: A1000131_MPH[] = [];
  p2000031: P2000031 = new P2000031();
  p1001331: P1001331 = new P1001331();
  p1001331List: P1001331[] = [];

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

    this.caller.getOptionList('EN', 'TIP_ETIQUETA', '999').subscribe(
      result => {

        result.splice(2, 1);
        this.addressTypeLov = result;
        this.marsh.lov.addressLOV = result;
        console.log(result);
        this.spinner.hide();
    });

     this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.marsh.lov.suffixLOV = result;
    });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        this.marsh.lov.documentLOV = result;

        if(this.marsh.riskDetails.validID == "DRI" && this.marsh.riskDetails.validIDValue.includes("FOPM-")){
          this.marsh.riskDetails.validID = "";
          this.marsh.riskDetails.validIDValue = "";

          if(this.iOS()){
            this.marsh.riskDetails.validID = this.marsh.lov.documentLOV[0].TIP_DOCUM;
          }
          
        }

    }); 

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.marsh.lov.civilStatusLOV = result;
    });

    this.caller.getLOV("A1000101","1","").subscribe(
      result => {
        this.marsh.lov.nationalityLOV = result;
        this.spinner.hide();
    });

    this.caller.getLOV("G2990006","1","COD_CIA~1|COD_RAMO~337|COD_MODALIDAD~99999|COD_CAMPO~COD_OCCUPATIONAL_CLASS|FEC_VALIDEZ~01012020").subscribe(
      result => {
        console.log(result);
        this.marsh.lov.occupationalClassLOV = result;
        this.marsh.lov.occupationalClassLOV.splice(this.marsh.lov.occupationalClassLOV.length - 1, 1);
    });

    

    let childCount = 0;
    let haveSpouse = "0";
    for(let x = 0; x < this.marsh.paDetails.familyMembers.length; x++){
      if(this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "S"){
        haveSpouse = "1";
      }else if(this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "C"){
        childCount = childCount + 1;
      }
    }
    if(this.marsh.riskDetails.civilStatus != "C"){
      haveSpouse = "1";
    }
    if(haveSpouse == "1" && childCount == 3){
      this.showAddButton = "0";
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

  chooseEffectivityDate(){
    this.spinner.show();
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
    
    let isRetro = m().isAfter(this.marsh.motorDetails.policyPeriodFrom, 'day');

    this.spinner.hide(); 
    if(!isRetro){
      return null;
    }

    // $("#vehiclePhotosContainer").removeClass("hidden");

    Swal.fire({
      type: 'warning',
      title: 'Quotation Issuance',
      text: "Policy Inception should not be prior date today.  Transaction shall be subject to the acceptance of MAPFRE Insurance prior issuance of policy."
    });

    this.marsh.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
    
  }

  chooseOccupationalClass(){
    this.caller.getLOV("G2990006","13","COD_CIA~1|COD_RAMO~337|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012020|DVCOD_OCCUPATIONAL_CLASS~"+this.marsh.riskDetails.occupationalClass.split(':=:')[0]+"|COD_IDIOMA~EN").subscribe(
      result => {
        console.log(result);
        this.marsh.lov.occupationLOV = result;
    });
  }

  chooseBirthday(){

    let ret = true;

    if(this.marsh.lineId =="337"){

      // let currentYearDiff = (m().year() - parseInt(this.marsh.riskDetails.birthDate));
      let currentYearDiff = (m(new Date(this.marsh.motorDetails.policyPeriodFrom)).diff(new Date(this.marsh.riskDetails.birthDate), 'months', true)) / 12;

      if(currentYearDiff < 18 || currentYearDiff > 70){
        Swal.fire({
          type: 'error',
          title: 'Quotation Issuance',
          text: "Age of Principal Insured must be between Eighteen (18) and Seventy (70) Years Old."
        });

        ret = false;

      }

    }

    return ret;

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

  openModalFamilyMember(){
    this.familyMember = new Risk();
    this.addFamily = "";
    this.loadType = "";
    this.common.sleep(10).then(() => {
      this.addFamily = "add";
    });
  }

  editFamilyMember(member){
    this.familyMember = member;
    this.addFamily = "";
    this.loadType = "edit";
    this.common.sleep(10).then(() => {
      this.addFamily = "add";
    });
  }

  addFamilyMember(familyMember){

    if(familyMember.isBack){
      $("#closeModal").click();
      return null;
    }

    if(this.loadType == "edit"){
      this.removeFamilyMember(this.familyMember);
    }

    familyMember.fullName = familyMember.lastName + ", " + familyMember.firstName + " " + (familyMember.middleName ? familyMember.middleName : "");
    this.marsh.paDetails.familyMembers.push(familyMember);
    console.log(this.marsh);

    let childCount = 0;
    let haveSpouse = "0";
    for(let x = 0; x < this.marsh.paDetails.familyMembers.length; x++){
      if(this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "S"){
        haveSpouse = "1";
      }else if(this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "C"){
        childCount = childCount + 1;
      }
    }
    if(haveSpouse == "1" && childCount == 3){
      this.showAddButton = "0";
    }

    $("#closeModal").click();
  }

  removeFamilyMember(familyMember: Risk){

    let index1: number = this.marsh.paDetails.familyMembers.indexOf(familyMember);

    if (index1 !== -1) {
      this.marsh.paDetails.familyMembers.splice(index1, 1);
    }

    this.showAddButton = "1";

  }
 
  nextStepAction(nextStep){

    if(this.checker.checkIfRequired('pa-personal') == "0"){
      return null;
    }

    if(!this.chooseBirthday()){
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

    if(!this.marsh.riskDetails.underTaking){
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: 'In order to proceed, please agree to the Declaration of Good Health.'
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

      this.p2000030 = new P2000030();
      this.p2000020 = [];
      this.p2000040 = [];
      this.p2100610 = [];
      this.p2000060 = [];
      this.p2000025 = [];
      this.p2000031List = [];
      this.p2000031 = new P2000031();
      this.p1001331 = new P1001331();
      this.p1001331List = [];

      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.p1001331);

      this.p2000025 = this.common.assignP2000025(this.marsh);
      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031List = this.common.assignP2000031PA(this.marsh,this.p2000030);
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
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "chassisNumber":  this.marsh.motorDetails.serialNumber,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
        "codRamo": this.marsh.lineId,
        "paymentOption": this.marsh.paymentOption,
        "p2000030" : this.p2000030,
        "p2000031" : this.p2000031,
        "p1001331" : this.p1001331,
        "p1001331List" : this.p1001331List,
        "p2000020List" : this.p2000020,
        "p2000040List" : this.p2000040,
        "p2000031List" : this.p2000031List,
        "p2000060List" : this.p2000060,
        "p2100610List" : this.p2100610,
        "p2000025List" : this.p2000025,
        "a1000131_mphList" : this.a1000131_MPH
      };
      console.log(param);
      this.spinner.show();
      this.caller.doCallService('afnty/issuePolicy',param).subscribe(
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
                this.caller.doCallService('afnty/getPaymentBreakdown?numPoliza='+ result.message +'&type=P',null).subscribe(
                paymentBreakdown => {
                  this.marsh.premiumBreakdown = paymentBreakdown;
                  this.getCoverages(result.message, this.marsh, "techControl");
                });
                
              }



              if(this.marsh.motorDetails.vehiclePhotos.length > 0){

                let formData = this.common.assignFormDataUpload(this.marsh);
                formData.append('numPoliza',this.marsh.policyNumber);
                formData.append('fullName',this.marsh.riskDetails.firstName + " " + (this.marsh.riskDetails.firstName) ? this.marsh.riskDetails.firstName : "");
                this.caller.doCallService("afnty/uploadFile", formData).subscribe(
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

  	// this.nextStep.emit(nextStep);
   //  this.marshOutputt.emit(this.marsh);
  }

  getCoverages(numPoliza, marsh : Marsh, nextStep){
    this.common.getCoverageByPolicy("A",numPoliza,marsh.lineId
    ).subscribe(
    (resulta) => {

      this.mapP2025Insured(this.p2000025,resulta);

      for(let i = 0; i < resulta.length; i++){

        if(resulta[i].numRiesgo == "1"){
          // resulta[i].sumaAseg = this.formatter.format(parseFloat(resulta[i].sumaAseg));
          resulta[i].numSecu = parseInt(resulta[i].numSecu) + 0;
          resulta[i].totalPremium = ((resulta[i].totalPremium) ? this.formatter.format(parseFloat(resulta[i].totalPremium)) : "INCL");
          marsh.coveragesValue.push(resulta[i]);
        }
        
      }

      marsh.coveragesValue = _.orderBy(marsh.coveragesValue,'numSecu','asc');
       
      this.spinner.hide();
      this.nextStep.emit(nextStep);
      this.marshOutputt.emit(marsh);

    });
  }

  mapP2025Insured(p2025,p2040){
    this.marsh.paDetails.familyMembers = [];
    for(let x = 1; x < (_.maxBy(p2025,'numRiesgo')).numRiesgo; x++){

      let riskTemp : Risk = new Risk();

      for(let i = 0; i < p2025.length; i++){

        if(p2025[i].numRiesgo == (x + 1)){
          switch(p2025[i].codCampo){
            case "COD_OCCUPATIONAL_CLASS":
              riskTemp.occupationalClass = "";
              if(p2025[i].valCampo){
                riskTemp.occupationalClass = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
              }
            break;
            case "TXT_OCCUPATION":
              riskTemp.occupation = "";
              if(p2025[i].valCampo){
                riskTemp.occupation = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
              }
            break;
            case "TXT_HEALTH_DECLARA":
              let healthDec = true;
              if(p2025[i].valCampo == "N"){
                healthDec = false;
              }
              riskTemp.healthDeclaration = healthDec;
            break;
            case "TXT_FIRST_NAME":
              riskTemp.firstName = p2025[i].valCampo;
            break;
            case "TXT_LAST_NAME":
              riskTemp.lastName = p2025[i].valCampo;
            break;
            case "TXT_MIDDLE_INITIAL":
              riskTemp.middleName = p2025[i].valCampo;
            break;
            case "BIRTHDATE":
              riskTemp.birthDate = p2025[i].valCampo;
            break;
            case "NOM_RELIGION":
              riskTemp.religion = p2025[i].valCampo;
            break;
            case "MCA_SEXO_ASEG":
              let sex = "1";
              if(p2025[i].valCampo == "F"){
                sex = "0";
              }
              riskTemp.gender = sex;
            break;
            case "RELATIONSHIP":
              riskTemp.relationship = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
            break;
          }

        }

      }

      for(let c = 0; c < p2040.length; c++){
        if(p2040[c].numRiesgo == (x + 1)){
          // p2040[c].sumaAseg = this.formatter.format(parseFloat(p2040[c].sumaAseg));
          // p2040[c].totalPremium = this.formatter.format(parseFloat((p2040[c].totalPremium) ? p2040[c].totalPremium : "0"));
          p2040[c].totalPremium = "INCL";
          riskTemp.coveragesValue.push(p2040[c]);
        }
      }

      riskTemp.coveragesValue = _.orderBy(riskTemp.coveragesValue,'codCob','desc');

      riskTemp.fullName = riskTemp.lastName + ", " + riskTemp.firstName + " " + (riskTemp.middleName ? riskTemp.middleName : "");

      this.marsh.paDetails.familyMembers.push(riskTemp);

    }

  }

  // backButtonAction(){
  //   this.nextStep.emit("initialize");
  //   this.marshOutputt.emit(this.marsh);
  // }

}
