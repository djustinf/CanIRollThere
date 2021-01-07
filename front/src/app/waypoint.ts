export class Waypoint {
  static readonly radius = 6371; // in km
  static readonly mPerKm = 1000;
  readonly lat: number;
  readonly lon: number;
  readonly elev: number;

  static degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  constructor(
    lat: number,
    lon: number,
    elev: number,
  ) {
    this.lat = lat;
    this.lon = lon;
    this.elev = elev;
  }

  distanceToWaypoint(waypoint: Waypoint): number {
    const dLat = Waypoint.degreesToRadians(this.lat - waypoint.lat);
    const dLon = Waypoint.degreesToRadians(this.lon - waypoint.lon);

    const lat1 = Waypoint.degreesToRadians(waypoint.lat);
    const lat2 = Waypoint.degreesToRadians(this.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Waypoint.radius * c;
  }

  slopeWithWaypoint(waypoint: Waypoint): number {
    const dElev = this.elev - waypoint.elev;
    const dist =  this.distanceToWaypoint(waypoint) * Waypoint.mPerKm;

    return dElev / dist;
  }
}
