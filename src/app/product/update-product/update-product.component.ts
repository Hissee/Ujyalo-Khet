import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { ProductService } from '../product.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-update-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {
  productForm: FormGroup;
  productId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string = '';
  
  categories: string[] = [
    'fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'spices', 'other'
  ];
  
  imageUrls: string[] = [];
  newImageUrl: string = '';
  uploadingImages = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private farmerService: FarmerService,
    private productService: ProductService,
    private imageUploadService: ImageUploadService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      harvestDate: [''],
      organic: [false]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.queryParamMap.get('id');
    if (this.productId) {
      this.loadProduct();
    } else {
      this.error = 'Product ID is missing';
    }
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.loading = true;
    this.error = null;
    
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          price: product.price,
          quantity: product.quantity,
          harvestDate: product.harvestDate || '',
          organic: product.organic || false
        });
        
        // Load existing images (filter to only URLs, not base64)
        const productImages = product.images || [];
        this.imageUrls = productImages.filter((img: string) => {
          return img && (img.startsWith('http://') || img.startsWith('https://'));
        });
        // If no images array but has image property, use that
        if (this.imageUrls.length === 0 && product.image && 
            (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
          this.imageUrls = [product.image];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = err.error?.message || 'Failed to load product';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files).filter(file => file.type.startsWith('image/'));
      
      if (files.length === 0) {
        this.error = 'Please select only image files';
        return;
      }

      this.uploadingImages = true;
      this.error = null;

      // Upload files to Imgur
      const uploadPromises = files.map((file, index) => {
        return this.imageUploadService.uploadToImgur(file).pipe(
          catchError(err => {
            console.error(`Error uploading ${file.name}:`, err);
            this.error = `Failed to upload ${file.name}. Please try a direct URL instead.`;
            return of(null);
          })
        );
      });

      forkJoin(uploadPromises).subscribe({
        next: (urls) => {
          const successfulUrls = urls.filter(url => url !== null) as string[];
          this.imageUrls.push(...successfulUrls);
          this.uploadingImages = false;
          if (successfulUrls.length < files.length) {
            this.error = `Successfully uploaded ${successfulUrls.length} of ${files.length} images. Some failed.`;
          }
        },
        error: (err) => {
          console.error('Error uploading images:', err);
          this.error = 'Failed to upload images. Please try using direct URLs instead.';
          this.uploadingImages = false;
        }
      });
      
      input.value = '';
    }
  }

  addImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (url) {
      if (this.imageUploadService.isValidImageUrl(url)) {
        // If it's a Google Photos or Google Drive link, convert it if needed
        if (this.imageUploadService.isGooglePhotosLink(url) || this.imageUploadService.isGoogleDriveLink(url)) {
          this.imageUploadService.getDirectImageUrl(url).subscribe({
            next: (convertedUrl) => {
              this.imageUrls.push(convertedUrl);
              this.newImageUrl = '';
              this.error = null;
            },
            error: () => {
              // Even if conversion fails, try adding the original URL
              this.imageUrls.push(url);
              this.newImageUrl = '';
              this.error = null;
            }
          });
        } else {
          this.imageUrls.push(url);
          this.newImageUrl = '';
          this.error = null;
        }
      } else {
        this.error = 'Please enter a valid image URL (http:// or https://). Supported: Google Photos, Imgur, Google Drive, Dropbox, etc.';
      }
    }
  }

  removeImageUrl(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.productId) {
      this.error = 'Product ID is missing';
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = '';

    // Filter out any base64 data URLs and only keep actual URLs
    const validImageUrls = this.imageUrls.filter(url => {
      return url.startsWith('http://') || url.startsWith('https://');
    });

    const productData = {
      ...this.productForm.value,
      images: validImageUrls, // Store only URLs, not base64
      price: parseFloat(this.productForm.value.price),
      quantity: parseFloat(this.productForm.value.quantity)
    };

    this.farmerService.updateProduct(this.productId, productData).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Product updated successfully!';
        this.submitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.error = err.error?.message || 'Failed to update product';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
    }
    return '';
  }
}
