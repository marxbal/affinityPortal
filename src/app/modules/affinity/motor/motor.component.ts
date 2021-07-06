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
// import * as dz from 'dropzone/dist/dropzone.js';
// import {
//   AuthenticationService
// } from '../../../services/authentication.service';
// import {
//   Router
// } from '@angular/router';
// import {
//   ComponentCanDeactivate
// } from '../../../guard/component-can-deactivate';
import {
  Affinity
} from '../../../objects/affinity';
import {
  MotorAccessories
} from '../../../objects/motor-accessories';
import {
  Coverages
} from '../../../objects/coverages';
import * as m from 'moment';
import {
  AuthService
} from '../../../services/auth.service';
import {
  CommonService
} from '../../../services/common.service';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  IsRequired
} from '../../../guard/is-required';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {

  constructor(private caller: AuthService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private checker: IsRequired) {}

  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();
  @Output() backButton = new EventEmitter();

  @Input() product: string;
  @Input() description: String;

  accessory: MotorAccessories;
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();
  title: String = "";

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  minRetro: String = m().subtract(6, 'month').format('YYYY-MM-DD');

  ngOnInit() {
    this.selectProduct(this.product, this.description);

    if (!this.affinity) {
      this.affinity = new Affinity();
    }

    this.accessory = new MotorAccessories();

    this.spinner.show();

    this.caller.getLOV("A2100800", "1", '').subscribe(
      result => {
        this.affinity.lov.colorLOV = result;
      });

    this.caller.getLOV("A1000101", "1", "").subscribe(
      result => {
        console.log(result);
      });

    this.caller.getOptionList('EN', 'COD_NACIONALIDAD', '999').subscribe(
      result => {
        console.log(result);
      });

    this.affinity.motorDetails.bodilyInjuryLimit = "200000";
    this.affinity.motorDetails.propertyDamageLimit = "200000";

    this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    this.caller.doCallService("/afnty/getCoverageLimits?codRamo=100&codCob=1004", null).subscribe(
      result => {
        this.affinity.lov.bodilyInjuryLOV = result;

        for (let i = 0; i < this.affinity.lov.bodilyInjuryLOV.length; i++) {
          this.affinity.lov.bodilyInjuryLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.affinity.lov.bodilyInjuryLOV[i].impLimite));
        }

        this.affinity.lov.bodilyInjuryLOV.splice(-1, 1);
        this.affinity.lov.bodilyInjuryLOV.splice(-1, 1);
      });

    this.caller.doCallService("/afnty/getCoverageLimits?codRamo=100&codCob=1005", null).subscribe(
      result => {
        this.affinity.lov.propertyDamageLOV = result;

        for (let i = 0; i < this.affinity.lov.propertyDamageLOV.length; i++) {
          this.affinity.lov.propertyDamageLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.affinity.lov.propertyDamageLOV[i].impLimite));
        }

        this.affinity.lov.propertyDamageLOV.splice(-1, 1);
        this.affinity.lov.propertyDamageLOV.splice(-1, 1);

        this.spinner.hide();
      });

  }

  changePlateNumber() {
    if (this.affinity.productId == "10002") {
      this.affinity.motorDetails.policyPeriodFrom = m("2020-" + this.getMonthBasedOnPlate(this.affinity.motorDetails.plateNumber) + "-01").format('YYYY-MM-DD');
      this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
    }

    this.validatePlateNumber();
  }

  getMonthBasedOnPlate(plate: string) {
    var lastDigitPlate = plate.charAt(plate.length - 1);
    let monthValue = "";
    switch (lastDigitPlate) {
      case "1":
        monthValue = "02" //FEBRUARY 1 ending plate 1
        break;
      case "2":
        monthValue = "03" //MARCH 1 ending plate 2
        break;
      case "3":
        monthValue = "04" //APRIL 1 ending plate 3
        break;
      case "4":
        monthValue = "05" //MAY 1 ending plate 4
        break;
      case "5":
        monthValue = "06" //JUNE 1 ending plate 5
        break;
      case "6":
        monthValue = "07" //JULY 1 ending plate 6
        break;
      case "7":
        monthValue = "08" //AUGUST 1 ending plate 7
        break;
      case "8":
        monthValue = "09" //SEPTEMBER 1 ending plate 8
        break;
      case "9":
        monthValue = "10" //OCTOBER 1 ending plate 9
        break;
      case "0":
        monthValue = "11" //NOVEMBER 1 ending plate 0
        break;
      default:
        monthValue = "01"
        break;
    }

    return monthValue;
  }

  chooseVTPL() {
    this.affinity.motorDetails.propertyDamageLimit = this.affinity.motorDetails.bodilyInjuryLimit;
  }

  chooseEffectivityDate() {
    this.spinner.show();
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    let isRetro = m().isAfter(this.affinity.motorDetails.policyPeriodFrom, 'day');
    let isBelowSix = m(this.affinity.motorDetails.policyPeriodFrom).isBefore(m().subtract(6, 'month'));

    console.log(isBelowSix);

    $("#vehiclePhotosContainer").addClass("hidden");
    this.spinner.hide();

    if (!isRetro) {
      return null;
    }

    // $("#vehiclePhotosContainer").removeClass("hidden");

    Swal.fire({
      type: 'warning',
      title: 'Policy Issuance',
      text: "Submission of current pictures of all sides of the motor vehicle is required for evaluation of acceptance of MAPFRE Insurance  prior to the issuance of the Policy."
    });

    if (isBelowSix) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Effectivity date should not below Six (6) months from current date."
      });
      this.affinity.motorDetails.policyPeriodFrom = m().subtract(6, 'month').format('YYYY-MM-DD');
      this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
      return null;
    }
  }

  chooseType() {
    this.commonService.chooseType(
      this.affinity.motorDetails.motorTypeId
    ).subscribe(
      (result) => {
        this.affinity.lov.makeLOV = result
      });
  }

  chooseMake() {
    this.commonService.chooseMake(
      this.affinity.motorDetails.motorTypeId,
      $("#manufacturerId").val().split("-")[0]
    ).subscribe(
      (result) => {
        this.affinity.lov.modelLOV = result;
        this.affinity.motorDetails.modelIdHolder = "";
        this.affinity.motorDetails.vehicleTypeIdHolder = "";
        this.affinity.motorDetails.modelYear = "";
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";

        this.affinity.lov.variantLOV = [];
        this.affinity.lov.yearList = [];
        this.affinity.lov.subModelLOV = [];
      });
  }

  chooseModel() {
    this.commonService.chooseModel(
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0]
    ).subscribe(
      (result) => {
        this.affinity.lov.variantLOV = result;
        this.affinity.motorDetails.vehicleTypeIdHolder = "";
        this.affinity.motorDetails.modelYear = "";
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";

        this.affinity.lov.yearList = [];
        this.affinity.lov.subModelLOV = [];
      });
  }

  chooseVariant() {
    this.commonService.chooseVariant(
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0],
      $("#vehicleTypeId").val().split("-")[0]
    ).subscribe(
      (result) => {
        this.affinity.lov.yearList = result;
        this.affinity.motorDetails.modelYear = "";
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";

        this.affinity.lov.subModelLOV = [];
      });

    this.affinity.lineId = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.affinity.motorDetails.motorTypeId = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.affinity.motorDetails.subline = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[1];
    this.affinity.motorDetails.validityDate = this.commonService.selectSubline($("#vehicleTypeId").val().split("-")[0]).split("-")[0];

    this.commonService.loadAccessories(
      $("#vehicleTypeId").val().split("-")[0],
      this.affinity.motorDetails.validityDate
    ).subscribe(
      (result) => {
        this.affinity.lov.accessoryLOV = result;
      });
  }

  chooseModelYear() {
    $("#vehiclePhotosContainer").addClass("hidden");
    if ((m().year() - parseInt(this.affinity.motorDetails.modelYear)) > 8) {

      Swal.fire({
        type: 'warning',
        title: 'Policy Issuance',
        text: "Vehicle more than eight (8) years old is subject to approval. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });
    }

    this.commonService.chooseModelYear(
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0],
      $("#vehicleTypeId").val().split("-")[0],
      this.affinity.motorDetails.modelYear
    ).subscribe(
      (result) => {
        this.affinity.lov.subModelLOV = result;
        this.affinity.motorDetails.FMV = "";
      });
  }

  chooseSubModel() {
    this.commonService.chooseSubModel(
      this.affinity.motorDetails.motorTypeId,
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0],
      $("#vehicleTypeId").val().split("-")[0],
      this.affinity.motorDetails.modelYear
    ).subscribe(
      (result) => {
        this.affinity.lov.typeOfUseLOV = result
      });

    this.commonService.loadFMV(
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0],
      $("#subModelId").val().split("-")[0],
      this.affinity.motorDetails.modelYear
    ).subscribe(
      (result) => {
        this.affinity.motorDetails.FMV = result
      });
  }

  chooseAccessory() {
    this.accessory.accessoryValue = this.accessory.accessoryIdHolder.split("-")[2];
  }

  onSelect(event) {
    console.log(event);
    this.affinity.motorDetails.vehiclePhotos.push(...event.addedFiles);
  }

  onRemove(event) {
    console.log(event);
    this.affinity.motorDetails.vehiclePhotos.splice(this.affinity.motorDetails.vehiclePhotos.indexOf(event), 1);
  }

  addAccessory() {
    let accessoryy = this.accessory.accessoryIdHolder;
    this.accessory.accessoryId = accessoryy.split("-")[0];
    this.accessory.accessoryName = accessoryy.split("-")[1];
    // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) + parseInt(this.accessory.accessoryValue)).toString();
    this.affinity.motorDetails.accessories.push(this.accessory);
    this.accessory = new MotorAccessories();
    console.log(this.affinity.motorDetails.accessories);
  }

  removeAccessory(accessory: MotorAccessories) {
    const index: number = this.affinity.motorDetails.accessories.indexOf(accessory);
    // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) - parseInt(accessory.accessoryValue)).toString();
    if (index !== -1) {
      this.affinity.motorDetails.accessories.splice(index, 1);
    }
  }

  selectProduct(product, description) {
    this.affinity.motorDetails.productId = product;
    this.affinity.productId = product;
    this.affinity.motorDetails.motorTypeIdHolder = "100-PRIVATE CAR";
    this.affinity.motorDetails.motorTypeId = "100";
    this.affinity.motorDetails.motorType = "PRIVATE CAR";
    this.viewCoverage(description, '');
    this.chooseType();

    this.commonService.sleep(1000).then(() => {
      this.commonService.scrollToElement("tellUsVehicle", 500);
    });

    $("#compreCard").removeClass("card-shadow");
    $("#ctplCard").removeClass("card-shadow");

    if (this.affinity.productId == "10001") {
      $("#compreCard").addClass("card-shadow");
    } else {
      $("#ctplCard").addClass("card-shadow");
    }
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
          this.coverage = new Coverages();

        }
        this.spinner.hide();
        this.affinity.coverages = this.coverageList;
      });
  }

  nextStepAction() {
    if (this.checker.checkIfRequired('motor-quote') == "1") {
      if (this.affinity.productId == "10002") {
        let currentYearDiff = (m().year() - parseInt(this.affinity.motorDetails.modelYear));
        let incepExpiryDiff = m(new Date(this.affinity.motorDetails.policyPeriodTo)).diff(new Date(this.affinity.motorDetails.policyPeriodFrom), 'months', true);

        if (currentYearDiff <= 2) {
          if (incepExpiryDiff != 36) {
            Swal.fire({
              type: 'error',
              title: 'Quotation Issuance',
              text: "Three (3) years policy period is required when vehicle age is below two (2) years old."
            });
            return null;
          }
        } else {
          if (incepExpiryDiff < 12 || incepExpiryDiff > 23) {
            Swal.fire({
              type: 'error',
              title: 'Quotation Issuance',
              text: "One (1) year to Twenty Three (23) months policy period is required when vehicle age is more than two (2) years old."
            });
            return null;
          }
        }
      }

      if (!this.affinity.motorDetails.plateNumber && !this.affinity.motorDetails.conductionNumber) {
        Swal.fire({
          type: 'error',
          title: 'Quotation Issuance',
          text: "Conduction Sticker No. or Plate No. is required"
        });
        return null;
      }

      let pass = "0";

      if (this.affinity.motorDetails.plateNumber) {
        if (!this.validatePlateNumber()) {
          return null;
        }

        pass = "1";
      }

      if (this.affinity.motorDetails.conductionNumber || pass == "0") {
        if (!this.validateConduction()) {
          return null;
        }
      }

      if (!this.validateEngine()) {
        return null;
      }

      if (!this.validateChassis()) {
        return null;
      }
      let totalCheck = 0;
      if (this.affinity.motorDetails.accessories.length > 0) {
        for (let i = 0; i < this.affinity.motorDetails.accessories.length; i++) {
          totalCheck = totalCheck + parseFloat(this.affinity.motorDetails.accessories[i].accessoryValue);
        }
      }
      totalCheck = totalCheck + parseFloat(this.affinity.motorDetails.FMV);

      if (totalCheck > 5000000) {

        Swal.fire({
          title: 'Quotation Issuance',
          text: "Motor vehicle with more than 5 million total sum insured requires underwriting approval.",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d31d29',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Revise Values',
          confirmButtonText: 'Proceed to Next Step'
        }).then((result) => {

          if (!result.value) {
            return null;
          }

          this.nextStep.emit("personalInformation");
          this.backButton.emit("motorQuotationIssuance");
          this.affinityOutput.emit(this.affinity);

        });

      } else {
        this.nextStep.emit("personalInformation");
        this.backButton.emit("motorQuotationIssuance");
        this.affinityOutput.emit(this.affinity);
      }
    }
  }

  validatePlateNumber() {
    if (this.affinity.productId == "10002") {
      return true;
    }

    const userKeyRegExpPlate = /^[A-Z]{3}[0-9]{4}?$/;

    this.affinity.motorDetails.plateNumber = this.affinity.motorDetails.plateNumber.toUpperCase();

    let valid = userKeyRegExpPlate.test(this.affinity.motorDetails.plateNumber);

    if (!valid) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Invalid Plate Number format, please make sure you follow the format ABC1234."
      });

    }

    return valid;
  }

  validateEngine() {
    let valid = this.validateEngineChassis(this.affinity.motorDetails.motorNumber);
    if (!valid) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Invalid Engine Number format, please make sure Engine Number includes number and alphabet characters."
      });

    }
    return valid;
  }

  validateChassis() {
    let valid = this.validateEngineChassis(this.affinity.motorDetails.serialNumber);
    if (!valid) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Invalid Chassis Number format, please make sure Chassis Number includes number and alphabet characters."
      });
    }
    return valid;
  }

  validateEngineChassis(numb) {
    const alphaNumeric = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;

    if (numb.length < 5) {
      return false;
    }
    if (!alphaNumeric.test(numb)) {
      return false;
    }

    return true;
  }

  validateConduction() {

    const userKeyRegExpConduction = /^[A-Z]{2}[0-9]{4}?$/;

    this.affinity.motorDetails.conductionNumber = this.affinity.motorDetails.conductionNumber.toUpperCase();

    let validCond = userKeyRegExpConduction.test(this.affinity.motorDetails.conductionNumber);

    if (!validCond) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Invalid Conduction Number format, please make sure you follow the format AB1234."
      });
    }

    return validCond;
  }

  backButtonAction() {
    this.nextStep.emit("initialize");
    this.backButton.emit("");
    this.affinityOutput.emit(this.affinity);
  }
}
