import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamPageTitle } from './TeamPageTitle';

/** フォトページ(スマホ2カラム/PC4カラム) */
export function TeamGalleryPage({ team, isDesktop }: { team: Team; isDesktop: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="GALLERY" jp="フォト" color={team.color} />
      <View style={styles.galleryGrid}>
        {team.gallery.map((uri) => (
          <Image
            key={uri}
            source={{ uri }}
            style={[styles.galleryPhoto, isDesktop && styles.galleryPhotoDesktop]}
            contentFit="cover"
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    galleryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    galleryPhoto: {
      width: '48%',
      aspectRatio: 4 / 3,
      borderRadius: 10,
      backgroundColor: c.backgroundElement,
      flexGrow: 1,
    },
    galleryPhotoDesktop: {
      width: '23%',
      flexGrow: 0,
    },
  });
