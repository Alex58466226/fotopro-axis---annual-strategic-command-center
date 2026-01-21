import React from 'react';
import Icon from '../Icon';
import { AuditLog } from '../../types';

interface AuditLogModalProps {
  isOpen: boolean;
  auditLogs: AuditLog[];
  onClose: () => void;
}

/**
 * 审计日志 Modal 组件
 */
export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  auditLogs,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9998] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
              <Icon name="log" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">
                System Audit Logs
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Tracking all modifications and access
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
        <div className="flex-1 overflow-auto custom-scrollbar p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Timestamp
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  User
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Action
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Target
                </th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr
                  key={log.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">
                      {log.userName}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.action === 'DELETE'
                          ? 'bg-rose-100 text-rose-700'
                          : log.action === 'UPDATE'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600">
                    <span className="text-[9px] text-slate-400 mr-2 uppercase">
                      {log.targetType}
                    </span>
                    {log.targetName}
                  </td>
                  <td className="p-4 text-xs text-slate-500">{log.details}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-400 italic text-xs"
                  >
                    No logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
