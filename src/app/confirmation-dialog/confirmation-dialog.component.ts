import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogService, ConfirmationDialog } from '../services/confirmation-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  dialog: ConfirmationDialog | null = null;
  private subscription?: Subscription;

  constructor(private confirmationService: ConfirmationDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmationService.dialog$.subscribe(dialog => {
      this.dialog = dialog;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    if (this.dialog) {
      this.confirmationService.confirm(true);
      this.dialog = null;
    }
  }

  cancel(): void {
    this.confirmationService.confirm(false);
    this.dialog = null;
  }
}

