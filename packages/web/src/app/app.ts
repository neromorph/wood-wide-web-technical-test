import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component, ViewChild } from '@angular/core';
import { HotelListComponent } from './hotel-list/hotel-list';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HotelDialogComponent } from './hotel-form/hotel-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    HotelListComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  @ViewChild(HotelListComponent) hotelList!: HotelListComponent;

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) {}

  openDialog(hotel?: any): void {
    const dialogRef = this.dialog.open(HotelDialogComponent, {
      width: '400px',
      data: hotel ? { ...hotel } : { name: '', location: '', description: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Hotel Data submitted', 'Close', {
          duration: 3000,
        });
        this.hotelList.loadHotels();
      }
    });
  }
}
