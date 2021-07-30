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
import { Return } from 'src/app/objects/return';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pService: PartnerService) {}

  partnerForm: FormGroup;
  partner: Partner = new Partner();
  themeList = [
    "blue",
    "black",
    "green",
    "yellow",
    "yellowGreen",
    "orange",
    "purple",
    "gray",
    "pink",
    "brown"
  ]

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
      partnerCode: ["", null],
      partnerName: ["", Validators.required],
      domain: ["", Validators.required],
      themeCode: ["", null]
    });
  }

  setPartnerDetails(partnerCode: string) {
    this.partner.partnerCode = partnerCode;
    this.pService.getPartnerDetailsByPartnerCode(this.partner).subscribe(
      (result: any) => {
        const ret = result as Return;
        if (ret.status) {
          this.partner = ret.obj as Partner;

          this.partnerForm.get("partnerCode").setValue(this.partner.partnerCode);
          this.partnerForm.get("partnerName").setValue(this.partner.partnerName);
          this.partnerForm.get("domain").setValue(this.partner.domain);
          this.partnerForm.get("themeCode").setValue(this.partner.themeCode);
        }
      });

    return this.partner;
  }

  save() {
    const partner = this.partnerForm.value as AddPartner;
    this.pService.insertPartner(partner);
  }

}
