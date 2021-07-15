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
  AuthService
} from '../../../services/auth.service';

@Component({
  selector: 'app-accident',
  templateUrl: './accident.component.html',
  styleUrls: ['./accident.component.css']
})
export class AccidentComponent implements OnInit {

  constructor(private caller: AuthService) {}

  @Input() affinity: Affinity;
  @Output() nextStep = new EventEmitter();
  @Output() affinityOutput = new EventEmitter();
  @Output() backButton = new EventEmitter();

  ngOnInit() {

  }

  nextStepAction() {
    this.nextStep.emit("personalInformation");
    this.backButton.emit("motorQuotationIssuance");
    this.affinityOutput.emit(this.affinity);
  }

  backButtonAction() {
    this.nextStep.emit("initialize");
    this.backButton.emit("");
    this.affinityOutput.emit(this.affinity);
  }

}
