export interface PokemonResponse {
  next: string;
  results: PokemonResultType[];
}

export interface PokemonResultType {
  name: string;
  url: string;
}

export interface PokemonType {
  name: string;
  sprites: {
    front_default: string;
  };
  abilities: [
    ability: {
      name: string;
      url: string;
    }
  ];
  types: {
    type: {
      name: string;
    };
  }[];
}
