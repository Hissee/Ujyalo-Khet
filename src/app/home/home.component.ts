import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductListComponent } from '../product/product-list/product-list.component';
import {CarouselComponent} from '../carousel/carousel.component';

@Component({
  selector: 'app-home',
  imports: [ProductListComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user is logged in as farmer
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role === 'farmer') {
          // Redirect farmers to dashboard instead of showing home page
          this.router.navigate(['/farmer-dashboard']);
        }
      } catch (e) {
        // Invalid user data, continue to show home page
        console.error('Error parsing user data:', e);
      }
    }
  }
}
