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
  Base64
} from 'js-base64';
import {
  TOKEN
} from '../constants/local.storage';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}
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
            let past = Base64.encode(localStorage.getItem("tempECCard")) + '&u=' + Base64.encode(localStorage.getItem("tempUnit"));
            window.location.reload();
            localStorage.setItem("logoutMessage", 'Your session has expired, please log in again.');
            ic.router.navigateByUrl('/?e=' + past);
          }
          return throwError(error);
        }));
    }

  }
}
