export class Partner {

  partnerCode: string;
  agentCode: number;
  partnerName: string;
  domain: string;
  themeCode: string;
  products: number[];

  constructor(init ? : Partial < Partner > ) {
    Object.assign(this, init);
  }

}