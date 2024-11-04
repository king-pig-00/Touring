import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, StorageService } from './core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'Touring';

    constructor(
        private router: Router,
        private tokenService: AuthService,
        private storageService: StorageService
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.checkTokenAndRedirect(event.url);
            }
        });
    }

    ngOnInit() {
        const initialUrl = this.router.url;
        this.checkTokenAndRedirect(initialUrl);
    }

    checkTokenAndRedirect(url: string) {
        if (this.tokenService.isAuthenticated()) {
            if (url === '/home' || url === '/') {
                this.router.navigate([
                    this.storageService.getItem('redirectUrl'),
                ]);
            }
        } else {
            this.router.navigate(['/home']);
        }
    }
}
