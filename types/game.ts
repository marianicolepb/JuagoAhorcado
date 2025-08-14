export interface Room {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  currentWord?: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  currentPlayerIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: Date;
}

export interface Word {
  id: string;
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface GameState {
  word: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  currentPlayerIndex: number;
  status: 'playing' | 'won' | 'lost';
  winner?: string;
}