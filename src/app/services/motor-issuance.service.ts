import { Injectable } from '@angular/core';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../services/auth.service';
import {CommonService} from '../services/common.service';
import {Marsh} from '../objects/marsh';
import {MarshCoverages} from '../objects/marsh-coverages';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MotorIssuanceService {

  constructor(private caller : AuthService,
    private spinner : NgxSpinnerService,
    private commonService : CommonService) { }

  motorMarsh: Marsh = new Marsh();
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(marsh: Marsh, result){
  	this.motorMarsh = new Marsh();

  	this.motorMarsh = marsh;

  	this.motorMarsh.quotationNumber = result.p2000030.numPoliza;

	this.motorMarsh.riskDetails.firstName= result.fName;
	this.motorMarsh.riskDetails.middleName= result.mName;
	this.motorMarsh.riskDetails.lastName= result.lName;

	this.motorMarsh.riskDetails.fullName = this.motorMarsh.riskDetails.lastName + ", " + this.motorMarsh.riskDetails.firstName + " " + this.motorMarsh.riskDetails.middleName;

	this.motorMarsh.riskDetails.validIDValue= result.codDoc;
	this.motorMarsh.riskDetails.validID= result.tipDoc;
	this.motorMarsh.riskDetails.phoneNumber= result.mobileNumber;
	this.motorMarsh.riskDetails.emailAddress= result.email;
	this.motorMarsh.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.motorMarsh.riskDetails.suffix= result.suffix;
	this.motorMarsh.motorDetails.manufacturerId= result.make;
	this.motorMarsh.motorDetails.modelId= result.model;
	this.motorMarsh.motorDetails.vehicleTypeId= result.variant;
	this.motorMarsh.motorDetails.MVFileNumber= result.mvNumber;
	this.motorMarsh.motorDetails.plateNumber= result.plateNumber;
	this.motorMarsh.motorDetails.motorNumber= result.engineNumber;
	this.motorMarsh.motorDetails.serialNumber= result.chassisNumber;
	this.motorMarsh.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.motorMarsh.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.motorMarsh.motorDetails.colorId= result.color;
	this.motorMarsh.motorDetails.modelYear= result.year;
	this.motorMarsh.motorDetails.subModelId= result.subModel;
	this.motorMarsh.motorDetails.vehicleUsedId= result.typeOfUse;
	this.motorMarsh.motorDetails.motorTypeId= result.p2000030.codRamo;
	this.motorMarsh.riskDetails.gender= result.p1001331.mcaSexo;
	this.motorMarsh.riskDetails.nationality= result.p1001331.codPais;
	this.motorMarsh.riskDetails.civilStatus= result.p1001331.codEstCivil;
	this.motorMarsh.lineId= result.p2000030.codRamo;

	this.motorMarsh.productId= this.commonService.getP20Value(result.p2000020List,'COD_MODALIDAD');
	this.motorMarsh.motorDetails.conductionNumber= this.commonService.getP20Value(result.p2000020List,'NUM_CONDUCTION');
  this.motorMarsh.motorDetails.usageAreaId= this.commonService.getP20Value(result.p2000020List,'COD_AREA_USAGE');
	this.motorMarsh.motorDetails.usageArea= this.determineCodAreaUsage(this.motorMarsh.motorDetails.usageAreaId);
	this.motorMarsh.motorDetails.usageAreaIdHolder= this.motorMarsh.motorDetails.usageAreaId + '-' + this.motorMarsh.motorDetails.usageArea;
	this.motorMarsh.motorDetails.FMV = '0';

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.motorMarsh.motorDetails.isCorporate = fisico;

	let type = "motorComprehensive";

	if(this.motorMarsh.productId == "10002"){
	type = "motorCTPL";
	}

	this.commonService.getCoverageByPolicy("P",this.motorMarsh.quotationNumber,this.motorMarsh.motorDetails.motorTypeId
      ).subscribe(
      (result) => {
        // this.motorMarsh.coveragesValue = result;
        // console.log(this.motorMarsh.coveragesValue);

        let totalLossDamagePrem = 0;

        for(let c = 0; c < result.length; c++){
          if(result[c].codCob == "1003" || result[c].codCob == "1002"){
            totalLossDamagePrem = totalLossDamagePrem + parseFloat(result[c].totalPremium);
          }
        }

        for(let i = 0; i < result.length; i++){

          switch(result[i].codCob){
            case "1004":
              this.motorMarsh.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
            break;
            case "1005":
              this.motorMarsh.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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
            this.motorMarsh.coveragesValue.push(result[i]);
          }

        }

        this.motorMarsh.coveragesValue = _.orderBy(this.motorMarsh.coveragesValue,'numSecu','asc');

      });

      this.caller.doCallService("afnty/coverage/getCoverageDescriptions", type).subscribe(
        coverages => {
          this.coverageList = [];
          let coverageHolder = coverages;
          for(let c in coverageHolder){
            for(let d in coverageHolder[c]){
              this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
              this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
            }
            this.coverageList.push(this.coverage);
            this.coverage = new MarshCoverages();
          }

          this.motorMarsh.coverages = this.coverageList;
      });

      this.loadAllLOV(
        this.motorMarsh.motorDetails.motorTypeId,
        this.motorMarsh.motorDetails.manufacturerId,
        this.motorMarsh.motorDetails.modelId,
        this.motorMarsh.motorDetails.vehicleTypeId,
        this.motorMarsh.motorDetails.modelYear,
        this.motorMarsh.motorDetails.subModelId,
        this.motorMarsh.motorDetails.colorId,
        this.motorMarsh.motorDetails.vehicleUsedId,
        result.p2100610List
      );

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService('afnty/getPaymentBreakdown?numPoliza='+ this.motorMarsh.quotationNumber +'&type=C',null).subscribe(
		paymentBreakdown => {
		  this.motorMarsh.premiumBreakdown = paymentBreakdown;
		  ret.next(this.motorMarsh);
		});

	return ret.asObservable();
  }

  mapRetrievePolicy(marsh: Marsh, result){

  	this.motorMarsh = new Marsh();

  	this.motorMarsh = marsh;

  	this.motorMarsh.policyNumber = result.p2000030.numPoliza;

	this.motorMarsh.riskDetails.firstName= result.fName;
	this.motorMarsh.riskDetails.middleName= result.mName;
	this.motorMarsh.riskDetails.lastName= result.lName;

	this.motorMarsh.riskDetails.fullName = this.motorMarsh.riskDetails.lastName + ", " + this.motorMarsh.riskDetails.firstName + " " + this.motorMarsh.riskDetails.middleName;

	this.motorMarsh.riskDetails.validIDValue= result.codDoc;
	this.motorMarsh.riskDetails.validID= result.tipDoc;
	this.motorMarsh.riskDetails.phoneNumber= result.mobileNumber;
	this.motorMarsh.riskDetails.emailAddress= result.email;
	this.motorMarsh.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.motorMarsh.riskDetails.suffix= result.suffix;
	this.motorMarsh.motorDetails.manufacturerId= result.make;
	this.motorMarsh.motorDetails.modelId= result.model;
	this.motorMarsh.motorDetails.vehicleTypeId= result.variant;
	this.motorMarsh.motorDetails.MVFileNumber= result.mvNumber;
	this.motorMarsh.motorDetails.plateNumber= result.plateNumber;
	this.motorMarsh.motorDetails.motorNumber= result.engineNumber;
	this.motorMarsh.motorDetails.serialNumber= result.chassisNumber;
	this.motorMarsh.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.motorMarsh.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.motorMarsh.motorDetails.colorId= result.color;
	this.motorMarsh.motorDetails.modelYear= result.year;
	this.motorMarsh.motorDetails.subModelId= result.subModel;
	this.motorMarsh.motorDetails.vehicleUsedId= result.typeOfUse;
	this.motorMarsh.motorDetails.motorTypeId= result.p2000030.codRamo;
  this.motorMarsh.lineId= result.p2000030.codRamo;

	marsh.productId= this.commonService.getP20Value(result.a2000020List,'COD_MODALIDAD');
  this.motorMarsh.motorDetails.conductionNumber= this.commonService.getP20Value(result.a2000020List,'NUM_CONDUCTION');
	this.motorMarsh.motorDetails.usageAreaId= this.commonService.getP20Value(result.a2000020List,'COD_AREA_USAGE');
	this.motorMarsh.motorDetails.usageArea= this.determineCodAreaUsage(this.motorMarsh.motorDetails.usageAreaId);
	this.motorMarsh.motorDetails.usageAreaIdHolder= this.motorMarsh.motorDetails.usageAreaId + '-' + this.motorMarsh.motorDetails.usageArea;
	this.motorMarsh.motorDetails.FMV = '0';

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.motorMarsh.motorDetails.isCorporate = fisico;

	this.commonService.getCoverageByPolicy("A",this.motorMarsh.policyNumber,this.motorMarsh.motorDetails.motorTypeId
      ).subscribe(
      (result) => {
        let totalLossDamagePrem = 0;

        for(let c = 0; c < result.length; c++){
          if(result[c].codCob == "1003" || result[c].codCob == "1002"){
            totalLossDamagePrem = totalLossDamagePrem + parseFloat(result[c].totalPremium);
          }
        }

        for(let i = 0; i < result.length; i++){

          switch(result[i].codCob){
            case "1004":
              this.motorMarsh.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
            break;
            case "1005":
              this.motorMarsh.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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
            this.motorMarsh.coveragesValue.push(result[i]);
          }

        }

        this.motorMarsh.coveragesValue = _.orderBy(this.motorMarsh.coveragesValue,'numSecu','asc');

      });

      let type = "motorComprehensive";

      if(this.motorMarsh.productId == "10002"){
        type = "motorCTPL";
      }

      this.loadAllLOV(
        this.motorMarsh.motorDetails.motorTypeId,
        this.motorMarsh.motorDetails.manufacturerId,
        this.motorMarsh.motorDetails.modelId,
        this.motorMarsh.motorDetails.vehicleTypeId,
        this.motorMarsh.motorDetails.modelYear,
        this.motorMarsh.motorDetails.subModelId,
        this.motorMarsh.motorDetails.colorId,
        this.motorMarsh.motorDetails.vehicleUsedId,
        result.p2100610List
      );

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService("afnty/coverage/getCoverageDescriptions", type).subscribe(
        coverages => {
          this.coverageList = [];
          let coverageHolder = coverages;
          for(let c in coverageHolder){
            for(let d in coverageHolder[c]){
              this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
              this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
            }
            this.coverageList.push(this.coverage);
            this.coverage = new MarshCoverages();
          }

          this.motorMarsh.coverages = this.coverageList;

          this.caller.doCallService('afnty/getPaymentBreakdown?numPoliza='+ this.motorMarsh.policyNumber +'&type=P',null).subscribe(
            paymentBreakdown => {
                this.motorMarsh.premiumBreakdown = paymentBreakdown;
                console.log(this.motorMarsh.premiumBreakdown);
                ret.next(this.motorMarsh);
          });

      });



  	return ret.asObservable();
  }

  determineCodAreaUsage(COD_AREA_USAGE){
    let area = "LUZON";
    if(COD_AREA_USAGE == '2'){
      area = "VIZMIN";
    }else if(COD_AREA_USAGE == '3'){
      area = "NATIONWIDE";
    }
    return area;
  }

  getLabel(id, anyList, cod, nom){
    let holder = "";
    for(let i = 0; i < anyList.length; i++){
      if(id == anyList[i][cod]){
        holder = anyList[i][nom];
        break;
      }
    }

    return holder;
  }

  loadAllLOV(motorTypeId, manufacturerId, modelId, vehicleTypeId,modelYear,subModelId,colorId,vehicleUsedId,p2100610List){

    this.commonService.chooseType(
      motorTypeId
    ).subscribe(
    (result) => {
      this.motorMarsh.lov.makeLOV = result;
      this.motorMarsh.motorDetails.manufacturer = this.getLabel(manufacturerId,result,'COD_MARCA','NOM_MARCA');
      this.motorMarsh.motorDetails.manufacturerIdHolder = manufacturerId + '-' + this.motorMarsh.motorDetails.manufacturer;
    });

    this.commonService.chooseMake(
      motorTypeId,
      manufacturerId
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.modelLOV = result;
      this.motorMarsh.motorDetails.model = this.getLabel(modelId,result,'COD_MODELO','NOM_MODELO');
      this.motorMarsh.motorDetails.modelIdHolder = modelId + '-' + this.motorMarsh.motorDetails.model;
    });

    this.commonService.chooseModel(
      manufacturerId,
      modelId
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.variantLOV = result;
      this.motorMarsh.motorDetails.vehicleType = this.getLabel(vehicleTypeId,result,'COD_TIP_VEHI','NOM_TIP_VEHI');
      this.motorMarsh.motorDetails.vehicleTypeIdHolder = vehicleTypeId + '-' + this.motorMarsh.motorDetails.vehicleType;
    });

    this.commonService.chooseVariant(
      manufacturerId,
      modelId,
      vehicleTypeId
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.yearList = result;
    });

    this.motorMarsh.lineId = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorMarsh.motorDetails.motorTypeId = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorMarsh.motorDetails.subline = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorMarsh.motorDetails.validityDate = this.commonService.selectSubline(vehicleTypeId).split("-")[0];

    this.commonService.loadAccessories(
      vehicleTypeId,
      this.motorMarsh.motorDetails.validityDate
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.accessoryLOV = result
    });   

    this.commonService.chooseModelYear(
      manufacturerId,
      modelId,
      vehicleTypeId,
      modelYear
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.subModelLOV = result;
      this.motorMarsh.motorDetails.subModel = this.getLabel(subModelId,result,'COD_SUB_MODELO','NOM_SUB_MODELO');
      this.motorMarsh.motorDetails.subModelIdHolder = subModelId + '-' + this.motorMarsh.motorDetails.subModel;
    });   

    this.commonService.chooseSubModel(
      motorTypeId,
      manufacturerId,
      modelId,
      vehicleTypeId,
      modelYear
    ).subscribe( 
    (result) => {
      this.motorMarsh.lov.typeOfUseLOV = result;
      this.motorMarsh.motorDetails.vehicleUsed = this.getLabel(vehicleUsedId,result,'COD_USO_VEHI','NOM_USO_VEHI');
      this.motorMarsh.motorDetails.vehicleUsedIdHolder = vehicleUsedId + '-' + this.motorMarsh.motorDetails.vehicleUsed;
    });    

    this.commonService.loadFMV(
      manufacturerId,
      modelId,
      subModelId,
      modelYear
    ).subscribe( 
    (resultFMV) => { 
      console.log(resultFMV);
      this.motorMarsh.motorDetails.FMV = resultFMV;
    });

    this.caller.getLOV("A2100800","1",'').subscribe(
      result => {
        this.motorMarsh.lov.colorLOV = result;
        this.motorMarsh.motorDetails.color = this.getLabel(colorId,result,'COD_COLOR','NOM_COLOR');
        this.motorMarsh.motorDetails.colorIdHolder = colorId + '-' + this.motorMarsh.motorDetails.color;
    });


  }

  

}
