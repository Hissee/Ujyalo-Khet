import { RouterLink } from '@angular/router';
import { IProduct, PRODUCTS } from './Iproduct';
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: IProduct[] = PRODUCTS;

  ngOnInit(){
  // console.log(this.products);

  }
}

