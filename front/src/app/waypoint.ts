import { LatLng } from 'leaflet';

export class Waypoint extends LatLng {
  readonly alt: number;

  constructor(
    lat: number,
    lng: number,
    alt: number,
  ) {
    super(lat, lng);
    this.alt = alt;
  }

  slopeWithWaypoint(waypoint: Waypoint): number {
    const dElev = this.alt - waypoint.alt;

    return dElev / this.distanceTo(waypoint);
  }
}