import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface OverviewData {
  country: string;
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
  updated: number;
}

export interface Country extends OverviewData {
  countryInfo: {
    iso2: string;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  };
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get('https://corona.lmao.ninja/v2/countries') as Observable<Country[]>;
  }

  getYesterdayCountries(): Observable<Country[]> {
    return this.httpClient.get('https://corona.lmao.ninja/v2/countries?yesterday=1').pipe(
      map((countries: Country[]) => countries.filter(c => c.country !== 'World'))
    );
  }

  getHistorical(): Observable<any> {
    return this.httpClient.get('https://corona.lmao.ninja/v2/historical?lastdays=60').pipe(
      map((countries: Country[]) => countries.filter(c => c.country !== 'World'))
    );
  }

  getGeoJson(): Observable<any> {
    return this.httpClient.get('/assets/countries.geo.json');
  }

  getFranceGeoJson(): Observable<any> {
    return this.httpClient.get('/assets/france.min.geo.json');
  }

  getFranceData(): Observable<string> {
    return this.httpClient.get('https://www.data.gouv.fr/fr/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7', {responseType: 'text'});
  }
}
