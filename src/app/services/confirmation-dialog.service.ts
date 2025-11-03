import { Injectable } from '@angular/core';
import { Subject, take } from 'rxjs';

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogSubject = new Subject<ConfirmationDialog | null>();
  public dialog$ = this.dialogSubject.asObservable();
  private responseSubject = new Subject<boolean>();

  show(title: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const dialog: ConfirmationDialog = {
        id: this.generateId(),
        title,
        message,
        confirmText,
        cancelText
      };

      this.dialogSubject.next(dialog);

      // Create a one-time subscription
      this.responseSubject.pipe(take(1)).subscribe((response) => {
        resolve(response);
      });
    });
  }

  confirm(response: boolean): void {
    this.dialogSubject.next(null);
    this.responseSubject.next(response);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}

