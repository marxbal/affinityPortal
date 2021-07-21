export class Partner {

  agentCode: number;
  partnerName: string;
  domain: string;
  groupPolicy: number;
  contract: number;
  subContract: number;
  primaryColor: string;
  products: number[];

  constructor(init ? : Partial < Partner > ) {
    Object.assign(this, init);
  }

}