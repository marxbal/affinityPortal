import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute
} from '@angular/router';
import {
  Partner
} from 'src/app/objects/partner';
import {
  AuthService
} from 'src/app/services/auth.service';
import {
  PartnerService
} from 'src/app/services/partner.service';
import * as _ from 'lodash';
import { AddPartner } from 'src/app/objects/add-partner';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {

  partner: AddPartner = {
    partnerCode: "A001",
    partnerName: "FOPM",
    domain: "fopm.com.ph"
  };

  groupPolicyLOV: [] = [];
  contractLOV: [] = [];
  subContractLOV: [] = [];
  sublineProducts = [];

  showInfo: boolean = false;
  showSubline: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pService: PartnerService) {}

  partnerForm: FormGroup;

  ngOnInit() {
    this.createForm();

    this.route.queryParams
      .subscribe(params => {
        var partnerCode = params.partnerCode;
        if (!_.isEmpty(partnerCode)) {
          this.setPartnerDetails(partnerCode);
        }
      });
  }

  createForm() {
    this.partnerForm = this.fb.group({
      partnerName: ["", Validators.required],
      domain: ["", Validators.required],
    });
  }

  setPartnerDetails(partnerCode: string) {
    const partner = this.getPartnerDetails(partnerCode);

    this.partnerForm.get("partnerName").setValue(partner.partnerName);
    this.partnerForm.get("domain").setValue(partner.domain);
  }

  getPartnerDetails(partnerCode: string) {
    return this.partner;
  }

  save() {
    const partner = this.partnerForm.value as AddPartner;
    this.pService.insertPartner(partner);
  }

}
