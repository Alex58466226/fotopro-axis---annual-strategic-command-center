# Supabase 数据保存失败 - 诊断指南

## 快速检查清单

### 1. 检查环境变量

打开浏览器控制台（F12），查看是否有以下错误：

```
❌ Supabase 环境变量未配置！
```

**解决方法**：
1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容：
```bash
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```
3. 重启开发服务器：`npm run dev`

### 2. 检查数据库表是否已创建

**在 Supabase Dashboard**：
1. 进入 **SQL Editor**
2. 执行 `supabase_schema.sql` 文件中的所有 SQL
3. 确认以下表已创建：
   - `profiles`
   - `strategies`
   - `tasks`
   - `task_reports`
   - `audit_logs`

### 3. 检查用户是否已登录

**错误信息**：`用户未登录。请先登录后再保存数据。`

**解决方法**：
1. 确保已注册并登录账号
2. 检查浏览器控制台，查看是否有认证错误

### 4. 检查 RLS（Row Level Security）策略

**可能错误**：`new row violates row-level security policy`

**解决方法**：
1. 在 Supabase Dashboard → **Authentication** → **Policies**
2. 确认以下策略已创建：
   - `Authenticated users can view strategies`
   - `Authenticated users can create strategies`
   - `Authenticated users can update strategies`
   - `Authenticated users can delete strategies`
   - （tasks、task_reports、audit_logs 同理）

### 5. 检查网络连接

**可能错误**：`Failed to fetch` 或 `Network error`

**解决方法**：
1. 检查 Supabase 项目是否正常运行
2. 检查防火墙/代理设置
3. 尝试在 Supabase Dashboard 中手动执行 SQL 查询测试连接

---

## 详细诊断步骤

### 步骤 1：检查控制台错误

打开浏览器开发者工具（F12）→ Console，查找：
- ❌ 红色错误信息
- ⚠️ 黄色警告信息

**常见错误**：

1. **`relation "strategies" does not exist`**
   - **原因**：数据库表未创建
   - **解决**：执行 `supabase_schema.sql`

2. **`new row violates row-level security policy`**
   - **原因**：RLS 策略阻止写入
   - **解决**：检查并更新 RLS 策略

3. **`JWT expired`** 或 **`Invalid API key`**
   - **原因**：环境变量配置错误
   - **解决**：检查 `.env.local` 文件

4. **`Failed to fetch`**
   - **原因**：网络问题或 Supabase 项目暂停
   - **解决**：检查 Supabase Dashboard 项目状态

### 步骤 2：测试 Supabase 连接

在浏览器控制台执行：

```javascript
// 检查环境变量
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置');

// 测试连接
const { data, error } = await supabase.from('strategies').select('count');
if (error) {
  console.error('连接失败:', error);
} else {
  console.log('连接成功！');
}
```

### 步骤 3：检查用户登录状态

在浏览器控制台执行：

```javascript
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  console.log('✅ 用户已登录:', session.user.email);
} else {
  console.log('❌ 用户未登录');
}
```

### 步骤 4：手动测试数据写入

在浏览器控制台执行：

```javascript
// 测试写入策略
const { data, error } = await supabase
  .from('strategies')
  .insert({
    id: 'test-' + Date.now(),
    level: 1,
    name: '测试策略',
    parent_id: null,
    status: 'active',
  })
  .select();

if (error) {
  console.error('写入失败:', error);
} else {
  console.log('写入成功:', data);
}
```

---

## 常见问题解决方案

### Q1: 环境变量已配置，但仍然报错

**可能原因**：
- Vite 需要重启才能读取新的环境变量
- 环境变量名称拼写错误

**解决**：
1. 停止开发服务器（Ctrl+C）
2. 重新运行 `npm run dev`
3. 确认 `.env.local` 文件在项目根目录

### Q2: 表已创建，但写入仍然失败

**可能原因**：
- RLS 策略未正确配置
- 用户未登录

**解决**：
1. 检查 Supabase Dashboard → Authentication → Policies
2. 确认策略允许 `authenticated` 用户进行 INSERT/UPDATE/DELETE
3. 确保用户已登录

### Q3: 登录后仍然提示"用户未登录"

**可能原因**：
- Session 未正确保存
- 浏览器禁用了 localStorage

**解决**：
1. 检查浏览器是否允许 localStorage
2. 清除浏览器缓存后重新登录
3. 检查控制台是否有认证错误

---

## 临时解决方案（如果 Supabase 不可用）

如果 Supabase 暂时无法使用，可以临时回退到 localStorage：

1. 在 `App.tsx` 中，将数据保存逻辑改回使用 `saveBatch`
2. 注释掉 Supabase 相关的保存代码
3. 使用 `storageService.ts` 的 `saveToStorage` 函数

**注意**：这只是临时方案，数据仍会存储在浏览器本地。

---

## 获取帮助

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. Supabase Dashboard 中的错误日志
3. `.env.local` 文件内容（隐藏敏感信息）
4. 执行的 SQL 脚本内容
