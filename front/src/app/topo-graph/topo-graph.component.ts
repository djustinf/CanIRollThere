import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoordinateService } from '../coordinate.service';
import { WaypointUpdate, UpdateType } from '../waypoint-update';
import { Waypoint } from '../waypoint';

@Component({
  selector: 'app-topo-graph',
  templateUrl: './topo-graph.component.html',
  styleUrls: ['./topo-graph.component.css']
})
export class TopoGraphComponent implements OnInit, OnDestroy {
  coordinateService: CoordinateService;
  data: any[];
  cumulativeDist: number;
  lastWaypoint?: Waypoint;
  waypointSub!: Subscription;

  // options
  legend: boolean = false;
  showLabels: boolean = false;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Distance (km)';
  yAxisLabel: string = 'Elevation (m)';
  timeline: boolean = false;
  autoScale: boolean = true;
  colorScheme = {
    // color matches map waypoints
    domain: ['#3388FF']
  };

  constructor(
    coordinateService: CoordinateService,
  ) {
    this.coordinateService = coordinateService;
    this.data = [{ name: 'Elevation', series: [] }];
    this.cumulativeDist = 0;
  }

  ngOnInit(): void {
    this.waypointSub = this.coordinateService.waypointEmitter.subscribe((waypointUpdate: WaypointUpdate) => {
      switch (waypointUpdate.updateType) {
        case UpdateType.ADD:
          const waypoint = waypointUpdate.waypoint;
          if (waypoint) {
            if (this.lastWaypoint) {
              this.cumulativeDist += waypoint.distanceTo(this.lastWaypoint);
            }
            this.data[0].series = [...this.data[0].series, ...[{ name: this.cumulativeDist, value: waypoint.alt }]];
            this.data = [...this.data];
            this.lastWaypoint = waypoint;
          } else {
            console.warn('Topo graph was sent an undefined waypoint...');
          }
          break;
        case UpdateType.CLEAR:
          this.data = [{ name: 'Elevation', series: [] }];
          this.lastWaypoint = undefined;
          this.cumulativeDist = 0;
          break;
        case UpdateType.REMOVE:
          console.log('Topo graph can\'t remove waypoints yet.');
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.waypointSub.unsubscribe();
  }
}
