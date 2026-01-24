import React from 'react';
import Icon from '../Icon';
import { User } from '../../types';

interface UserManagementModalProps {
  isOpen: boolean;
  currentUser: User | null;
  users: User[];
  newUser: { username: string; password: string };
  onClose: () => void;
  onNewUserChange: (field: 'username' | 'password', value: string) => void;
  onAddUser: () => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser?: (userId: string, updates: { displayName?: string; email?: string }) => void;
}

/**
 * 用户管理 Modal 组件
 */
export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  currentUser,
  users,
  newUser,
  onClose,
  onNewUserChange,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
}) => {
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditDisplayName(user.displayName || '');
    setEditEmail(user.email || '');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditDisplayName('');
    setEditEmail('');
  };

  const handleSaveEdit = () => {
    if (editingUserId && onUpdateUser) {
      onUpdateUser(editingUserId, {
        displayName: editDisplayName,
        email: editEmail,
      });
      handleCancelEdit();
    }
  };
  if (!isOpen || currentUser?.role !== 'Admin') return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9998] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
              <Icon name="users" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">
                User Management
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Admin Control Panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"
          >
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                New Username
              </label>
              <input
                type="text"
                onKeyDown={e => e.key === 'Enter' && onAddUser()}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                placeholder="Username"
                value={newUser.username}
                onChange={e => onNewUserChange('username', e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Password
              </label>
              <input
                type="password"
                onKeyDown={e => e.key === 'Enter' && onAddUser()}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                placeholder="Password"
                value={newUser.password}
                onChange={e => onNewUserChange('password', e.target.value)}
              />
            </div>
            <button
              onClick={onAddUser}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all h-[42px] flex items-center gap-2"
            >
              <Icon name="plus" size={12} /> Add User
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 pl-8 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  用户名
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  显示名称
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  邮箱
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  角色
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right pr-8">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 hover:bg-slate-50 group"
                >
                  <td className="p-4 pl-8 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${u.avatarColor} flex items-center justify-center text-white text-xs font-black`}
                    >
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {u.username}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingUserId === u.id ? (
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={e => setEditDisplayName(e.target.value)}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        placeholder="显示名称"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-700">
                        {u.displayName || u.username || '-'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingUserId === u.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        placeholder="邮箱"
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        {u.email || '-'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                        u.role === 'Admin'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-8">
                    <div className="flex items-center justify-end gap-1">
                      {editingUserId === u.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="保存"
                          >
                            <Icon name="check" size={12} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"
                            title="取消"
                          >
                            <Icon name="close" size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="编辑"
                          >
                            <Icon name="edit" size={12} />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              title="删除"
                            >
                              <Icon name="trash" size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
