import { Component, OnInit, HostListener, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import * as dz from 'dropzone/dist/dropzone.js';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {Marsh} from '../../../objects/marsh';
import {Risk} from '../../../objects/risk';
import {MotorAccessories} from '../../../objects/motor-accessories';
import * as m from 'moment';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-accident',
  templateUrl: './accident.component.html',
  styleUrls: ['./accident.component.css']
})
export class AccidentComponent implements OnInit {

  constructor(private caller : AuthService) { }

  @Input() marsh: Marsh;
  @Output() nextStep = new EventEmitter();
  @Output() marshOutput = new EventEmitter();
  @Output() backButton = new EventEmitter();

  ngOnInit() {
  	
  }

  nextStepAction(){
  	this.nextStep.emit("personalInformation");
    this.backButton.emit("motorQuotationIssuance");
    this.marshOutput.emit(this.marsh);
  }

  backButtonAction(){
    this.nextStep.emit("initialize");
    this.backButton.emit("");
    this.marshOutput.emit(this.marsh);
  }

}
