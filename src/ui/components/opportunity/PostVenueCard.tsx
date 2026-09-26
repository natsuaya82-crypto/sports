import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card, usePostStyles } from './PostFormParts';
import { useAppTheme } from '@/ui/contexts/theme-context';
import type { Location } from '@/domain/location';

interface Props {
  venue: Location | null;
  onPress: () => void;
}

/** 募集作成: 会場 */
export function PostVenueCard({ venue, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();

  return (
    <Card icon="location-outline" title="場所">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.venueField, pressed && styles.venuePressed]}>
        {venue ? (
          <View style={styles.venueBody}>
            <Text style={styles.venueName} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={styles.venueWard}>{venue.ward}</Text>
          </View>
        ) : (
          <Text style={styles.venuePlaceholder}>会場をえらぶ</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
      <Text style={styles.hint}>
        指定した場所をもとに、見る人には現在地からの距離が表示されます
      </Text>
    </Card>
  );
}
