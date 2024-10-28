import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { AuthService, StorageService } from '@app/core';
import { UserState } from '@app/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        DividerModule,
        MenuModule,
        OverlayPanelModule,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    userState = inject(UserState);
    authService = inject(AuthService);
    storageService = inject(StorageService);

    @Input() displayMenuButton = false;
    @Output() menuButtonClick = new EventEmitter<void>();
    isAdmin$ = true;
    isAgent$ = false;

    userName$ = new BehaviorSubject<string | undefined>(undefined);

    ngOnInit(): void {
        const userName = this.storageService.getItem('userName');
        if (userName) {
            this.userName$.next(userName);
        }
    }

    login(): void {
        // this.authService.login();
    }

    signout(): void {
        this.userState.signout();
    }

    onMenuButtonClick(): void {
        this.menuButtonClick.emit();
    }

    navigateToProfile(): void {
        // this.router.navigate(['/operator/profile']);
    }

    private createMenuItemTemplate(name: string, iconName: string): string {
        return `
          <a class="menu-item-link">
              <i class="pi ${iconName}"></i>
              <span>${name}</span>
          </a>
      `;
    }
}
