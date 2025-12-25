import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { Header } from '@/components/home/Header';
import { ContactList } from '@/components/home/ContactList';
import { SwipeableScreen } from '@/components/navigation/SwipeableScreen';
import { UserProfileSection } from '@/components/home/UserProfileSection';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { theme } = useThemeCustom();
  const [refreshing, setRefreshing] = useState(false);
  const contactListRef = useRef<any>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger ContactList refresh
      if (contactListRef.current?.refreshContacts) {
        await contactListRef.current.refreshContacts();
      }
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SwipeableScreen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header />
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
              colors={['#0a5229']}
            />
          }
        >
          <UserProfileSection />
          <ContactList ref={contactListRef} />
        </ScrollView>
      </View>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
