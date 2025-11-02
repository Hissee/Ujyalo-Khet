import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  // Imgur API endpoint - Free tier allows anonymous uploads
  private readonly IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image';
  // You can get a client ID from https://api.imgur.com/oauth2/addclient (optional but recommended for higher rate limits)
  private readonly IMGUR_CLIENT_ID = 'Client-ID 546c25a59c58ad7'; // Public anonymous client ID

  constructor(private http: HttpClient) {}

  /**
   * Upload image to Imgur and return the URL
   * Note: Imgur allows anonymous uploads without API key, but rate limits are lower
   */
  uploadToImgur(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
          const headers = new HttpHeaders({
            'Authorization': this.IMGUR_CLIENT_ID,
            'Content-Type': 'application/json'
          });

          this.http.post<any>(
            this.IMGUR_UPLOAD_URL,
            { image: base64, type: 'base64' },
            { headers }
          ).subscribe({
            next: (response) => {
              if (response.success && response.data && response.data.link) {
                observer.next(response.data.link);
                observer.complete();
              } else {
                observer.error(new Error('Failed to upload to Imgur'));
              }
            },
            error: (err) => {
              console.error('Imgur upload error:', err);
              observer.error(err);
            }
          });
        }
      };
      reader.onerror = () => observer.error(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert Google Photos shareable link to direct image URL
   * Google Photos shareable links need to be converted to direct image URLs
   */
  convertGooglePhotosLink(shareableLink: string): string {
    try {
      const url = new URL(shareableLink);
      
      // Google Photos shareable link format: https://photos.app.goo.gl/xxxxx
      // or https://photos.google.com/share/xxxxx
      if (url.hostname.includes('photos.app.goo.gl') || url.hostname.includes('photos.google.com')) {
        // For shareable links, we need to extract the image ID and construct direct URL
        // Note: Google Photos direct URLs require authentication, so shareable links work better
        // We'll keep the shareable link as-is and let the browser handle it
        return shareableLink;
      }
      
      // If it's already a direct Google Photos image URL (lh3.googleusercontent.com)
      if (url.hostname.includes('googleusercontent.com') || url.hostname.includes('ggpht.com')) {
        return shareableLink;
      }
      
      return shareableLink;
    } catch {
      return shareableLink;
    }
  }

  /**
   * Validate if a string is a valid image URL (including Google Photos)
   */
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      // Check if URL ends with common image extensions or is from known image hosting services
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
      const imageHosts = [
        'imgur.com', 
        'imgbb.com', 
        'cloudinary.com', 
        'imageshack.com', 
        'photobucket.com',
        'googleusercontent.com',  // Google Photos direct URLs
        'ggpht.com',              // Google Photos
        'photos.google.com',       // Google Photos
        'photos.app.goo.gl',       // Google Photos shareable links
        'drive.google.com',        // Google Drive
        'dropbox.com',
        'i.imgur.com'
      ];
      
      const hasImageExtension = imageExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext));
      const isImageHost = imageHosts.some(host => urlObj.hostname.includes(host));
      
      // Also accept URLs with image query parameters (common in Google services)
      const hasImageQuery = urlObj.searchParams.has('img') || 
                           urlObj.searchParams.has('photo') || 
                           urlObj.pathname.includes('/photo/');
      
      return hasImageExtension || isImageHost || hasImageQuery;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is a Google Photos link
   */
  isGooglePhotosLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('photos.google.com') || 
             urlObj.hostname.includes('photos.app.goo.gl') ||
             urlObj.hostname.includes('googleusercontent.com') ||
             urlObj.hostname.includes('ggpht.com');
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is a Google Drive link
   */
  isGoogleDriveLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('drive.google.com');
    } catch {
      return false;
    }
  }

  /**
   * Convert Google Drive shareable link to direct image URL
   * Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   * Converts to: https://drive.google.com/uc?export=view&id=FILE_ID
   */
  convertGoogleDriveLink(shareableLink: string): string {
    try {
      const url = new URL(shareableLink);
      
      if (url.hostname.includes('drive.google.com')) {
        // Extract FILE_ID from various Google Drive URL formats
        // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        // Format 2: https://drive.google.com/open?id=FILE_ID
        // Format 3: https://drive.google.com/uc?id=FILE_ID (already direct)
        
        let fileId = '';
        
        // Check if it's already a direct image URL
        if (url.pathname === '/uc' && url.searchParams.has('id')) {
          // Already in direct format, just ensure export=view
          const id = url.searchParams.get('id');
          if (!url.searchParams.has('export')) {
            return `https://drive.google.com/uc?export=view&id=${id}`;
          }
          return shareableLink;
        }
        
        // Extract from /file/d/FILE_ID/ format
        const fileMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) {
          fileId = fileMatch[1];
        }
        
        // Extract from ?id= format
        if (!fileId && url.searchParams.has('id')) {
          fileId = url.searchParams.get('id') || '';
        }
        
        if (fileId) {
          // Convert to direct image URL
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }
      
      return shareableLink;
    } catch {
      return shareableLink;
    }
  }

  /**
   * Get direct image URL from Google Photos or Google Drive shareable link
   * For Google Photos, users need to:
   * 1. Upload to Google Photos
   * 2. Right-click image → "Get link" or "Copy link"
   * 3. Ensure "Anyone with the link can view"
   * 4. Use the direct image URL (usually from lh3.googleusercontent.com or ggpht.com)
   * 
   * For Google Drive:
   * 1. Upload image to Google Drive
   * 2. Right-click → "Share" → Set to "Anyone with the link"
   * 3. Copy the shareable link
   * 4. This service will automatically convert it to a direct image URL
   */
  getDirectImageUrl(shareableLink: string): Observable<string> {
    // Handle Google Drive links
    if (this.isGoogleDriveLink(shareableLink)) {
      const convertedUrl = this.convertGoogleDriveLink(shareableLink);
      return of(convertedUrl);
    }
    
    // Handle Google Photos links
    if (this.isGooglePhotosLink(shareableLink)) {
      const url = new URL(shareableLink);
      
      // If it's already a direct image URL (lh3.googleusercontent.com or ggpht.com), return it
      if (url.hostname.includes('googleusercontent.com') || url.hostname.includes('ggpht.com')) {
        return of(shareableLink);
      }
      
      // For shareable links, we'll try to extract or provide instructions
      // Note: Shareable links need to be opened to get the direct URL
      // For now, we'll accept them but they may not render properly
      // Users should use the direct image URL instead
      return of(shareableLink);
    }
    
    return of(shareableLink);
  }

  /**
   * Validate and provide instructions for Google Photos URLs
   */
  validateGooglePhotosUrl(url: string): { isValid: boolean; message?: string } {
    if (!this.isGooglePhotosLink(url)) {
      return { isValid: true }; // Not a Google Photos URL, validate normally
    }

    const urlObj = new URL(url);
    
    // Direct image URLs work best
    if (urlObj.hostname.includes('googleusercontent.com') || urlObj.hostname.includes('ggpht.com')) {
      return { isValid: true };
    }
    
    // Shareable links might not work in img tags
    if (urlObj.hostname.includes('photos.app.goo.gl') || urlObj.hostname.includes('photos.google.com')) {
      return { 
        isValid: true, 
        message: 'Shareable link detected. For best results, use the direct image URL. Right-click the image in Google Photos and select "Open image in new tab" to get the direct URL.'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Process images - upload files to Imgur or use provided URLs
   * Returns array of image URLs
   */
  processImages(files: File[], existingUrls: string[] = []): Observable<string[]> {
    // If there are no files to upload, return existing URLs
    if (!files || files.length === 0) {
      return of(existingUrls.filter(url => this.isValidImageUrl(url)));
    }

    // Upload files to Imgur
    const uploadPromises = files.map(file => this.uploadToImgur(file));

    // Upload all files and combine with existing URLs
    return forkJoin(uploadPromises).pipe(
      map(uploadedUrls => {
        const validExisting = existingUrls.filter(url => this.isValidImageUrl(url));
        return [...validExisting, ...uploadedUrls];
      }),
      catchError(err => {
        console.error('Error processing images:', err);
        return of(existingUrls.filter(url => this.isValidImageUrl(url)));
      })
    );
  }
}

