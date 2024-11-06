import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageService } from '../../manage.service';
import { map } from 'rxjs';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    imports: [CommonModule, FormsModule, InputTextareaModule],
})
export class NotesComponent {
    manageService = inject(ManageService);

    bookingNotes$ = this.manageService.bookingNotes$.pipe(
        map((bookingNotes) => bookingNotes || '')
    );

    onModelChange(notes: string): void {
        this.manageService.updateBookingNotes(notes);
    }
}
