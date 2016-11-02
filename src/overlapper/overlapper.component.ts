import {
  Component,
  OnInit,
  Input,
  HostListener,
  NgZone,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

import * as interact from 'interact.js';
import * as models from '../lib/models';

@Component({
  selector: 'app-overlapper',
  template: `
    <div class="drag-container" id="drag-container"
      [ngStyle]="{'height': height + 'px' }"
      #dragContainer>
      <img [src]="dataImageBaseSanitized" class="imageDrag" id="imageBase" [ngStyle]="{'width' : widthBase + 'px'}" #mainImage />
      <template ngFor let-image [ngForOf]="images" let-i="index">
          <div class="imageUp" [id]="image.id" 
          [ngStyle]="{'width' : image.width + 'px', 'height': image.height + 'px', 'background-image': 'url(' + image.parent.url + ')' }">
          </div>
          <div
              *ngFor="let point of image.polygon.points" 
              [id]="point.id" class="pt draggable {{point.type}} draggable_{{image.id}}"
              [attr.corner]="point.type"
              [ngStyle]="{'visibility': image.imageLocked ? 'hidden':'visible'}">
              </div>
      </template>
  </div>
  `,
  styles: [`
  :host {
        display: block;
    }
    .pt {
        background-color: transparent;
        cursor: pointer;
        position: absolute;
        border-radius: 22.5px;
        border: solid 1px #E51937;
        height: 45px;
        width: 45px;
        -webkit-transform: translate(0px, 0px);
        transform: translate(0px, 0px);
        margin-top: -23.5px;
        margin-left: -23.5px;
    }
    .pt:before {
        background-color: #E51937;
        height: 7px;
        width: 7px;
        top: 19px;
        left: 19px;
        position: relative;
        content: " ";
        display: block;
    }
    .drag-container {
        border: 1px solid black;
        background-size: 100%;
        position: relative;
        overflow: hidden;
        width: 100%;
    }
    .imageUp {
        position: absolute;
    }

    .imageDrag {
        border: solid 1px lightgray;
        cursor:move;
        position: absolute;
        -webkit-transform: translate(0px, 0px);
        transform: translate(0px, 0px);

    }
  `]
})
export class OverlapperComponent implements OnInit {
  @Output() updatePoint: any = new EventEmitter();
  widthBase: number = 0;
  heightBase: number = 0;
  locationImageBase: models.Point = new models.Point(0, 0);
  dataImageBase: any;
  height: number;
  factor: number;
  @Input('TapDoorToUnlock') TapDoorToUnlock: boolean = true;
  images: models.DisplayingImage[] = [];
  @ViewChild('dragContainer') dragContainer: any;
  width: number;
  _zoom: number;
  // Background image
  imageBaseInitialised: boolean = false;
  private imageBase: string;
  private dataImageBaseSanitized: SafeUrl;
  setImageBase(value: string) {
    this.imageBase = value;
    this.dataImageBase = new Image();
    this.dataImageBase.onload = () => {
      this.factor = this.dataImageBase.width / this.width;
      this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
      this.initImageBase();
      this.zoom = this.zoom;
      this.updateWidthBase();
      setTimeout(() => {
        let tmpImages: models.Image[] = [];
        this.images.forEach((image: models.DisplayingImage) => {
          tmpImages.push(
            new models.Image(
              image.parent.url,
              new models.Polygon([
                new models.Point(image.polygon.points[0].x * this.factor, image.polygon.points[0].y * this.factor),
                new models.Point(image.polygon.points[1].x * this.factor, image.polygon.points[1].y * this.factor),
                new models.Point(image.polygon.points[2].x * this.factor, image.polygon.points[2].y * this.factor),
                new models.Point(image.polygon.points[3].x * this.factor, image.polygon.points[3].y * this.factor)
              ])
            )
          );
        });
        this.onImagesChange([]);
        this.onImagesChange(tmpImages);
      }, 50);
    };
    this.dataImageBase.src = value;
    this.dataImageBaseSanitized = this.domSanitizer.bypassSecurityTrustUrl(value);
  }
  // Width
  setWidth(value: number) {
    let previousWidth = this.width;
    this.width = value;
    if (this.dataImageBase.width > 0) {
      this.factor = this.dataImageBase.width / this.width;
      this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
      this.updatePointsOnZoom(this.zoom, this.zoom, previousWidth, value);
    } else {
      this.height = this.width * 0.6;
      this.factor = 1;
    }
  }
  // Main image this.setImageBase(image);
  @Input('mainImage') set mainImage(image: string) {
    if(image !== this.imageBase) {
      this.setImageBase(image);
    }
  }
  // zoom
  get zoom(): number {
    return this._zoom;
  }
  @Input('zoom') set zoom(value: number) {
    if (this.imageBaseInitialised) {
      let previousZoom = this._zoom;
      this._zoom = value;
      this.updatePointsOnZoom(previousZoom, value, this.width, this.width);
    }
  }
  // Lock/unlock images
  setLockImages(lockImages: boolean) {
    this.images.forEach(image => {
      image.imageLocked = lockImages;
    });
  }
  sendUpdatedPoint(imageIndex: number, pointIndex: number, newX: number, newY: number) {
    this.updatePoint.emit({ imageIndex, pointIndex, newX, newY });
  }
  updatePointsOnZoom(previousZoom: number, newZoom: number, previousWidth: number, newWidth: number) {
    previousZoom = previousZoom || 100;
    newZoom = newZoom || 100;
    let widthBaseBefore = this.widthBase,
      heightBaseBefore = this.heightBase,
      adjustCenterZoomX = 0,
      adjustCenterZoomY = 0;
    this.updateWidthBase();
    let target = document.getElementById('imageBase');
    if (newZoom === 100) {
      this.moveImageBase(target, -this.locationImageBase.x, -this.locationImageBase.y);
    } else {
      adjustCenterZoomX = -(this.widthBase - widthBaseBefore) / 2;
      adjustCenterZoomY = -(this.heightBase - heightBaseBefore) / 2;
      adjustCenterZoomX = adjustCenterZoomX || 0;
      adjustCenterZoomY = adjustCenterZoomY || 0;
      if (adjustCenterZoomX !== 0 || adjustCenterZoomY !== 0) {
        let adjustCenterZoom = this.moveImageBase(target, adjustCenterZoomX, adjustCenterZoomY);
        adjustCenterZoomX = adjustCenterZoom[0];
        adjustCenterZoomY = adjustCenterZoom[1];
      }
    }
    this.images.forEach((image) => {
      image.updatePointsOnZoom(this.locationImageBase, previousZoom, newZoom, previousWidth, newWidth);
    });
  }
  updateWidthBase() {
    this.widthBase = this.dataImageBase.width * ((this.zoom || 100) / 100) / this.factor;
    this.heightBase = this.widthBase * this.height / this.width;
  }
  constructor(
    private elementRef: ElementRef,
    zone: NgZone,
    private domSanitizer: DomSanitizer
  ) {
    (<any>window).zoneImpl = zone;
  }
  initImageBase() {
    if (!this.imageBaseInitialised) {
      this.imageBaseInitialised = true;
      interact('.imageDrag')
        .draggable({
          inertia: false,
          autoScroll: false,
          onmove: (event: any) => {
            this.dragMoveImageListener(event);
          },
          onend: null
        });
    }
  }
  onImagesChange(images: models.Image[]) {
    if (images.length < this.images.length) {
      this.images = this.images.slice(0, images.length);
    } else if (images.length > this.images.length) {
      images.slice(this.images.length).forEach(image => {
        let displayingImage = new models.DisplayingImage(
          image,
          this.locationImageBase,
          this.factor,
          this.images.length,
          this.zoom,
          this
        );
        this.images.push(displayingImage);
        displayingImage.initPerspectiveTransform(this.TapDoorToUnlock);
      });
    } else {
    }
  }
  ngOnInit() {
    this.updateWidthFrame();
  }
  dragMoveImageListener(event: any) {
    let target = event.target;
    this.moveImageBase(target, event.dx, event.dy);
  }
  moveImageBase(target: any, dx: number, dy: number) {
    let x = this.locationImageBase.x + dx,
      y = this.locationImageBase.y + dy,
      endX = this.widthBase + x - this.width,
      endY = this.heightBase + y - this.height;
    if (x > 0) {
      dx -= x;
      x = 0;
    }
    if (y > 0) {
      dy -= y;
      y = 0;
    }
    if (endX < 0) {
      x -= endX;
      dx -= endX;
    }
    if (endY < 0) {
      y -= endY;
      dy -= endY;
    }
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the position attributes
    this.locationImageBase.updateCoords(x, y);
    this.images.forEach((image) => {
      image.moveAll(dx, dy, this.locationImageBase);
    });
    return [dx, dy];
  }
  @HostListener('window:resize', ['$event.target'])
  updateWidthFrame() {
    let rect = this.dragContainer.nativeElement.getBoundingClientRect();
    if(rect.width > 0) {
      this.setWidth(rect.width);
    }
  }
}
