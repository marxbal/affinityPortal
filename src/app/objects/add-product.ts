export class AddProduct {

  partnerCode: string;
  line: number;
  subline: number;
  groupPolicy: number;
  contract: number;
  subContract: number;
  agentCode: number;
  product: number;
  products: string[];
  isInactive: boolean;

  constructor(init ? : Partial < AddProduct > ) {
    Object.assign(this, init);
  }

}