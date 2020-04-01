import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {HttpClientModule} from '@angular/common/http';
import {BarComponent} from './bar.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {reducers} from './store';
import {CoreEffects} from './store/core.effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {OverviewComponent} from './overview.component';
import {CountriesComponent} from './countries.component';
import {RouterModule, Routes} from '@angular/router';
import {WorldComponent} from './world.component';
import {CountryComponent} from './country.component';
import {MapComponent} from './map.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {AboutComponent} from './about.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ChartComponent} from './chart.component';

const MATERIAL_MODULES = [
  // DragDropModule,
  MatButtonModule,
  // MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  // MatMenuModule,
  // MatTabsModule,
  MatToolbarModule,
  // MatProgressBarModule,
  // MatSidenavModule,
  // MatSlideToggleModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCardModule,
  MatInputModule,
  MatExpansionModule
];

const routes: Routes = [
  {path: '', component: WorldComponent},
  {path: 'country/:name', component: CountryComponent},
  {path: 'map', component: MapComponent},
  {path: 'about', component: AboutComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    OverviewComponent,
    CountriesComponent,
    WorldComponent,
    CountryComponent,
    MapComponent,
    AboutComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {}),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot(reducers, {}),
    StoreDevtoolsModule.instrument({maxAge: 100, logOnly: environment.production}),
    EffectsModule.forRoot([CoreEffects]),
    BrowserAnimationsModule,
    ...MATERIAL_MODULES
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
