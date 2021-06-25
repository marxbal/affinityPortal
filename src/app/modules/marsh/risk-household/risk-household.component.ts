import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
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
import {A2000260} from '../../../objects/a2000260';
import {Property} from '../../../objects/property';
import {A1000131_MPH} from '../../../objects/a1000131_mph';
import {CommonService} from '../../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'app-risk-household',
  templateUrl: './risk-household.component.html',
  styleUrls: ['./risk-household.component.css']
})
export class RiskHouseholdComponent implements OnInit {

  constructor(private caller : AuthService, private common : CommonService,
   private spinner : NgxSpinnerService, private checker : IsRequired,
   private router : Router) { }

  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutputt = new EventEmitter();

  billingAddressTitle: String = "Billing Address";
  mailingAddressTitle: String = "Mailing Address";

  tempAddresses: AddressDetails[] = [];

  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000060: P2000060[] = [];
  p2000025: P2000025[] = [];
  a2000260: A2000260[] = [];
  a1000131_MPH: A1000131_MPH[] = [];
  p2000031: P2000031 = new P2000031();
  p1001331: P1001331 = new P1001331();
  p1001331List: P1001331[] = [];

  isRetroactive: String = "0";
  addAddress: String = "";
  addAlternativeShow: String = "";
  maxDate: String =  m().add(2 , 'month').format('YYYY-MM-DD');
  addressTypeLov: any[] = [];

  alternativeHolder: Marsh[] = [];

  tempWOA: Property = new Property();
  minRetro : String = m().subtract(6 , 'month').format('YYYY-MM-DD');

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

    console.log(this.marsh.motorDetails.isCorporate);

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        console.log(result);
        this.marsh.lov.documentLOV = result;
        
    });

    this.caller.doCallService('/marsh/getMortgagees',null).subscribe(
      result => {
        this.marsh.lov.mortgageeLOV = result;
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

    if(this.marsh.riskDetails.validID == "DRI" && this.marsh.riskDetails.validIDValue.includes("FOPM-")){
      this.marsh.riskDetails.validID = "";
      this.marsh.riskDetails.validIDValue = "";
    }

  }

  addWorkOfArt(){
    if(this.checker.checkIfRequired('property-woa') == "0"){
      return null;
    }

    this.tempWOA.workOfArtsValues = this.tempWOA.workOfArtsValues.toUpperCase();
    this.tempWOA.workOfArtsAmount = this.formatter.format(parseFloat(this.tempWOA.workOfArtsAmount));

    this.marsh.propertyDetails.workOfArtsList.push(this.tempWOA);

    this.tempWOA = new Property();

  }

  addAlternativeHolderModal(){
    this.addAlternativeShow = "";

    this.common.sleep(10).then(() => {
      this.addAlternativeShow = "show";
    });

    
  }

  chooseEffectivityDate(){
    this.spinner.show();
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
    this.spinner.hide(); 

    let isRetro = m().isAfter(this.marsh.motorDetails.policyPeriodFrom, 'day');
    let isMorethanTwo = m(this.marsh.motorDetails.policyPeriodFrom).isAfter(m().add(2 , 'month'));
    let isBelowSix = m(this.marsh.motorDetails.policyPeriodFrom).isBefore(m().subtract(6 , 'month'));

    this.isRetroactive = "0";

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

    if(isRetro){
      this.isRetroactive = "1";
      return null;
    }

    if(isMorethanTwo){
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Effectivity date should not be more than Two (2) months from current date."
      });
      this.marsh.motorDetails.policyPeriodFrom = m().add(2 , 'month').format('YYYY-MM-DD');
      this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1 , 'year').format('YYYY-MM-DD');
      return null;
    }
    
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

  removeWorkOfArt(woa){
    const index: number = this.marsh.propertyDetails.workOfArtsList.indexOf(woa);

    if (index !== -1) {
      this.marsh.propertyDetails.workOfArtsList.splice(index, 1);
    }
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
 
  nextStepAction(nextStep){

    if(this.checker.checkIfRequired('property-issuance') == "0"){
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
    if(this.isRetroactive == "1"){
      if(!this.marsh.riskDetails.underTaking){
        Swal.fire({
          type: 'error',
          title: 'Policy Issuance',
          text: 'In order to proceed, please agree to the Declaration of No Known Loss.'
        });
        return null;
      }
    }

    // if(this.marsh.propertyDetails.workOfArtsAmount){
    //   if(this.marsh.propertyDetails.workOfArtsList.length < 1){
    //     Swal.fire({
    //       type: 'error',
    //       title: 'Policy Issuance',
    //       text: "At least one Work of Art must be declared."
    //     });
    //     return null;
    //   }
    // }

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

      if(this.marsh.motorDetails.isMortgaged){
        this.marsh.motorDetails.mortgageeId = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[0];
        this.marsh.motorDetails.mortgagee = this.marsh.motorDetails.mortgageeIdHolder.split(":=:")[1];
      }

      this.spinner.show();

      this.p2000030 = new P2000030();
      this.p2000020 = [];
      this.p2000040 = [];
      this.p2100610 = [];
      this.p2000060 = [];
      this.p2000025 = [];
      this.a2000260 = [];
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

      this.a2000260 = this.common.assignA2000260(this.marsh);
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
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "unitProject": this.marsh.propertyDetails.unitProject,
        "paymentOption": this.marsh.paymentOption,
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
        "codRamo": this.marsh.lineId,
        "p2000030" : this.p2000030,
        "p2000031" : this.p2000031,
        "p1001331" : this.p1001331,
        "a2000260List" : this.a2000260,
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
      let total7105 = 0;
      let total7373 = 0;
      let total7386 = 0;

      for(let i = 0; i < result.length; i++){


        switch(result[i].codCobRelacionada){
          case "7105":
            total7105 = total7105 + parseFloat((result[i].totalPremium ? result[i].totalPremium : 0));
          break;
          case "7373":
            total7373 = total7373 + parseFloat((result[i].totalPremium ? result[i].totalPremium : 0));
          break;
          case "7386":
            total7386 = total7386 + parseFloat((result[i].totalPremium ? result[i].totalPremium : 0));
          break;
        }

      }

      for(let i = 0; i < result.length; i++){

        switch(result[i].codCob){
          case "7105":
            marsh.propertyDetails.workOfArtsAmount = result[i].sumaAseg;
            result[i].totalPremium = total7105;
            result[i].nomCob = "WORKS OF ART";
            marsh.coveragesValue.push(result[i]);
          break;
          case "7373":
            marsh.propertyDetails.EVImprovements = result[i].sumaAseg;
            result[i].totalPremium = total7373;
            marsh.coveragesValue.push(result[i]);
          break;
          case "7386":
            marsh.propertyDetails.EVFurnishing = result[i].sumaAseg;
            result[i].totalPremium = total7386;
            marsh.coveragesValue.push(result[i]);
          break;
        }
        result[i].numSecu = parseInt(result[i].numSecu) + 0;
        result[i].totalPremium = ((result[i].totalPremium == "") ? "FREE" :  this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

      }

      marsh.coveragesValue = _.orderBy(marsh.coveragesValue,'numSecu','asc');
       
      this.spinner.hide();
      this.nextStep.emit(nextStep);
      this.marshOutputt.emit(marsh);

    });
  }

  backButtonAction(){
    this.nextStep.emit("initialize");
    this.marshOutputt.emit(this.marsh);
  }

}
