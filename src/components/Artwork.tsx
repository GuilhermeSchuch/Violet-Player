import { Music2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../utils/theme';

type ArtworkProps = {
  size?: number;
};

export function Artwork({ size = 56 }: ArtworkProps) {
  return (
    <LinearGradient
      colors={['#8B5CF6', '#2DD4BF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.artwork, { width: size, height: size, borderRadius: Math.max(8, size * 0.18) }]}
    >
      <View style={styles.glass}>
        <Music2 size={Math.max(18, size * 0.42)} color={colors.text} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  artwork: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glass: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
});
