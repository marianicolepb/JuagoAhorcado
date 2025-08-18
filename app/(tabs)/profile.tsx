import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Mail, 
  Trophy, 
  Settings, 
  LogOut, 
  Edit3,
  Key,
  Coins
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';

const AVATARS = [
  '🎯', '🎮', '🎲', '🎪', '🎨', '🎭'
];

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || '🎯');

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

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        'Correo Enviado',
        'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo de restablecimiento');
    }
  };

  const getWinRate = () => {
    if (!userProfile || userProfile.gamesPlayed === 0) return 0;
    return Math.round((userProfile.gamesWon / userProfile.gamesPlayed) * 100);
  };

  if (!user || !userProfile) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setShowAvatarPicker(true)}
            >
              <Text style={styles.avatar}>{userProfile.avatar || '🎯'}</Text>
              <View style={styles.editAvatarIcon}>
                <Edit3 color="#fff" size={12} />
              </View>
            </TouchableOpacity>
            <Text style={styles.displayName}>{userProfile.displayName}</Text>
            <Text style={styles.email}>{userProfile.email}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userProfile.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Partidas Jugadas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.winStat]}>{userProfile.gamesWon}</Text>
                <Text style={styles.statLabel}>Ganadas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.lossStat]}>{userProfile.gamesLost}</Text>
                <Text style={styles.statLabel}>Perdidas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.rateStat]}>{getWinRate()}%</Text>
                <Text style={styles.statLabel}>Tasa de Victoria</Text>
              </View>
            </View>
          </View>

          {/* Coins */}
          <View style={styles.coinsSection}>
            <View style={styles.coinsHeader}>
              <Coins color="#fbbf24" size={24} />
              <Text style={styles.coinsTitle}>Monedas</Text>
            </View>
            <Text style={styles.coinsAmount}>{userProfile.coins || 0}</Text>
            <Text style={styles.coinsDescription}>
              Gana monedas jugando partidas y úsalas para comprar pistas extras
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowSettings(true)}
            >
              <Settings color="#10b981" size={20} />
              <Text style={styles.actionButtonText}>Configuración</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <LogOut color="#ef4444" size={20} />
              <Text style={[styles.actionButtonText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <Text style={styles.modalTitle}>⚙️ Configuración</Text>
            
            <TouchableOpacity 
              style={styles.settingOption}
              onPress={handlePasswordReset}
            >
              <Key color="#10b981" size={20} />
              <Text style={styles.settingOptionText}>Cambiar Contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModal}>
            <Text style={styles.modalTitle}>🎭 Elige tu Avatar</Text>
            
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.selectedAvatarOption
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarOptionText}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.avatarModalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAvatarPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  // TODO: Guardar avatar en Firestore
                  setShowAvatarPicker(false);
                }}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    width: 100,
    height: 100,
    textAlign: 'center',
    lineHeight: 100,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  winStat: {
    color: '#10b981',
  },
  lossStat: {
    color: '#ef4444',
  },
  rateStat: {
    color: '#fbbf24',
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  coinsSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
  },
  coinsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  coinsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  coinsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 8,
  },
  coinsDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  settingsModal: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  avatarModal: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  settingOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  avatarOptionText: {
    fontSize: 24,
  },
  avatarModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});