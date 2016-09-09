import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
  doors = ['images/door1.png', 'images/door2.png', 'images/door3.png', 'images/door4.png', 'images/door5.png'];
  houses = ['images/house1.png', 'images/house2.jpeg', 'images/house3.jpeg',
    'images/house4.jpeg', 'images/house5.jpeg', 'images/house6.jpeg', 'images/house7.jpeg'];
  imageBase: string = 'images/house1.png';
  imageOverlapped: string = 'images/door1.png';
  width: number = 800;
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
}
