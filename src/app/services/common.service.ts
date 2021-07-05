import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Marsh} from '../objects/marsh';
import {P2000030} from '../objects/p2000030';
import {P2000031} from '../objects/p2000031';
import {P1001331} from '../objects/p1001331';
import {P2000020} from '../objects/p2000020';
import {P2000025} from '../objects/p2000025';
import {P2000040} from '../objects/p2000040';
import {P2100610} from '../objects/p2100610';
import {P2000060} from '../objects/p2000060';
import {A2000260} from '../objects/a2000260';
import {A1000131_MPH} from '../objects/a1000131_mph';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import { NgxSpinnerService } from 'ngx-spinner';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private caller : AuthService,
    private spinner : NgxSpinnerService) { }

  chooseType(motorTypeId){

    let ret : any = new BehaviorSubject<any>([]);

    this.spinner.show();
    this.caller.getLOV("A2100400","5",'COD_CIA~1|COD_RAMO~' + motorTypeId).subscribe(
      result => {
        this.spinner.hide();
        ret.next(result);
    }); 

    return ret.asObservable();

  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  scrollToElement(elementId,speed){
    $('html, body').animate({
        scrollTop: $("#" + elementId).offset().top
    }, speed);
  }

  chooseMake(motorTypeId, manufacturerId){

    let ret : any = new BehaviorSubject<any>([]);

    this.spinner.show();
    this.caller.getLOV('A2100410', '5', 'COD_RAMO~' + motorTypeId 
      + '|COD_MARCA~' + manufacturerId + '|COD_CIA~1').subscribe(
      result => {
        ret.next(result);
        this.spinner.hide();
    });

    return ret.asObservable();

  }

  chooseModel(manufacturerId, modelId){
    let ret : any = new BehaviorSubject<any>([]);

    this.spinner.show();
    this.caller.getLOV('A2100100','4','NUM_COTIZACION~1|COD_MARCA~' 
      +  manufacturerId +'|COD_MODELO~' 
      +  modelId +'|COD_CIA~1').subscribe(
    result => {
      ret.next(result);
      this.spinner.hide();
    });

    return ret.asObservable();
  }

  chooseVariant(manufacturerId, modelId, vehicleTypeId){

    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.getLOV('A2100430','4','NUM_COTIZACION~1|COD_MARCA~' + 
      manufacturerId +'|COD_MODELO~' + 
      modelId +'|COD_TIP_VEHI~' + 
      vehicleTypeId + '|COD_CIA~1').subscribe(
    result => {
      ret.next(result);
      this.spinner.hide();
    });

    return ret.asObservable();

  }

  loadAccessories(vehicleTypeId, validityDate){
    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.getLOV('A2100601','2','COD_CIA~1|cod_tip_vehi~'+
      vehicleTypeId +'|fec_validez~' + 
      validityDate ).subscribe(
    result => {
      let acc = [];
      for(let i = 0; i < result.length; i++){
        if(result[i].ABR_AGRUP_ACCESORIO == "A"){
          result[i].ABR_AGRUP_ACCESORIO = "Additional";
          acc.push(result[i]);
        }
      } 
      this.spinner.hide();
      ret.next(acc);
    });

    return ret.asObservable();
  }

  chooseModelYear(manufacturerId,modelId,vehicleTypeId,modelYear){

    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.getLOV('A2100420','4','NUM_COTIZACION~1|COD_MARCA~' + 
     manufacturerId +'|COD_MODELO~' + 
      modelId +'|COD_TIP_VEHI~' + 
      vehicleTypeId + '|ANIO_SUB_MODELO~' + 
      modelYear).subscribe(
    result => {
      ret.next(result);
      this.spinner.hide();
    });

    return ret.asObservable();

  }

  chooseSubModel(motorTypeId, manufacturerId, modelId, vehicleTypeId, modelYear){
    
    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.getLOV('A2100200','5','NUM_COTIZACION~1' + 
      '|COD_RAMO~' + motorTypeId + 
      '|COD_MARCA~' + manufacturerId +
      '|COD_MODELO~' + modelId + 
      '|COD_TIP_VEHI~' + vehicleTypeId + 
      '|ANIO_SUB_MODELO~' + modelYear).subscribe(
    result => {
      ret.next(result);
      this.spinner.hide();
    });

    return ret.asObservable();

  }

  getCoverageByPolicy(type,numPoliza,codRamo){
    
    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.doCallService('afnty/getCoveragesByPolicy?type='+ type
          + "&numPoliza=" + numPoliza + '&codRamo='+ codRamo,null).subscribe(
        result => {
          ret.next(result);
          this.spinner.hide();
      });

    return ret.asObservable();

  }

  getCoverageByProduct(motorTypeId,validityDate,productId){
    
    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.doCallService('afnty/getCoverageByProduct?validityDate='+ validityDate
          + "&productId=" + productId + '&codRamo='+ motorTypeId + "&codCia=1",null).subscribe(
        result => {
          ret.next(result);
          this.spinner.hide();
      });

    return ret.asObservable();

  }

  loadFMV(manufacturerId, modelId,subModelId, modelYear){
    
    let ret : any = new BehaviorSubject<any>([]);
    this.spinner.show();
    this.caller.doCallService('afnty/getFMV?codCia=1&codMarca='+ 
      manufacturerId + '&codModelo=' +
      modelId + '&codSubModelo=' +
      subModelId + '&anioSubModelo='+
      modelYear,null).subscribe(
        result => {
          ret.next(result);
          this.spinner.hide();
      });

    return ret.asObservable();

  }

  selectSubline(vehicle_type){

  	let validity_date = '01012015-105';

  	let group = ['1','2','4','16','23','24'];

    if(vehicle_type == "17"){
      return '01052014-120';
    }

  	for(let i = 0; i < group.length; i++){
  		if(vehicle_type == group[i]){
  			validity_date = '01052014-100';
  		}
  	}
    console.log(validity_date);
  	return validity_date;

  }

  assignP2100610(marsh: Marsh){
    let p2161 : P2100610[] = [];

    for(let i = 0; i < marsh.motorDetails.accessories.length; i++){
      let p2161temp = new P2100610();
      p2161temp.codCia = '1';
      p2161temp.codAccesorio = marsh.motorDetails.accessories[i].accessoryId;
      p2161temp.nomAccesorio = marsh.motorDetails.accessories[i].accessoryName;
      p2161temp.impAccesorio = marsh.motorDetails.accessories[i].accessoryValue;
      p2161temp.txtAccesorio = marsh.motorDetails.accessories[i].accessoryDescription;
      p2161.push(p2161temp);
    }

    return p2161;
  }

  getP20Value(p2020,cod_campo){
    let ret = null;
    for(let i = 0; i < p2020.length; i++){
      if(cod_campo == p2020[i]['codCampo']){
        ret = p2020[i]['valCampo'];
        break;
      }
    }

    return ret;
  }

  assignFormDataUpload(marsh: Marsh): FormData{
    let formData = new FormData();
    
    for(let i = 0; i < marsh.motorDetails.vehiclePhotos.length ; i++){
      formData.append('file',marsh.motorDetails.vehiclePhotos[i],marsh.motorDetails.vehiclePhotos[i].name);
    }

    return formData;
  }

  assignP2000025(marsh: Marsh){
    let p2025 : P2000025[] = [];



    if(marsh.lineId == "337"){

      let gender = "MALE";

      if(marsh.riskDetails.gender == "2"){
        gender = "FEMALE";
      }

      let healthDeclaration = "YES";

      if(!marsh.riskDetails.healthDeclaration){
        healthDeclaration = "NO";
      }
 
      let vars1 = [
                    ['TXT_LAST_NAME',marsh.riskDetails.lastName.toUpperCase(),'1',null,'N','S','S'],
                    ['TXT_FIRST_NAME',((marsh.riskDetails.firstName) ? marsh.riskDetails.firstName.toUpperCase() : ""),'1',null,'N','S','S'],
                    ['TXT_MIDDLE_INITIAL',((marsh.riskDetails.middleName) ? marsh.riskDetails.middleName.toUpperCase() : ""),'1',null,'N','S','S'],
                    ['TXT_SUFFIX',marsh.riskDetails.suffix,'1',null,'N','S','S'],
                    ['MCA_SEXO_ASEG',gender.charAt(0),'1',gender,'N','S','S'],
                    ['RELATIONSHIP','P','1','PRIMARY','N','S','S'],
                    ['BIRTHDATE',m(marsh.riskDetails.birthDate).format('DDMMYYYY'),'1',null,'N','S','S'],
                    ['COD_OCCUPATIONAL_CLASS',marsh.riskDetails.occupationalClass.split(':=:')[0],'1',marsh.riskDetails.occupationalClass.split(':=:')[1],'N','S','S'],
                    ['TXT_OCCUPATION',marsh.riskDetails.occupation.split(':=:')[0],'1',marsh.riskDetails.occupation.split(':=:')[1],'N','S','S'],
                    ['TXT_HEALTH_DECLARA',healthDeclaration.charAt(0),'1',healthDeclaration,'N','S','S'],
                    ['TXT_HEALTH_DECLARA_EXIST',((marsh.riskDetails.preExistingIllness) ? marsh.riskDetails.preExistingIllness.toUpperCase() : ""),'1',null,'N','S','S'],
                    ['NOM_RELIGION',((marsh.riskDetails.religion) ? marsh.riskDetails.religion.toUpperCase() : ""),'1',null,'N','S','S']
                  ];

      for(let x = 0; x < vars1.length; x++){
        let tempP25a = new P2000025();
        tempP25a.codCampo = vars1[x][0];
        tempP25a.valCampo = vars1[x][1];
        tempP25a.numOcurrencia = vars1[x][2];
        tempP25a.txtCampo = vars1[x][3];
        tempP25a.mcaBajaRiesgo = vars1[x][4];
        tempP25a.mcaVigente = vars1[x][5];
        tempP25a.mcaVigenteApli = vars1[x][6];
        tempP25a.numSecu = (x+1).toString();
        tempP25a.numRiesgo = '1';
        p2025.push(tempP25a);
      }
      let riesgo = 2;
      marsh.paDetails.familyMembers.forEach(function(insured){

        let gender = "MALE";

        if(insured.gender == "0"){
          gender = "FEMALE";
        }

        let healthDeclaration = "YES";

        if(!insured.healthDeclaration){
          healthDeclaration = "NO";
        }
        
        let vars = [
                    ['TXT_LAST_NAME',insured.lastName.toUpperCase(),'1',null,'N','S','S'],
                    ['TXT_FIRST_NAME',insured.firstName.toUpperCase(),'1',null,'N','S','S'],
                    ['TXT_MIDDLE_INITIAL',((insured.middleName) ? insured.middleName.toUpperCase() : ""),'1',null,'N','S','S'],
                    ['TXT_SUFFIX',insured.suffix,'1',null,'N','S','S'],
                    ['MCA_SEXO_ASEG',gender.charAt(0),'1',gender,'N','S','S'],
                    ['RELATIONSHIP',insured.relationship.split(':=:')[0],'1',insured.relationship.split(':=:')[1],'N','S','S'],
                    ['BIRTHDATE',(insured.birthDate.match(/[\-]/) ? m(insured.birthDate).format('DDMMYYYY') : insured.birthDate),'1',null,'N','S','S'],
                    ['COD_OCCUPATIONAL_CLASS',(insured.occupationalClass ? insured.occupationalClass.split(':=:')[0] : ""),'1',(insured.occupationalClass ? insured.occupationalClass.split(':=:')[1] : ""),'N','S','S'],
                    ['TXT_OCCUPATION',(insured.occupation ? insured.occupation.split(':=:')[0] : ""),'1',(insured.occupation ? insured.occupation.split(':=:')[1] : ""),'N','S','S'],
                    ['TXT_HEALTH_DECLARA',healthDeclaration.charAt(0),'1',healthDeclaration,'N','S','S'],
                    ['TXT_HEALTH_DECLARA_EXIST',((insured.preExistingIllness) ? insured.preExistingIllness.toUpperCase() : ""),'1',null,'N','S','S'],
                    ['NOM_RELIGION',((insured.religion) ? insured.religion.toUpperCase() : ""),'1',null,'N','S','S']
                  ];

        for(let i = 0; i < vars.length; i++){
          let tempP25 = new P2000025();
          tempP25.codCampo = vars[i][0];
          tempP25.valCampo = vars[i][1];
          tempP25.numOcurrencia = vars[i][2];
          tempP25.txtCampo = vars[i][3];
          tempP25.mcaBajaRiesgo = vars[i][4];
          tempP25.mcaVigente = vars[i][5];
          tempP25.mcaVigenteApli = vars[i][6];
          tempP25.numSecu = (i+1).toString();
          tempP25.numRiesgo = riesgo.toString();
          p2025.push(tempP25);
        }

        riesgo++;

      });

    }

    if(marsh.lineId == "251"){

        let vars = [
                    ['TXT_OTHER_EXT_PERIL_7513','REPLACEMENT OF LOCKS AND KEYS','1',null,'N','S','S','1'],
                    ['VAL_RISK_7514','10000','1',null,'N','S','S','2'],
                    ['TXT_OTHER_EXT_PERIL_7513','FREEZER CONTENTS','2',null,'N','S','S','1'],
                    ['VAL_RISK_7514','10000','2',null,'N','S','S','2'],
                    ['TXT_OTHER_EXT_PERIL_7513','LOST OF RENT/INCOME','3',null,'N','S','S','1'],
                    ['VAL_RISK_7514','100000','3',null,'N','S','S','2'],
                    ['TXT_DESCRIPTION_PROPERTY_7326','SPRINKLER LEAKAGE','1',null,'N','S','S','1'],
                    ['VAL_RISK_7219','2060000','1',null,'N','S','S','2'],
                    ['TXT_DESCRIPTION_PROPERTY_7326','BUSH FIRE','2',null,'N','S','S','1'],
                    ['VAL_RISK_7219','2060000','2',null,'N','S','S','2']
                  ];

        if(marsh.propertyDetails.workOfArtsList.length > 0){

          for(let i = 0; i < marsh.propertyDetails.workOfArtsList.length; i++){

            let kog = ['TXT_DESCRIPTION_PROPERTY_7104',marsh.propertyDetails.workOfArtsList[i].workOfArtsValues,(i+1).toString(),null,'N','S','S','1'];
            let kogg = ['VAL_RISK_7105',marsh.propertyDetails.workOfArtsList[i].workOfArtsAmount,(i+1).toString(),null,'N','S','S','2'];

            vars.push(kog);
            vars.push(kogg);

          } 

        } 

        for(let i = 0; i < vars.length; i++){
          let tempP25 = new P2000025();
          tempP25.codCampo = vars[i][0];
          tempP25.valCampo = vars[i][1];
          tempP25.numOcurrencia = vars[i][2];
          tempP25.txtCampo = vars[i][3];
          tempP25.mcaBajaRiesgo = vars[i][4];
          tempP25.mcaVigente = vars[i][5];
          tempP25.mcaVigenteApli = vars[i][6];
          tempP25.numSecu = vars[i][7];
          tempP25.numRiesgo = '1';
          p2025.push(tempP25);
        }
    }

    if(marsh.alternativeHolders.length > 0){

      marsh.alternativeHolders.forEach(function(alt){
        
        let fullName = alt.firstName + " " 
                  + ((alt.middleName) ? alt.middleName : null) + " "
                  + ((alt.lastName) ? alt.lastName : null);

        let vars = [
                    ['NOM_ASEG_ALT',fullName,'1',null,'N','S','S'],
                    ['TIP_ASEG_SEP_LOV',alt.separator,'1',alt.separatorText,'N','S','S']
                  ];

        for(let i = 0; i < vars.length; i++){
          let tempP25 = new P2000025();
          tempP25.codCampo = vars[i][0];
          tempP25.valCampo = vars[i][1];
          tempP25.numOcurrencia = vars[i][2];
          tempP25.txtCampo = vars[i][3];
          tempP25.mcaBajaRiesgo = vars[i][4];
          tempP25.mcaVigente = vars[i][5];
          tempP25.mcaVigenteApli = vars[i][6];
          tempP25.numSecu = (i+1).toString();
          p2025.push(tempP25);
        }

      });
    }

    return p2025;
  }

  identifyTechControl(marsh: Marsh){
    let techControlLevel = "1";

    for(let i = 0; i < marsh.techControl.length; i++){
      let level = marsh.techControl[i].split("@")[1];
      console.log(level);
      if(level){

          if(level == "3"){
            techControlLevel = "3";
          }else if(level == "2"){{
            techControlLevel = "2";
            break;
          }

        }

      }

    }
    marsh.techControlLevel = techControlLevel;
    return marsh;
  }

  assignP2000060(marsh: Marsh, status){
    let p2060 : P2000060[] = [];

    let vars = [];

    if(marsh.productId == '10002' || marsh.productId == '10001'){

      vars = [
                  ['1','1','4',marsh.riskDetails.validID,marsh.riskDetails.validIDValue.toUpperCase()],
                  ['1','1','3',marsh.riskDetails.validID,marsh.riskDetails.validIDValue.toUpperCase()]
                ];

    }

    if(status == "policy" && marsh.motorDetails.isMortgaged == true){
        let kog = ['1','1','8',marsh.motorDetails.mortgageeId,marsh.motorDetails.mortgagee]; 
        vars.push(kog);
    }

    if(marsh.alternativeHolders.length > 0){

      console.log(marsh.alternativeHolders);

      marsh.alternativeHolders.forEach(function(alt){
        
        let kog = ['1','1','1',alt.validID,alt.validIDValue.toUpperCase()]; 
        vars.push(kog);

      });
    }


    for(let i = 0; i < vars.length; i++){
      let p60temp = new P2000060();
      p60temp.codCia = vars[i][0];
      p60temp.numRiesgo = vars[i][1];
      p60temp.tipBenef = vars[i][2];
      p60temp.tipDocum = vars[i][3];
      p60temp.codDocum = vars[i][4];
      p2060.push(p60temp);
    }

    

    return p2060;
  }

  assignP2000040(marsh: Marsh){
    let p2040 : P2000040[] = [];
    let vars = [];
    if(marsh.productId == '10001' || marsh.productId == '10002'){

      let fmv = parseInt(marsh.motorDetails.FMV);

      for(let i = 0;i < marsh.motorDetails.accessories.length; i++){
        fmv = fmv + parseInt(marsh.motorDetails.accessories[i].accessoryValue) + 0;
      }

      vars = [
                // [1001,100000], //COMP. THIRD PAR. LIAB.
                [1004,parseInt(marsh.motorDetails.bodilyInjuryLimit)], //Bodily injury
                [1005,parseInt(marsh.motorDetails.propertyDamageLimit)], //Property Damage
                [1007,100000], //UNNAMED PASS. P.A.
                [1008,fmv], // AoN
                [1020,fmv] // strikes and riots
              ];

      if(marsh.productId == '10002'){
        vars = [[1001,100000]]
      }

    }

    if(marsh.lineId == "337"){
      vars = [
        // [1001,100000], //COMP. THIRD PAR. LIAB.
        [341,1000000], //Accidental Death Benefit
        [345,1000000], // strikes and riots
        [343,1000000], //UNNAMED PASS. P.A.
        [344,50000], // AoN
        [342,100000], //Property Damage
        [376,30000], // strikes and riots
        [602,30000], // strikes and riots
        [603,30000] // strikes and riots
      ];
    }

    if(marsh.lineId == "251"){
      vars = [
        [7373,marsh.propertyDetails.EVImprovements],
        [7386,marsh.propertyDetails.EVFurnishing],
        [7326,0],
        [7513,0],
        [7219,marsh.propertyDetails.EVImprovements],
        [7514,120000]
      ];
 
      if(marsh.propertyDetails.workOfArtsAmount){
        let kogg = [7104,parseFloat(marsh.propertyDetails.workOfArtsAmount)]; 
        vars.push(kogg); 

        let kog = [7105,parseFloat(marsh.propertyDetails.workOfArtsAmount)]; 
        vars.push(kog); 

        
      }
    }

    for(let i = 0; i < vars.length; i++){
      let p40temp = new P2000040();
      // console.log(vars[i][0]);
      p40temp.codCob = vars[i][0];
      p40temp.sumaAseg = vars[i][1];
      p2040.push(p40temp);
    }

    

    return p2040;
  }

  assignA1000131_MPH(marsh: Marsh){
    let a131 : A1000131_MPH[] = [];

    let vars = [
                ['NOM_NACIMIENTO','1',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_NACIMIENTO) ? marsh.KYC.NOM_NACIMIENTO : null)],
                ['NUM_SSS_GSIS','2',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NUM_SSS_GSIS) ? marsh.KYC.NUM_SSS_GSIS : null)],
                ['NUM_TIN','3',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NUM_TIN) ? marsh.KYC.NUM_TIN : null)],
                ['NOM_FUENTO_FONDO','5',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_FUENTO_FONDO) ? marsh.KYC.NOM_FUENTO_FONDO : null)],
                ['NUM_INGRESOS_NETOS','6',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NUM_INGRESOS_NETOS) ? marsh.KYC.NUM_INGRESOS_NETOS : null)],
                ['NOM_NEGOCIO','7',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_NEGOCIO) ? marsh.KYC.NOM_NEGOCIO : null)],
                ['NOM_EMP_BUS_ANIO_SINGKO','8',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_EMP_BUS_ANIO_SINGKO) ? marsh.KYC.NOM_EMP_BUS_ANIO_SINGKO : null)],
                ['NUM_EMP_BUS_ANIO_SINGKO','9',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NUM_EMP_BUS_ANIO_SINGKO) ? marsh.KYC.NUM_EMP_BUS_ANIO_SINGKO : null)],
                ['NOM_CASA_OWN','10',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_CASA_OWN) ? marsh.KYC.NOM_CASA_OWN : null)],
                ['NOM_CASE_RENT','11',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_CASE_RENT) ? marsh.KYC.NOM_CASE_RENT : null)],
                ['NOM_BENEFICIARIO','12',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_BENEFICIARIO) ? marsh.KYC.NOM_BENEFICIARIO : null)],
                ['NUM_NINOS','13',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NUM_NINOS) ? marsh.KYC.NUM_NINOS : null)],
                ['NOM_COCHE','14',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_COCHE) ? marsh.KYC.NOM_COCHE : null)],
                ['NOM_BANCO','25',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.NOM_BANCO) ? marsh.KYC.NOM_BANCO : null)],
                ['TIP_BANCO_ACCT','26',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.TIP_BANCO_ACCT) ? marsh.KYC.TIP_BANCO_ACCT : null)],
                ['COD_EMP_CLASS','27',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.COD_EMP_CLASS) ? marsh.KYC.COD_EMP_CLASS : null)],
                ['NOM_OTHER_ASSETS','98',marsh.riskDetails.validIDValue.toUpperCase(),marsh.riskDetails.validID,((marsh.KYC.COD_EMP_CLASS) ? marsh.KYC.COD_EMP_CLASS : null)]
              ];

    for(let i = 0; i < vars.length; i++){
      let a131temp = new A1000131_MPH();
      a131temp.codCampo = vars[i][0];
      a131temp.numSecu = vars[i][1];
      a131temp.codDocum = vars[i][2];
      a131temp.tipDocum = vars[i][3];
      a131temp.valCampo = vars[i][4];
      a131.push(a131temp);
    }

    return a131;
  }

  assignA2000260(marsh: Marsh){
    let a260 : A2000260[] = [];

    let vars = [
                ['FRM_CLAUOT','1','ALTERATIONS AND REPAIRS'],
                ['FRM_CLAUOT','2','ALL OTHER CONTENTS - LIMIT OF PHP 10,000'],
                ['FRM_CLAUOT','3','APPRAISEMENT AND LOSS INDEMNIFICATION CLAUSE - LIMIT OF PHP 50,000'],
                ['FRM_CLAUOT','4','AUTOMATIC EXTENSION OF PERIOD, SUBJECT TO ADDITIONAL PREMIUM (30 DAYS)'],
                ['FRM_CLAUOT','5','AUTOMATIC INCREASE CLAUSE (INCLUDING GATES AND FENCES) - 10% OF SUM INSURED, 90 DAYS SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','6','AUTOMATIC REINSTATEMENT OF SUM INSURED SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','7','AWNINGS, BLINDS AND OTHER OUTDOOR FIXTURES - UP TO PHP 20,000'],
                ['FRM_CLAUOT','8','BREACH OF CONDITIONS AND WARRANTIES'],
                ['FRM_CLAUOT','9','CANCELLATION'],
                ['FRM_CLAUOT','10','CAPITAL ADDITIONS (20% OF THE SUM INSURED OR 90 DAYS) SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','11','CLAIMS PREPARATION COSTS - PHP50,000 AGGREGATE'],
                ['FRM_CLAUOT','12','EXPEDITING EXPENSE - PHP100,000 AGGREGATE'],
                ['FRM_CLAUOT','13','EXTINGUISHMENT AND MITIGATION EXPENSE - UP TO PHP 100,000'],
                ['FRM_CLAUOT','14','INTERNAL REMOVAL'],
                ['FRM_CLAUOT','15','MINOR WORKS CLAUSE - UP TO PHP 500,000'],
                ['FRM_CLAUOT','16','NO CONTROL CLAUSE'],
                ['FRM_CLAUOT','17','OBSOLETE'],
                ['FRM_CLAUOT','18','PAIR AND SET'],
                ['FRM_CLAUOT','19','PROFESSIONAL FEES - UP TO PHP 100,000'],
                ['FRM_CLAUOT','20','PROTECTION AND PRESERVATION OF PROPERTY'],
                ['FRM_CLAUOT','21','RESTORATION OF RECORDS (PHP 5,000 PER DOCUMENT/PHP 50,000 PER OCCURRENCE AND ANNUAL AGGREGATE)'],
                ['FRM_CLAUOT','22','REMOVAL OF DEBRIS - UP TO P500,000'],
                ['FRM_CLAUOT','23','SALVAGE AND RECOVERIES'],
                ['FRM_CLAUOT','24','SUE AND LABOR - UP TO PHP100,000'],
                ['FRM_CLAUOT','25','TEMPORARY REMOVAL'],
                ['FRM_CLAUOT','26','TERRORISM & SABOTAGE EXCLUSION'],
                ['FRM_CLAUOT','27','E-RISK CYBER EXCLUSION'],
                ['FRM_CLAUOT','28','RESIDENTIAL OCCUPANCY WARRANTY'],
                ['FRM_CLAUOT','29','SANCTION LIMITATION AND EXCLUSION'],
                ['FRM_CLAUOT','30','TOTAL ASBESTOS EXCLUSION'],
                ['FRM_CLAUOT','31','COMMUNICABLE DISEASE EXCLUSION'],
                ['FRM_CLAUOT','32','PROPERTY DAMAGE CLARIFICATION CLAUSE'],
                ['FRM_CLAUOT','33',''],
                ['FRM_DEDUC','1','FIRE/LIGHTNING - NIL'],
                ['FRM_DEDUC','2','RIOT/STRIKE AND MALICIOUS DAMAGE - NIL'],
                ['FRM_DEDUC','3','EARTHQUAKE - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','4','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','5','TYPHOON - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','6','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','7','FLOOD - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','8','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','9','EXTENDED COVERAGE - 1% OF THE SUM INSURED ON THE AFFECTED ITEM MINIMUM OF PHP 1,000.00 AND MAXIMUM OF '],
                ['FRM_DEDUC','10','      PHP 500,000.00'],
                ['FRM_DEDUC','11','THIRD PARTY PROPERTY DAMAGE - PHP 5,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','12','BROAD WATER DAMAGE, BOWTAP - PHP 20,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','13','ROBBERY & BURGLARY - PHP 5,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','14','OTHER LOSSES - PHP 2,500.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','15','LOSS OF RENT/ALTERNATIVE ACCOMMODATION - 7 DAYS'],
                ['FRM_DEDUC','16','WORKS OF ART - 10% OF SI PER ITEM MINIMUM OF PHP5,000.00 EACH AND EVERY LOSS'],
                ['FRM_OTHCON','1','LIST OF ITEMS UNDER WORKS OF ART'],
                ['FRM_SUPPCB','1','EXTENSIONS'],
                ['FRM_SUPPCB','2','ROBBERY/BURGLARY (R/B) - 20% OF SI ON CONTENTS (IF APPLICABLE) OR PHP500,000 WHICHEVER IS LOWER'],
                ['FRM_SUPPCB','3','PLATE GLASS - PHP30,000 ANNUAL AGGREGATE'],
                ['FRM_SUPPCB','4','COMPREHENSIVE PERSONAL LIABILITY - PHP500,000 COMBINED SINGLE LIMIT FOR BODILY INJURY AND PROPERTY'],
                ['FRM_SUPPCB','5','                                   DAMAGE AND IN ANNUAL AGGREGATE'],
                ['FRM_SUPPCB','6','  - PREMISES LIABILITY'],
                ['FRM_SUPPCB','7','  - DEFENSE, SETTLEMENT, SUPPLEMENTARY PAYMENTS'],
                ['FRM_SUPPCB','8','  - FIRE LEGAL LIABILITY'],
                ['FRM_SUPPCB','9','FAMILY ACCIDENT INSURANCE'],
                ['FRM_SUPPCB','10','   COVERS THE PRINCIPAL INSURED INCLUDING THE SPOUSE (OR IF UNMARRIED , PARENTS NOT MORE THAN 65 YEARS OLD),'],
                ['FRM_SUPPCB','11','   AND CHILDREN (OR IF UNMARRIED AND DECEASED PARENTS,  SIBLINGS BELOW 21 YEARS OLD, IF NO CHILDREN). ALSO'],
                ['FRM_SUPPCB','12','   INCLUDED ARE THE HELPERS AND DRIVERS UP TO A MAXIMUM OF 3 PERSONS.'],
                ['FRM_SUPPCB','13','  - IF THE INSURED IS MARRIED:'],
                ['FRM_SUPPCB','14','     - HUSBAND & WIFE - PHP200,000'],
                ['FRM_SUPPCB','15','     - CHILDREN: MAXIMUM OF 2 AND AGED BELOW 21 YEARS - PHP100,000'],
                ['FRM_SUPPCB','16','     - HELPERS: MAXIMUM OF 3 - PHP40,000'],
                ['FRM_SUPPCB','17','     - BURIAL EXPENSE - 5% OF AD&D'],
                ['FRM_SUPPCB','18','  - IF THE INSURED IS SINGLE:'],
                ['FRM_SUPPCB','19','     - INSURED - PHP200,000'],
                ['FRM_SUPPCB','20','     - CHILDREN: MAXIMUM OF 2 AND AGED BELOW 21 YEARS - PHP100,000'],
                ['FRM_SUPPCB','21','     - PARENTS: MAXIMUM OF 2 AND SHOULD BE DEPENDENT AND LIVING WITH THE INSURED. '],
                ['FRM_SUPPCB','22','                AGE NOT MORE THAN 65 YEARS OLD - PHP100,000'],
                ['FRM_SUPPCB','23','     - SIBLINGS: MAXIMUM OF 2, AGED BELOW 21 YEARS AND SHOULD BE DEPENDENT AND LIVING WITH THE INSURED '],
                ['FRM_SUPPCB','24','                (IF NO CHILDREN AND NO PARENTS) - PHP100,000'],
                ['FRM_SUPPCB','25','     - HELPERS: MAXIMUM OF 3 - PHP40,000'],
                ['FRM_SUPPCB','26','     - BURIAL EXPENSE - 5% OF AD&D'],
                ['FRM_SUPPCB','27','REPLACEMENT OF LOCKS AND KEYS - PHP10,000 AGGREGATE'],
                ['FRM_SUPPCB','28','FREEZER CONTENTS - PHP5,000 AGGREGATE'],
                ['FRM_SUPPCB','29','ALTERNATIVE ACCOMMODATION/LOSS OF RENT - PHP25,000 PER MONTH, UP TO 6 MONTHS AND PHP150,000 IN AGGREGATE']
              ];

    if(marsh.propertyDetails.workOfArtsList.length > 0){
      let kog = ['FRM_OTHCON','1','LIST OF ITEMS UNDER WORKS OF ART'];
      vars.push(kog);

      for(let c = 0; c < marsh.propertyDetails.workOfArtsList.length; c++){
        let kogg = ['FRM_OTHCON',(c + 2).toString(),marsh.propertyDetails.workOfArtsList[c].workOfArtsDescription + " - " + marsh.propertyDetails.workOfArtsList[c].workOfArtsAmount];
        vars.push(kogg);
      }

    }

    for(let i = 0; i < vars.length; i++){
      let a260Temp = new A2000260();
      a260Temp.codAnexo = vars[i][0];
      a260Temp.numSecu = vars[i][1];
      a260Temp.texto = vars[i][2];
      a260.push(a260Temp);
    }

    return a260;
  }

  assignP2000260(marsh: Marsh){
    let p260 : A2000260[] = [];

    let vars = [['FRM_CLAUOT','1','ALTERATIONS AND REPAIRS'],
                ['FRM_CLAUOT','2','ALL OTHER CONTENTS - LIMIT OF PHP 10,000'],
                ['FRM_CLAUOT','3','APPRAISEMENT AND LOSS INDEMNIFICATION CLAUSE - LIMIT OF PHP 50,000'],
                ['FRM_CLAUOT','4','AUTOMATIC EXTENSION OF PERIOD, SUBJECT TO ADDITIONAL PREMIUM (30 DAYS)'],
                ['FRM_CLAUOT','5','AUTOMATIC INCREASE CLAUSE (INCLUDING GATES AND FENCES) - 10% OF SUM INSURED, 90 DAYS SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','6','AUTOMATIC REINSTATEMENT OF SUM INSURED SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','7','AWNINGS, BLINDS AND OTHER OUTDOOR FIXTURES - UP TO PHP 20,000'],
                ['FRM_CLAUOT','8','BREACH OF CONDITIONS AND WARRANTIES'],
                ['FRM_CLAUOT','9','CANCELLATION'],
                ['FRM_CLAUOT','10','CAPITAL ADDITIONS (20% OF THE SUM INSURED OR 90 DAYS) SUBJECT TO ADDITIONAL PREMIUM'],
                ['FRM_CLAUOT','11','CLAIMS PREPARATION COSTS - PHP50,000 AGGREGATE'],
                ['FRM_CLAUOT','12','EXPEDITING EXPENSE - PHP100,000 AGGREGATE'],
                ['FRM_CLAUOT','13','EXTINGUISHMENT AND MITIGATION EXPENSE - UP TO PHP 100,000'],
                ['FRM_CLAUOT','14','INTERNAL REMOVAL'],
                ['FRM_CLAUOT','15','MINOR WORKS CLAUSE - UP TO PHP 500,000'],
                ['FRM_CLAUOT','16','NO CONTROL CLAUSE'],
                ['FRM_CLAUOT','17','OBSOLETE'],
                ['FRM_CLAUOT','18','PAIR AND SET'],
                ['FRM_CLAUOT','19','PROFESSIONAL FEES - UP TO PHP 100,000'],
                ['FRM_CLAUOT','20','PROTECTION AND PRESERVATION OF PROPERTY'],
                ['FRM_CLAUOT','21','RESTORATION OF RECORDS (PHP 5,000 PER DOCUMENT/PHP 50,000 PER OCCURRENCE AND ANNUAL AGGREGATE)'],
                ['FRM_CLAUOT','22','REMOVAL OF DEBRIS - UP TO P500,000'],
                ['FRM_CLAUOT','23','SALVAGE AND RECOVERIES'],
                ['FRM_CLAUOT','24','SUE AND LABOR - UP TO PHP100,000'],
                ['FRM_CLAUOT','25','TEMPORARY REMOVAL'],
                ['FRM_CLAUOT','26','TERRORISM & SABOTAGE EXCLUSION'],
                ['FRM_CLAUOT','27','E-RISK CYBER EXCLUSION'],
                ['FRM_CLAUOT','28','RESIDENTIAL OCCUPANCY WARRANTY'],
                ['FRM_CLAUOT','29','SANCTION LIMITATION AND EXCLUSION'],
                ['FRM_CLAUOT','30','TOTAL ASBESTOS EXCLUSION'],
                ['FRM_CLAUOT','31','COMMUNICABLE DISEASE EXCLUSION'],
                ['FRM_CLAUOT','32','PROPERTY DAMAGE CLARIFICATION CLAUSE'],
                ['FRM_CLAUOT','33',''],
                ['FRM_DEDUC','1','FIRE/LIGHTNING - NIL'],
                ['FRM_DEDUC','2','RIOT/STRIKE AND MALICIOUS DAMAGE - NIL'],
                ['FRM_DEDUC','3','EARTHQUAKE - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','4','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','5','TYPHOON - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','6','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','7','FLOOD - 2% OF THE ACTUAL CASH VALUE OF THE AFFECTED ITEM AT THE TIME OF LOSS PER CLAIM OR SERIES OF CLAIMS '],
                ['FRM_DEDUC','8','      ARISING OUT OF ONE OCCASION'],
                ['FRM_DEDUC','9','EXTENDED COVERAGE - 1% OF THE SUM INSURED ON THE AFFECTED ITEM MINIMUM OF PHP 1,000.00 AND MAXIMUM OF '],
                ['FRM_DEDUC','10','      PHP 500,000.00'],
                ['FRM_DEDUC','11','THIRD PARTY PROPERTY DAMAGE - PHP 5,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','12','BROAD WATER DAMAGE, BOWTAP - PHP 20,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','13','ROBBERY & BURGLARY - PHP 5,000.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','14','OTHER LOSSES - PHP 2,500.00 FOR EACH AND EVERY LOSS'],
                ['FRM_DEDUC','15','LOSS OF RENT/ALTERNATIVE ACCOMMODATION - 7 DAYS'],
                ['FRM_DEDUC','16','WORKS OF ART - 10% OF SI PER ITEM MINIMUM OF PHP5,000.00 EACH AND EVERY LOSS'],
                ['FRM_OTHCON','1','LIST OF ITEMS UNDER WORKS OF ART'],
                ['FRM_SUPPCB','1','EXTENSIONS'],
                ['FRM_SUPPCB','2','ROBBERY/BURGLARY (R/B) - 20% OF SI ON CONTENTS (IF APPLICABLE) OR PHP500,000 WHICHEVER IS LOWER'],
                ['FRM_SUPPCB','3','PLATE GLASS - PHP30,000 ANNUAL AGGREGATE'],
                ['FRM_SUPPCB','4','COMPREHENSIVE PERSONAL LIABILITY - PHP500,000 COMBINED SINGLE LIMIT FOR BODILY INJURY AND PROPERTY'],
                ['FRM_SUPPCB','5','                                   DAMAGE AND IN ANNUAL AGGREGATE'],
                ['FRM_SUPPCB','6','  - PREMISES LIABILITY'],
                ['FRM_SUPPCB','7','  - DEFENSE, SETTLEMENT, SUPPLEMENTARY PAYMENTS'],
                ['FRM_SUPPCB','8','  - FIRE LEGAL LIABILITY'],
                ['FRM_SUPPCB','9','FAMILY ACCIDENT INSURANCE'],
                ['FRM_SUPPCB','10','   COVERS THE PRINCIPAL INSURED INCLUDING THE SPOUSE (OR IF UNMARRIED , PARENTS NOT MORE THAN 65 YEARS OLD),'],
                ['FRM_SUPPCB','11','   AND CHILDREN (OR IF UNMARRIED AND DECEASED PARENTS,  SIBLINGS BELOW 21 YEARS OLD, IF NO CHILDREN). ALSO'],
                ['FRM_SUPPCB','12','   INCLUDED ARE THE HELPERS AND DRIVERS UP TO A MAXIMUM OF 3 PERSONS.'],
                ['FRM_SUPPCB','13','  - IF THE INSURED IS MARRIED:'],
                ['FRM_SUPPCB','14','     - HUSBAND & WIFE - PHP200,000'],
                ['FRM_SUPPCB','15','     - CHILDREN: MAXIMUM OF 2 AND AGED BELOW 21 YEARS - PHP100,000'],
                ['FRM_SUPPCB','16','     - HELPERS: MAXIMUM OF 3 - PHP40,000'],
                ['FRM_SUPPCB','17','     - BURIAL EXPENSE - 5% OF AD&D'],
                ['FRM_SUPPCB','18','  - IF THE INSURED IS SINGLE:'],
                ['FRM_SUPPCB','19','     - INSURED - PHP200,000'],
                ['FRM_SUPPCB','20','     - CHILDREN: MAXIMUM OF 2 AND AGED BELOW 21 YEARS - PHP100,000'],
                ['FRM_SUPPCB','21','     - PARENTS: MAXIMUM OF 2 AND SHOULD BE DEPENDENT AND LIVING WITH THE INSURED. '],
                ['FRM_SUPPCB','22','                AGE NOT MORE THAN 65 YEARS OLD - PHP100,000'],
                ['FRM_SUPPCB','23','     - SIBLINGS: MAXIMUM OF 2, AGED BELOW 21 YEARS AND SHOULD BE DEPENDENT AND LIVING WITH THE INSURED '],
                ['FRM_SUPPCB','24','                (IF NO CHILDREN AND NO PARENTS) - PHP100,000'],
                ['FRM_SUPPCB','25','     - HELPERS: MAXIMUM OF 3 - PHP40,000'],
                ['FRM_SUPPCB','26','     - BURIAL EXPENSE - 5% OF AD&D'],
                ['FRM_SUPPCB','27','REPLACEMENT OF LOCKS AND KEYS - PHP10,000 AGGREGATE'],
                ['FRM_SUPPCB','28','FREEZER CONTENTS - PHP5,000 AGGREGATE'],
                ['FRM_SUPPCB','29','ALTERNATIVE ACCOMMODATION/LOSS OF RENT - PHP25,000 PER MONTH, UP TO 6 MONTHS AND PHP150,000 IN AGGREGATE']];

    if(marsh.propertyDetails.workOfArtsList.length > 0){

      for(let c = 0; c < marsh.propertyDetails.workOfArtsList.length; c++){
        let kogg = ['FRM_OTHCON',(c + 1).toString(),marsh.propertyDetails.workOfArtsList[c].workOfArtsValues + ":=:" + marsh.propertyDetails.workOfArtsList[c].workOfArtsDescription + ":=:" + marsh.propertyDetails.workOfArtsList[c].workOfArtsAmount];
        vars.push(kogg);
      }

    }

    for(let i = 0; i < vars.length; i++){
      let p260Temp = new A2000260();
      p260Temp.codAnexo = vars[i][0];
      p260Temp.numSecu = vars[i][1];
      p260Temp.texto = vars[i][2];
      p260.push(p260Temp);
    }

    return p260;
  }

  assignP2000020(marsh: Marsh){
    let p2020 : P2000020[] = [];

    let vars = [
                ['COD_MARCA',marsh.motorDetails.manufacturerId],
                ['COD_MODELO',marsh.motorDetails.modelId],
                ['NUM_MOTOR',((marsh.motorDetails.motorNumber) ? marsh.motorDetails.motorNumber.toUpperCase() : "")],
                ['COD_TIP_VEHI',marsh.motorDetails.vehicleTypeId],
                ['ANIO_SUB_MODELO',marsh.motorDetails.modelYear],
                ['COD_SUB_MODELO',marsh.motorDetails.subModelId],
                ['COD_USO_VEHI',marsh.motorDetails.vehicleUsedId],
                ['NUM_SERIAL',((marsh.motorDetails.serialNumber) ? marsh.motorDetails.serialNumber.toUpperCase() : "")],
                ['COD_AREA_USAGE',marsh.motorDetails.usageAreaId],
                ['COD_COLOR',marsh.motorDetails.colorId],
                ['NUM_MATRICULA',((marsh.motorDetails.plateNumber) ? marsh.motorDetails.plateNumber.toUpperCase() : "")],
                ['NUM_CONDUCTION',((marsh.motorDetails.conductionNumber) ? marsh.motorDetails.conductionNumber.toUpperCase():"")],
                ['NUM_MV_FILE',((marsh.motorDetails.MVFileNumber) ? marsh.motorDetails.MVFileNumber.toUpperCase() : "")],
                ['VAL_SUB_MODELO',marsh.motorDetails.FMV],
                ['NOM_RECEIVED_BY','TPL01101'],
                ['FEC_RECEIVED',m().format('M/D/YYYY')],
                ['COD_MODALIDAD',marsh.productId],
                ['MCA_COVER_NOTE','N'],
                ['MCA_OWNER','S'],
                ['MCA_DRIVER','S'],
                ['MCA_ASSIGNEE','N'],
                ['MCA_PREPAID_PREM','N'],
                ['MCA_GLASS_ETCHING','N'],
                ['VAL_ASEG_POR_PASAJERO','100000'],
                ['PCT_SRCC_FINAL_RATE','0']
              ];

    

    if(marsh.productId == "10002"){
        let tep1 = ['TIP_COCAF_REGISTRATION','R'];
        let tep2 = ['MCA_AUTO_REGISTRO','N'];
        vars.push(tep1); 
        vars.push(tep2); 
    }

    if(marsh.motorDetails.isMortgaged){
        let tep1 = ['TIP_MORT_CLAUSE','1'];
        let tep2 = ['MCA_MORTGAGED','S'];
        
        vars.push(tep1); 
        vars.push(tep2); 
    }else{
        let tep1 = ['TIP_MORT_CLAUSE','0'];
        let tep2 = ['MCA_MORTGAGED','N'];
        vars.push(tep1); 
        vars.push(tep2); 
    }

    if(marsh.lineId == "337"){
      vars = [
              ['COD_MODALIDAD',marsh.productId],
              ['NUM_INSURED', '1']
              ];
    }

    if(marsh.lineId == "251"){
      let building = marsh.propertyDetails.buildingDetails;

      vars = [
              ['COD_ATC_CONST','3'],
              ['COD_ATC_OCCUP','1'],
              ['COD_CRESTA_ZONE','1'],
              ['COD_DESC_TARIFF','4'],
              ['COD_DISTRICT',building.codDistrict],
              ['COD_MODALIDAD','20008'],
              ['COD_MUNICIPALITY',building.codMunicipality],
              ['COD_PROVINCE',building.codProvince],
              ['COD_REGION',building.codRegion],
              ['COD_SUBLINE','1'],
              ['COD_SUB_SUBCLASS','1'],
              ['COD_ZONE_TARIFF','2'],
              ['MCA_CLAIMS_RELATED','N'],
              ['MCA_CONDOMINIUM','Y'],
              ['TXT_BUILDING_NAME',building.txtDescription.slice(0,30)],
              ['MCA_VIOLADO','S'],
              ['NUM_BLOCK_DISTRICT',building.numBlockDistrict],
              ['NUM_ZIPCODE',building.numZipcode],
              ['NUM_HOUSE_LOCATION',marsh.propertyDetails.unitNumber],
              ['PCT_DISCOUNT','0'],
              ['TIP_CONSTRUCTION','A'],
              ['TXT_BOUNDARY_DESC1',building.txtBoundaryDesc1.slice(0,79)],
              ['TXT_BOUNDARY_DESC1_1',building.txtBoundaryDesc1.slice(79)],
              ['TXT_BOUNDARY_DESC2',building.txtBoundaryDesc2.slice(0,79)],
              ['TXT_BOUNDARY_DESC2_1',building.txtBoundaryDesc2.slice(79)],
              ['TXT_BOUNDARY_DESC3',building.txtBoundaryDesc3.slice(0,79)],
              ['TXT_BOUNDARY_DESC3_1',building.txtBoundaryDesc3.slice(79)],
              ['TXT_BOUNDARY_DESC4',building.txtBoundaryDesc4.slice(0,79)],
              ['TXT_BOUNDARY_DESC4_1',building.txtBoundaryDesc4.slice(79)],
              ['TXT_CONSTRUCTION_BUILDING',building.txtConstructionBuilding.slice(0,79)],
              ['TXT_CONSTRUCTION_BUILDING2',building.txtConstructionBuilding.slice(79,159)],
              ['TXT_CONSTRUCTION_BUILDING3',building.txtConstructionBuilding.slice(159)],
              ['TXT_OCCUPANCY_BUILDING',building.txtOccupancyBuilding],
              ['VAL_ACC_CARD','0'],
              ['TXT_LATITUDE',building.txtLatitude],
              ['TXT_LONGITUDE',building.txtLongitude],
              ['TXT_STREET_NAME',building.txtStreetName],
              ['TXT_VILLAGE_SUBDIVISION',building.txtVillage],
              ['TXT_BARANGAY',building.txtBarangay],
              ['NUM_OTHERS_7326','2'],
              ['NUM_OTHERS_7513','3'],
              ['NUM_OTHERS_7104',marsh.propertyDetails.workOfArtsList.length.toString()]
              ];

      if(marsh.riskDetails.underTaking){
        let tep1 = ['MCA_WARR_NO_LOSS','S'];
        vars.push(tep1); 
      }else{
        let tep1 = ['MCA_WARR_NO_LOSS','N'];
        vars.push(tep1); 
      }

    }

    if(marsh.alternativeHolders.length > 0){

        let kogg = ['NUM_ASEG_ALT','1']; 
        vars.push(kogg);

      marsh.alternativeHolders.forEach(function(alt){
        // let kog = ['TIP_ASEG_PREF','0'];
        if(alt.prefix){
          let kog = ['TIP_ASEG_PREF',alt.prefix]; 
          vars.push(kog);
        }
        
        

      });

    }

    for(let i = 0; i < vars.length; i++){
      let p20temp = new P2000020();
      p20temp.codCampo = vars[i][0];
      p20temp.valCampo = vars[i][1];
      p2020.push(p20temp);
    }

    return p2020;
  }

  assignP1001331(marsh: Marsh){
    let p1331 : P1001331 = new P1001331();

    p1331.nomTercero = marsh.riskDetails.firstName.toUpperCase();
    p1331.nom2Tercero = ((marsh.riskDetails.middleName) ? marsh.riskDetails.middleName.toUpperCase() : null);
    p1331.ape2Tercero = ((marsh.riskDetails.lastName) ? marsh.riskDetails.lastName.toUpperCase() : null);
    p1331.mcaSexo = ((marsh.riskDetails.gender) ? marsh.riskDetails.gender : null);
    p1331.codPais = ("PHL");
    p1331.codPaisCom = ("PHL");

    p1331.codProv =  ((marsh.riskDetails.homeAddress.provinceDetailId) ? marsh.riskDetails.homeAddress.provinceDetailId : null);
    p1331.codProvCom = ((marsh.riskDetails.officeAddress.provinceDetailId) ? marsh.riskDetails.officeAddress.provinceDetailId : null);
    p1331.codProvEtiqueta = ((marsh.riskDetails.correspondentAddress.provinceDetailId) ? marsh.riskDetails.correspondentAddress.provinceDetailId : null);

    p1331.codLocalidad = ((marsh.riskDetails.homeAddress.municipalityDetailId) ? marsh.riskDetails.homeAddress.municipalityDetailId : null);
    p1331.codLocalidadCom = ((marsh.riskDetails.officeAddress.municipalityDetailId) ? marsh.riskDetails.officeAddress.municipalityDetailId : null);
    p1331.codLocalidadEtiqueta = ((marsh.riskDetails.correspondentAddress.municipalityDetailId) ? marsh.riskDetails.correspondentAddress.municipalityDetailId : null);

    p1331.nomDomicilio1 = ((marsh.riskDetails.homeAddress.addressDetails) ? marsh.riskDetails.homeAddress.addressDetails.slice(0,39) : null);
    p1331.nomDomicilio2 = ((marsh.riskDetails.homeAddress.addressDetails) ? marsh.riskDetails.homeAddress.addressDetails.slice(39,78) : null);
    p1331.nomDomicilio3 = ((marsh.riskDetails.homeAddress.addressDetails) ? marsh.riskDetails.homeAddress.addressDetails.slice(78) : null);
    p1331.nomDomicilio1Com = ((marsh.riskDetails.officeAddress.addressDetails) ? marsh.riskDetails.officeAddress.addressDetails : null);

    p1331.codPostal = ((marsh.riskDetails.homeAddress.zipCode) ? marsh.riskDetails.homeAddress.zipCode : null);
    p1331.codPostalCom = ((marsh.riskDetails.officeAddress.zipCode) ? marsh.riskDetails.officeAddress.zipCode : null);
    p1331.codPostalEtiqueta = ((marsh.riskDetails.correspondentAddress.zipCode) ? marsh.riskDetails.correspondentAddress.zipCode : null);

    p1331.tipEtiqueta = marsh.riskDetails.mailingAddressId; 
    p1331.tlfMovil = marsh.riskDetails.phoneNumber; 
    p1331.txtEmail = ((marsh.riskDetails.emailAddress) ? marsh.riskDetails.emailAddress.toUpperCase() : "");
    p1331.codDocum = marsh.riskDetails.validIDValue.toUpperCase();
    p1331.tipDocum = marsh.riskDetails.validID;
    // p1331.tipEtiqueta = '2';
    p1331.fecNacimiento = m(marsh.riskDetails.birthDate).format('M/D/YYYY');
    p1331.tipSufijoNombre = marsh.riskDetails.suffix;
    p1331.codEstCivil = marsh.riskDetails.civilStatus;
    p1331.codNacionalidad = marsh.riskDetails.nationality;

    let fisico = "S";
    if(marsh.motorDetails.isCorporate == "2"){
      fisico = "N";
    }

    p1331.mcaFisico = fisico;

    return p1331;
  }

  assignP2000031PA(marsh: Marsh, p2030: P2000030){

    let p2031final : P2000031[] = [];

    for(let i = 0; i < marsh.paDetails.familyMembers.length + 1; i++){

      let p2031 : P2000031 = new P2000031();

      p2031.codCia = p2030.codCia;
      p2031.numPoliza = p2030.numPoliza;
      p2031.numSpto = p2030.numSpto;
      p2031.numApli = p2030.numApli;
      p2031.numSptoApli = p2030.numSptoApli;
      p2031.numRiesgo = (i + 1).toString();
      p2031.tipSpto = "XX";
      p2031.codModalidad = marsh.productId;
      p2031.nomRiesgo = "XX";
      p2031.fecEfecRiesgo = p2030.fecEfecPoliza;
      p2031.fecVctoRiesgo = p2030.fecVctoPoliza;
      p2031.mcaBajaRiesgo = "N";
      p2031.mcaVigente = "S";
      p2031.mcaExclusivo = null;
      p2031.codUsrExclusivo = null;
      p2031.numCertificado = null;
      p2031.nomCertificado = null;

      p2031final.push(p2031);

    }

    return p2031final;

  }

  assignP2000031(marsh: Marsh, p2030: P2000030){

    let p2031 : P2000031 = new P2000031();

    p2031.codCia = p2030.codCia;
    p2031.numPoliza = p2030.numPoliza;
    p2031.numSpto = p2030.numSpto;
    p2031.numApli = p2030.numApli;
    p2031.numSptoApli = p2030.numSptoApli;
    p2031.numRiesgo = '1';
    p2031.tipSpto = "XX";
    p2031.codModalidad = marsh.productId;
    p2031.nomRiesgo = "XX";
    p2031.fecEfecRiesgo = p2030.fecEfecPoliza;
    p2031.fecVctoRiesgo = p2030.fecVctoPoliza;
    p2031.mcaBajaRiesgo = "N";
    p2031.mcaVigente = "S";
    p2031.mcaExclusivo = null;
    p2031.codUsrExclusivo = null;
    p2031.numCertificado = null;
    p2031.nomCertificado = null;

    return p2031;

  }

  assignP2000030(marsh: Marsh){

    let p2030 : P2000030 = new P2000030();

    p2030.codAgt = 1069;
    p2030.numPolizaGrupo = '119';
    p2030.numContrato = 11900;
    p2030.numSubcontrato = 11900;
    p2030.codNivel3 = 4003;
    p2030.codCia = 1;
    p2030.codFraccPago = 1;
    p2030.codSector = 1;
    p2030.codRamo = parseInt(marsh.lineId);
    p2030.fecVctoPoliza = m(marsh.motorDetails.policyPeriodTo).format('M/D/YYYY');
    p2030.fecEfecPoliza = m(marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY');
    p2030.numPoliza = marsh.quotationNumber;
    p2030.numPresupuesto = marsh.quotationNumber;
    p2030.numSpto = 0;
    p2030.numApli = 0;
    p2030.numSptoApli = 0;
    p2030.fecEmisionSpto = "";
    p2030.fecEfecSpto = p2030.fecEfecPoliza;
    p2030.fecVctoSpto = p2030.fecVctoPoliza;
    p2030.tipDuracion = 1;
    p2030.numRiesgos = 1;
    p2030.codMon = 1;
    p2030.cantRenovaciones = 0;
    p2030.numRenovaciones = 0;
    p2030.tipCoaseguro = 0;
    p2030.tipSpto = ("XX");
    p2030.txtMotivoSpto = ("");

    if(marsh.lineId == "251" && marsh.riskDetails.underTaking){
      p2030.txtMotivoSpto = ("WARRANTED NO LOSS");
    }

    p2030.tipDocum = marsh.riskDetails.validID;
    p2030.codDocum = ((marsh.riskDetails.validIDValue) ? marsh.riskDetails.validIDValue.toUpperCase() : "");
    p2030.codCuadroCom = 1; // function hardcoded
    p2030.pctAgt = 100;
    p2030.codCompensacion = 1;
    p2030.tipGestor = ("AG");
    p2030.codGestor = (p2030.codAgt + "");
    p2030.mcaRegulariza = "N";
    p2030.tipRegulariza = ('0' + "");
    p2030.mcaReaseguroManual = ("N");
    p2030.mcaProrrata = ("S");
    p2030.mcaPrimaManual = ("N");
    p2030.mcaProvisional = ("N");
    p2030.mcaPolizaAnulada = ("N");
    p2030.mcaSptoAnulado = ("N");
    p2030.fecSptoAnulado = (p2030.fecVctoPoliza);
    p2030.mcaSptoTmp = ("N");
    p2030.mcaDatosMinimos = ("N");
    p2030.mcaImpresion = ("N");
    p2030.mcaExclusivo = ("N");
    p2030.codUsr = 'TPL01101';
    p2030.codNivel3Captura = 9201;
    p2030.fecActu = m().format('M/D/YYYY');
    p2030.mcaReaseguroMarco = ("N");
    p2030.tipPolizaTr = ("N");
    p2030.tipRea = '0';
    p2030.numSecuGrupo = null;
    p2030.fecValidez = marsh.motorDetails.validityDate;

    if(marsh.lineId == "337"){
      p2030.codSector = 3;
      p2030.numSubcontrato = 10000;
      p2030.fecValidez = '01012020';
    }

    if(marsh.lineId == "251"){
      p2030.codSector = 2;
      p2030.numSubcontrato = 10000;
      p2030.fecValidez = '01012018';
      p2030.mcaReaseguroManual = 'S';
    }

    return p2030;

  }

}
