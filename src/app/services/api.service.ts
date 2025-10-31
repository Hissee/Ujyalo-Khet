import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signup(userData: any) {
    return this.http.post(`${this.baseUrl}/signup`, userData);
  }

  addProduct(productData: any) {
    return this.http.post(`${this.baseUrl}/products`, productData);
  }

  placeOrder(orderData: any) {
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  getProducts() {
    return this.http.get(`${this.baseUrl}/products`);
  }
}
