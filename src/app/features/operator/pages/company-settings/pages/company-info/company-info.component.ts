import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

import { CompanyInfoState } from './company-info.state';

@Component({
    standalone: true,
    selector: 'app-company-info',
    templateUrl: './company-info.component.html',
    styleUrl: './company-info.component.scss',
    imports: [CommonModule, ReactiveFormsModule],
    providers: [CompanyInfoState],
})
export class CompanyInfoComponent {
    companyInfoState = inject(CompanyInfoState);

    ngOnInit(): void {
        this.companyInfoState.init();
    }
}
