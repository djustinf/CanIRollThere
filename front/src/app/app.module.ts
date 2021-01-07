import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';
import { TopoGraphComponent } from './topo-graph/topo-graph.component';
import { DifficultyComponent } from './difficulty/difficulty.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    BottomBarComponent,
    InteractiveMapComponent,
    TopoGraphComponent,
    DifficultyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
