import {PocSoa} from '../objects/poc-soa';

export class PaymentPolicies {

  manningAgency: string;
  masterPolicyNumber: string;
  intermediaryCode: string;
  soaNo: string;
  dateGenerated: string;
  pocs: PocSoa[];
  
}