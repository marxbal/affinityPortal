export class AddPartner {

  partnerCode: string;
  partnerName: string;
  domain: string;
  themeCode: string;
  auto: boolean;
  branchCode: number;
  chatEmail: string;


  constructor(init ? : Partial < AddPartner > ) {
    Object.assign(this, init);
  }

}