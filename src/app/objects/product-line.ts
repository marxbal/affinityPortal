import {
  ProductList
} from "./product-list";

export class ProductLine {

  name: string;
  badge: string;
  description: string;
  thumbnail: string;
  issuanceType: string;
  products: ProductList[];

  constructor(init ? : Partial < ProductLine > ) {
    Object.assign(this, init);
  }

}
