import { Waypoint } from './waypoint';

export enum UpdateType {
  ADD,
  REMOVE,
  CLEAR
}

export class WaypointUpdate {
  waypoint?: Waypoint;
  updateType: UpdateType;

  constructor(
    updateType: UpdateType,
    waypoint?: Waypoint,
  ) {
    this.updateType = updateType;
    this.waypoint = waypoint;
  }
}
