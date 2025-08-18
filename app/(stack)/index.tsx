import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Hash, LogOut, Trophy, User, Users } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, userProfile, logout, loading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' }
      ]
    );
  };

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

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Ahorcado</Text>
          <Text style={styles.subtitle}>Multijugador</Text>
          {user && userProfile && (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>¡Hola, {userProfile.displayName}!</Text>
              <Text style={styles.statsText}>
                Jugadas: {userProfile.gamesPlayed} | Ganadas: {userProfile.gamesWon} | Perdidas: {userProfile.gamesLost}
              </Text>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menu}>
          {!user ? (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => router.push('/auth/login')}
            >
              <User color="#fff" size={24} />
              <Text style={styles.menuButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => router.push('/rooms/create')}
              >
                <Users color="#fff" size={24} />
                <Text style={styles.menuButtonText}>
                  Crear Sala
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => router.push('/rooms/join')}
              >
                <Hash color="#fff" size={24} />
                <Text style={styles.menuButtonText}>
                  Unirse a Sala
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuButton, styles.disabledButton]}
                disabled
              >
                <Trophy color="#aaa" size={24} />
                <Text style={[styles.menuButtonText, styles.disabledText]}>
                  Ranking (Próximamente)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <LogOut color="#fff" size={24} />
                <Text style={styles.menuButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </>
          )}

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Versión 1.0.0 - Empezando paso a paso
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
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
  },
  userInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  menu: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  disabledText: {
    color: '#aaa',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#e0e7ff',
    fontSize: 12,
    textAlign: 'center',
  },
});