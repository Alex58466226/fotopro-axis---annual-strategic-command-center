import React from 'react';

interface ForgotPasswordFormProps {
  username: string;
  password: string;
  confirmPassword: string;
  error: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

/**
 * 重置密码表单组件
 */
export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  username,
  password,
  confirmPassword,
  error,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onSwitchToLogin,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Verify Username
        </label>
        <input
          type="text"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="Enter your username"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Set New Password
        </label>
        <input
          type="password"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="••••••"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Confirm New Password
        </label>
        <input
          type="password"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="••••••"
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
      )}
      <button
        type="submit"
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
      >
        Reset Password
      </button>
      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};
