import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Play, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { RoomService } from '@/services/roomService';
import { WordService } from '@/services/wordService';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleCreateRoom = async () => {
    if (!user || !userProfile) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una sala');
      return;
    }

    setLoading(true);
    try {
      // Inicializar palabras si es necesario
      await WordService.initializeWords();
      
      // Crear la sala
      const roomId = await RoomService.createRoom(user.uid, userProfile.displayName);
      
      Alert.alert(
        '¡Sala creada!', 
        'Tu sala ha sido creada exitosamente. Los jugadores pueden unirse usando el código que aparecerá en pantalla.',
        [
          { text: 'OK', onPress: () => router.replace(`/rooms/lobby?roomId=${roomId}`) }
        ]
      );
      
    } catch (error) {
      console.error('Error creando sala:', error);
      Alert.alert('Error', 'No se pudo crear la sala. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = [
    { key: 'easy', label: 'Fácil', description: 'Palabras cortas y comunes', color: '#10b981' },
    { key: 'medium', label: 'Medio', description: 'Palabras de dificultad moderada', color: '#f59e0b' },
    { key: 'hard', label: 'Difícil', description: 'Palabras largas y complejas', color: '#ef4444' }
  ];

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
            <Text style={styles.title}>Crear Nueva Sala</Text>
            <Text style={styles.subtitle}>
              Configura tu sala de juego y invita a tus amigos
            </Text>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings color="#fff" size={20} />
              <Text style={styles.sectionTitle}>Dificultad</Text>
            </View>
            
            <View style={styles.difficultyContainer}>
              {difficultyOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.difficultyOption,
                    difficulty === option.key && styles.difficultyOptionSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setDifficulty(option.key as any)}
                >
                  <View style={styles.difficultyHeader}>
                    <Text style={[
                      styles.difficultyLabel,
                      difficulty === option.key && styles.difficultyLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    <View style={[styles.difficultyIndicator, { backgroundColor: option.color }]} />
                  </View>
                  <Text style={[
                    styles.difficultyDescription,
                    difficulty === option.key && styles.difficultyDescriptionSelected
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Game Info */}
          <View style={styles.gameInfo}>
            <Text style={styles.gameInfoTitle}>Configuración del Juego</Text>
            <View style={styles.gameInfoItem}>
              <Text style={styles.gameInfoLabel}>Jugadores máximos:</Text>
              <Text style={styles.gameInfoValue}>6</Text>
            </View>
            <View style={styles.gameInfoItem}>
              <Text style={styles.gameInfoLabel}>Intentos fallidos:</Text>
              <Text style={styles.gameInfoValue}>6</Text>
            </View>
            <View style={styles.gameInfoItem}>
              <Text style={styles.gameInfoLabel}>Turnos:</Text>
              <Text style={styles.gameInfoValue}>Rotativos</Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateRoom}
            disabled={loading}
          >
            <Play color="#fff" size={24} />
            <Text style={styles.createButtonText}>
              {loading ? 'Creando Sala...' : 'Crear Sala'}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  difficultyContainer: {
    gap: 12,
  },
  difficultyOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e7ff',
  },
  difficultyLabelSelected: {
    color: '#fff',
  },
  difficultyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  difficultyDescriptionSelected: {
    color: '#e0e7ff',
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
  gameInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameInfoLabel: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  gameInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});