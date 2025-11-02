import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  categories: string[] = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Spices',
    'Herbs',
    'Dairy',
    'Meat',
    'Other'
  ];

  imageUrls: string[] = [];
  newImageUrl = '';
  uploadingImages = false;

  constructor(
    private fb: FormBuilder,
    private farmerService: FarmerService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      harvestDate: [''],
      organic: [false]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      
      if (invalidFiles.length > 0) {
        this.errorMessage = `${invalidFiles.length} file(s) are not valid image files and were skipped.`;
      }

      if (imageFiles.length > 0) {
        this.uploadingImages = true;
        let processedCount = 0;
        const totalFiles = imageFiles.length;

        // Process each file
        imageFiles.forEach((file) => {
          this.convertFileToBase64(file, () => {
            processedCount++;
            if (processedCount === totalFiles) {
              this.uploadingImages = false;
            }
          }, (errorMsg) => {
            processedCount++;
            this.errorMessage = errorMsg;
            if (processedCount === totalFiles) {
              this.uploadingImages = false;
            }
          });
        });
      }

      // Reset the input
      input.value = '';
    }
  }

  convertFileToBase64(file: File, onSuccess: () => void, onError: (error: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.imageUrls.push(base64String);
      onSuccess();
    };
    reader.onerror = () => {
      onError(`Failed to read file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  addImageUrl(): void {
    if (this.newImageUrl.trim()) {
      // Validate URL format
      try {
        new URL(this.newImageUrl.trim());
        this.imageUrls.push(this.newImageUrl.trim());
        this.newImageUrl = '';
      } catch {
        this.errorMessage = 'Please enter a valid image URL.';
      }
    }
  }

  removeImageUrl(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData = {
      name: this.productForm.get('name')?.value,
      description: this.productForm.get('description')?.value || '',
      category: this.productForm.get('category')?.value,
      price: parseFloat(this.productForm.get('price')?.value),
      quantity: parseInt(this.productForm.get('quantity')?.value, 10),
      images: this.imageUrls.length > 0 ? this.imageUrls : [],
      harvestDate: this.productForm.get('harvestDate')?.value || null,
      organic: this.productForm.get('organic')?.value || false
    };

    this.farmerService.addProduct(productData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Product added successfully!';
        this.productForm.reset();
        this.imageUrls = [];
        
        // Redirect to farmer dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error?.errors?.join(', ') || 'Failed to add product. Please try again.';
        console.error('Add product error:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be greater than ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}