import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Endpoint } from '../const/end-point';

export interface Province {
  id: number;
  name: string;
  nameNp?: string;
  nameEn?: string;
}

export interface District {
  id: number;
  name: string;
  nameNp?: string;
  nameEn?: string;
}

export interface Municipality {
  id: number;
  name: string;
  nameNp?: string;
  nameEn?: string;
}

export interface Ward {
  id: number;
  name: string;
  nameNp?: string;
  nameEn?: string;
}

export interface LocationResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getProvinces(lang: string = 'en'): Observable<Province[]> {
    return this.http.get<LocationResponse<Province[]>>(Endpoint.GET_PROVINCES, {
      params: { lang }
    }).pipe(
      map(response => response.data || [])
    );
  }

  getDistrictsByProvince(provinceId: number, lang: string = 'en'): Observable<District[]> {
    return this.http.get<LocationResponse<District[]>>(
      Endpoint.GET_DISTRICTS_BY_PROVINCE(provinceId),
      { params: { lang } }
    ).pipe(
      map(response => response.data || [])
    );
  }

  getMunicipalitiesByDistrict(districtId: number, lang: string = 'en'): Observable<Municipality[]> {
    return this.http.get<LocationResponse<Municipality[]>>(
      Endpoint.GET_MUNICIPALITIES_BY_DISTRICT(districtId),
      { params: { lang } }
    ).pipe(
      map(response => response.data || [])
    );
  }

  getWardsByMunicipality(municipalityId: number, lang: string = 'en'): Observable<Ward[]> {
    return this.http.get<LocationResponse<Ward[]>>(
      Endpoint.GET_WARDS_BY_MUNICIPALITY(municipalityId),
      { params: { lang } }
    ).pipe(
      map(response => response.data || [])
    );
  }

  getAllLocations(lang: string = 'en'): Observable<any> {
    return this.http.get<LocationResponse<any>>(Endpoint.GET_ALL_LOCATIONS, {
      params: { lang }
    }).pipe(
      map(response => response.data || [])
    );
  }
}

