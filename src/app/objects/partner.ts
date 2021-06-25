export class Partner {

  partnerId: number;
  name: string;
  domain: string;
  primaryColor: string;
  products: [number];

  constructor(init ? : Partial < Partner > ) {
    Object.assign(this, init);
  }

}