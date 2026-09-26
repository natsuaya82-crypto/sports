import { createContext, useContext, useEffect, type ReactNode } from 'react';

import type { User } from '@/domain/user';
import {
  accountStore,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  login,
  logout,
  restoreSession,
  signup,
  updateProfile,
  type AuthResult,
  type SignupInput,
} from '@/data/account-store';

import { useStore } from '../hooks/use-store';

/** 新規登録時の「メインは個人?団体?」 */
export type AccountKind = 'personal' | 'team';

interface AuthContextValue {
  /** 保存領域からの復元が終わったか(未完了中はスプラッシュ) */
  ready: boolean;
  /** ログイン中のユーザー(未ログインは null) */
  user: User | null;
  demoEmail: string;
  demoPassword: string;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (input: SignupInput & { kind: AccountKind }) => Promise<AuthResult>;
  logout: () => void;
  /** ログイン中ユーザーのプロフィールを部分更新する */
  updateProfile: (patch: Partial<Omit<User, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * ログイン状態をツリーへ配る。
 *
 * 認証そのものと保存は data/account-store が持つ。ここはReactへの接続だけを行う。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, currentUser } = useStore(accountStore);

  useEffect(() => {
    void restoreSession();
  }, []);

  const value: AuthContextValue = {
    ready,
    user: currentUser,
    demoEmail: DEMO_EMAIL,
    demoPassword: DEMO_PASSWORD,
    login,
    signup: (input) => signup(input),
    logout: () => {
      void logout();
    },
    updateProfile: (patch) => {
      void updateProfile(patch);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/** ログイン中ユーザー(未ログインなら例外。ガード後の画面で使う) */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (user === null) throw new Error('useCurrentUser called without a logged-in user');
  return user;
}
