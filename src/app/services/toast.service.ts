import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new Subject<Toast[]>();
  public toast$ = this.toastSubject.asObservable();

  constructor() {}

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 1500): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration
    };

    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, duration: number = 1500): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 1500): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 1500): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 1500): void {
    this.show(message, 'info', duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastSubject.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toastSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}

