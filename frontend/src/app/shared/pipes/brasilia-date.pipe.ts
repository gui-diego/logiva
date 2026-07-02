import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

const BRASILIA_TZ = 'America/Sao_Paulo';

@Pipe({
  name: 'brasiliaDate',
  standalone: true,
})
export class BrasiliaDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('pt-BR');

  transform(
    value: string | Date | null | undefined,
    format = 'dd/MM/yyyy HH:mm',
  ): string | null {
    if (value == null || value === '') {
      return null;
    }
    return this.datePipe.transform(value, format, BRASILIA_TZ);
  }
}
