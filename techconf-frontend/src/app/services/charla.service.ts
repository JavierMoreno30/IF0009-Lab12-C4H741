import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Asistente {
  id?: number;
  nombre: string;
  correo: string;
  edad: number;
}

export interface Charla {
  id?: number;
  titulo: string;
  expositor: string;
  nivel: string;
  emailContacto: string;
  fechaInicio: string;  //formato YYYY-MM-DD
  fechaFin: string;     //formato YYYY-MM-DD
  etiquetas: string[];  //arreglo dinámico de strings
  asistentes?: Asistente[];
}

@Injectable({
  providedIn: 'root'
})
export class CharlaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/charlas';

  getCharlas(): Observable<Charla[]> {
    return this.http.get<Charla[]>(this.apiUrl);
  }

  registrarCharla(charla: Charla): Observable<Charla> {
    return this.http.post<Charla>(this.apiUrl, charla);
  }

  // Devuelve la charla completa con su lista de asistentes ya actualizada
  inscribirAsistente(charlaId: number, asistente: Asistente): Observable<Charla> {
    return this.http.post<Charla>(`${this.apiUrl}/${charlaId}/asistentes`, asistente);
  }
}