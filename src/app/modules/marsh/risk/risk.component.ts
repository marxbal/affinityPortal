import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {Risk} from '../../../objects/risk';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.css']
})
export class RiskComponent implements OnInit {

  constructor() { }

  @Input() line: String;
  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();

  director: Risk;
  stockholder: Risk;
  beneficiary: Risk;

  ngOnInit() {

    console.log(this.line);
    console.log(this.marsh.motorDetails.isCorporate);

    this.director = new Risk();
    this.stockholder = new Risk();
    this.beneficiary = new Risk();


  }

  addCompanyDetail(type){
    switch (type) {
      case "director":
        this.marsh.motorDetails.directors.push(this.director);
        this.director = new Risk();
        break;
      case "stockholder":
        this.marsh.motorDetails.stockholders.push(this.stockholder);
        this.stockholder = new Risk();
        break;
      
      default:
        this.marsh.motorDetails.beneficiaries.push(this.beneficiary);
        this.beneficiary = new Risk();
        break;
    }
  }

  removeCompanyDetail(detail: Risk, type){
    switch (type) {
      case "director":
        let index1: number = this.marsh.motorDetails.directors.indexOf(detail);

        if (index1 !== -1) {
          this.marsh.motorDetails.directors.splice(index1, 1);
        }
        break;
      case "stockholder":
        let index2: number = this.marsh.motorDetails.stockholders.indexOf(detail);

        if (index2 !== -1) {
          this.marsh.motorDetails.stockholders.splice(index2, 1);
        }
        break;
      
      default:
        let index: number = this.marsh.motorDetails.beneficiaries.indexOf(detail);

        if (index !== -1) {
          this.marsh.motorDetails.beneficiaries.splice(index, 1);
        }
        break;
    }
  }

  nextStepAction(nextStep){
  	this.nextStep.emit(nextStep);
    this.marshOutput.emit(this.marsh);
  }

  backButtonAction(){
    this.nextStep.emit("initialize");
    this.marshOutput.emit(this.marsh);
  }

  marshOutputt(marshOutput){
    this.marsh = marshOutput;
  }

}
