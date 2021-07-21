import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  VER
} from 'src/app/objects/const';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private router: Router) {}

  version: string = VER;

  dashboard: boolean = false;
  partners: boolean = false;
  products: boolean = false;

  ngOnInit() {
    const url = this.router.url;

    switch (url) {
      case "/dashboard":
        this.dashboard = true;
        break;
      case "/partner-list":
        this.partners = true;
        break;
      case "/product-list":
        this.products = true;
        break;
    }
  }

}
