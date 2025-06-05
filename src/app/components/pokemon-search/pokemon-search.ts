import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Header } from './header/header';
import { SearchBox } from './search-box/search-box';
import { Loading } from './loading/loading';
import { Error } from './error/error';
import { PokemonResult } from './pokemon-result/pokemon-result';
import { Pokemon } from '../../models/pokemon.interface';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    SearchBox,
    Loading,
    Error,
    PokemonResult,
  ],
  templateUrl: './pokemon-search.html',
  styleUrls: ['./pokemon-search.scss']
})
export class PokemonSearch implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9\s-]+$/)
  ]);

  pokemon: Pokemon | null = null;
  error: { message: string; status: number } | null = null;
  loading: Observable<boolean>;
  hasSearched = false;

  suggestedPokemon = [
    'Pikachu',
    'Charizard',
    'Bulbasaur',
    'Mewtwo',
    'Eevee'
  ];

  constructor(private pokemonService: PokemonService) {
    this.loading = this.pokemonService.loading$;
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value && value.trim().length > 0 && this.searchControl.valid) {
        this.searchPokemon(value.trim());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchPokemon(identifier: string): void {
    this.hasSearched = true;
    this.error = null;
    this.pokemon = null;
    this.pokemonService.getPokemon(identifier).subscribe({
      next: (pokemon) => {
        this.pokemon = pokemon;
      },
      error: (error) => {
        this.error = error;
      }
    });
  }

  searchSuggestedPokemon(name: string): void {
    this.searchControl.setValue(name);
    this.searchPokemon(name);
  }

  clearSearch(): void {
    this.searchControl.reset();
    this.pokemon = null;
    this.error = null;
    this.hasSearched = false;
  }

  getTypeColor(type: string): string {
    return this.pokemonService.getTypeColor(type);
  }

  formatStatName(statName: string): string {
    return this.pokemonService.formatStatName(statName);
  }

  getStatPercentage(value: number): number {
    const maxStat = 160;
    return Math.min(100, (value / maxStat) * 100);
  }

  getPokemonImageUrl(pokemon: Pokemon): string {
    return pokemon.sprites.other['official-artwork'].front_default || 
           pokemon.sprites.front_default || 
           'assets/images/pokemon-placeholder.png';
  }

  onSubmit(): void {
    if (this.searchControl.valid && this.searchControl.value) {
      this.searchPokemon(this.searchControl.value!);
    }
  }

  searchRandomPokemon(): void {
    const randomIndex = Math.floor(Math.random() * this.suggestedPokemon.length);
    const randomName = this.suggestedPokemon[randomIndex];
    this.searchControl.setValue(randomName);
    this.searchPokemon(randomName);
  }

  getFormErrorMessage(): string {
    if (this.searchControl.hasError('required')) {
      return 'Por favor ingresa un nombre o ID de Pokémon';
    }
    if (this.searchControl.hasError('pattern')) {
      return 'Solo se permiten letras, números, espacios y guiones';
    }
    return '';
  }

  getStatColor(value: number): string {
    if (value >= 100) return '#2ecc71';
    if (value >= 80) return '#3498db';
    if (value >= 60) return '#f1c40f';
    if (value >= 40) return '#e67e22';
    return '#e74c3c';
  }

  hasAdditionalSprites(pokemon: Pokemon): boolean {
    return !!(pokemon.sprites.front_default || 
              pokemon.sprites.back_default || 
              pokemon.sprites.front_shiny || 
              pokemon.sprites.back_shiny);
  }
}