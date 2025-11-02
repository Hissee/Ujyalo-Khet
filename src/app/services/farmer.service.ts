import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from '../const/end-point';

export interface FarmerProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmerOrder {
  _id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  orderTotalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalProductsSold: number;
  };
  orders: {
    pending: number;
    confirmed: number;
    delivered: number;
    total: number;
  };
  products: {
    total: number;
    available: number;
    soldOut: number;
    totalStock: number;
  };
  recentOrders: Array<{
    orderId: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: Date;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  getFarmerProducts(): Observable<FarmerProduct[]> {
    return this.http.get<FarmerProduct[]>(Endpoint.FARMER_PRODUCTS, {
      headers: this.getHeaders()
    });
  }

  getFarmerOrders(): Observable<FarmerOrder[]> {
    return this.http.get<FarmerOrder[]>(Endpoint.FARMER_ORDERS, {
      headers: this.getHeaders()
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(Endpoint.FARMER_DASHBOARD_STATS, {
      headers: this.getHeaders()
    });
  }

  getRevenue(days: number = 30): Observable<any> {
    return this.http.get(Endpoint.FARMER_REVENUE + `?days=${days}`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(
      Endpoint.FARMER_UPDATE_ORDER_STATUS(orderId),
      { status },
      { headers: this.getHeaders() }
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(Endpoint.GET_CURRENT_USER, {
      headers: this.getHeaders()
    });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(Endpoint.UPDATE_PROFILE, profileData, {
      headers: this.getHeaders()
    });
  }

  addProduct(productData: any): Observable<any> {
    return this.http.post(Endpoint.ADD_PRODUCT, productData, {
      headers: this.getHeaders()
    });
  }
}

