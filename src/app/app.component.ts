import { Component } from '@angular/core';
import { OverlapperService } from './lib/overlapper.service';
import * as models from './lib/models';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  doors = ['images/door1.png', 'images/door2.png', 'images/door3.png', 'images/door4.png', 'images/door5.png'];
  houses = ['images/house1.png', 'images/house2.jpeg', 'images/house3.jpeg',
    'images/house4.jpeg', 'images/house5.jpeg', 'images/house6.jpeg', 'images/house7.jpeg'];
  // imageOverlapped: string = 'images/door5.png';
  zoom: number = 100;
  lockDoor: boolean = false;

  zoomStep = 25;
  zoomMin = 100;
  zoomMax = 200;
  updateZoom(way = 1) {
    let zoom = this.zoom + this.zoomStep * way;
    zoom = zoom > this.zoomMax ? this.zoomMax : zoom;
    zoom = zoom < this.zoomMin ? this.zoomMin : zoom;
    this.zoom = zoom;
  }
  constructor(private overlapperService: OverlapperService) {
    this.overlapperService.setMainImage('images/house5.jpeg');
  }
  selectMainImage(image: string) {
    this.overlapperService.setMainImage(image);
  }
  addImage(door) {
    let image = new models.Image(
      door,
      new models.Polygon([
        new models.Point(100, 200),
        new models.Point(500, 200),
        new models.Point(200, 500),
        new models.Point(500, 500)
      ]));
    this.overlapperService.addImage(image);
  }
}
