import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type FullScreenLoaderProps = {
  label?: string;
};

export default function FullScreenLoader({ label = 'Đang tải...' }: FullScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  text: {
    fontSize: 15,
    color: '#475569',
  },
});