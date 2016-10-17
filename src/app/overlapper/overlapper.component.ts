import { Component, OnInit, Input, HostListener, NgZone, ElementRef, ViewChild } from '@angular/core';
import { OverlapperService } from '../lib/overlapper.service';

import * as interact from 'interact.js';
import * as models from '../lib/models';

@Component({
  selector: 'app-overlapper',
  templateUrl: 'overlapper.component.html',
  styleUrls: ['overlapper.component.css']
})
export class OverlapperComponent implements OnInit {
  widthBase: number = 0;
  heightBase: number = 0;
  locationImageBase: models.Point = new models.Point(0, 0);
  dataImageBase: any;
  height: number;
  factor: number;
  images: models.DisplayingImage[] = [];
  // Background image
  imageBaseInitialised: boolean = false;
  private imageBase: string;
  setImageBase(value: string) {
      this.imageBase = value;
      this.dataImageBase = new Image();
      this.dataImageBase.onload = () => {
        this.factor = this.dataImageBase.width / this.width;
        this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
        this.initImageBase();
        this.zoom = this.zoom;
        this.updateWidthBase();
      };
      this.dataImageBase.src = value;
  }
  // Width
  private width: number;
  setWidth(value: number) {
    let previousWidth = this.width;
    this.width = value;
    if (this.dataImageBase) {
      this.factor = this.dataImageBase.width / this.width;
      this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
      this.updatePointsOnZoom(this.zoom, this.zoom, previousWidth, value);
    } else {
      this.height = 20;
      this.factor = 1;
    }
  }
  // zoom
  _zoom: number;
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
  updatePointsOnZoom(previousZoom, newZoom, previousWidth, newWidth) {
    let widthBaseBefore = this.widthBase,
      heightBaseBefore = this.heightBase,
      adjustCenterZoomX = 0,
      adjustCenterZoomY = 0;
    this.updateWidthBase();
    let target = document.getElementById('imageBase');
    if (newZoom === 100) {
      this.moveHouse(target, -this.locationImageBase.x, -this.locationImageBase.y);
    } else {
      adjustCenterZoomX = -(this.widthBase - widthBaseBefore) / 2;
      adjustCenterZoomY = -(this.heightBase - heightBaseBefore) / 2;
      adjustCenterZoomX = adjustCenterZoomX || 0;
      adjustCenterZoomY = adjustCenterZoomY || 0;
      if (adjustCenterZoomX !== 0 || adjustCenterZoomY !== 0) {
        let adjustCenterZoom = this.moveHouse(target, adjustCenterZoomX, adjustCenterZoomY);
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
    private overlapperService: OverlapperService,
    private elementRef: ElementRef,
    zone: NgZone
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
        onmove: (event) => {
          this.dragMoveImageListener(event);
        },
        onend: null
      });
      this.overlapperService.obsImages.subscribe((images: models.Image[]) => this.onImagesChange(images));
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
          this.overlapperService
        );
        this.images.push(displayingImage);
        displayingImage.initPerspectiveTransform();
      });
    } else {
      console.log('changed', this.overlapperService.getImages());
    }
  }
  ngOnInit() {
    this.updateWidthFrame();
    this.overlapperService.obsMainImage.subscribe((image: string) => {
      this.setImageBase(image);
    });
  }
  dragMoveImageListener(event) {
    let target = event.target;
    this.moveHouse(target, event.dx, event.dy);
  }
  moveHouse(target, dx, dy) {
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
      image.moveAll(dx, dy);
    });
    return [dx, dy];
  }
  @ViewChild('dragContainer') dragContainer;
  @HostListener('window:resize', ['$event.target'])
  updateWidthFrame() {
    let rect = this.dragContainer.nativeElement.getBoundingClientRect();
    this.setWidth(rect.width);
  }
}
