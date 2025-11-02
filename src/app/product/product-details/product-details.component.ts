import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct} from '../Iproduct';
import {ProductService} from '../product.service';
import { CartService } from '../../cart/cart.service';

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
  orderQuantity: number = 1;
  addingToCart: boolean = false;
  
  service = inject(ProductService);
  cartService = inject(CartService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
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

  updateQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    if (!isNaN(quantity) && quantity > 0 && this.product) {
      if (quantity <= this.product.quantity) {
        this.orderQuantity = quantity;
      } else {
        this.orderQuantity = this.product.quantity;
        input.value = this.product.quantity.toString();
        alert(`Maximum available quantity is ${this.product.quantity}`);
      }
    }
  }

  addToCart(): void {
    if (!this.product) {
      alert('Product not loaded');
      return;
    }

    if (this.orderQuantity > this.product.quantity) {
      alert(`Cannot add ${this.orderQuantity} items. Only ${this.product.quantity} available.`);
      return;
    }

    this.addingToCart = true;
    this.cartService.addToCart(this.product, this.orderQuantity);
    
    // Show success message
    alert(`Added ${this.orderQuantity} ${this.product.name} to cart!`);
    this.addingToCart = false;
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

}
