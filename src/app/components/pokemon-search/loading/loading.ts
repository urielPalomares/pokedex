import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './loading.html',
  styleUrls: ['./loading.scss']
})
export class Loading {} 