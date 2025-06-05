import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './search-box.html',
  styleUrls: ['./search-box.scss']
})
export class SearchBox {
  @Input() loading = false;
  @Output() search = new EventEmitter<string>();
  @Output() random = new EventEmitter<void>();

  searchControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1)
  ]);

  suggestions = ['pikachu', 'charizard', 'mewtwo', 'rayquaza'];

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const searchValue = this.searchControl.value?.trim();
    
    if (searchValue && this.searchControl.valid) {
      this.search.emit(searchValue);
    } else {
      this.searchControl.markAsTouched();
    }
  }

  onRandom(): void {
    this.random.emit();
  }

  searchSuggested(name: string): void {
    this.searchControl.setValue(name);
    this.search.emit(name);
  }

  getErrorMessage(): string {
    if (this.searchControl.hasError('required')) {
      return 'Por favor ingresa un nombre o ID';
    }
    if (this.searchControl.hasError('minlength')) {
      return 'Mínimo 1 carácter requerido';
    }
    return '';
  }
}