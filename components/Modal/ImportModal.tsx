import React, { useState, useRef } from 'react';
import Icon from '../Icon';
import { ImportResult, MergeStrategy, parseCSV, importFromCSV, importFromJSON, validateImportData } from '../../services/importService';
import { StrategyNode, Task } from '../../types';
import { downloadTemplate } from '../../services/templateService';

interface ImportModalProps {
  isOpen: boolean;
  existingStrategies: StrategyNode[];
  existingTasks: Task[];
  onClose: () => void;
  onImport: (strategies: StrategyNode[], tasks: Task[]) => void;
}

/**
 * 数据导入 Modal 组件
 */
export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  existingStrategies,
  existingTasks,
  onClose,
  onImport,
}) => {
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('append');
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(null);
    setIsProcessing(true);

    try {
      const text = await file.text();

      if (fileType === 'csv') {
        // 解析 CSV
        const csvRows = parseCSV(text);
        const result = importFromCSV(csvRows, existingStrategies, existingTasks, mergeStrategy);
        
        // 验证数据
        const validation = validateImportData(result.strategies, result.tasks);
        if (!validation.valid) {
          result.errors.push(...validation.errors);
          result.success = false;
        }

        setPreview(result);
      } else {
        // 解析 JSON
        const jsonData = JSON.parse(text);
        const result = importFromJSON(jsonData, existingStrategies, existingTasks, mergeStrategy);
        
        // 验证数据
        const validation = validateImportData(result.strategies, result.tasks);
        if (!validation.valid) {
          result.errors.push(...validation.errors);
          result.success = false;
        }

        setPreview(result);
      }
    } catch (err: any) {
      setError(err.message || '文件解析失败');
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!preview || !preview.success) {
      setError('请先选择并预览文件');
      return;
    }

    onImport(preview.strategies, preview.tasks);
    handleClose();
  };

  const handleClose = () => {
    setFileType('csv');
    setMergeStrategy('append');
    setPreview(null);
    setError('');
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-800">导入数据</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 文件类型选择 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              文件类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fileType"
                  value="csv"
                  checked={fileType === 'csv'}
                  onChange={(e) => {
                    setFileType('csv');
                    setPreview(null);
                    setError('');
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-slate-700">CSV 文件</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fileType"
                  value="json"
                  checked={fileType === 'json'}
                  onChange={(e) => {
                    setFileType('json');
                    setPreview(null);
                    setError('');
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-slate-700">JSON 文件（完整备份）</span>
              </label>
            </div>
          </div>

          {/* 合并策略 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              数据合并策略
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mergeStrategy"
                  value="append"
                  checked={mergeStrategy === 'append'}
                  onChange={(e) => {
                    setMergeStrategy('append');
                    setPreview(null);
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">追加</span>
                  <p className="text-xs text-slate-500">新数据添加到现有数据后面，保留所有数据</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mergeStrategy"
                  value="overwrite"
                  checked={mergeStrategy === 'overwrite'}
                  onChange={(e) => {
                    setMergeStrategy('overwrite');
                    setPreview(null);
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">覆盖</span>
                  <p className="text-xs text-slate-500">用新数据覆盖相同 ID 的现有数据</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mergeStrategy"
                  value="skip"
                  checked={mergeStrategy === 'skip'}
                  onChange={(e) => {
                    setMergeStrategy('skip');
                    setPreview(null);
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">跳过</span>
                  <p className="text-xs text-slate-500">跳过已存在的数据，只导入新数据</p>
                </div>
              </label>
            </div>
          </div>

          {/* 文件选择 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                选择文件
              </label>
              <button
                type="button"
                onClick={() => downloadTemplate(fileType)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                title={`下载 ${fileType.toUpperCase()} 导入模板`}
              >
                <Icon name="download" size={14} />
                下载模板
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={fileType === 'csv' ? '.csv' : '.json'}
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="mt-2 text-xs text-slate-500">
              提示：点击"下载模板"查看正确的数据格式，然后按照模板填写数据
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="alert" size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-800">错误</p>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 处理中 */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm text-blue-700">正在解析文件...</p>
              </div>
            </div>
          )}

          {/* 预览结果 */}
          {preview && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg ${
                preview.success ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-2">
                  <Icon 
                    name={preview.success ? "check" : "alert"} 
                    size={20} 
                    className={`flex-shrink-0 mt-0.5 ${
                      preview.success ? 'text-emerald-600' : 'text-amber-600'
                    }`} 
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      preview.success ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {preview.success ? '预览成功' : '预览完成（有错误）'}
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className={preview.success ? 'text-emerald-700' : 'text-amber-700'}>
                        策略: +{preview.stats.strategiesAdded} / 更新{preview.stats.strategiesUpdated} / 跳过{preview.stats.strategiesSkipped}
                      </p>
                      <p className={preview.success ? 'text-emerald-700' : 'text-amber-700'}>
                        任务: +{preview.stats.tasksAdded} / 更新{preview.stats.tasksUpdated} / 跳过{preview.stats.tasksSkipped}
                      </p>
                      <p className={preview.success ? 'text-emerald-700' : 'text-amber-700'}>
                        报告: +{preview.stats.reportsAdded}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 错误列表 */}
              {preview.errors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium text-rose-800 mb-2">错误 ({preview.errors.length})</p>
                  <ul className="space-y-1 text-xs text-rose-700">
                    {preview.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 警告列表 */}
              {preview.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium text-amber-800 mb-2">警告 ({preview.warnings.length})</p>
                  <ul className="space-y-1 text-xs text-amber-700">
                    {preview.warnings.map((warn, i) => (
                      <li key={i}>• {warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || !preview.success || isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};
