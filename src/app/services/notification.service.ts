import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Endpoint } from '../const/end-point';

export interface Notification {
  _id: string;
  userId: string;
  type: 'order_placed' | 'order_confirmed' | 'order_processing' | 'order_loaded' | 'order_delivered' | 'order_payment_completed';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load initial unread count
    this.getUnreadCount().subscribe();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  // Get all notifications for current user
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(Endpoint.GET_NOTIFICATIONS, {
      headers: this.getHeaders()
    });
  }

  // Get unread notifications count
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(Endpoint.GET_UNREAD_COUNT, {
      headers: this.getHeaders()
    });
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(Endpoint.MARK_NOTIFICATION_READ(notificationId), {}, {
      headers: this.getHeaders()
    });
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http.put(Endpoint.MARK_ALL_NOTIFICATIONS_READ, {}, {
      headers: this.getHeaders()
    });
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(Endpoint.DELETE_NOTIFICATION(notificationId), {
      headers: this.getHeaders()
    });
  }

  // Update unread count (called after fetching notifications)
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}

