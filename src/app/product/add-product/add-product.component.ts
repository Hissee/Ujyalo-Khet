import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { ProductService } from '../product.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  submitting = false;
  error: string | null = null;
  successMessage: string = '';
  
  categories: string[] = [
    'fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'spices', 'other'
  ];
  
  imageUrls: string[] = []; // Store image URLs (from Imgur or direct URLs)
  newImageUrl: string = '';
  uploadingImages = false;
  uploadProgress: { [key: number]: number } = {};
  filesToUpload: File[] = [];

  // Price suggestion
  priceSuggestion: any = null;
  loadingSuggestion = false;
  showSuggestion = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private farmerService: FarmerService,
    private productService: ProductService,
    private imageUploadService: ImageUploadService,
    private toastService: ToastService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      harvestDate: [''],
      organic: [false],
      location: ['']
    });
  }

  ngOnInit() {
    // Watch for changes in category, quantity, or organic status to get price suggestions
    this.productForm.get('category')?.valueChanges.subscribe(() => {
      this.getPriceSuggestion();
    });

    this.productForm.get('quantity')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.getPriceSuggestion();
    });

    this.productForm.get('organic')?.valueChanges.subscribe(() => {
      this.getPriceSuggestion();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files).filter(file => file.type.startsWith('image/'));
      
      if (files.length === 0) {
        this.toastService.error('Please select only image files');
        return;
      }

      this.uploadingImages = true;
      this.error = null;

      // Upload files to Cloudinary
      this.imageUploadService.uploadMultipleToCloudinary(files).subscribe({
        next: (urls) => {
          if (urls && urls.length > 0) {
            this.imageUrls.push(...urls);
            this.uploadingImages = false;
            this.toastService.success(`Successfully uploaded ${urls.length} image(s) to Cloudinary.`);
          } else {
            this.uploadingImages = false;
            this.toastService.warning('No images were uploaded successfully.');
          }
        },
        error: (err) => {
          console.error('Error uploading images to Cloudinary:', err);
          // Fallback: try uploading individually with fallback to Imgur
          const uploadPromises = files.map((file) => {
            return this.imageUploadService.uploadImage(file).pipe(
              catchError(err => {
                console.error(`Error uploading ${file.name}:`, err);
                this.toastService.error(`Failed to upload ${file.name}. Please try a direct URL instead.`);
                return of(null);
              })
            );
          });

          forkJoin(uploadPromises).subscribe({
            next: (urls) => {
              const successfulUrls = urls.filter(url => url !== null) as string[];
              if (successfulUrls.length > 0) {
                this.imageUrls.push(...successfulUrls);
                this.toastService.warning(`Successfully uploaded ${successfulUrls.length} of ${files.length} images. Some failed.`);
              } else {
                this.toastService.error('Failed to upload images. Please try using direct URLs instead.');
              }
              this.uploadingImages = false;
            },
            error: (fallbackErr) => {
              console.error('Error uploading images (fallback):', fallbackErr);
              this.toastService.error('Failed to upload images. Please try using direct URLs instead.');
              this.uploadingImages = false;
            }
          });
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
        this.toastService.error('Please enter a valid image URL (http:// or https://). Supported: Google Photos, Imgur, Google Drive, Dropbox, etc.');
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

    this.submitting = true;
    this.error = null;
    this.successMessage = '';

    // Filter out any base64 data URLs and only keep actual URLs
    const validImageUrls = this.imageUrls.filter(url => {
      // Remove base64 data URLs (if any) and keep only http/https URLs
      return url.startsWith('http://') || url.startsWith('https://');
    });

    const productData = {
      ...this.productForm.value,
      images: validImageUrls, // Store only URLs, not base64
      price: parseFloat(this.productForm.value.price),
      quantity: parseFloat(this.productForm.value.quantity)
    };

    this.farmerService.addProduct(productData).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Product added successfully!');
        this.submitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 1500);
      },
      error: (err) => {
        console.error('Error adding product:', err);
        this.toastService.error(err.error?.message || 'Failed to add product');
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

  getPriceSuggestion() {
    const category = this.productForm.get('category')?.value;
    const quantity = this.productForm.get('quantity')?.value;
    const organic = this.productForm.get('organic')?.value || false;
    const location = this.productForm.get('location')?.value;

    if (!category || !quantity || quantity <= 0) {
      this.priceSuggestion = null;
      this.showSuggestion = false;
      return;
    }

    this.loadingSuggestion = true;
    this.showSuggestion = true;

    this.productService.getPriceSuggestion(category, quantity, organic, location).subscribe({
      next: (suggestion) => {
        this.priceSuggestion = suggestion;
        this.loadingSuggestion = false;
      },
      error: (err) => {
        console.error('Error getting price suggestion:', err);
        this.loadingSuggestion = false;
        // Don't show error, just hide suggestion
        this.priceSuggestion = null;
      }
    });
  }

  useSuggestedPrice() {
    if (this.priceSuggestion?.suggestedPrice) {
      this.productForm.patchValue({
        price: this.priceSuggestion.suggestedPrice
      });
      this.toastService.success('Price updated to suggested value');
    }
  }

  useMinPrice() {
    if (this.priceSuggestion?.minPrice) {
      this.productForm.patchValue({
        price: this.priceSuggestion.minPrice
      });
      this.toastService.success('Price updated to minimum suggested value');
    }
  }

  useMaxPrice() {
    if (this.priceSuggestion?.maxPrice) {
      this.productForm.patchValue({
        price: this.priceSuggestion.maxPrice
      });
      this.toastService.success('Price updated to maximum suggested value');
    }
  }
}
