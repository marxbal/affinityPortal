import {
  Component,
  OnInit
} from '@angular/core';
import * as _ from 'lodash';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  Partner
} from 'src/app/objects/partner';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(
    private auth: AuthenticationService) {}

  partnerPath: string = "";

  ngOnInit() {
    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.partnerPath = _.toLower(partner.partnerName);
    }
  }

}
