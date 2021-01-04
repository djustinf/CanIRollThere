import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoordinateService } from '../coordinate.service';
import { WaypointUpdate, UpdateType } from '../waypoint-update';

@Component({
  selector: 'app-topo-graph',
  templateUrl: './topo-graph.component.html',
  styleUrls: ['./topo-graph.component.css']
})
export class TopoGraphComponent implements OnInit, OnDestroy {
  coordinateService: CoordinateService;
  data: any[];
  waypointSub!: Subscription;

  // options
  legend: boolean = false;
  showLabels: boolean = false;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Waypoints';
  yAxisLabel: string = 'Elevation';
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
  }

  ngOnInit(): void {
    this.waypointSub = this.coordinateService.waypointEmitter.subscribe((waypointUpdate: WaypointUpdate) => {
      switch (waypointUpdate.updateType) {
        case UpdateType.ADD:
          const waypoint = waypointUpdate.waypoint;
          if (waypoint) {
            this.data[0].series = [...this.data[0].series, ...[{ name: `${waypoint.lat},${waypoint.lon}`, value: waypoint.elev }]];
            this.data = [...this.data];
          } else {
            console.warn('Topo graph was sent an undefined waypoint...');
          }
          break;
        case UpdateType.CLEAR:
          this.data = [{ name: 'Elevation', series: [] }];
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
