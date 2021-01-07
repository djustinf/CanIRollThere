import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoordinateService } from '../coordinate.service';
import { Waypoint } from '../waypoint';
import { WaypointUpdate, UpdateType } from '../waypoint-update';

@Component({
  selector: 'app-difficulty',
  templateUrl: './difficulty.component.html',
  styleUrls: ['./difficulty.component.css']
})
export class DifficultyComponent implements OnInit, OnDestroy {
  coordinateService: CoordinateService;
  waypointSub!: Subscription;
  lastWaypoint?: Waypoint;
  slopes: number[];

  constructor(
    coordinateService: CoordinateService,
  ) {
    this.coordinateService = coordinateService;
    this.slopes = [];
  }

  ngOnInit(): void {
    this.waypointSub = this.coordinateService.waypointEmitter.subscribe((waypointUpdate: WaypointUpdate) => {
      switch (waypointUpdate.updateType) {
        case UpdateType.ADD:
          const waypoint = waypointUpdate.waypoint;
          if (waypoint) {
            if (this.lastWaypoint) {
              const slope = waypoint.slopeWithWaypoint(this.lastWaypoint);
              this.slopes.push(slope);
            }
            this.lastWaypoint = waypoint;
          } else {
            console.warn('Difficulty was sent an undefined waypoint...');
          }
          break;
        case UpdateType.CLEAR:
          this.slopes = [];
          this.lastWaypoint = undefined;
          break;
        case UpdateType.REMOVE:
          console.log('Difficulty can\'t remove waypoints yet.');
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.waypointSub.unsubscribe();
  }
}
