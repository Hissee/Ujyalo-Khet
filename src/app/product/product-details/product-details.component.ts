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

  product: IProduct | null = null;
  loading: boolean = false;
  error: string | null = null;
  
  service = inject(ProductService);
  
  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(){
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.error = 'Product ID not found';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.service.getProductById(productId)
      .subscribe({
        next: (data) => {
          this.product = data;
          this.loading = false;
          console.log('Product loaded:', this.product);
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.error = err.error?.message || 'Failed to load product details';
          this.loading = false;
          this.product = null;
        }
      });
  }

}
