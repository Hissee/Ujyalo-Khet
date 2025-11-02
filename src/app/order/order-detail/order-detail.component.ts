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

  refreshOrder(): void {
    if (this.order) {
      this.loadOrderDetail(this.order._id);
    }
  }

  loadProductDetails(products: Order['products']): void {
    this.orderProducts = [];
    let loadedCount = 0;
    const totalProducts = products.length;

    if (totalProducts === 0) {
      this.loading = false;
      return;
    }

    products.forEach((item: any) => {
      const productId = typeof item.productId === 'object' && item.productId.toString
        ? item.productId.toString()
        : String(item.productId);
      
      // PRIORITY 1: Use stored product snapshot from order (new orders have this)
      // This ensures product names show even if product is deleted or sold out
      if (item.productName && item.productName.trim()) {
        this.orderProducts.push({
          productId: productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName.trim(),
          productImage: (item.productImage || item.image || '').trim()
        });
        loadedCount++;
        if (loadedCount === totalProducts) {
          this.loading = false;
        }
      } 
      // PRIORITY 2: Try to fetch product details (for older orders without snapshot)
      // This will work even if product quantity is 0 or product is sold out
      else {
        this.productService.getProductById(productId).subscribe({
          next: (product) => {
            // Successfully fetched product - use its name regardless of quantity
            this.orderProducts.push({
              productId: productId,
              quantity: item.quantity,
              price: item.price,
              productName: product.name || `Product (ID: ${productId.slice(-8)})`,
              productImage: (product.images && product.images.length > 0) 
                ? product.images[0] 
                : (product.image || '')
            });
            loadedCount++;
            if (loadedCount === totalProducts) {
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('Error loading product:', productId, err);
            // PRIORITY 3: If fetch fails, still show something useful with product ID
            // This handles cases where product was deleted
            this.orderProducts.push({
              productId: productId,
              quantity: item.quantity,
              price: item.price,
              productName: `Product (ID: ${productId.slice(-8)})`,
              productImage: ''
            });
            loadedCount++;
            if (loadedCount === totalProducts) {
              this.loading = false;
            }
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'confirmed':
        return 'bg-info';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bi-hourglass-split';
      case 'confirmed':
        return 'bi-check-circle';
      case 'processing':
        return 'bi-gear';
      case 'shipped':
        return 'bi-truck';
      case 'delivered':
        return 'bi-check-circle-fill';
      case 'cancelled':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  getPaymentStatusBadgeClass(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getPaymentStatusIcon(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'bi-check-circle-fill';
      case 'pending':
        return 'bi-clock';
      case 'failed':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
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
