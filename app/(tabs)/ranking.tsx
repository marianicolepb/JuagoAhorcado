import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react-native';
import { RankingService } from '@/services/rankingService';

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

export default function RankingScreen() {
  const [rankingType, setRankingType] = useState<RankingType>('wins');
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRankings();
  }, [rankingType]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const data = await RankingService.getRanking(rankingType);
      setRankings(data);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankings();
    setRefreshing(false);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown color="#fbbf24" size={24} />;
      case 2:
        return <Medal color="#e5e7eb" size={24} />;
      case 3:
        return <Award color="#cd7c2f" size={24} />;
      default:
        return <Text style={styles.rankNumber}>{position}</Text>;
    }
  };

  const getRankingTitle = () => {
    switch (rankingType) {
      case 'wins':
        return '🏆 Más Victorias';
      case 'winRate':
        return '📊 Mejor Tasa de Victoria';
      case 'points':
        return '⭐ Más Puntos';
      default:
        return '🏆 Ranking';
    }
  };

  const getRankingValue = (user: RankingUser) => {
    switch (rankingType) {
      case 'wins':
        return `${user.gamesWon} victorias`;
      case 'winRate':
        return `${user.winRate}% tasa`;
      case 'points':
        return `${user.points} puntos`;
      default:
        return '';
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{getRankingTitle()}</Text>
            <Text style={styles.subtitle}>Los mejores jugadores de la comunidad</Text>
          </View>

          {/* Ranking Type Selector */}
          <View style={styles.selectorContainer}>
            <TouchableOpacity 
              style={[
                styles.selectorButton,
                rankingType === 'wins' && styles.selectorButtonActive
              ]}
              onPress={() => setRankingType('wins')}
            >
              <Trophy color={rankingType === 'wins' ? '#fff' : '#94a3b8'} size={16} />
              <Text style={[
                styles.selectorButtonText,
                rankingType === 'wins' && styles.selectorButtonTextActive
              ]}>
                Victorias
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.selectorButton,
                rankingType === 'winRate' && styles.selectorButtonActive
              ]}
              onPress={() => setRankingType('winRate')}
            >
              <TrendingUp color={rankingType === 'winRate' ? '#fff' : '#94a3b8'} size={16} />
              <Text style={[
                styles.selectorButtonText,
                rankingType === 'winRate' && styles.selectorButtonTextActive
              ]}>
                Tasa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.selectorButton,
                rankingType === 'points' && styles.selectorButtonActive
              ]}
              onPress={() => setRankingType('points')}
            >
              <Award color={rankingType === 'points' ? '#fff' : '#94a3b8'} size={16} />
              <Text style={[
                styles.selectorButtonText,
                rankingType === 'points' && styles.selectorButtonTextActive
              ]}>
                Puntos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Top 3 Podium */}
          {rankings.length >= 3 && (
            <View style={styles.podiumContainer}>
              {/* Second Place */}
              <View style={[styles.podiumPlace, styles.secondPlace]}>
                <Text style={styles.podiumAvatar}>{rankings[1].avatar}</Text>
                <View style={styles.podiumRank}>
                  <Medal color="#e5e7eb" size={20} />
                </View>
                <Text style={styles.podiumName}>{rankings[1].displayName}</Text>
                <Text style={styles.podiumValue}>{getRankingValue(rankings[1])}</Text>
              </View>

              {/* First Place */}
              <View style={[styles.podiumPlace, styles.firstPlace]}>
                <Text style={styles.podiumAvatar}>{rankings[0].avatar}</Text>
                <View style={styles.podiumRank}>
                  <Crown color="#fbbf24" size={24} />
                </View>
                <Text style={styles.podiumName}>{rankings[0].displayName}</Text>
                <Text style={styles.podiumValue}>{getRankingValue(rankings[0])}</Text>
              </View>

              {/* Third Place */}
              <View style={[styles.podiumPlace, styles.thirdPlace]}>
                <Text style={styles.podiumAvatar}>{rankings[2].avatar}</Text>
                <View style={styles.podiumRank}>
                  <Award color="#cd7c2f" size={20} />
                </View>
                <Text style={styles.podiumName}>{rankings[2].displayName}</Text>
                <Text style={styles.podiumValue}>{getRankingValue(rankings[2])}</Text>
              </View>
            </View>
          )}

          {/* Full Ranking List */}
          <View style={styles.rankingList}>
            <Text style={styles.listTitle}>Ranking Completo</Text>
            
            {rankings.map((user, index) => (
              <View key={user.id} style={styles.rankingItem}>
                <View style={styles.rankingPosition}>
                  {getRankIcon(index + 1)}
                </View>
                
                <View style={styles.rankingUserInfo}>
                  <Text style={styles.rankingAvatar}>{user.avatar}</Text>
                  <View style={styles.rankingDetails}>
                    <Text style={styles.rankingName}>{user.displayName}</Text>
                    <Text style={styles.rankingStats}>
                      {user.gamesPlayed} jugadas • {user.gamesWon}G • {user.gamesLost}P
                    </Text>
                  </View>
                </View>
                
                <View style={styles.rankingValue}>
                  <Text style={styles.rankingValueText}>
                    {getRankingValue(user)}
                  </Text>
                </View>
              </View>
            ))}

            {rankings.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Trophy color="#94a3b8" size={48} />
                <Text style={styles.emptyStateText}>
                  No hay datos de ranking disponibles
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  ¡Juega algunas partidas para aparecer en el ranking!
                </Text>
              </View>
            )}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectorButtonActive: {
    backgroundColor: '#10b981',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  selectorButtonTextActive: {
    color: '#fff',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'end',
    marginBottom: 30,
    gap: 8,
  },
  podiumPlace: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
  },
  firstPlace: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 2,
    borderColor: '#fbbf24',
    transform: [{ scale: 1.1 }],
  },
  secondPlace: {
    backgroundColor: 'rgba(229, 231, 235, 0.2)',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 124, 47, 0.2)',
    borderWidth: 2,
    borderColor: '#cd7c2f',
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumRank: {
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumValue: {
    fontSize: 12,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  rankingList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  rankingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rankingPosition: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  rankingUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  rankingDetails: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  rankingStats: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  rankingValue: {
    alignItems: 'flex-end',
  },
  rankingValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
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
});