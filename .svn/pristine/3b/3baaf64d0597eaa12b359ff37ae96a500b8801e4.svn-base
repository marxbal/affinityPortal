import { Injectable } from '@angular/core';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../services/auth.service';
import {CommonService} from '../services/common.service';
import {Marsh} from '../objects/marsh';
import {Risk} from '../objects/risk';
import {MarshCoverages} from '../objects/marsh-coverages';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PersonalAccidentIssuanceService {

  constructor(private caller : AuthService,
    private spinner : NgxSpinnerService,
    private commonService : CommonService) { }

  paMarsh: Marsh = new Marsh();
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(marsh: Marsh, result){
  	this.paMarsh = new Marsh();

  	this.paMarsh = marsh;

  	this.paMarsh.quotationNumber = result.p2000030.numPoliza;
    this.generalMapping(result);
	
  	this.paMarsh.productId= this.commonService.getP20Value(result.p2000020List,'COD_MODALIDAD');

  	let fisico = "1";

  	if(result.p1001331.mcaFisico == "N"){
  	fisico = "2";
  	}

  	this.paMarsh.motorDetails.isCorporate = fisico;

    this.mapP2025Primary(result.p2000025List);

  	this.commonService.getCoverageByPolicy("P",this.paMarsh.quotationNumber,this.paMarsh.lineId
        ).subscribe(
    (resulta) => {
      // this.paMarsh.coveragesValue = resulta;

      this.mapP2025Insured(result.p2000025List,resulta);

      for(let i = 0; i < resulta.length; i++){

        if(resulta[i].numRiesgo == "1"){
          // resulta[i].sumaAseg = this.formatter.format(parseFloat(resulta[i].sumaAseg));
         resulta[i].numSecu = parseInt(resulta[i].numSecu) + 0;
         resulta[i].totalPremium = ((resulta[i].totalPremium) ? this.formatter.format(parseFloat(resulta[i].totalPremium)) : "INCL");
         this.paMarsh.coveragesValue.push(resulta[i]);
        }
        
      }

      this.paMarsh.coveragesValue = _.orderBy(this.paMarsh.coveragesValue,'numSecu','asc');

    });

    this.caller.doCallService("/marsh/coverage/getCoverageDescriptions", "personalAccident").subscribe(
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

        this.paMarsh.coverages = this.coverageList;
    });

    let ret : any = new BehaviorSubject<any>([]);

    this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ this.paMarsh.quotationNumber +'&type=C',null).subscribe(
		paymentBreakdown => {
      console.log(paymentBreakdown);
		  this.paMarsh.premiumBreakdown = paymentBreakdown;

		  ret.next(this.paMarsh);
		});

  	return ret.asObservable();
  }

  mapRetrievePolicy(marsh: Marsh, result){
    this.paMarsh = new Marsh();

    this.paMarsh = marsh;

    this.paMarsh.policyNumber = result.p2000030.numPoliza;
    this.generalMapping(result);

    this.paMarsh.productId= this.commonService.getP20Value(result.a2000020List,'COD_MODALIDAD');

    let fisico = "1";

    if(result.p1001331.mcaFisico == "N"){
    fisico = "2";
    }

    this.paMarsh.motorDetails.isCorporate = fisico;

    // this.mapP2025Primary(result.p2000025List);

    this.commonService.getCoverageByPolicy("A",this.paMarsh.policyNumber,this.paMarsh.lineId
        ).subscribe(
        (resulta) => {
          console.log(resulta);

          this.mapP2025Insured(result.a2000025List,resulta);

          for(let i = 0; i < resulta.length; i++){

            if(resulta[i].numRiesgo == "1"){
              // resulta[i].sumaAseg = this.formatter.format(parseFloat(resulta[i].sumaAseg));
              resulta[i].numSecu = parseInt(resulta[i].numSecu) + 0;
              resulta[i].totalPremium = ((resulta[i].totalPremium) ? this.formatter.format(parseFloat(resulta[i].totalPremium)) : "INCL");
              this.paMarsh.coveragesValue.push(resulta[i]);
            }
            
          }

          this.paMarsh.coveragesValue = _.orderBy(this.paMarsh.coveragesValue,'numSecu','asc');

        });

        this.caller.doCallService("/marsh/coverage/getCoverageDescriptions", "personalAccident").subscribe(
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

            this.paMarsh.coverages = this.coverageList;
        });

        let ret : any = new BehaviorSubject<any>([]);

        this.caller.doCallService('/marsh/getPaymentBreakdown?numPoliza='+ this.paMarsh.policyNumber +'&type=P',null).subscribe(
      paymentBreakdown => {
        this.paMarsh.premiumBreakdown = paymentBreakdown;
        ret.next(this.paMarsh);
      });

    return ret.asObservable();
  }

  generalMapping(result){
    this.paMarsh.riskDetails.firstName= result.fName;
    this.paMarsh.riskDetails.middleName= result.mName;
    this.paMarsh.riskDetails.lastName= result.lName;

    this.paMarsh.riskDetails.fullName = this.paMarsh.riskDetails.lastName + ", " + this.paMarsh.riskDetails.firstName + " " + this.paMarsh.riskDetails.middleName;

    this.paMarsh.riskDetails.validIDValue= result.codDoc;
    this.paMarsh.riskDetails.validID= result.tipDoc;
    this.paMarsh.riskDetails.phoneNumber= result.mobileNumber;
    this.paMarsh.riskDetails.emailAddress= result.email;
    this.paMarsh.riskDetails.birthDate= m(result.birthdate).format('YYYY-MM-DD');
    this.paMarsh.riskDetails.suffix= result.suffix;
    this.paMarsh.riskDetails.gender= result.p1001331.mcaSexo;
    this.paMarsh.riskDetails.nationality= result.p1001331.codPais;
    this.paMarsh.riskDetails.civilStatus= result.p1001331.codEstCivil;
    this.paMarsh.lineId= result.p2000030.codRamo;
    this.paMarsh.motorDetails.policyPeriodFrom= m(result.inceptionDate).format('YYYY-MM-DD');
    this.paMarsh.motorDetails.policyPeriodTo= m(result.expiryDate).format('YYYY-MM-DD');



  }

  mapP2025Primary(p2025){

    for(let i = 0; i < p2025.length; i++){

      if(p2025[i].numRiesgo == "1"){

        switch(p2025[i].codCampo){
          case "COD_OCCUPATIONAL_CLASS":
            this.paMarsh.riskDetails.occupationalClass = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
            this.chooseOccupationalClass(p2025[i].valCampo);
          break;
          case "TXT_OCCUPATION":
            this.paMarsh.riskDetails.occupation = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
          break;
          case "TXT_HEALTH_DECLARA":
            let healthDec = true;
            if(p2025[i].valCampo == "N"){
              healthDec = false;
            }
            this.paMarsh.riskDetails.healthDeclaration = healthDec;
          break;
          case "NOM_RELIGION":
            this.paMarsh.riskDetails.religion = p2025[i].valCampo;
          break;
        }

      }

    }

  }

  mapP2025Insured(p2025,p2040){
    this.paMarsh.paDetails.familyMembers = [];
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

      this.paMarsh.paDetails.familyMembers.push(riskTemp);

    }

  }

  chooseOccupationalClass(occClass){
    this.caller.getLOV("G2990006","13","COD_RAMO~337|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012020|DVCOD_OCCUPATIONAL_CLASS~"+occClass+"|COD_IDIOMA~EN").subscribe(
      result => {
        console.log(result);
        this.paMarsh.lov.occupationLOV = result;
    });
  }

}
