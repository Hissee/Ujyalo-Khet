import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct, PRODUCTS } from '../product-list/Iproduct';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent  {

  products: IProduct[] = PRODUCTS;
  product:any;


  constructor(private route:ActivatedRoute){

  }

  ngOnInit(){
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.products.find(p => p.id === productId);

    console.log(this.product)
  }
}