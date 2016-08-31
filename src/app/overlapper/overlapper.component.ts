import { Component, OnInit, Input } from '@angular/core';
import { PerspectiveTransform } from '../lib/PerspectiveTransform';
import { Point } from '../lib/Point';
import * as interact from 'interact.js';
let instance: OverlapperComponent;

@Component({
  selector: 'app-overlapper',
  templateUrl: 'overlapper.component.html',
  styleUrls: ['overlapper.component.css']
})
export class OverlapperComponent implements OnInit {
  widthBase: number = 0;
  locationImageBase: Point = new Point(0, 0);
  locationPoints: any = {
    bl: new Point(0, 0),
    br: new Point(0, 0),
    tl: new Point(0, 0),
    tr: new Point(0, 0),
  };
  transform: PerspectiveTransform;
  @Input() pointSize: number;
  dataImageBase: any;
  dataImageOverlapped: any;
  height: number;
  factor: number;
  // Background image
  _imageBase: string;
  get imageBase(): string {
      return this._imageBase;
  }
  @Input('imageBase') set imageBase(value: string) {
      this._imageBase = value;
      this.dataImageBase = new Image();
      this.dataImageBase.onload = () => {
        this.factor = this.dataImageBase.width / this.width;
        this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
        this.updateWidthBase();
        this.initPerspectiveTransform();
      };
      this.dataImageBase.src = value;
  }
  // Overlapped image
  _imageOverlapped: string;
  get imageOverlapped(): string {
      return this._imageOverlapped;
  }
  @Input('imageOverlapped') set imageOverlapped(value: string) {
      this._imageOverlapped = value;
      this.dataImageOverlapped = new Image();
      this.dataImageOverlapped.onload = () => {
        this.initPerspectiveTransform();
      };
      this.dataImageOverlapped.src = value;
  }
  // Width
  _width: number;
  get width(): number {
      return this._width;
  }
  @Input('width') set width(value: number) {
      this._width = value;
      this.initPerspectiveTransform();
  }
  // lockHouse
  _lockHouse: boolean;
  get lockHouse(): boolean {
      return this._lockHouse;
  }
  @Input('lockHouse') set lockHouse(value: boolean) {
      this._lockHouse = value;
      this.toggleDragHouse();
  }
  // lockDoor
  _lockDoor: boolean;
  get lockDoor(): boolean {
      return this._lockDoor;
  }
  @Input('lockDoor') set lockDoor(value: boolean) {
      this._lockDoor = value;
      this.toggleDragDoor();
  }
  // zoom
  _zoom: number;
  get zoom(): number {
      return this._zoom;
  }
  @Input('zoom') set zoom(value: number) {
    let previousZoom = this._zoom;
    this._zoom = value;
    this.updateWidthBase();
    if (value === 100) {
      let target = document.getElementById('imageBase');
      this.moveHouse(target, -this.locationImageBase.x, -this.locationImageBase.y);
    }
    // this.initPerspectiveTransform();
    if (instance.lockDoor) {
      let points = ['tl', 'tr', 'bl', 'br'];
      points.forEach(point => {
        let instPoint = this.locationPoints[point];
        let pointDom = document.getElementById(point);
        let relativeX = instPoint.x - this.locationImageBase.x;
        let newX = (relativeX * this.zoom / previousZoom) + this.locationImageBase.x;
        let dx = newX - instPoint.x;
        let relativeY = instPoint.y - this.locationImageBase.y;
        let newY = (relativeY * this.zoom / previousZoom) + this.locationImageBase.y;
        let dy = newY - instPoint.y;
        this.movePoint(pointDom, dx, dy);
      });
    }
  }

  updateWidthBase() {
    this.widthBase = this.dataImageBase.width * (this.zoom / 100) / this.factor;
    console.log('calculó',this.widthBase, 'img w', this.dataImageBase.width, 'factor', this.factor, 'zoom', this.zoom);
  }
  // imageBase: any;
  // imageOverlapped: any;
  constructor() {
    instance = this;
  }
  toggleDragHouse() {
    if (this.lockHouse) {
      interact('.imageDrag').draggable({enabled: false});
    } else {
      interact('.imageDrag')
      .draggable({
        inertia: true,
        restrict: {
          restriction: 'parent',
          endOnly: false,
          elementRect: { top: 0.5, left: 0.5, bottom: 0.5, right: 0.5 },
        },
        autoScroll: false,
        onmove: instance.dragMoveImageListener,
        onend: null
      });
    }
  }
  toggleDragDoor() {
    if (this.lockDoor) {
      interact('.draggable').draggable({enabled: false});
    } else {
      interact('.draggable')
      .draggable({
        inertia: true,
        restrict: {
          restriction: 'parent',
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        autoScroll: false,
        onmove: instance.dragMoveListener,
        onend: null
      });
    }
  }
  initPerspectiveTransform() {
    if (this.width && this.height && this.imageOverlapped) {
      let img = document.getElementById('image');
      this.transform = new PerspectiveTransform(img, this.dataImageOverlapped.width, this.dataImageOverlapped.height, true);
      let startX = Number(this.width / 3);
      let endX = startX * 2;
      let startY = Number(this.height / 3);
      let endY = startY * 2;
      this.initPoint('br', endX, endY);
      this.initPoint('bl', startX, endY);
      this.initPoint('tr', endX, startY);
      this.initPoint('tl', startX, startY);
    }
  }
  ngOnInit() {}
  updatePoint(id, x, y) {
    if (id === 'br') {
      this.transform.bottomRight.updateCoords(x + 5, y + 5);
    } else if (id === 'bl') {
      this.transform.bottomLeft.updateCoords(x, y + 5);
    } else if (id === 'tl') {
      this.transform.topLeft.updateCoords(x, y);
    } else if (id === 'tr') {
      this.transform.topRight.updateCoords(x + 5, y);
    }
    if (this.transform.checkError() === 0) {
      this.transform.update();
    } else {
      console.log('Error, should hide image or something');
    }
  }
  dragMoveImageListener(event) {
    let target = event.target;
    instance.moveHouse(target, event.dx, event.dy);
  }
  moveHouse(target, dx, dy) {
    let x = instance.locationImageBase.x + dx,
      y = instance.locationImageBase.y + dy;
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    instance.locationImageBase.updateCoords(x, y);
    // instance.updatePoint(target.getAttribute('id'), x, y);
    if (instance.lockDoor) {
      let points = ['tl', 'tr', 'bl', 'br'];
      points.forEach(point => {
        let pointDom = document.getElementById(point);
        instance.movePoint(pointDom, dx, dy);
      });
    }
  }
  dragMoveListener(event) {
    let target = event.target;
    instance.movePoint(target, event.dx, event.dy);
  }
  movePoint(target, dx, dy) {
    let id = target.getAttribute('id');
    let point = instance.locationPoints[id];
    let x = point.x + dx,
      y = point.y + dy;
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    point.updateCoords(x, y);
    instance.updatePoint(id, x, y);
  }
  initPoint(id, x, y) {
    let target = document.getElementById(id);
    let point = instance.locationPoints[id];
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    point.updateCoords(x, y);
    this.updatePoint(target.getAttribute('id'), x, y);
  }
}
