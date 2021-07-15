import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import * as _ from 'lodash';
import {
  AuthenticationService
} from './services/authentication.service';
import {
  environment
}
from '../environments/environment';
import {
  Partner
} from './objects/partner';
import {
  EMAIL
} from './constants/local.storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  partnerName: string = "";

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public auth: AuthenticationService) {}

  ngOnInit() {
    const partner = this.auth.getPartner() as Partner;
    if (!_.isEmpty(partner)) {
      this.partnerName = partner.name;
    }
  }
}
