import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Room, Player } from '@/types/game';

export class RoomService {
  private static roomsCollection = collection(db, 'rooms');

  // Generar código único de 6 caracteres
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Crear nueva sala
  static async createRoom(hostId: string, hostName: string, category: string = 'todas', difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const code = this.generateRoomCode();
    
    // Verificar que el código no exista
    const existingRoom = await this.getRoomByCode(code);
    if (existingRoom) {
      // Si existe, generar otro código recursivamente
      return this.createRoom(hostId, hostName, category, difficulty);
    }

    const roomData: Omit<Room, 'id'> = {
      code,
      hostId,
      hostName,
      category,
      difficulty,
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        isOnline: true,
        joinedAt: new Date()
      }],
      status: 'waiting',
      maxPlayers: 6,
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses: 6,
      currentPlayerIndex: 0,
      hintUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(this.roomsCollection, {
      ...roomData,
      createdAt: Timestamp.fromDate(roomData.createdAt),
      updatedAt: Timestamp.fromDate(roomData.updatedAt),
      players: roomData.players.map(player => ({
        ...player,
        joinedAt: Timestamp.fromDate(player.joinedAt)
      }))
    });

    return docRef.id;
  }

  // Buscar sala por código
  static async getRoomByCode(code: string): Promise<Room | null> {
    const q = query(this.roomsCollection, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      players: data.players.map((player: any) => ({
        ...player,
        joinedAt: player.joinedAt.toDate()
      }))
    } as Room;
  }

  // Unirse a una sala
  static async joinRoom(roomId: string, playerId: string, playerName: string): Promise<boolean> {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('La sala no existe');
    }

    const roomData = roomDoc.data() as Room;
    
    if (roomData.players.length >= roomData.maxPlayers) {
      throw new Error('La sala está llena');
    }

    if (roomData.status !== 'waiting') {
      throw new Error('La partida ya comenzó');
    }

    // Verificar si el jugador ya está en la sala
    const playerExists = roomData.players.some(p => p.id === playerId);
    if (playerExists) {
      throw new Error('Ya estás en esta sala');
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isOnline: true,
      joinedAt: new Date()
    };

    await updateDoc(roomRef, {
      players: arrayUnion({
        ...newPlayer,
        joinedAt: Timestamp.fromDate(newPlayer.joinedAt)
      }),
      updatedAt: Timestamp.fromDate(new Date())
    });

    return true;
  }

  // Salir de una sala
  static async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return;
    }

    const roomData = roomDoc.data() as Room;
    const playerToRemove = roomData.players.find(p => p.id === playerId);
    
    if (!playerToRemove) {
      return;
    }

    // Si es el host y hay otros jugadores, transferir host al siguiente
    if (playerToRemove.isHost && roomData.players.length > 1) {
      const newHost = roomData.players.find(p => p.id !== playerId);
      if (newHost) {
        const updatedPlayers = roomData.players.map(p => ({
          ...p,
          isHost: p.id === newHost.id
        })).filter(p => p.id !== playerId);

        await updateDoc(roomRef, {
          hostId: newHost.id,
          hostName: newHost.name,
          players: updatedPlayers.map(player => ({
            ...player,
            joinedAt: Timestamp.fromDate(player.joinedAt)
          })),
          updatedAt: Timestamp.fromDate(new Date())
        });
        return;
      }
    }

    // Si es el último jugador o el único, eliminar la sala
    if (roomData.players.length <= 1) {
      await deleteDoc(roomRef);
      return;
    }

    // Remover jugador de la sala
    await updateDoc(roomRef, {
      players: arrayRemove({
        ...playerToRemove,
        joinedAt: Timestamp.fromDate(playerToRemove.joinedAt)
      }),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Escuchar cambios en una sala
  static subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    const roomRef = doc(db, 'rooms', roomId);
    
    return onSnapshot(roomRef, (doc) => {
      if (!doc.exists()) {
        callback(null);
        return;
      }

      const data = doc.data();
      const room: Room = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        players: data.players.map((player: any) => ({
          ...player,
          joinedAt: player.joinedAt.toDate()
        }))
      } as Room;

      callback(room);
    });
  }

  // Iniciar juego (solo host)
  static async startGame(roomId: string, word: string, hint: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    
    await updateDoc(roomRef, {
      status: 'playing',
      currentWord: word.toLowerCase(),
      currentHint: hint,
      guessedLetters: [],
      wrongGuesses: 0,
      currentPlayerIndex: 0,
      hintUsed: false,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }
}