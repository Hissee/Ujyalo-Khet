import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from '../const/end-point';

export interface OrderRequest {
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    province: string;
    city: string;
    street: string;
    phone?: string;
  };
  paymentMethod: 'cash_on_delivery' | 'esewa';
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface OrderResponse {
  message: string;
  orderId: string;
}

export interface Order {
  _id: string;
  customerId: string;
  products: Array<{
    productId: any;
    quantity: number;
    price: number;
    productName?: string;  // Product snapshot stored in order
    productImage?: string; // Product image snapshot stored in order
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: {
    province: string;
    city: string;
    street: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(orderData: OrderRequest): Observable<OrderResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    return this.http.post<OrderResponse>(
      Endpoint.PLACE_ORDER,
      orderData,
      { headers }
    );
  }

  getUserOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    return this.http.get<Order[]>(
      Endpoint.GET_USER_ORDERS,
      { headers }
    );
  }
}

