import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit {
  private lat!: number;
  private lon!: number;
  private map!: L.Map;

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;

      this.map = L.map('map', {
        center: [ this.lat, this.lon ],
        zoom: 20
      });

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });

      tiles.addTo(this.map);
    });
  }
}
