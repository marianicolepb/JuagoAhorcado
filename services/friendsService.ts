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
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Friend {
  id: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
}

interface SearchResult {
  id: string;
  displayName: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export class FriendsService {
  private static friendsCollection = collection(db, 'friends');
  private static friendRequestsCollection = collection(db, 'friendRequests');
  private static usersCollection = collection(db, 'users');

  // Buscar usuarios por nombre
  static async searchUsers(searchTerm: string): Promise<SearchResult[]> {
    try {
      const q = query(
        this.usersCollection,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          avatar: data.avatar || '🎯',
          gamesPlayed: data.gamesPlayed || 0,
          gamesWon: data.gamesWon || 0,
          gamesLost: data.gamesLost || 0,
        };
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Enviar solicitud de amistad
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    if (fromUserId === toUserId) {
      throw new Error('No puedes agregarte a ti mismo como amigo');
    }

    // Verificar si ya son amigos
    const existingFriendship = await this.checkFriendship(fromUserId, toUserId);
    if (existingFriendship) {
      throw new Error('Ya son amigos');
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await this.checkPendingRequest(fromUserId, toUserId);
    if (existingRequest) {
      throw new Error('Ya existe una solicitud pendiente');
    }

    // Obtener datos del usuario que envía la solicitud
    const fromUserDoc = await getDoc(doc(this.usersCollection, fromUserId));
    if (!fromUserDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const fromUserData = fromUserDoc.data();

    // Crear solicitud de amistad
    await addDoc(this.friendRequestsCollection, {
      fromUserId,
      toUserId,
      fromUserName: fromUserData.displayName,
      fromUserAvatar: fromUserData.avatar || '🎯',
      status: 'pending',
      createdAt: Timestamp.fromDate(new Date())
    });
  }

  // Verificar si ya son amigos
  private static async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
    const q1 = query(
      this.friendsCollection,
      where('userId1', '==', userId1),
      where('userId2', '==', userId2)
    );
    
    const q2 = query(
      this.friendsCollection,
      where('userId1', '==', userId2),
      where('userId2', '==', userId1)
    );

    const [result1, result2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    return !result1.empty || !result2.empty;
  }

  // Verificar solicitud pendiente
  private static async checkPendingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    const q = query(
      this.friendRequestsCollection,
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Obtener solicitudes de amistad recibidas
  static async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const q = query(
        this.friendRequestsCollection,
        where('toUserId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          fromUserName: data.fromUserName,
          fromUserAvatar: data.fromUserAvatar,
          status: data.status,
          createdAt: data.createdAt.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  }

  // Aceptar solicitud de amistad
  static async acceptFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(this.friendRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Solicitud no encontrada');
    }

    const requestData = requestDoc.data();
    
    // Crear relación de amistad
    await addDoc(this.friendsCollection, {
      userId1: requestData.fromUserId,
      userId2: requestData.toUserId,
      createdAt: Timestamp.fromDate(new Date())
    });

    // Marcar solicitud como aceptada
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Rechazar solicitud de amistad
  static async rejectFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(this.friendRequestsCollection, requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Obtener lista de amigos
  static async getFriends(userId: string): Promise<Friend[]> {
    try {
      const q1 = query(
        this.friendsCollection,
        where('userId1', '==', userId)
      );
      
      const q2 = query(
        this.friendsCollection,
        where('userId2', '==', userId)
      );

      const [result1, result2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const friendIds: string[] = [];
      
      result1.docs.forEach(doc => {
        friendIds.push(doc.data().userId2);
      });
      
      result2.docs.forEach(doc => {
        friendIds.push(doc.data().userId1);
      });

      // Obtener datos de los amigos
      const friendsData: Friend[] = [];
      
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(this.usersCollection, friendId));
        if (friendDoc.exists()) {
          const data = friendDoc.data();
          friendsData.push({
            id: friendId,
            displayName: data.displayName,
            avatar: data.avatar || '🎯',
            isOnline: data.isOnline || false,
            gamesPlayed: data.gamesPlayed || 0,
            gamesWon: data.gamesWon || 0,
            gamesLost: data.gamesLost || 0,
          });
        }
      }

      return friendsData;
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  // Eliminar amigo
  static async removeFriend(userId: string, friendId: string): Promise<void> {
    const q1 = query(
      this.friendsCollection,
      where('userId1', '==', userId),
      where('userId2', '==', friendId)
    );
    
    const q2 = query(
      this.friendsCollection,
      where('userId1', '==', friendId),
      where('userId2', '==', userId)
    );

    const [result1, result2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    const deletePromises: Promise<void>[] = [];
    
    result1.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    result2.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
  }
}