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

  partnerName: string = "";
  brokenUrl: boolean = false;

  ngOnInit() {
    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.partnerName = _.toLower(partner.partnerName);
      if (this.partnerName == 'sitel') {
        this.partnerName = 'marsh';
      }
    }
  }

  onErrorFunction() {
    this.brokenUrl = true;
    this.getImageUrl();
  }

  private getImageUrl() {
    return this.brokenUrl ? "assets/images/default-partner.png" : "assets/images/partners/" + this.partnerName + ".png";
  }

}
