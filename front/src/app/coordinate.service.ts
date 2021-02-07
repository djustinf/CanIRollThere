import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Waypoint } from './waypoint';
import { LatLng } from 'leaflet';
import { WaypointUpdate, UpdateType } from './waypoint-update';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  // TODO: Move to a better pattern once we have more API calls and this is being hosted
  private BASE_URL = 'http://localhost:5000';
  private ELEVATION_API = this.BASE_URL + '/elevation';
  private SAVE_API = this.BASE_URL + '/save';
  private points: Waypoint[];

  waypointEmitter: EventEmitter<WaypointUpdate> = new EventEmitter<WaypointUpdate>();

  constructor(
    private httpClient: HttpClient,
  ) {
    this.points = [];
  }

  addPoint(point: LatLng): void {
    this.httpClient.get<number>(this.ELEVATION_API, { params: { lat: point.lat.toString(), lng: point.lng.toString() } })
      .subscribe((elev: number) => {
        const waypoint = new Waypoint(point.lat, point.lng, elev);
        this.points.push(waypoint);
        this.waypointEmitter.emit(new WaypointUpdate(UpdateType.ADD, waypoint));
      });
  }

  addPoints(points: LatLng[]): void {
    this.httpClient.post<number[]>(this.ELEVATION_API, {
      "locations": points
    }).subscribe((response: number[]) => {
      if (points.length != response.length) {
        console.error('Not enough elevation data for coordinates.');
        return;
      }
      for (let i = 0; i < points.length; i++) {
        const waypoint = new Waypoint(points[i].lat, points[i].lng, response[i]);
        this.points.push(waypoint);
        this.waypointEmitter.emit(new WaypointUpdate(UpdateType.ADD, waypoint));
      }
    });
  }

  getPoints(): Waypoint[] {
    return this.points;
  }

  clearPoints(): void {
    this.points = [];
    this.waypointEmitter.emit(new WaypointUpdate(UpdateType.CLEAR));
  }

  savePoints(): void {
    this.httpClient.post<{route_id: string}>(this.SAVE_API, {
      "locations": this.points
    }).subscribe((response: {route_id: string}) => {
      console.log(`Saved route! ${response.route_id}`);
    });
  }
}
