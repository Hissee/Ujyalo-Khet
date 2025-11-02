import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product/product.service';
import { IProduct } from '../product/Iproduct';
import { CarouselComponent } from '../carousel/carousel.component';
import { CartService } from '../cart/cart.service';

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
    private cartService: CartService
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
    
    if (this.isFarmer) {
      return;
    }

    if (product.quantity <= 0) {
      alert('Product is out of stock');
      return;
    }

    this.cartService.addToCart(product, 1);
  }

  viewProduct(product: IProduct): void {
    const productId = product._id || product.id;
    this.router.navigate(['/view-product', productId]);
  }

  getCategoryIcon(category: string): string {
    const cat = category.toLowerCase();
    if (cat === 'fruits') return 'bi-apple';
    if (cat === 'vegetables') return 'bi-flower1';
    if (cat === 'grains') return 'bi-basket';
    if (cat === 'dairy') return 'bi-cup-straw';
    if (cat === 'herbs') return 'bi-flower2';
    if (cat === 'spices') return 'bi-star';
    return 'bi-box';
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
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/300x200?text=No+Image';
    }
  }
}
