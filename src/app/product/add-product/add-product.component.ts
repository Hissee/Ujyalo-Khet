import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  productForm: FormGroup;
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
    private router: Router,
    private farmerService: FarmerService
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadingImages = true;
      
      Array.from(input.files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          this.convertFileToBase64(file, 
            () => {
              this.uploadingImages = false;
            },
            (error) => {
              console.error('Error reading file:', error);
              this.error = error;
              this.uploadingImages = false;
            }
          );
        } else {
          this.error = 'Please select only image files';
          this.uploadingImages = false;
        }
      });
      
      input.value = '';
    }
  }

  convertFileToBase64(file: File, onSuccess: () => void, onError: (error: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        this.imageUrls.push(reader.result);
        onSuccess();
      }
    };
    reader.onerror = () => onError('Failed to read file');
    reader.readAsDataURL(file);
  }

  addImageUrl(): void {
    if (this.newImageUrl.trim()) {
      this.imageUrls.push(this.newImageUrl.trim());
      this.newImageUrl = '';
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

    const productData = {
      ...this.productForm.value,
      images: this.imageUrls,
      price: parseFloat(this.productForm.value.price),
      quantity: parseFloat(this.productForm.value.quantity)
    };

    this.farmerService.addProduct(productData).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Product added successfully!';
        this.submitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/farmer-dashboard'], { queryParams: { tab: 'products' } });
        }, 1500);
      },
      error: (err) => {
        console.error('Error adding product:', err);
        this.error = err.error?.message || 'Failed to add product';
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
