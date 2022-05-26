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
  CommonService
} from 'src/app/services/common.service';
import {
  ACCIDENT,
  CAR
} from 'src/app/objects/line';
import {
  AuthService
} from 'src/app/services/auth.service';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  Router
} from '@angular/router';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Return } from 'src/app/objects/return';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Partner } from 'src/app/objects/partner';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {

  constructor(
    private common: CommonService,
    private caller: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private paymentService: PaymentService,
    private auth: AuthenticationService) {}

  @Input() line: String;
  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  fullName: string;
  emailSend: string = "";
  lineId: number = 1;
  type = {
    car: CAR,
    accident: ACCIDENT
  }
  isCTPL: boolean = false;
  showPolicy: boolean = true;
  isAuthenticated: boolean = false;
  chatEmail: string = "";

  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  });

  ngOnInit() {
    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.chatEmail = partner.chatEmail;
    }

    this.retrieveTransactions();
  }

  retrieveTransactions() {
    this.spinner.show();
    this.caller.doCallService('/afnty/retrieveTransactions', this.affinity.clientId).subscribe(
      result => {
        let load: boolean = false;
        this.spinner.hide();

        this.affinity.previousIssuances = result;
        for (let i = 0; i < this.affinity.previousIssuances.length; i++) {
          const details = this.affinity.previousIssuances[i];
          const process = details.codProcess;
          const isMatched = details.numPoliza == this.affinity.policyNumber;
          if (process != 1 && isMatched) {
            load = true;
          }
        }

        if (load) {
          this.loadPolicy();
        } else {
          this.router.navigate([this.auth.getLandingPage()]);
          setTimeout(function () {
            window.location.reload();
          }, 10);
        }
      });
  }

  loadPolicy() {
    this.affinity.premiumBreakdown.grossPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.grossPrem));
    this.affinity.premiumBreakdown.netPrem = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.netPrem));
    this.affinity.premiumBreakdown.docStamp = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.docStamp));
    this.affinity.premiumBreakdown.lgt = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.lgt));
    this.affinity.premiumBreakdown.eVat = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.eVat));
    this.affinity.premiumBreakdown.premiumTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.premiumTax));
    // this.affinity.premiumBreakdown.others = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.others));
    this.affinity.premiumBreakdown.fireTax = this.formatter.format(parseFloat(this.affinity.premiumBreakdown.fireTax));
    this.fullName = this.common.getFullName(
      this.affinity.riskDetails.firstName,
      this.affinity.riskDetails.middleName,
      this.affinity.riskDetails.lastName,
      this.affinity.riskDetails.suffix
    )

    this.lineId = this.common.getLinebyProduct(this.affinity.productId);
    this.isCTPL = "10002" == this.affinity.productId;
    if (this.isCTPL) {
      const subline = parseInt(this.affinity.lineId);
      this.checkAuthentication(subline, this.affinity.policyNumber);
    }

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
  }

  checkAuthentication(subline: number, policyNumber: string) {
    this.showPolicy = false;
    this.spinner.show();
    this.paymentService.checkAuthentication(subline, policyNumber).subscribe(
      (res: Return) => {
        if (!_.isEmpty(res)) {
          this.spinner.hide();
          if (res.status) {
            this.isAuthenticated = Boolean(res.obj);
            this.showPolicy = this.isAuthenticated;
          } else {
            Swal.fire({
              type: 'error',
              title: 'COCAF Check Authentication',
              text: res.message
            });
          }
        }
      }
    )
  }

  sendEmail() {
    this.emailSend = this.affinity.riskDetails.emailAddress.toLowerCase();
  }

  submitSendEmail() {
    this.common.emailPolicy(this.emailSend, this.affinity.policyNumber, "P");
  }

  printPolicy() {
    this.common.print(this.affinity.policyNumber, "P");
  }

  nextStepAction(nextStep) {
    this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }

}
