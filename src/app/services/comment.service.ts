import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from '../const/end-point';

export interface Comment {
  _id: string;
  productId: string;
  userId?: string; // User ID for ownership check
  userName: string;
  text: string;
  replyTo?: string | null; // ID of parent comment if this is a reply
  replies?: Comment[]; // Array of replies to this comment
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentResponse {
  success: boolean;
  data: Comment[];
  count: number;
}

export interface AddCommentRequest {
  productId: string;
  text: string;
  replyTo?: string | null; // Optional: ID of parent comment if this is a reply
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Get all comments for a product
  getCommentsByProduct(productId: string): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(
      Endpoint.GET_COMMENTS_BY_PRODUCT(productId)
    );
  }

  // Add a new comment (or reply)
  addComment(productId: string, text: string, replyTo?: string | null): Observable<any> {
    const body: AddCommentRequest = { productId, text, replyTo: replyTo || null };
    return this.http.post(
      Endpoint.ADD_COMMENT,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  // Update a comment
  updateComment(commentId: string, text: string): Observable<any> {
    return this.http.put(
      Endpoint.UPDATE_COMMENT(commentId),
      { text },
      { headers: this.getAuthHeaders() }
    );
  }

  // Delete a comment
  deleteComment(commentId: string): Observable<any> {
    return this.http.delete(
      Endpoint.DELETE_COMMENT(commentId),
      { headers: this.getAuthHeaders() }
    );
  }
}

