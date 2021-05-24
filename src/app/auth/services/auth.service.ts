import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { AuthResponse, User } from '../interfaces/interfaces';
import { map, catchError, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;
  private _user!: User;

  get User() {
    return { ...this._user };
  }

  constructor(private http: HttpClient) { }

  register(name: string, email: string, password: string) {
    const url = `${this.baseUrl}/auth/new`;
    const body = { name, email, password };

    return this.http.post<AuthResponse>(url, body)
      .pipe(
        tap( ({ ok, token }) => {
          if (ok) {
            localStorage.setItem('token', token!);
          }
        }),
        map( resp => resp.ok),
        catchError(err => of(err.error.msg))
      );
    
  }

  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password};

    return this.http.post<AuthResponse>(url, body)
      .pipe(
        tap( resp => {
          if (resp.ok) {
            localStorage.setItem('token', resp.token!);
          }
        }),
        map( resp => resp.ok),
        catchError(err => of(err.error.msg))
      );
  }

  validateToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get<AuthResponse>(url, { headers })
      .pipe(
        map( res => {
          localStorage.setItem('token', res.token!);
          this._user = { 
            name: res.name!,
            uid: res.uid!,
            email: res.email!
          }          
          return res.ok;
        }),
        catchError( err => of(false))
      );
  }

  logout() {
    localStorage.clear();
    //localStorage.removeItem('token');
  }
}
