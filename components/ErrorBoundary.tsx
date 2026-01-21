import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary 组件
 * 捕获子组件树中的 JavaScript 错误，记录这些错误，并显示降级 UI
 * 
 * 使用方式：
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到控制台（生产环境可以发送到错误监控服务）
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 在生产环境中，这里可以发送错误到监控服务
    // 例如：Sentry, LogRocket, 等
    if (process.env.NODE_ENV === 'production') {
      // TODO: 集成错误监控服务
      // reportErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    // 重置错误状态，尝试重新渲染
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // 重新加载页面
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">
                  应用出现错误
                </h1>
                <p className="text-sm text-slate-500">
                  很抱歉，应用遇到了一个意外错误
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <details className="cursor-pointer">
                  <summary className="text-sm font-bold text-slate-700 mb-2">
                    错误详情（仅开发环境显示）
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                        错误信息
                      </div>
                      <div className="text-xs font-mono text-rose-600 bg-white p-2 rounded border border-slate-200">
                        {this.state.error.toString()}
                      </div>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                          组件堆栈
                        </div>
                        <div className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 max-h-40 overflow-auto">
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
              >
                刷新页面
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                如果问题持续存在，请尝试清除浏览器缓存或联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
