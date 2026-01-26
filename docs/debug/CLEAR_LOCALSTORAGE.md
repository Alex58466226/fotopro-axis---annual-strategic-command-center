# 清理浏览器 localStorage 数据

如果刷新后仍然看到测试数据，可能是因为浏览器中还有旧的 localStorage 数据。

## 清理方法

### 方法 1：浏览器控制台清理（推荐）

1. 打开浏览器开发者工具（F12）
2. 切换到 Console（控制台）标签
3. 执行以下命令：

```javascript
// 清理所有 fotopro 相关的 localStorage 数据
Object.keys(localStorage).forEach(key => {
  if (key.includes('fotopro') || key.includes('axis')) {
    localStorage.removeItem(key);
    console.log('已删除:', key);
  }
});

// 清理完成后刷新页面
location.reload();
```

### 方法 2：手动清理

1. 打开浏览器开发者工具（F12）
2. 切换到 Application（应用程序）标签（Chrome）或 Storage（存储）标签（Firefox）
3. 找到 Local Storage
4. 删除所有以 `fotopro_axis` 开头的键
5. 刷新页面

### 方法 3：清除所有站点数据

1. 打开浏览器设置
2. 清除浏览数据
3. 选择"Cookie 和其他网站数据"
4. 清除后刷新页面

## 验证

清理后，刷新页面应该：
- 如果 Supabase 中有数据，会从 Supabase 加载
- 如果 Supabase 中没有数据，会显示空状态（不再显示测试数据）
