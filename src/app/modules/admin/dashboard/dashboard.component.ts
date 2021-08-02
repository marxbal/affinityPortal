import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  environment
} from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  redirectUrl: string = environment.redirectUrl;

  constructor(private router: Router) {}

  ngOnInit() {}

  goTo(link: string) {
    this.router.navigateByUrl(this.redirectUrl + "/" + link);
  }

}
