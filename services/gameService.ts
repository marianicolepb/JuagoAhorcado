import { 
  doc, 
  updateDoc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Room } from '@/types/game';

export class GameService {
  // Hacer una jugada (adivinar letra)
  static async makeGuess(roomId: string, letter: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('La sala no existe');
    }

    const roomData = roomDoc.data() as Room;
    
    if (roomData.status !== 'playing') {
      throw new Error('El juego no está activo');
    }

    if (!roomData.currentWord) {
      throw new Error('No hay palabra asignada');
    }

    // Verificar si la letra ya fue adivinada
    if (roomData.guessedLetters.includes(letter)) {
      throw new Error('Esta letra ya fue seleccionada');
    }

    const newGuessedLetters = [...roomData.guessedLetters, letter];
    let newWrongGuesses = roomData.wrongGuesses;
    let newCurrentPlayerIndex = roomData.currentPlayerIndex;
    let newStatus: Room['status'] = roomData.status; // ✅ Tipo correcto

    // Verificar si la letra está en la palabra
    const isCorrectGuess = roomData.currentWord.includes(letter);
    
    if (!isCorrectGuess) {
      newWrongGuesses += 1;
    }

    // Cambiar turno al siguiente jugador
    newCurrentPlayerIndex = (roomData.currentPlayerIndex + 1) % roomData.players.length;

    // Verificar condiciones de victoria o derrota
    const wordLetters = roomData.currentWord.split('');
    const hasWon = wordLetters.every(wordLetter => newGuessedLetters.includes(wordLetter));
    const hasLost = newWrongGuesses >= roomData.maxWrongGuesses;

    if (hasWon || hasLost) {
      newStatus = 'finished';
      
      // Si ganaron, actualizar estadísticas de todos los jugadores
      await this.updatePlayerStats(
        roomData.players.map(p => p.id),
        hasWon
      );
    }

    // Actualizar la sala
    await updateDoc(roomRef, {
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      currentPlayerIndex: newCurrentPlayerIndex,
      status: newStatus,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Actualizar estadísticas de los jugadores
  private static async updatePlayerStats(playerIds: string[], won: boolean): Promise<void> {
    const updatePromises = playerIds.map(async (playerId) => {
      const userRef = doc(db, 'users', playerId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newGamesPlayed = (userData.gamesPlayed || 0) + 1;
        const newGamesWon = won ? (userData.gamesWon || 0) + 1 : (userData.gamesWon || 0);
        
        await updateDoc(userRef, {
          gamesPlayed: newGamesPlayed,
          gamesWon: newGamesWon
        });
      }
    });

    await Promise.all(updatePromises);
  }

  // Reiniciar juego (solo host)
  static async restartGame(roomId: string, newWord: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    
    await updateDoc(roomRef, {
      status: 'playing',
      currentWord: newWord.toLowerCase(),
      guessedLetters: [],
      wrongGuesses: 0,
      currentPlayerIndex: 0,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Obtener estado actual del juego
  static async getGameState(roomId: string): Promise<Room | null> {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }

    const data = roomDoc.data();
    return {
      id: roomDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      players: data.players.map((player: any) => ({
        ...player,
        joinedAt: player.joinedAt.toDate()
      }))
    } as Room;
  }
}
