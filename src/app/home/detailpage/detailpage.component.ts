// detailpage.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { ImageProcessService } from '../../services/image-process.service';
import { UserProcessService } from '../../services/user-process.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detailpage',
  templateUrl: './detailpage.component.html',
  styleUrl: './detailpage.component.scss'
})
export class DetailpageComponent {
  @ViewChild('frontInput') frontInput!: ElementRef;
  @ViewChild('backInput') backInput!: ElementRef;
  @ViewChild('thankYouModal') thankYouModal: any;
  
  // User credit information
  userCredits: number = 0;
  hasCredits: boolean = false;

  frontImage: File | null = null;
  backImage: File | null = null;
  previewImages: { large: string; small1: string; small2: string } = { large: '', small1: '', small2: '' };
  processing = false;
  processBtnText: string = "Start Process";
  processBtnDisabled: boolean = false;
  result: any = null;
  modalRef: any;
  previewBgColor: string = '#ffffff';  // Default white
  brightness: number = 100;
  contrast: number = 100;
  backgroundColor: string = '#ffffff';
  innerMargin: number = 0.1;
  outerMargin: number = 0.1;
  verticalMargin: number = 0.1;
  currentImageSettings = {
    brightness: 100,
    contrast: 100,
    backgroundColor: '#ffffff',
    innerMargin: 0,
    outerMargin: 0,
    verticalMargin: 0
  };
  imageX: number = 0;
  imageY: number = 0;
  files: any = {
    front: null,
    back: null,
    composite: null
  };
  previewComposite: string = '';  // To store the preview changes

  // Add a property to store the styles
  imageStyles = {
    filter: 'brightness(100%) contrast(100%)',
    backgroundColor: '#ffffff'
  };

  // Add property to track if we should save as default
  saveAsDefault: boolean = false;

  // Add property to store default margins
  defaultMargins = {
    inner: 0.1,
    outer: 0.1,
    vertical: 0.1
  };

  constructor(
    private modalService: NgbModal, 
    private userService: UserProcessService, 
    private imageService: ImageProcessService, 
    private analyticsService: AnalyticsService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { 
    // Get user credits on component initialization
    this.getUserCredits();
    
    // Subscribe to user changes to update credit display
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userCredits = user.credits || 0;
        this.hasCredits = this.userCredits > 0;
        
        // Update button state based on credits
        if (!this.hasCredits && !this.processing) {
          this.processBtnDisabled = true;
          this.processBtnText = "Out of Credits";
        } else if (!this.processing) {
          this.processBtnText = "Start Process";
          this.processBtnDisabled = !this.frontImage || !this.backImage;
        }
      }
    });
  }
  
  // Method to get user credits
  getUserCredits() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userCredits = user.credits || 0;
      this.hasCredits = this.userCredits > 0;
      
      // Disable process button if no credits
      if (!this.hasCredits) {
        this.processBtnDisabled = true;
        this.processBtnText = "Out of Credits";
      }
    }
  }

  // Method to update user credits
  updateUserCredits() {
    // Get the current user data from localStorage
    this.getUserCredits();
    
    // Also fetch fresh data from the server if possible
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userCredits = user.credits || 0;
        this.hasCredits = this.userCredits > 0;
        
        // Update button state based on credits
        if (!this.hasCredits && !this.processing) {
          this.processBtnDisabled = true;
          this.processBtnText = "Out of Credits";
        }
      }
    });
  }

  triggerFileInput(side: 'front' | 'back') {
    if (side === 'front') {
      this.frontInput.nativeElement.click();
    } else {
      this.backInput.nativeElement.click();
    }
  }

  openTipsModal(content: any) {
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    });
  }

  downloadAll() {
    // Download all images
    const images = [
      { data: this.previewImages.large, filename: 'composite.png' },
      { data: this.previewImages.small1, filename: 'obverse.png' },
      { data: this.previewImages.small2, filename: 'reverse.png' }
    ];
    
    // Download each image
    images.forEach(img => {
      if (img.data) {
        const link = document.createElement('a');
        link.href = img.data;
        link.download = img.filename;
        link.click();
      }
    });
  }

  markIncorrect() {
    // Implement incorrect results functionality
    console.log('Marking results as incorrect');
    // You can add actual incorrect marking logic here
  }

  // When files are selected, update preview images
  onFileSelected(event: any, side: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      if (side === 'front') {
        this.frontImage = file;
        // Update bottom left container first
        this.previewImages.small1 = URL.createObjectURL(file);
      } else {
        this.backImage = file;
        // Update bottom right container first
        this.previewImages.small2 = URL.createObjectURL(file);
      }

      // Only update the top grid if we have both images
      if (this.frontImage && this.backImage) {
        // Enable the process button or auto-process here
        this.processBtnDisabled = false;
      }
    }
  }

  processImages() {
    this.analyticsService.incrementButtonClicks();
    if (!this.frontImage || !this.backImage) return;
    
    // Check if user has credits
    if (!this.hasCredits) {
      this.processBtnText = "Out of Credits";
      this.processBtnDisabled = true;
      return;
    }

    this.processBtnText = "Processing ...";
    this.processBtnDisabled = true;

    // Use default margins if they exist
    const margins = {
      inner_margin: this.innerMargin,
      outer_margin: this.outerMargin,
      vertical_margin: this.verticalMargin
    };

    console.log('Using margins in processImages:', margins); // Debug log

    this.processing = true;
    this.imageService.processImages(this.frontImage, this.backImage, margins)
      .subscribe({
        next: (response: any) => {
          // Store the processed files
          this.files = response.files;

          // Update the current margins to match what was used
          this.innerMargin = margins.inner_margin;
          this.outerMargin = margins.outer_margin;
          this.verticalMargin = margins.vertical_margin;

          const compositeBlob = this.imageService.base64ToBlob(
            response.files.composite.content,
            response.files.composite.content_type
          );
          this.previewImages.large = URL.createObjectURL(compositeBlob);

          const frontBlob = this.imageService.base64ToBlob(
            response.files.front.content,
            response.files.front.content_type
          );
          this.previewImages.small1 = URL.createObjectURL(frontBlob);

          const backBlob = this.imageService.base64ToBlob(
            response.files.back.content,
            response.files.back.content_type
          );
          this.previewImages.small2 = URL.createObjectURL(backBlob);

          // Disabled legacy analytics endpoint to prevent connection errors
          // this.userService.logUserAccess().subscribe({
          //   next: () => {
          //     console.log('Access logged successfully:');
          //   },
          //   error: (error: any) => {
          //     console.error('Error logging access:', error);
          //   }
          // });
          
          // Update user credits after successful processing
          this.updateUserCreditsAfterProcessing();

          //reset button
          if (this.hasCredits) {
            this.processBtnText = "Start Process";
            this.processBtnDisabled = false;
          } else {
            this.processBtnText = "Out of Credits";
            this.processBtnDisabled = true;
          }
          this.processing = false;
        },
        error: (error: any) => {
          console.error('Error processing images:', error);
          this.processing = false;
          
          // Check if error is due to no credits
          if (error?.error?.detail?.includes('insufficient credits')) {
            this.userCredits = 0;
            this.hasCredits = false;
            this.processBtnText = "Out of Credits";
            this.processBtnDisabled = true;
          } 
          // Check if it's an authentication error
          else if (error?.type === 'AUTH_ERROR' || error?.status === 401) {
            console.log('Authentication error detected, attempting to refresh token');
            this.processBtnText = "Authentication Error";
            this.processBtnDisabled = true;
            
            // Try to refresh the token instead of logging out
            this.authService.refreshToken().subscribe({
              next: (success: boolean) => {
                if (success) {
                  console.log('Token refreshed successfully');
                  this.processBtnText = "Token Refreshed";
                  // Re-enable the button after a short delay
                  setTimeout(() => {
                    this.processBtnText = "Start Process";
                    this.processBtnDisabled = false;
                  }, 2000);
                } else {
                  console.log('Token refresh failed');
                  this.processBtnText = "Please Login Again";
                  // Redirect to login after a short delay
                  setTimeout(() => {
                    this.router.navigate(['/login']);
                  }, 3000);
                }
              },
              error: (refreshError: any) => {
                console.error('Error refreshing token:', refreshError);
                this.processBtnText = "Please Login Again";
                // Redirect to login after a short delay
                setTimeout(() => {
                  this.router.navigate(['/login']);
                }, 3000);
              }
            });
          } else {
            this.processBtnText = "Start Process";
            this.processBtnDisabled = false;
          }
        }
      });
  }

  // Method to update user credits after successful processing
  updateUserCreditsAfterProcessing() {
    // Check if we have a local user before trying to fetch from server
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Simulate credit deduction locally to avoid server calls
      if (currentUser.credits && currentUser.credits > 0) {
        currentUser.credits -= 1;
        // Update the user in local storage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        // Update the user in the service
        this.authService.updateCurrentUser(currentUser);
        console.log('User credits updated locally:', currentUser.credits);
        this.updateUserCredits();
        return;
      }
    }
    
    // As a fallback, try to fetch from server (this might fail if server is down)
    this.authService.fetchCurrentUser().subscribe({
      next: (success: boolean) => {
        console.log('User credits updated from server:', success);
        this.updateUserCredits();
      },
      error: (error: any) => {
        console.error('Error updating user credits:', error);
        // Even if server call fails, still update UI with local data
        this.updateUserCredits();
      }
    });
  }

  openErrorModal(content: any) {
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      keyboard: false,
      windowClass: 'error-modal'
    });
  }

  openImageModal(content: any, type: 'composite' | 'obverse' | 'reverse') {
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    });
  }

  submitErrorCase(currentModal: any) {
    currentModal.close();
    // Show thank you modal
    if (this.thankYouModal) {
      this.modalService.open(this.thankYouModal, {
        size: 'sm',
        centered: true
      });
    }
  }

  switchImages() {
    if (this.files && this.files.front && this.files.back) {
      // We'll use the swap endpoint instead of manually swapping files
      // This will ensure the API handles all the swapping and color processing
      const margins = {
        inner_margin: this.innerMargin,
        outer_margin: this.outerMargin,
        vertical_margin: this.verticalMargin
      };
      
      // Use the swapImages method which calls the /swap endpoint
      this.imageService.swapImages(this.files.front, this.files.back, margins)
        .subscribe({
          next: (response) => {
            console.log('Swap response:', response);
            // Update the files with the swapped versions
            this.files.front = response.front;
            this.files.back = response.back;
            this.files.composite = response.composite;
            
            // Update preview images
            this.previewImages.small1 = URL.createObjectURL(
              this.imageService.base64ToBlob(
                response.front.content,
                response.front.content_type
              )
            );
            
            this.previewImages.small2 = URL.createObjectURL(
              this.imageService.base64ToBlob(
                response.back.content,
                response.back.content_type
              )
            );
            
            // Update the main composite image
            this.previewImages.large = URL.createObjectURL(
              this.imageService.base64ToBlob(
                response.composite.content,
                response.composite.content_type
              )
            );
            
            console.log('Swapped previews updated');
          },
          error: (error) => {
            console.error('Error swapping images:', error);
          }
        });
    }
  }

  openAdvancedSettings(template: any) {
    this.modalRef = this.modalService.open(template, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      windowClass: 'advanced-settings-modal'
    });
    
    // Initialize preview with current settings
    setTimeout(() => {
      this.updatePreview();
    }, 100);
  }

  updatePreviewBackground(event: any) {
    // Update preview in advanced settings modal
    const previewContent = document.querySelector('.preview-content') as HTMLElement;
    if (previewContent) {
      previewContent.style.backgroundColor = this.previewBgColor;
    }
  }

  updateInnerMargins() {
    // Update the preview in advanced settings modal
    const leftImg = document.querySelector('.preview-content .left-img') as HTMLElement;
    const rightImg = document.querySelector('.preview-content .right-img') as HTMLElement;
    
    if (leftImg && rightImg) {
      leftImg.style.transform = `translateX(${this.innerMargin}px)`;
      rightImg.style.transform = `translateX(-${this.innerMargin}px)`;
    }
  }

  // Update both main composite and preview images
  updateImages(container: Element) {
    const originalImages = container.querySelectorAll('img');
    const previewContent = document.querySelector('.preview-content') as HTMLElement;
    
    if (previewContent) {
      previewContent.style.backgroundColor = this.previewBgColor;
      
      // Clone the container and its images
      const clonedContainer = container.cloneNode(true) as HTMLElement;
      const clonedImages = clonedContainer.querySelectorAll('img');
      
      // Apply filters to all images
      clonedImages.forEach((img, index) => {
        (img as HTMLElement).style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
        
        // Apply margin transformations
        if (index === 0) {
          (img as HTMLElement).style.transform = `translateX(${this.innerMargin}px)`;
        } else if (index === 1) {
          (img as HTMLElement).style.transform = `translateX(-${this.innerMargin}px)`;
        }
        
        // Store the original filter for later reference
        (originalImages[index] as HTMLImageElement).dataset['originalFilter'] = 
            (originalImages[index] as HTMLImageElement).style.filter;
      });

      // Clear and update preview
      previewContent.innerHTML = '';
      previewContent.appendChild(clonedContainer);
    }
  }

  updatePreview() {
    // Update preview in advanced settings modal
    const previewContent = document.querySelector('.preview-content') as HTMLElement;
    if (previewContent) {
      previewContent.style.backgroundColor = this.previewBgColor;
      
      // Update image filters
      const previewImage = previewContent.querySelector('img') as HTMLElement;
      if (previewImage) {
        previewImage.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
      }
      
      // Update margins
      const leftImgElement = previewContent.querySelector('.left-img') as HTMLElement;
      if (leftImgElement) {
        leftImgElement.style.transform = `translateX(${this.innerMargin}px)`;
      }
      
      const rightImgElement = previewContent.querySelector('.right-img') as HTMLElement;
      if (rightImgElement) {
        rightImgElement.style.transform = `translateX(-${this.innerMargin}px)`;
      }
    }
    
    // Store current settings
    this.currentImageSettings = {
      brightness: this.brightness,
      contrast: this.contrast,
      backgroundColor: this.previewBgColor,
      innerMargin: this.innerMargin,
      outerMargin: this.outerMargin,
      verticalMargin: this.verticalMargin
    };
  }

  applyChanges() {
    // Apply changes to the main composite image
    if (this.previewComposite) {
      this.previewImages.large = this.previewComposite;
    }
    
    // Apply the current image settings to the main composite image
    const mainCompositeImage = document.querySelector('.coin-image-large img') as HTMLElement;
    if (mainCompositeImage) {
      mainCompositeImage.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
      mainCompositeImage.style.backgroundColor = this.backgroundColor;
    }
    
    // Apply the current image settings to the bottom two images
    const bottomImages = document.querySelectorAll('.coin-image-small img');
    bottomImages.forEach((img) => {
      const imgElement = img as HTMLElement;
      imgElement.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
      imgElement.style.backgroundColor = this.backgroundColor;
    });
    
    this.modalRef.close();
  }

  updateImageFilters() {
    // Apply filters only to the image in preview
    const previewImage = document.querySelector('.preview-content img') as HTMLElement;
    if (previewImage) {
      previewImage.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
    }
  }

  getLeftImagePosition(): number {
    const bottomLeft = document.querySelector('.coin-image-small:first-child img');
    if (bottomLeft) {
      const rect = bottomLeft.getBoundingClientRect();
      return rect.left - this.getContainerLeft();
    }
    return 0;
  }

  getRightImagePosition(): number {
    const bottomRight = document.querySelector('.coin-image-small:last-child img');
    if (bottomRight) {
      const rect = bottomRight.getBoundingClientRect();
      return rect.left - this.getContainerLeft();
    }
    return 0;
  }

  private getContainerLeft(): number {
    const container = document.querySelector('.coin-image-large');
    return container ? container.getBoundingClientRect().left : 0;
  }

  // Add margin change handler
  onMarginChange() {
    // Update the preview in advanced settings modal if it's open
    if (this.modalRef) {
      this.updateInnerMargins();
    }
  }

  // Method to move image
  moveImage(dx: number, dy: number) {
    this.imageX += dx;
    this.imageY += dy;
  }

  applyMargins() {
    if (this.files?.front && this.files?.back && this.previewImages.large) {
      const margins = {
        inner_margin: this.innerMargin,
        outer_margin: this.outerMargin,
        vertical_margin: this.verticalMargin
      };

      this.imageService.combineImages(this.files.front, this.files.back, margins)
        .subscribe({
          next: (response) => {
            this.previewComposite = URL.createObjectURL(
              this.imageService.base64ToBlob(
                response.composite.content,
                response.composite.content_type
              )
            );
          },
          error: (error) => console.error('Error combining images:', error)
        });
    }
  }

  getImageStyle() {
    return {
      'filter': `brightness(${this.brightness}%) contrast(${this.contrast}%)`,
      'background-color': this.backgroundColor
    };
  }
}
