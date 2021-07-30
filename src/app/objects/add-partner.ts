export class AddPartner {

  partnerCode: string;
  partnerName: string;
  domain: string;
  themeCode: string;

  constructor(init ? : Partial < AddPartner > ) {
    Object.assign(this, init);
  }

}