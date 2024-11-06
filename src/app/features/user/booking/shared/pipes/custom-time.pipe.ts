import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    pure: true,
    standalone: true,
    name: 'customTime',
})
export class CustomTimePipe implements PipeTransform {
    transform(time: string): string {
        if (parseInt(time) < 12) {
            return `${time.slice(0, 5)} AM`;
        } else if (parseInt(time) === 12) {
            return `${time.slice(0, 5)} PM`;
        } else {
            const hour = parseInt(time.slice(0, 2)) - 12;
            const min = time.slice(3, 5);
            return `${hour}:${min} PM`;
        }
    }
}
