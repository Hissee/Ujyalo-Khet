import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from '../const/end-point';

export interface Rating {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RatingStatistics {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface RatingResponse {
  success: boolean;
  data: Rating[];
  statistics: RatingStatistics;
}

export interface AddRatingRequest {
  productId: string;
  rating: number; // 1-5
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Get all ratings for a product
  getRatingsByProduct(productId: string): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(
      Endpoint.GET_RATINGS_BY_PRODUCT(productId)
    );
  }

  // Get current user's rating for a product
  getUserRating(productId: string): Observable<{ success: boolean; data: Rating | null }> {
    return this.http.get<{ success: boolean; data: Rating | null }>(
      Endpoint.GET_USER_RATING(productId),
      { headers: this.getAuthHeaders() }
    );
  }

  // Add or update a rating
  addOrUpdateRating(productId: string, rating: number): Observable<any> {
    const body: AddRatingRequest = { productId, rating };
    return this.http.post(
      Endpoint.ADD_OR_UPDATE_RATING,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  // Delete a rating
  deleteRating(ratingId: string): Observable<any> {
    return this.http.delete(
      Endpoint.DELETE_RATING(ratingId),
      { headers: this.getAuthHeaders() }
    );
  }
}

