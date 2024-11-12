import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    standalone: true,
    selector: 'app-loader-embed',
    templateUrl: './loader-embed.component.html',
    styleUrls: ['./loader-embed.component.scss'],
    imports: [CommonModule],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class LoaderEmbedComponent {
    @Input() isDisplayed = false;
    // headerLogo = `${environment.cruiseCodeApiBaseUrl}${Assets.headers.cruiseCodeLogoTransparent}`;
}
