import { HangmanDrawing } from '@/components/HangmanDrawing';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { RoomService } from '@/services/roomService';
import { Room } from '@/types/game';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Crown,
  LogOut
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribe = RoomService.subscribeToRoom(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        Alert.alert('Juego terminado', 'La sala ha sido cerrada', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
        return;
      }

      setRoom(updatedRoom);

      // Si el juego terminó, mostrar resultado
      if (updatedRoom.status === 'finished') {
        const isWon = updatedRoom.currentWord && 
          updatedRoom.currentWord.split('').every(letter => 
            updatedRoom.guessedLetters.includes(letter)
          );
        
        Alert.alert(
          isWon ? '¡Ganaron!' : 'Perdieron',
          isWon 
            ? `¡Felicidades! La palabra era: ${updatedRoom.currentWord?.toUpperCase()}`
            : `La palabra era: ${updatedRoom.currentWord?.toUpperCase()}`,
          [
            { text: 'Volver al inicio', onPress: () => router.replace('/') }
          ]
        );
      }
    });

    return unsubscribe;
  }, [roomId, user]);

  const handleLetterGuess = async (letter: string) => {
    if (!room || !user || loading) return;
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== user.uid) {
      Alert.alert('No es tu turno', 'Espera a que sea tu turno para jugar');
      return;
    }

    if (room.guessedLetters.includes(letter.toLowerCase())) {
      Alert.alert('Letra ya usada', 'Esta letra ya fue seleccionada');
      return;
    }

    setLoading(true);
    try {
      await GameService.makeGuess(room.id, letter.toLowerCase());
    } catch (error) {
      console.error('Error making guess:', error);
      Alert.alert('Error', 'No se pudo procesar tu jugada');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Salir del juego',
      '¿Estás seguro de que quieres salir? Esto terminará el juego para todos.',
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

  if (!room || !room.currentWord) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando juego...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentPlayer = room.players[room.currentPlayerIndex];
  const isMyTurn = user?.uid === currentPlayer?.id;
  const displayWord = room.currentWord
    .split('')
    .map(letter => room.guessedLetters.includes(letter) ? letter.toUpperCase() : '_')
    .join(' ');

  const wrongLetters = room.guessedLetters.filter(letter => 
    !room.currentWord!.includes(letter)
  );

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Game Status */}
          <View style={styles.gameStatus}>
            <View style={styles.turnInfo}>
              <Text style={styles.turnLabel}>Turno de:</Text>
              <View style={styles.currentPlayerCard}>
                <View style={styles.playerAvatar}>
                  <Text style={styles.playerAvatarText}>
                    {currentPlayer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.currentPlayerName}>{currentPlayer.name}</Text>
                {currentPlayer.isHost && <Crown color="#fbbf24" size={16} />}
              </View>
            </View>
            
            <View style={styles.gameStats}>
              <Text style={styles.wrongGuesses}>
                Errores: {room.wrongGuesses}/{room.maxWrongGuesses}
              </Text>
            </View>
          </View>

          {/* Hangman Drawing */}
          <View style={styles.hangmanContainer}>
            <HangmanDrawing wrongGuesses={room.wrongGuesses} />
          </View>

          {/* Word Display */}
          <View style={styles.wordContainer}>
            <Text style={styles.word}>{displayWord}</Text>
          </View>

          {/* Wrong Letters */}
          {wrongLetters.length > 0 && (
            <View style={styles.wrongLettersContainer}>
              <Text style={styles.wrongLettersLabel}>Letras incorrectas:</Text>
              <Text style={styles.wrongLetters}>
                {wrongLetters.map(letter => letter.toUpperCase()).join(', ')}
              </Text>
            </View>
          )}

          {/* Alphabet */}
          <View style={styles.alphabetContainer}>
            <Text style={styles.alphabetTitle}>
              {isMyTurn ? 'Selecciona una letra:' : 'Esperando jugada...'}
            </Text>
            <View style={styles.alphabet}>
              {alphabet.map((letter) => {
                const isUsed = room.guessedLetters.includes(letter.toLowerCase());
                const isCorrect = isUsed && room.currentWord!.includes(letter.toLowerCase());
                const isWrong = isUsed && !room.currentWord!.includes(letter.toLowerCase());
                
                return (
                  <TouchableOpacity
                    key={letter}
                    style={[
                      styles.letterButton,
                      isUsed && styles.letterButtonUsed,
                      isCorrect && styles.letterButtonCorrect,
                      isWrong && styles.letterButtonWrong,
                      !isMyTurn && styles.letterButtonDisabled
                    ]}
                    onPress={() => handleLetterGuess(letter)}
                    disabled={isUsed || !isMyTurn || loading}
                  >
                    <Text style={[
                      styles.letterButtonText,
                      isUsed && styles.letterButtonTextUsed
                    ]}>
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Players List */}
          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Jugadores:</Text>
            <View style={styles.playersList}>
              {room.players.map((player, index) => (
                <View 
                  key={player.id} 
                  style={[
                    styles.playerChip,
                    index === room.currentPlayerIndex && styles.playerChipActive
                  ]}
                >
                  <Text style={[
                    styles.playerChipText,
                    index === room.currentPlayerIndex && styles.playerChipTextActive
                  ]}>
                    {player.name}
                  </Text>
                  {player.isHost && <Crown color="#fbbf24" size={12} />}
                </View>
              ))}
            </View>
          </View>

          {/* Leave Button */}
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveGame}
          >
            <LogOut color="#fff" size={20} />
            <Text style={styles.leaveButtonText}>Salir del Juego</Text>
          </TouchableOpacity>
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
  gameStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  turnInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  turnLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  currentPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentPlayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  gameStats: {
    alignItems: 'center',
  },
  wrongGuesses: {
    fontSize: 16,
    color: '#f87171',
    fontWeight: '600',
  },
  hangmanContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
  },
  wrongLettersContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wrongLettersLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  wrongLetters: {
    fontSize: 16,
    color: '#f87171',
    fontWeight: '600',
  },
  alphabetContainer: {
    marginBottom: 20,
  },
  alphabetTitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  alphabet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  letterButtonUsed: {
    opacity: 0.5,
  },
  letterButtonCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10b981',
  },
  letterButtonWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#ef4444',
  },
  letterButtonDisabled: {
    opacity: 0.3,
  },
  letterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  letterButtonTextUsed: {
    color: '#94a3b8',
  },
  playersContainer: {
    marginBottom: 20,
  },
  playersTitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 12,
    fontWeight: '600',
  },
  playersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  playerChipText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  playerChipTextActive: {
    color: '#fff',
    fontWeight: '600',
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