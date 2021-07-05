import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../../services/authentication.service';
import {Router} from '@angular/router';
import {IsRequired} from '../../../../guard/is-required';
import {ComponentCanDeactivate} from '../../../../guard/component-can-deactivate';
import {Affinity} from '../../../../objects/affinity';
import {Risk} from '../../../../objects/risk';
import {TransactionDTO} from '../../../../objects/transaction-DTO';
import {AuthService} from '../../../../services/auth.service';
import {CommonService} from '../../../../services/common.service';
import * as m from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-insured-details',
  templateUrl: './insured-details.component.html',
  styleUrls: ['./insured-details.component.css']
})
export class InsuredDetailsComponent implements OnInit {

  constructor(private caller : AuthService, private checker : IsRequired, private common : CommonService,
    private spinner : NgxSpinnerService) { }

  @Input() editInsured : Risk;
  @Input() loadType : String;
  @Input() existing : Risk[];
  @Input() effectivity : string;
  @Input() civilStatus : string;
  @Output() newInsured = new EventEmitter();

  insuredAffinity : Affinity = new Affinity();
  buttonSubject : String = "Add Insured";

  ngOnInit() {
  	this.spinner.show();

    console.log(this.existing);

    if(this.loadType == "edit"){
      this.insuredAffinity.riskDetails = this.editInsured;
      this.buttonSubject = "Update Insured";
      let bDay = this.insuredAffinity.riskDetails.birthDate.substring(4,8) + "-" + this.insuredAffinity.riskDetails.birthDate.substring(2,4) + "-" + this.insuredAffinity.riskDetails.birthDate.substring(0,2);
      if(this.insuredAffinity.riskDetails.birthDate.match(/[\-]/)){
        bDay = this.insuredAffinity.riskDetails.birthDate;
      }
      
      this.insuredAffinity.riskDetails.birthDate = bDay;
      this.chooseOccupationalClass();
    }

    this.caller.getOptionList('EN', 'TIPO_SUFIJO_NOMBRE', '999').subscribe(
      result => {
        this.insuredAffinity.lov.suffixLOV = result;
    });

    this.caller.getOptionList('EN', 'COD_EST_CIVIL', '999').subscribe(
      result => {
        this.insuredAffinity.lov.civilStatusLOV = result;
    });

	this.caller.getLOV("G2990006","1","COD_RAMO~337|COD_CAMPO~COD_OCCUPATIONAL_CLASS|FEC_VALIDEZ~01012020|COD_MODALIDAD~99999|COD_CIA~1").subscribe(
      result => {
        console.log(result);
        this.insuredAffinity.lov.occupationalClassLOV = result;
        this.insuredAffinity.lov.occupationalClassLOV.splice(this.insuredAffinity.lov.occupationalClassLOV.length - 1, 1);
    });

    this.caller.getLOV("G1010031","82","COD_RAMO~337|COD_IDIOMA~EN|COD_CAMPO~RELATIONSHIP").subscribe(
      result => {
        console.log(result); 
        let haveSpouse = "0";
        let childCount = 0;
        for(let x = 0; x < this.existing.length; x++){
          if(this.existing[x].relationship.split(":=:")[0] == "S"){
            haveSpouse = "1";
          }else if(this.existing[x].relationship.split(":=:")[0] == "C"){
            childCount = childCount + 1;
          }
        }
        if(this.civilStatus != "C"){
          haveSpouse = "1";
        }
        console.log(haveSpouse);
        for(let i = 0; i < result.length; i++){
          if(haveSpouse == "1"){
            this.insuredAffinity.lov.relationshipLOV = [];
            if(result[i].COD_VALOR == "C"){
              if(this.loadType != "edit"){
                this.insuredAffinity.riskDetails.relationship = "C:=:CHILD";
                this.insuredAffinity.riskDetails.occupationalClass = "A:=:DUTIES WITH NO MANUAL WORK (Mostly Office Duties)";
                this.chooseOccupationalClass();
              }
              this.insuredAffinity.lov.relationshipLOV.push(result[i]);
              break;
            }
          }else if(childCount == 3){
            this.insuredAffinity.lov.relationshipLOV = [];
            if(result[i].COD_VALOR == "S"){
              this.insuredAffinity.lov.relationshipLOV.push(result[i]);
              break;
            }
          }else if(result[i].COD_VALOR !== "P"){
            this.insuredAffinity.lov.relationshipLOV.push(result[i]);
          }

        	if(this.loadType != "edit"){
            this.insuredAffinity.riskDetails.relationship = "";
            this.insuredAffinity.riskDetails.occupationalClass = "";
          }


        }
        this.spinner.hide();
    });

    
    
  }

  chooseBirthday(){

    let ret = true;

      console.log(this.effectivity);
      console.log(this.insuredAffinity.riskDetails.birthDate);

      // let currentYearDiff = (m().year() - parseInt(this.affinity.riskDetails.birthDate));
      // let currentYearDiff = (m(this.effectivity,'YYYY-MM-DD').diff(m(this.insuredAffinity.riskDetails.birthDate,'YYYY-MM-DD'), 'months', true)) / 12;

      let dt1 = new Date(this.effectivity.replace(/-/g, '/'));
      let dt2 = new Date(this.insuredAffinity.riskDetails.birthDate.replace(/-/g, '/'));
      let currentYearDiff = this.monthDiff(dt2, dt1) / 12;

      console.log(currentYearDiff);
      console.log(dt1);
      console.log(dt2);

      if(currentYearDiff > 21){
        Swal.fire({
          type: 'error',
          title: 'Quotation Issuance',
          text: "Age of Child must be up to 21 years old."
        });

        ret = false;

      }
      

    return ret;

  }

  monthDiff(d1, d2) {
      var months;
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      months += (d2.getDate() - d1.getDate()) / 31;
      return months <= 0 ? 0 : months;
  }

  chooseOccupationalClass(){
    console.log(this.editInsured);
    if(!this.insuredAffinity.riskDetails.occupationalClass){
      return null;
    }
    this.caller.getLOV("G2990006","13","COD_CIA~1|COD_RAMO~337|COD_CAMPO~TXT_OCCUPATION|FEC_VALIDEZ~01012020|DVCOD_OCCUPATIONAL_CLASS~"+this.insuredAffinity.riskDetails.occupationalClass.split(':=:')[0]+"|COD_IDIOMA~EN").subscribe(
      result => {
        console.log(result);
        this.insuredAffinity.lov.occupationLOV = result;
        this.insuredAffinity.riskDetails.occupation = "";
    });
  }

  backButtonAction(){
  	this.insuredAffinity.isBack = true;
  	this.newInsured.emit(this.insuredAffinity);
  }

  addInsured(){

    if(this.checker.checkIfRequired('pa-personal-insured') == "0"){
      return null;
    }

    if(this.insuredAffinity.riskDetails.relationship.split(":=:")[0] == "C"){
      if(!this.chooseBirthday()){
        return null;
      }
    }

    this.insuredAffinity.riskDetails.firstName = this.insuredAffinity.riskDetails.firstName.toUpperCase();
    this.insuredAffinity.riskDetails.middleName = ((this.insuredAffinity.riskDetails.middleName) ? this.insuredAffinity.riskDetails.middleName.toUpperCase() : "");
    this.insuredAffinity.riskDetails.lastName = this.insuredAffinity.riskDetails.lastName.toUpperCase();
    
  	this.insuredAffinity.isBack = false;
  	this.newInsured.emit(this.insuredAffinity.riskDetails);
  }

}
