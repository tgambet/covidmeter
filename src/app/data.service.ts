import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Country {
  country: string;
  countryInfo: {
    iso2: string;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
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
    return this.httpClient.get('https://corona.lmao.ninja/countries') as Observable<Country[]>;
  }

  getHistorical(): Observable<any> {
    return this.httpClient.get('https://corona.lmao.ninja/v2/historical');
  }

  getGeoJson(): Observable<any> {
    return this.httpClient.get('/assets/countries.geo.json');
  }
}
