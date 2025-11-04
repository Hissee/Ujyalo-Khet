import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product/product.service';
import { IProduct } from '../product/Iproduct';
import { CarouselComponent } from '../carousel/carousel.component';
import { CartService } from '../cart/cart.service';
import { ToastService } from '../services/toast.service';

interface CategoryGroup {
  category: string;
  products: IProduct[];
  currentSlide: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  categories: CategoryGroup[] = [];
  loading = false;
  productsPerSlide = 4;
  user: any = null;
  isFarmer: boolean = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in as farmer
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role === 'farmer') {
          // Redirect farmers to dashboard instead of showing home page
          this.router.navigate(['/farmer-dashboard']);
          return;
        }
        this.user = user;
        this.isFarmer = user?.role === 'farmer';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    this.loadProducts();
    this.updateProductsPerSlide();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateProductsPerSlide());
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.listProducts().subscribe({
      next: (data: IProduct[]) => {
        // Group products by category
        const grouped = this.groupProductsByCategory(data);
        this.categories = grouped.map(group => ({
          ...group,
          currentSlide: 0
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  groupProductsByCategory(products: IProduct[]): Omit<CategoryGroup, 'currentSlide'>[] {
    const categoryMap = new Map<string, IProduct[]>();
    
    products.forEach(product => {
      const category = product.category?.toLowerCase() || 'other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(product);
    });

    // Convert to array and sort by category name
    return Array.from(categoryMap.entries())
      .map(([category, products]) => ({
        category: this.capitalizeFirst(category),
        products: products
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getTotalSlides(category: CategoryGroup): number {
    return Math.ceil(category.products.length / this.productsPerSlide);
  }

  getProductsForSlide(category: CategoryGroup, slideIndex: number): IProduct[] {
    const start = slideIndex * this.productsPerSlide;
    const end = start + this.productsPerSlide;
    return category.products.slice(start, end);
  }

  getSlideIndices(category: CategoryGroup): number[] {
    const totalSlides = this.getTotalSlides(category);
    return Array.from({ length: totalSlides }, (_, i) => i);
  }

  nextSlide(category: CategoryGroup): void {
    const totalSlides = this.getTotalSlides(category);
    category.currentSlide = (category.currentSlide + 1) % totalSlides;
  }

  prevSlide(category: CategoryGroup): void {
    const totalSlides = this.getTotalSlides(category);
    category.currentSlide = (category.currentSlide - 1 + totalSlides) % totalSlides;
  }

  scrollCarousel(categoryName: string, direction: 'left' | 'right'): void {
    // Find the container (parent of the track)
    const trackElement = document.querySelector(`[data-category="${categoryName}"]`) as HTMLElement;
    if (!trackElement) return;
    
    const containerElement = trackElement.parentElement as HTMLElement;
    if (!containerElement || !containerElement.classList.contains('product-carousel-container')) return;
    
    const scrollAmount = containerElement.clientWidth * 0.8; // Scroll 80% of container width
    const scrollPosition = direction === 'right' 
      ? containerElement.scrollLeft + scrollAmount 
      : containerElement.scrollLeft - scrollAmount;
    
    containerElement.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }

  updateProductsPerSlide(): void {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        this.productsPerSlide = 1;
      } else if (window.innerWidth < 1024) {
        this.productsPerSlide = 2;
      } else if (window.innerWidth < 1440) {
        this.productsPerSlide = 3;
      } else {
        this.productsPerSlide = 4;
      }
    }
  }

  addToCart(event: Event, product: IProduct): void {
    event.stopPropagation();
    
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

    if (this.isFarmer) {
      return;
    }

    if (product.quantity <= 0) {
      this.toastService.warning('Product is out of stock');
      return;
    }

    // Find the button element
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
    this.toastService.success(`${product.name} successfully added to cart!`);

    // Show success feedback if button found
    if (buttonElement) {
      const originalContent = buttonElement.innerHTML;
      const originalDisabled = buttonElement.disabled;
      
      // Update button appearance
      buttonElement.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
      buttonElement.disabled = true;
      
      // Reset button after 2 seconds
      setTimeout(() => {
        if (buttonElement) {
          buttonElement.innerHTML = originalContent;
          buttonElement.disabled = originalDisabled;
        }
      }, 2000);
    }
  }

  viewProduct(product: IProduct): void {
    const productId = product._id || product.id;
    this.router.navigate(['/view-product', productId]);
  }

  navigateToFilter(category?: string): void {
    const queryParams: any = {};
    if (category && category.toLowerCase() !== 'all') {
      queryParams.category = category.toLowerCase();
    }
    this.router.navigate(['/filter'], { queryParams });
  }

  getCategoryIcon(category: string): string {
    const cat = category.toLowerCase();
    if (cat === 'fruits') return 'fa-apple-alt';
    if (cat === 'vegetables') return 'fa-carrot';
    if (cat === 'grains') return 'fa-bread-slice';
    if (cat === 'dairy') return 'fa-cheese';
    if (cat === 'herbs') return 'fa-leaf';
    if (cat === 'spices') return 'fa-pepper-hot';
    return 'fa-box';
  }

  getProductImage(product: any): string {
    // Check if product has images array (from backend) - prefer URLs over base64
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Prefer HTTP/HTTPS URLs over base64
      const urlImage = product.images.find((img: string) => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      );
      if (urlImage) return urlImage;
      // Fall back to first image if no URL found
      return product.images[0];
    }
    // Fall back to mapped image property
    if (product.image) {
      return product.image;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }
}
