import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-operator',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './operator.component.html',
    styleUrl: './operator.component.scss',
})
export class OperatorComponent {}
