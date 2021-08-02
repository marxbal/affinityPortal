import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  Affinity
} from '../../../objects/affinity';
import {
  Risk
} from '../../../objects/risk';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.css']
})
export class RiskComponent implements OnInit {

  constructor() {}

  @Input() line: String;
  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();

  director: Risk;
  stockholder: Risk;
  beneficiary: Risk;

  ngOnInit() {
    this.director = new Risk();
    this.stockholder = new Risk();
    this.beneficiary = new Risk();
  }

  addCompanyDetail(type) {
    switch (type) {
      case "director":
        this.affinity.motorDetails.directors.push(this.director);
        this.director = new Risk();
        break;
      case "stockholder":
        this.affinity.motorDetails.stockholders.push(this.stockholder);
        this.stockholder = new Risk();
        break;

      default:
        this.affinity.motorDetails.beneficiaries.push(this.beneficiary);
        this.beneficiary = new Risk();
        break;
    }
  }

  removeCompanyDetail(detail: Risk, type) {
    switch (type) {
      case "director":
        let index1: number = this.affinity.motorDetails.directors.indexOf(detail);

        if (index1 !== -1) {
          this.affinity.motorDetails.directors.splice(index1, 1);
        }
        break;
      case "stockholder":
        let index2: number = this.affinity.motorDetails.stockholders.indexOf(detail);

        if (index2 !== -1) {
          this.affinity.motorDetails.stockholders.splice(index2, 1);
        }
        break;

      default:
        let index: number = this.affinity.motorDetails.beneficiaries.indexOf(detail);

        if (index !== -1) {
          this.affinity.motorDetails.beneficiaries.splice(index, 1);
        }
        break;
    }
  }

  nextStepAction(nextStep) {
    this.nextStep.emit(nextStep);
    this.affinityOutput.emit(this.affinity);
  }

  backButtonAction() {
    this.nextStep.emit("initialize");
    this.affinityOutput.emit(this.affinity);
  }

  affinityOutput2(affinityOutput) {
    this.affinity = affinityOutput;
  }

}
