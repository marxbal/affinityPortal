import {
  Component,
  OnInit
} from '@angular/core';

interface Partner {
  partnerId: number;
  name: string;
  groupPolicy: number;
  contract: number;
  subContract: number;
}

const PARTNER: Partner[] = [{
    partnerId: 1,
    name: "Mercer",
    groupPolicy: 1023,
    contract: 12202,
    subContract: 23233,
  },
  {
    partnerId: 2,
    name: "Marsh",
    groupPolicy: 1024,
    contract: 13202,
    subContract: 23234,
  },
];

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent implements OnInit {

  partners = PARTNER;

  constructor() {}

  ngOnInit() {}

}
