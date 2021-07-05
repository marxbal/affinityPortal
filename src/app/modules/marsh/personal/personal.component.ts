import {
  Component,
  OnInit,
  // HostListener,
  // AfterViewInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
// import {
//   AuthenticationService
// } from '../../../services/authentication.service';
// import {
//   Router
// } from '@angular/router';
import {
  IsRequired
} from '../../../guard/is-required';
// import {
//   ComponentCanDeactivate
// } from '../../../guard/component-can-deactivate';
import {
  Marsh
} from '../../../objects/marsh';
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
  MarshCoverages
} from '../../../objects/marsh-coverages';
// import {
//   TransactionDTO
// } from '../../../objects/transaction-DTO';
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
// import {
//   PersonalAccidentIssuanceService
// } from '../../../services/personal-accident-issuance.service';

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
    // private paSvc: PersonalAccidentIssuanceService
    ) {}

  @Input() marsh: Marsh;
  @Input() backButton: String;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();

  @Input() product: number;
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
  coverageList: MarshCoverages[] = [];
  coverage: MarshCoverages = new MarshCoverages();
  title: String = "";

  addFamily: string = "";
  loadType: string = "";
  showAddButton: String = "1";
  showAll: String = "0";

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    // console.log(this.marsh);
    // console.log(this.backButton);
    this.selectProduct(this.product, this.description);

    this.marsh.motorDetails.reCompute = "0";

    if (this.marsh.lineId !== '337') {
      this.showAll = "1";
    }

    this.spinner.show();

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.marsh.lov.suffixLOV = result;
      });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        this.marsh.lov.documentLOV = result;
      });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.marsh.lov.civilStatusLOV = result;
      });

    this.caller.getLOV("A1000101", "1", "").subscribe(
      result => {
        this.marsh.lov.nationalityLOV = result;
        this.spinner.hide();
      });

    this.marsh.riskDetails.nationality = "PHL";

  }

  selectProduct(product, description) {

    this.marsh.productId = product;
    this.viewCoverage(description, '');
    this.showAll = "1";

    this.common.sleep(1000).then(() => {
      this.common.scrollToElement("showAll", 500);
    });

    $("#compreCard").removeClass("card-shadow");
    $("#ctplCard").removeClass("card-shadow");

    if (this.marsh.productId == "33701") {
      $("#compreCard").addClass("card-shadow");
    } else {
      $("#ctplCard").addClass("card-shadow");
    }

    if (this.marsh.lineId == "337" || this.marsh.lineId == "251") {
      this.marsh.motorDetails.isCorporate = "1";
      this.marsh.riskDetails.civilStatus = "";
      this.marsh.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
      this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

      this.caller.getLOV("G2990006", "1", "COD_RAMO~337|COD_CAMPO~COD_OCCUPATIONAL_CLASS|FEC_VALIDEZ~01012020|COD_MODALIDAD~99999|COD_CIA~1").subscribe(
        result => {
          console.log(result);
          this.marsh.lov.occupationalClassLOV = result;
          this.marsh.lov.occupationalClassLOV.splice(this.marsh.lov.occupationalClassLOV.length - 1, 1);

          if (this.iOS()) {
            this.marsh.riskDetails.occupationalClass = this.marsh.lov.occupationalClassLOV[0].COD_VALOR + ":=:" + this.marsh.lov.occupationalClassLOV[0].NOM_VALOR;
            this.chooseOccupationalClass();
          }
        });
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

  viewCoverage(type, description) {
    this.spinner.show();
    this.title = description;

    this.caller.doCallService("/afnty/coverage/getCoverageDescriptions", type).subscribe(
      result => {
        this.coverageList = [];
        let coverageHolder = result;
        for (let c in coverageHolder) {
          for (let d in coverageHolder[c]) {
            this.coverage.benefit = coverageHolder[c][d].split(":=:")[1];
            this.coverage.coverages.push(coverageHolder[c][d].split(":=:")[2]);
          }
          this.coverageList.push(this.coverage);
          this.coverage = new MarshCoverages();

        }
        this.spinner.hide();
        this.marsh.coverages = this.coverageList;
      });
  }

  chooseBirthday() {

    let ret = true;

    if (this.marsh.lineId == "337") {

      // let currentYearDiff = (m().year() - parseInt(this.marsh.riskDetails.birthDate));
      let currentYearDiff = (m(new Date(this.marsh.motorDetails.policyPeriodFrom)).diff(new Date(this.marsh.riskDetails.birthDate), 'months', true)) / 12;
      // console.log(currentYearDiff);
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
    this.caller.getLOV("G2990006", "13", "COD_CIA~1|COD_RAMO~337|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012020|DVCOD_OCCUPATIONAL_CLASS~" + this.marsh.riskDetails.occupationalClass.split(':=:')[0] + "|COD_IDIOMA~EN").subscribe(
      result => {
        console.log(result);
        this.marsh.lov.occupationLOV = result;

        if (this.iOS()) {
          this.marsh.riskDetails.occupation = this.marsh.lov.occupationLOV[0].COD_VALOR + ":=:" + this.marsh.lov.occupationLOV[0].NOM_VALOR;
        }
      });
  }

  reAssign(value, field) {
    let originalValue = value;
    let newField = field.slice(0, -2);
    this.marsh.motorDetails[field] = originalValue.split("-")[0];
    this.marsh.motorDetails[newField] = originalValue.split("-")[1];
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  nextStepAction(nextStep) {
    this.marsh.riskDetails.firstName = this.marsh.riskDetails.firstName.toUpperCase();
    this.marsh.riskDetails.middleName = ((this.marsh.riskDetails.middleName) ? this.marsh.riskDetails.middleName.toUpperCase() : "");
    this.marsh.riskDetails.lastName = ((this.marsh.riskDetails.lastName) ? this.marsh.riskDetails.lastName.toUpperCase() : "");

    switch (this.marsh.productId) {
      case "10001":
        this.submitMotorQuote(nextStep);
        break;
      case "10002":
        this.submitMotorQuote(nextStep);
        break;
      case "33701":
        this.submitPAQuote(nextStep);
        break;
      case "33702":
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

    if (!this.marsh.riskDetails.validIDValue) {
      this.marsh.riskDetails.validID = "DRI";
      this.marsh.riskDetails.validIDValue = "FOPM-" + this.getTempID();
    }

    for (let i = 0; i < this.marsh.lov.buildingsLOV.length; i++) {
      if (this.marsh.lov.buildingsLOV[i].codBuilding == this.marsh.propertyDetails.propertyId) {
        this.marsh.propertyDetails.propertyId = this.marsh.lov.buildingsLOV[i].codBuilding;
        this.marsh.propertyDetails.buildingDetails = this.marsh.lov.buildingsLOV[i];
        break;
      }
    }

    this.marsh.propertyDetails.unitProject = this.marsh.propertyDetails.buildingDetails.txtDescription.slice(0, 30) + ":=:" + this.marsh.propertyDetails.unitNumber;

    if (this.marsh.motorDetails.isCorporate == '2') {
      this.marsh.riskDetails.validID = "TIN";
    }

    if (this.marsh.riskDetails.emailAddress) {
      if (!this.validateEmail(this.marsh.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.marsh.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
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

      this.marsh.propertyDetails.EVFurnishing = (this.marsh.propertyDetails.EVFurnishing).toString().replace(/\,/g, '');
      this.marsh.propertyDetails.EVImprovements = (this.marsh.propertyDetails.EVImprovements).toString().replace(/\,/g, '');

      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031 = this.common.assignP2000031(this.marsh, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.common.assignP1001331(this.marsh));
      this.p2000020 = this.common.assignP2000020(this.marsh);
      this.p2000040 = this.common.assignP2000040(this.marsh);
      this.p2000060 = this.common.assignP2000060(this.marsh, 'quote');
      this.p2100610 = this.common.assignP2100610(this.marsh);
      this.a2000260 = this.common.assignP2000260(this.marsh);
      this.p2000025 = this.common.assignP2000025(this.marsh);

      let param = {
        "fName": this.marsh.riskDetails.firstName,
        "mName": this.marsh.riskDetails.middleName,
        "lName": this.marsh.riskDetails.lastName,
        "codDoc": this.marsh.riskDetails.validIDValue,
        "tipDoc": this.marsh.riskDetails.validID,
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "codRamo": this.marsh.lineId,
        "unitProject": this.marsh.propertyDetails.unitProject,
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
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
      console.log(param);
      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          console.log(result);

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
                  this.marsh.premiumBreakdown = paymentBreakdown;

                  this.marsh.techControl = result.message2.split("~");
                  this.marsh = this.common.identifyTechControl(this.marsh);

                  console.log(this.marsh);

                  if (this.marsh.techControlLevel == "1") {
                    this.getCoverages(result.message, this.marsh, nextStep);
                  } else {
                    this.getCoverages(result.message, this.marsh, "techControl");
                  }

                });

              break;
            default:
              this.marsh.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  console.log(result);
                  this.marsh.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.marsh, nextStep);


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

    if (!this.marsh.riskDetails.occupationalClass) {
      Swal.fire({
        type: 'error',
        title: 'Invalid Occupational Class',
        html: "Occupational Class is invalid or empty, please fix and try again."
      });
      this.marsh.riskDetails.occupationalClass = "0";
      return null;
    }

    if (!this.marsh.riskDetails.occupation) {
      Swal.fire({
        type: 'error',
        title: 'Invalid Occupation',
        html: "Occupation is invalid or empty, please fix and try again."
      });
      this.marsh.riskDetails.occupation = "0";
      return null;
    }

    if (this.marsh.riskDetails.civilStatus !== "S" && this.marsh.paDetails.familyMembers.length > 0) {
      this.marsh.productId = "33702";
    }

    if (!this.marsh.riskDetails.validIDValue) {
      this.marsh.riskDetails.validID = "DRI";
      this.marsh.riskDetails.validIDValue = "FOPM-" + this.getTempID();
    }

    if (this.marsh.riskDetails.emailAddress) {
      if (!this.validateEmail(this.marsh.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.marsh.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
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
      console.log(result);
      if (!result.value) {
        return null;
      }

      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031List = this.common.assignP2000031PA(this.marsh, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.common.assignP1001331(this.marsh));
      this.p2000020 = this.common.assignP2000020(this.marsh);
      this.p2000040 = this.common.assignP2000040(this.marsh);
      this.p2000060 = this.common.assignP2000060(this.marsh, 'quote');
      this.p2100610 = this.common.assignP2100610(this.marsh);
      this.p2000025 = this.common.assignP2000025(this.marsh);

      let param = {
        "fName": this.marsh.riskDetails.firstName,
        "mName": this.marsh.riskDetails.middleName,
        "lName": this.marsh.riskDetails.lastName,
        "codDoc": this.marsh.riskDetails.validIDValue,
        "tipDoc": this.marsh.riskDetails.validID,
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "make": this.marsh.motorDetails.manufacturerId,
        "model": this.marsh.motorDetails.modelId,
        "variant": this.marsh.motorDetails.vehicleTypeId,
        "mvNumber": this.marsh.motorDetails.MVFileNumber,
        "plateNumber": this.marsh.motorDetails.plateNumber,
        "engineNumber": this.marsh.motorDetails.motorNumber,
        "chassisNumber": this.marsh.motorDetails.serialNumber,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.marsh.motorDetails.colorId,
        "year": this.marsh.motorDetails.modelYear,
        "subModel": this.marsh.motorDetails.subModelId,
        "typeOfUse": this.marsh.motorDetails.vehicleUsedId,
        "tipCocafRegistration": "R",
        "codRamo": this.marsh.lineId,
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
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
      console.log(param);
      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          console.log(result);

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
              this.marsh.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                paymentBreakdown => {
                  this.marsh.premiumBreakdown = paymentBreakdown;
                  console.log(paymentBreakdown);

                  this.marsh.techControl = result.message2.split("~");
                  this.marsh = this.common.identifyTechControl(this.marsh);

                  console.log(this.marsh);

                  if (this.marsh.techControlLevel == "1") {
                    this.getCoverages(result.message, this.marsh, nextStep);
                  } else {
                    this.getCoverages(result.message, this.marsh, "techControl");
                  }

                });

              break;
            default:
              this.marsh.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  console.log(result);
                  this.marsh.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.marsh, nextStep);


                });
              break;
          }

        });
    });
  }

  chooseEffectivityDate() {
    this.spinner.show();
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    let isRetro = m().isAfter(this.marsh.motorDetails.policyPeriodFrom, 'day');

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

    this.marsh.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    this.marsh.motorDetails.policyPeriodTo = m(this.marsh.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
  }

  submitMotorQuote(nextStep) {
    if (this.checker.checkIfRequired('motor-personal') == "0") {
      return null;
    }

    if (this.marsh.riskDetails.emailAddress) {
      if (!this.validateEmail(this.marsh.riskDetails.emailAddress)) {
        Swal.fire({
          type: 'error',
          title: 'Invalid Email Address',
          html: "Email <b>" + this.marsh.riskDetails.emailAddress + "</b> is invalid, please fix and try again."
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
      if (this.marsh.motorDetails.isCorporate == "1") {
        this.marsh.riskDetails.fullName = this.marsh.riskDetails.lastName + ", " + this.marsh.riskDetails.firstName + " " + this.marsh.riskDetails.middleName;
      }

      let motorFields = ["manufacturerId", "modelId", "vehicleTypeId", "subModelId", "vehicleUsedId", "colorId", "usageAreaId"];

      for (let i = 0; i < motorFields.length; i++) {
        this.reAssign(this.marsh.motorDetails[motorFields[i] + "Holder"], motorFields[i]);
      }

      if (this.marsh.motorDetails.isCorporate == '2') {
        this.marsh.riskDetails.validID = "TIN";
      }

      this.p2000030 = this.common.assignP2000030(this.marsh);
      this.p2000031 = this.common.assignP2000031(this.marsh, this.p2000030);
      this.p1001331 = this.common.assignP1001331(this.marsh);
      this.p1001331List.push(this.common.assignP1001331(this.marsh));
      this.p2000020 = this.common.assignP2000020(this.marsh);
      this.p2000040 = this.common.assignP2000040(this.marsh);
      this.p2000060 = this.common.assignP2000060(this.marsh, 'quote');
      this.p2100610 = this.common.assignP2100610(this.marsh);
      this.p2000025 = this.common.assignP2000025(this.marsh);

      let param = {
        "fName": this.marsh.riskDetails.firstName,
        "mName": this.marsh.riskDetails.middleName,
        "lName": this.marsh.riskDetails.lastName,
        "codDoc": this.marsh.riskDetails.validIDValue,
        "tipDoc": this.marsh.riskDetails.validID,
        "mobileNumber": this.marsh.riskDetails.phoneNumber,
        "email": this.marsh.riskDetails.emailAddress,
        "birthdate": m(this.marsh.riskDetails.birthDate).format('M/D/YYYY'),
        "suffix": this.marsh.riskDetails.suffix,
        "make": this.marsh.motorDetails.manufacturerId,
        "model": this.marsh.motorDetails.modelId,
        "variant": this.marsh.motorDetails.vehicleTypeId,
        "mvNumber": this.marsh.motorDetails.MVFileNumber,
        "plateNumber": this.marsh.motorDetails.plateNumber,
        "engineNumber": this.marsh.motorDetails.motorNumber,
        "chassisNumber": this.marsh.motorDetails.serialNumber,
        "inceptionDate": m(this.marsh.motorDetails.policyPeriodFrom).format('M/D/YYYY'),
        "expiryDate": m(this.marsh.motorDetails.policyPeriodTo).format('M/D/YYYY'),
        "color": this.marsh.motorDetails.colorId,
        "year": this.marsh.motorDetails.modelYear,
        "subModel": this.marsh.motorDetails.subModelId,
        "typeOfUse": this.marsh.motorDetails.vehicleUsedId,
        "tipCocafRegistration": "R",
        "reCompute": "0",
        "codRamo": this.marsh.motorDetails.motorTypeId,
        "codModalidad": this.marsh.productId,
        "clientId": this.marsh.clientId,
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
      console.log(param);
      this.caller.doCallService('/afnty/issueQuote', param).subscribe(
        result => {
          console.log(result);

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
                  this.marsh.premiumBreakdown = paymentBreakdown;

                  this.marsh.techControl = result.message2.split("~");
                  this.marsh = this.common.identifyTechControl(this.marsh);

                  console.log(this.marsh);

                  if (this.marsh.techControlLevel == "1") {
                    this.getCoverages(result.message, this.marsh, nextStep);
                  } else {
                    this.getCoverages(result.message, this.marsh, "techControl");
                  }

                });

              break;
            default:
              this.marsh.quotationNumber = result.message;

              this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=C', null).subscribe(
                resultpb => {
                  console.log(result);
                  this.marsh.premiumBreakdown = resultpb;

                  this.getCoverages(result.message, this.marsh, nextStep);


                });
              break;
          }

        });
    });
  }

  getCoverages(numPoliza, marsh: Marsh, nextStep) {
    console.log("P", numPoliza, marsh.motorDetails.motorTypeId);
    console.log(marsh);
    this.common.getCoverageByPolicy("P", numPoliza, marsh.lineId).subscribe(
      (result) => {
        if (marsh.productId == "10002" || marsh.productId == "10001") {
          let totalLossDamagePrem = 0;

          for (let c = 0; c < result.length; c++) {
            if (result[c].codCob == "1003" || result[c].codCob == "1002") {
              totalLossDamagePrem = totalLossDamagePrem + parseFloat(result[c].totalPremium);
            }
          }

          for (let i = 0; i < result.length; i++) {

            switch (result[i].codCob) {
              case "1004":
                marsh.motorDetails.bodilyInjuryLimit = result[i].sumaAseg;
                result[i].nomCob = "Excess Liability Insurance for Bodily Injury".toUpperCase();
                break;
              case "1005":
                marsh.motorDetails.propertyDamageLimit = result[i].sumaAseg;
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
              marsh.coveragesValue.push(result[i]);
            }
          }
        }

        if (marsh.lineId == '337') {
          for (let i = 0; i < result.length; i++) {

            if (result[i].numRiesgo == "1") {
              // result[i].sumaAseg = this.formatter.format(parseFloat(result[i].sumaAseg));
              result[i].totalPremium = ((result[i].totalPremium) ? this.formatter.format(parseFloat(result[i].totalPremium)) : "INCL");
              result[i].numSecu = parseInt(result[i].numSecu) + 0;
              marsh.coveragesValue.push(result[i]);
            }

          }
          marsh.paDetails.familyMembers = this.mapP2025Insured(this.p2000025, result);

        }

        if (marsh.lineId == '251') {
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
                marsh.coveragesValue.push(result[i]);
                break;
              case "7373":
                result[i].totalPremium = total7373;
                marsh.coveragesValue.push(result[i]);
                break;
              case "7386":
                result[i].totalPremium = total7386;
                marsh.coveragesValue.push(result[i]);
                break;
            }

            result[i].totalPremium = ((result[i].totalPremium == "") ? "" : this.formatter.format(parseFloat((result[i].totalPremium) ? result[i].totalPremium : "0")));

          }
        }

        marsh.coveragesValue = _.orderBy(marsh.coveragesValue, 'numSecu', 'asc');
        console.log(marsh);
        this.nextStep.emit(nextStep);
        this.marshOutput.emit(marsh);
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
    this.marsh.paDetails.familyMembers.push(familyMember);
    console.log(this.marsh);

    let childCount = 0;
    let haveSpouse = "0";
    for (let x = 0; x < this.marsh.paDetails.familyMembers.length; x++) {
      if (this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "S") {
        haveSpouse = "1";
      } else if (this.marsh.paDetails.familyMembers[x].relationship.split(":=:")[0] == "C") {
        childCount = childCount + 1;
      }
    }
    if (this.marsh.riskDetails.civilStatus != "C") {
      haveSpouse = "1";
    }
    if (haveSpouse == "1" && childCount == 3) {
      this.showAddButton = "0";
    }

    $("#closeModal").click();
  }

  removeFamilyMember(familyMember: Risk) {
    let index1: number = this.marsh.paDetails.familyMembers.indexOf(familyMember);

    if (index1 !== -1) {
      this.marsh.paDetails.familyMembers.splice(index1, 1);
    }

    this.showAddButton = "1";
  }
}
