import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface navop {
    displayName: string;
    path: string;
    badge?: number;
}

@Component({
    selector: 'app-company-settings',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './company-settings.component.html',
    styleUrls: ['../../operator.scss', './company-settings.component.scss'],
})
export class CompanySettingsComponent {
    companySettingsNavOptions: navop[] = [
        {
            displayName: 'Company Info',
            path: './company-info',
        },
        {
            displayName: 'Departments',
            path: './departments',
        },
        {
            displayName: 'Positions',
            path: './positions',
        },
    ];
}
