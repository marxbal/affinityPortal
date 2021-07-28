export class Partner {

  partnerCode: string;
  agentCode: number;
  partnerName: string;
  domain: string;
  products: number[];

  constructor(init ? : Partial < Partner > ) {
    Object.assign(this, init);
  }

}