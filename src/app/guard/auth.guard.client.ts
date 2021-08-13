import {
  Injectable
} from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  ResolveStart
} from '@angular/router';
import {
  Observable
} from 'rxjs';
import {
  AuthenticationService
} from '../services/authentication.service';
import {
  take,
  map
} from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardClient implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable < boolean > | Promise < boolean > | boolean {

    this.router.events.subscribe(event => {
      if (event instanceof ResolveStart) {
        const url = event.url;
        if (url !== '/login' && url !== '') {
          let giveAccess = false;
          const userDetails = this.authService.getUserDetails();
          if (!_.isEmpty(userDetails)) {
            giveAccess = userDetails.roleId === 2;
          }

          if (!giveAccess) {
            setTimeout(() => {
              const landingPage  =this.authService.getLandingPage();
              this.router.navigate([landingPage]);
            }, 500);
          }
          return giveAccess;
        }
      }
    });

    return this.authService.loggedIn
      .pipe(take(1))
      .pipe(map((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.router.navigate(['login']);
          return false;
        }
        return true;
      }));
  }
}
