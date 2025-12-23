import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeCustom } from '@/theme/provider';
import API_BASE_URL from '@/utils/api';

interface TransactionHistoryModalProps {
  onClose: () => void;
}

type TransactionCategory = 'game' | 'gift' | 'transfer';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  username: string;
  description: string;
  created_at: string;
}

export function TransactionHistoryModal({ onClose }: TransactionHistoryModalProps) {
  const { theme } = useThemeCustom();
  const [activeCategory, setActiveCategory] = useState<TransactionCategory>('game');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [activeCategory]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        Alert.alert('Error', 'Session expired');
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(userData);
      const token = parsedData?.token;

      if (!token) {
        Alert.alert('Error', 'Session expired');
        setLoading(false);
        return;
      }

      let endpoint = '';
      if (activeCategory === 'game') {
        endpoint = '/api/admin/transactions/game';
      } else if (activeCategory === 'gift') {
        endpoint = '/api/admin/transactions/gift';
      } else if (activeCategory === 'transfer') {
        endpoint = '/api/admin/transactions/transfer';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        Alert.alert('Error', 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case 'game':
        return 'dice-outline';
      case 'gift':
        return 'gift-outline';
      case 'transfer':
        return 'swap-horizontal-outline';
      default:
        return 'cash-outline';
    }
  };

  const getCategoryColor = (category: TransactionCategory) => {
    switch (category) {
      case 'game':
        return '#E74C3C';
      case 'gift':
        return '#F39C12';
      case 'transfer':
        return '#27AE60';
      default:
        return '#95A5A6';
    }
  };

  const getTransactionIcon = (type: string) => {
    if (activeCategory === 'game') {
      return type === 'bet' ? 'arrow-up-outline' : 'arrow-down-outline';
    }
    if (activeCategory === 'gift') {
      return type === 'send' ? 'arrow-up-outline' : 'arrow-down-outline';
    }
    if (activeCategory === 'transfer') {
      return type === 'send' ? 'arrow-up-outline' : 'arrow-down-outline';
    }
    return 'cash-outline';
  };

  const getTypeLabel = (type: string) => {
    if (activeCategory === 'game') {
      return type === 'bet' ? 'Bet' : 'Win';
    }
    if (activeCategory === 'gift') {
      return type === 'send' ? 'Send Gift' : 'Receive Gift';
    }
    if (activeCategory === 'transfer') {
      return type === 'send' ? 'Send Credit' : 'Receive Credit';
    }
    return type;
  };

  const getAmountColor = (type: string) => {
    if (activeCategory === 'game') {
      return type === 'bet' ? '#E74C3C' : '#27AE60';
    }
    if (activeCategory === 'gift') {
      return type === 'send' ? '#E74C3C' : '#27AE60';
    }
    if (activeCategory === 'transfer') {
      return type === 'send' ? '#E74C3C' : '#27AE60';
    }
    return '#333';
  };

  const categories: Array<{ id: TransactionCategory; label: string }> = [
    { id: 'game', label: 'Game' },
    { id: 'gift', label: 'Gift' },
    { id: 'transfer', label: 'Transfer' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Transaction History</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.categoryTabs, { backgroundColor: theme.background }]}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              activeCategory === cat.id && styles.categoryTabActive,
              activeCategory === cat.id && {},
              { borderColor: activeCategory === cat.id ? getCategoryColor(cat.id) : theme.border, backgroundColor: activeCategory === cat.id ? getCategoryColor(cat.id) : theme.card },
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons
              name={getCategoryIcon(cat.id)}
              size={20}
              color={activeCategory === cat.id ? '#fff' : getCategoryColor(cat.id)}
            />
            <Text
              style={[
                styles.categoryTabText,
                activeCategory === cat.id && styles.categoryTabTextActive,
                { color: activeCategory === cat.id ? '#fff' : theme.text },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={[styles.transactionList, { backgroundColor: theme.background }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={getCategoryColor(activeCategory)} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={getCategoryIcon(activeCategory)}
              size={48}
              color={theme.secondary}
            />
            <Text style={[styles.emptyText, { color: theme.secondary }]}>No transactions found</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: getCategoryColor(activeCategory) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getTransactionIcon(tx.type)}
                    size={20}
                    color={getAmountColor(tx.type)}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionType, { color: theme.text }]}>
                    {getTypeLabel(tx.type)}
                  </Text>
                  <Text style={[styles.transactionUsername, { color: theme.secondary }]}>{tx.username}</Text>
                  <Text style={[styles.transactionTime, { color: theme.secondary }]}>
                    {new Date(tx.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: getAmountColor(tx.type) },
                ]}
              >
                {tx.type === 'bet' || tx.type === 'send' ? '-' : '+'}
                {tx.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  categoryTabActive: {
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionUsername: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionTime: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
});
