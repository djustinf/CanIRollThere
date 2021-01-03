import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit {
  private map!: L.Map;

  constructor() { }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition(this.initMap.bind(this), (e) => {
      console.warn("Failed to get current location.");
      this.initMap();
    })
  }

  private initMap(position?: Position): void {
    if (position) {
      this.map = L.map('map', {
        center: [ position.coords.latitude, position.coords.longitude ],
        zoom: 20
      });
    } else { // browser didn't provide position
      this.map = L.map('map', {
        center: [ 38.5766, -121.4932 ],
        zoom: 20
      });
    }

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
}
