import { Component, OnInit } from '@angular/core';
import { CoordinateService } from '../coordinate.service';

@Component({
  selector: 'app-topo-graph',
  templateUrl: './topo-graph.component.html',
  styleUrls: ['./topo-graph.component.css']
})
export class TopoGraphComponent implements OnInit {
  coordinateService!: CoordinateService;

  constructor(
    coordinateService: CoordinateService,
  ) {
    this.coordinateService = coordinateService;
  }

  ngOnInit(): void {
  }

}
