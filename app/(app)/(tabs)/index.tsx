import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/stores/authStore';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HnaNut</Text>
      <Text style={styles.description}>
        Bạn đã vào khu vực app sau khi có phiên đăng nhập.
      </Text>

      {user ? (
        <Text style={styles.userText}>
          {user.fullName} - {user.email}
        </Text>
      ) : (
        <Text style={styles.userText}>Phiên đăng nhập đã được khôi phục từ token.</Text>
      )}

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  description: {
    fontSize: 16,
    color: '#475569',
  },
  userText: {
    fontSize: 15,
    color: '#334155',
  },
  button: {
    marginTop: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0A7EA4',
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});