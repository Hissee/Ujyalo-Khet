import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  private cartSubscription: any;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to cart changes to update item count
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItemCount = this.cartService.getTotalItems();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
