import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ResolveStart } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { take,map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as $ from 'jquery/dist/jquery.min';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(private authService: AuthenticationService,
              private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.router.events.subscribe(event => {
        if (event instanceof ResolveStart) {

          const url = event.url;
          const screens = this.authService.getAccessibleScreen();
          if (url !== '/login' && url !== '') {

            let isAccessible = false;
            for(let i = 0; i < screens.length; i++) {
              let checker = _.includes(url, screens[i].screenRoute);
              if(checker) {
                isAccessible = true;
                break;
              }
            } 
            if(!isAccessible) {
              this.goToLandingPage();
              return false;
            }

          }

        }
      });
    

    return this.authService.login 
       .pipe(take(1))
       .pipe(map((isLoggedIn: string) => {
         if (isLoggedIn == "false"){
           this.router.navigate(['login']);
           return false;
         }
         return true;
       }));
  }

  goToLandingPage() {
      let page = this.authService.getLandingPage();
      this.router.navigate([page]);
  }

}
