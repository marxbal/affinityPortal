import {
  Injectable
} from '@angular/core';
import {
  HttpHeaders,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  map,
  catchError
} from 'rxjs/operators';
import {
  switchMap
} from 'rxjs/operators';
import {
  LogService
} from '../services/log.service';
import {
  AuthenticationService
} from '../services/authentication.service';
import {
  AuthService
} from '../services/auth.service';
import * as _ from 'lodash';
import {
  Router
} from '@angular/router';
import {
  Base64
} from 'js-base64';
import {
  EMAIL,
  TOKEN
} from '../constants/local.storage';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private oauth: AuthService, private auth: AuthenticationService, private ls: LogService, private router: Router, private http: HttpClient) {}

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
          window.location.reload();
          ic.router.navigateByUrl('?error=3');
        }
        return throwError(error);
      }));
  }
}
