import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
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
import {
  Return
} from 'src/app/objects/return';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products = [{
      name: 'Comprehensive',
      id: 10001,
      subline: 100,
      group: 'Private Car'
    },
    {
      name: 'CTPL',
      subline: 100,
      id: 10002,
      group: 'Private Car'
    },
    {
      name: 'Comprehensive',
      id: 12001,
      subline: 120,
      group: 'Motorcycle'
    },
    {
      name: 'CTPL',
      subline: 120,
      id: 12002,
      group: 'Motorcycle'
    },
    {
      name: 'Comprehensive',
      id: 10501,
      subline: 105,
      group: 'Private Vehicle'
    },
    {
      name: 'CTPL',
      subline: 105,
      id: 10502,
      group: 'Private Vehicle'
    },
    {
      name: 'Individual Personal',
      subline: 337,
      id: 33701,
      group: 'Personal Accident'
    },
    {
      name: 'Personal Family',
      subline: 337,
      id: 33702,
      group: 'Personal Accident'
    },
  ];

  groupPolicyLOV: [] = [];
  contractLOV: [] = [];
  subContractLOV: [] = [];
  sublineProducts = [];
  partners = [];

  showInfo: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private pService: PartnerService) {}

  partnerForm: FormGroup;

  ngOnInit() {
    this.createForm();
    this.getPartners();
  }

  createForm() {
    this.partnerForm = this.fb.group({
      partner: ["", Validators.required],
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

  onCheckChange(event) {
    // find the unselected element
    let i: number = 0;
    let val = ""

    this.control.controls.forEach((ctrl: FormControl) => {
      // const isInactive = event.target.checked ? "N" : "S";
      var ctrlVal = ctrl.value;
      var str = _.replace(ctrlVal, ":N", "");
      var str2 = _.replace(str, ":S", "");

      if (str2 == event.target.value) {
        // Remove the unselected element from the arrayForm
        this.control.removeAt(i);

        const isInactive = event.target.checked ? "N" : "S";
        val = event.target.value + ":" + isInactive;
        return;
      }
      i++;
    });

    this.control.push(new FormControl(val));
    // if (event.target.checked) {
    //   // Add a new control in the arrayForm
    //   this.control.push(new FormControl(event.target.value));
    // }
    // /* unselected */
    // else {
    //   // find the unselected element
    //   let i: number = 0;

    //   this.control.controls.forEach((ctrl: FormControl) => {
    //     if (ctrl.value == event.target.value) {
    //       // Remove the unselected element from the arrayForm
    //       this.control.removeAt(i);
    //       return;
    //     }
    //     i++;
    //   });
    // }
  }

  getPartners() {
    this.partners = [{
        partnerName: "FOPM",
        agentCode: "1069"
      },
      {
        partnerName: "MARSH",
        agentCode: "1070"
      }
    ]
  }

  getPartnerDetails(event) {
    const partner = event.target.value;
    this.showInfo = !_.isEmpty(partner);

    this.pService.getPartnerDetails(event.target.value).subscribe(
      (result: any) => {
        const ret = result as Return;
        if (ret.status) {
          const partner = ret.obj as Partner;
          this.partnerForm.get("agentCode").setValue(partner.agentCode);

          this.partnerForm.get("subline").setValue(partner.subline);
          this.partnerForm.get("partnerName").setValue(partner.partnerName);
          this.partnerForm.get("domain").setValue(partner.domain);

          this.partnerForm.get("groupPolicy").setValue(partner.groupPolicy);
          this.partnerForm.get("contract").setValue(partner.contract);
          this.partnerForm.get("subContract").setValue(partner.subContract);

          this.getGroupPolicy(partner);
          this.getContract(partner);
          this.getSubContract(partner);
          this.getProducts(partner.subline);
        }
      });
  }
  
  getProducts(subline: number) {
    this.sublineProducts = [];

    this.products.forEach((product) => {
      if (product.subline == subline) {
        this.sublineProducts.push(product);
        this.control.push(new FormControl(product.id + ":S"));
      }
    });
  }

  getGroupPolicy(partner: Partner) {
    this.auth.getLOV(
      "A2000010",
      "4",
      'COD_CIA~1|COD_AGT~' + partner.agentCode +
      '|COD_RAMO~' + partner.subline).subscribe(
      result => {
        this.groupPolicyLOV = result;
      });
  }

  getContract(partner: Partner) {
    this.auth.getLOV(
      "G2990001",
      "7",
      'COD_CIA~1|COD_AGT~' + partner.agentCode +
      '|COD_RAMO~' + partner.subline +
      '|NUM_POLIZA_GRUPO~' + partner.groupPolicy).subscribe(
      result => {
        this.contractLOV = result;
      });
  }

  getSubContract(partner: Partner) {
    this.auth.getLOV(
      "G2990022",
      "2",
      'COD_CIA~1|COD_AGT~' + partner.agentCode +
      '|COD_RAMO~' + partner.subline +
      '|NUM_CONTRATO~' + partner.contract).subscribe(
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
