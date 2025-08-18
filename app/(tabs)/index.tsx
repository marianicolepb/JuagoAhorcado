import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Hash, Users, Gamepad2, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🎯 Ahorcado</Text>
            <Text style={styles.subtitle}>Multijugador</Text>
            <Text style={styles.welcomeText}>¡Bienvenido al mejor juego de ahorcado!</Text>
          </View>

          <View style={styles.menu}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => router.push('/(stack)/auth/login')}
            >
              <Text style={styles.menuButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuButton, styles.secondaryButton]}
              onPress={() => router.push('/(stack)/auth/register')}
            >
              <Text style={styles.menuButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎯 Ahorcado</Text>
            <Text style={styles.subtitle}>Multijugador</Text>
            {userProfile && (
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>¡Hola, {userProfile.displayName}!</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userProfile.gamesPlayed}</Text>
                    <Text style={styles.statLabel}>Jugadas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userProfile.gamesWon}</Text>
                    <Text style={styles.statLabel}>Ganadas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userProfile.gamesLost}</Text>
                    <Text style={styles.statLabel}>Perdidas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userProfile.coins || 0}</Text>
                    <Text style={styles.statLabel}>Monedas</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Game Modes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Modos de Juego</Text>
            
            <TouchableOpacity 
              style={[styles.gameMode, styles.competitiveMode]}
              onPress={() => router.push('/(stack)/game/mode-select?mode=competitive')}
            >
              <View style={styles.gameModeIcon}>
                <Zap color="#fff" size={32} />
              </View>
              <View style={styles.gameModeInfo}>
                <Text style={styles.gameModeTitle}>Competitivo</Text>
                <Text style={styles.gameModeDescription}>
                  Cada jugador tiene su tablero. ¡Gana quien adivine primero!
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gameMode, styles.cooperativeMode]}
              onPress={() => router.push('/(stack)/game/mode-select?mode=cooperative')}
            >
              <View style={styles.gameModeIcon}>
                <Users color="#fff" size={32} />
              </View>
              <View style={styles.gameModeInfo}>
                <Text style={styles.gameModeTitle}>Cooperativo</Text>
                <Text style={styles.gameModeDescription}>
                  Trabajen juntos en un solo tablero. ¡Unidos somos más fuertes!
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gameMode, styles.singleMode]}
              onPress={() => router.push('/(stack)/game/single')}
            >
              <View style={styles.gameModeIcon}>
                <Gamepad2 color="#fff" size={32} />
              </View>
              <View style={styles.gameModeInfo}>
                <Text style={styles.gameModeTitle}>Solitario</Text>
                <Text style={styles.gameModeDescription}>
                  Practica contra la máquina. ¡Perfecciona tu técnica!
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(stack)/rooms/create')}
              >
                <Users color="#10b981" size={24} />
                <Text style={styles.quickActionText}>Crear Sala</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(stack)/rooms/join')}
              >
                <Hash color="#10b981" size={24} />
                <Text style={styles.quickActionText}>Unirse</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  gameMode: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  competitiveMode: {
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  cooperativeMode: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
  },
  singleMode: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },
  gameModeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameModeInfo: {
    flex: 1,
  },
  gameModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameModeDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menu: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  menuButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});