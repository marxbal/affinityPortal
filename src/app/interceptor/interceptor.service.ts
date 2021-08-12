import {
  Injectable
} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
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
  LOGIN_MSG,
  TOKEN
} from '../constants/local.storage';
import {
  AuthenticationService
} from '../services/authentication.service';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

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
    }

    return this.performFinalRequest(finalRequest, next);
  }

  performFinalRequest(finalRequest: HttpRequest < any > , next: HttpHandler) {
    const token = localStorage.getItem(TOKEN);

    if (token) {
      finalRequest = finalRequest.clone({
        setHeaders: {
          Authorization: token
        }
      });
    }

    let ic = this;
    return next.handle(finalRequest).pipe(
      map((event: HttpEvent < any > ) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.clearAuth();
          localStorage.setItem(LOGIN_MSG, "Error! Token already expired. Please log in again.")
          ic.router.navigateByUrl('/login/?error=true');
        }
        return throwError(error);
      }));
  }
}
