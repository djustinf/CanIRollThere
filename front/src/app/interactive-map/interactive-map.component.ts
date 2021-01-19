import { 
  Component,
  AfterViewInit
} from '@angular/core';
import { 
  FormBuilder,
  FormGroup
} from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { CoordinateService } from '../coordinate.service';

enum LineMode {
  AUTO,
  SNAP,
  FREEFORM
}

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit {

  // https://github.com/Asymmetrik/ngx-leaflet/issues/175#issuecomment-406873836
  private MARKER_ICON: L.Icon = L.icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'leaflet/marker-icon.png',
    shadowUrl: 'leaflet/marker-shadow.png'
  });
  private MAX_ROUTE_DISTANCE = 5000;
  private SUBDIVISION_RESOLUTION = 30; // TODO - determine this based on the resolution of elevation data

  private map!: L.Map;
  private markers: L.Marker[];
  private lines: L.Polyline[];
  private router: L.Routing.IRouter;

  coordinateService: CoordinateService;
  lineMode: string;

  constructor(
    coordinateService: CoordinateService,
    private formBuilder: FormBuilder
  ) {
    this.coordinateService = coordinateService;
    this.markers = [];
    this.lines = [];
    this.lineMode = '0';

    // TODO - Spin up osrm-backend Docker image, serve API via Flask
    this.router = new L.Routing.OSRMv1({
      serviceUrl: `http://router.project-osrm.org/route/v1/`
    });
  }

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition(this.initMap.bind(this), (e) => {
      console.warn("Failed to get current location.");
      this.initMap();
    });
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

    // prevent options clicks from also clicking map,
    // and make options visible when map is visible
    const optionsDiv = document.getElementById('options');
    if (optionsDiv) {
      if (optionsDiv.classList.contains('hidden')) {
        optionsDiv.classList.remove('hidden');
      }
      if (optionsDiv.hasAttribute('hidden')) {
        optionsDiv.removeAttribute('hidden');
      }
      L.DomEvent.disableClickPropagation(optionsDiv);
    }
  }

  private addMarker(event: L.LeafletMouseEvent): void {
    let marker = L.marker(event.latlng, {icon: this.MARKER_ICON});

    const lineMode = +this.lineMode;
    if (this.markers.length > 0) {
      let previousPoint: L.LatLng;
      if (this.lines.length > 0) {
        const previousLatLngs = this.lines[this.lines.length - 1].getLatLngs();
        previousPoint = previousLatLngs[previousLatLngs.length - 1] as L.LatLng;
      } else {
        previousPoint = this.markers[this.markers.length - 1].getLatLng();
      }

      if (lineMode === LineMode.FREEFORM) {
        this.coordinateService.addPoint(marker.getLatLng());

        const line = new L.Polyline([
          previousPoint,
          marker.getLatLng()
        ]);
        this.lines.push(line);
        line.addTo(this.map);
      } else if (previousPoint.distanceTo(marker.getLatLng()) > this.MAX_ROUTE_DISTANCE) {
        alert("Please use the current line mode on a shorter distance.");
        return;
      } else {
        this.router.route([
          new L.Routing.Waypoint(previousPoint, `marker_${this.markers.length - 1}`, {}),
          new L.Routing.Waypoint(marker.getLatLng(), `marker_${this.markers.length}`, {})
        ], (err, routes) => {
          if (err) {
            console.error(err);

            // default to standard polyline on failure
            const line = new L.Polyline([
              previousPoint,
              marker.getLatLng()
            ]);

            this.coordinateService.addPoint(marker.getLatLng());

            this.lines.push(line);
            line.addTo(this.map);
          } else if (routes) {
            let minDistance: number = 0;
            let minRoute: L.LatLng[] = [];
            for (let route of routes) {
              if (route.coordinates) {
                let newDistance = this.getRouteLength(route.coordinates);
                if (!minRoute.length || newDistance < minDistance) {
                  minRoute = route.coordinates;
                  minDistance = newDistance;
                }
              }
            }
            const subdivided: L.LatLng[] = this.subdivide(minRoute, this.SUBDIVISION_RESOLUTION);
            if (lineMode === LineMode.SNAP) {
              const lastPoint = subdivided[subdivided.length - 1];
              const line = new L.Polyline([
                subdivided[0],
                lastPoint
              ]);
              this.lines.push(line);
              line.addTo(this.map);

              this.coordinateService.addPoint(lastPoint);
            } else if (lineMode === LineMode.AUTO) {
              let coordinatePairs: L.LatLng[] = [];
              for (let i = 0; i < subdivided.length - 1; i++) {
                const line = new L.Polyline([
                  subdivided[i],
                  subdivided[i + 1]
                ]);
                this.lines.push(line);
                line.addTo(this.map);

                coordinatePairs.push(subdivided[i]);
              }

              this.coordinateService.addPoints(coordinatePairs);
            }
          }
        });
      }
    }

    this.markers.push(marker);
    marker.addTo(this.map);
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

  getRouteLength(coordinates: L.LatLng[]) {
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += coordinates[i].distanceTo(coordinates[i + 1]);
    }
    return totalDistance;
  }

  subdivide(coordinates: L.LatLng[], resolution: number): L.LatLng[] {
    let subdivided = [coordinates[0]]; // add starting point

    for (let i = 0; i < coordinates.length - 1; i++) {
      let current: L.LatLng = coordinates[i];
      let next: L.LatLng = coordinates[i + 1];

      let dist = current.distanceTo(next);
      while (dist > resolution) {
        let fractionOfDist = resolution / dist;
        let deltaLat = next.lat - current.lat;
        let deltaLng = next.lng - current.lng;

        // move by at most "resolution", then add new point
        current = new L.LatLng(current.lat + fractionOfDist * deltaLat, current.lng + fractionOfDist * deltaLng);
        subdivided.push(current);
        dist = current.distanceTo(next);
      }

      subdivided.push(next); // add next starting point
    }

    // remove redundant points
    return subdivided.filter((coordinate, index) => {
      if (index > 0) {
        return coordinate.distanceTo(subdivided[index - 1]) > 0;
      }
      return true;
    });
  }
}
