import type { Location } from '@/domain/location';

import { LOCATION_SEEDS } from './mock/location-seed';

/** 会場の一覧 */
export function fetchLocations(): readonly Location[] {
  return LOCATION_SEEDS;
}

/**
 * 会場名から引く。
 * 登録の無い会場名は、その名前から決まるIDでその場で組み立てる。
 * モック段階でのみ成立する扱いで、Supabase導入後は location_id の外部キーになる。
 */
export function findLocationByName(name: string, ward: string): Location {
  const known = LOCATION_SEEDS.find((l) => l.name === name);
  if (known) return known;
  return { id: `loc-${name}`, name, prefecture: '東京都', ward };
}
