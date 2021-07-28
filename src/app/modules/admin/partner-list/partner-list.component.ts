import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  AddPartner
} from 'src/app/objects/add-partner';
import {
  AuthService
} from 'src/app/services/auth.service';

const PARTNER: AddPartner[] = [];

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent implements OnInit {

  partners = PARTNER;

  constructor(
    private router: Router,
    private auth: AuthService) {}

  ngOnInit() {}

  getPartnerList() {
    this.auth.getLOV(
      "G6009901_MPH",
      "1",
      '').subscribe(
      result => {
        result.forEach(r => {
          const details: AddPartner = {
            partnerCode: r.COD_PARTNER,
            partnerName: r.TXT_PARTNER,
            domain: r.TXT_DOMAIN
          };

          this.partners.push(details);
        });
      });
  }

  edit(partnerCode: number) {
    this.router.navigateByUrl("/partner?partnerCode=" + partnerCode);
  }

  addPartner() {
    this.router.navigateByUrl("/partner");
  }
}
