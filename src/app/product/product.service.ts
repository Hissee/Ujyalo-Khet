import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IProduct} from './Iproduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private jsonUrl = 'assets/dummydata.json';

  constructor(private http: HttpClient) { }

  listProducts(): Observable<IProduct[]>{
    return this.http.get<IProduct[]>(this.jsonUrl);
  }

  getDetail(id: number): Observable<IProduct>{
    return this.http.get<IProduct>(this.jsonUrl + '/' + id);
  }
}
