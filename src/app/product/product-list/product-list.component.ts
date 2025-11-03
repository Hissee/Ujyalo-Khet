import { Router } from '@angular/router';
import { IProduct,  } from '../Iproduct';
import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
// import {ProductListService} from './product-list.service';
import {ProductService} from '../product.service';
import { CartService } from '../../cart/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  allProducts: IProduct[] = [];
  service = inject(ProductService);
  router = inject(Router);
  cartService = inject(CartService);
  toastService = inject(ToastService);
  
  // User info
  user: any = null;
  isFarmer: boolean = false;
  
  // Category filter
  selectedCategory: string = 'all';
  categories: string[] = ['all', 'fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'spices'];
  
  // Carousel properties
  currentSlide = 0;
  productsPerSlide = 4; // Desktop: 4 products per slide
  productsPerSlideTablet = 3; // Tablet: 3 products per slide
  productsPerSlideMobile = 1; // Mobile: 1 product per slide

  ngOnInit(){
    // Check if user is logged in and get user role
    this.checkUserRole();
    
    this.service.listProducts()
      .subscribe({
        next: (data) => {
          this.allProducts = data;
          this.applyFilter();
          this.updateProductsPerSlide();
          // Extract unique categories from products
          this.extractCategories(data);
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('complete');
        }
      });
    
    // Update products per slide on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateProductsPerSlide());
    }
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

  extractCategories(products: IProduct[]): void {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category && product.category.trim()) {
        uniqueCategories.add(product.category.toLowerCase().trim());
      }
    });
    // Add common categories if not present, with 'all' first
    const commonCategories = ['fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'spices', 'other'];
    this.categories = ['all', ...Array.from(uniqueCategories).sort()];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentSlide = 0; // Reset to first slide when filtering
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedCategory === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => 
        product.category && product.category.toLowerCase().trim() === this.selectedCategory.toLowerCase().trim()
      );
    }
    this.products = this.filteredProducts;
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', () => this.updateProductsPerSlide());
    }
  }

  updateProductsPerSlide(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) {
        this.productsPerSlide = this.productsPerSlideMobile;
      } else if (width < 992) {
        this.productsPerSlide = this.productsPerSlideTablet;
      } else {
        this.productsPerSlide = 4;
      }
    }
  }

  get totalSlides(): number {
    if (this.products.length === 0) return 0;
    return Math.ceil(this.products.length / this.productsPerSlide);
  }

  getProductsForSlide(slideIndex: number): IProduct[] {
    const start = slideIndex * this.productsPerSlide;
    const end = start + this.productsPerSlide;
    return this.products.slice(start, end);
  }

  nextSlide(): void {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0; // Loop back to start
    }
  }

  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.totalSlides - 1; // Loop to end
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
    }
  }

  getSlideIndices(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  getProductImage(product: IProduct): string {
    // Prefer images array with URLs
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const urlImage = product.images.find((img: string) => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      );
      if (urlImage) return urlImage;
      // Fall back to first image if no URL found
      return product.images[0];
    }
    
    // Fall back to image property
    if (product.image) {
      return product.image;
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '0.00';
    return price.toFixed(2);
  }

  getCategoryBadgeClass(category: string): string {
    if (!category) return '';
    const cat = category.toLowerCase().trim();
    if (cat === 'fruits') return 'badge-category-fruits';
    if (cat === 'vegetables') return 'badge-category-vegetables';
    if (cat === 'grains') return 'badge-category-grains';
    if (cat === 'dairy') return 'badge-category-dairy';
    if (cat === 'herbs') return 'badge-category-herbs';
    if (cat === 'spices') return 'badge-category-spices';
    return '';
  }

  navigateToProduct(productId: string | number) {
    this.router.navigate(['/view-product', productId]);
  }

  addToCart(event: Event, product: IProduct) {
    event.stopPropagation(); // Prevent card click navigation
    
    if (!product || product.quantity <= 0) {
      this.toastService.warning('Product is out of stock!');
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
    
    // Show success toast
    this.toastService.success(`${product.name} successfully added to cart!`);
    
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

