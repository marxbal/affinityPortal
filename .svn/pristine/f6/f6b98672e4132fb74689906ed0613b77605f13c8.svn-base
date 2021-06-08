import {ElementSelectionService} from './../../../element-selection.service';
import {ComponentInspectorService} from './../../../component-inspector.service';
import { Component, OnInit,OnDestroy, HostListener } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import * as m from 'moment';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../../guard/component-can-deactivate';
import {ExchangeRate} from '../../../objects/exchange-rate';
import {Configuration} from '../../../objects/configuration';
import Swal from 'sweetalert2';
import {CountryDetail} from '../../../objects/country-detail';
import {UnderwritingDetails} from '../../../objects/underwriting-details';
import {DateFormat} from '../../../objects/date-format';
import {UploadParams} from '../../../objects/upload-params';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit, ComponentCanDeactivate,OnDestroy {

  constructor(public __elementSelectionService:ElementSelectionService, private __componentInspectorService:ComponentInspectorService,
private auth: AuthenticationService,private caller : AuthService,private router: Router,
    private spinner: NgxSpinnerService) {this.__componentInspectorService.getComp(this);
 }

  private subscription: Subscription = new Subscription();

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  public uploaderFirst: FileUploader = new FileUploader({url: '/client/uploadToFileSystem', itemAlias: 'file'});
  public uploaderSecond: FileUploader = new FileUploader({url: '/client/uploadToFileSystem', itemAlias: 'file'});
  configList: Configuration[];
  dateFormat: Configuration;
  newDateFormat: Configuration;
  signatory1: Configuration;
  signatory1title: Configuration;
  signatory2: Configuration;
  signatory2title: Configuration;
  minimumAge: Configuration;
  maximumAge: Configuration;
  exchangeType: String;
  addExchangeRateError: String;
  addExchangeRateSuccess: String;
  countryList : CountryDetail[];
  restrictedCountries : UnderwritingDetails[];
  dateFormatList : DateFormat[];
  countryId : string;
  up1 : UploadParams;
  up2 : UploadParams;

  ngOnInit() {
   this.dateFormat = new Configuration();
   this.minimumAge = new Configuration();
   this.maximumAge = new Configuration();
   this.newDateFormat = new Configuration();
   this.signatory1 = new Configuration();
   this.signatory1title = new Configuration();
   this.signatory2 = new Configuration();
   this.signatory2title = new Configuration();
   this.countryId = "0";

   this.up1 = new UploadParams();
   this.up1.param1 = '/signature1.png';
   this.uploaderFirst.options.additionalParameter = {uploadParams : JSON.stringify(this.up1)};
   this.uploaderFirst.onAfterAddingFile = (file) => { file.withCredentials = false; };
   this.uploaderFirst.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
       Swal.fire(
          'Success!',
          'File uploaded successfully',
          'success'
        );
   };

   this.up2 = new UploadParams();
   this.up2.param1 = '/signature2.png';
   this.uploaderSecond.options.additionalParameter = {uploadParams : JSON.stringify(this.up2)};
   this.uploaderSecond.onAfterAddingFile = (file) => { file.withCredentials = false; };
   this.uploaderSecond.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
       Swal.fire(
          'Success!',
          'File uploaded successfully',
          'success'
        );
   };
   this.spinner.show();
   let param =  {action: "select-configuration", values: {"config_name": 'DATE_FORMAT'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.dateFormat = result.msg;
        this.newDateFormat.configValue = this.dateFormat[0].configValue;
        this.newDateFormat.configurationId = this.dateFormat[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.signatory1.configValue = result.msg[0].configValue;
        this.signatory1.configurationId = result.msg[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1TITLE'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.signatory1title.configValue = result.msg[0].configValue;
        this.signatory1title.configurationId = result.msg[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.signatory2.configValue = result.msg[0].configValue;
        this.signatory2.configurationId = result.msg[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2TITLE'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.signatory2title.configValue = result.msg[0].configValue;
        this.signatory2title.configurationId = result.msg[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'AGEMINIMUM'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.minimumAge.configValue = result.msg[0].configValue;
        this.minimumAge.configurationId = result.msg[0].configurationId;
      }
    ));

    param =  {action: "select-configuration", values: {"config_name": 'AGEMAXIMUM'}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        this.maximumAge.configValue = result.msg[0].configValue;
        this.maximumAge.configurationId = result.msg[0].configurationId;
      }
    ));

    let paramCountry =  {action: "select-all-country-list", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramCountry).subscribe(
        result => {
          this.countryList = result.msg;
        }
      ));
    this.restrictedCountries = [];
    let paramRestrictedCountry =  {action: "select-restricted-countries", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramRestrictedCountry).subscribe(
        result => {
          this.restrictedCountries = result.msg;
        }
      ));


    let paramDateFormats =  {action: "select-all-date-format", values: {}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", paramDateFormats).subscribe(
        result => {
          this.dateFormatList = result.msg;
          this.spinner.hide();
        }
      ));

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  updateDate(){

    let param =  {action: "update-configuration", values: {"config": this.newDateFormat}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      result => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'DATE_FORMAT'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.dateFormat = new Configuration();
               this.newDateFormat = new Configuration();
              this.dateFormat = result.msg;
              this.newDateFormat.configValue = this.dateFormat[0]['configValue'];
              this.newDateFormat.configurationId = this.dateFormat[0]['configurationId'];

              Swal.fire(
                'Success!',
                'Successful update of system date format.',
                'success'
              );

            }
          ));
      }
    ));
    
  }

  updateSignatoryOne(){

    let param =  {action: "update-configuration", values: {"config": this.signatory1}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.signatory1 = new Configuration();
              this.signatory1.configValue = result.msg[0].configValue;
              this.signatory1.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of First Signatory.',
                'success'
              );

            }
          ));
      }
    ));

  }

  updateSignatoryOneTitle(){

    let param =  {action: "update-configuration", values: {"config": this.signatory1title}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'SIGNATORY1TITLE'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.signatory1title = new Configuration();
              this.signatory1title.configValue = result.msg[0].configValue;
              this.signatory1title.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of First Signatory Title.',
                'success'
              );

            }
          ));
      }
    ));

  }

  updateSignatoryTwo(){

    let param =  {action: "update-configuration", values: {"config": this.signatory2}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.signatory2 = new Configuration();
              this.signatory2.configValue = result.msg[0].configValue;
              this.signatory2.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of Second Signatory.',
                'success'
              );

            }
          ));
      }
    ));

  }

  updateSignatoryTwoTitle(){

    let param =  {action: "update-configuration", values: {"config": this.signatory2title}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'SIGNATORY2TITLE'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.signatory2title = new Configuration();
              this.signatory2title.configValue = result.msg[0].configValue;
              this.signatory2title.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of Second Signatory Title.',
                'success'
              );

            }
          ));
      }
    ));

  }

  updateMinimumAge(){

    let param =  {action: "update-configuration", values: {"config": this.minimumAge}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'AGEMINIMUM'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.minimumAge = new Configuration();
              this.minimumAge.configValue = result.msg[0].configValue;
              this.minimumAge.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of Minimum Age',
                'success'
              );

            }
          ));
      }
    ));

  }

  updateMaximumAge(){

    let param =  {action: "update-configuration", values: {"config": this.maximumAge}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param).subscribe(
      resulta => {
        let param2 =  {action: "select-configuration", values: {"config_name": 'AGEMAXIMUM'}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=inbox", param2).subscribe(
            result => {
              this.maximumAge = new Configuration();
              this.maximumAge.configValue = result.msg[0].configValue;
              this.maximumAge.configurationId = result.msg[0].configurationId;

              Swal.fire(
                'Success!',
                'Successful update of Maximum Age',
                'success'
              );

            }
          ));
      }
    ));

  }

  removeCountry(country){
    const index: number = this.restrictedCountries.indexOf(country);

    if (index !== -1) {
      this.restrictedCountries.splice(index, 1);
    }

    let lists = [];
    for(let i = 0; i < this.restrictedCountries.length; i++){
      lists.push({countryId:this.restrictedCountries[i].countryId});
    }


    let param =  {action: "update-restricted-countries", values: {"countries": lists}};

    this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
      resulta => {
        this.restrictedCountries = [];
        let paramRestrictedCountry =  {action: "select-restricted-countries", values: {}};

        this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramRestrictedCountry).subscribe(
            result => {
              this.restrictedCountries = result.msg;
              Swal.fire(
                      'Success!',
                      'Successful update of Restricted countries',
                      'success'
                    );
            }
          ));
        
      }
    ));

  }

  addNewCountry(){
    if(this.countryId == "0"){
      Swal.fire(
        'Country',
        'Please choose a country to restrict.',
        'error'
      );
    }else{

      let temp = new UnderwritingDetails();
      temp.countryId = this.countryId;
      this.restrictedCountries.push(temp);

      let lists = [];
      for(let i = 0; i < this.restrictedCountries.length; i++){
        lists.push({countryId:this.restrictedCountries[i].countryId});
      }


      let param =  {action: "update-restricted-countries", values: {"countries": lists}};

      this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", param).subscribe(
        resulta => {
          this.restrictedCountries = [];
          let paramRestrictedCountry =  {action: "select-restricted-countries", values: {}};

          this.subscription.add(this.caller.doCallService("/digitalinnopolicyservice/?action=policy", paramRestrictedCountry).subscribe(
              result => {
                this.restrictedCountries = result.msg;
                Swal.fire(
                        'Success!',
                        'Successful update of Restricted countries',
                        'success'
                      );
              }
            ));
          
        }
      ));

    }
  }

  closeAlert(alertId){
    $("#" + alertId).addClass("hidden");
  }

  openAccordion(accordionId: string){

    if($("#" + accordionId + " span i").hasClass('fa-chevron-down')){
      $("#" + accordionId + " span i").removeClass("fa-chevron-down");
      $("#" + accordionId + " span i").addClass("fa-chevron-up");
    }else{
      $("#" + accordionId + " span i").removeClass("fa-chevron-up");
      $("#" + accordionId + " span i").addClass("fa-chevron-down");
    }

  }

}
