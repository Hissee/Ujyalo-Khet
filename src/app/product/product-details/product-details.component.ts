import { NgIf } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct} from '../Iproduct';
import {ProductService} from '../product.service';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit{

  // products: IProduct[] = [];
  // product:any;
  //
  // constructor(private route:ActivatedRoute){
  // }
  //
  // ngOnInit(){
  //   const productId = Number(this.route.snapshot.paramMap.get('id'));
  //   this.product = this.products.find(p => p.id === productId);
  //
  //   console.log(this.product)
  // }

  //using service
  products: IProduct[] = [];
  // product: IProduct = {} as IProduct;
  product: any;
  service = inject(ProductService)
  constructor(private route:ActivatedRoute){
    }

  ngOnInit(){
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      // Use the new API method to fetch product by ID directly
      this.service.getProductById(productId)
        .subscribe({
          next: (data) => {
            this.product = data;
            console.log('Product loaded:', this.product);
          },
          error: (err) => {
            console.error('Error loading product:', err);
            this.product = null;
          }
        });
    }
  }

}
