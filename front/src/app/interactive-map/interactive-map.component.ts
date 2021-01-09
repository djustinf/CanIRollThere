import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
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
  private markers: L.Marker[];
  private lines: L.Polyline[];
  private router: L.Routing.IRouter;
  coordinateService: CoordinateService;

  constructor(
    coordinateService: CoordinateService,
  ) {
    this.coordinateService = coordinateService;
    this.markers = [];
    this.lines = [];
    // TODO - Spin up osrm-backend Docker image, serve API via Flask
    this.router = new L.Routing.OSRMv1({
      serviceUrl: `http://router.project-osrm.org/route/v1/`
    });
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
    let marker = L.marker(event.latlng, {icon: this.MARKER_ICON});
    this.markers.push(marker);
    marker.addTo(this.map);

    if (this.markers.length > 1) {
      this.router.route([
        new L.Routing.Waypoint(this.markers[this.markers.length - 2].getLatLng(), `marker_${this.markers.length - 1}`, {}),
        new L.Routing.Waypoint(marker.getLatLng(), `marker_${this.markers.length}`, {})
      ], (err, routes) => {
        if (err) {
          console.error(err);

          // default to standard polyline on failure
          const line = new L.Polyline([
            this.markers[this.markers.length - 2].getLatLng(),
            marker.getLatLng()
          ]);

          this.coordinateService.addPoint(marker.getLatLng());

          this.lines.push(line);
          line.addTo(this.map);
          return;
        }
        let coordinatePairs: L.LatLng[] = [];
        if (routes) {
          for (let route of routes) {
            if (route.coordinates) {
              for (let i = 1; i < route.coordinates.length; i++) {
                coordinatePairs.push(route.coordinates[i - 1]);
                const line = new L.Polyline([
                  [route.coordinates[i - 1].lat, route.coordinates[i - 1].lng],
                  [route.coordinates[i].lat, route.coordinates[i].lng]
                ]);
                this.lines.push(line);
                line.addTo(this.map);
              }
            }
          }
        }
        this.coordinateService.addPoints(coordinatePairs);
      });
    }
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
