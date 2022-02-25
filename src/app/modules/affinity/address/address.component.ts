import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  Affinity
} from '../../../objects/affinity';
import {
  AuthService
} from '../../../services/auth.service';
import {
  AddressDetails
} from '../../../objects/address-details';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {

  constructor(
    private caller: AuthService) {}
    
  @Input() title: String;
  @Input() affinity: Affinity;
  @Output() addressDetailsOutput = new EventEmitter();
  @Output() affinityOutput2 = new EventEmitter();

  address: AddressDetails = new AddressDetails();

  affinity2: Affinity = new Affinity();

  ngOnInit() {
    this.caller.getLOV('A1000100', '9', 'COD_PAIS~PHL').subscribe(
      result => {
        this.affinity2.lov.provinceLOV = result;
        this.address.provinceDetailId = "130000-NCR";
        this.chooseProvince();
      });
  }

  chooseProvince() {
    this.caller.getLOV('A1000102', '7', 'cod_pais~PHL|cod_prov~' + this.address.provinceDetailId.split("-")[0]).subscribe(
      result => {
        this.affinity2.lov.municipalityLOV = result;
        this.address.municipalityDetailId = "0";
      });
  }

  chooseMunicipality() {
    this.caller.getLOV('A1000103', '1', 'cod_pais~PHL|cod_prov~' + this.address.provinceDetailId.split("-")[0] + '|cod_localidad~' + this.address.municipalityDetailId.split("-")[0]).subscribe(
      result => {
        this.affinity2.lov.zipLOV = result;
        this.address.zipCode = "0";
        this.address.addressTypeId = "0";
      });
  }

  reAssign(value, field) {
    let originalValue = value;
    this.address[field] = originalValue.split("-")[0];
    this.address[field.slice(0, -2)] = originalValue.split("-")[1];
  }

  throwAddress() {
    let addressFields = ["provinceDetailId", "municipalityDetailId", "addressTypeId"];

    for (let i = 0; i < addressFields.length; i++) {
      this.reAssign(this.address[addressFields[i]], addressFields[i]);
    }

    //address will always be home
    this.address.addressTypeId = "1";
    this.address.addressType = "HOME";

    const a = this.address;

    if (a.provinceDetailId == "0" 
      || a.municipalityDetailId == "0"
      || a.addressTypeId == "0"
      || a.addressTypeId == "1"
      || a.addressDetails == ""
      || a.addressDetails == undefined) {
      Swal.fire({
        type: 'error',
        title: 'Address',
        text: "Please fill out your address"
      });
    } else {
      this.addressDetailsOutput.emit(this.address);
      this.affinityOutput2.emit(this.affinity);
    }
  }

}
