import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Waypoint } from './waypoint';
import { WaypointUpdate, UpdateType } from './waypoint-update';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  // TODO: Move to a better pattern once we have more API calls and this is being hosted
  private ELEVATION_API = 'http://localhost:5000/elevation';
  private points: Waypoint[];

  waypointEmitter: EventEmitter<WaypointUpdate> = new EventEmitter<WaypointUpdate>();

  constructor(
    private httpClient: HttpClient,
  ) {
    this.points = [];
  }

  addPoint(x: number, y: number): void {
    this.httpClient.get<string>(this.ELEVATION_API, { params: { lat: x.toString(), lon: y.toString() } })
      .subscribe((elev: string) => {
        const point = new Waypoint(x, y, +elev);
        this.points.push(point);
        this.waypointEmitter.emit(new WaypointUpdate(UpdateType.ADD, point));
      });
  }

  getPoints(): Waypoint[] {
    return this.points;
  }

  clearPoints(): void {
    this.points = [];
    this.waypointEmitter.emit(new WaypointUpdate(UpdateType.CLEAR));
  }
}
