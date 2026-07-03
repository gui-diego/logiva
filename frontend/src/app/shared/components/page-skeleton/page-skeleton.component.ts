import { Component, Input } from '@angular/core';

export type SkeletonVariant = 'dashboard' | 'table' | 'detail' | 'form';

@Component({
  selector: 'app-page-skeleton',
  standalone: true,
  templateUrl: './page-skeleton.component.html',
  styleUrl: './page-skeleton.component.scss',
})
export class PageSkeletonComponent {
  @Input() variant: SkeletonVariant = 'table';
}
