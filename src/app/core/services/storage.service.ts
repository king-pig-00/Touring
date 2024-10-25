import { Injectable } from '@angular/core';

type StorageKeys =
    | 'authToken'
    | 'userName'
    | 'lastSearchParams'
    | 'redirectPostLogIn'
    | 'skipLoginSuccess';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    setItem(key: StorageKeys, value: string): void {
        console.log(value);
        localStorage.setItem(key, value);
    }

    getItem(key: StorageKeys): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: StorageKeys): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}
