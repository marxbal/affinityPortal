import { Injectable } from '@angular/core';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../services/auth.service';
import {CommonService} from '../services/common.service';
import {Affinity} from '../objects/affinity';
import {Coverages} from '../objects/coverages';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MotorIssuanceService {

  constructor(private caller : AuthService,
    private spinner : NgxSpinnerService,
    private commonService : CommonService) { }

  motorAff: Affinity = new Affinity();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(affinity: Affinity, result){
  	this.motorAff = new Affinity();

  	this.motorAff = affinity;

  	this.motorAff.quotationNumber = result.p2000030.numPoliza;

	this.motorAff.riskDetails.firstName= result.fName;
	this.motorAff.riskDetails.middleName= result.mName;
	this.motorAff.riskDetails.lastName= result.lName;

	this.motorAff.riskDetails.fullName = this.motorAff.riskDetails.lastName + ", " + this.motorAff.riskDetails.firstName + " " + this.motorAff.riskDetails.middleName;

	this.motorAff.riskDetails.validIDValue= result.codDoc;
	this.motorAff.riskDetails.validID= result.tipDoc;
	this.motorAff.riskDetails.phoneNumber= result.mobileNumber;
	this.motorAff.riskDetails.emailAddress= result.email;
	this.motorAff.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.motorAff.riskDetails.suffix= result.suffix;
	this.motorAff.motorDetails.manufacturerId= result.make;
	this.motorAff.motorDetails.modelId= result.model;
	this.motorAff.motorDetails.vehicleTypeId= result.variant;
	this.motorAff.motorDetails.MVFileNumber= result.mvNumber;
	this.motorAff.motorDetails.plateNumber= result.plateNumber;
	this.motorAff.motorDetails.motorNumber= result.engineNumber;
	this.motorAff.motorDetails.serialNumber= result.chassisNumber;
	this.motorAff.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.motorAff.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.motorAff.motorDetails.colorId= result.color;
	this.motorAff.motorDetails.modelYear= result.year;
	this.motorAff.motorDetails.subModelId= result.subModel;
	this.motorAff.motorDetails.vehicleUsedId= result.typeOfUse;
	this.motorAff.motorDetails.motorTypeId= result.p2000030.codRamo;
	this.motorAff.riskDetails.gender= result.p1001331.mcaSexo;
	this.motorAff.riskDetails.nationality= result.p1001331.codPais;
	this.motorAff.riskDetails.civilStatus= result.p1001331.codEstCivil;
	this.motorAff.lineId= result.p2000030.codRamo;

	this.motorAff.productId= this.commonService.getP20Value(result.p2000020List,'COD_MODALIDAD');
	this.motorAff.motorDetails.conductionNumber= this.commonService.getP20Value(result.p2000020List,'NUM_CONDUCTION');
  this.motorAff.motorDetails.usageAreaId= this.commonService.getP20Value(result.p2000020List,'COD_AREA_USAGE');
	this.motorAff.motorDetails.usageArea= this.determineCodAreaUsage(this.motorAff.motorDetails.usageAreaId);
	this.motorAff.motorDetails.usageAreaIdHolder= this.motorAff.motorDetails.usageAreaId + '-' + this.motorAff.motorDetails.usageArea;
	this.motorAff.motorDetails.FMV = '0';

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.motorAff.motorDetails.isCorporate = fisico;

	let type = "motorComprehensive";

	if(this.motorAff.productId == "10002"){
	type = "motorCTPL";
	}

	this.commonService.getCoverageByPolicy("P",this.motorAff.quotationNumber,this.motorAff.motorDetails.motorTypeId
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
              this.motorAff.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
            break;
            case "1005":
              this.motorAff.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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
            this.motorAff.coveragesValue.push(result[i]);
          }

        }

        this.motorAff.coveragesValue = _.orderBy(this.motorAff.coveragesValue,'numSecu','asc');

      });

      this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
        coverages => {
          this.coverageList = [];
          let coverageHolder = coverages;
          for(let c in coverageHolder){
            for(let d in coverageHolder[c]){
              this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
              this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
            }
            this.coverageList.push(this.coverage);
            this.coverage = new Coverages();
          }

          this.motorAff.coverages = this.coverageList;
      });

      this.loadAllLOV(
        this.motorAff.motorDetails.motorTypeId,
        this.motorAff.motorDetails.manufacturerId,
        this.motorAff.motorDetails.modelId,
        this.motorAff.motorDetails.vehicleTypeId,
        this.motorAff.motorDetails.modelYear,
        this.motorAff.motorDetails.subModelId,
        this.motorAff.motorDetails.colorId,
        this.motorAff.motorDetails.vehicleUsedId,
        result.p2100610List
      );

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza='+ this.motorAff.quotationNumber +'&type=C',null).subscribe(
		paymentBreakdown => {
		  this.motorAff.premiumBreakdown = paymentBreakdown;
		  ret.next(this.motorAff);
		});

	return ret.asObservable();
  }

  mapRetrievePolicy(affinity: Affinity, result){

  	this.motorAff = new Affinity();

  	this.motorAff = affinity;

  	this.motorAff.policyNumber = result.p2000030.numPoliza;

	this.motorAff.riskDetails.firstName= result.fName;
	this.motorAff.riskDetails.middleName= result.mName;
	this.motorAff.riskDetails.lastName= result.lName;

	this.motorAff.riskDetails.fullName = this.motorAff.riskDetails.lastName + ", " + this.motorAff.riskDetails.firstName + " " + this.motorAff.riskDetails.middleName;

	this.motorAff.riskDetails.validIDValue= result.codDoc;
	this.motorAff.riskDetails.validID= result.tipDoc;
	this.motorAff.riskDetails.phoneNumber= result.mobileNumber;
	this.motorAff.riskDetails.emailAddress= result.email;
	this.motorAff.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.motorAff.riskDetails.suffix= result.suffix;
	this.motorAff.motorDetails.manufacturerId= result.make;
	this.motorAff.motorDetails.modelId= result.model;
	this.motorAff.motorDetails.vehicleTypeId= result.variant;
	this.motorAff.motorDetails.MVFileNumber= result.mvNumber;
	this.motorAff.motorDetails.plateNumber= result.plateNumber;
	this.motorAff.motorDetails.motorNumber= result.engineNumber;
	this.motorAff.motorDetails.serialNumber= result.chassisNumber;
	this.motorAff.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.motorAff.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.motorAff.motorDetails.colorId= result.color;
	this.motorAff.motorDetails.modelYear= result.year;
	this.motorAff.motorDetails.subModelId= result.subModel;
	this.motorAff.motorDetails.vehicleUsedId= result.typeOfUse;
	this.motorAff.motorDetails.motorTypeId= result.p2000030.codRamo;
  this.motorAff.lineId= result.p2000030.codRamo;

	affinity.productId= this.commonService.getP20Value(result.a2000020List,'COD_MODALIDAD');
  this.motorAff.motorDetails.conductionNumber= this.commonService.getP20Value(result.a2000020List,'NUM_CONDUCTION');
	this.motorAff.motorDetails.usageAreaId= this.commonService.getP20Value(result.a2000020List,'COD_AREA_USAGE');
	this.motorAff.motorDetails.usageArea= this.determineCodAreaUsage(this.motorAff.motorDetails.usageAreaId);
	this.motorAff.motorDetails.usageAreaIdHolder= this.motorAff.motorDetails.usageAreaId + '-' + this.motorAff.motorDetails.usageArea;
	this.motorAff.motorDetails.FMV = '0';

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.motorAff.motorDetails.isCorporate = fisico;

	this.commonService.getCoverageByPolicy("A",this.motorAff.policyNumber,this.motorAff.motorDetails.motorTypeId
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
              this.motorAff.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
              result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
            break;
            case "1005":
              this.motorAff.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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
            this.motorAff.coveragesValue.push(result[i]);
          }

        }

        this.motorAff.coveragesValue = _.orderBy(this.motorAff.coveragesValue,'numSecu','asc');

      });

      let type = "motorComprehensive";

      if(this.motorAff.productId == "10002"){
        type = "motorCTPL";
      }

      this.loadAllLOV(
        this.motorAff.motorDetails.motorTypeId,
        this.motorAff.motorDetails.manufacturerId,
        this.motorAff.motorDetails.modelId,
        this.motorAff.motorDetails.vehicleTypeId,
        this.motorAff.motorDetails.modelYear,
        this.motorAff.motorDetails.subModelId,
        this.motorAff.motorDetails.colorId,
        this.motorAff.motorDetails.vehicleUsedId,
        result.p2100610List
      );

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
        coverages => {
          this.coverageList = [];
          let coverageHolder = coverages;
          for(let c in coverageHolder){
            for(let d in coverageHolder[c]){
              this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
              this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
            }
            this.coverageList.push(this.coverage);
            this.coverage = new Coverages();
          }

          this.motorAff.coverages = this.coverageList;

          this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza='+ this.motorAff.policyNumber +'&type=P',null).subscribe(
            paymentBreakdown => {
                this.motorAff.premiumBreakdown = paymentBreakdown;
                ret.next(this.motorAff);
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
      this.motorAff.lov.makeLOV = result;
      this.motorAff.motorDetails.manufacturer = this.getLabel(manufacturerId,result,'COD_MARCA','NOM_MARCA');
      this.motorAff.motorDetails.manufacturerIdHolder = manufacturerId + '-' + this.motorAff.motorDetails.manufacturer;
    });

    this.commonService.chooseMake(
      motorTypeId,
      manufacturerId
    ).subscribe( 
    (result) => {
      this.motorAff.lov.modelLOV = result;
      this.motorAff.motorDetails.model = this.getLabel(modelId,result,'COD_MODELO','NOM_MODELO');
      this.motorAff.motorDetails.modelIdHolder = modelId + '-' + this.motorAff.motorDetails.model;
    });

    this.commonService.chooseModel(
      manufacturerId,
      modelId
    ).subscribe( 
    (result) => {
      this.motorAff.lov.variantLOV = result;
      this.motorAff.motorDetails.vehicleType = this.getLabel(vehicleTypeId,result,'COD_TIP_VEHI','NOM_TIP_VEHI');
      this.motorAff.motorDetails.vehicleTypeIdHolder = vehicleTypeId + '-' + this.motorAff.motorDetails.vehicleType;
    });

    this.commonService.chooseVariant(
      manufacturerId,
      modelId,
      vehicleTypeId
    ).subscribe( 
    (result) => {
      this.motorAff.lov.yearList = result;
    });

    this.motorAff.lineId = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorAff.motorDetails.motorTypeId = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorAff.motorDetails.subline = this.commonService.selectSubline(vehicleTypeId).split("-")[1];
    this.motorAff.motorDetails.validityDate = this.commonService.selectSubline(vehicleTypeId).split("-")[0];

    this.commonService.loadAccessories(
      vehicleTypeId,
      this.motorAff.motorDetails.validityDate
    ).subscribe( 
    (result) => {
      this.motorAff.lov.accessoryLOV = result
    });   

    this.commonService.chooseModelYear(
      manufacturerId,
      modelId,
      vehicleTypeId,
      modelYear
    ).subscribe( 
    (result) => {
      this.motorAff.lov.subModelLOV = result;
      this.motorAff.motorDetails.subModel = this.getLabel(subModelId,result,'COD_SUB_MODELO','NOM_SUB_MODELO');
      this.motorAff.motorDetails.subModelIdHolder = subModelId + '-' + this.motorAff.motorDetails.subModel;
    });   

    this.commonService.chooseSubModel(
      motorTypeId,
      manufacturerId,
      modelId,
      vehicleTypeId,
      modelYear
    ).subscribe( 
    (result) => {
      this.motorAff.lov.typeOfUseLOV = result;
      this.motorAff.motorDetails.vehicleUsed = this.getLabel(vehicleUsedId,result,'COD_USO_VEHI','NOM_USO_VEHI');
      this.motorAff.motorDetails.vehicleUsedIdHolder = vehicleUsedId + '-' + this.motorAff.motorDetails.vehicleUsed;
    });    

    this.commonService.loadFMV(
      manufacturerId,
      modelId,
      subModelId,
      modelYear
    ).subscribe( 
    (resultFMV) => { 
      this.motorAff.motorDetails.FMV = resultFMV;
    });

    this.caller.getLOV("A2100800","1",'').subscribe(
      result => {
        this.motorAff.lov.colorLOV = result;
        this.motorAff.motorDetails.color = this.getLabel(colorId,result,'COD_COLOR','NOM_COLOR');
        this.motorAff.motorDetails.colorIdHolder = colorId + '-' + this.motorAff.motorDetails.color;
    });


  }

  

}
