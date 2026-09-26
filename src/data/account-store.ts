import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import { userSchema, type User } from '@/domain/user';
import { getDateFromToday } from '@/lib/local-date';
import { createStore, type ReadableStore } from '@/lib/observable-store';

import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER } from './mock/demo-account';

const SIGNUPS_KEY = 'auth:signups';
const SESSION_KEY = 'auth:session';
const PROFILE_EDITS_KEY = 'auth:profileEdits';

const storedAccountSchema = z.object({
  email: z.string(),
  password: z.string(),
  profile: userSchema,
});

type StoredAccount = z.infer<typeof storedAccountSchema>;

/**
 * 登録日（registeredAt）を持つ前に保存されたアカウントの移行。
 *
 * これが無いと、以前に登録した端末内のアカウントが検証に落ちて消える。
 * 登録日は記録されていないため、初めて読み込んだ日を登録日とみなす。
 */
function withRegisteredAt(raw: unknown): unknown {
  if (!Array.isArray(raw)) return raw;
  return raw.map((account: unknown) => {
    if (typeof account !== 'object' || account === null) return account;
    const { profile } = account as { profile?: Record<string, unknown> };
    if (profile === undefined || profile.registeredAt !== undefined) return account;
    return { ...account, profile: { ...profile, registeredAt: getDateFromToday(0) } };
  });
}

const storedAccountsSchema = z.preprocess(withRegisteredAt, z.array(storedAccountSchema));
const profileEditsSchema = z.record(z.string(), userSchema.partial());

export interface AccountState {
  /** 保存領域からの復元が終わったか。未完了の間はスプラッシュを出す */
  ready: boolean;
  currentUser: User | null;
}

const store = createStore<AccountState>({ ready: false, currentUser: null });

/** ログイン状態の購読口 */
export const accountStore: ReadableStore<AccountState> = store;

const demoAccount: StoredAccount = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  profile: DEMO_USER,
};

let signups: StoredAccount[] = [];
let sessionEmail: string | null = null;
let profileEdits: Record<string, Partial<User>> = {};

function getAccounts(): StoredAccount[] {
  return [demoAccount, ...signups];
}

function publish(ready: boolean): void {
  const account = getAccounts().find((a) => a.email === sessionEmail);
  const currentUser =
    account === undefined
      ? null
      : { ...account.profile, ...profileEdits[account.email] };
  store.set({ ready, currentUser });
}

/**
 * 保存済みの値を読み、schemaに合うものだけを採用する。
 * 合わない値は握りつぶさず、未保存と同じ扱いに倒したうえで呼び出し側へ伝える。
 */
async function readStored<T>(key: string, schema: z.ZodType<T>): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  const parsed = schema.safeParse(JSON.parse(raw) as unknown);
  if (!parsed.success) {
    await AsyncStorage.removeItem(key);
    return null;
  }
  return parsed.data;
}

/** 起動時に保存済みのログイン状態を復元する */
export async function restoreSession(): Promise<void> {
  signups = (await readStored(SIGNUPS_KEY, storedAccountsSchema)) ?? [];
  sessionEmail = await AsyncStorage.getItem(SESSION_KEY);
  profileEdits = (await readStored(PROFILE_EDITS_KEY, profileEditsSchema)) ?? {};
  publish(true);
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  const account = getAccounts().find((a) => a.email.toLowerCase() === normalized);
  if (account === undefined) {
    return { ok: false, error: 'このメールアドレスは登録されていません' };
  }
  if (account.password !== password) {
    return { ok: false, error: 'パスワードが違います' };
  }
  sessionEmail = account.email;
  await AsyncStorage.setItem(SESSION_KEY, account.email);
  publish(true);
  return { ok: true };
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const normalized = input.email.trim().toLowerCase();
  if (getAccounts().some((a) => a.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'このメールアドレスは既に登録されています' };
  }
  const account: StoredAccount = {
    email: input.email.trim(),
    password: input.password,
    profile: {
      id: `u-${Date.now()}`,
      displayName: input.name.trim(),
      avatar: `https://picsum.photos/seed/${encodeURIComponent(normalized)}/200/200`,
      prefecture: '東京都',
      ward: '',
      bio: '',
      sports: [],
      level: 'enjoy',
      managedTeamIds: [],
      registeredAt: getDateFromToday(0),
    },
  };
  signups = [...signups, account];
  sessionEmail = account.email;
  await AsyncStorage.setItem(SIGNUPS_KEY, JSON.stringify(signups));
  await AsyncStorage.setItem(SESSION_KEY, account.email);
  publish(true);
  return { ok: true };
}

export async function logout(): Promise<void> {
  sessionEmail = null;
  await AsyncStorage.removeItem(SESSION_KEY);
  publish(true);
}

/** ログイン中ユーザーのプロフィールを部分更新する */
export async function updateProfile(patch: Partial<Omit<User, 'id'>>): Promise<void> {
  if (sessionEmail === null) return;
  profileEdits = {
    ...profileEdits,
    [sessionEmail]: { ...profileEdits[sessionEmail], ...patch },
  };
  await AsyncStorage.setItem(PROFILE_EDITS_KEY, JSON.stringify(profileEdits));
  publish(true);
}

export { DEMO_EMAIL, DEMO_PASSWORD };
