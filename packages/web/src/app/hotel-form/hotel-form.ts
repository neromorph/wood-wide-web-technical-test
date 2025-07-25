import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HotelService } from '../hotel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-form',
  templateUrl: './hotel-form.html',
  styleUrls: ['./hotel-form.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class HotelFormComponent {
  @Input() hotel: any = { name: '', location: '', description: '' };
  @Output() formClose = new EventEmitter<void>();

  constructor(private hotelService: HotelService) { }

  saveHotel(): void {
    if (this.hotel.id) {
      this.hotelService.updateHotel(this.hotel.id, this.hotel.name, this.hotel.location, this.hotel.description).subscribe(() => {
        this.formClose.emit();
      });
    } else {
      this.hotelService.createHotel(this.hotel.name, this.hotel.location, this.hotel.description).subscribe(() => {
        this.formClose.emit();
      });
    }
  }
}