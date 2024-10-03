import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map, startWith } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';

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
    @Input() displayMenuButton = false;
    @Output() menuButtonClick = new EventEmitter<void>();
    isAdmin$ = true;
    isAgent$ = false;
    user$ = 'sda';

    desktopUserMenu$: Observable<
        {
            label: string;
            escape: boolean;
            routerLink?: string;
            command?: () => void;
        }[]
    > = combineLatest([this.user$]).pipe(
        map(([user]) => {
            if (user) {
                return [
                    {
                        label: this.createMenuItemTemplate(
                            'Account',
                            '/assets/icons/ic_nav_mobile_account.svg'
                        ),
                        escape: false,
                        routerLink: '/agent/profile',
                        // isAgent || isAdmin
                        //     ?
                        //     : '/user/profile',
                    },
                    {
                        label: this.createMenuItemTemplate(
                            'Logout',
                            'pi-sign-out'
                        ),
                        escape: false,
                        command: () => {
                            // this.logout();
                        },
                    },
                ];
            } else {
                return [
                    {
                        label: this.createMenuItemTemplate(
                            'Login',
                            'pi-sign-in'
                        ),
                        escape: false,
                        command: () => {
                            // this.login();
                        },
                    },
                ];
            }
        })
    );
    mobileMenu$: Observable<
        {
            label: string;
            escape: boolean;
            routerLink?: string;
            command?: () => void;
        }[]
    > = combineLatest([this.user$]).pipe(
        map(([user]) => {
            if (user) {
                return [
                    // {
                    //     label: this.createMenuItemTemplate(
                    //         'Account',
                    //         '/assets/icons/ic_nav_mobile_account.svg'
                    //     ),
                    //     escape: false,
                    //     routerLink:
                    //         isAgent || isAdmin
                    //             ? '/agent/profile'
                    //             : '/user/profile',
                    // },
                    {
                        label: this.createMenuItemTemplate(
                            'Logout',
                            'pi-sign-out'
                        ),
                        escape: false,
                        command: () => {
                            // this.logout();
                        },
                    },
                ];
            } else {
                return [
                    {
                        label: this.createMenuItemTemplate(
                            'Login',
                            'pi-sign-in'
                        ),
                        escape: false,
                        command: () => {
                            // this.login();
                        },
                    },
                ];
            }
        })
    );

    login(): void {
        // this.authService.login();
    }

    logout(): void {
        // this.authService.logout();
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
