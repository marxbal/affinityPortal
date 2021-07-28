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
  AuthService
} from 'src/app/services/auth.service';
import {
  PartnerService
} from 'src/app/services/partner.service';
import * as _ from 'lodash';
import {
  AddPartner
} from 'src/app/objects/add-partner';
import {
  AddProduct
} from 'src/app/objects/add-product';

export interface Partners {
  partnerName: string;
  agentCode: number;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products = [{
      name: 'Comprehensive',
      id: 10001,
      line: 1,
      subline: 100
    },
    {
      name: 'CTPL',
      id: 10002,
      line: 1,
      subline: 100
    },
    {
      name: 'Comprehensive',
      id: 10001,
      line: 1,
      subline: 105
    },
    {
      name: 'CTPL',
      id: 10002,
      line: 1,
      subline: 105
    },
    {
      name: 'Comprehensive',
      id: 10001,
      line: 1,
      subline: 120
    },
    {
      name: 'CTPL',
      id: 10002,
      line: 1,
      subline: 120
    },
    {
      name: 'Individual Personal',
      id: 33701,
      line: 3,
      subline: 337
    },
    {
      name: 'Personal Family',
      id: 33702,
      line: 3,
      subline: 337
    },
  ];

  groupPolicyLOV: [] = [];
  contractLOV: [] = [];
  subContractLOV: [] = [];
  lineProducts = [];
  partners = [];

  showInfo: boolean = false;
  showSubline: boolean = false;
  showProductPolicy: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private pService: PartnerService) {}

  productForm: FormGroup;

  ngOnInit() {
    this.createForm();
    this.getPartnerList();
  }

  createForm() {
    this.productForm = this.fb.group({
      partnerCode: ["", Validators.required],
      agentCode: ["", Validators.required],
      subline: ["", Validators.required],
      partnerName: ["", Validators.required],
      domain: ["", Validators.required],
      groupPolicy: ["", Validators.required],
      contract: ["", Validators.required],
      subContract: ["", Validators.required],
      products: this.fb.array([])
    });

    this.productForm.get("products");
  }

  get control() {
    return this.productForm.get('products') as FormArray;
  }

  getPartnerList() {
    this.auth.getLOV(
      "G6009901_MPH",
      "1",
      '').subscribe(
      result => {
        this.partners = result;
      });
  }

  getPartnerDetails(event) {
    const partnerCode = event.target.value;
    this.showInfo = !_.isEmpty(partnerCode);

    if (this.showInfo) {
      this.partners.forEach((partner) => {
        if (partner.COD_PARTNER == partnerCode) {
          this.productForm.get("partnerName").setValue(partner.TXT_PARTNER);
          this.productForm.get("domain").setValue(partner.TXT_DOMAIN);
        }
      });
    }
  }

  toggleSubline(event) {
    const val = event.target.value;
    this.showSubline = !_.isEmpty(val);

    const form = this.productForm;
    form.get("subline").setValue("");
    this.showProductPolicy = false;

    form.get("groupPolicy").setValue("");
    form.get("contract").setValue("");
    form.get("subContract").setValue("");
  }

  toggleProductPolicy(event) {
    this.showProductPolicy = true;

    this.getProducts(event.target.value, []);
    this.getGroupPolicy();
  }

  getProducts(subline: number, products: number[]) {
    this.lineProducts = [];
    this.clearProductListForm();

    this.products.forEach((product) => {
      if (product.subline == subline) {
        this.lineProducts.push(product);

        const isInactive = (-1 !== _.indexOf(products, product.id)) ? "N" : "S";
        this.control.push(new FormControl(product.subline + ":" + product.id + ":" + isInactive));
      }
    });
  }

  clearProductListForm() {
    this.control.controls.forEach(() => {
      this.control.removeAt(0);
      if (this.control.controls.length) {
        this.clearProductListForm();
      };
    });
  }

  getGroupPolicy() {
    const form = this.productForm;

    const agentCode = form.get('agentCode').value;
    const subline = form.get('subline').value;

    form.get('groupPolicy').setValue("");
    form.get('contract').setValue("");
    form.get('subContract').setValue("");

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
    const form = this.productForm;

    const agentCode = form.get('agentCode').value;
    const subline = form.get('subline').value;
    const groupPolicy = form.get('groupPolicy').value;

    form.get('contract').setValue("");
    form.get('subContract').setValue("");

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
    const form = this.productForm;

    const agentCode = form.get('agentCode').value;
    const subline = form.get('subline').value;
    const contract = form.get('contract').value;

    form.get('subContract').setValue("");

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

  onCheckChange(event) {
    // find the unselected element
    let i: number = 0;
    let val = ""

    this.control.controls.forEach((ctrl: FormControl) => {
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
  }

  save() {
    const product = this.productForm.value as AddProduct;
    this.pService.insertProduct(product);
  }

}
