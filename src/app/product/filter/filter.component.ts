import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { IProduct } from '../Iproduct';
import { CartService } from '../../cart/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  loading = false;

  // Filter values
  selectedCategory: string = 'all';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  startDate: string = '';
  endDate: string = '';
  location: string = '';

  categories: string[] = ['all', 'fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'spices', 'other'];
  locations: string[] = [];

  // User info
  user: any = null;
  isFarmer: boolean = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    
    // Get initial category from query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadProducts();
    });
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

  loadProducts(): void {
    this.loading = true;
    this.productService.listProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.extractLocations(data);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  extractLocations(products: IProduct[]): void {
    const locationSet = new Set<string>();
    products.forEach(product => {
      if (product.location && product.location.trim()) {
        locationSet.add(product.location.trim());
      }
    });
    this.locations = Array.from(locationSet).sort();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filter by category
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Filter by price
    if (this.minPrice !== null && this.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= this.minPrice!);
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= this.maxPrice!);
    }

    // Filter by harvest date
    if (this.startDate) {
      filtered = filtered.filter(p => {
        if (!p.harvestDate) return false;
        const harvestDate = new Date(p.harvestDate);
        const startDate = new Date(this.startDate);
        return harvestDate >= startDate;
      });
    }
    if (this.endDate) {
      filtered = filtered.filter(p => {
        if (!p.harvestDate) return false;
        const harvestDate = new Date(p.harvestDate);
        const endDate = new Date(this.endDate);
        return harvestDate <= endDate;
      });
    }

    // Filter by location
    if (this.location && this.location.trim()) {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase().includes(this.location.toLowerCase())
      );
    }

    this.filteredProducts = filtered;
  }

  resetFilters(): void {
    this.selectedCategory = 'all';
    this.minPrice = null;
    this.maxPrice = null;
    this.startDate = '';
    this.endDate = '';
    this.location = '';
    this.applyFilters();
  }

  viewProduct(product: IProduct): void {
    const productId = product._id || product.id;
    this.router.navigate(['/view-product', productId]);
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

  getProductImage(product: IProduct): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const urlImage = product.images.find((img: string) => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      );
      if (urlImage) return urlImage;
      return product.images[0];
    }
    
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

