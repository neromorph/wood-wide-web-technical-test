import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HotelFormComponent } from './hotel-form';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-dialog',
  template: `
    <app-hotel-form [hotel]="data" (formClose)="onFormClose()"></app-hotel-form>
  `,
  standalone: true,
  imports: [CommonModule, HotelFormComponent],
})
export class HotelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HotelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onFormClose(): void {
    this.dialogRef.close(true);
  }
}
