import {
  Injectable
} from '@angular/core';
import * as m from 'moment';
import {
  BehaviorSubject
} from 'rxjs/internal/BehaviorSubject';
import {
  AuthService
} from '../services/auth.service';
import {
  CommonService
} from '../services/common.service';
import {
  Affinity
} from '../objects/affinity';
import {
  Risk
} from '../objects/risk';
import {
  Coverages
} from '../objects/coverages';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PersonalAccidentIssuanceService {

  constructor(private caller: AuthService,
    private commonService: CommonService) {}

  paAff: Affinity = new Affinity();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  mapRetrieveQuote(affinity: Affinity, result) {
    this.paAff = new Affinity();

    this.paAff = affinity;

    this.paAff.quotationNumber = result.p2000030.numPoliza;
    this.generalMapping(result);

    this.paAff.productId = this.commonService.getP20Value(result.p2000020List, 'COD_MODALIDAD');

    let fisico = "1";

    if (result.p1001331.mcaFisico == "N") {
      fisico = "2";
    }

    this.paAff.motorDetails.isCorporate = fisico;

    this.mapP2025Primary(result.p2000025List);

    this.commonService.getCoverageByPolicy("P", this.paAff.quotationNumber, this.paAff.lineId).subscribe(
      (resulta) => {
        // this.paAff.coveragesValue = resulta;

        this.mapP2025Insured(result.p2000025List, resulta);

        for (let i = 0; i < resulta.length; i++) {

          if (resulta[i].numRiesgo == "1") {
            // resulta[i].sumaAseg = this.formatter.format(parseFloat(resulta[i].sumaAseg));
            resulta[i].numSecu = parseInt(resulta[i].numSecu) + 0;
            resulta[i].totalPremium = ((resulta[i].totalPremium) ? this.formatter.format(parseFloat(resulta[i].totalPremium)) : "INCL");
            this.paAff.coveragesValue.push(resulta[i]);
          }

        }

        this.paAff.coveragesValue = _.orderBy(this.paAff.coveragesValue, 'numSecu', 'asc');

      });

    // this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", "personalAccident").subscribe(
    //   coverages => {
    //     this.coverageList = [];
    //     let coverageHolder = coverages;
    //     for (let c in coverageHolder) {
    //       for (let d in coverageHolder[c]) {
    //         this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
    //         this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
    //       }
    //       this.coverageList.push(this.coverage);
    //       this.coverage = new Coverages();
    //     }

    //     this.paAff.coverages = this.coverageList;
    //   });

    this.commonService.viewCoverage(this.paAff.productId).subscribe(
      (result: any) => {
        if (!_.isEmpty(result)) {
          this.coverageList = result;
          this.paAff.coverages = result;
        }
      }
    );

    let ret: any = new BehaviorSubject < any > ([]);

    this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + this.paAff.quotationNumber + '&type=C', null).subscribe(
      paymentBreakdown => {
        this.paAff.premiumBreakdown = paymentBreakdown;
        ret.next(this.paAff);
      });

    return ret.asObservable();
  }

  mapRetrievePolicy(affinity: Affinity, result) {
    this.paAff = new Affinity();

    this.paAff = affinity;

    this.paAff.policyNumber = result.p2000030.numPoliza;
    this.generalMapping(result);

    this.paAff.productId = this.commonService.getP20Value(result.a2000020List, 'COD_MODALIDAD');

    let fisico = "1";

    if (result.p1001331.mcaFisico == "N") {
      fisico = "2";
    }

    this.paAff.motorDetails.isCorporate = fisico;

    // this.mapP2025Primary(result.p2000025List);

    this.commonService.getCoverageByPolicy("A", this.paAff.policyNumber, this.paAff.lineId).subscribe(
      (resulta) => {
        this.mapP2025Insured(result.a2000025List, resulta);

        for (let i = 0; i < resulta.length; i++) {
          if (resulta[i].numRiesgo == "1") {
            // resulta[i].sumaAseg = this.formatter.format(parseFloat(resulta[i].sumaAseg));
            resulta[i].numSecu = parseInt(resulta[i].numSecu) + 0;
            resulta[i].totalPremium = ((resulta[i].totalPremium) ? this.formatter.format(parseFloat(resulta[i].totalPremium)) : "INCL");
            this.paAff.coveragesValue.push(resulta[i]);
          }
        }

        this.paAff.coveragesValue = _.orderBy(this.paAff.coveragesValue, 'numSecu', 'asc');
      });

    // this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", "personalAccident").subscribe(
    //   coverages => {
    //     this.coverageList = [];
    //     let coverageHolder = coverages;
    //     for (let c in coverageHolder) {
    //       for (let d in coverageHolder[c]) {
    //         this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
    //         this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
    //       }
    //       this.coverageList.push(this.coverage);
    //       this.coverage = new Coverages();
    //     }

    //     this.paAff.coverages = this.coverageList;
    //   });

    this.commonService.viewCoverage(this.paAff.productId).subscribe(
      (result: any) => {
        if (!_.isEmpty(result)) {
          this.coverageList = result;
          this.paAff.coverages = result;
        }
      }
    );

    let ret: any = new BehaviorSubject < any > ([]);

    this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + this.paAff.policyNumber + '&type=P', null).subscribe(
      paymentBreakdown => {
        this.paAff.premiumBreakdown = paymentBreakdown;
        ret.next(this.paAff);
      });

    return ret.asObservable();
  }

  generalMapping(result) {
    this.paAff.riskDetails.firstName = result.fName;
    this.paAff.riskDetails.middleName = result.mName;
    this.paAff.riskDetails.lastName = result.lName;

    this.paAff.riskDetails.fullName = this.paAff.riskDetails.lastName + ", " + this.paAff.riskDetails.firstName + " " + this.paAff.riskDetails.middleName;

    this.paAff.riskDetails.validIDValue = result.codDoc;
    this.paAff.riskDetails.validID = result.tipDoc;
    this.paAff.riskDetails.phoneNumber = result.mobileNumber;
    this.paAff.riskDetails.emailAddress = result.email;
    this.paAff.riskDetails.birthDate = m(result.birthdate).format('YYYY-MM-DD');
    this.paAff.riskDetails.suffix = result.suffix;
    this.paAff.riskDetails.gender = result.p1001331.mcaSexo;
    this.paAff.riskDetails.nationality = result.p1001331.codPais;
    this.paAff.riskDetails.civilStatus = result.p1001331.codEstCivil;
    this.paAff.lineId = result.p2000030.codRamo;
    this.paAff.motorDetails.policyPeriodFrom = m(result.inceptionDate).format('YYYY-MM-DD');
    this.paAff.motorDetails.policyPeriodTo = m(result.expiryDate).format('YYYY-MM-DD');

    this.paAff.address1 = result.address1;
    this.paAff.municipality = result.municipality;
    this.paAff.province = result.province;
    this.paAff.zipCode = result.zipCode;
  }

  mapP2025Primary(p2025) {

    for (let i = 0; i < p2025.length; i++) {

      if (p2025[i].numRiesgo == "1") {

        switch (p2025[i].codCampo) {
          case "COD_OCCUPATIONAL_CLASS":
            this.paAff.riskDetails.occupationalClass = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
            this.chooseOccupationalClass(p2025[i].valCampo);
            break;
          case "TXT_OCCUPATION":
            this.paAff.riskDetails.occupation = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
            break;
          case "TXT_HEALTH_DECLARA":
            let healthDec = true;
            if (p2025[i].valCampo == "N") {
              healthDec = false;
            }
            this.paAff.riskDetails.healthDeclaration = healthDec;
            break;
          case "NOM_RELIGION":
            this.paAff.riskDetails.religion = p2025[i].valCampo;
            break;
        }

      }

    }

  }

  mapP2025Insured(p2025, p2040) {
    this.paAff.paDetails.familyMembers = [];
    for (let x = 1; x < (_.maxBy(p2025, 'numRiesgo')).numRiesgo; x++) {

      let riskTemp: Risk = new Risk();

      for (let i = 0; i < p2025.length; i++) {

        if (p2025[i].numRiesgo == (x + 1)) {
          switch (p2025[i].codCampo) {
            case "COD_OCCUPATIONAL_CLASS":
              riskTemp.occupationalClass = "";
              if (p2025[i].valCampo) {
                riskTemp.occupationalClass = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
              }
              break;
            case "TXT_OCCUPATION":
              riskTemp.occupation = "";
              if (p2025[i].valCampo) {
                riskTemp.occupation = p2025[i].valCampo + ":=:" + p2025[i].txtCampo;
              }
              break;
            case "TXT_HEALTH_DECLARA":
              let healthDec = true;
              if (p2025[i].valCampo == "N") {
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
              if (p2025[i].valCampo == "F") {
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

      for (let c = 0; c < p2040.length; c++) {
        if (p2040[c].numRiesgo == (x + 1)) {
          // p2040[c].sumaAseg = this.formatter.format(parseFloat(p2040[c].sumaAseg));
          // p2040[c].totalPremium = this.formatter.format(parseFloat((p2040[c].totalPremium) ? p2040[c].totalPremium : "0"));
          p2040[c].totalPremium = "INCL";
          riskTemp.coveragesValue.push(p2040[c]);
        }
      }

      riskTemp.coveragesValue = _.orderBy(riskTemp.coveragesValue, 'codCob', 'desc');

      riskTemp.fullName = riskTemp.lastName + ", " + riskTemp.firstName + " " + (riskTemp.middleName ? riskTemp.middleName : "");

      this.paAff.paDetails.familyMembers.push(riskTemp);

    }

  }

  chooseOccupationalClass(occClass) {
    this.caller.getLOV("G2990006", "13", "COD_RAMO~337|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012020|DVCOD_OCCUPATIONAL_CLASS~" + occClass + "|COD_IDIOMA~EN").subscribe(
      result => {
        this.paAff.lov.occupationLOV = result;
      });
  }

}
