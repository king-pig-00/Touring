import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import { AuthService } from '../services';

@Injectable({
    providedIn: 'root',
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const expectedRoles = next.data['roles'] as string[];
        const userRoles = this.authService.getRoles();

        if (
            userRoles &&
            userRoles?.some((element) => expectedRoles.includes(element))
        ) {
            return true;
        }
        this.router.navigate(['/unauthorized']);
        return false;
    }
}
