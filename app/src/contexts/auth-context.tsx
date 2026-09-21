import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockUser } from '@/data/mock-user';
import type { UserAccount } from '@/types/user';

/** 認証情報付きのアカウント(モック段階のためパスワードは平文で保持) */
interface StoredAccount {
  email: string;
  password: string;
  profile: UserAccount;
}

/** 新規登録時の「メインは個人?団体?」 */
export type AccountKind = 'personal' | 'team';

const SIGNUPS_KEY = 'auth:signups';
const SESSION_KEY = 'auth:session';
const PROFILE_EDITS_KEY = 'auth:profileEdits';

/**
 * デモアカウント。ワンタップでリッチなモックデータに入れる。
 * 実バックエンド(Supabase等)に差し替えるときは、このファイルの
 * login/signup/logout の中身を API 呼び出しに変えるだけでよい。
 */
const DEMO_ACCOUNT: StoredAccount = {
  email: 'demo@spomatch.app',
  password: 'demo',
  profile: mockUser,
};

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  /** ストレージからの復元が終わったか(未完了中はスプラッシュ) */
  ready: boolean;
  /** ログイン中のユーザー(未ログインは null) */
  user: UserAccount | null;
  demoEmail: string;
  demoPassword: string;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    kind: AccountKind;
  }) => Promise<AuthResult>;
  logout: () => void;
  /** ログイン中ユーザーのプロフィールを部分更新する */
  updateProfile: (patch: Partial<Omit<UserAccount, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  // ユーザー作成分。デモは常にコード側で先頭に足す
  const [signups, setSignups] = useState<StoredAccount[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  // プロフィール編集の上書き層(email → 差分)
  const [profileEdits, setProfileEdits] = useState<
    Record<string, Partial<UserAccount>>
  >({});

  // 起動時に復元
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SIGNUPS_KEY),
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(PROFILE_EDITS_KEY),
    ]).then(([rawSignups, rawSession, rawEdits]) => {
      if (rawSignups) {
        try {
          setSignups(JSON.parse(rawSignups) as StoredAccount[]);
        } catch {
          // 壊れていたら無視
        }
      }
      if (rawSession) setSessionEmail(rawSession);
      if (rawEdits) {
        try {
          setProfileEdits(JSON.parse(rawEdits) as Record<string, Partial<UserAccount>>);
        } catch {
          // 壊れていたら無視
        }
      }
      setReady(true);
    });
  }, []);

  const accounts = useMemo<StoredAccount[]>(
    () => [DEMO_ACCOUNT, ...signups],
    [signups],
  );

  const user = useMemo<UserAccount | null>(() => {
    if (!sessionEmail) return null;
    const base = accounts.find((a) => a.email === sessionEmail)?.profile;
    if (!base) return null;
    return { ...base, ...profileEdits[sessionEmail] };
  }, [accounts, sessionEmail, profileEdits]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const e = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email.toLowerCase() === e);
    if (!account) return { ok: false, error: 'このメールアドレスは登録されていません' };
    if (account.password !== password) return { ok: false, error: 'パスワードが違います' };
    setSessionEmail(account.email);
    await AsyncStorage.setItem(SESSION_KEY, account.email);
    return { ok: true };
  };

  const signup = async (input: {
    name: string;
    email: string;
    password: string;
    kind: AccountKind;
  }): Promise<AuthResult> => {
    const e = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === e)) {
      return { ok: false, error: 'このメールアドレスは既に登録されています' };
    }
    const account: StoredAccount = {
      email: input.email.trim(),
      password: input.password,
      profile: {
        id: `u-${Date.now()}`,
        displayName: input.name.trim(),
        avatar: `https://picsum.photos/seed/${encodeURIComponent(e)}/200/200`,
        ward: '',
        bio: '',
        sports: [],
        level: 'enjoy',
        managedTeamIds: [],
      },
    };
    const nextSignups = [...signups, account];
    setSignups(nextSignups);
    setSessionEmail(account.email);
    await AsyncStorage.setItem(SIGNUPS_KEY, JSON.stringify(nextSignups));
    await AsyncStorage.setItem(SESSION_KEY, account.email);
    return { ok: true };
  };

  const logout = () => {
    setSessionEmail(null);
    AsyncStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (patch: Partial<Omit<UserAccount, 'id'>>) => {
    if (!sessionEmail) return;
    setProfileEdits((prev) => {
      const next = {
        ...prev,
        [sessionEmail]: { ...prev[sessionEmail], ...patch },
      };
      AsyncStorage.setItem(PROFILE_EDITS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      demoEmail: DEMO_ACCOUNT.email,
      demoPassword: DEMO_ACCOUNT.password,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [ready, user, signups, sessionEmail, profileEdits],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** ログイン中ユーザー(未ログインなら例外。ガード後の画面で使う) */
export function useCurrentUser(): UserAccount {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called without a logged-in user');
  return user;
}
