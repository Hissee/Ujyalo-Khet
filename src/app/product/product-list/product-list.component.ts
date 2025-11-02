import { Router } from '@angular/router';
import { IProduct,  } from '../Iproduct';
import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
// import {ProductListService} from './product-list.service';
import {ProductService} from '../product.service';
import { CartService } from '../../cart/cart.service';

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
  cartService = inject(CartService);

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
    
    if (!product || product.quantity <= 0) {
      alert('Product is out of stock!');
      return;
    }

    // Find the button element (handle clicks on icon/span inside button)
    let buttonElement: HTMLButtonElement | null = null;
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    // Check if currentTarget is the button
    if (currentTarget && currentTarget.tagName === 'BUTTON') {
      buttonElement = currentTarget as HTMLButtonElement;
    } else if (target) {
      // If clicked on icon/span, traverse up to find button
      let element: HTMLElement | null = target;
      while (element && element.tagName !== 'BUTTON') {
        element = element.parentElement;
      }
      buttonElement = element as HTMLButtonElement;
    }

    // Add product to cart
    this.cartService.addToCart(product, 1);
    
    // Show success feedback if button found
    if (buttonElement) {
      const originalContent = buttonElement.innerHTML;
      
      // Update button appearance
      buttonElement.innerHTML = '<i class="fas fa-check"></i> <span>Added!</span>';
      buttonElement.classList.add('btn-success');
      buttonElement.disabled = true;
      
      // Reset button after 1.5 seconds
      setTimeout(() => {
        buttonElement!.innerHTML = originalContent;
        buttonElement!.classList.remove('btn-success');
        buttonElement!.disabled = false;
      }, 1500);
    }
  }
}

