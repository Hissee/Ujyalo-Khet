import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IProduct} from './Iproduct';
import {Endpoint} from '../const/end-point';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  // Get all products from backend API
  getProducts(): Observable<IProduct[]> {
    return this.http.get<any[]>(Endpoint.GET_ALL_PRODUCTS).pipe(
      map(products => products.map(product => this.mapProduct(product)))
    );
  }

  // Alias for backward compatibility
  listProducts(): Observable<IProduct[]> {
    return this.getProducts();
  }

  // Get product by ID from backend API
  getProductById(id: string): Observable<IProduct> {
    return this.http.get<any>(Endpoint.GET_PRODUCT_BY_ID(id)).pipe(
      map(product => this.mapProduct(product))
    );
  }

  // Legacy method for backward compatibility - converts string ID to number for old interface
  getDetail(id: number | string): Observable<IProduct> {
    const productId = typeof id === 'string' ? id : String(id);
    return this.getProductById(productId);
  }

  // Map backend product structure to IProduct interface
  private mapProduct(product: any): IProduct {
    // Convert MongoDB _id to string if it's an object
    const mongoId = product._id ? (typeof product._id === 'object' ? product._id.toString() : String(product._id)) : '';
    
    return {
      id: mongoId, // Use MongoDB _id string for routing
      _id: mongoId, // Preserve original MongoDB _id
      name: product.name || '',
      category: product.category || 'general',
      price: product.price || 0,
      quantity: product.quantity || 0,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      location: '', // Not in backend, default empty
      farmerId: product.farmerId ? (typeof product.farmerId === 'object' ? product.farmerId.toString() : String(product.farmerId)) : '',
      farmerName: '', // Not in backend, would need to join with users collection
      description: product.description || '',
      harvestDate: '', // Not in backend, default empty
      organic: false // Not in backend, default false
    };
  }
}
