import React from 'react';
import Icon from '../Icon';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export type AuthMode = 'login' | 'register' | 'forgot';

interface AuthContainerProps {
  mode: AuthMode;
  // Login form props
  loginUsername: string;
  loginPassword: string;
  loginError: string;
  onLoginUsernameChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onLogin: (e: React.FormEvent) => void;
  // Register form props
  registerUsername: string;
  registerPassword: string;
  registerConfirmPassword: string;
  registerError: string;
  onRegisterUsernameChange: (value: string) => void;
  onRegisterPasswordChange: (value: string) => void;
  onRegisterConfirmPasswordChange: (value: string) => void;
  onRegister: (e: React.FormEvent) => void;
  // Forgot password form props
  forgotUsername: string;
  forgotPassword: string;
  forgotConfirmPassword: string;
  forgotError: string;
  onForgotUsernameChange: (value: string) => void;
  onForgotPasswordChange: (value: string) => void;
  onForgotConfirmPasswordChange: (value: string) => void;
  onForgotPassword: (e: React.FormEvent) => void;
  // Mode switching
  onModeChange: (mode: AuthMode) => void;
  onErrorClear: () => void;
}

/**
 * 认证容器组件
 * 统一管理登录、注册、重置密码三种表单
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({
  mode,
  // Login
  loginUsername,
  loginPassword,
  loginError,
  onLoginUsernameChange,
  onLoginPasswordChange,
  onLogin,
  // Register
  registerUsername,
  registerPassword,
  registerConfirmPassword,
  registerError,
  onRegisterUsernameChange,
  onRegisterPasswordChange,
  onRegisterConfirmPasswordChange,
  onRegister,
  // Forgot
  forgotUsername,
  forgotPassword,
  forgotConfirmPassword,
  forgotError,
  onForgotUsernameChange,
  onForgotPasswordChange,
  onForgotConfirmPasswordChange,
  onForgotPassword,
  // Mode switching
  onModeChange,
  onErrorClear,
}) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8 bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="layers" size={24} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest">
            Fotopro Axis
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            Authorized Personnel Only
          </p>
        </div>

        {mode === 'login' ? (
          <LoginForm
            username={loginUsername}
            password={loginPassword}
            error={loginError}
            onUsernameChange={onLoginUsernameChange}
            onPasswordChange={onLoginPasswordChange}
            onSubmit={onLogin}
            onSwitchToRegister={() => {
              onErrorClear();
              onModeChange('register');
            }}
            onSwitchToForgot={() => {
              onErrorClear();
              onModeChange('forgot');
            }}
          />
        ) : mode === 'register' ? (
          <RegisterForm
            username={registerUsername}
            password={registerPassword}
            confirmPassword={registerConfirmPassword}
            error={registerError}
            onUsernameChange={onRegisterUsernameChange}
            onPasswordChange={onRegisterPasswordChange}
            onConfirmPasswordChange={onRegisterConfirmPasswordChange}
            onSubmit={onRegister}
            onSwitchToLogin={() => {
              onErrorClear();
              onModeChange('login');
            }}
          />
        ) : (
          <ForgotPasswordForm
            username={forgotUsername}
            password={forgotPassword}
            confirmPassword={forgotConfirmPassword}
            error={forgotError}
            onUsernameChange={onForgotUsernameChange}
            onPasswordChange={onForgotPasswordChange}
            onConfirmPasswordChange={onForgotConfirmPasswordChange}
            onSubmit={onForgotPassword}
            onSwitchToLogin={() => {
              onErrorClear();
              onModeChange('login');
            }}
          />
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Restricted Access · v2.4 Security Enabled
          </p>
        </div>
      </div>
    </div>
  );
};
