import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  Partner
} from 'src/app/objects/partner';
import {
  PartnerService
} from 'src/app/services/partner.service';
import * as _ from 'lodash';
import {
  AddPartner
} from 'src/app/objects/add-partner';
import {
  Return
} from 'src/app/objects/return';
// import {
//   environment
// } from 'src/environments/environment';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {

  // redirectUrl: string = environment.redirectUrl;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pService: PartnerService,
    private router: Router) {}

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
    "brown",
    "redpink"
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
      themeCode: ["", null],
      auto: ["", Validators.required],
      branchCode: ["", Validators.required]
    });
  }

  setPartnerDetails(partnerCode: string) {
    this.partner.partnerCode = partnerCode;
    this.pService.getPartnerDetails(this.partner).subscribe(
      (result: any) => {
        const ret = result as Return;
        if (ret.status) {
          this.partner = ret.obj as Partner;

          this.partnerForm.get("partnerCode").setValue(this.partner.partnerCode);
          this.partnerForm.get("partnerName").setValue(this.partner.partnerName);
          this.partnerForm.get("domain").setValue(this.partner.domain);
          this.partnerForm.get("themeCode").setValue(this.partner.themeCode);

          this.partnerForm.get("auto").setValue(this.partner.auto);
          this.partnerForm.get("branchCode").setValue(this.partner.branchCode);
        }
      });

    return this.partner;
  }

  save() {
    const partner = this.partnerForm.value as AddPartner;
    console.log(partner);
    // this.pService.insertPartner(partner);
  }

  cancel() {
    this.router.navigateByUrl("/partner-list");
  }

}
