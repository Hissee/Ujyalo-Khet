import { Component } from '@angular/core';
import { ProductListComponent } from '../product-list/product-list.component';
import {CarouselComponent} from '../carousel/carousel.component';

@Component({
  selector: 'app-home',
  imports: [ProductListComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
