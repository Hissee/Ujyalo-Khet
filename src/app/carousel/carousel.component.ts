import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Cimages, ICarousel } from './Icarousel';

@Component({
  selector: 'app-carousel',
  imports: [NgFor],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent {
  images: ICarousel[] = Cimages;

  currentIndex = 0;

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }
}
