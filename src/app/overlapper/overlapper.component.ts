import { Component, OnInit } from '@angular/core';
import { PerspectiveTransform } from '../lib/PerspectiveTransform';
import * as interact from 'interact.js';
let instance: OverlapperComponent;

@Component({
  selector: 'app-overlapper',
  templateUrl: 'overlapper.component.html',
  styleUrls: ['overlapper.component.css']
})
export class OverlapperComponent implements OnInit {
  transform: PerspectiveTransform;
  imageBase: any;
  imageOverlapped: any;
  constructor() {
    instance = this;
  }
  ngOnInit() {
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
    let IMG_WIDTH = 239;
    let IMG_HEIGHT = 144;

    let img = document.getElementById('image');
    this.transform = new PerspectiveTransform(img, IMG_WIDTH, IMG_HEIGHT, true);
    this.initPoint('br', 423, 238);
    this.initPoint('bl', 183, 238);
    this.initPoint('tr', 423, 132);
    this.initPoint('tl', 183, 132);
  }
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
