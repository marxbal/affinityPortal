import {
  Injectable
} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  map,
  catchError
} from 'rxjs/operators';
import * as _ from 'lodash';
import {
  Router
} from '@angular/router';
import {
  EMAIL,
  LOGIN_MSG,
  TOKEN
} from '../constants/local.storage';
import {
  AuthenticationService
} from '../services/authentication.service';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private auth: AuthenticationService) {}

  intercept(request: HttpRequest < any > , next: HttpHandler): Observable < HttpEvent < any >> {
    let finalRequest = _.cloneDeep(request);

    if (finalRequest.headers.has(InterceptorSkipHeader)) {
      const headers = finalRequest.headers.delete(InterceptorSkipHeader);
      return next.handle(finalRequest.clone({
        headers
      }));
    } else {
      const token = localStorage.getItem(TOKEN);

      finalRequest = finalRequest.clone({
        setHeaders: {
          Authorization: token
        }
      });

      let ic = this;
      return next.handle(finalRequest).pipe(
        map((event: HttpEvent < any > ) => {
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            const email = localStorage.getItem(EMAIL);
            this.auth.clearAuth();
            localStorage.setItem(LOGIN_MSG, "Your session has expired, please log in again.");
            ic.router.navigateByUrl('/?email=' + email);
          }
          return throwError(error);
        }));
    }

  }
}
