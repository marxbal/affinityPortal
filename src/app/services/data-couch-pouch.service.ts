
import {from as observableFrom,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import PouchDB from 'pouchdb';

// import PouchdbFind from 'pouchdb-find';
// import PouchdbUpsert from 'pouchdb-upsert';
import {AuthenticationService} from '../services/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class DataCouchPouchService {

  db: any;

  constructor(private auth: AuthenticationService) {

    this.startDb();

  }

  startDb(){
    if(this.auth.getLoginVal() == "true"){

        //let remote: string = 'http://admin:digitalinnoAdmin@188.166.237.46:5984/' + this.auth.getUserDetails().username.toLowerCase();;
        // let remote: string = 'http://admin:digitalinnoadmin@167.71.220.238:5984/' + this.auth.getUserDetails().username.toLowerCase();
        // PouchDB.plugin(PouchdbFind);
        // PouchDB.plugin(PouchdbUpsert);
        // this.db = new PouchDB(this.auth.getUserDetails().username.toLowerCase());

        let options = {
          live: true,
          retry: true,
          continuous: true
        };
       // this.db.replicate.to(remote, options);
       // this.db.sync(remote, options);
       // this.db.putIfNotExists('_design/user', {language : 'javascript', views: {user: {map: "function(doc){ if(doc.type == \"user\"){emit(doc.type, doc);} }"}}});
       // this.db.putIfNotExists('_design/customer', {language : 'javascript', views: {customer: {map: "function(doc){ if(doc.type == \"customer\"){emit(doc.type, doc);} }"}}});
       // this.db.putIfNotExists('_design/policy', {language : 'javascript', views: {policy: {map: "function(doc){ if(doc.type == \"policy\"){emit(doc.type, doc);} }"}}});
       // this.db.putIfNotExists('_design/product', {language : 'javascript', views: {product: {map: "function(doc){ if(doc.type == \"product\"){emit(doc.type, doc);} }"}}});

    }

  }

  getPosts(): Observable<any> {
      return observableFrom(this.db.query('asd/property1'));
  }
}
