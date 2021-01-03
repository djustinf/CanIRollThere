export class Waypoint {
  readonly lat: number;
  readonly lon: number;
  readonly elev: number;

  constructor(
    lat: number,
    lon: number,
    elev: number,
  ) {
    this.lat = lat;
    this.lon = lon;
    this.elev = elev;
  }
}
