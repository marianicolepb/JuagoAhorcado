import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Hash, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { RoomService } from '@/services/roomService';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (!user || !userProfile) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a una sala');
      return;
    }

    if (!roomCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de la sala');
      return;
    }

    if (roomCode.trim().length !== 6) {
      Alert.alert('Error', 'El código debe tener exactamente 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const room = await RoomService.getRoomByCode(roomCode.trim().toUpperCase());
      
      if (!room) {
        Alert.alert('Error', 'No se encontró una sala con ese código');
        return;
      }

      await RoomService.joinRoom(room.id, user.uid, userProfile.displayName);
      
      Alert.alert(
        '¡Éxito!', 
        `Te has unido a la sala de ${room.hostName}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.replace({
              pathname: "/(stack)/rooms/lobby",
              params: { roomId: room.id }
            }) 
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error uniéndose a la sala:', error);
      Alert.alert('Error', error.message || 'No se pudo unir a la sala');
    } finally {
      setLoading(false);
    }
  };

  const formatRoomCode = (text: string) => {
    const cleaned = text.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setRoomCode(cleaned);
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Users color="#fff" size={48} />
            <Text style={styles.title}>Unirse a Sala</Text>
            <Text style={styles.subtitle}>
              Ingresa el código de 6 caracteres para unirte a una partida
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Hash color="#94a3b8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="CÓDIGO"
                placeholderTextColor="#94a3b8"
                value={roomCode}
                onChangeText={formatRoomCode}
                autoCapitalize="characters"
                maxLength={6}
                textAlign="center"
              />
            </View>
            
            <Text style={styles.inputHint}>
              El código debe tener exactamente 6 caracteres (letras y números)
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>¿Cómo funciona?</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Pide al host de la sala que te comparta el código
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Ingresa el código de 6 caracteres en el campo de arriba
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Presiona &quot;Unirse&quot; y espera a que comience la partida
              </Text>
            </View>
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={[
              styles.joinButton, 
              (loading || roomCode.length !== 6) && styles.joinButtonDisabled
            ]}
            onPress={handleJoinRoom}
            disabled={loading || roomCode.length !== 6}
          >
            <ArrowRight color="#fff" size={24} />
            <Text style={styles.joinButtonText}>
              {loading ? 'Uniéndose...' : 'Unirse a Sala'}
            </Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 60,
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  inputHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 24,
  },
  joinButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  joinButtonDisabled: {
    opacity: 0.4,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
