import {Risk} from './risk';
import {Property} from './property';
import {Quotation} from './quotation';
import {Motor} from './motor';
import {Pa} from './pa';
import {MarshCoverages} from './marsh-coverages';
import {LOV} from './lov';
import {PremiumBreakdown} from './premium-breakdown';
import {TransactionDTO} from './transaction-DTO';
import {KYC} from './KYC';

export class Marsh {

  riskDetails: Risk = new Risk();
  propertyDetails: Property = new Property();
  motorDetails: Motor = new Motor();
  quotationDetails: Quotation = new Quotation();
  paDetails: Pa = new Pa();
  lov: LOV = new LOV();
  tDTO: TransactionDTO = new TransactionDTO();
  premiumBreakdown: PremiumBreakdown = new PremiumBreakdown();
  KYC: KYC = new KYC();
  coverages: MarshCoverages[] = [];
  coveragesValue: MarshCoverages[] = [];
  previousIssuances: any[] = [];
  alternativeHolders: Risk[] = [];
  productId: string;
  policyNumber: string;
  quotationNumber: string;
  clientId: string;
  lineId: string;
  isBack: boolean;
  paymentConfirmed: string;
  paymentOption: string;
  paymentReferenceNumber: string;
  techControlLevel: string; //determine if observation, audit or reject
  techControl: string[] = []; //list of technical controls
  
}