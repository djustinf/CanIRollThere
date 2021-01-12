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

  private map!: L.Map;
  private markers: L.Marker[];
  private lines: L.Polyline[];
  private router: L.Routing.IRouter;

  coordinateService: CoordinateService;
  lineModeForm: FormGroup;

  constructor(
    coordinateService: CoordinateService,
    private formBuilder: FormBuilder
  ) {
    this.coordinateService = coordinateService;
    this.markers = [];
    this.lines = [];
    this.lineModeForm = this.formBuilder.group({
      lineMode: "0"
    });

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

    const lineMode = +this.lineModeForm.value.lineMode;
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
            for (let route of routes) {
              if (route.coordinates) {
                if (lineMode === LineMode.SNAP) {
                  const lastPoint = route.coordinates[route.coordinates.length - 1];
                  const line = new L.Polyline([
                    route.coordinates[0],
                    lastPoint
                  ]);
                  this.lines.push(line);
                  line.addTo(this.map);

                  this.coordinateService.addPoint(lastPoint);
                } else if (lineMode === LineMode.AUTO) {
                  let coordinatePairs: L.LatLng[] = [];
                  for (let i = 1; i < route.coordinates.length; i++) {
                    const line = new L.Polyline([
                      route.coordinates[i - 1],
                      route.coordinates[i]
                    ]);
                    this.lines.push(line);
                    line.addTo(this.map);

                    coordinatePairs.push(route.coordinates[i - 1]);
                  }

                  this.coordinateService.addPoints(coordinatePairs);
                }
              }
            }
          }
        });
      }
    }

    this.markers.push(marker);
    marker.addTo(this.map);
    this.coordinateService.addPoint(marker.getLatLng());
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
