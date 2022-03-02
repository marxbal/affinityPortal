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
import * as _ from 'lodash';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private checker: IsRequired,
    public router: Router,
    private auth: AuthenticationService) {}

  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();
  @Output() backButton = new EventEmitter();

  @Input() product: string;
  @Input() description: String;

  carType: Array<{}> = [];

  accessory: MotorAccessories;
  coverageList: Coverages[] = [];
  coverage: Coverages = new Coverages();
  title: String = "";

  homePageUrl: string = "";

  hasPlateNumber: boolean = true;
  isCTPL: boolean = false;
  isMotorcycle: boolean = false;
  orCode: String = "";

  showEffDate: boolean = false;
  effYearlist: any = [];
  effMonth: String = "";
  effDay: String = "1";
  effYear: number = 0;
  registrationDate: string = m().format('YYYY-MM-DD');

  fmv: number = 0;

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  minRetro: String = m().subtract(6, 'month').format('YYYY-MM-DD');
  maxDate: String = m().format('YYYY-MM-DD');

  ngOnInit() {
    this.selectProduct(this.product, this.description);
    this.getCarType();

    this.homePageUrl = environment.baseUrl + this.auth.getLandingPage();

    if (!this.affinity) {
      this.affinity = new Affinity();
    }

    this.accessory = new MotorAccessories();

    this.spinner.show();

    this.caller.getLOV("A2100800", "1", '').subscribe(
      result => {
        this.affinity.lov.colorLOV = result;
      });

    this.affinity.motorDetails.bodilyInjuryLimit = "250000";
    this.affinity.motorDetails.propertyDamageLimit = "250000";

    this.isCTPL = this.affinity.productId == "10002";

    const currentMonth = m().add(1, 'month').format('MMM');
    const currentYear = m().get('year');
    const previousYear = m().subtract(1, 'year').get('year');
    const nextYear = m().add(1, 'year').get('year');

    this.effYearlist.push(previousYear);
    this.effYearlist.push(currentYear);
    this.effYearlist.push(nextYear);
    this.effYear = currentYear;
    this.effMonth = currentMonth;

    // if (!this.isCTPL) {
    //   this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    //   this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
    // }
    if (!_.isEmpty(this.affinity.motorDetails.motorTypeId)) {
      this.isMotorcycle = this.affinity.motorDetails.motorTypeId == "120";
      this.showEffDate = this.isCTPL && this.isMotorcycle;
      this.effYear = m(this.affinity.motorDetails.policyPeriodFrom).get('year');
      const fromDate = m(this.affinity.motorDetails.policyPeriodFrom);
      this.effMonth = fromDate.format('MMM');
    } else {
      if (!this.isCTPL) {
        this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
        this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
      }
    }

    this.caller.doCallService("/afnty/getCoverageLimits?codRamo=100&codCob=1004", null).subscribe(
      result => {
        this.spinner.hide();
        this.affinity.lov.bodilyInjuryLOV = [];
        result.forEach(lov => {
          if (lov.impLimite == 250000 || lov.impLimite == 500000 || lov.impLimite == 1000000) {
            this.affinity.lov.bodilyInjuryLOV.push(lov);
          }
        });

        for (let i = 0; i < this.affinity.lov.bodilyInjuryLOV.length; i++) {
          this.affinity.lov.bodilyInjuryLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.affinity.lov.bodilyInjuryLOV[i].impLimite));
        }
      });

    this.caller.doCallService("/afnty/getCoverageLimits?codRamo=100&codCob=1005", null).subscribe(
      result => {
        this.spinner.hide();
        this.affinity.lov.propertyDamageLOV = [];
        result.forEach(lov => {
          if (lov.impLimite == 250000 || lov.impLimite == 500000 || lov.impLimite == 1000000) {
            this.affinity.lov.propertyDamageLOV.push(lov);
          }
        });

        for (let i = 0; i < this.affinity.lov.propertyDamageLOV.length; i++) {
          this.affinity.lov.propertyDamageLOV[i].impLimiteFormatted = this.formatter.format(parseFloat(this.affinity.lov.propertyDamageLOV[i].impLimite));
        }
      });
  }

  getCarType() {
    const products = this.auth.getProducts();
    products.forEach((p)=> {
      if (this.product == p.productId.toString()) {
        if (p.subline == 100) {
          this.carType.push({subline: "100-PRIVATE CAR", name: "PRIVATE CAR"});
        } else if (p.subline == 120) {
          this.carType.push({subline: "120-MOTORCYCLE", name: "MOTORCYCLE"});
        }
      }
    });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  changeRegistrationDate() {
    let registrationDate = m(this.registrationDate);
    const monthNumber = registrationDate.get('month') + 1;
    if (monthNumber < 11) {
      registrationDate = registrationDate.add(1, 'month')
    } else {
      registrationDate = registrationDate.set('month', 10);
    }
    registrationDate.set('date', 1);
    this.effMonth = registrationDate.format('MMM');

    this.affinity.motorDetails.policyPeriodFrom = registrationDate.format('YYYY-MM-DD');
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    this.createTemporaryPlateNumber();
  }

  chooseEffYear() {
    const date = m(this.affinity.motorDetails.policyPeriodFrom);
    this.affinity.motorDetails.policyPeriodFrom = date.set('year', this.effYear).format('YYYY-MM-DD');
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
  }

  changePlateNumber() {
    if (this.isCTPL) {
      const currentYear = m().get('year') + "-";
      this.affinity.motorDetails.policyPeriodFrom = m(currentYear + this.getMonthBasedOnPlate(this.affinity.motorDetails.plateNumber) + "-01").format('YYYY-MM-DD');
      const fromDate = m(this.affinity.motorDetails.policyPeriodFrom);
      this.effMonth = fromDate.format('MMM');
      this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');
    }

    this.validatePlateNumber();
  }

  clearPlateNumber() {
    this.affinity.motorDetails.plateNumber = "";
    this.orCode = "";
  }

  createTemporaryPlateNumber() {
    let suffix = "";
    const date = m(this.registrationDate);
    const month = date.get('month') + 1;
    if (month < 10) {
      suffix = "0" + month;
    } else {
      suffix = "10";
    }

    this.affinity.motorDetails.plateNumber = this.orCode + suffix;
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

    $("#vehiclePhotosContainer").addClass("hidden");
    this.spinner.hide();

    if (!isRetro) {
      return null;
    }

    Swal.fire({
      type: 'warning',
      title: 'Policy Issuance',
      text: "Submission of current pictures of all sides of the motor vehicle is required for evaluation of acceptance of MAPFRE Insurance prior to the issuance of the Policy."
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
    this.affinity.motorDetails.motorTypeId = this.affinity.motorDetails.motorTypeIdHolder.split("-")[0];
    this.affinity.motorDetails.motorType = this.affinity.motorDetails.motorTypeIdHolder.split("-")[1];

    this.isMotorcycle = this.affinity.motorDetails.motorTypeId == "120";
    this.showEffDate = this.isCTPL && this.isMotorcycle;

    if (this.isMotorcycle) {
      const date = m().add(1, 'month');
      date.set('date', 1);
      this.affinity.motorDetails.policyPeriodFrom = date.format('YYYY-MM-DD');
    } else {
      this.hasPlateNumber = true;
      this.affinity.motorDetails.policyPeriodFrom = m().format('YYYY-MM-DD');
    }
    this.affinity.motorDetails.policyPeriodTo = m(this.affinity.motorDetails.policyPeriodFrom).add(1, 'year').format('YYYY-MM-DD');

    this.commonService.chooseType(
      this.affinity.motorDetails.motorTypeId
    ).subscribe(
      (result) => {
        this.affinity.lov.makeLOV = result;
        this.affinity.motorDetails.modelIdHolder = "";
        this.affinity.motorDetails.vehicleTypeIdHolder = "";
        this.affinity.motorDetails.modelYear = "";
        this.affinity.motorDetails.subModelIdHolder = "";
        this.affinity.motorDetails.FMV = "";

        this.affinity.lov.modelLOV = [];
        this.affinity.lov.variantLOV = [];
        this.affinity.lov.yearList = [];
        this.affinity.lov.subModelLOV = [];
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
    if ((m().year() - parseInt(this.affinity.motorDetails.modelYear)) > 8 && !this.isMotorcycle) {
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
        this.affinity.motorDetails.subModelId = "";
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
      (result: any) => {
        const arr = [];
        result.forEach(r => {
          //add motorcycle only
          if (this.isMotorcycle) {
            if ( r.COD_USO_VEHI != "10" ) {
              arr.push(r);
            }
          } else {
            arr.push(r);
          }
        });
        this.affinity.lov.typeOfUseLOV = arr;
      });

    this.commonService.loadFMV(
      $("#manufacturerId").val().split("-")[0],
      $("#modelId").val().split("-")[0],
      $("#subModelId").val().split("-")[0],
      this.affinity.motorDetails.modelYear
    ).subscribe(
      (result) => {
        this.fmv = parseFloat(result);
        this.affinity.motorDetails.FMV = result
      });
  }

  chooseAccessory() {
    this.accessory.accessoryValue = this.accessory.accessoryIdHolder.split("-")[2];
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
    // this.affinity.motorDetails.FMV = (parseInt(this.affinity.motorDetails.FMV) - parseInt(accessory.accessoryValue)).toString();
    if (index !== -1) {
      this.affinity.motorDetails.accessories.splice(index, 1);
    }
  }

  selectProduct(product, description) {
    this.affinity.motorDetails.productId = product;
    this.affinity.productId = product;

    // this.viewCoverage(description, '');
    
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

  nextStepAction() {
    if (this.checker.checkIfRequired('motor-quote') == "1") {
      if (this.isCTPL && !this.isMotorcycle) {
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

      if (!this.hasPlateNumber && _.isEmpty(this.orCode) ) {
        Swal.fire({
          type: 'error',
          title: 'Quotation Issuance',
          text: "Field Office Code is required"
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

      if (!this.validateMV()) {
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
    const isValid = this.commonService.validatePlateNumber(this.affinity);
    return isValid;
  }

  validateConduction() {
    const isValid = this.commonService.validateConduction(this.affinity);
    return isValid;
  }

  validateEngine() {
    return this.validateSpecialCharacter(this.affinity.motorDetails.motorNumber, "Engine");
  }

  validateChassis() {
    return this.validateSpecialCharacter(this.affinity.motorDetails.serialNumber, "Chassis");
  }

  validateMV() {
    const mvFile = this.affinity.motorDetails.MVFileNumber;
    this.orCode = mvFile.slice(0, 4);
    return this.validateSpecialCharacter(mvFile, "MV File");
  }

  validateSpecialCharacter(number: string, label: string) {
    let valid = false;
    let message = "Invalid " + label + " Number format, please make sure " + label + " Number includes number and alphabet characters."
    if (label == "MV File") {
      valid = this.restrictSpecialCharacters(number);
      message = "Invalid " + label + " Number format, please make sure " + label + " Number excludes special characters."
    } else {
      valid = this.allowAlphaNumericOnly(number);
    }
    if (!valid) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: message
      });
    }
    return valid;
  }

  allowAlphaNumericOnly(numb: string) {
    const alphaNumeric = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;

    if (numb.length < 5) {
      return false;
    }
    if (!alphaNumeric.test(numb)) {
      return false;
    }

    return true;
  }

  restrictSpecialCharacters(input: string) {
    const regexp = /^[a-zA-Z0-9]+$/;
    
    if (!regexp.test(input)) {
      return false;
    }

    return true;
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

  // backButtonAction() {
  //   this.nextStep.emit("initialize");
  //   this.backButton.emit("");
  //   this.affinityOutput.emit(this.affinity);
  // }

  returnToHomepage() {
    window.location.href = environment.baseUrl + this.auth.getLandingPage();
  }
}
