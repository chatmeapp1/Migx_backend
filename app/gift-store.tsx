
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import Svg, { Path } from 'react-native-svg';

const SearchIcon = ({ size = 20, color = '#999' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ size = 20, color = '#999' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Gift {
  id: string;
  emoji: string;
  name: string;
  price: number;
}

const gifts: Gift[] = [
  { id: '1', emoji: '👩', name: 'Alay', price: 75.0 },
  { id: '2', emoji: '🍌', name: 'Anomali', price: 99.0 },
  { id: '3', emoji: '🎊', name: 'Be Happy', price: 75.0 },
  { id: '4', emoji: '🍪', name: 'Biscuit', price: 100.0 },
  { id: '5', emoji: '🦴', name: 'Bone', price: 100.0 },
  { id: '6', emoji: '😭', name: 'Cengeng', price: 99.0 },
  { id: '7', emoji: '✅', name: 'Check', price: 100.0 },
  { id: '8', emoji: '☕', name: 'Coffee', price: 100.0 },
  { id: '9', emoji: '💎', name: 'Diamond', price: 700.0 },
  { id: '10', emoji: '🎫', name: 'Diskon', price: 79.0 },
  { id: '11', emoji: '🏍️', name: 'Ducati', price: 10000.0 },
  { id: '12', emoji: '🌻', name: 'Flower', price: 105.0 },
  { id: '13', emoji: '🐸', name: 'Frog', price: 75.0 },
  { id: '14', emoji: '🌿', name: 'Ganja', price: 100.0 },
  { id: '15', emoji: '🐉', name: 'Garangan', price: 100.0 },
  { id: '16', emoji: '🫙', name: 'Gas', price: 99.0 },
  { id: '17', emoji: '🎁', name: 'Gift', price: 150.0 },
  { id: '18', emoji: '⭐', name: 'Star', price: 200.0 },
  { id: '19', emoji: '🎮', name: 'Game', price: 250.0 },
  { id: '20', emoji: '🎵', name: 'Music', price: 80.0 },
];

export default function GiftStoreScreen() {
  const { theme } = useThemeCustom();
  const [searchText, setSearchText] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  const filteredGifts = gifts.filter(gift =>
    gift.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGiftItem = ({ item }: { item: Gift }) => (
    <TouchableOpacity style={styles.giftItem} onLongPress={() => console.log(`Copied: ${item.name}`)}>
      <View style={styles.giftCard}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.giftName}>{item.name}</Text>
        <Text style={styles.giftPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Gifts"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Info Banner */}
      {showInfo && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>Long press on a gift icon to copy the gift name</Text>
          <TouchableOpacity onPress={() => setShowInfo(false)}>
            <CloseIcon size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Gift Grid */}
      <FlatList
        data={filteredGifts}
        renderItem={renderGiftItem}
        keyExtractor={(item) => item.id}
        numColumns={5}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 245, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 105, 180, 0.9)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#ff69b4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  giftItem: {
    width: '18.5%',
  },
  giftCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(240, 240, 245, 0.8)',
  },
  emoji: {
    fontSize: 34,
  },
  giftName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  giftPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    fontWeight: '600',
  },
});
