import React from 'react';

interface RegisterFormProps {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  email: string;
  error: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

/**
 * 注册表单组件
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  username,
  password,
  confirmPassword,
  displayName,
  email,
  error,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onDisplayNameChange,
  onEmailChange,
  onSubmit,
  onSwitchToLogin,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          登录用户名 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="用于登录的用户名"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
          required
        />
        <p className="text-[10px] text-slate-400 ml-1">用于登录的唯一标识</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          显示名称
        </label>
        <input
          type="text"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="显示名称（默认作为负责人）"
          value={displayName}
          onChange={e => onDisplayNameChange(e.target.value)}
        />
        <p className="text-[10px] text-slate-400 ml-1">将作为策略和任务的默认负责人（owner）</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          注册邮箱
        </label>
        <input
          type="email"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="your@email.com（可选）"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
        />
        <p className="text-[10px] text-slate-400 ml-1">与登录用户名分开，用于接收通知等</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          密码 <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="••••••"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          确认密码 <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          placeholder="••••••"
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
          required
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
      )}
      <button
        type="submit"
        className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all active:scale-95"
      >
        Register & Login
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
