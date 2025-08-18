import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageCircle,
  Trophy,
  User,
  Send
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { FriendsService } from '@/services/friendsService';

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

export default function FriendsScreen() {
  const { user, userProfile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsList = await FriendsService.getFriends(user.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await FriendsService.searchUsers(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    
    try {
      await FriendsService.sendFriendRequest(user.uid, friendId);
      Alert.alert('¡Éxito!', 'Solicitud de amistad enviada');
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
    }
  };

  const handleInviteToGame = (friend: Friend) => {
    Alert.alert(
      'Invitar a Jugar',
      `¿Quieres invitar a ${friend.displayName} a una partida?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Invitar', 
          onPress: () => {
            // TODO: Implementar invitación a juego
            Alert.alert('Función en desarrollo', 'Próximamente podrás invitar amigos directamente');
          }
        }
      ]
    );
  };

  const getWinRate = (won: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((won / total) * 100);
  };

  if (!user) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Inicia sesión para ver tus amigos</Text>
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
            <Text style={styles.title}>👥 Amigos</Text>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearch(true)}
            >
              <Search color="#fff" size={20} />
              <Text style={styles.searchButtonText}>Buscar Amigos</Text>
            </TouchableOpacity>
          </View>

          {/* Friends List */}
          <View style={styles.friendsSection}>
            <Text style={styles.sectionTitle}>
              Mis Amigos ({friends.length})
            </Text>
            
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Users color="#94a3b8" size={48} />
                <Text style={styles.emptyStateText}>
                  Aún no tienes amigos agregados
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Busca usuarios y agrégalos como amigos para jugar juntos
                </Text>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map((friend) => (
                  <View key={friend.id} style={styles.friendCard}>
                    <View style={styles.friendInfo}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
                        <View style={[
                          styles.onlineIndicator,
                          { backgroundColor: friend.isOnline ? '#10b981' : '#6b7280' }
                        ]} />
                      </View>
                      
                      <View style={styles.friendDetails}>
                        <Text style={styles.friendName}>{friend.displayName}</Text>
                        <Text style={styles.friendStats}>
                          {friend.gamesPlayed} jugadas • {getWinRate(friend.gamesWon, friend.gamesPlayed)}% victorias
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.friendActions}>
                      <TouchableOpacity 
                        style={styles.friendActionButton}
                        onPress={() => handleInviteToGame(friend)}
                      >
                        <Send color="#10b981" size={16} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.friendActionButton}
                        onPress={() => {
                          setSelectedUser(friend);
                          setShowUserProfile(true);
                        }}
                      >
                        <User color="#3b82f6" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <Text style={styles.modalTitle}>🔍 Buscar Usuarios</Text>
            
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Nombre de usuario..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity 
                style={styles.searchInputButton}
                onPress={handleSearch}
                disabled={loading}
              >
                <Search color="#fff" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.searchResults}>
              {searchResults.map((result) => (
                <View key={result.id} style={styles.searchResultCard}>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultAvatar}>{result.avatar}</Text>
                    <View style={styles.searchResultDetails}>
                      <Text style={styles.searchResultName}>{result.displayName}</Text>
                      <Text style={styles.searchResultStats}>
                        {result.gamesPlayed} jugadas • {getWinRate(result.gamesWon, result.gamesPlayed)}% victorias
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addFriendButton}
                    onPress={() => handleAddFriend(result.id)}
                  >
                    <UserPlus color="#fff" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSearch(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        visible={showUserProfile}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            {selectedUser && (
              <>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileAvatar}>{selectedUser.avatar}</Text>
                  <Text style={styles.profileName}>{selectedUser.displayName}</Text>
                </View>

                <View style={styles.profileStats}>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{selectedUser.gamesPlayed}</Text>
                    <Text style={styles.profileStatLabel}>Jugadas</Text>
                  </View>
                  
                  <View style={styles.profileStatItem}>
                    <Text style={[styles.profileStatNumber, styles.winStat]}>{selectedUser.gamesWon}</Text>
                    <Text style={styles.profileStatLabel}>Ganadas</Text>
                  </View>
                  
                  <View style={styles.profileStatItem}>
                    <Text style={[styles.profileStatNumber, styles.lossStat]}>{selectedUser.gamesLost}</Text>
                    <Text style={styles.profileStatLabel}>Perdidas</Text>
                  </View>
                  
                  <View style={styles.profileStatItem}>
                    <Text style={[styles.profileStatNumber, styles.rateStat]}>
                      {getWinRate(selectedUser.gamesWon, selectedUser.gamesPlayed)}%
                    </Text>
                    <Text style={styles.profileStatLabel}>Tasa de Victoria</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowUserProfile(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 20,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 32,
    width: 48,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  friendStats: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  friendActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchModal: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  profileModal: {
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
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  searchInputButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    maxHeight: 300,
    marginBottom: 20,
  },
  searchResultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  searchResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchResultAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  searchResultStats: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  addFriendButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    fontSize: 60,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  profileStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 20,
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
  profileStatLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    textAlign: 'center',
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