import React from 'react';
import Icon from '../Icon';
import { User } from '../../types';

interface UserProfileProps {
  user: User;
  onUserManagementClick: () => void;
  onAuditLogClick: () => void;
  onLogoutClick: () => void;
}

/**
 * 用户信息卡片组件
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUserManagementClick,
  onAuditLogClick,
  onLogoutClick,
}) => {
  return (
    <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-black`}
        >
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800">{user.username}</div>
          <div className="text-[9px] text-slate-400 uppercase">{user.role}</div>
        </div>
      </div>
      <div className="flex gap-1">
        {user.role === 'Admin' && (
          <>
            <button
              onClick={onUserManagementClick}
              className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-slate-100 rounded transition-all"
              title="User Management"
            >
              <Icon name="users" size={14} />
            </button>
            <button
              onClick={onAuditLogClick}
              className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-slate-100 rounded transition-all"
              title="View Audit Logs"
            >
              <Icon name="log" size={14} />
            </button>
          </>
        )}
        <button
          onClick={onLogoutClick}
          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-slate-100 rounded transition-all"
          title="Logout"
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </div>
  );
};
