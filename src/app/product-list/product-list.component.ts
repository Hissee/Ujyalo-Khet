import { IProduct, PRODUCTS } from './Iproduct';
import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: IProduct[] = PRODUCTS;

  ngOnInit(){
  // console.log(this.products);

  }
}
