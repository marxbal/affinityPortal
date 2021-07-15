import {
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  EMAIL
} from 'src/app/constants/local.storage';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  environment
} from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  email: string = "";
  homePageUrl: string = "";

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public auth: AuthenticationService) {}

  ngOnInit() {
    this.email = localStorage.getItem(EMAIL);
    this.homePageUrl = environment.baseUrl + this.auth.getLandingPage();
  }

  logout() {
    this.auth.clearAuth();
    this.router.navigate(['login']);
  }

}
