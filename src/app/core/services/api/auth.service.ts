import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ApiRoutes, StorageService } from '@app/core';
import { User } from '../../models';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);

    isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    getRoles(): string[] | null {
        const token = this.getToken();
        if (token) {
            const decodedToken = this.decodeToken(token);
            return decodedToken.roles || null;
        }
        return null;
    }

    private isTokenExpired(token: string): boolean {
        const expirationDate = this.getTokenExpirationDate(token);
        return expirationDate ? expirationDate < new Date() : true;
    }

    private getTokenExpirationDate(token: string): Date | null {
        const decoded = this.decodeToken(token);
        if (decoded.exp === undefined) return null;

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }

    private decodeToken(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('JWT malformed');
        }
        const payload = parts[1];
        return JSON.parse(atob(payload));
    }

    signin(email: string, password: string) {
        return this.http.post<{
            success: boolean;
            data: User;
            error?: string;
        }>(`${ApiRoutes.auth}Signin`, { email, password });
    }

    signup(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        return this.http.post<{
            success: boolean;
            data: User;
            error?: string;
        }>(`${ApiRoutes.auth}Signup`, {
            firstName,
            lastName,
            email,
            password,
        });
    }
}
