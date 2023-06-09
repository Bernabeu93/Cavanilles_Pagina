import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AlumnoCrear } from './../alumnos';
import { alumnos } from './../mock-alumnos';
import { MensajeService } from './mensaje.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {

  private alumnosUrl = 'api/alumnos';  // URL del API web

  constructor(
    private http: HttpClient,
    private mensajeService: MensajeService
  ) { }

  // Método para mostrar mensajes en el servicio de mensajes
  private log(mensaje: string) {
    this.mensajeService.agregarMensaje(`AlumnosService: ${mensaje}`);
  }

  // Obtiene la lista de alumnos
  getAlumnos(): Observable<AlumnoCrear[]> {
    // Agrega un mensaje al servicio de mensajes
    this.mensajeService.agregarMensaje('Servicio de Alumnos: Alumnos recuperados');

    // Realiza una solicitud HTTP GET para obtener la lista de alumnos del servidor
    return this.http.get<AlumnoCrear[]>(this.alumnosUrl)
      .pipe(
        // Ejecuta una acción secundaria (tap) para registrar un mensaje en el log cuando los alumnos se recuperan correctamente
        tap(_ => this.log('Alumnos recuperados')),

        // Maneja cualquier error que pueda ocurrir durante la solicitud HTTP
        catchError(this.handleError<AlumnoCrear[]>('getAlumnos', []))
      );
  }

  // Maneja el error en la solicitud HTTP y devuelve un resultado predeterminado
  private handleError<T>(operation = 'operación', result?: T) {
    return (error: any): Observable<T> => {
      // Registra el error en la consola
      console.error(error);

      // Agrega un mensaje de error al servicio de mensajes
      this.log(`${operation} fallida: ${error.message}`);

      // Devuelve un resultado predeterminado utilizando el operador 'of' de RxJS
      return of(result as T);
    };
  }

  // Obtiene un alumno por su ID
  getAlumno(id: number): Observable<AlumnoCrear> {
    const url = `${this.alumnosUrl}/${id}`;

    // Realiza una solicitud HTTP GET para obtener el alumno del servidor
    return this.http.get<AlumnoCrear>(url)
      .pipe(
        // Ejecuta una acción secundaria (tap) para registrar un mensaje en el log cuando se recupera el alumno correctamente
        tap(_ => this.log(`Alumno encontrado ID=${id}`)),

        // Maneja cualquier error que pueda ocurrir durante la solicitud HTTP
        catchError(this.handleError<AlumnoCrear>(`getAlumno id=${id}`))
      );
  }
  
// Actualiza un alumno
  updateAlumno(alumno: AlumnoCrear): Observable<any> {
    const url = `${this.alumnosUrl}/${alumno.id}`;

     return this.http.put(url, alumno)
    .pipe(
      tap(_ => this.log(`Alumno actualizado ID=${alumno.id}`)),
      catchError(this.handleError<any>('updateAlumno'))
  );
}


addAlumno(hero: AlumnoCrear): Observable<any> {
  return this.http.post<AlumnoCrear>(this.alumnosUrl, hero, this.httpOptions)
  .pipe(
    tap((newAlumno: AlumnoCrear) => this.log(`Alumno added w/ id=${newAlumno.id}`)),
    catchError(this.handleError<AlumnoCrear>('addAlumno'))
  );
}


deleteAlumno(alumnos: AlumnoCrear | number): Observable<any> {
  const id = typeof alumnos === 'number' ? alumnos : alumnos.id;
  const url = `${this.alumnosUrl}/${id}`;

  return this.http.delete<AlumnoCrear>(url, this.httpOptions)
  .pipe(
    tap(_ => this.log(`alumno borrado id=${id}`)),
    catchError(this.handleError<AlumnoCrear>('deleteAlumno'))
  );
}

searchAlumno(term: string): Observable<AlumnoCrear[]> {
  if (!term.trim()) {
    // if not search term, return empty hero array.
    return of([]);
  }
  return this.http.get<AlumnoCrear[]>(`${this.alumnosUrl}/?name=${term}`)
  .pipe(
    tap(x => x.length ?
       this.log(`coincidencia alumno "${term}"`) :
       this.log(`aquí no hay alb umnos "${term}"`)),
    catchError(this.handleError<AlumnoCrear[]>('searchAlumno', []))
  );
}

httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
}
