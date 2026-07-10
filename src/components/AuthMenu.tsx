/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import {
  fetchSupabaseAuthProviderStatus,
  getAuthRedirectUrl,
  getSupabaseBrowserClient,
  isSupabaseAuthConfigured,
} from "../services/supabaseAuthClient";

const pendingAuthEmailStorageKey = "pm_cue_pending_auth_email";

interface AuthMenuProps {
  user: User | null;
  isLoading: boolean;
  onAuthError: (message: string) => void;
  onAuthSuccess: (message: string) => void;
}

export default function AuthMenu({
  user,
  isLoading,
  onAuthError,
  onAuthSuccess,
}: AuthMenuProps) {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [providerStatus, setProviderStatus] = useState<{ google: boolean; email: boolean } | null>(null);
  const [isProviderStatusLoading, setIsProviderStatusLoading] = useState(false);
  const authConfigured = isSupabaseAuthConfigured();
  const client = getSupabaseBrowserClient();
  const isEmailAvailable = providerStatus?.email !== false;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pendingEmail = window.localStorage.getItem(pendingAuthEmailStorageKey);
    if (!pendingEmail) return;

    setEmail(pendingEmail);
    setSentEmail(pendingEmail);
  }, []);

  useEffect(() => {
    if (!authConfigured) return;

    let isMounted = true;
    setIsProviderStatusLoading(true);
    fetchSupabaseAuthProviderStatus()
      .then((status) => {
        if (isMounted) setProviderStatus(status);
      })
      .catch(() => {
        if (isMounted) setProviderStatus(null);
      })
      .finally(() => {
        if (isMounted) setIsProviderStatusLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authConfigured]);

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!client || !email.trim()) return;

    setIsSending(true);
    const normalizedEmail = email.trim();
    const { error } = await client.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    setIsSending(false);

    if (error) {
      onAuthError(error.message);
      return;
    }

    setSentEmail(normalizedEmail);
    setOtpCode("");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(pendingAuthEmailStorageKey, normalizedEmail);
    }
    onAuthSuccess("登录邮件已发送。若手机点击链接失败，请回到这里输入邮件验证码。");
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!client || !sentEmail || !otpCode.trim()) return;

    setIsVerifying(true);
    const { error } = await client.auth.verifyOtp({
      email: sentEmail,
      token: otpCode.trim(),
      type: "email",
    });
    setIsVerifying(false);

    if (error) {
      onAuthError(error.message);
      return;
    }

    setOtpCode("");
    setSentEmail("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(pendingAuthEmailStorageKey);
    }
    onAuthSuccess("已登录，Cue Bank 将同步到云端。");
  };

  const handleSignOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) {
      onAuthError(error.message);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(pendingAuthEmailStorageKey);
    }
    onAuthSuccess("已退出登录。");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-500">
        Checking session
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span className="hidden max-w-[180px] truncate text-xs font-mono font-bold text-emerald-800 sm:inline">
          {user.email || "Signed in"}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-md border border-emerald-200 bg-white p-1.5 text-emerald-700 transition hover:text-emerald-950"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:min-w-[340px]">
      {!authConfigured && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          Auth env missing: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
        </p>
      )}
      {authConfigured && providerStatus?.email === false && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          邮箱登录暂未开启，请先在 Supabase Auth 中启用 Email provider。
        </p>
      )}
      <div className="flex gap-2">
        <form onSubmit={handleMagicLink} className="flex w-full gap-1.5">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={!authConfigured || isProviderStatusLoading || !isEmailAvailable || isSending || isVerifying}
            placeholder="输入邮箱获取登录验证码"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-slate-400 focus:bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!authConfigured || isProviderStatusLoading || !isEmailAvailable || isSending || isVerifying || !email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-mono font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send sign-in email"
          >
            <Mail className="h-3.5 w-3.5" />
            {isSending ? "发送中" : "发送"}
          </button>
        </form>
      </div>
      {sentEmail && (
        <div className="space-y-1.5">
          <form onSubmit={handleVerifyOtp} className="flex gap-1.5">
            <input
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={!authConfigured || isProviderStatusLoading || !isEmailAvailable || isSending || isVerifying}
              inputMode="numeric"
              placeholder="输入 6 位验证码"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-slate-400 focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!authConfigured || isProviderStatusLoading || !isEmailAvailable || isSending || isVerifying || otpCode.length < 6}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-extrabold text-slate-700 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              title="Verify email code"
            >
              {isVerifying ? "验证中" : "验证"}
            </button>
          </form>
          <p className="px-1 text-[11px] leading-relaxed text-slate-500">
            手机邮箱或微信内置浏览器打不开链接时，可输入邮件中的 6 位验证码登录。
          </p>
        </div>
      )}
    </div>
  );
}
