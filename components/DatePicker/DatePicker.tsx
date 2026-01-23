import React, { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

/**
 * 日期选择器组件，带日历弹窗
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '选择日期',
  className = '',
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00'); // 添加时间避免时区问题
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 格式化日期显示
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); // 添加时间避免时区问题
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 获取月份的第一天和最后一天
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // 填充上个月的日期（灰色显示）
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month, -i);
      days.unshift(prevMonth);
    }
    
    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // 填充下个月的日期（补齐到 6 行）
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  // 判断日期是否可选
  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 判断是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 判断是否被选中
  const isSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value + 'T00:00:00'); // 添加时间避免时区问题
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // 判断是否是当前月份
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear();
  };

  // 选择日期
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(formatDate(date));
    setIsOpen(false);
  };

  // 切换月份
  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };

  const days = getMonthDays(currentMonth);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* 输入框 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex-1 p-3 bg-white border border-orange-200/50 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-500 cursor-pointer hover:border-orange-300 transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-slate-700' : 'text-slate-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Icon name="calendar" size={14} className="text-orange-400" />
      </div>

      {/* 日历弹窗 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="chevron-left" size={16} className="text-slate-600" />
            </button>
            <div className="text-sm font-bold text-slate-700">
              {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="chevron-right" size={16} className="text-slate-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-[10px] font-bold text-slate-400 text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              if (!date) return <div key={idx} />;
              
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);
              const currentMonthDay = isCurrentMonth(date);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={`
                    w-9 h-9 text-xs font-bold rounded-lg transition-all
                    ${disabled
                      ? 'text-slate-200 cursor-not-allowed'
                      : selected
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : today
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                      : currentMonthDay
                      ? 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                      : 'text-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* 快捷操作 */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(formatDate(today));
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              今天
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
