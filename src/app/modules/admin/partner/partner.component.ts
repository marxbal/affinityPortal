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

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {

  partner: Partner = {
    agentCode: 1069,
    subline: 100,
    partnerName: "FOPM",
    domain: "fopm.com.ph",
    groupPolicy: 100,
    contract: 1001,
    subContract: 10001,
    products: [10001, 10003],
    primaryColor: "1233",
    product: 10001,
    active: true
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
    private auth: AuthService,
    private pService: PartnerService) {}

  partnerForm: FormGroup;

  ngOnInit() {
    this.createForm();

    this.route.queryParams
      .subscribe(params => {
        var agentCode = params.agentCode;
        if (!_.isEmpty(agentCode)) {
          this.setPartnerDetails(agentCode);
        }
      });
  }

  createForm() {
    this.partnerForm = this.fb.group({
      agentCode: ["", Validators.required],
      subline: ["", Validators.required],
      partnerName: ["", Validators.required],
      domain: ["", Validators.required],
      groupPolicy: ["", Validators.required],
      contract: ["", Validators.required],
      subContract: ["", Validators.required],
      products: this.fb.array([])
    });

    this.partnerForm.get("products");
  }

  get control() {
    return this.partnerForm.get('products') as FormArray;
  }

  setPartnerDetails(agentCode) {
    this.partnerForm.get("agentCode").setValue(agentCode);
    this.toggleSubline();
    this.showInfo = true;

    const partner = this.getPartnerDetails();

    this.partnerForm.get("subline").setValue(partner.subline);

    this.partnerForm.get("partnerName").setValue(partner.partnerName);
    this.partnerForm.get("domain").setValue(partner.domain);

    this.partnerForm.get("groupPolicy").setValue(partner.groupPolicy);
    this.partnerForm.get("contract").setValue(partner.contract);
    this.partnerForm.get("subContract").setValue(partner.subContract);
  }

  toggleSubline() {
    const agentCode = this.partnerForm.get("agentCode").value;
    this.showSubline = !_.isEmpty(agentCode);
    if (!this.showSubline) {
      this.showInfo = false;
      this.partnerForm.get("subline").setValue("");
    }
  }

  getPartnerDetails() {
    return this.partner;
  }

  getGroupPolicy() {
    const agentCode = this.partnerForm.get("agentCode").value;
    const subline = this.partnerForm.get("subline").value;
    this.showInfo = !_.isEmpty(subline);

    this.auth.getLOV(
      "A2000010",
      "4",
      'COD_CIA~1|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline).subscribe(
      result => {
        this.groupPolicyLOV = result;
      });
  }

  getContract() {
    const agentCode = this.partnerForm.get("agentCode").value;
    const subline = this.partnerForm.get("subline").value;
    const groupPolicy = this.partnerForm.get("groupPolicy").value;

    this.partnerForm.get('contract').setValue("");
    this.partnerForm.get('subContract').setValue("");
    this.auth.getLOV(
      "G2990001",
      "7",
      'COD_CIA~1|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_POLIZA_GRUPO~' + groupPolicy).subscribe(
      result => {
        this.contractLOV = result;
      });
  }

  getSubContract() {
    const agentCode = this.partnerForm.get("agentCode").value;
    const subline = this.partnerForm.get("subline").value;
    const contract = this.partnerForm.get("contract").value;

    this.partnerForm.get('subContract').setValue("");
    this.auth.getLOV(
      "G2990022",
      "2",
      'COD_CIA~1|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_CONTRATO~' + contract).subscribe(
      result => {
        this.subContractLOV = result;
      });
  }

  save() {
    const partner = this.partnerForm.value as Partner;
    partner.active = true;
    partner.product = 10001;
    this.pService.insertContract(partner);
  }

}
