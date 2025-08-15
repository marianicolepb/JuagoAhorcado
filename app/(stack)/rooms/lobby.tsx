import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Crown, 
  Play, 
  Copy, 
  Share2, 
  LogOut,
  Clock,
  UserCheck
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { RoomService } from '@/services/roomService';
import { WordService } from '@/services/wordService';
import { Room } from '@/types/game';

export default function LobbyScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId || !user) return;

    // Suscribirse a cambios en tiempo real de la sala
    const unsubscribe = RoomService.subscribeToRoom(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        Alert.alert('Sala cerrada', 'La sala ha sido cerrada por el host', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
        return;
      }

      setRoom(updatedRoom);

      // Si el juego comenzó, navegar a la pantalla de juego
      if (updatedRoom.status === 'playing') {
        router.replace({
          pathname: "/(stack)/game/play",
          params: { roomId: updatedRoom.id }
        });
      }
    });

    return unsubscribe;
  }, [roomId, user]);

  const handleStartGame = async () => {
    if (!room || !user || room.hostId !== user.uid) return;

    if (room.players.length < 2) {
      Alert.alert('Error', 'Necesitas al menos 2 jugadores para comenzar');
      return;
    }

    setLoading(true);
    try {
      // Obtener palabra aleatoria
      const word = await WordService.getRandomWord('medium');
      if (!word) {
        Alert.alert('Error', 'No se pudo obtener una palabra para el juego');
        return;
      }

      await RoomService.startGame(room.id, word.word);
    } catch (error) {
      console.error('Error iniciando juego:', error);
      Alert.alert('Error', 'No se pudo iniciar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Salir de la sala',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            if (room && user) {
              await RoomService.leaveRoom(room.id, user.uid);
            }
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleCopyCode = async () => {
    if (!room) return;
    
    try {
      await Share.share({
        message: `¡Únete a mi partida de Ahorcado!\n\nCódigo: ${room.code}\n\nIngresa este código en la app para jugar conmigo.`,
        title: 'Código de sala - Ahorcado'
      });
    } catch (error) {
      // Fallback para copiar al portapapeles si Share no funciona
      Alert.alert('Código de sala', room.code, [
        { text: 'OK' }
      ]);
    }
  };

  if (!room) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando sala...</Text>
        </View>
      </LinearGradient>
    );
  }

  const isHost = user?.uid === room.hostId;
  const canStartGame = isHost && room.players.length >= 2;

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomCode}>{room.code}</Text>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleCopyCode}
              >
                <Share2 color="#fff" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.roomTitle}>Sala de {room.hostName}</Text>
            <Text style={styles.playerCount}>
              {room.players.length}/{room.maxPlayers} jugadores
            </Text>
          </View>

          {/* Players List */}
          <View style={styles.playersSection}>
            <View style={styles.sectionHeader}>
              <Users color="#fff" size={20} />
              <Text style={styles.sectionTitle}>Jugadores</Text>
            </View>
            
            <View style={styles.playersList}>
              {room.players.map((player, index) => (
                <View key={player.id} style={styles.playerCard}>
                  <View style={styles.playerInfo}>
                    <View style={styles.playerAvatar}>
                      <Text style={styles.playerAvatarText}>
                        {player.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.playerDetails}>
                      <View style={styles.playerNameRow}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        {player.isHost && (
                          <Crown color="#fbbf24" size={16} />
                        )}
                      </View>
                      <Text style={styles.playerStatus}>
                        {player.isOnline ? 'En línea' : 'Desconectado'}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: player.isOnline ? '#10b981' : '#6b7280' }
                  ]} />
                </View>
              ))}
            </View>
          </View>

          {/* Game Info */}
          <View style={styles.gameInfo}>
            <Text style={styles.gameInfoTitle}>Configuración</Text>
            <View style={styles.gameInfoGrid}>
              <View style={styles.gameInfoItem}>
                <Clock color="#94a3b8" size={16} />
                <Text style={styles.gameInfoLabel}>Turnos</Text>
                <Text style={styles.gameInfoValue}>Rotativos</Text>
              </View>
              <View style={styles.gameInfoItem}>
                <UserCheck color="#94a3b8" size={16} />
                <Text style={styles.gameInfoLabel}>Intentos</Text>
                <Text style={styles.gameInfoValue}>6 máximo</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {isHost ? (
              <TouchableOpacity
                style={[
                  styles.startButton,
                  !canStartGame && styles.startButtonDisabled
                ]}
                onPress={handleStartGame}
                disabled={!canStartGame || loading}
              >
                <Play color="#fff" size={24} />
                <Text style={styles.startButtonText}>
                  {loading ? 'Iniciando...' : 'Iniciar Juego'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  Esperando a que {room.hostName} inicie el juego...
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveRoom}
            >
              <LogOut color="#fff" size={20} />
              <Text style={styles.leaveButtonText}>Salir de la Sala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    marginRight: 12,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 16,
    color: '#94a3b8',
  },
  playersSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerDetails: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  playerStatus: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gameInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  gameInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  gameInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameInfoItem: {
    alignItems: 'center',
    gap: 4,
  },
  gameInfoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  gameInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    gap: 16,
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  waitingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  waitingText: {
    color: '#e0e7ff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  leaveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});