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

const PARTNER: AddPartner[] = [{
  partnerCode: "A001",
  partnerName: "FOPM",
  domain: 'fopm.com.ph'
}];

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

  edit(partnerCode: number) {
    this.router.navigateByUrl("/partner?partnerCode=" + partnerCode);
  }

  addPartner() {
    this.router.navigateByUrl("/partner");
  }
}
