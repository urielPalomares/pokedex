import { Component, Input, Inject, Optional, Output, EventEmitter, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../models/pokemon.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pokemon-result',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatChipsModule, MatProgressBarModule, CommonModule],
  templateUrl: './pokemon-result.html',
  styleUrls: ['./pokemon-result.scss']
})
export class PokemonResult implements OnInit {
  @Input() pokemon!: Pokemon;
  @Input() getTypeColor!: (type: string) => string;
  @Input() getPokemonImageUrl!: (pokemon: Pokemon) => string;
  @Input() formatStatName!: (name: string) => string;
  @Input() getStatPercentage!: (value: number) => number;
  @Input() getStatColor!: (value: number) => string;
  @Input() hasAdditionalSprites!: (pokemon: Pokemon) => boolean;
  @Output() back = new EventEmitter<void>();

  mainSpriteUrl: string = '';
  spriteList: string[] = [];
  currentSpriteIndex: number = 0;
  autoCarouselInterval: any;
  autoCarouselActive: boolean = true;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<PokemonResult>
  ) {
    if (data) {
      this.pokemon = data.pokemon;
      this.getTypeColor = data.getTypeColor;
      this.getPokemonImageUrl = data.getPokemonImageUrl;
      this.formatStatName = data.formatStatName;
      this.getStatPercentage = data.getStatPercentage;
      this.getStatColor = data.getStatColor;
      this.hasAdditionalSprites = data.hasAdditionalSprites;
    }
  }

  ngOnInit() {
    this.mainSpriteUrl = this.getPokemonImageUrl(this.pokemon);
    this.spriteList = this.getAvailableSprites();
    this.currentSpriteIndex = 0;
    this.setMainSprite(this.spriteList[0]);
    this.startAutoCarousel();
  }

  startAutoCarousel() {
    this.autoCarouselActive = true;
    this.autoCarouselInterval = setInterval(() => {
      if (this.autoCarouselActive && this.spriteList.length > 1) {
        this.nextSprite();
      }
    }, 4000);
  }

  stopAutoCarousel() {
    this.autoCarouselActive = false;
    if (this.autoCarouselInterval) clearInterval(this.autoCarouselInterval);
  }

  nextSprite() {
    this.stopAutoCarousel();
    this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteList.length;
    this.setMainSprite(this.spriteList[this.currentSpriteIndex]);
  }

  prevSprite() {
    this.stopAutoCarousel();
    this.currentSpriteIndex = (this.currentSpriteIndex - 1 + this.spriteList.length) % this.spriteList.length;
    this.setMainSprite(this.spriteList[this.currentSpriteIndex]);
  }

  selectSprite(idx: number) {
    this.stopAutoCarousel();
    this.currentSpriteIndex = idx;
    this.setMainSprite(this.spriteList[idx]);
  }

  get hasPrev() {
    return this.spriteList.length > 1;
  }

  get hasNext() {
    return this.spriteList.length > 1;
  }

  get prevSpriteUrl() {
    return this.spriteList[(this.currentSpriteIndex - 1 + this.spriteList.length) % this.spriteList.length];
  }

  get nextSpriteUrl() {
    return this.spriteList[(this.currentSpriteIndex + 1) % this.spriteList.length];
  }

  setMainSprite(url: string) {
    this.mainSpriteUrl = url;
  }

  closeModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  goBack() {
    this.back.emit();
  }

  getAvailableSprites(): string[] {
    const sprites = this.pokemon.sprites;
    const urls: string[] = [];
    if (sprites.front_default) urls.push(sprites.front_default);
    if (sprites.back_default) urls.push(sprites.back_default);
    if (sprites.front_shiny) urls.push(sprites.front_shiny);
    if (sprites.back_shiny) urls.push(sprites.back_shiny);
    const mainUrl = this.getPokemonImageUrl(this.pokemon);
    if (mainUrl && !urls.includes(mainUrl)) {
      urls.unshift(mainUrl);
    }
    return urls;
  }

} 