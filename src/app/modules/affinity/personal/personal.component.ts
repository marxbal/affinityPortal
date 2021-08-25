import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {
  IsRequired
} from '../../../guard/is-required';
import {
  Affinity
} from '../../../objects/affinity';
import {
  Risk
} from '../../../objects/risk';
import {
  P2000020
} from '../../../objects/p2000020';
import {
  P2000025
} from '../../../objects/p2000025';
import {
  P2000030
} from '../../../objects/p2000030';
import {
  P2000040
} from '../../../objects/p2000040';
import {
  P2000031
} from '../../../objects/p2000031';
import {
  P1001331
} from '../../../objects/p1001331';
import {
  P2100610
} from '../../../objects/p2100610';
import {
  P2000060
} from '../../../objects/p2000060';
import {
  A2000260
} from '../../../objects/a2000260';
import {
  Coverages
} from '../../../objects/coverages';
import {
  AuthService
} from '../../../services/auth.service';
import {
  CommonService
} from '../../../services/common.service';
import * as m from 'moment';
import Swal from 'sweetalert2';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import * as _ from 'lodash';
import {
  ACCIDENT,
  CAR
} from 'src/app/objects/line';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private checker: IsRequired,
    private common: CommonService,
    private spinner: NgxSpinnerService,
  ) {}

  @Input() affinity: Affinity;
  @Input() backButton: String;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  @Input() product: string;
  @Input() description: String;

  familyMember: Risk = new Risk();
  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000025: P2000025[] = [];
  p2000060: P2000060[] = [];
  a2000260: A2000260[] = [];
  p1001331List: P1001331[] = [];
  p2000031: P2000031 = new P2000031();
  p2000031List: P2000031[] = [];
  p1001331: P1001331 = new P1001331();
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();
  title: String = "";
  line: number = 1;

  addFamily: string = "";
  loadType: string = "";
  showAddButton: String = "1";
  showAll: String = "0";

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  type = {
    car: CAR,
    accident: ACCIDENT
  }

  ngOnInit() {
    console.log(this.affinity);
    this.selectProduct(this.product, this.description);

    this.affinity.motorDetails.reCompute = "0";

    this.line = this.common.getLinebySubline(this.affinity.lineId);
    if (this.line != ACCIDENT) {
      this.showAll = "1";
    }

    this.spinner.show();

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.affinity.lov.suffixLOV = result;
      });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        this.affinity.lov.documentLOV = result;
      });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.affinity.lov.civilStatusLOV = result;
      });

    this.caller.getLOV("A1000101", "1", "").subscribe(
      result => {
        this.affinity.lov.nationalityLOV = result;
        this.spinner.hide();
      });

    this.affinity.riskDetails.nationality = "PHL";

  }

  selectProduct(product, description) {

    this.affinity.productId = product;
    // this.viewCoverage(description, '');
    this.showAll = "1";

    this.common.sleep(1000).then(() => {
      this.common.scrollToElement("showAll", 500);
    });

    $("#compreCard").removeClass("card-shadow");
    $("#ctplCard").removeClass("card-shadow");

    if (this.affinity.productId == "32301") {
      $("#compreCard").addClass("card-shadow");
    } else {
      $("#ctplCard").addClass("card-shadow");
    }

    this.line = this.common.getLinebySubline(this.affinity.lineId);
    // if (this.affinity.lineId == "337" || this.affinity.lineId == "251") {
    if (this.line == ACCIDENT) {
      this.affinity.motorDetails.isCorporate = "1";
      this.affinity.riskDetails.civilStatus = "";
      this.affinity.riskDetails.accidentCoverageLimit = "250000";
      this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
      this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

      this.caller.getLOV(
        "G2990006",
        "1",
        "COD_RAMO~" + this.affinity.lineId + "|COD_CAMPO~COD_OCCUPATIONAL_CLASS|FEC_VALIDEZ~01012016|COD_MODALIDAD~99999|COD_CIA~1").subscribe(
        result => {
          this.affinity.lov.occupationalClassLOV = result;
          this.affinity.lov.occupationalClassLOV.splice(this.affinity.lov.occupationalClassLOV.length - 1, 1);

          if (this.iOS()) {
            this.affinity.riskDetails.occupationalClass = this.affinity.lov.occupationalClassLOV[0].COD_VALOR + ":=:" + this.affinity.lov.occupationalClassLOV[0].NOM_VALOR;
            this.chooseOccupationalClass();
          }
        });

      // this.caller.getLOV(
      //   "G2990006",
      //   "1",
      //   "COD_RAMO~" + this.affinity.lineId + "|COD_CAMPO~COD_OCCUPATIONAL_CLASS|FEC_VALIDEZ~01012020|COD_MODALIDAD~99999|COD_CIA~1").subscribe(
      //   result => {
      //     this.affinity.lov.accidentCoverageLimitLOV = result;
      //   });

      this.affinity.lov.accidentCoverageLimitLOV = [
        {COD_VALOR: 1000000},
        {COD_VALOR: 500000},
        {COD_VALOR: 250000},
      ];

      this.affinity.lov.accidentCoverageLimitLOV.forEach((acl)=> {
        acl.NOM_VALOR = this.formatter.format(acl.COD_VALOR);
      })
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
      ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  // viewCoverage(type, description) {
  //   this.spinner.show();
  //   this.title = description;

  //   this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
  //     result => {
  //       this.coverageList = [];
  //       let coverageHolder = result;
  //       for (let c in coverageHolder) {
  //         for (let d in coverageHolder[c]) {
  //           this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
  //           this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
  //         }
  //         this.coverageList.push(this.coverage);
  //         this.coverage = new Coverages();

  //       }
  //       this.spinner.hide();
  //       this.affinity.coverages = this.coverageList;
  //     });
  // }

  chooseBirthday() {
    let ret = true;

    const line = this.common.getLinebySubline(this.affinity.lineId);
    if (line == ACCIDENT) {
      let currentYearDiff = (m(new Date(this.affinity.motorDetails.policyPeriodFrom)).diff(new Date(this.affinity.riskDetails.birthDate), 'months', true)) / 12;
      if (currentYearDiff < 18 || currentYearDiff > 70) {
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

  chooseOccupationalClass() {
    this.caller.getLOV(
      "G2990006",
      "13",
      "COD_CIA~1|COD_RAMO~" + this.affinity.lineId + "|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012016|DVCOD_OCCUPATIONAL_CLASS~" + this.affinity.riskDetails.occupationalClass.split(':=:')[0] + "|COD_IDIOMA~EN").subscribe(
      result => {
        this.affinity.lov.occupationLOV = result;

        if (this.iOS()) {
          this.affinity.riskDetails.occupation = this.affinity.lov.occupationLOV[0].COD_VALOR + ":=:" + this.affinity.lov.occupationLOV[0].NOM_VALOR;
        }
      });
  }

  reAssign(value, field) {
    let originalValue = value;
    let newField = field.slice(0, -2);
    this.affinity.motorDetails[field] = originalValue.split("-")[0];
    this.affinity.motorDetails[newField] = originalValue.split("-")[1];
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  nextStepAction(nextStep) {
    this.affinity.riskDetails.firstName = this.affinity.riskDetails.firstName.toUpperCase();
    this.affinity.riskDetails.middleName = ((this.affinity.riskDetails.middleName) ? this.affinity.riskDetails.middleName.toUpperCase() : "");
    this.affinity.riskDetails.lastName = ((this.affinity.riskDetails.lastName) ? this.affinity.riskDetails.lastName.toUpperCase() : "");

    switch (this.affinity.productId) {
      case "10001":
        this.submitMotorQuote(nextStep);
        break;
      case "10002":
        this.submitMotorQuote(nextStep);
        break;
      case "32301":
        this.submitPAQuote(nextStep);
        break;
      case "32401":
        this.submitPAQuote(nextStep);
        break;
      default:
        this.submitPropertyQuote(nextStep);
        break;
    }
  }

  getTempID() {
    var date = new Date();
    var str = date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + date.getMinutes() + date.getSeconds();

    return str;
  }

  submitPropertyQuote(nextStep) {
    if (this.checker.checkIfRequired('property-personal') == "0") {
      return null;
    }

    if (!this.affinity.riskDetails.validIDValue) {
      this.affinity.riskDetails.validID = "DRI";
      this.affinity.riskDetails.validIDValue = "AFFINITY-" + this.getTempID();
    }

    for (let i = 0; i < this.affinity.lov.buildingsLOV.length; i++) {
      if (this.affinity.lov.buildingsLOV[i].codBuilding == this.affinity.propertyDetails.propertyId) {
        this.affinity.propertyDetails.propertyId = this.affinity.lov.buildingsLOV[i].codBuilding;
        this.affinity.propertyDetails.buildingDetails = this.affinity.lov.buildingsLOV[i];
        break;
      }
    }

    this.affinity.propertyDetails.unitProject = this.affinity.propertyDetails.buildingDetails.txtDescription.slice(0, 30) + ":=:" + this.affinity.propertyDetails.unitNumber;

    if (this.affinity.motorDetails.isCorporate == '2') {
      this.affinity.riskDetails.validID = "TIN";
    }

    if (this.affinity.riskDetails.emailAddress) {
      if (!this.validateEmail(this.affinity.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.affinity.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
        });
        return null;
      }
    }

    Swal.fire({
      title: 'Quotation Issuance',
      text: "You're about to submit request for a Quotation, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (!result.value) {
        return null;
      }

      this.spinner.show();

      this.affinity.propertyDetails.EVFurnishing = (this.affinity.propertyDetails.EVFurnishing).toString().replace(/\,/g, '');
      this.affinity.propertyDetails.EVImprovements = (this.affinity.propertyDetails.EVImprovements).toString().replace(/\,/g, '');

      this.p2000030 = this.common.assignP2000030(this.affinity);
      this.p2000031 = this.common.assignP2000031(this.affinity, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.affinity);
      this.p1001331List.push(this.common.assignP1001331(this.affinity));
      this.p2000020 = this.common.assignP2000020(this.affinity);
      this.p2000040 = this.common.assignP2000040(this.affinity);
      this.p2000060 = this.common.assignP2000060(this.affinity, 'quote');
      this.p2100610 = this.common.assignP2100610(this.affinity);
      this.a2000260 = this.common.assignP2000260(this.affinity);
      this.p2000025 = this.common.assignP2000025(this.affinity);

      let param = {
        "fName": this.affinity.riskDetails.firstName,
        "mName": this.affinity.riskDetails.middleName,
        "lName": this.affinity.riskDetails.lastName,
        "codDoc": this.affinity.riskDetails.validIDValue,
        "tipDoc": this.affinity.riskDetails.validID,
        "mobileNumber": this.affinity.riskDetails.phoneNumber,
        "email": this.affinity.riskDetails.emailAddress,
        "birthdate": m(this.affinity.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.affinity.riskDetails.suffix,
        "inceptionDate": m(this.affinity.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.affinity.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "codRamo": this.affinity.lineId,
        "unitProject": this.affinity.propertyDetails.unitProject,
        "codModalidad": this.affinity.productId,
        "clientId": this.affinity.clientId,
        "p2000030": this.p2000030,
        "p2000031": this.p2000031,
        "p1001331": this.p1001331,
        "p1001331List": this.p1001331List,
        "p2000020List": this.p2000020,
        "p2000040List": this.p2000040,
        "p2000060List": this.p2000060,
        "p2100610List": this.p2100610,
        "p2000260List": this.a2000260,
        "p2000025List": this.p2000025
      };

      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          switch (result.status) {
            case 0:
              this.spinner.hide();
              Swal.fire({
                type: 'error',
                title: 'Quotation Issuance',
                text: result.message
              });
              break;
            case 2:
              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                paymentBreakdown => {
                  this.affinity.premiumBreakdown = paymentBreakdown;

                  this.affinity.techControl = result.message2.split("~");
                  this.affinity = this.common.identifyTechControl(this.affinity);

                  if (this.affinity.techControlLevel == "1") {
                    this.getCoverages(result.message, this.affinity, nextStep);
                  } else {
                    this.getCoverages(result.message, this.affinity, "techControl");
                  }
                });
              break;
            default:
              this.affinity.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  this.affinity.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.affinity, nextStep);
                });
              break;
          }
        });
    });
  }

  submitPAQuote(nextStep) {
    if (this.checker.checkIfRequired('pa-personal') == "0") {
      return null;
    }

    if (!this.chooseBirthday()) {
      return null;
    }

    if (!this.checkConsent()) {
      return null;
    }

    if (!this.affinity.riskDetails.occupationalClass) {
      Swal.fire({
        type: 'error',
        title: 'Invalid Occupational Class',
        html: "Occupational Class is invalid or empty, please fix and try again."
      });
      this.affinity.riskDetails.occupationalClass = "0";
      return null;
    }

    if (!this.affinity.riskDetails.occupation) {
      Swal.fire({
        type: 'error',
        title: 'Invalid Occupation',
        html: "Occupation is invalid or empty, please fix and try again."
      });
      this.affinity.riskDetails.occupation = "0";
      return null;
    }

    if (this.affinity.riskDetails.civilStatus !== "S" && this.affinity.paDetails.familyMembers.length > 0) {
      this.affinity.productId = "32401";
    }

    if (!this.affinity.riskDetails.validIDValue) {
      this.affinity.riskDetails.validID = "DRI";
      this.affinity.riskDetails.validIDValue = "AFFINITY-" + this.getTempID();
    }

    this.affinity.riskDetails.fullName = this.affinity.riskDetails.lastName
      + ", "+ this.affinity.riskDetails.firstName
      + (this.affinity.riskDetails.middleName ? " " + this.affinity.riskDetails.middleName : "");

    if (this.affinity.riskDetails.emailAddress) {
      if (!this.validateEmail(this.affinity.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.affinity.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
        });
        return null;
      }
    }

    Swal.fire({
      title: 'Quotation Issuance',
      text: "You're about to submit request for a Quotation, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {
      if (!result.value) {
        return null;
      }

      this.p2000030 = this.common.assignP2000030(this.affinity);
      this.p2000031List = this.common.assignP2000031PA(this.affinity, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.affinity);
      this.p1001331List.push(this.common.assignP1001331(this.affinity));
      this.p2000020 = this.common.assignP2000020(this.affinity);
      this.p2000040 = this.common.assignP2000040(this.affinity);
      this.p2000060 = this.common.assignP2000060(this.affinity, 'quote');
      this.p2100610 = this.common.assignP2100610(this.affinity);
      this.p2000025 = this.common.assignP2000025(this.affinity);

      let param = {
        "fName": this.affinity.riskDetails.firstName,
        "mName": this.affinity.riskDetails.middleName,
        "lName": this.affinity.riskDetails.lastName,
        "codDoc": this.affinity.riskDetails.validIDValue,
        "tipDoc": this.affinity.riskDetails.validID,
        "mobileNumber": this.affinity.riskDetails.phoneNumber,
        "email": this.affinity.riskDetails.emailAddress,
        "birthdate": m(this.affinity.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.affinity.riskDetails.suffix,
        "make": this.affinity.motorDetails.manufacturerId,
        "model": this.affinity.motorDetails.modelId,
        "variant": this.affinity.motorDetails.vehicleTypeId,
        "mvNumber": this.affinity.motorDetails.MVFileNumber,
        "plateNumber": this.affinity.motorDetails.plateNumber,
        "engineNumber": this.affinity.motorDetails.motorNumber,
        "chassisNumber": this.affinity.motorDetails.serialNumber,
        "inceptionDate": m(this.affinity.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.affinity.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.affinity.motorDetails.colorId,
        "year": this.affinity.motorDetails.modelYear,
        "subModel": this.affinity.motorDetails.subModelId,
        "typeOfUse": this.affinity.motorDetails.vehicleUsedId,
        "tipCocafRegistration": "R",
        "codRamo": this.affinity.lineId,
        "codModalidad": this.affinity.productId,
        "clientId": this.affinity.clientId,
        "p2000030": this.p2000030,
        "p2000031": this.p2000031,
        "p1001331": this.p1001331,
        "p1001331List": this.p1001331List,
        "p2000020List": this.p2000020,
        "p2000040List": this.p2000040,
        "p2000060List": this.p2000060,
        "p2100610List": this.p2100610,
        "p2000031List": this.p2000031List,
        "p2000025List": this.p2000025
      };

      this.spinner.show();
      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          switch (result.status) {
            case 0:
              this.spinner.hide();
              Swal.fire({
                type: 'error',
                title: 'Quotation Issuance',
                text: result.message
              });

              break;
            case 2:
              this.affinity.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                paymentBreakdown => {
                  this.affinity.premiumBreakdown = paymentBreakdown;

                  this.affinity.techControl = result.message2.split("~");
                  this.affinity = this.common.identifyTechControl(this.affinity);

                  if (this.affinity.techControlLevel == "1") {
                    this.getCoverages(result.message, this.affinity, nextStep);
                  } else {
                    this.getCoverages(result.message, this.affinity, "techControl");
                  }

                });

              break;
            default:
              this.affinity.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  this.affinity.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.affinity, nextStep);
                });
              break;
          }

        });
    });
  }

  chooseEffectivityDate() {
    this.spinner.show();
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    let isRetro = m().isAfter(this.affinity.motorDetails.policyPeriodFrom, 'day');

    this.spinner.hide();
    if (!isRetro) {
      return null;
    }
    // $("#vehiclePhotosContainer").removeClass("hidden");
    Swal.fire({
      type: 'warning',
      title: 'Quotation Issuance',
      text: "Policy Inception should not be prior date today."
    });

    this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
  }

  submitMotorQuote(nextStep) {
    if (this.checker.checkIfRequired('motor-personal') == "0") {
      return null;
    }

    if (!this.checkConsent()) {
      return null;
    }

    if (this.affinity.riskDetails.emailAddress) {
      if (!this.validateEmail(this.affinity.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.affinity.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
        });
        return null;
      }
    }

    Swal.fire({
      title: 'Quotation Issuance',
      text: "You're about to submit request for a Quotation, Proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d31d29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed'
    }).then((result) => {

      if (!result.value) {
        return null;
      }

      this.spinner.show();
      if (this.affinity.motorDetails.isCorporate == "1") {
        this.affinity.riskDetails.lastName
          + ", "+ this.affinity.riskDetails.firstName
          + (this.affinity.riskDetails.middleName ? " " + this.affinity.riskDetails.middleName : "");
      }

      let motorFields = ["manufacturerId", "modelId", "vehicleTypeId", "subModelId", "vehicleUsedId", "colorId", "usageAreaId"];

      for (let i = 0; i < motorFields.length; i++) {
        this.reAssign(this.affinity.motorDetails[motorFields[i] + "Holder"], motorFields[i]);
      }

      if (this.affinity.motorDetails.isCorporate == '2') {
        this.affinity.riskDetails.validID = "TIN";
      }

      this.p2000030 = this.common.assignP2000030(this.affinity);
      this.p2000031 = this.common.assignP2000031(this.affinity, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.affinity);
      this.p1001331List.push(this.common.assignP1001331(this.affinity));
      this.p2000020 = this.common.assignP2000020(this.affinity);
      this.p2000040 = this.common.assignP2000040(this.affinity);
      this.p2000060 = this.common.assignP2000060(this.affinity, 'quote');
      this.p2100610 = this.common.assignP2100610(this.affinity);
      this.p2000025 = this.common.assignP2000025(this.affinity);

      let param = {
        "fName": this.affinity.riskDetails.firstName,
        "mName": this.affinity.riskDetails.middleName,
        "lName": this.affinity.riskDetails.lastName,
        "codDoc": this.affinity.riskDetails.validIDValue,
        "tipDoc": this.affinity.riskDetails.validID,
        "mobileNumber": this.affinity.riskDetails.phoneNumber,
        "email": this.affinity.riskDetails.emailAddress,
        "birthdate": m(this.affinity.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.affinity.riskDetails.suffix,
        "make": this.affinity.motorDetails.manufacturerId,
        "model": this.affinity.motorDetails.modelId,
        "variant": this.affinity.motorDetails.vehicleTypeId,
        "mvNumber": this.affinity.motorDetails.MVFileNumber,
        "plateNumber": this.affinity.motorDetails.plateNumber,
        "engineNumber": this.affinity.motorDetails.motorNumber,
        "chassisNumber": this.affinity.motorDetails.serialNumber,
        "inceptionDate": m(this.affinity.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.affinity.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.affinity.motorDetails.colorId,
        "year": this.affinity.motorDetails.modelYear,
        "subModel": this.affinity.motorDetails.subModelId,
        "typeOfUse": this.affinity.motorDetails.vehicleUsedId,
        "tipCocafRegistration": "R",
        "reCompute": "0",
        "codRamo": this.affinity.motorDetails.motorTypeId,
        "codModalidad": this.affinity.productId,
        "clientId": this.affinity.clientId,
        "p2000030": this.p2000030,
        "p2000031": this.p2000031,
        "p1001331": this.p1001331,
        "p1001331List": this.p1001331List,
        "p2000020List": this.p2000020,
        "p2000040List": this.p2000040,
        "p2000060List": this.p2000060,
        "p2100610List": this.p2100610,
        "p2000025List": this.p2000025
      };

      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          switch (result.status) {
            case 0:
              this.spinner.hide();
              Swal.fire({
                type: 'error',
                title: 'Quotation Issuance',
                text: result.message
              });
              break;
            case 2:
              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                paymentBreakdown => {
                  this.affinity.premiumBreakdown = paymentBreakdown;

                  this.affinity.techControl = result.message2.split("~");
                  this.affinity = this.common.identifyTechControl(this.affinity);

                  if (this.affinity.techControlLevel == "1") {
                    this.getCoverages(result.message, this.affinity, nextStep);
                  } else {
                    this.getCoverages(result.message, this.affinity, "techControl");
                  }
                });
              break;
            default:
              this.affinity.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  this.affinity.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.affinity, nextStep);
                });
              break;
          }
        });
    });
  }

  checkConsent() {
    let valid = this.affinity.riskDetails.consentCheck;

    if (!valid) {
      Swal.fire({
        type: 'warning',
        title: 'Confirm Consent',
        text: "You need to confirm consent to proceed."
      });
    }
    return valid;
  }

  getCoverages(numPoliza, affinity: Affinity, nextStep) {
    this.common.getCoverageByPolicy("P", numPoliza, affinity.lineId).subscribe(
      (result) => {
        if (affinity.productId == "10002" || affinity.productId == "10001") {
          let totalLossDamagePrem = 0;

          for (let c = 0; c < result.length; c++) {
            if (result[c].codCob == "1003" || result[c].codCob == "1002") {
              totalLossDamagePrem = totalLossDamagePrem + parseFloat(result[c].totalPremium);
            }
          }

          for (let i = 0; i < result.length; i++) {
            switch (result[i].codCob) {
              case "1004":
                affinity.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
                result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
                break;
              case "1005":
                affinity.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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

            if (result[i].codCob != "1003" && result[i].codCob != "1002") {
              affinity.coveragesValue.push(result[i]);
            }
          }
        }

        const line = this.common.getLinebySubline(affinity.lineId);
        if (line == ACCIDENT) {
          for (let i = 0; i < result.length; i++) {
            if (result[i].numRiesgo == "1") {
              // result[i].sumaAseg = this.formatter.format(parseFloat(result[i].sumaAseg));
              result[i].totalPremium = ((result[i].totalPremium) ? this.formatter.format(parseFloat(result[i].totalPremium)) : "INCL");
              result[i].numSecu = parseInt(result[i].numSecu) + 0;
              affinity.coveragesValue.push(result[i]);
            }
          }
          affinity.paDetails.familyMembers = this.mapP2025Insured(this.p2000025, result);
        }

        if (affinity.lineId == '251') {
          let total7105 = 0;
          let total7373 = 0;
          let total7386 = 0;

          for (let i = 0; i < result.length; i++) {
            switch (result[i].codCobRelacionada) {
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

          for (let i = 0; i < result.length; i++) {
            result[i].numSecu = parseInt(result[i].numSecu) + 0;
            switch (result[i].codCob) {
              case "7105":
                result[i].totalPremium = total7105;
                result[i].nomCob = "WORKS OF ART";
                affinity.coveragesValue.push(result[i]);
                break;
              case "7373":
                result[i].totalPremium = total7373;
                affinity.coveragesValue.push(result[i]);
                break;
              case "7386":
                result[i].totalPremium = total7386;
                affinity.coveragesValue.push(result[i]);
                break;
            }

            result[i].totalPremium = ((result[i].totalPremium == "") ? "" : this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));
          }
        }

        affinity.coveragesValue = _.orderBy(affinity.coveragesValue, 'numSecu', 'asc');
        this.nextStep.emit(nextStep);
        this.affinityOutput.emit(affinity);
        this.spinner.hide();
      });
  }

  mapP2025Insured(p2025, p2040) {
    let temp = [];
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
      temp.push(riskTemp);
    }

    return temp;
  }

  backButtonAction() {
    this.nextStep.emit(this.backButton);
  }

  openModalFamilyMember() {
    this.familyMember = new Risk();
    this.addFamily = "";
    this.loadType = "";

    this.common.sleep(10).then(() => {
      this.addFamily = "add";
    });
  }

  editFamilyMember(member) {
    this.familyMember = member;
    this.addFamily = "";
    this.loadType = "edit";
    this.common.sleep(10).then(() => {
      this.addFamily = "add";
    });
  }

  addFamilyMember(familyMember) {
    if (familyMember.isBack) {
      $("#closeModal").click();
      return null;
    }

    if (this.loadType == "edit") {
      this.removeFamilyMember(this.familyMember);
    }

    familyMember.fullName = familyMember.lastName + ", " + familyMember.firstName + " " + ((familyMember.middleName) ? familyMember.middleName : "");
    this.affinity.paDetails.familyMembers.push(familyMember);

    let childCount = 0;
    let haveSpouse = "0";
    for (let x = 0; x < this.affinity.paDetails.familyMembers.length; x++) {
      if (this.affinity.paDetails.familyMembers[x].relationship.split(":=:")[0] == "S") {
        haveSpouse = "1";
      } else if (this.affinity.paDetails.familyMembers[x].relationship.split(":=:")[0] == "C") {
        childCount = childCount + 1;
      }
    }
    if (this.affinity.riskDetails.civilStatus != "C") {
      haveSpouse = "1";
    }
    if (haveSpouse == "1" && childCount == 3) {
      this.showAddButton = "0";
    }

    $("#closeModal").click();
  }

  removeFamilyMember(familyMember: Risk) {
    let index1: number = this.affinity.paDetails.familyMembers.indexOf(familyMember);

    if (index1 !== -1) {
      this.affinity.paDetails.familyMembers.splice(index1, 1);
    }

    this.showAddButton = "1";
  }
}
