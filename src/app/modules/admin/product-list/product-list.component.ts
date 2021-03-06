import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';

interface Product {
  productId: number;
  name: string;
  businessLine: string;
}

const PRODUCT: Product[] = [{
    productId: 10001,
    name: "Comprehensive",
    businessLine: "Motor",
  },
  {
    productId: 10002,
    name: "CTPL",
    businessLine: "Motor",
  },
  {
    productId: 10003,
    name: "Individual",
    businessLine: "Accident",
  },
  {
    productId: 10004,
    name: "Family",
    businessLine: "Accident",
  },
];

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products = PRODUCT;

  constructor(
    private router: Router) {}

  ngOnInit() {}

  edit(productId: number) {
    this.router.navigateByUrl("/product?productId=" + productId);
  }

  addProduct() {
    this.router.navigateByUrl("/product");
  }

}
