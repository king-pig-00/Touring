import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { User } from '../../models';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);

    private token: string | null = null; // Replace with your token management

    // Example method to check if the token is valid
    isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    // Method to get the token from local storage or wherever you're storing it
    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    // Method to check if the token is expired
    private isTokenExpired(token: string): boolean {
        const expirationDate = this.getTokenExpirationDate(token);
        return expirationDate ? expirationDate < new Date() : true;
    }

    // Method to decode the token and get the expiration date
    private getTokenExpirationDate(token: string): Date | null {
        const decoded = this.decodeToken(token);
        if (decoded.exp === undefined) return null;

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }

    // Method to decode the JWT token
    private decodeToken(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('JWT malformed');
        }
        const payload = parts[1];
        return JSON.parse(atob(payload));
    }

    signin(email: string, password: string) {
        let params = new HttpParams();
        params = params.append('email', email);
        params = params.append('password', password);
        return this.http.post<{
            success: boolean;
            data: any;
            error?: string;
        }>(`${ApiRoutes.auth}login`, { email, password });
    }
}
