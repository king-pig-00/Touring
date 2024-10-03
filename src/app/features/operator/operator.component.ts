import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { NavbarComponent } from '@app/shared';
// import { Features, UserState, checkPageAccess, isWeb } from '@app/core';
import { Observable, map } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    standalone: true,
    selector: 'app-operator',
    templateUrl: './operator.component.html',
    styleUrls: ['./operator.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        SidebarModule,
        NavbarComponent,
    ],
})
export class OperatorComponent {
    navOptions: {
        displayName: string;
        path: string;
        icon: string;
    }[] = [
        {
            displayName: 'Company Settings',
            path: './company-settings',
            icon: 'pi-building-columns',
        },
        {
            displayName: 'User Management',
            path: './user-management',
            icon: 'pi-users',
        },
    ];

    drawerExpanded = true;
    mobileDrawerIsOpen = false;

    toggleDrawerExpanded(): void {
        this.drawerExpanded = !this.drawerExpanded;
    }
    openMobileDrawer(): void {
        this.mobileDrawerIsOpen = true;
    }
}
