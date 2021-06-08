import { Component, OnInit, Input, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {Line} from '../../../objects/line';
import { SubLine } from '../../../objects/subLine';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import * as m from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-line-subline-management',
  templateUrl: './line-subline-management.component.html',
  styleUrls: ['./line-subline-management.component.css']
})
export class LineSublineManagementComponent implements OnInit, ComponentCanDeactivate {

  @Input() newLine: Line;
  lineList: Line[];
  lineUpdate : Line;
  lineHolder : Line;

  @Input() newSubline: SubLine;
  sublineList: SubLine[];
  sublineUpdate : SubLine;

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  constructor(private auth: AuthenticationService,private router: Router, private caller: AuthService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.isDirty = false;
    this.lineList = [];
    this.newLine = new Line();
    this.lineUpdate = new Line();
    this.lineHolder = new Line();
    this.lineHolder.line_detail_id = "0";


    this.sublineList = [];
    this.newSubline = new SubLine();
    this.sublineUpdate = new SubLine();

    const param =  `{"action": "select", "values": {}}`;
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {
          this.lineList = result.msg;
          this.spinner.hide();
        }
      );

  }

  addNewLine(){
    this.newLine.active = "1";

    const param =  {"action": "insert", "values": this.newLine };
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {

          const param1 =  `{"action": "select", "values": {}}`;
          this.caller.doCallService("/digitalinnoproductservice/?action=line", param1).subscribe(
              resulta => {
                this.lineList = resulta.msg;

                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    'Success adding new line',
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...!',
                    'Something went wrong. Please try again.',
                    'warning'
                  );
                }
                $("#addNewLineClose").trigger('click');
                this.spinner.hide();
              }
            );

          

        }
      );

  }

  addNewSubline(){
    this.newSubline.active = "1";
    this.newSubline.line_detail_id = this.lineHolder.line_detail_id;

    const param =  {"action": "insert", "values": this.newSubline };
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {

          $(".line-action-button").removeClass("hidden");
          const param1 =  {"action": "select", "values": {"line_detail_id" : this.lineHolder.line_detail_id}};
          this.caller.doCallService("/digitalinnoproductservice/?action=subline", param1).subscribe(
              resulta => {
                this.sublineList = resulta.msg;
                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    'Success adding new Subline',
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...!',
                    'Something went wrong. Please try again.',
                    'warning'
                  );
                }
                $("#addNewSublineClose").trigger('click');
                this.spinner.hide();
              }
            );

        }

      );

  }

  chooseLineBrowse(){

    $(".line-action-button").removeClass("hidden");

    const param =  {"action": "select", "values": {"line_detail_id" : this.lineHolder.line_detail_id}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {
          this.sublineList = result.msg;
          this.spinner.hide();
        }
      );

  }

  chooseLine(){
    $("#subline-chooser").removeClass("hidden");
  }

  updateLine(){

    const param =  {"action": "select", "values": {"line_detail_id" : this.lineHolder.line_detail_id}};
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {
          this.lineUpdate = result.msg[0];
          this.spinner.hide();
        }
      );

  }

  updateSubline(subline: any){
    this.sublineUpdate = subline;
  }

  submitUpdateLine(){

    const param =  {"action": "update", "values": this.lineUpdate };
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {

          const param1 =  `{"action": "select", "values": {}}`;
          this.caller.doCallService("/digitalinnoproductservice/?action=line", param1).subscribe(
              resulta => {
                this.lineList = resulta.msg;

                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    "Success update of line ID " + this.lineUpdate.line_detail_id,
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...!',
                    'Something went wrong. Please try again.',
                    'warning'
                  );
                }
                $("#submitUpdateLineClose").trigger('click');
                this.spinner.hide();
              }
            );

        }
      );

  }

  submitUpdateSubline(){

    const param =  {"action": "update", "values": this.sublineUpdate };
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
        result => {

          $(".line-action-button").removeClass("hidden");
          const param1 =  {"action": "select", "values": {"line_detail_id" : this.lineHolder.line_detail_id}};
          this.caller.doCallService("/digitalinnoproductservice/?action=subline", param1).subscribe(
              resulta => {
                this.sublineList = resulta.msg;
                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    "Success update of subline ID " + this.sublineUpdate.subline_detail_id,
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...!',
                    'Something went wrong. Please try again.',
                    'warning'
                  );
                }
                $("#submitUpdateSublineClose").trigger('click');
                this.spinner.hide();
              }
            );

        }
      );

  }

  deleteLine(){

    Swal.fire({
      title: 'Line Deletion',
      text: "Are you sure you want to delete line ID  "+ this.lineHolder.line_detail_id + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {

        const param =  {"action": "delete", "values": {"line_detail_id" : this.lineHolder.line_detail_id} };
        this.spinner.show();
        this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
            result => {

              const param1 =  `{"action": "select", "values": {}}`;
              this.caller.doCallService("/digitalinnoproductservice/?action=line", param1).subscribe(
                  resulta => {
                    this.lineList = resulta.msg;

                    if(result.status == "1"){
                      Swal.fire(
                        'Success!',
                        "Success deletion of line ID " + this.lineHolder.line_detail_id,
                        'success'
                      );
                    }else{
                      Swal.fire(
                        'Ooppsss...!',
                        'Something went wrong. Please try again.',
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

  deleteSubline(subline : any){

    Swal.fire({
      title: 'Subline Deletion',
      text: "Are you sure you want to delete subline ID  "+ subline['subline_detail_id'] + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {

        const param =  {"action": "delete", "values": subline };
        this.spinner.show();
        this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
            result => {

              $(".line-action-button").removeClass("hidden");
              const param1 =  {"action": "select", "values": {"line_detail_id" : this.lineHolder.line_detail_id}};
              this.caller.doCallService("/digitalinnoproductservice/?action=subline", param1).subscribe(
                  resulta => {
                    this.sublineList = resulta.msg;
                    if(result.status == "1"){
                      Swal.fire(
                        'Success!',
                        "Success deletion of subline ID " + subline['subline_detail_id'],
                        'success'
                      );
                    }else{
                      Swal.fire(
                        'Ooppsss...!',
                        'Something went wrong. Please try again.',
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

}
