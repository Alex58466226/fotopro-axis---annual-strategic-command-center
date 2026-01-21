import React from 'react';
import Icon from '../Icon';

interface LoginFormProps {
  username: string;
  password: string;
  error: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

/**
 * 登录表单组件
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onSwitchToRegister,
  onSwitchToForgot,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Username
        </label>
        <input
          type="text"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="e.g. admin"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Password
        </label>
        <input
          type="password"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="••••••"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
      )}
      <button
        type="submit"
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
      >
        Login to System
      </button>
      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="hover:text-indigo-500 transition-colors"
        >
          No account? Create one
        </button>
        <button
          type="button"
          onClick={onSwitchToForgot}
          className="hover:text-indigo-500 transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
};
