import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { DigimonDetails } from '../../dtos/digimon.dto';
import { DigimonList } from '../../dtos/digimon-list.dto';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  getDigimonList({ page = 0, pageSize = 20 }): Observable<DigimonList> {
    return this.http
      .get<DigimonList>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`)
      .pipe(first());
  }

  search(name: string): Observable<DigimonList> {
    return this.http
      .get<DigimonList>(`${this.baseUrl}?name=${name}`)
      .pipe(first());
  }

  getDigimonDetails(id: number): Observable<DigimonDetails> {
    return this.http.get<DigimonDetails>(`${this.baseUrl}/${id}`).pipe(first());
  }
}
