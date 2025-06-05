import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { Pokemon, ApiError } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly API_URL = 'https://pokeapi.co/api/v2/pokemon';
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPokemon(identifier: string | number): Observable<Pokemon> {
    this.setLoading(true);
    
    const cleanIdentifier = typeof identifier === 'string' 
      ? identifier.toLowerCase().trim() 
      : identifier;

    return this.http.get<Pokemon>(`${this.API_URL}/${cleanIdentifier}`)
      .pipe(
        map(pokemon => this.formatPokemonData(pokemon)),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  private formatPokemonData(pokemon: Pokemon): Pokemon {
    return {
      ...pokemon,
      name: this.capitalizeFirstLetter(pokemon.name),
      height: pokemon.height / 10,
      weight: pokemon.weight / 10,
    };
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    
    return typeColors[type.toLowerCase()] || '#68A090';
  }

  formatStatName(statName: string): string {
    const statNames: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defensa',
      'special-attack': 'At. Especial',
      'special-defense': 'Def. Especial',
      'speed': 'Velocidad'
    };
    
    return statNames[statName] || statName;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage: ApiError;

    if (error.error instanceof ErrorEvent) {
      errorMessage = {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        status: 0
      };
    } else {
      switch (error.status) {
        case 404:
          errorMessage = {
            message: 'Pokémon no encontrado. Verifica el nombre e intenta nuevamente.',
            status: 404
          };
          break;
        case 500:
          errorMessage = {
            message: 'Error interno del servidor. Intenta más tarde.',
            status: 500
          };
          break;
        case 0:
          errorMessage = {
            message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
            status: 0
          };
          break;
        default:
          errorMessage = {
            message: `Error inesperado: ${error.message}`,
            status: error.status
          };
      }
    }

    return throwError(() => errorMessage);
  };

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  isValidPokemonIdentifier(identifier: string): boolean {
    if (!identifier || identifier.trim().length === 0) {
      return false;
    }

    const numericId = Number(identifier);
    if (!isNaN(numericId)) {
      return numericId > 0 && numericId <= 1010;
    }

    const nameRegex = /^[a-zA-Z\-\s]+$/;
    return nameRegex.test(identifier) && identifier.length <= 20;
  }
}