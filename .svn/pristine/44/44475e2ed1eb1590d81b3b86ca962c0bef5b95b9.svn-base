import { Component, OnInit, Input, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {Observable} from 'rxjs';
import {PolicyCoverages} from '../../../objects/policy-coverages';
import {Line} from '../../../objects/line';
import { SubLine } from '../../../objects/subLine';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-policy-coverages-management',
  templateUrl: './policy-coverages-management.component.html',
  styleUrls: ['./policy-coverages-management.component.css']
})
export class PolicyCoveragesManagementComponent implements OnInit, ComponentCanDeactivate {

  constructor(private auth: AuthenticationService,private router: Router, private caller: AuthService,
    private spinner: NgxSpinnerService) { }

  @Input() coverage: PolicyCoverages;

  coverageUpdate: PolicyCoverages;
  coveragesList: PolicyCoverages[];
  coveragesListUpdate: PolicyCoverages;
  lineList: Line[];
  sublineList: SubLine[];

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  ngOnInit() {
    this.coverage = new PolicyCoverages();
    this.coverageUpdate = new PolicyCoverages();
    this.coveragesListUpdate = new PolicyCoverages();
    this.lineList = [];
    this.sublineList = [];

    this.spinner.show();
    const param =  `{"action": "select", "values": {}}`;

    this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
        result => {
          this.coveragesList = result.msg;
          for(let i = 0; i < this.coveragesList.length; i++){
            this.coveragesList[i].date_added = m(this.coveragesList[i].date_added).format(this.auth.getDateFormat());
          }
          this.spinner.hide();
        }
      );

    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {
          this.lineList = result.msg;
        }
      );

  }

  updateCoverageType(coverage: any){

    const param =  {"action": "select", "values": {"line_detail_id" : coverage.line_detail_id}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {
          this.sublineList = result.msg;
          this.spinner.hide();
        }
      );

    this.coveragesListUpdate = coverage;

  }

  deleteCoverageType(coverage: any){
    this.coveragesListUpdate = coverage;

    Swal.fire({
      title: 'Coverage Type Deletion',
      text: "Are you sure you want to delete coverage ID  "+ this.coveragesListUpdate.coverage_type_id + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {

        this.spinner.show();
        const param =  {"action": "delete", "values": this.coveragesListUpdate};

        this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
            result => {

              const param =  `{"action": "select", "values": {}}`;

              this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
                  resulta => {
                    this.coveragesList = [];
                    this.coveragesList = resulta.msg;
                    for(let i = 0; i < this.coveragesList.length; i++){
                      this.coveragesList[i].date_added = m(this.coveragesList[i].date_added).format(this.auth.getDateFormat());
                    }

                    if(result.status == "1"){
                      Swal.fire(
                        'Deleted!',
                        "Success deletion of coverage ID " + this.coveragesListUpdate.coverage_type_id,
                        'success'
                      );
                    }else{
                      Swal.fire(
                        'Ooppsss...',
                        "Something went wrong. Please try again.",
                        'warning'
                      );
                    }

                    this.spinner.hide();
                  }
                );

              

            }
          );

        
      }
    })

  }

  submitUpdateCoverageType(){

    const param =  {"action": "update", "values": this.coveragesListUpdate};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
        result => {

          const param =  `{"action": "select", "values": {}}`;

          this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
              resulta => {
                this.coveragesList = [];
                this.coveragesList = resulta.msg;
                for(let i = 0; i < this.coveragesList.length; i++){
                  this.coveragesList[i].date_added = m(this.coveragesList[i].date_added).format(this.auth.getDateFormat());
                }

                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    "Success update of coverage ID " + this.coveragesListUpdate.coverage_type_id,
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...',
                    "Something went wrong. Please try again.",
                    'warning'
                  );
                }
                $("#submitUpdateCoverageTypeClose").trigger('click');
                this.spinner.hide();
              }
            );

        }
      );

  }

  addCoverage(){

    const param =  {"action": "insert", "values": this.coverage};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
        result => {
          
          const param =  `{"action": "select", "values": {}}`;

          this.caller.doCallService("/digitalinnoproductservice/?action=coverage", param).subscribe(
              resulta => {
                this.coveragesList = [];
                this.coveragesList = resulta.msg;
                for(let i = 0; i < this.coveragesList.length; i++){
                  this.coveragesList[i].date_added = m(this.coveragesList[i].date_added).format(this.auth.getDateFormat());
                }

                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    "Success adding new Coverage type.",
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...',
                    "Something went wrong. Please try again.",
                    'warning'
                  );
                }
                $("#addCoverageClose").trigger('click');
                this.spinner.hide();
              }
            );

        }
      );

  }

  chooseLine(type: any){
    $("#subline-chooser").removeClass("hidden");
    let line_id = this.coverage.line_detail_id;

    if(type === "update"){
      line_id = this.coveragesListUpdate.line_detail_id;
    }

    let param =  {"action": "select", "values": {"line_detail_id" : line_id}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {
          this.sublineList = result.msg;
          this.spinner.hide();
        }
      );

  }

  chooseSubLine(){
    $("#new-coverage-col").removeClass("hidden");
  }

}
