import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

  constructor(
    private auth: AuthenticationService,
    private router: Router) {}

  ngOnInit() {}

  logout() {
    this.auth.clearAuth();
    this.router.navigate(['admin']);
  }

}
