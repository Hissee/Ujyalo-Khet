import { Router } from '@angular/router';
import { IProduct,  } from '../Iproduct';
import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
// import {ProductListService} from './product-list.service';
import {ProductService} from '../product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{
  products: IProduct[] = [];
  service = inject(ProductService);
  router = inject(Router);

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

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '0.00';
    return price.toFixed(2);
  }

  navigateToProduct(productId: string | number) {
    this.router.navigate(['/view-product', productId]);
  }

  addToCart(event: Event, product: IProduct) {
    event.stopPropagation(); // Prevent card click navigation
    // TODO: Implement cart functionality
    console.log('Add to cart:', product);
    // You can implement cart service here
  }
}

