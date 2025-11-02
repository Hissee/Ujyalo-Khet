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
  paymentMethod: 'cash_on_delivery' | 'khalti';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  khaltiPaymentId?: string;
}

export interface OrderResponse {
  message: string;
  orderId: string;
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

  verifyKhaltiPayment(paymentData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    return this.http.post(
      Endpoint.VERIFY_KHALTI_PAYMENT,
      paymentData,
      { headers }
    );
  }
}

