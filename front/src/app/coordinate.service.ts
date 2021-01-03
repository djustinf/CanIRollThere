import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Waypoint } from './waypoint';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  // TODO: Move to a better pattern once we have more API calls and this is being hosted
  private ELEVATION_API = 'http://localhost:5000/elevation';
  private points: Waypoint[];

  constructor(
    private httpClient: HttpClient,
  ) {
    this.points = [];
  }

  addPoint(x: number, y: number): void {
    this.httpClient.get<string>(this.ELEVATION_API, { params: { lat: x.toString(), lon: y.toString() } })
      .subscribe((elev: string) => {
        this.points.push(new Waypoint(x, y, +elev));
      });
  }

  getPoints(): Waypoint[] {
    return this.points;
  }

  clearPoints(): void {
    this.points = [];
  }
}
