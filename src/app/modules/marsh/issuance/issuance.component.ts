import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router,ActivatedRoute} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {AuthService} from '../../../services/auth.service';
import {MarshCoverages} from '../../../objects/marsh-coverages';
import { NgxSpinnerService } from 'ngx-spinner';
import {CommonService} from '../../../services/common.service';
import {MotorIssuanceService} from '../../../services/motor-issuance.service';
import {PropertyIssuanceService} from '../../../services/property-issuance.service';
import {PersonalAccidentIssuanceService} from '../../../services/personal-accident-issuance.service';
import {MotorAccessories} from '../../../objects/motor-accessories';
import * as m from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-issuance',
  templateUrl: './issuance.component.html',
  styleUrls: ['./issuance.component.css']
})
export class IssuanceComponent implements OnInit {

  constructor(private caller : AuthService, 
    private route : ActivatedRoute,
    private router : Router,
    private spinner : NgxSpinnerService,
    private commonService : CommonService,
    private motorIssuance: MotorIssuanceService,
    private propertyIssuance: PropertyIssuanceService,
    private paIssuance : PersonalAccidentIssuanceService) { }

  templateRouter: String;
  line: String;
  backButton: String;
  marsh: Marsh;
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {

    // this.templateRouter = "riskInformation";
    this.marsh = new Marsh();
    // if (localStorage.getItem("userCardId") === null) {
    //   this.router.navigate(['login']);
    // }
    this.marsh.clientId = localStorage.getItem("userCardId");

    let numPoliza = this.route.snapshot.paramMap.get("numPoliza");
    let type = this.route.snapshot.paramMap.get("type");

    this.line = "";
    this.templateRouter = "initialize"; 

    // this.caller.doCallService('/marsh/retrieveTransactions',this.marsh.clientId).subscribe(
    //   result => {
    //     console.log(result);

    //     let newResult = _.orderBy(result, ['transactionNumber'],['desc']);
        
    //     this.marsh.previousIssuances = newResult;

    //     for(let i = 0; i < this.marsh.previousIssuances.length; i++){
    //     if(this.marsh.previousIssuances[i].policyNumber){

    //       for(let x = 0; x < this.marsh.previousIssuances[i].iDTO.a2000020List.length; x++){
    //         switch(this.marsh.previousIssuances[i].iDTO.a2000020List[x].codCampo){
    //           case "COD_MODALIDAD":
    //           this.marsh.previousIssuances[i].productId = this.marsh.previousIssuances[i].iDTO.a2000020List[x].valCampo;
    //           break;
    //           default:
    //           break;
    //         }
    //       }
   
    //     }else{

    //       for(let x = 0; x < this.marsh.previousIssuances[i].iDTO.p2000020List.length; x++){
    //         switch(this.marsh.previousIssuances[i].iDTO.p2000020List[x].codCampo){
    //           case "COD_MODALIDAD":
    //           this.marsh.previousIssuances[i].productId = this.marsh.previousIssuances[i].iDTO.p2000020List[x].valCampo;
    //           break;
    //           default:
    //           break;
    //       }

    //     }
        
    //   }

      
    //   }  
    //   console.log(this.marsh.previousIssuances);
    // });
 
    if(numPoliza){

      switch(type) {
        case "988fd738de9c6d177440c5dcf69e73ce":

          this.router.navigate([], {
            queryParams: {
              numPoliza: numPoliza,
              clientId: this.marsh.clientId
            },
            queryParamsHandling: 'merge',
          });

          this.processPayment(numPoliza);
          break;
        case "51359e8b51c63b87d50cb1bab73380e2":
          this.returnPayment(numPoliza, "policy");
          break;
        case "c453a4b8e8d98e82f35b67f433e3b4da":
          this.returnPayment(numPoliza,"payment");
          break;
        default:
          this.retrieveQuote(numPoliza,type);
          break;
      }
      
    }


  }

  processPayment(numPoliza){
    console.log('start');
    this.route.queryParams.subscribe(params => {
      console.log('1');
      if(!params.clientId){
        return null;
      }
      
      if (params.vpc_Message == null) {
        //for OTC transaction
        console.log('4');
      } else if (params.vpc_Message != 'Approved') {
        window.location.href = params.AgainLink + "?s=f";
      } else {
        console.log('10');            
        if (params != null) {
          console.log('11');            
          console.log(params);
          this.marsh.paymentConfirmed = params.vpc_Message;
          this.validateGlobalPay(JSON.stringify(params),numPoliza);
          
        }
      }

    });
  }

  validateGlobalPay(params,numPoliza){
    this.caller.doCallService('/marsh/validateGlobalPay',params).subscribe(
      result => {
        this.returnPayment(numPoliza, "policy");
        console.log(result);

    });
  }

  returnPayment(numPoliza, action){
    this.spinner.show();
      this.caller.doCallService('/marsh/retrievePolicyDetails',numPoliza).subscribe(
        result => {
          console.log(result);

          switch(result.p2000030.codRamo){
              case 251:

              this.propertyIssuance.mapRetrievePolicy(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta; 
                this.retrivePolicyNavigate(result,action);
                console.log("hey");
                console.log(this.marsh);
              });

              break;
              case 337:

              this.paIssuance.mapRetrievePolicy(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta; 
                this.retrivePolicyNavigate(result,action);
                console.log("hey");
                console.log(this.marsh);
              });

              break;
              default:

              this.motorIssuance.mapRetrievePolicy(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta; 
                this.retrivePolicyNavigate(result,action);
                console.log("hey");
                console.log(this.marsh);
              });

              break;
          }

      });
  }

  retrivePolicyNavigate(result,action){
    if(this.marsh.premiumBreakdown){

      this.templateRouter = action;

      if(result.p2000030.mcaProvisional == "S"){

        this.marsh.techControl = result.techControlMessage.split("~");
        this.marsh = this.commonService.identifyTechControl(this.marsh);

        console.log(this.marsh);

        this.templateRouter = "techControl";
      }else if(result.a2990700_mph.mcaCollectMivo == null){
        this.marsh.paymentReferenceNumber = result.a2990700_mph.numPaymentReference;
        this.templateRouter = "payment";
      }

      this.line = "motorQuotationIssuance";
      this.spinner.hide();
    }
    
  }

  retrieveQuote(numPoliza,type){
      this.spinner.show();
      this.caller.doCallService('/marsh/retrieveQuotationDetails',numPoliza).subscribe(
        result => {
          console.log(result);
          

          switch(result.p2000030.codRamo){
              case 251:

              this.propertyIssuance.mapRetrieveQuote(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta;
                this.retrieveQuoteNavigate(result,'householdQuotationIssuance');
                console.log("hey");
                console.log(this.marsh);
              });

              // this.marsh = this.motorIssuance.mapRetrieveQuote(this.marsh, result);
              break;
              case 337:

              this.paIssuance.mapRetrieveQuote(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta; 
                this.retrieveQuoteNavigate(result,'personalInformation');
                console.log("hey");
                console.log(this.marsh);
              });

              break;
              default:

              this.motorIssuance.mapRetrieveQuote(this.marsh, result).subscribe( 
              (resulta) => {
                this.marsh = resulta;
                this.retrieveQuoteNavigate(result,'motorQuotationIssuance');
                console.log("hey");
                console.log(this.marsh);
              });
              
              break;
          }

          

      });

  }

  retrieveQuoteNavigate(result,route){
    
    if(this.marsh.premiumBreakdown){
      this.assignP2161ToAccessory(result.p2100610List);
      this.templateRouter = "issueQuotation";
      if(result.p2000030.mcaProvisional == "S"){

        this.marsh.techControl = result.techControlMessage.split("~");
        this.marsh = this.commonService.identifyTechControl(this.marsh);

        console.log(this.marsh);

        this.templateRouter = "techControl";
      }
      this.line = route;
      this.spinner.hide();
    }
      

  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  assignP2161ToAccessory(p21006100){
    console.log(p21006100);
    for(let i = 0; i < p21006100.length; i++){
      let temp : MotorAccessories = new MotorAccessories();

      temp.accessoryId = p21006100[i]['codAccesorio'];
      temp.accessoryName = p21006100[i]['nomAccesorio'];
      temp.accessoryValue = p21006100[i]['impAccesorio'];
      temp.accessoryDescription = p21006100[i]['txtAccesorio'];

      // this.marsh.motorDetails.FMV = (parseInt(this.marsh.motorDetails.FMV) + parseInt(p21006100[i]['impAccesorio'])).toString();

      this.marsh.motorDetails.accessories.push(temp);
      
    }

  }

  backButtonAction(backButton){
    this.backButton = backButton;
  }

  nextStepAction(nextStep){
  	this.templateRouter = nextStep;
    this.scrollToTop();
  }

  nextStepActionQuoteIssuance(nextStep){
    this.line = nextStep;
    

    let type = "household";
    this.marsh.productId = "20008";
    this.marsh.lineId = "251";

    if(this.line == "personalInformation"){
      type = "personalAccident";
      this.marsh.productId = "33701";
      this.marsh.lineId = "337";
    }

    console.log(type);

    this.caller.doCallService("/marsh/coverage/getCoverageDescriptions", type).subscribe(
      result => {
        this.coverageList = [];
        let coverageHolder = result;
        for(let c in coverageHolder){
          for(let d in coverageHolder[c]){
            this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
            this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
          }
          this.coverageList.push(this.coverage);
          this.coverage = new MarshCoverages();
        }

        this.marsh.coverages = this.coverageList;
    });

    this.templateRouter = nextStep;
    this.scrollToTop();
    
  }

  marshOutput(marshOutput){
    this.marsh = marshOutput;
  }

  scrollToTop(){
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 100); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
  } 

  // getLabel(id, anyList, cod, nom){
  //   let holder = "";
  //   for(let i = 0; i < anyList.length; i++){
  //     if(id == anyList[i][cod]){
  //       holder = anyList[i][nom];
  //       break;
  //     }
  //   }

  //   return holder;
  // }

  // loadAllLOV(motorTypeId, manufacturerId, modelId, vehicleTypeId,modelYear,subModelId,colorId,vehicleUsedId,p2100610List){

  //   this.commonService.chooseType(
  //     motorTypeId
  //   ).subscribe(
  //   (result) => {
  //     this.marsh.lov.makeLOV = result;
  //     this.marsh.motorDetails.manufacturer = this.getLabel(manufacturerId,result,'COD_MARCA','NOM_MARCA');
  //     this.marsh.motorDetails.manufacturerIdHolder = manufacturerId + '-' + this.marsh.motorDetails.manufacturer;
  //   });

  //   this.commonService.chooseMake(
  //     motorTypeId,
  //     manufacturerId
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.modelLOV = result;
  //     this.marsh.motorDetails.model = this.getLabel(modelId,result,'COD_MODELO','NOM_MODELO');
  //     this.marsh.motorDetails.modelIdHolder = modelId + '-' + this.marsh.motorDetails.model;
  //   });

  //   this.commonService.chooseModel(
  //     manufacturerId,
  //     modelId
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.variantLOV = result;
  //     this.marsh.motorDetails.vehicleType = this.getLabel(vehicleTypeId,result,'COD_TIP_VEHI','NOM_TIP_VEHI');
  //     this.marsh.motorDetails.vehicleTypeIdHolder = vehicleTypeId + '-' + this.marsh.motorDetails.vehicleType;
  //   });

  //   this.commonService.chooseVariant(
  //     manufacturerId,
  //     modelId,
  //     vehicleTypeId
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.yearList = result;
  //   });

  //   this.marsh.motorDetails.subline = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
  //   this.marsh.motorDetails.validityDate = this.commonService.selectSubline(vehicleTypeId).split("-")[0];

  //   this.commonService.loadAccessories(
  //     vehicleTypeId,
  //     this.marsh.motorDetails.validityDate
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.accessoryLOV = result
  //   });   

  //   this.commonService.chooseModelYear(
  //     manufacturerId,
  //     modelId,
  //     vehicleTypeId,
  //     modelYear
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.subModelLOV = result;
  //     this.marsh.motorDetails.subModel = this.getLabel(subModelId,result,'COD_SUB_MODELO','NOM_SUB_MODELO');
  //     this.marsh.motorDetails.subModelIdHolder = subModelId + '-' + this.marsh.motorDetails.subModel;
  //   });   

  //   this.commonService.chooseSubModel(
  //     motorTypeId,
  //     manufacturerId,
  //     modelId,
  //     vehicleTypeId,
  //     modelYear
  //   ).subscribe( 
  //   (result) => {
  //     this.marsh.lov.typeOfUseLOV = result;
  //     this.marsh.motorDetails.vehicleUsed = this.getLabel(vehicleUsedId,result,'COD_USO_VEHI','NOM_USO_VEHI');
  //     this.marsh.motorDetails.vehicleUsedIdHolder = vehicleUsedId + '-' + this.marsh.motorDetails.vehicleUsed;
  //   });    

  //   this.commonService.loadFMV(
  //     manufacturerId,
  //     modelId,
  //     subModelId,
  //     modelYear
  //   ).subscribe( 
  //   (resultFMV) => { 
  //     this.marsh.motorDetails.FMV = resultFMV;
  //   });

  //   this.caller.getLOV("A2100800","1",'').subscribe(
  //     result => {
  //       this.marsh.lov.colorLOV = result;
  //       this.marsh.motorDetails.color = this.getLabel(colorId,result,'COD_COLOR','NOM_COLOR');
  //       this.marsh.motorDetails.colorIdHolder = colorId + '-' + this.marsh.motorDetails.color;
  //   });


  // }

}
