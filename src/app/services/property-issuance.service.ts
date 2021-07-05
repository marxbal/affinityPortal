import { Injectable } from '@angular/core';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../services/auth.service';
import {CommonService} from '../services/common.service';
import {Affinity} from '../objects/affinity';
import {Coverages} from '../objects/coverages';
import {Property} from '../objects/property';
import {A6009908_MPH} from '../objects/a6009908_mph';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PropertyIssuanceService {

  constructor(private caller : AuthService,
    private spinner : NgxSpinnerService,
    private commonService : CommonService) { }

  propertyAff: Affinity = new Affinity();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(affinity: Affinity, result){
  	this.propertyAff = new Affinity();

  	this.propertyAff = affinity;

  	this.propertyAff.quotationNumber = result.p2000030.numPoliza;

	this.propertyAff.riskDetails.firstName= result.fName;
	this.propertyAff.riskDetails.middleName= result.mName;
	this.propertyAff.riskDetails.lastName= result.lName;

	this.propertyAff.riskDetails.fullName = this.propertyAff.riskDetails.lastName + ", " + this.propertyAff.riskDetails.firstName + " " + this.propertyAff.riskDetails.middleName;

	this.propertyAff.riskDetails.validIDValue= result.codDoc;
	this.propertyAff.riskDetails.validID= result.tipDoc;
	this.propertyAff.riskDetails.phoneNumber= ((result.mobileNumber == "99999999999") ? "" : result.mobileNumber);
	this.propertyAff.riskDetails.emailAddress= ((result.email == "teleservice@mapfreinsular.com") ? "" : result.email);
	this.propertyAff.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.propertyAff.riskDetails.suffix= result.suffix;
	this.propertyAff.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.propertyAff.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.propertyAff.riskDetails.gender= result.p1001331.mcaSexo;
	this.propertyAff.riskDetails.nationality= result.p1001331.codPais;
	this.propertyAff.riskDetails.civilStatus= result.p1001331.codEstCivil;
	this.propertyAff.lineId= result.p2000030.codRamo;

	this.propertyAff.productId= this.commonService.getP20Value(result.p2000020List,'COD_MODALIDAD');
  this.propertyAff.propertyDetails.unitNumber= this.commonService.getP20Value(result.p2000020List,'NUM_HOUSE_LOCATION');
  this.propertyAff.propertyDetails.unitProject = this.commonService.getP20Value(result.p2000020List,'TXT_BUILDING_NAME') + ":=:" + this.propertyAff.propertyDetails.unitNumber;

  for(let x = 0; x < result.p2000260List.length; x++){
      if(result.p2000260List[x].texto.includes(":=:")){
        let temp = new Property();
        temp.workOfArtsValues = result.p2000260List[x].texto.split(":=:")[0];
        temp.workOfArtsAmount = result.p2000260List[x].texto.split(":=:")[2];
        temp.workOfArtsDescription = result.p2000260List[x].texto.split(":=:")[1];
        this.propertyAff.propertyDetails.workOfArtsList.push(temp);
      }
  }
  
  let buildingName = this.commonService.getP20Value(result.p2000020List,'TXT_BUILDING_NAME');

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.propertyAff.motorDetails.isCorporate = fisico;

	let type = "household";

	this.commonService.getCoverageByPolicy("P",this.propertyAff.quotationNumber,this.propertyAff.lineId
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
              this.propertyAff.propertyDetails.workOfArtsAmount = result[i].sumaAseg;
              result[i].totalPremium = total7105;
              result[i].nomCob = "WORKS OF ART";
              this.propertyAff.coveragesValue.push(result[i]);
            break;
            case "7373":
              this.propertyAff.propertyDetails.EVImprovements = result[i].sumaAseg;
              result[i].totalPremium = total7373;
              this.propertyAff.coveragesValue.push(result[i]);
            break;
            case "7386":
              this.propertyAff.propertyDetails.EVFurnishing = result[i].sumaAseg;
              result[i].totalPremium = total7386;
              this.propertyAff.coveragesValue.push(result[i]);
            break;
          }
          result[i].numSecu = parseInt(result[i].numSecu) + 0;
          result[i].totalPremium = ((result[i].totalPremium == "") ? "FREE" :  this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

        }

        this.propertyAff.coveragesValue = _.orderBy(this.propertyAff.coveragesValue,'numSecu','asc');

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

          this.propertyAff.coverages = this.coverageList;
      });

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza='+ this.propertyAff.quotationNumber +'&type=C',null).subscribe(
		paymentBreakdown => {
		  this.propertyAff.premiumBreakdown = paymentBreakdown;

      this.caller.doCallService('/afnty/getBuildings',null).subscribe(
        result => {
          console.log(result);
          this.propertyAff.lov.buildingsLOV = result;

          for(let i = 0; i < this.propertyAff.lov.buildingsLOV.length; i++){
            if(this.propertyAff.lov.buildingsLOV[i].txtDescription.toUpperCase() == buildingName.toUpperCase()){
              this.propertyAff.propertyDetails.propertyId = this.propertyAff.lov.buildingsLOV[i].codBuilding;
              this.propertyAff.propertyDetails.buildingDetails = this.propertyAff.lov.buildingsLOV[i];
              break;
            }
          }

          ret.next(this.propertyAff);

      });



		  
		});

	return ret.asObservable();
  }

  mapRetrievePolicy(affinity: Affinity, result){

  	this.propertyAff = new Affinity();

  	this.propertyAff = affinity;

  	this.propertyAff.policyNumber = result.p2000030.numPoliza;

	this.propertyAff.riskDetails.firstName= result.fName;
  this.propertyAff.riskDetails.middleName= result.mName;
  this.propertyAff.riskDetails.lastName= result.lName;

  this.propertyAff.riskDetails.fullName = this.propertyAff.riskDetails.lastName + ", " + this.propertyAff.riskDetails.firstName + " " + this.propertyAff.riskDetails.middleName;

  this.propertyAff.riskDetails.validIDValue= result.codDoc;
  this.propertyAff.riskDetails.validID= result.tipDoc;
  this.propertyAff.riskDetails.phoneNumber= ((result.mobileNumber == "99999999999") ? "" : result.mobileNumber);
  this.propertyAff.riskDetails.emailAddress= ((result.email == "teleservice@mapfreinsular.com") ? "" : result.email);
  this.propertyAff.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
  this.propertyAff.riskDetails.suffix= result.suffix;
  this.propertyAff.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
  this.propertyAff.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
  this.propertyAff.riskDetails.gender= result.p1001331.mcaSexo;
  this.propertyAff.riskDetails.nationality= result.p1001331.codPais;
  this.propertyAff.riskDetails.civilStatus= result.p1001331.codEstCivil;
  this.propertyAff.lineId= result.p2000030.codRamo;

  this.propertyAff.productId= this.commonService.getP20Value(result.a2000020List,'COD_MODALIDAD');
  this.propertyAff.propertyDetails.unitNumber= this.commonService.getP20Value(result.a2000020List,'NUM_HOUSE_LOCATION');
  
  let buildingName = this.commonService.getP20Value(result.a2000020List,'TXT_BUILDING_NAME');

  let fisico = "1";

  if(result.p1001331.mcaFisico == "N"){
  fisico = "2";
  }

  this.propertyAff.motorDetails.isCorporate = fisico;

  let type = "household";

	this.commonService.getCoverageByPolicy("A",this.propertyAff.policyNumber,this.propertyAff.lineId
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
              this.propertyAff.propertyDetails.workOfArtsAmount = result[i].sumaAseg;
              result[i].totalPremium = total7105;
              result[i].nomCob = "WORKS OF ART";
              this.propertyAff.coveragesValue.push(result[i]);
            break;
            case "7373":
              this.propertyAff.propertyDetails.EVImprovements = result[i].sumaAseg;
              result[i].totalPremium = total7373;
              this.propertyAff.coveragesValue.push(result[i]);
            break;
            case "7386":
              this.propertyAff.propertyDetails.EVFurnishing = result[i].sumaAseg;
              result[i].totalPremium = total7386;
              this.propertyAff.coveragesValue.push(result[i]);
            break;
          }
          result[i].numSecu = parseInt(result[i].numSecu) + 0;
          result[i].totalPremium = ((result[i].totalPremium == "") ? "FREE" :  this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

        }

        this.propertyAff.coveragesValue = _.orderBy(this.propertyAff.coveragesValue,'numSecu','asc');

      });

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
 
          this.propertyAff.coverages = this.coverageList;

          this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza='+ this.propertyAff.policyNumber +'&type=P',null).subscribe(
            paymentBreakdown => {
                this.propertyAff.premiumBreakdown = paymentBreakdown;
                console.log(this.propertyAff.premiumBreakdown);

                this.caller.doCallService('/afnty/getBuildings',null).subscribe(
                  result => {
                    console.log(result);
                    this.propertyAff.lov.buildingsLOV = result;

                    for(let i = 0; i < this.propertyAff.lov.buildingsLOV.length; i++){
                      if(this.propertyAff.lov.buildingsLOV[i].txtDescription.toUpperCase() == buildingName.toUpperCase()){
                        this.propertyAff.propertyDetails.propertyId = this.propertyAff.lov.buildingsLOV[i].codBuilding;
                        this.propertyAff.propertyDetails.buildingDetails = this.propertyAff.lov.buildingsLOV[i];
                        break;
                      }
                    }

                    ret.next(this.propertyAff);

                });

          });

      });



  	return ret.asObservable();
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
  

}
