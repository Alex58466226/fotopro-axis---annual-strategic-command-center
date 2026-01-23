import React from 'react';
import { User } from './types';

// 基础项目年份为 2026
// 为了增加 20% 的回顾预留（约 73 天），我们将起始日期提前至 2025-10-20
export const PROJECT_START = "2025-10-20"; 
export const PROJECT_END = "2026-12-31";
export const TODAY_STR = "2026-01-07";

export const ICONS = {
  right: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
  user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M16 3.13a4 4 0 0 1 0 7.75 M23 21v-2a4 4 0 0 0-3-3.87" />,
  calendar: <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2v4M8 2v4M3 10h18" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  alert: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  check: <path d="M20 6 9 17 4 12" />,
  layers: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5-10-5M2 12l10 5-10-5" />,
  sparkles: <path d="m12 3 1.912 5.886 6.182.015-4.994 3.65 1.9 5.86L12 14.75l-5 3.66 1.9-5.86-4.994-3.65 6.182-.015z" />,
  search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  fileText: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />,
  edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  maximize: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  log: <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11 M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8" />,
  lock: <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5-9V6a5 5 0 0 0-10 0v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  barChart: <path d="M3 3v18h18M7 16l4-4 4 4 6-6M7 12h10" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  'trending-up': <path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />,
  clock: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  info: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
};

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', role: 'Admin', avatarColor: 'bg-indigo-500' },
  { id: 'u2', username: 'user', password: '123', role: 'User', avatarColor: 'bg-emerald-500' },
  { id: 'u3', username: 'viewer', password: '123', role: 'Viewer', avatarColor: 'bg-orange-500' }
];

export const AVATAR_COLORS = [
  'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
  'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
  'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-rose-500'
];

export const formatDate = (dateInput: Date | number | string) => {
  try {
    const d = new Date(dateInput);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return "2026-01-01";
  }
};

/**
 * 根据日期计算在甘特图时间轴上的偏移量
 */
export const getDayOffset = (dateStr: string, pxPerDay: number) => {
  const start = new Date(PROJECT_START).getTime();
  const target = new Date(dateStr).getTime();
  const diffDays = (target - start) / (1000 * 60 * 60 * 24);
  return diffDays * pxPerDay;
};

export const calculateGanttPos = (start?: string, end?: string) => {
  if (!start || !end) return { left: 0, width: 0, today: 0 };
  try {
    const ps = new Date(PROJECT_START).getTime();
    const pe = new Date(PROJECT_END).getTime();
    const total = pe - ps;
    const getX = (d: string) => {
      const time = new Date(d).getTime();
      return ((time - ps) / total) * 100;
    };
    const left = getX(start);
    const width = Math.max(getX(end) - left, 0.5);
    const today = getX(TODAY_STR);
    return { left: Math.max(0, left), width, today };
  } catch (e) {
    return { left: 0, width: 0, today: 0 };
  }
};

export const getWeekRange = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setUTCDate(diff);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  } catch (e) {
    return { start: dateStr, end: dateStr };
  }
};

export const getMonthRange = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    
    // First day of the month
    const start = new Date(Date.UTC(year, month, 1));
    // Last day of the month (day 0 of next month)
    const end = new Date(Date.UTC(year, month + 1, 0));
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  } catch (e) {
    return { start: dateStr, end: dateStr };
  }
};
