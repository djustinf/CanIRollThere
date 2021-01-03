import { Injectable } from '@angular/core';
import { Point } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private points: Point[];

  constructor() { 
    this.points = [];
  }

  addPoint(x: number, y: number) {
    this.points.push(new Point(x, y));
  }

  getPoints(): Point[] {
    return this.points;
  }

  clearPoints(): void {
    this.points = [];
  }
}
