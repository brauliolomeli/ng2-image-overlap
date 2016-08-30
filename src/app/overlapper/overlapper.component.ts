import { Component, OnInit, Input } from '@angular/core';
import { PerspectiveTransform } from '../lib/PerspectiveTransform';
import * as interact from 'interact.js';
let instance: OverlapperComponent;

@Component({
  selector: 'app-overlapper',
  templateUrl: 'overlapper.component.html',
  styleUrls: ['overlapper.component.css']
})
export class OverlapperComponent implements OnInit {
  widthBase: number = 0;
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
        this.factor = this.width / this.dataImageBase.width;
        this.height = this.width * this.dataImageBase.height / this.dataImageBase.width;
        
        this.initPerspectiveTransform();
      }
      this.dataImageBase.src = value;
  }
  updateWidthBase() {
    this.widthBase = this.factor * this.width * (this.zoom / 100);
    console.log('updateWidthBase', this.widthBase);
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
      }
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
      this._zoom = value;
      this.updateWidthBase();
      // this.initPerspectiveTransform();
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
      this.transform.bottomRight.x = x + 5;
      this.transform.bottomRight.y = y + 5;
    } else if (id === 'bl') {
      this.transform.bottomLeft.x = x;
      this.transform.bottomLeft.y = y + 5;
    } else if (id === 'tl') {
      this.transform.topLeft.x = x;
      this.transform.topLeft.y = y;
    } else if (id === 'tr') {
      this.transform.topRight.x = x + 5;
      this.transform.topRight.y = y;
    }
    if (this.transform.checkError() === 0) {
      this.transform.update();
    } else {
      console.log('Error, should hide image or something');
    }
  }
  dragMoveImageListener(event) {
    let target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    //instance.updatePoint(target.getAttribute('id'), x, y);
  }
  dragMoveListener(event) {
    let target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    instance.updatePoint(target.getAttribute('id'), x, y);
  }
  initPoint(id, x, y) {
    let target = document.getElementById(id);
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    this.updatePoint(target.getAttribute('id'), x, y);
  }
}
