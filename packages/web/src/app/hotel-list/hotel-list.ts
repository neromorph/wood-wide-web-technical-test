import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HotelService } from '../hotel.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.html',
  styleUrls: ['./hotel-list.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
})
export class HotelListComponent implements OnInit {
  @Output() edit = new EventEmitter<any>();
  hotels: any[] = [];
  allHotels: any[] = [];
  filteredHotels: any[] = [];
  searchTerm: string = '';
  sortKey: string = 'name';
  totalHotels: number = 0;
  pageSize: number | 'all' = 10;
  currentPage: number = 0;
  pageSizes: (number | 'all')[] = [10, 20, 50, 'all'];

  constructor(
    private hotelService: HotelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    const limit = this.pageSize === 'all' ? undefined : this.pageSize;
    const offset =
      this.pageSize === 'all' ? 0 : this.currentPage * (this.pageSize as number);

    this.hotelService
      .getHotels(limit, offset, this.searchTerm)
      .subscribe((data) => {
        this.allHotels = data.hotels;
        this.totalHotels = data.totalHotels;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.allHotels];

    filtered.sort((a, b) => {
      if (a[this.sortKey] < b[this.sortKey]) return -1;
      if (a[this.sortKey] > b[this.sortKey]) return 1;
      return 0;
    });

    this.filteredHotels = filtered;
  }

  search(): void {
    this.currentPage = 0;
    this.loadHotels();
  }

  sort(): void {
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize as number | 'all';
    this.loadHotels();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadHotels();
  }

  deleteHotel(hotel: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: hotel,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hotelService.deleteHotel(hotel.id).subscribe(() => {
          this.snackBar.open('Data deleted successfully!', 'Close', {
            duration: 3000,
          });
          this.loadHotels();
        });
      }
    });
  }

  editHotel(hotel: any): void {
    this.edit.emit(hotel);
  }
}