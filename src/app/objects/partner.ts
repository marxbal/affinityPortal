export class Partner {

  agentCode: number;
  subline: number;
  partnerName: string;
  domain: string;
  groupPolicy: number;
  contract: number;
  subContract: number;
  primaryColor: string;
  products: number[];
  product: number;
  active: boolean;

  constructor(init ? : Partial < Partner > ) {
    Object.assign(this, init);
  }

}