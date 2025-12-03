import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { Header } from '@/components/home/Header';
import { StatusSection } from '@/components/home/StatusSection';
import { EmailSection } from '@/components/home/EmailSection';
import { ContactList } from '@/components/home/ContactList';

export default function HomeScreen() {
  const { theme } = useThemeCustom();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <StatusSection />
        <EmailSection />
        <ContactList />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});