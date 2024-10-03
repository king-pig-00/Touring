import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-company-settings',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './company-settings.component.html',
    styleUrl: './company-settings.component.scss',
})
export class CompanySettingsComponent {}
