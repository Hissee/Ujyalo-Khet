import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { ProductService } from '../../product/product.service';

interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
  productName?: string;
  productImage?: string;
}

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  orderProducts: OrderProduct[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    } else {
      this.error = 'Order ID not provided';
      this.loading = false;
    }
  }

  loadOrderDetail(orderId: string): void {
    this.loading = true;
    this.error = null;

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        const order = orders.find(o => o._id === orderId);
        if (order) {
          this.order = order;
          this.loadProductDetails(order.products);
        } else {
          this.error = 'Order not found';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = err.error?.message || 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  loadProductDetails(products: Order['products']): void {
    this.orderProducts = [];
    let loadedCount = 0;
    const totalProducts = products.length;

    if (totalProducts === 0) {
      this.loading = false;
      return;
    }

    products.forEach((item) => {
      const productId = typeof item.productId === 'object' && item.productId.toString
        ? item.productId.toString()
        : String(item.productId);
      
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.orderProducts.push({
            productId: productId,
            quantity: item.quantity,
            price: item.price,
            productName: product.name,
            productImage: product.image
          });
          loadedCount++;
          if (loadedCount === totalProducts) {
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading product:', err);
          // Add product without details if fetch fails
          this.orderProducts.push({
            productId: productId,
            quantity: item.quantity,
            price: item.price,
            productName: 'Product not available',
            productImage: ''
          });
          loadedCount++;
          if (loadedCount === totalProducts) {
            this.loading = false;
          }
        }
      });
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning';
      case 'confirmed':
      case 'processing':
        return 'badge bg-info';
      case 'shipped':
        return 'badge bg-primary';
      case 'delivered':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
