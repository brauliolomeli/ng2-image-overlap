import { Component, OnInit, Input, HostListener, NgZone, ElementRef, ViewChild } from '@angular/core';
// import { PerspectiveTransform } from '../lib/PerspectiveTransform';
import { OverlapperService } from '../lib/overlapper.service';

import * as interact from 'interact.js';
import * as models from '../lib/models';
let instance: OverlapperComponent;

@Component({
  selector: 'app-overlapper',
  templateUrl: 'overlapper.component.html',
  styleUrls: ['overlapper.component.css']
})
export class OverlapperComponent implements OnInit {
  widthBase: number = 0;
  heightBase: number = 0;
  locationImageBase: models.Point = new models.Point(0, 0);
  pointSize: number = 45;
  // locationPoints: any = {
  //   bl: new Point(0, 0),
  //   br: new Point(0, 0),
  //   tl: new Point(0, 0),
  //   tr: new Point(0, 0),
  //   bl2: new Point(0, 0),
  //   br2: new Point(0, 0),
  //   tl2: new Point(0, 0),
  //   tr2: new Point(0, 0),
  // };
  // transform1: PerspectiveTransform;
  // transform2: PerspectiveTransform;
  dataImageBase: any;
  dataImageOverlapped: any;
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
  // Overlapped image
  // _imageOverlapped: string;
  // get imageOverlapped(): string {
  //     return this._imageOverlapped;
  // }
  // @Input('imageOverlapped') set imageOverlapped(value: string) {
      // this._imageOverlapped = value;
      // this.dataImageOverlapped = new Image();
      // this.dataImageOverlapped.onload = () => {
      //   this.initPerspectiveTransform();
      // };
      // this.dataImageOverlapped.src = value;
  // }
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
  // Duplicate door
  // @Input('duplicateDoor') duplicateDoor: boolean;
  // lockDoor
  // _lockDoor: boolean;
  // get lockDoor(): boolean {
  //   return this._lockDoor;
  // }
  // set lockDoor(value: boolean) {
  //   this._lockDoor = value;
  //   this.toggleDragDoor(value);
  // }
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
    // if (instance.lockDoor) {
    //   let points = ['tl', 'tr', 'bl', 'br', 'tl2', 'tr2', 'bl2', 'br2'];
    //   points.forEach(point => {
    //     let instPoint = this.locationPoints[point];
    //     let pointDom = document.getElementById(point);
    //     let relativeX = instPoint.x - this.locationImageBase.x;
    //     let relativeY = instPoint.y - this.locationImageBase.y;
    //     let newX, newY;
    //     if (previousZoom !== newZoom) {
    //       newX = (relativeX * newZoom / previousZoom) + this.locationImageBase.x;
    //       newY = (relativeY * newZoom / previousZoom) + this.locationImageBase.y;
    //     } else {
    //       newX = (relativeX * newWidth / previousWidth) + this.locationImageBase.x;
    //       newY = (relativeY * newWidth / previousWidth) + this.locationImageBase.y;
    //     }
    //     let dx = newX - instPoint.x;
    //     let dy = newY - instPoint.y;
    //     console.log(this.transform1);
    //     this.movePoint(pointDom, dx, dy);
    //   });
    // }
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
    instance = this;
    (<any>window).app = this;
    (<any>window).zoneImpl = zone;
  }
  // toggleDragDoor(lock: boolean) {
  //   if (lock) {
  //     interact('.draggable').draggable({enabled: false});
  //     interact('.imageUp').draggable({enabled: false});
  //   } else {
  //     interact('.draggable')
  //     .draggable({
  //       inertia: true,
  //       restrict: {
  //         restriction: 'parent',
  //         endOnly: true,
  //         elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  //       },
  //       autoScroll: false,
  //       onmove: instance.dragPointListener,
  //       onend: null
  //     });
  //     interact('.imageUp')
  //     .draggable({
  //       inertia: true,
  //       restrict: {
  //         restriction: 'parent',
  //         endOnly: true,
  //         elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  //       },
  //       autoScroll: false,
  //       onmove: instance.dragDoorListener,
  //       onend: null
  //     });
  //   }
  // }
  // initPerspectiveTransform() {
  //   console.log('will init perspective', this.width, this.height, this.imageOverlapped);
  //   if (this.imageOverlapped) { //} && !this.perpectiveInitialized) {
  //     let img = document.getElementById('image');
  //     let img2 = document.getElementById('image2');
  //     this.transform1 = new PerspectiveTransform(img, this.dataImageOverlapped.width, this.dataImageOverlapped.height, true);
  //     console.log(this.transform1);
  //     this.transform2 = new PerspectiveTransform(img2, this.dataImageOverlapped.width, this.dataImageOverlapped.height, true);
  //     let startX = Number((this.width || 300) / 3);
  //     let endX = startX * 2;
  //     let startY = Number((this.height || 200) / 3);
  //     let endY = startY * 2;
  //     this.initPoint('br', endX, endY);
  //     this.initPoint('bl', startX, endY);
  //     this.initPoint('tr', endX, startY);
  //     this.initPoint('tl', startX, startY);
  //     this.initPoint('br2', startX - 40, endY);
  //     this.initPoint('bl2', 20, endY);
  //     this.initPoint('tr2', startX - 40, startY);
  //     this.initPoint('tl2', 20, startY);
  //   }
  // }
  initImageBase() {
    if (!this.imageBaseInitialised) {
      this.imageBaseInitialised = true;
      // this.lockDoor = true;
      interact('.imageDrag')
      .draggable({
        inertia: false,
        autoScroll: false,
        onmove: instance.dragMoveImageListener,
        onend: null
      });
      this.overlapperService.obsImages.subscribe(this.onImagesChange);
    // interact('.imageUp').on('tap', (event) => {
    //   (<any>window).zoneImpl.run(() => (<any>window).app.lockDoor = !(<any>window).app.lockDoor);
    // });
    }
  }
  onImagesChange(images: models.Image[]) {
    if (images.length < instance.images.length) {
      instance.images = instance.images.slice(0, images.length);
    } else if (images.length > instance.images.length) {
      images.slice(instance.images.length).forEach(image => {
        let displayingImage = new models.DisplayingImage(image, instance.locationImageBase, instance.factor, instance.images.length);
        instance.images.push(displayingImage);
        displayingImage.initPerspectiveTransform();
        console.log(instance.images);
      });
    }
  }
  ngOnInit() {
    this.updateWidthFrame();
    this.overlapperService.obsMainImage.subscribe((image: string) => {
      this.setImageBase(image);
    });
    // interact('.imageUp').on('tap', (event) => {
    //   (<any>window).zoneImpl.run(() => (<any>window).app.lockDoor = !(<any>window).app.lockDoor);
    // });
  }
  // updatePoint(id, x, y) {
  //   let transform;
  //   if (id === 'br') {
  //     this.transform1.bottomRight.updateCoords(x + 5, y + 5);
  //     transform = this.transform1;
  //   } else if (id === 'bl') {
  //     this.transform1.bottomLeft.updateCoords(x, y + 5);
  //     transform = this.transform1;
  //   } else if (id === 'tl') {
  //     this.transform1.topLeft.updateCoords(x, y);
  //     transform = this.transform1;
  //   } else if (id === 'tr') {
  //     this.transform1.topRight.updateCoords(x + 5, y);
  //     transform = this.transform1;
  //   } else if (id === 'br2') {
  //     this.transform2.bottomRight.updateCoords(x + 5, y + 5);
  //     transform = this.transform2;
  //   } else if (id === 'bl2') {
  //     this.transform2.bottomLeft.updateCoords(x, y + 5);
  //     transform = this.transform2;
  //   } else if (id === 'tl2') {
  //     this.transform2.topLeft.updateCoords(x, y);
  //     transform = this.transform2;
  //   } else if (id === 'tr2') {
  //     this.transform2.topRight.updateCoords(x + 5, y);
  //     transform = this.transform2;
  //   }
  //   if (transform.checkError() === 0) {
  //     transform.update();
  //   } else {
  //     console.log('Error, should hide image or something');
  //   }
  // }
  dragMoveImageListener(event) {
    let target = event.target;
    instance.moveHouse(target, event.dx, event.dy);
  }
  moveHouse(target, dx, dy) {
    let x = instance.locationImageBase.x + dx,
      y = instance.locationImageBase.y + dy,
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
    // update the posiion attributes
    instance.locationImageBase.updateCoords(x, y);
    // if (instance.lockDoor) {
    //   let points = ['tl', 'tr', 'bl', 'br', 'tl2', 'tr2', 'bl2', 'br2'];
    //   points.forEach(point => {
    //     let pointDom = document.getElementById(point);
    //     instance.movePoint(pointDom, dx, dy);
    //   });
    // }
    return [dx, dy];
  }
  // dragPointListener(event) {
  //   let target = event.target;
  //   instance.movePoint(target, event.dx, event.dy);
  // }
  // dragDoorListener(event) {
  //   if (!instance.lockDoor) {
  //     let points = event.target.id === 'image' ? ['tl', 'tr', 'bl', 'br'] : ['tl2', 'tr2', 'bl2', 'br2'];
  //     points.forEach(point => {
  //       let pointDom = document.getElementById(point);
  //       instance.movePoint(pointDom, event.dx, event.dy);
  //     });
  //   }
  // }
  // movePoint(target, dx, dy) {
  //   let id = target.getAttribute('id');
  //   let point = instance.locationPoints[id];
  //   let x = point.x + dx,
  //     y = point.y + dy;
  //   // translate the element
  //   target.style.webkitTransform =
  //     target.style.transform =
  //     'translate(' + x + 'px, ' + y + 'px)';
  //   // update the posiion attributes
  //   point.updateCoords(x, y);
  //   instance.updatePoint(id, x, y);
  // }
  // initPoint(id, x, y) {
  //   let target = document.getElementById(id);
  //   let point = instance.locationPoints[id];
  //   target.style.webkitTransform =
  //     target.style.transform =
  //     'translate(' + x + 'px, ' + y + 'px)';
  //   // update the posiion attributes
  //   point.updateCoords(x, y);
  //   this.updatePoint(target.getAttribute('id'), x, y);
  // }
  // toCanvas() {
  //   console.log('Will be converted to canvas');
    // html2canvas(document.getElementById('drag-container'), {
    //   onrendered: (canvas) => document.body.appendChild(canvas)
    // });
    // html2canvas(document.getElementById('drag-container'), {
    //   onrendered: function(canvas) {
    //     document.body.appendChild(canvas);
    //   }
    // });
  // }
  @ViewChild('dragContainer') dragContainer;
  @HostListener('window:resize', ['$event.target'])
  updateWidthFrame() {
    let rect = this.dragContainer.nativeElement.getBoundingClientRect();
    this.setWidth(rect.width);
  }
}
