import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CoordinateService } from '../coordinate.service';

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit {
  // https://github.com/Asymmetrik/ngx-leaflet/issues/175#issuecomment-406873836
  readonly MARKER_ICON: L.Icon = L.icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'leaflet/marker-icon.png',
    shadowUrl: 'leaflet/marker-shadow.png'
  });

  private map!: L.Map;
  private markers!: L.Marker[];
  private lines!: L.Polyline[];
  coordinateService!: CoordinateService;

  constructor(
    coordinateService: CoordinateService,
  ) {
    this.coordinateService = coordinateService;
    this.markers = [];
    this.lines = [];
  }

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

    this.map.on('click', this.addMarker.bind(this) as L.LeafletEventHandlerFn);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    // prevent button clicks from also clicking map,
    // and make button visible when map is visible
    const button = document.getElementById('remove-markers');
    if (button) {
      button.removeAttribute('hidden');
      L.DomEvent.disableClickPropagation(button);
    }
  }

  private addMarker(event: L.LeafletMouseEvent): void {
    var marker = L.marker(event.latlng, {icon: this.MARKER_ICON});
    this.markers.push(marker);

    if (this.markers.length > 1) {
      var polyline = L.polyline([marker.getLatLng(), this.markers[this.markers.length - 2].getLatLng()]);
      this.lines.push(polyline);
      polyline.addTo(this.map);
    }

    marker.addTo(this.map);
    this.coordinateService.addPoint(event.latlng.lat, event.latlng.lng);
  }

  clearMarkers() {
    for (let marker of this.markers) {
      marker.remove();
    }
    this.markers = [];

    for (let line of this.lines) {
      line.remove();
    }
    this.lines = [];
    this.coordinateService.clearPoints();
  }
}
