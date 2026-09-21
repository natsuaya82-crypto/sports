import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon } from '@/ui/components/Icons';
import { LevelColors, Palette, OpportunityKindColors, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useOpportunities } from '@/data/opportunity-store';
import { useTeam } from '@/data/team-store';
import { getLevelLabel } from '@/domain/level';
import { Opportunity, getOpportunityKindLabel, getRemainingCapacity } from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';
import type { Team, TeamMatch } from '@/domain/team';

function formatDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日`;
}

function formatDateWithWeekday(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
  return `${m}/${d}(${weekday})`;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** これからの試合(結果がなく日付が今日以降)を近い順で */
function upcomingMatches(matches: TeamMatch[] | undefined): TeamMatch[] {
  const today = todayString();
  return (matches ?? [])
    .filter((m) => !m.result && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 終了した試合(結果あり)を新しい順で */
function finishedMatches(matches: TeamMatch[] | undefined): TeamMatch[] {
  return (matches ?? [])
    .filter((m) => m.result != null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** サイト内のページ */
type SiteTab =
  | 'top'
  | 'news'
  | 'schedule'
  | 'members'
  | 'recruit'
  | 'results'
  | 'gallery'
  | 'about';

/**
 * チーム公式サイト。1枚もののプロフィールではなく、
 * ヘッダー+メニューで複数ページを切り替える「本物のクラブサイト」の構造。
 * TOPはダイジェスト、詳細は各ページへ。
 */
export default function TeamSiteScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const allRecruitments = useOpportunities();
  const [tab, setTab] = useState<SiteTab>('top');
  // PC幅のWebサイトレイアウト(中央1080px+TOPは2カラム)は一旦オフ。
  // _layout.tsx の TEAM_SITE_FULL_WIDTH と合わせて復活させる
  const DESKTOP_LAYOUT_ENABLED = false;
  const { width } = useWindowDimensions();
  const isDesktop = DESKTOP_LAYOUT_ENABLED && width >= 900;

  const opportunities = useMemo(() => {
    if (!team) return [];
    return allRecruitments
      .filter((r) => r.teamName === team.name)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [team, allRecruitments]);

  if (!team) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>チームが見つかりませんでした</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notFoundBack}>もどる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 中身があるページだけメニューに出す
  const tabs: { key: SiteTab; label: string }[] = [
    { key: 'top', label: 'TOP' },
    ...(team.news?.length ? [{ key: 'news' as const, label: 'お知らせ' }] : []),
    ...(team.matches?.length ? [{ key: 'schedule' as const, label: '日程・結果' }] : []),
    ...(team.members?.length ? [{ key: 'members' as const, label: 'メンバー' }] : []),
    { key: 'recruit', label: '募集' },
    ...(team.achievements?.length ? [{ key: 'results' as const, label: '戦績' }] : []),
    ...(team.gallery.length ? [{ key: 'gallery' as const, label: 'フォト' }] : []),
    { key: 'about', label: 'チーム情報' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      {/* サイトヘッダー(チームカラー) */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: team.color }}>
        <View style={[styles.siteHeader, styles.innerWide, isDesktop && styles.siteHeaderDesktop]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={isDesktop ? 24 : 20} color="#ffffff" />
          </Pressable>
          <View style={[styles.headerEmblem, isDesktop && styles.headerEmblemDesktop]}>
            <Image
              source={{ uri: team.photo }}
              style={styles.headerEmblemImage}
              contentFit="cover"
            />
          </View>
          <Text
            style={[styles.headerName, isDesktop && styles.headerNameDesktop]}
            numberOfLines={1}>
            {team.name}
          </Text>
          <Pressable hitSlop={8} style={styles.headerShare}>
            <Ionicons name="share-outline" size={isDesktop ? 22 : 18} color="#ffffff" />
          </Pressable>
        </View>

        {/* サイトメニュー */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.innerWide}
          contentContainerStyle={styles.menuRow}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[styles.menuItem, isDesktop && styles.menuItemDesktop]}>
                <Text
                  style={[
                    styles.menuText,
                    isDesktop && styles.menuTextDesktop,
                    active && styles.menuTextActive,
                  ]}>
                  {t.label}
                </Text>
                <View style={[styles.menuUnderline, active && styles.menuUnderlineActive]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* ページ本体 */}
      <ScrollView
        key={tab}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}>
        <View style={styles.innerWide}>
          {tab === 'top' && (
            <TopPage
              team={team}
              opportunities={opportunities}
              onNavigate={setTab}
              isDesktop={isDesktop}
            />
          )}
          {tab === 'news' && <NewsPage team={team} />}
          {tab === 'schedule' && <SchedulePage team={team} />}
          {tab === 'members' && <MembersPage team={team} isDesktop={isDesktop} />}
          {tab === 'recruit' && <RecruitPage team={team} opportunities={opportunities} />}
          {tab === 'results' && <ResultsPage team={team} />}
          {tab === 'gallery' && <GalleryPage team={team} isDesktop={isDesktop} />}
          {tab === 'about' && <AboutPage team={team} />}
        </View>

        {/* サイト共通フッター */}
        <View style={styles.siteFooter}>
          {team.instagram && (
            <Pressable style={styles.footerSns}>
              <Ionicons name="logo-instagram" size={16} color={styles.footerSnsText.color} />
              <Text style={styles.footerSnsText}>@{team.instagram}</Text>
            </Pressable>
          )}
          <Text style={styles.footerCopy}>© {team.name}</Text>
          <Text style={styles.footerPowered}>
            この公式サイトは スポマチ(名称未定) で作成されています
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** TOP: 公式サイトのホーム。ヒーロー+各ページのダイジェスト */
function TopPage({
  team,
  opportunities,
  onNavigate,
  isDesktop,
}: {
  team: Team;
  opportunities: Opportunity[];
  onNavigate: (tab: SiteTab) => void;
  isDesktop: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const openRecruitments = opportunities.filter(
    (r) => !r.closed && getRemainingCapacity(r) > 0,
  );

  const stats: { value: string; label: string; small?: boolean }[] = [
    ...(team.founded != null ? [{ value: `${team.founded}`, label: '創設' }] : []),
    ...(team.memberCount != null
      ? [{ value: `${team.memberCount}`, label: 'メンバー' }]
      : []),
    ...(team.ageRange != null ? [{ value: team.ageRange, label: '年齢層', small: true }] : []),
  ];

  return (
    <View>
      {/* ヒーロー */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <Image source={{ uri: team.photo }} style={styles.heroImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTagline, isDesktop && styles.heroTaglineDesktop]}>
            {team.tagline}
          </Text>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>
                {getSportLabel(team.sport)} ・ {team.ward}
              </Text>
            </View>
            <View style={[styles.heroChip, { backgroundColor: LevelColors[team.level] }]}>
              {team.level === 'serious' && <FlameIcon size={10} color="#ffffff" />}
              <Text style={styles.heroChipText}>{getLevelLabel(team.level)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* スタッツ(決まっているものだけ) */}
      {stats.length > 0 && (
        <View style={styles.statsBand}>
          {stats.map((s, i) => (
            <View key={s.label} style={styles.statsItem}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statTile}>
                <Text
                  style={[
                    styles.statValue,
                    { color: team.color },
                    s.small && styles.statValueSmall,
                  ]}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 次の試合(あれば大きく出す。クラブサイトの定番) */}
      {upcomingMatches(team.matches).length > 0 && (
        <View style={styles.body}>
          <NextMatchCard
            match={upcomingMatches(team.matches)[0]}
            color={team.color}
            onPress={() => onNavigate('schedule')}
          />
        </View>
      )}

      {/* PCでは「メイン(お知らせ・募集)+サイドバー(紹介・応募)」の2カラム */}
      <View style={[styles.body, isDesktop && styles.topColumns]}>
        <View style={[styles.topMain, isDesktop && styles.topMainDesktop]}>
          {/* お知らせダイジェスト */}
          {team.news && team.news.length > 0 && (
            <>
              <DigestHeader
                en="NEWS"
                jp="お知らせ"
                color={team.color}
                onMore={() => onNavigate('news')}
              />
              {team.news.slice(0, 2).map((n) => (
                <View key={`${n.date}-${n.text}`} style={styles.newsRow}>
                  <Text style={[styles.newsDate, { color: team.color }]}>
                    {formatDate(n.date)}
                  </Text>
                  <Text style={styles.newsText} numberOfLines={2}>
                    {n.text}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* 募集ダイジェスト */}
          <DigestHeader
            en="RECRUIT"
            jp="募集"
            color={team.color}
            onMore={() => onNavigate('recruit')}
          />
          {openRecruitments.length === 0 ? (
            <Text style={styles.emptyText}>現在募集はありません</Text>
          ) : (
            openRecruitments.slice(0, 2).map((r) => <RecruitmentRow key={r.id} item={r} />)
          )}
        </View>

        <View style={[styles.topSide, isDesktop && styles.topSideDesktop]}>
          {/* 紹介ダイジェスト */}
          <DigestHeader
            en="ABOUT"
            jp="チーム紹介"
            color={team.color}
            onMore={() => onNavigate('about')}
          />
          <Text style={styles.bio} numberOfLines={3}>
            {team.bio}
          </Text>

          <JoinCta team={team} />
        </View>
      </View>
    </View>
  );
}

/** TOPの次戦カード */
function NextMatchCard({
  match,
  color,
  onPress,
}: {
  match: TeamMatch;
  color: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.nextMatch, { borderColor: color, backgroundColor: `${color}0D` }]}>
      <View style={styles.nextMatchHead}>
        <Text style={[styles.nextMatchLabel, { color }]}>NEXT MATCH</Text>
        {match.competition && (
          <Text style={styles.nextMatchCompetition}>{match.competition}</Text>
        )}
      </View>
      <Text style={styles.nextMatchOpponent}>vs {match.opponent}</Text>
      <Text style={styles.nextMatchMeta}>
        {formatDateWithWeekday(match.date)}
        {match.time ? ` ${match.time}〜` : ''}
        {match.venue ? ` @ ${match.venue}` : ''}
      </Text>
    </Pressable>
  );
}

/** 日程・結果ページ */
function SchedulePage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  const upcoming = upcomingMatches(team.matches);
  const finished = finishedMatches(team.matches);

  return (
    <View style={styles.body}>
      <PageTitle en="SCHEDULE" jp="日程・結果" color={team.color} />

      {upcoming.length > 0 && (
        <>
          <Text style={styles.scheduleGroup}>これからの試合</Text>
          {upcoming.map((m) => (
            <View key={`${m.date}-${m.opponent}`} style={styles.matchRow}>
              <View style={styles.matchDateCol}>
                <Text style={[styles.matchDate, { color: team.color }]}>
                  {formatDateWithWeekday(m.date)}
                </Text>
                {m.time && <Text style={styles.matchTime}>{m.time}〜</Text>}
              </View>
              <View style={styles.matchBody}>
                <Text style={styles.matchOpponent}>vs {m.opponent}</Text>
                <Text style={styles.matchMeta}>
                  {[m.competition, m.venue].filter(Boolean).join(' ・ ')}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {finished.length > 0 && (
        <>
          <Text style={styles.scheduleGroup}>結果</Text>
          {finished.map((m) => {
            const r = m.result!;
            const outcome = r.our > r.their ? 'WIN' : r.our < r.their ? 'LOSE' : 'DRAW';
            const outcomeColor =
              outcome === 'WIN' ? team.color : outcome === 'LOSE' ? '#E5484D' : '#8B8D98';
            return (
              <View key={`${m.date}-${m.opponent}`} style={styles.matchRow}>
                <View style={[styles.matchOutcome, { backgroundColor: outcomeColor }]}>
                  <Text style={styles.matchOutcomeText}>{outcome}</Text>
                </View>
                <View style={styles.matchBody}>
                  <Text style={styles.matchOpponent}>
                    {r.our} - {r.their}  vs {m.opponent}
                  </Text>
                  <Text style={styles.matchMeta}>
                    {[formatDate(m.date), m.competition].filter(Boolean).join(' ・ ')}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

/** メンバーページ */
function MembersPage({ team, isDesktop }: { team: Team; isDesktop: boolean }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="MEMBERS" jp="メンバー" color={team.color} />
      <View style={styles.memberGrid}>
        {(team.members ?? []).map((m) => (
          <View
            key={`${m.name}-${m.number ?? ''}`}
            style={[styles.memberCard, isDesktop && styles.memberCardDesktop]}>
            <View style={[styles.memberNumber, { backgroundColor: team.color }]}>
              <Text style={styles.memberNumberText}>
                {m.number != null ? m.number : '-'}
              </Text>
            </View>
            <View style={styles.memberBody}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {m.name}
                </Text>
                {m.role && (
                  <View style={[styles.memberRole, { backgroundColor: `${team.color}1A` }]}>
                    <Text style={[styles.memberRoleText, { color: team.color }]}>
                      {m.role}
                    </Text>
                  </View>
                )}
              </View>
              {m.position && <Text style={styles.memberPosition}>{m.position}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** お知らせページ */
function NewsPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="NEWS" jp="お知らせ" color={team.color} />
      {(team.news ?? []).map((n) => (
        <View key={`${n.date}-${n.text}`} style={styles.newsCard}>
          <Text style={[styles.newsDate, { color: team.color }]}>{formatDate(n.date)}</Text>
          <Text style={styles.newsText}>{n.text}</Text>
        </View>
      ))}
    </View>
  );
}

/** 募集ページ */
function RecruitPage({ team, opportunities }: { team: Team; opportunities: Opportunity[] }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="RECRUIT" jp="募集" color={team.color} />
      {team.recruiting.length > 0 && (
        <View style={styles.recruitRow}>
          {team.recruiting.map((r) => (
            <View key={r} style={[styles.recruitBadge, { backgroundColor: `${team.color}1A` }]}>
              <Text style={[styles.recruitText, { color: team.color }]}>
                {getOpportunityKindLabel(r)}
              </Text>
            </View>
          ))}
        </View>
      )}
      {/* 常設のメンバー募集 */}
      {team.memberRecruitNote && (
        <View style={[styles.memberNote, { borderColor: team.color }]}>
          <Text style={[styles.memberNoteTitle, { color: team.color }]}>
            メンバー募集中
          </Text>
          <Text style={styles.memberNoteText}>{team.memberRecruitNote}</Text>
        </View>
      )}
      {opportunities.length === 0 && !team.memberRecruitNote ? (
        <Text style={styles.emptyText}>現在募集はありません</Text>
      ) : (
        opportunities.map((r) => <RecruitmentRow key={r.id} item={r} />)
      )}

      {/* 参加の流れ */}
      <Text style={styles.scheduleGroup}>参加の流れ</Text>
      {[
        ['応募する', '気になる募集から応募。プロフィールがそのまま届きます'],
        ['体験参加', '日程をすり合わせて、まずは1回一緒にプレー'],
        ['正式加入', 'お互いフィーリングが合えばメンバーに!単発参加もOK'],
      ].map(([title, desc], i) => (
        <View key={title} style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: team.color }]}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepDesc}>{desc}</Text>
          </View>
        </View>
      ))}

      <JoinCta team={team} />
    </View>
  );
}

/** 戦績ページ */
function ResultsPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="RESULTS" jp="出場大会・戦績" color={team.color} />
      {(team.achievements ?? []).map((a) => (
        <View key={a} style={styles.resultRow}>
          <View style={[styles.resultDot, { backgroundColor: team.color }]} />
          <Text style={styles.resultText}>{a}</Text>
        </View>
      ))}
    </View>
  );
}

/** フォトページ(スマホ2カラム/PC4カラム) */
function GalleryPage({ team, isDesktop }: { team: Team; isDesktop: boolean }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="GALLERY" jp="フォト" color={team.color} />
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

/** チーム情報ページ */
function AboutPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.body}>
      <PageTitle en="ABOUT" jp="チーム情報" color={team.color} />
      <Text style={styles.bio}>{team.bio}</Text>
      <View style={styles.infoCard}>
        <InfoRow icon="map-outline" label="エリア" value={team.ward} />
        {team.homeGround && (
          <InfoRow icon="location-outline" label="活動場所" value={team.homeGround} />
        )}
        {team.schedule && <InfoRow icon="time-outline" label="活動日" value={team.schedule} />}
        {team.memberCount != null && (
          <InfoRow
            icon="people-outline"
            label="メンバー"
            value={`${team.memberCount}人${team.ageRange ? `(${team.ageRange})` : ''}`}
          />
        )}
        {team.founded != null && (
          <InfoRow icon="flag-outline" label="創設" value={`${team.founded}年`} />
        )}
        <InfoRow
          icon="pulse-outline"
          label="レベル"
          value={getLevelLabel(team.level)}
        />
      </View>
      <JoinCta team={team} />
    </View>
  );
}

/** ページ見出し */
function PageTitle({ en, jp, color }: { en: string; jp: string; color: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.pageTitle}>
      <Text style={[styles.pageTitleEn, { color }]}>{en}</Text>
      <Text style={styles.pageTitleJp}>{jp}</Text>
      <View style={[styles.pageTitleRule, { backgroundColor: color }]} />
    </View>
  );
}

/** TOPのダイジェスト見出し(もっと見る付き) */
function DigestHeader({
  en,
  jp,
  color,
  onMore,
}: {
  en: string;
  jp: string;
  color: string;
  onMore: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.digestHeader}>
      <View style={[styles.sectionBar, { backgroundColor: color }]} />
      <View style={styles.digestTitles}>
        <Text style={[styles.sectionEn, { color }]}>{en}</Text>
        <Text style={styles.sectionJp}>{jp}</Text>
      </View>
      <Pressable onPress={onMore} hitSlop={8} style={styles.moreLink}>
        <Text style={[styles.moreText, { color }]}>もっと見る</Text>
        <Ionicons name="chevron-forward" size={12} color={color} />
      </Pressable>
    </View>
  );
}

/** 応募/連絡CTA */
function JoinCta({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ctaButton,
        { backgroundColor: team.color },
        pressed && styles.ctaPressed,
      ]}>
      <Ionicons name="paper-plane-outline" size={16} color="#ffffff" />
      <Text style={styles.ctaText}>
        {team.recruiting.length > 0 ? 'このチームに応募する' : 'このチームに連絡する'}
      </Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/** 募集枠1行(タップで募集詳細へ) */
function RecruitmentRow({ item }: { item: Opportunity }) {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const remaining = getRemainingCapacity(item);
  const isClosed = item.closed || remaining === 0;

  return (
    <Pressable
      style={styles.recruitmentRow}
      onPress={() =>
        router.push({ pathname: '/opportunity/[id]', params: { id: item.id } })
      }>
      <View
        style={[
          styles.recruitmentType,
          { backgroundColor: getOpportunityKindColor(item.type, Palette.tagText) },
          isClosed && styles.recruitmentTypeClosed,
        ]}>
        <Text style={styles.recruitmentTypeText}>
          {isClosed ? '締切' : getOpportunityKindLabel(item.type)}
        </Text>
      </View>
      <View style={styles.recruitmentBody}>
        <Text style={styles.opportunityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recruitmentMeta}>
          {formatDate(item.date)} {item.startTime}〜{item.endTime} ・{' '}
          {item.fee === 0 ? '無料' : `¥${item.fee.toLocaleString()}`}
          {!isClosed && ` ・ 残り${remaining}枠`}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    // ヘッダー
    siteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
    },
    siteHeaderDesktop: {
      paddingVertical: 14,
      gap: Spacing.three,
    },
    headerBack: {
      width: 28,
      alignItems: 'center',
    },
    headerEmblem: {
      width: 30,
      height: 30,
      borderRadius: 15,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.8)',
    },
    headerEmblemDesktop: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    headerEmblemImage: {
      width: '100%',
      height: '100%',
    },
    headerName: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: '#ffffff',
    },
    headerNameDesktop: {
      fontSize: 22,
    },
    headerShare: {
      width: 28,
      alignItems: 'center',
    },
    // メニュー
    menuRow: {
      paddingHorizontal: Spacing.two,
    },
    menuItem: {
      paddingHorizontal: Spacing.two,
      paddingTop: 4,
      alignItems: 'center',
      gap: 5,
    },
    menuItemDesktop: {
      paddingHorizontal: Spacing.three,
      gap: 7,
    },
    menuText: {
      fontSize: 13,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.7)',
    },
    menuTextDesktop: {
      fontSize: 15,
    },
    menuTextActive: {
      color: '#ffffff',
    },
    menuUnderline: {
      alignSelf: 'stretch',
      height: 3,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      backgroundColor: 'transparent',
    },
    menuUnderlineActive: {
      backgroundColor: '#ffffff',
    },
    pageContent: {
      paddingBottom: Spacing.four,
    },
    // PC: コンテンツを中央1080pxに収める(ヘッダー・メニューも同じ幅)
    innerWide: {
      width: '100%',
      maxWidth: 1080,
      alignSelf: 'center',
    },
    // PC: TOPの2カラム
    topColumns: {
      flexDirection: 'row',
      gap: Spacing.five,
      alignItems: 'flex-start',
    },
    topMain: {
      gap: Spacing.two,
    },
    topMainDesktop: {
      flex: 2,
    },
    topSide: {
      gap: Spacing.two,
    },
    topSideDesktop: {
      flex: 1,
    },
    // ヒーロー(TOP)
    hero: {
      height: 200,
    },
    heroDesktop: {
      height: 340,
    },
    heroImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.backgroundElement,
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroContent: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      gap: 6,
    },
    heroTagline: {
      fontSize: 18,
      fontWeight: '900',
      color: '#ffffff',
    },
    heroTaglineDesktop: {
      fontSize: 30,
    },
    heroChips: {
      flexDirection: 'row',
      gap: 6,
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#ffffff',
    },
    // スタッツ
    statsBand: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    statsItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statTile: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '900',
    },
    statValueSmall: {
      fontSize: 15,
      lineHeight: 26,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 32,
      backgroundColor: c.border,
    },
    body: {
      paddingHorizontal: Spacing.three,
      gap: Spacing.two,
    },
    // ページ見出し
    pageTitle: {
      marginTop: Spacing.three,
      gap: 2,
    },
    pageTitleEn: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
    },
    pageTitleJp: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    pageTitleRule: {
      width: 32,
      height: 3,
      borderRadius: 2,
      marginTop: 4,
    },
    // TOPダイジェスト見出し
    digestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.three,
    },
    sectionBar: {
      width: 4,
      height: 28,
      borderRadius: 2,
    },
    digestTitles: {
      flex: 1,
    },
    sectionEn: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2,
    },
    sectionJp: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
    },
    moreLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
    },
    moreText: {
      fontSize: 11,
      fontWeight: '700',
    },
    bio: {
      fontSize: 13,
      lineHeight: 21,
      color: c.text,
    },
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 10,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    infoLabel: {
      width: 64,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    // 次戦カード
    nextMatch: {
      borderWidth: 1.5,
      borderRadius: 12,
      padding: Spacing.three,
      gap: 4,
      marginTop: Spacing.two,
    },
    nextMatchHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    nextMatchLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
    },
    nextMatchCompetition: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    nextMatchOpponent: {
      fontSize: 20,
      fontWeight: '900',
      color: c.text,
    },
    nextMatchMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    // 日程・結果
    scheduleGroup: {
      fontSize: 13,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
    },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
    },
    matchDateCol: {
      width: 76,
      gap: 1,
    },
    matchDate: {
      fontSize: 12,
      fontWeight: '800',
    },
    matchTime: {
      fontSize: 11,
      color: c.textSecondary,
    },
    matchOutcome: {
      width: 52,
      borderRadius: 6,
      paddingVertical: 5,
      alignItems: 'center',
    },
    matchOutcomeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#ffffff',
    },
    matchBody: {
      flex: 1,
      gap: 2,
    },
    matchOpponent: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    matchMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
    // メンバー
    memberGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      width: '48%',
      flexGrow: 1,
    },
    memberCardDesktop: {
      width: '23%',
      flexGrow: 0,
    },
    memberNumber: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberNumberText: {
      fontSize: 14,
      fontWeight: '900',
      color: '#ffffff',
    },
    memberBody: {
      flex: 1,
      gap: 1,
    },
    memberNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    memberName: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
      flexShrink: 1,
    },
    memberRole: {
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    memberRoleText: {
      fontSize: 9,
      fontWeight: '800',
    },
    memberPosition: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
    },
    // 参加の流れ
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
    stepNumber: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepNumberText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#ffffff',
    },
    stepBody: {
      flex: 1,
      gap: 1,
    },
    stepTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    stepDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: c.textSecondary,
    },
    // お知らせ
    newsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
    newsCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      gap: 4,
    },
    newsDate: {
      width: 56,
      fontSize: 11,
      fontWeight: '800',
    },
    newsText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: c.text,
    },
    // 募集
    recruitRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    recruitBadge: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    recruitText: {
      fontSize: 11,
      fontWeight: '700',
    },
    emptyText: {
      fontSize: 12,
      color: c.textSecondary,
    },
    // 常設メンバー募集の掲載カード
    memberNote: {
      borderWidth: 1.5,
      borderRadius: 12,
      padding: Spacing.two,
      gap: 4,
    },
    memberNoteTitle: {
      fontSize: 12,
      fontWeight: '800',
    },
    memberNoteText: {
      fontSize: 12,
      lineHeight: 19,
      color: c.text,
    },
    recruitmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      backgroundColor: c.background,
    },
    recruitmentType: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 4,
      minWidth: 64,
      alignItems: 'center',
    },
    recruitmentTypeClosed: {
      backgroundColor: c.backgroundSelected,
    },
    recruitmentTypeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
    },
    recruitmentBody: {
      flex: 1,
      gap: 2,
    },
    opportunityTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    recruitmentMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
    // 戦績
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    resultDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    resultText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    // フォト
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
    // CTA
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 14,
      marginTop: Spacing.two,
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#ffffff',
    },
    // フッター
    siteFooter: {
      alignItems: 'center',
      gap: 6,
      marginTop: Spacing.five,
      paddingHorizontal: Spacing.three,
    },
    footerSns: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    footerSnsText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    footerCopy: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    footerPowered: {
      fontSize: 10,
      color: c.textSecondary,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    notFoundBack: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
  });
