import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct} from '../Iproduct';
import {ProductService} from '../product.service';
import { CartService } from '../../cart/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit, OnDestroy{

  product: IProduct | null = null;
  loading: boolean = false;
  error: string | null = null;
  orderQuantity: number = 1;
  addingToCart: boolean = false;
  placingOrder: boolean = false;
  successMessage: string = '';
  
  // User info
  user: any = null;
  isFarmer: boolean = false;
  
  // Image carousel
  allImages: string[] = [];
  currentImageIndex: number = 0;
  private carouselInterval: any = null;
  readonly CAROUSEL_INTERVAL = 5000; // 5 seconds
  
  service = inject(ProductService);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  toastService = inject(ToastService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(){
    // Check if user is logged in and get user role
    this.checkUserRole();
    
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
          this.initializeImages();
          this.startCarousel();
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

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  initializeImages(): void {
    if (!this.product) {
      this.allImages = [];
      return;
    }

    // Get all images from the product
    const images: string[] = [];
    
    // Add images from images array
    if (this.product.images && Array.isArray(this.product.images) && this.product.images.length > 0) {
      const validImages = this.product.images.filter((img: string) => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      );
      images.push(...validImages);
    }
    
    // Fall back to image property if no images array
    if (images.length === 0 && this.product.image) {
      images.push(this.product.image);
    }
    
    // If still no images, add placeholder
    if (images.length === 0) {
      images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==');
    }
    
    this.allImages = images;
    this.currentImageIndex = 0;
  }

  startCarousel(): void {
    this.stopCarousel();
    
    // Only start carousel if there are multiple images
    if (this.allImages.length > 1) {
      this.carouselInterval = setInterval(() => {
        this.nextImage();
      }, this.CAROUSEL_INTERVAL);
    }
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  nextImage(): void {
    if (this.allImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
    }
  }

  previousImage(): void {
    if (this.allImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
    }
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.allImages.length) {
      this.currentImageIndex = index;
      // Restart carousel after manual selection
      this.startCarousel();
    }
  }

  getCurrentImage(): string {
    if (this.allImages.length === 0) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    return this.allImages[this.currentImageIndex];
  }

  checkUserRole(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        this.isFarmer = this.user?.role === 'farmer';
      } catch (e) {
        this.user = null;
        this.isFarmer = false;
      }
    }
  }

  getProductImage(): string {
    if (!this.product) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    
    // Prefer images array with URLs
    if (this.product.images && Array.isArray(this.product.images) && this.product.images.length > 0) {
      const urlImage = this.product.images.find((img: string) => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      );
      if (urlImage) return urlImage;
      // Fall back to first image if no URL found
      return this.product.images[0];
    }
    
    // Fall back to image property
    if (this.product.image) {
      return this.product.image;
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
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
        this.toastService.warning(`Maximum available quantity is ${this.product.quantity}`);
      }
    }
  }

  decreaseQuantity(): void {
    if (this.orderQuantity > 1 && this.product && this.product.quantity > 0) {
      this.orderQuantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.orderQuantity < this.product.quantity) {
      this.orderQuantity++;
    }
  }

  addToCart(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      this.toastService.warning('Please login to buy products');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    if (!this.product) {
      this.toastService.error('Product not loaded');
      return;
    }

    if (this.orderQuantity > this.product.quantity) {
      this.toastService.error(`Cannot add ${this.orderQuantity} items. Only ${this.product.quantity} available.`);
      return;
    }

    if (this.orderQuantity <= 0) {
      this.toastService.error('Quantity must be at least 1');
      return;
    }

    this.addingToCart = true;
    
    this.cartService.addToCart(this.product, this.orderQuantity);
    
    // Show success toast
    this.toastService.success(`Successfully added ${this.orderQuantity} ${this.product.name}(s) to cart!`);
    
    // Reset after showing feedback
    setTimeout(() => {
      this.addingToCart = false;
    }, 2000);
  }

  placeOrder(): void {
    if (!this.product) {
      this.toastService.error('Product not loaded');
      return;
    }

    if (this.orderQuantity > this.product.quantity) {
      this.toastService.error(`Cannot order ${this.orderQuantity} items. Only ${this.product.quantity} available.`);
      return;
    }

    if (this.orderQuantity <= 0) {
      this.toastService.error('Quantity must be at least 1');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.error('Please login to place an order');
      // Optionally redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Option 1: Add to cart and navigate to checkout (recommended)
    this.placingOrder = true;
    this.error = '';
    this.successMessage = '';
    
    // Add product to cart first
    this.cartService.addToCart(this.product, this.orderQuantity);
    
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }
}
