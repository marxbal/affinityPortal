
import {from as observableFrom,  Subject ,  Observable } from 'rxjs';
import { Injectable,NgZone  } from '@angular/core';
import { DataCouchPouchService } from '../services/data-couch-pouch.service';

import {AuthenticationService} from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  postSubject: any = new Subject();

  constructor(private auth: AuthenticationService, public dcps : DataCouchPouchService, public zone: NgZone) {

    this.startLs();

  }

  startLs(){
    // this.dcps.startDb();
    // if(this.auth.getLoginVal() == "true"){
    //   this.dcps.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
    //         this.emitLogs(change.doc.type);
    //   });
    // }

  }

  getLogs(): Observable<any>  {
      return this.dcps.getPosts();
  }

  addLog(log): void {
      this.dcps.db.post(log);
  }

  updateLog(log): void {
      this.dcps.db.put(log);
  }

  findSpecific(selector : any): Observable<any>{
    return observableFrom(this.dcps.db.find({
      selector: selector,
      sort: ['_id']
    }));
  }

  emitLogs(type : string): void {
      this.zone.run(() => {
          this.dcps.db.query(type + "/" + type).then((data) => {
              let logs = data.rows.map(row => {
                  return row.value;
              });
              this.postSubject.next(logs);
          })
      });
  }
}
