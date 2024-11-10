import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { User } from '../../models';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    private http = inject(HttpClient);

    getUser() {
        return this.http.get<{
            success: boolean;
            data: User;
            error?: string;
        }>(`${ApiRoutes.user}GetUserInfo`);
    }
}
