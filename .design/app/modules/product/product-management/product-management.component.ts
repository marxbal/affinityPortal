import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Line} from '../../../objects/line';
import { SubLine } from '../../../objects/subLine';
import {Product} from '../../../objects/product';
import {LineSublineCoverageMap} from '../../../objects/line-subline-coverage-map';
import {AuthService} from '../../../services/auth.service';
import {PolicyCoverages} from '../../../objects/policy-coverages';
import * as _ from 'lodash';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit, ComponentCanDeactivate {

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,
private auth: AuthenticationService,private router: Router, private caller: AuthService,
    private spinner: NgxSpinnerService) {this.__componentInspectorService.getComp(this);
 }

  @Input() newProduct: Product;

  lineList: Line[];
  sublineList: SubLine[];
  coveragesList: PolicyCoverages[];
  coveragesListUpdateFinal: PolicyCoverages[];
  newCoverageList: PolicyCoverages[];
  newCoverageListUpdate: PolicyCoverages[];
  finalCoverageList: PolicyCoverages[];
  latestProductList: Product[];
  productCoveragesList: PolicyCoverages[];
  updateCoverages: PolicyCoverages[];
  updateProduct: Product;
  productHolder: Product;

  ngOnInit() {
    this.clearModalContents();
    this.productHolder = new Product();
    this.updateCoverages = [];
    this.productHolder.product_detail_id = "0";
  }

  clearModalContents(){
    this.newProduct = new Product();
    this.updateProduct = new Product();
    this.lineList = [];
    this.sublineList = [];
    this.coveragesList = [];
    this.coveragesListUpdateFinal = [];
    this.newCoverageList = [];
    this.newCoverageListUpdate = [];
    this.finalCoverageList = [];
    this.latestProductList = [];
    this.productCoveragesList = [];
    this.spinner.show();



    let param =  `{"action": "select", "values": {}}`;

    this.caller.doCallService("/digitalinnoproductservice/?action=line", param).subscribe(
        result => {
          this.lineList = result.msg;
        }
      );

    param =  `{"action": "selectProducts", "values": {}}`;

    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          this.latestProductList = result.msg;
          this.spinner.hide();
        }
      );

    this.checkIfHasClass("subline-chooser");
    this.checkIfHasClass("coverages-chooser");

  }

  openUpdateProduct(){
    this.spinner.show();
    let param =  {"action": "selectProductById", "values": {"product_detail_id" : this.productHolder.product_detail_id}};

    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          this.updateProduct = result.msg[0];
          this.spinner.hide();
        }
      );

    this.updateCoverages = this.productCoveragesList;

  }

  deleteProduct(){

    Swal.fire({
      title: 'Confirm Deletion',
      text: "Are you sure you want to delete product ID "+ this.productHolder.product_detail_id + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {

        this.spinner.show();
        let param =  {"action": "delete", "values": {"product_detail_id" : this.productHolder.product_detail_id}};

        this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
            result => {

              let param =  `{"action": "selectProducts", "values": {}}`;

              this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
                  result => {
                    this.latestProductList = result.msg;
                    
                    if(result.status == "1"){
                      Swal.fire(
                        'Deleted!',
                        "Success deletion of product ID " + this.productHolder.product_detail_id,
                        'success'
                      );
                    }else{
                      alert();
                      Swal.fire(
                        'Oopss...',
                        "Something went wrong. Please try again.",
                        'warning'
                      );
                    }
                    this.productCoveragesList = [];
                    this.spinner.hide();
                    
                  }
                );

            }
          );

        
      }
    })


  }

  chooseProduct(){
    this.spinner.show();
    let param =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.productHolder.product_detail_id}};

    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          this.productCoveragesList = result.msg;
          this.spinner.hide();
        }
      );

    $(".product-action-button").removeClass("hidden");

  }

  deleteProductCoverage(productCoverage : PolicyCoverages){

    Swal.fire({
      title: 'Coverage Deletion',
      text: "Are you sure you want to delete product coverage "+ productCoverage.type_name + "?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {

        this.spinner.show();
        const param =  {"action": "deleteProductCoverage", "values": productCoverage};

        this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
            result => {

              let param1 =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.productHolder.product_detail_id}};

              this.caller.doCallService("/digitalinnoproductservice/?action=product", param1).subscribe(
                  result => {
                    this.productCoveragesList = result.msg;

                    $(".product-action-button").removeClass("hidden");
                    this.spinner.hide();

                    if(result.status == "1"){

                      Swal.fire(
                        'Deleted!',
                        "Success deletion of product coverage " + productCoverage.type_name,
                        'success'
                      );

                    }else{
                      Swal.fire(
                        'Ooppsss...',
                        "Something went wrong. Please try again.",
                        'warning'
                      );

                    }

                  }
                );
              
            }
          );

        
      }
    })

  }

  addProduct(){
    this.spinner.show();
    let param =  {"action": "insert", "values": {"product_coverages" : this.finalCoverageList, "product_info" : this.newProduct}};
    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {

          let param1 =  `{"action": "selectProducts", "values": {}}`;

          this.caller.doCallService("/digitalinnoproductservice/?action=product", param1).subscribe(
              resulta => {
                this.latestProductList = resulta.msg;
                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    'Success adding new Product.',
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...',
                    "Something went wrong. Please try again.",
                    'warning'
                  );
                }
                $("#addProductClose").trigger('click');
                this.spinner.hide();
              }
            );

        }
      );

  }

  updateProductSubmit(){

    this.spinner.show();
    let param =  {"action": "updateProduct", "values": {"product_coverages" : this.updateCoverages, "product_info" : this.updateProduct}};
    this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
        result => {
          $("#updateProductSubmitClose").trigger("click");

          let param1 =  {"action": "selectProductCoverages", "values": {"product_detail_id" : this.productHolder.product_detail_id}};

          this.caller.doCallService("/digitalinnoproductservice/?action=product", param1).subscribe(
              resulta => {
                this.productCoveragesList = resulta.msg;
                this.spinner.hide();
                
                if(result.status == "1"){
                  Swal.fire(
                    'Success!',
                    'Success updating Product.',
                    'success'
                  );
                }else{
                  Swal.fire(
                    'Ooppsss...',
                    "Something went wrong. Please try again.",
                    'warning'
                  );
                }


              }
            );

        }
      );

  }

  checkIfHasClass(id: any){
    if(!$("#" + id).hasClass("hidden")){
      $("#" + id).addClass("hidden");
    }
  }

  chooseLine(action: any){

    let line_id = this.updateProduct.line_detail_id;
    let param =  {"action": "select", "values": {"line_detail_id" : line_id}};

    if(action === "insert"){

      $("#subline-chooser").removeClass("hidden");
      line_id = this.newProduct.line_detail_id;
      param =  {"action": "select", "values": {"line_detail_id" : line_id}};

    }
    this.spinner.show();
    this.caller.doCallService("/digitalinnoproductservice/?action=subline", param).subscribe(
      result => {
        this.sublineList = result.msg;
        this.spinner.hide();
      }
    );

  }

  chooseSubLine(action: any){

    if(action === "insert"){

      $("#coverages-chooser").removeClass("hidden");
      let subline_id = this.newProduct.subline_detail_id;

      let param =  {"action": "selectCoverages", "values": {"subline_detail_id" : subline_id}};
      this.spinner.show();
      this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
          result => {
            this.spinner.hide();
            this.coveragesList = _.differenceWith(result.msg, this.finalCoverageList, _.isEqual);

          }
        );

    }else{
      this.spinner.show();
      let subline_id = this.updateProduct.subline_detail_id;
      let param =  {"action": "selectCoverages", "values": {"subline_detail_id" : subline_id}};
      this.caller.doCallService("/digitalinnoproductservice/?action=product", param).subscribe(
          result => {

            for(let i = 0; i < this.updateCoverages.length; i++){
              this.updateCoverages[i] = _.omit(this.updateCoverages[i], ['product_coverage_map_id']);
            }
            this.spinner.hide();
            this.coveragesListUpdateFinal = _.differenceWith(result.msg, this.updateCoverages, _.isEqual);
          }
        );

    }

  }

  addCoverageList(addCoverage: PolicyCoverages){

    const index: number = this.newCoverageList.indexOf(addCoverage);

    if (index !== -1) {
      this.newCoverageList.splice(index, 1);
    }else{
      this.newCoverageList.push(addCoverage);
    }

  }

  addCoverageListUpdate(addCoverage: PolicyCoverages){

    const index: number = this.newCoverageListUpdate.indexOf(addCoverage);

    if (index !== -1) {
      this.newCoverageListUpdate.splice(index, 1);
    }else{
      this.newCoverageListUpdate.push(addCoverage);
    }

  }

  addFinalCoverages(){

    for(let i = 0; i < this.newCoverageList.length; i++){

    const index: number = this.coveragesList.indexOf(this.newCoverageList[i]);

    if (index !== -1) {
      this.coveragesList.splice(index, 1);
    }

      this.finalCoverageList.push(this.newCoverageList[i]);
    }

    this.newCoverageList = [];

  }

  addFinalUpdateCoverages(){

    for(let i = 0; i < this.newCoverageListUpdate.length; i++){

    const index: number = this.coveragesListUpdateFinal.indexOf(this.newCoverageListUpdate[i]);

    if (index !== -1) {
      this.coveragesListUpdateFinal.splice(index, 1);
    }

      this.updateCoverages.push(this.newCoverageListUpdate[i]);
    }

    this.newCoverageListUpdate = [];

  }

  removeFinalCoverage(coverage: PolicyCoverages){

  const index: number = this.finalCoverageList.indexOf(coverage);

    if (index !== -1) {
      this.finalCoverageList.splice(index, 1);
    }

  this.coveragesList.push(coverage);

  }

  removeFinalCoverageUpdate(coverage: PolicyCoverages){

  const index: number = this.updateCoverages.indexOf(coverage);

    if (index !== -1) {
      this.updateCoverages.splice(index, 1);
    }

  this.coveragesListUpdateFinal.push(coverage);

  }

}
