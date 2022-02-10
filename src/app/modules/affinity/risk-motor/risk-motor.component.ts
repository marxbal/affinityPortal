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
  AuthService
} from '../../../services/auth.service';
import {
  AddressDetails
} from '../../../objects/address-details';
import * as m from 'moment';
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
  A1000131_MPH
} from '../../../objects/a1000131_mph';
import {
  CommonService
} from '../../../services/common.service';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import {
  Router
} from '@angular/router';
import { FileDetails } from 'src/app/objects/file-details';
import { Return } from 'src/app/objects/return';

@Component({
  selector: 'app-risk-motor',
  templateUrl: './risk-motor.component.html',
  styleUrls: ['./risk-motor.component.css']
})
export class RiskMotorComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private common: CommonService,
    private spinner: NgxSpinnerService,
    private checker: IsRequired,
    private router: Router) {}

  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput2 = new EventEmitter();

  director: Risk;
  stockholder: Risk;
  beneficiary: Risk;
  permanentAddressTitle: String = "Permanent Address";
  presentAddressTitle: String = "Present Address";
  pbAddressTitle: String = "Principal Business Address";
  tempAddresses: AddressDetails[] = [];

  showUploadBtn: boolean = true;
  filename: String = "";
  file: File;

  p2000030: P2000030 = new P2000030();
  p2000020: P2000020[] = [];
  p2000040: P2000040[] = [];
  p2100610: P2100610[] = [];
  p2000060: P2000060[] = [];
  p2000025: P2000025[] = [];
  a1000131_MPH: A1000131_MPH[] = [];
  p2000031: P2000031 = new P2000031();
  p1001331: P1001331 = new P1001331();
  p1001331List: P1001331[] = [];

  addAddress: String = "";
  addAlternativeShow: String = "";
  addressTypeLov: any[] = [];

  alternativeHolder: Affinity[] = [];

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    this.director = new Risk();
    this.stockholder = new Risk();
    this.beneficiary = new Risk();

    this.spinner.show();

    this.caller.getLOV('A1000100', '9', 'COD_PAIS~PHL').subscribe(
      result => {
        this.affinity.lov.provinceLOV = result;
      });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        this.affinity.lov.documentLOV = result;
      });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.affinity.lov.civilStatusLOV = result;
      });

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.affinity.lov.suffixLOV = result;
      });

    this.caller.getLOV("A1000101", "1", "").subscribe(
      result => {
        this.affinity.lov.nationalityLOV = result;
      });

    this.caller.getOptionList('EN', 'TIP_ETIQUETA', '999').subscribe(
      result => {
        result.splice(2, 1);
        this.addressTypeLov = result;
        this.affinity.lov.addressLOV = result;
        this.spinner.hide();
      });

      if (!_.isEmpty(this.affinity.riskDetails.validIDValue)){
        this.checkPolicyHolder();
      }
  }

  blacklist(evt: any) {
    var target = evt.target;
    const retVal = this.common.blacklist(target);
    this.affinity.riskDetails.nationality = retVal;
  }

  addAlternativeHolderModal() {
    this.addAlternativeShow = "";

    this.common.sleep(10).then(() => {
      this.addAlternativeShow = "show";
    });
  }

  addAlternative(alternative: Affinity) {
    this.alternativeHolder.push(alternative);
  }

  modalAction(action) {
    $("#closeModal").trigger("click");
  }

  openAddress() {
    this.addAddress = "add";
  }

  removeAddressList(address) {
    const index: number = this.tempAddresses.indexOf(address);

    if (index !== -1) {
      this.tempAddresses.splice(index, 1);
    }
    let temp = null;
    if (address.addressTypeId == "1") {
      temp = {
        "NOM_VALOR": "HOME",
        "TIP_ETIQUETA": "1"
      };
    } else {
      temp = {
        "NOM_VALOR": "OFFICE",
        "TIP_ETIQUETA": "2"
      };
    }

    this.affinity.lov.addressLOV.push(temp);
  }

  setCorrespondent(corrAddress) {
    this.affinity.riskDetails.mailingAddressId = corrAddress.addressTypeId;

    for (let i = 0; i < this.tempAddresses.length; i++) {
      this.tempAddresses[i].mailingAddress = "0";
    }

    const index: number = this.tempAddresses.indexOf(corrAddress);
    this.tempAddresses[index].mailingAddress = "1";
  }

  catchAddress(permAddress) {
    this.removeAddressType(permAddress.addressTypeId);
    this.addAddress = "";
    permAddress.mailingAddress = "0";
    if (this.tempAddresses.length == 0) {
      permAddress.mailingAddress = "1";
    }

    this.tempAddresses.push(permAddress);
    if (permAddress.addressTypeId == "1") {
      this.affinity.riskDetails.homeAddress = permAddress;
      return null;
    }

    this.affinity.riskDetails.officeAddress = permAddress;
  }

  removeAddressType(addressTypeId) {
    let index = 0;
    for (let i = 0; i < this.affinity.lov.addressLOV.length; i++) {
      if (addressTypeId == this.affinity.lov.addressLOV[i].TIP_ETIQUETA) {
        index = i;
        break;
      }
    }
    this.affinity.lov.addressLOV.splice(index, 1);
  }

  clearIdNumber() {
    this.affinity.riskDetails.validIDValue = "";
  }

  checkPolicyHolder() {
    const fileDetails = new FileDetails();
    fileDetails.documentCode = this.affinity.riskDetails.validID;
    fileDetails.documentType = this.affinity.riskDetails.validIDValue;

    this.caller.doCallService("/afnty/updocs/check", fileDetails).subscribe(
      result => {
        const r = result as Return;
        if (r.status) {
          if (r.obj) {
              Swal.fire({
                type: 'info',
                title: 'File Checking',
                text: r.message
              });
              // this.file = null;
              this.filename = "";
              this.file = null;
          }
          this.showUploadBtn = !r.obj;
        } else {
          Swal.fire({
            type: 'error',
            title: 'File Checking',
            text: r.message
          });
        }
      });
  }

  testUpload(){
    const fd = new FormData();
    if (this.file != null) {
      fd.append('file', this.file);
    }
    fd.append('documentCode', this.affinity.riskDetails.validID);
    fd.append('documentType', this.affinity.riskDetails.validIDValue);

    this.caller.doCallService("/afnty/updocs/upload", fd).subscribe(
      result => {
        const r = result as Return;
        if (r.status) {
          if (r.obj["proceed"]) {
              Swal.fire({
                type: 'info',
                title: 'File Uploading',
                text: r.message
              });
              // this.file = null;
              this.filename = "";
              this.file = null;
          }
        } else {
          Swal.fire({
            type: 'error',
            title: 'File Uploading',
            text: r.message
          });
        }
      });
  }

  onFileChanged(event: any) {
    const file = event.target.files[0];

    if (file.size > 1024000) {
      Swal.fire({
        type: 'error',
        title: 'Upload File',
        text: "File exceeds limit (1mb)"
      });
    } else {
      this.file = file;
      this.filename = file.name;
      this.checkPolicyHolder();
    }
  }

  addCompanyDetail(type) {
    switch (type) {
      case "director":
        this.affinity.motorDetails.directors.push(this.director);
        this.director = new Risk();
        break;
      case "stockholder":
        this.affinity.motorDetails.stockholders.push(this.stockholder);
        this.stockholder = new Risk();
        break;

      default:
        this.affinity.motorDetails.beneficiaries.push(this.beneficiary);
        this.beneficiary = new Risk();
        break;
    }
  }

  removeCompanyDetail(detail: Risk, type) {
    switch (type) {
      case "director":
        let index1: number = this.affinity.motorDetails.directors.indexOf(detail);

        if (index1 !== -1) {
          this.affinity.motorDetails.directors.splice(index1, 1);
        }
        break;
      case "stockholder":
        let index2: number = this.affinity.motorDetails.stockholders.indexOf(detail);

        if (index2 !== -1) {
          this.affinity.motorDetails.stockholders.splice(index2, 1);
        }
        break;

      default:
        let index: number = this.affinity.motorDetails.beneficiaries.indexOf(detail);

        if (index !== -1) {
          this.affinity.motorDetails.beneficiaries.splice(index, 1);
        }
        break;
    }
  }

  reAssign(value, field) {
    let originalValue = value;
    this.affinity.motorDetails[field] = originalValue.split("-")[0];
    this.affinity.motorDetails[field.slice(0, -1)] = originalValue.split("-")[1];
  }

  nextStepAction(nextStep) {
    if (this.checker.checkIfRequired('motor-policy-details') == "0") {
      return null;
    }

    if (this.tempAddresses.length < 1) {
      Swal.fire({
        type: 'error',
        title: 'Policy Issuance',
        text: "At least one address is required."
      });
      return null;
    }

    let option = "Over the Counter as your payment option, please make sure that your email is " + this.affinity.riskDetails.emailAddress;
    let imges = "";

    if (this.affinity.paymentOption == "cc") {
      option = "Credit Card as your payment option";
      imges = "<img src='assets/images/paynamics-logo.png' style='width: 100px; margin: 0 auto;' alt='paynamics-logo'/>";
    }

    Swal.fire({
      title: 'Policy Issuance',
      html: "<p>You've selected " + option + ",</p><p>Proceed to Payment?</p>" + imges,
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
      let motorFields = ["manufacturerId", "modelId", "vehicleTypeId", "subModelId", "vehicleUsedId", "colorId", "usageAreaId"];

      for (let i = 0; i < motorFields.length; i++) {
        this.reAssign(this.affinity.motorDetails[motorFields[i] + "Holder"], motorFields[i]);
      }

      this.p2000030 = new P2000030();
      this.p2000020 = [];
      this.p2000040 = [];
      this.p2100610 = [];
      this.p2000060 = [];
      this.p2000025 = [];
      this.p2000031 = new P2000031();
      this.p1001331 = new P1001331();
      this.p1001331List = [];

      this.p1001331 = this.common.assignP1001331(this.affinity);
      this.p1001331List.push(this.p1001331);

      if (this.alternativeHolder.length > 0) {
        this.affinity.alternativeHolders = [];
        for (let i = 0; i < this.alternativeHolder.length; i++) {
          let tempP1331: P1001331 = new P1001331();
          tempP1331 = this.common.assignP1001331(this.alternativeHolder[i]);
          this.p1001331List.push(tempP1331);

          this.affinity.alternativeHolders.push(this.alternativeHolder[i].riskDetails);
        }
      }

      this.p2000025 = this.common.assignP2000025(this.affinity);
      this.p2000030 = this.common.assignP2000030(this.affinity);
      this.p2000031 = this.common.assignP2000031(this.affinity, this.p2000030);
      this.p2000020 = this.common.assignP2000020(this.affinity);
      this.p2000040 = this.common.assignP2000040(this.affinity);
      this.p2000060 = this.common.assignP2000060(this.affinity, 'policy');
      this.p2100610 = this.common.assignP2100610(this.affinity);
      this.a1000131_MPH = this.common.assignA1000131_MPH(this.affinity);

      let param = {
        "fName": this.affinity.riskDetails.firstName,
        "mName": this.affinity.riskDetails.middleName,
        "lName": this.affinity.riskDetails.lastName,
        "codDoc": this.affinity.riskDetails.validIDValue,
        "tipDoc": this.affinity.riskDetails.validID,
        "province": this.affinity.riskDetails.correspondentAddress.provinceDetailId,
        "municipality": this.affinity.riskDetails.correspondentAddress.municipalityDetailId,
        "address1": this.affinity.riskDetails.correspondentAddress.addressDetails,
        "zipCode": this.affinity.riskDetails.correspondentAddress.zipCode,
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
        "paymentOption": this.affinity.paymentOption,
        "tipCocafRegistration": "R",
        "codModalidad": this.affinity.productId,
        "clientId": this.affinity.clientId,
        "codRamo": this.affinity.motorDetails.motorTypeId,
        "p2000030": this.p2000030,
        "p2000031": this.p2000031,
        "p1001331": this.p1001331,
        "p1001331List": this.p1001331List,
        "p2000020List": this.p2000020,
        "p2000040List": this.p2000040,
        "p2000060List": this.p2000060,
        "p2100610List": this.p2100610,
        "p2000025List": this.p2000025,
        "a1000131_mphList": this.a1000131_MPH
      };

      this.spinner.show();
      this.caller.doCallService('/afnty/issuePolicy', param).subscribe(
        result => {
          switch (result.status) {
            case 1:
              this.affinity.policyNumber = result.message;
              const paymentOption = this.affinity.paymentOption;
              if (paymentOption == "co") {
                this.router.navigate(['issuance/51359e8b51c63b87d50cb1bab73380e2/' + result.message]);
                setTimeout(function () {
                  window.location.reload();
                }, 10);
              } else {
                this.common.payment(this.affinity);
              }
              break;
            case 2:
              this.affinity.policyNumber = result.message;
              this.affinity.techControl = result.message2.split("~");
              this.affinity = this.common.identifyTechControl(this.affinity);

              if (this.affinity.techControlLevel == "1") {
                window.open(result.message, "_self");
              } else {
                this.caller.doCallService('/afnty/getPaymentBreakdown?numPoliza=' + result.message + '&type=P', null).subscribe(
                  paymentBreakdown => {
                    this.affinity.premiumBreakdown = paymentBreakdown;
                    this.getCoverages(result.message, this.affinity, "techControl");
                  });
              }
              break;
            default:
              Swal.fire({
                type: 'error',
                title: 'Policy Issuance',
                text: result.message
              });
              this.spinner.hide();
              break;
          }
        });
    });
  }

  getCoverages(numPoliza, affinity: Affinity, nextStep) {
    this.common.getCoverageByPolicy("A", numPoliza, affinity.motorDetails.subline).subscribe(
      (result) => {
        if (this.affinity.motorDetails.vehiclePhotos.length > 0) {
          let formData = this.common.assignFormDataUpload(this.affinity);
          formData.append('numPoliza', this.affinity.policyNumber);
          formData.append('fullName', this.affinity.riskDetails.firstName + " " + (this.affinity.riskDetails.firstName) ? this.affinity.riskDetails.firstName : "");
          this.caller.doCallService("/afnty/uploadFile", formData).subscribe(
            uResult => {
              console.log("upload result:");
              console.log(uResult);
            });
        }

        affinity.coveragesValue = [];
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

        affinity.coveragesValue = _.orderBy(affinity.coveragesValue, 'numSecu', 'asc');

        this.spinner.hide();
        this.nextStep.emit(nextStep);
        this.affinityOutput2.emit(affinity);
      });
  }

  backButtonAction() {
    this.nextStep.emit("motorPolicyIssuance");
    this.affinityOutput2.emit(this.affinity);
  }
}