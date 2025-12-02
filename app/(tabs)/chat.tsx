
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatList } from '@/components/chat/ChatList';

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ChatHeader />
        <ChatList />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
});
