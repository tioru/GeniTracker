import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'intlDate' })
export class IntlDatePipe implements PipeTransform {
  transform(value: Date | string | null | undefined, lang: string, options: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    const date = typeof value === 'string' && value.length === 10 ? new Date(value + 'T00:00') : new Date(value);
    return new Intl.DateTimeFormat(lang, options).format(date);
  }
}
