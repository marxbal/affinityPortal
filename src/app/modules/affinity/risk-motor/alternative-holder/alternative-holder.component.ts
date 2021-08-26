import {
  Component,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {
  IsRequired
} from '../../../../guard/is-required';
import {
  Affinity
} from '../../../../objects/affinity';
import {
  Risk
} from '../../../../objects/risk';
import {
  AuthService
} from '../../../../services/auth.service';
import {
  AddressDetails
} from '../../../../objects/address-details';
import {
  CommonService
} from 'src/app/services/common.service';

@Component({
  selector: 'app-alternative-holder',
  templateUrl: './alternative-holder.component.html',
  styleUrls: ['./alternative-holder.component.css']
})
export class AlternativeHolderComponent implements OnInit {

  constructor(
    private caller: AuthService,
    private checker: IsRequired,
    private common: CommonService) {}

  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput2 = new EventEmitter();

  director: Risk;
  stockholder: Risk;
  beneficiary: Risk;
  permanentAddressTitle: String = "Permanent Address";
  presentAddressTitle: String = "Present Address";
  pbAddressTitle: String = "Principal Business Address";
  tempAddresses: AddressDetails[] = [];

  addAddress: String = "";
  addressTypeLov: any[] = [];

  affinityAlternative: Affinity;

  ngOnInit() {
    this.director = new Risk();
    this.stockholder = new Risk();
    this.beneficiary = new Risk();
    this.affinityAlternative = new Affinity();

    this.caller.getOptionList('EN', 'TIP_ETIQUETA', '999').subscribe(
      result => {
        result.splice(2, 1);
        // result.splice(1, 1);
        this.addressTypeLov = result;
        this.affinityAlternative.lov.addressLOV = result;
      });

    this.caller.getOptionList('EN', 'TIP_ASEG_PREF', '999').subscribe(
      result => {
        this.affinityAlternative.lov.prefixLOV = result;
      });

    this.caller.getOptionList('EN', 'TIP_ASEG_SEP_LOV', '999').subscribe(
      result => {
        this.affinityAlternative.lov.separatorLOV = result;
      });

    this.caller.getLOV('A1002300', '3', 'COD_CIA~1').subscribe(
      result => {
        this.affinityAlternative.lov.documentLOV = result;
      });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.affinityAlternative.lov.civilStatusLOV = result;
      });

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.affinityAlternative.lov.suffixLOV = result;
      });

    this.caller.getLOV("A1000101", "1", "").subscribe(
      result => {
        this.affinityAlternative.lov.nationalityLOV = result;
      });
  }

  blacklist() {
    const retVal = this.common.blacklist(this.affinityAlternative.riskDetails.nationality);
    this.affinityAlternative.riskDetails.nationality = retVal;
  }

  addHolder() {
    if (this.checker.checkIfRequired('motor-add-alternative') == "0") {
      return null;
    }

    let hold = this.affinityAlternative.riskDetails.separator;
    this.affinityAlternative.riskDetails.separator = hold.split("-")[0];
    this.affinityAlternative.riskDetails.separatorText = hold.split("-")[1];

    this.affinityOutput2.emit(this.affinityAlternative);
    this.nextStep.emit(this.affinityAlternative);
  }

  backButtonAction() {
    this.nextStep.emit(this.affinityAlternative);
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

    this.affinityAlternative.lov.addressLOV.push(temp);
  }

  catchAddress(permAddress) {
    this.removeAddressType(permAddress.addressTypeId);
    this.addAddress = "";
    this.tempAddresses.push(permAddress);
    if (permAddress.addressTypeId == "1") {
      this.affinityAlternative.riskDetails.homeAddress = permAddress;
      return null;
    }

    this.affinityAlternative.riskDetails.officeAddress = permAddress;
  }

  removeAddressType(addressTypeId) {
    let index = 0;
    for (let i = 0; i < this.affinityAlternative.lov.addressLOV.length; i++) {
      if (addressTypeId == this.affinityAlternative.lov.addressLOV[i].TIP_ETIQUETA) {
        index = i;
        break;
      }
    }
    this.affinityAlternative.lov.addressLOV.splice(index, 1);
  }

}
