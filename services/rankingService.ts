import { 
  collection, 
  getDocs,
  query, 
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface RankingUser {
  id: string;
  displayName: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  points: number;
}

type RankingType = 'wins' | 'winRate' | 'points';

export class RankingService {
  private static usersCollection = collection(db, 'users');

  // Obtener ranking según el tipo
  static async getRanking(type: RankingType, limitCount: number = 50): Promise<RankingUser[]> {
    try {
      let q;
      
      switch (type) {
        case 'wins':
          q = query(
            this.usersCollection,
            where('gamesPlayed', '>', 0),
            orderBy('gamesWon', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'points':
          q = query(
            this.usersCollection,
            where('gamesPlayed', '>', 0),
            orderBy('points', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'winRate':
        default:
          // Para tasa de victoria, necesitamos obtener todos y calcular
          q = query(
            this.usersCollection,
            where('gamesPlayed', '>=', 5), // Mínimo 5 partidas para aparecer en ranking de tasa
            orderBy('gamesPlayed', 'desc'),
            limit(100) // Obtenemos más para luego ordenar por tasa
          );
          break;
      }

      const querySnapshot = await getDocs(q);
      
      let users: RankingUser[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const gamesPlayed = data.gamesPlayed || 0;
        const gamesWon = data.gamesWon || 0;
        const gamesLost = data.gamesLost || 0;
        const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
        
        return {
          id: doc.id,
          displayName: data.displayName || 'Usuario',
          avatar: data.avatar || '🎯',
          gamesPlayed,
          gamesWon,
          gamesLost,
          winRate,
          points: data.points || 0,
        };
      });

      // Si es ranking por tasa de victoria, ordenar manualmente
      if (type === 'winRate') {
        users = users
          .sort((a, b) => {
            if (b.winRate === a.winRate) {
              return b.gamesWon - a.gamesWon; // Desempate por victorias
            }
            return b.winRate - a.winRate;
          })
          .slice(0, limitCount);
      }

      return users;
    } catch (error) {
      console.error('Error getting ranking:', error);
      return [];
    }
  }

  // Obtener posición de un usuario específico
  static async getUserRanking(userId: string, type: RankingType): Promise<number> {
    try {
      const allUsers = await this.getRanking(type, 1000); // Obtener más usuarios para encontrar la posición
      const userIndex = allUsers.findIndex(user => user.id === userId);
      return userIndex >= 0 ? userIndex + 1 : -1; // Retorna -1 si no se encuentra
    } catch (error) {
      console.error('Error getting user ranking:', error);
      return -1;
    }
  }

  // Obtener estadísticas globales
  static async getGlobalStats(): Promise<{
    totalPlayers: number;
    totalGames: number;
    averageWinRate: number;
  }> {
    try {
      const querySnapshot = await getDocs(this.usersCollection);
      
      let totalPlayers = 0;
      let totalGames = 0;
      let totalWins = 0;
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.gamesPlayed > 0) {
          totalPlayers++;
          totalGames += data.gamesPlayed || 0;
          totalWins += data.gamesWon || 0;
        }
      });

      const averageWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      return {
        totalPlayers,
        totalGames,
        averageWinRate,
      };
    } catch (error) {
      console.error('Error getting global stats:', error);
      return {
        totalPlayers: 0,
        totalGames: 0,
        averageWinRate: 0,
      };
    }
  }
}