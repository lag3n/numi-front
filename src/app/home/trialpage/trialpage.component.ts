import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageProcessService } from '../../services/image-process.service';

@Component({
  selector: 'app-trialpage',
  templateUrl: './trialpage.component.html',
  styleUrls: ['./trialpage.component.scss']
})
export class TrialpageComponent {
  @ViewChild('frontInput') frontInput!: ElementRef;
  @ViewChild('backInput') backInput!: ElementRef;
  @ViewChild('errorModal') errorModal: any;
  
  frontImage: File | null = null;
  backImage: File | null = null;
  previewImages: { large: string; small1: string; small2: string } = { large: '', small1: '', small2: '' };
  processing = false;
  processBtnText: string = "Start Process";
  processBtnDisabled: boolean = false;
  files: any = {
    front: null,
    back: null,
    composite: null
  };
  imageStyles = {
    filter: 'brightness(100%) contrast(100%)',
    backgroundColor: '#ffffff'
  };

  // Fixed margins for trial version
  readonly innerMargin: number = 0.1;
  readonly outerMargin: number = 0.1;
  readonly verticalMargin: number = 0.1;

  constructor(
    private modalService: NgbModal,
    private imageService: ImageProcessService
  ) {}

  triggerFileInput(side: 'front' | 'back') {
    if (side === 'front') {
      this.frontInput.nativeElement.click();
    } else {
      this.backInput.nativeElement.click();
    }
  }

  onFileSelected(event: any, side: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      if (side === 'front') {
        this.frontImage = file;
        this.previewImages.small1 = URL.createObjectURL(file);
      } else {
        this.backImage = file;
        this.previewImages.small2 = URL.createObjectURL(file);
      }
    }
  }

  processImages() {
    if (!this.frontImage || !this.backImage) return;

    this.processBtnText = "Processing ...";
    this.processBtnDisabled = true;

    const margins = {
      inner_margin: this.innerMargin,
      outer_margin: this.outerMargin,
      vertical_margin: this.verticalMargin
    };

    this.processing = true;
    // Use the trial processing endpoint which will handle watermarking and resolution reduction
    this.imageService.processTrialImages(this.frontImage, this.backImage, margins)
      .subscribe({
        next: (response: any) => {
          try {
            console.log('Trial response from server:', response);
            
            // Handle the composite image directly from the base64 data 
            if (response.composite) {
              // For trial version, we directly get a base64 image without separate files
              this.previewImages.large = response.composite;
              
              // Apply the same watermarked image to the individual previews
              // This ensures consistent watermarking across all views
              if (response.front_preview) {
                this.previewImages.small1 = response.front_preview;
              }
              
              if (response.back_preview) {
                this.previewImages.small2 = response.back_preview;
              }
              
              this.processBtnText = "Start Process";
              this.processBtnDisabled = false;
              this.processing = false;
            } else {
              throw new Error('Invalid response format from trial endpoint');
            }
          } catch (err) {
            console.error('Error handling trial preview images:', err);
            this.openErrorModal(this.errorModal);
            this.processBtnText = "Start Process";
            this.processBtnDisabled = false;
            this.processing = false;
          }
        },
        error: (error: any) => {
          console.error('Error processing trial images:', error);
          this.openErrorModal(this.errorModal);
          this.processBtnText = "Start Process";
          this.processBtnDisabled = false;
          this.processing = false;
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
      centered: true,
      size: 'lg',
      windowClass: 'image-preview-modal'
    });
  }
}
