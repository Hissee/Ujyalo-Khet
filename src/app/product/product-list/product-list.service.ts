import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IProduct} from '../Iproduct';

@Injectable({
  providedIn: 'root'
})
export class ProductListService {

  private jsonUrl = 'assets/dummydata.json';

  constructor(private http: HttpClient) { }

  listProducts(): Observable<IProduct[]>{
    return this.http.get<IProduct[]>(this.jsonUrl);
  }
}
