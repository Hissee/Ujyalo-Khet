import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { ProductService } from '../product.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
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
  productName: string = '';
  loading = false;
  submitting = false;
  deleting = false;
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
    private imageUploadService: ImageUploadService,
    private toastService: ToastService,
    private confirmationDialog: ConfirmationDialogService
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
        this.productName = product.name;
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          price: product.price,
          quantity: product.quantity,
          harvestDate: product.harvestDate || '',
          organic: product.organic || false,
          location: product.location || ''
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
        this.toastService.error(err.error?.message || 'Failed to load product');
        this.loading = false;
      }
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

    if (!this.productId) {
      this.error = 'Product ID is missing';
      return;
    }

    this.submitting = true;
    this.error = null;

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
        this.toastService.success(response.message || 'Product updated successfully!');
        this.submitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.toastService.error(err.error?.message || 'Failed to update product');
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

  async deleteProduct(): Promise<void> {
    if (!this.productId || !this.productName) {
      this.toastService.error('Product information is missing');
      return;
    }

    const confirmed = await this.confirmationDialog.show(
      'Delete Product',
      `Are you sure you want to delete "${this.productName}"? This action cannot be undone.`,
      'Delete',
      'Cancel'
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.error = null;

    this.farmerService.deleteProduct(this.productId).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Product deleted successfully!');
        this.deleting = false;
        
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 1500);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.toastService.error(err.error?.message || 'Failed to delete product. Make sure there are no active orders for this product.');
        this.deleting = false;
      }
    });
  }
}
