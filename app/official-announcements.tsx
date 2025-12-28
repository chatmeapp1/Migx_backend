import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import API_BASE_URL from '@/utils/api';

export default function OfficialScreen() {
  const { theme } = useThemeCustom();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#0a5229" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Official Announcements</Text>
      </View>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.date, { color: theme.secondary }]}>
              {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
            )}
            <Text style={[styles.content, { color: theme.text }]}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.secondary }]}>No announcements yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#0a5229' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 12, marginBottom: 12 },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  content: { fontSize: 15, lineHeight: 22 },
  empty: { textAlign: 'center', marginTop: 40 },
});
