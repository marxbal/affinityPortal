import {
  Injectable
} from '@angular/core';
import * as c from './../objects/const';
import {
  HttpHeaders,
  HttpClient
} from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  throwError
} from 'rxjs';
import {
  map,
  catchError
} from 'rxjs/operators';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  environment
} from '../../environments/environment';
import {
  TOKEN
} from '../constants/local.storage';
import {
  AppService
} from './app.service';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private dataSubject: BehaviorSubject < any > = new BehaviorSubject({});
  data$: Observable < any > = this.dataSubject.asObservable();

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private app: AppService) {}

  refreshToken() {
    const as = this;
    const body = `grant_type=refresh_token&refresh_token=` + localStorage.getItem('refresh_token');

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    return this.http.post("/oauth/token", body, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          let add_minutes = function (dt, minutes) {
            return new Date(dt.getTime() + minutes * 60000);
          }
          let tokenExpiration = add_minutes(new Date(), (res.expires_in / 60)).toString();

          localStorage.setItem(TOKEN, "Bearer " + res.access_token);
          localStorage.setItem("expires_in", tokenExpiration);
          localStorage.setItem("refresh_token", res.refresh_token);
          return true;
        }
      })).pipe(catchError((err: any) => {
        return throwError(err.error);
      }));
  }

  loginUser(username: string, password: string) {
    const as = this;
    const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    return this.http.post(this.apiUrl + "/oauth/token", body, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  callNonAuth(action: string, param: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set(InterceptorSkipHeader, '');

    return this.http.post(action, param, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return err.error;
      }));
  }

  callNonAuthPaginated(action: string, param: any, page: string, size: string) {
    let mainAction = action + '?page=' + page + '&size=' + size;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set(InterceptorSkipHeader, '');

    return this.http.post(mainAction, param, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return err.error;
      }));
  }

  callPaginated(action: string, param: any, page: string, size: string) {
    let mainAction = action + '?page=' + page + '&size=' + size;

    if (action.includes("?action")) {
      param.values.page = page;
      param.values.size = size;
      mainAction = action;
    }

    let au = this;
    return this.http.post(mainAction, param)
      .pipe(map((res: any) => {
        if (res) {
          return res;

        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  doCallServicePayment(action: string, param: any): Observable < any > {
    let au = this;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    let tempAct = action;
    if (action.includes("/afnty/")) {
      action = this.apiUrl + tempAct;
    }
    return this.http.post(action, param, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return err.error;
      }));

  }

  doCallService(action: string, param: any): Observable < any > {
    let au = this;

    let tempAct = action;
    if (action.includes("/afnty/")) {
      action = this.apiUrl + tempAct;
    }

    return this.http.post(action, param)
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  doCallServiceGet(action: string, param: any): Observable < any > {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    headers = headers.set('Authorization', 'Basic ' + btoa(c.CLIENT + ':' + c.SECRET));
    headers = headers.set(InterceptorSkipHeader, '');

    action = "https://ifae.com.ph:2083" + action;

    return this.http.get(action, {
        headers
      })
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));

  }

  checkWsdl() {
    return this.http.post(this.apiUrl + '/afnty/cocaf/checkWsdl', '', {
      responseType: "text"
    }).pipe(
      map((res: string) => {
        return res;
      }));
  }

  getOptionList(language, columnName, params): Observable < any > {
    let au = this;
    let param = {
      "language": language,
      "columnName": columnName,
      "param": params
    };
    return this.http.post(this.apiUrl + "/afnty/getOptionList", param)
      .pipe(map((res: any) => {
        if (res) {
          return res;

        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));

  }

  getLOV(tableName, version, params): Observable < any > {
    let au = this;
    let param = {
      "tableName": tableName,
      "version": version,
      "params": params
    };
    return this.http.post(this.apiUrl + "/afnty/getLOV", param)
      .pipe(map((res: any) => {
        if (res) {
          return res;
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));

  }

  doCallServiceDeleteFile(param: any): Observable < any > {
    return this.http.delete("/api/util/deleteEmailedPDF?pdfName=" + param)
      .pipe(map((res: any) => {
        if (res) {
          return res;

        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));

  }

  generatePDFTW(url, param: any): Observable < any > {
    let tempAct = url;
    if (url.includes("/afnty/")) {
      url = this.apiUrl + tempAct;
    }

    return this.http.post(url, param, {
        responseType: 'blob'
      })
      .pipe(map((res: any) => {
        if (res) {
          let blob = new Blob([res], {
            type: "application/pdf"
          });
          let fileName = "test";

          var fileURL = URL.createObjectURL(blob);
          window.open(fileURL);

          // let link = document.createElement('a');
          // link.href = window.URL.createObjectURL(blob);
          // link.download = fileName;
          // link.click();
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  generatePDF(param: any): Observable < any > {
    return this.http.post("/api/util/pdf", param, {
        responseType: 'blob'
      })
      .pipe(map((res: any) => {
        if (res) {
          let blob = new Blob([res], {
            type: "application/pdf"
          });
          let fileName = param.reportFileName;

          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  private handleError(error: any): Promise < any > {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  generateExcel(param: any): Observable < any > {
    return this.http.post("/api/util/excel", param, {
        responseType: 'blob'
      })
      .pipe(map((res: any) => {
        if (res) {
          let blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          let fileName = param.reportFileName;

          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

  generateExcelReport(param: any): Observable < any > {
    return this.http.post("/api/util/excelProdReport", param, {
        responseType: 'blob'
      })
      .pipe(map((res: any) => {
        if (res) {
          let blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          let fileName = param.reportFileName;

          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      })).pipe(catchError((err: any) => {
        this.app.alertErr(err);
        this.spinner.hide();
        return throwError(err.error);
      }));
  }

}