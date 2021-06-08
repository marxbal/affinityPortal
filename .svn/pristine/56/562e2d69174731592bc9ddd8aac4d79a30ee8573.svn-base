import { Injectable } from '@angular/core';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../services/auth.service';
import {CommonService} from '../services/common.service';
import {Marsh} from '../objects/marsh';
import {MarshCoverages} from '../objects/marsh-coverages';
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

  propertyMarsh: Marsh = new Marsh();
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(marsh: Marsh, result){
  	this.propertyMarsh = new Marsh();

  	this.propertyMarsh = marsh;

  	this.propertyMarsh.quotationNumber = result.p2000030.numPoliza;

	this.propertyMarsh.riskDetails.firstName= result.fName;
	this.propertyMarsh.riskDetails.middleName= result.mName;
	this.propertyMarsh.riskDetails.lastName= result.lName;

	this.propertyMarsh.riskDetails.fullName = this.propertyMarsh.riskDetails.lastName + ", " + this.propertyMarsh.riskDetails.firstName + " " + this.propertyMarsh.riskDetails.middleName;

	this.propertyMarsh.riskDetails.validIDValue= result.codDoc;
	this.propertyMarsh.riskDetails.validID= result.tipDoc;
	this.propertyMarsh.riskDetails.phoneNumber= ((result.mobileNumber == "99999999999") ? "" : result.mobileNumber);
	this.propertyMarsh.riskDetails.emailAddress= ((result.email == "teleservice@mapfreinsular.com") ? "" : result.email);
	this.propertyMarsh.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
	this.propertyMarsh.riskDetails.suffix= result.suffix;
	this.propertyMarsh.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
	this.propertyMarsh.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
	this.propertyMarsh.riskDetails.gender= result.p1001331.mcaSexo;
	this.propertyMarsh.riskDetails.nationality= result.p1001331.codPais;
	this.propertyMarsh.riskDetails.civilStatus= result.p1001331.codEstCivil;
	this.propertyMarsh.lineId= result.p2000030.codRamo;

	this.propertyMarsh.productId= this.commonService.getP20Value(result.p2000020List,'COD_MODALIDAD');
  this.propertyMarsh.propertyDetails.unitNumber= this.commonService.getP20Value(result.p2000020List,'NUM_HOUSE_LOCATION');
  this.propertyMarsh.propertyDetails.unitProject = this.commonService.getP20Value(result.p2000020List,'TXT_BUILDING_NAME') + ":=:" + this.propertyMarsh.propertyDetails.unitNumber;

  for(let x = 0; x < result.p2000260List.length; x++){
      if(result.p2000260List[x].texto.includes(":=:")){
        let temp = new Property();
        temp.workOfArtsValues = result.p2000260List[x].texto.split(":=:")[0];
        temp.workOfArtsAmount = result.p2000260List[x].texto.split(":=:")[2];
        temp.workOfArtsDescription = result.p2000260List[x].texto.split(":=:")[1];
        this.propertyMarsh.propertyDetails.workOfArtsList.push(temp);
      }
  }
  
  let buildingName = this.commonService.getP20Value(result.p2000020List,'TXT_BUILDING_NAME');

	let fisico = "1";

	if(result.p1001331.mcaFisico == "N"){
	fisico = "2";
	}

	this.propertyMarsh.motorDetails.isCorporate = fisico;

	let type = "household";

	this.commonService.getCoverageByPolicy("P",this.propertyMarsh.quotationNumber,this.propertyMarsh.lineId
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
              this.propertyMarsh.propertyDetails.workOfArtsAmount = result[i].sumaAseg;
              result[i].totalPremium = total7105;
              result[i].nomCob = "WORKS OF ART";
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
            case "7373":
              this.propertyMarsh.propertyDetails.EVImprovements = result[i].sumaAseg;
              result[i].totalPremium = total7373;
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
            case "7386":
              this.propertyMarsh.propertyDetails.EVFurnishing = result[i].sumaAseg;
              result[i].totalPremium = total7386;
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
          }
          result[i].numSecu = parseInt(result[i].numSecu) + 0;
          result[i].totalPremium = ((result[i].totalPremium == "") ? "FREE" :  this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

        }

        this.propertyMarsh.coveragesValue = _.orderBy(this.propertyMarsh.coveragesValue,'numSecu','asc');

      });

      this.caller.doCallService("/marsh/coverage/getCoverageDescriptions", type).subscribe(
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

          this.propertyMarsh.coverages = this.coverageList;
      });

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ this.propertyMarsh.quotationNumber +'&type=C',null).subscribe(
		paymentBreakdown => {
		  this.propertyMarsh.premiumBreakdown = paymentBreakdown;

      this.caller.doCallService('/marsh/getBuildings',null).subscribe(
        result => {
          console.log(result);
          this.propertyMarsh.lov.buildingsLOV = result;

          for(let i = 0; i < this.propertyMarsh.lov.buildingsLOV.length; i++){
            if(this.propertyMarsh.lov.buildingsLOV[i].txtDescription.toUpperCase() == buildingName.toUpperCase()){
              this.propertyMarsh.propertyDetails.propertyId = this.propertyMarsh.lov.buildingsLOV[i].codBuilding;
              this.propertyMarsh.propertyDetails.buildingDetails = this.propertyMarsh.lov.buildingsLOV[i];
              break;
            }
          }

          ret.next(this.propertyMarsh);

      });



		  
		});

	return ret.asObservable();
  }

  mapRetrievePolicy(marsh: Marsh, result){

  	this.propertyMarsh = new Marsh();

  	this.propertyMarsh = marsh;

  	this.propertyMarsh.policyNumber = result.p2000030.numPoliza;

	this.propertyMarsh.riskDetails.firstName= result.fName;
  this.propertyMarsh.riskDetails.middleName= result.mName;
  this.propertyMarsh.riskDetails.lastName= result.lName;

  this.propertyMarsh.riskDetails.fullName = this.propertyMarsh.riskDetails.lastName + ", " + this.propertyMarsh.riskDetails.firstName + " " + this.propertyMarsh.riskDetails.middleName;

  this.propertyMarsh.riskDetails.validIDValue= result.codDoc;
  this.propertyMarsh.riskDetails.validID= result.tipDoc;
  this.propertyMarsh.riskDetails.phoneNumber= ((result.mobileNumber == "99999999999") ? "" : result.mobileNumber);
  this.propertyMarsh.riskDetails.emailAddress= ((result.email == "teleservice@mapfreinsular.com") ? "" : result.email);
  this.propertyMarsh.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
  this.propertyMarsh.riskDetails.suffix= result.suffix;
  this.propertyMarsh.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
  this.propertyMarsh.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');
  this.propertyMarsh.riskDetails.gender= result.p1001331.mcaSexo;
  this.propertyMarsh.riskDetails.nationality= result.p1001331.codPais;
  this.propertyMarsh.riskDetails.civilStatus= result.p1001331.codEstCivil;
  this.propertyMarsh.lineId= result.p2000030.codRamo;

  this.propertyMarsh.productId= this.commonService.getP20Value(result.a2000020List,'COD_MODALIDAD');
  this.propertyMarsh.propertyDetails.unitNumber= this.commonService.getP20Value(result.a2000020List,'NUM_HOUSE_LOCATION');
  
  let buildingName = this.commonService.getP20Value(result.a2000020List,'TXT_BUILDING_NAME');

  let fisico = "1";

  if(result.p1001331.mcaFisico == "N"){
  fisico = "2";
  }

  this.propertyMarsh.motorDetails.isCorporate = fisico;

  let type = "household";

	this.commonService.getCoverageByPolicy("A",this.propertyMarsh.policyNumber,this.propertyMarsh.lineId
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
              this.propertyMarsh.propertyDetails.workOfArtsAmount = result[i].sumaAseg;
              result[i].totalPremium = total7105;
              result[i].nomCob = "WORKS OF ART";
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
            case "7373":
              this.propertyMarsh.propertyDetails.EVImprovements = result[i].sumaAseg;
              result[i].totalPremium = total7373;
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
            case "7386":
              this.propertyMarsh.propertyDetails.EVFurnishing = result[i].sumaAseg;
              result[i].totalPremium = total7386;
              this.propertyMarsh.coveragesValue.push(result[i]);
            break;
          }
          result[i].numSecu = parseInt(result[i].numSecu) + 0;
          result[i].totalPremium = ((result[i].totalPremium == "") ? "FREE" :  this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

        }

        this.propertyMarsh.coveragesValue = _.orderBy(this.propertyMarsh.coveragesValue,'numSecu','asc');

      });

      let ret : any = new BehaviorSubject<any>([]);

      this.caller.doCallService("/marsh/coverage/getCoverageDescriptions", type).subscribe(
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
 
          this.propertyMarsh.coverages = this.coverageList;

          this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ this.propertyMarsh.policyNumber +'&type=P',null).subscribe(
            paymentBreakdown => {
                this.propertyMarsh.premiumBreakdown = paymentBreakdown;
                console.log(this.propertyMarsh.premiumBreakdown);

                this.caller.doCallService('/marsh/getBuildings',null).subscribe(
                  result => {
                    console.log(result);
                    this.propertyMarsh.lov.buildingsLOV = result;

                    for(let i = 0; i < this.propertyMarsh.lov.buildingsLOV.length; i++){
                      if(this.propertyMarsh.lov.buildingsLOV[i].txtDescription.toUpperCase() == buildingName.toUpperCase()){
                        this.propertyMarsh.propertyDetails.propertyId = this.propertyMarsh.lov.buildingsLOV[i].codBuilding;
                        this.propertyMarsh.propertyDetails.buildingDetails = this.propertyMarsh.lov.buildingsLOV[i];
                        break;
                      }
                    }

                    ret.next(this.propertyMarsh);

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
