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
        const expectedRoleId = next.data['roleId'] as number;
        const userRoleId = this.authService.getRoleId();
        if (userRoleId !== expectedRoleId) {
            this.router.navigate(['/unauthorized']);
            return false;
        }

        return true;
    }
}
