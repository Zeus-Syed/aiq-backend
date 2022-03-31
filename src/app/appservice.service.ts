import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppserviceService {
  URL = environment.API_URL;
  constructor( private http: HttpClient ) { }


  getPlantData(): Observable<any> {
    return this.http.get(`${this.URL}`);
  }


}
