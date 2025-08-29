import { RouterLink } from '@angular/router';
import { IProduct,  } from '../Iproduct';
import {Component, inject, OnInit} from '@angular/core';
import { NgIf } from '@angular/common';
import {ProductListService} from './product-list.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{
  products: IProduct[] = [];
  service = inject(ProductListService)

  ngOnInit(){
    this.service.listProducts()
      .subscribe({
        next: (data) => {
          this.products = data;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('complete');
        }
      })
  }
}

