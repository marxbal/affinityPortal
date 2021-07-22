import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import { Partner } from 'src/app/objects/partner';

// interface Partner {
//   partnerId: number;
//   name: string;
//   agentCode: number;
//   groupPolicy: number;
//   contract: number;
//   subContract: number;
// }

const PARTNER: Partner[] = [{
    agentCode: 1069,
    partnerName: "Mercury",
    groupPolicy: 1023,
    contract: 12202,
    subContract: 23233,
    domain: '',
    primaryColor: '',
    products: [1],
    product: 1001,
    active: true,
    subline: 300
  }
];

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent implements OnInit {

  partners = PARTNER;

  constructor(
    private router: Router) {}

  ngOnInit() {}

  edit(agentCode: number) {
    this.router.navigateByUrl("/partner?agentCode=" + agentCode);
  }
}
