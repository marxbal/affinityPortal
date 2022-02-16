import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {
  Affinity
} from '../../../objects/affinity';
import * as m from 'moment';
import {
  IsRequired
} from '../../../guard/is-required';
import {
  MotorAccessories
} from '../../../objects/motor-accessories';
import {
  AuthService
} from '../../../services/auth.service';
import {
  CommonService
} from '../../../services/common.service';
import Swal from 'sweetalert2';
import {
  NgxSpinnerService
} from 'ngx-spinner';

@Component({
  selector: 'app-motor-policy',
  templateUrl: './motor-policy.component.html',
  styleUrls: ['./motor-policy.component.css']
})
export class MotorPolicyComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private checker: IsRequired,
    private commonService: CommonService,
    private spinner: NgxSpinnerService) {}

  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  accessory: MotorAccessories;
  fmv: number = 0;
  isCTPL: boolean = false;
  isMotorcycle: boolean = false;
  showEffDate: boolean = false;

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  minRetro: String = m().subtract(6, 'month').format('YYYY-MM-DD');

  ngOnInit() {

    if (!this.affinity) {
      this.affinity = new Affinity();
    }

    this.accessory = new MotorAccessories();

    this.fmv = parseFloat(this.affinity.motorDetails.FMV);

    this.isCTPL = this.affinity.productId == "10002";
    this.isMotorcycle = this.affinity.lineId == "120";
    this.showEffDate = this.isCTPL && this.isMotorcycle;

    // this.chooseModelYear();

    this.caller.getLOV("A2100800", "1", '').subscribe(
      result => {
        this.affinity.lov.colorLOV = result;
      });

    this.caller.doCallService('/afnty/getMortgagees', null).subscribe(
      result => {
        this.affinity.lov.mortgageeLOV = result;
      });

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

  validatePlateNumber() {
    const isValid = this.commonService.validatePlateNumber(this.affinity);
    return isValid;
  }

  validateConduction() {
    const isValid = this.commonService.validateConduction(this.affinity);
    return isValid;
  }

  limitFMV(evt: any) {
    var target = evt.target;

    try  {
      const val = parseFloat(target.value);

      const percentage = this.fmv * .10;
      const maxFMV = this.fmv + percentage;
      const minFMV = this.fmv - percentage;

      if (val > maxFMV || val < minFMV) {
        this.affinity.motorDetails.FMV = this.fmv.toString();
        Swal.fire({
          type: 'error',
          title: 'Invalid FMV value',
          text: "Invalid FMV value, value should be higher than " + minFMV + " or lower than " + maxFMV
        });
      }
    } catch (err) {
      this.affinity.motorDetails.FMV = this.fmv.toString();
      Swal.fire({
        type: 'error',
        title: 'Invalid FMV value',
        text: "Invalid FMV format, please enter numbers only"
      });
    }
  }

  chooseVTPL() {
    this.affinity.motorDetails.propertyDamageLimit = this.affinity.motorDetails.bodilyInjuryLimit;
  }

  chooseType() {
    this.caller.getLOV("A2100400", "5", 'COD_CIA~1|COD_RAMO~' + this.affinity.motorDetails.motorTypeId).subscribe(
      result => {
        this.affinity.lov.makeLOV = result;
      });
  }

  chooseMake() {
    this.caller.getLOV('A2100410', '5', 'COD_RAMO~' + this.affinity.motorDetails.motorTypeId + '|COD_MARCA~' + this.affinity.motorDetails.manufacturerId + '|COD_CIA~1').subscribe(
      result => {
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
    this.caller.getLOV('A2100100', '4', 'NUM_COTIZACION~1|COD_MARCA~' + this.affinity.motorDetails.manufacturerId + '|COD_MODELO~' + this.affinity.motorDetails.modelId + '|COD_CIA~1').subscribe(
      result => {
        this.affinity.lov.variantLOV = result;
        this.affinity.motorDetails.vehicleTypeIdHolder = "";
        this.affinity.motorDetails.modelYear = "";
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";

        this.affinity.lov.yearList = [];
        this.affinity.lov.subModelLOV = [];
      });
  }

  chooseEffectivityDate() {
    this.spinner.show();
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
    this.spinner.hide();

    let isRetro = m().isAfter(this.affinity.motorDetails.policyPeriodFrom, 'day');
    let isBelowSix = m(this.affinity.motorDetails.policyPeriodFrom).isBefore(m().subtract(6, 'month'));

    $("#vehiclePhotosContainer").addClass("hidden");

    if (!isRetro) {
      return null;
    }

    $("#vehiclePhotosContainer").removeClass("hidden");

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

  chooseVariant() {
    this.caller.getLOV('A2100430', '4', 'NUM_COTIZACION~1|COD_MARCA~' + this.affinity.motorDetails.manufacturerId + '|COD_MODELO~' + this.affinity.motorDetails.modelId + '|COD_TIP_VEHI~' + this.affinity.motorDetails.vehicleTypeId + '|COD_CIA~1').subscribe(
      result => {
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

    this.caller.getLOV('A2100601', '2', 'COD_CIA~1|cod_tip_vehi~' +
      $("#vehicleTypeId").val().split("-")[0] + '|fec_validez~' +
      this.affinity.motorDetails.validityDate).subscribe(
      result => {
        for (let i = 0; i < result.length; i++) {
          let accesoryType = "Additional";
          if (result[i].ABR_AGRUP_ACCESORIO == "B") {
            accesoryType = "Built-in";
          } else if (result[i].ABR_AGRUP_ACCESORIO == "F") {
            accesoryType = "Free";

          }
          result[i].ABR_AGRUP_ACCESORIO = accesoryType;
        }
        this.affinity.lov.accessoryLOV = result;
      });
  }

  chooseModelYear() {
    $("#vehiclePhotosContainer").addClass("hidden");
    if ((m().year() - parseInt(this.affinity.motorDetails.modelYear)) > 8) {
      $("#vehiclePhotosContainer").removeClass("hidden");

      Swal.fire({
        type: 'warning',
        title: 'Policy Issuance',
        text: "Vehicle more than eight (8) years old is subject to approval. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });

    }

    this.caller.getLOV('A2100420', '4', 'NUM_COTIZACION~1|COD_MARCA~' +
      this.affinity.motorDetails.manufacturerId + '|COD_MODELO~' +
      this.affinity.motorDetails.modelId + '|COD_TIP_VEHI~' +
      this.affinity.motorDetails.vehicleTypeId + '|ANIO_SUB_MODELO~' + this.affinity.motorDetails.modelYear).subscribe(
      result => {
        this.affinity.lov.subModelLOV = result;
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";
      });
  }

  chooseSubModel() {
    this.caller.getLOV('A2100200', '5', 'NUM_COTIZACION~1' +
      '|COD_RAMO~' + this.affinity.motorDetails.motorTypeId +
      '|COD_MARCA~' + this.affinity.motorDetails.manufacturerId +
      '|COD_MODELO~' + this.affinity.motorDetails.modelId +
      '|COD_TIP_VEHI~' + this.affinity.motorDetails.vehicleTypeId +
      '|ANIO_SUB_MODELO~' + this.affinity.motorDetails.modelYear).subscribe(
      result => {
        this.affinity.lov.typeOfUseLOV = result;

        this.caller.doCallService('/afnty/getFMV?codCia=1&codMarca=' +
          this.affinity.motorDetails.manufacturerId + '&codModelo=' +
          this.affinity.motorDetails.modelId + '&codSubModelo=' +
          this.affinity.motorDetails.subModelId + '&anioSubModelo=' +
          this.affinity.motorDetails.modelYear, null).subscribe(
          resulta => {
            this.fmv = parseFloat(resulta);
            this.affinity.motorDetails.FMV = resulta;
          });

      });
  }

  onSelect(event) {
    this.affinity.motorDetails.vehiclePhotos.push(...event.addedFiles);
  }

  onRemove(event) {
    this.affinity.motorDetails.vehiclePhotos.splice(this.affinity.motorDetails.vehiclePhotos.indexOf(event), 1);
  }

  addAccessory() {
    let accessoryy = this.accessory.accessoryIdHolder;
    this.accessory.accessoryId = accessoryy.split("-")[0];
    this.accessory.accessoryName = accessoryy.split("-")[1];

    // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) + parseInt(this.accessory.accessoryValue)).toString();

    this.affinity.motorDetails.accessories.push(this.accessory);
    this.accessory = new MotorAccessories();
  }

  removeAccessory(accessory: MotorAccessories) {
    const index: number = this.affinity.motorDetails.accessories.indexOf(accessory);

    // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) - parseInt(this.accessory.accessoryValue)).toString();

    if (index !== -1) {
      this.affinity.motorDetails.accessories.splice(index, 1);
    }
  }

  nextStepAction() {
    if (this.checker.checkIfRequired('motor-policy-issuance') == "0") {
      return null;
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

    if (((m().year() - parseInt(this.affinity.motorDetails.modelYear)) > 8) && this.affinity.motorDetails.vehiclePhotos.length < 1) {

      Swal.fire({
        type: 'warning',
        title: 'Policy Issuance',
        text: "Vehicle more than eight (8) years old is subject to approval. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });

      $("#vehiclePhotosContainer").removeClass("hidden");
      return null;

    }

    if (this.isCTPL && !this.isMotorcycle) {
      let currentYearDiff = (m().year() - parseInt(this.affinity.motorDetails.modelYear));
      let incepExpiryDiff = m(new Date(this.affinity.motorDetails.policyPeriodTo)).diff(new Date(this.affinity.motorDetails.policyPeriodFrom), 'months', true);


      if (currentYearDiff <= 2) {
        if (incepExpiryDiff != 36) {
          Swal.fire({
            type: 'error',
            title: 'Policy Issuance',
            text: "Three (3) years policy period is required when vehicle age is below two (2) years old."
          });
          return null;
        }
      } else {
        if (incepExpiryDiff < 12 || incepExpiryDiff > 23) {
          Swal.fire({
            type: 'error',
            title: 'Policy Issuance',
            text: "One (1) year to Twenty Three (23) months policy period is required when vehicle age is more than two (2) years old."
          });
          return null;
        }
      }

    }

    let isRetro = m().isAfter(this.affinity.motorDetails.policyPeriodFrom, 'day');

    if (isRetro && this.affinity.motorDetails.vehiclePhotos.length < 1) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "Policy inception should not be prior date today. Submission of current pictures of all sides of the risk is required for evaluation of acceptance of MAPFRE Insurance prior issuance of policy."
      });
      $("#vehiclePhotosContainer").removeClass("hidden");
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
        title: 'Policy Issuance',
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

        if (this.affinity.motorDetails.isMortgaged) {
          this.affinity.motorDetails.mortgageeId = this.affinity.motorDetails.mortgageeIdHolder.split(":=:")[0];
          this.affinity.motorDetails.mortgagee = this.affinity.motorDetails.mortgageeIdHolder.split(":=:")[1];
        }

        this.nextStep.emit("riskInformation");
        this.affinityOutput.emit(this.affinity);

      });

    } else {
      if (this.affinity.motorDetails.isMortgaged) {
        this.affinity.motorDetails.mortgageeId = this.affinity.motorDetails.mortgageeIdHolder.split(":=:")[0];
        this.affinity.motorDetails.mortgagee = this.affinity.motorDetails.mortgageeIdHolder.split(":=:")[1];
      }
      this.nextStep.emit("riskInformation");
      this.affinityOutput.emit(this.affinity);
    }
  }
}
