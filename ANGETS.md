## 一、项目概述

### 1.1 产品信息

| 项目 | 内容 |
|------|------|
| 产品名称 | LanAI（暂定） |
| 目标设备 | Xiaomi Watch S3（圆形屏幕） |
| 技术平台 | Xiaomi Vela JS |
| AI 服务 | DeepSeek API (`deepseek-v4-flash`) / GLM API (`glm-5.1`) |
| 核心目标 | 轻量、快速、可用、低功耗 |

### 1.2 核心功能（MVP）

- 会话列表：展示历史聊天、新建聊天、删除聊天
- 聊天页面：消息展示、文字输入、AI 回复
- 本地存储：保存会话和消息记录
- AI API 接入：发送消息并获取回复（DeepSeek / GLM 双 Provider）

### 1.3 非功能性要求

| 指标 | 要求 |
|------|------|
| 冷启动 | ≤ 2s |
| 页面切换 | ≤ 300ms |
| API 响应 | ≤ 10s |
| 内存占用 | < 100MB |
| 稳定性 | 连续使用 30 分钟不崩溃 |

---

## 开发环境
- 操作系统：Windows
- 终端：PowerShell
- 请使用 Windows 兼容的命令


## 二、开发规范

### 2.1 目录结构（强制）
src/
├── pages/
│ ├── chat-list/ # 会话列表页
│ │ ├── index.hml
│ │ ├── index.js
│ │ └── index.css
│ └── chat/ # 聊天页
│ ├── index.hml
│ ├── index.js
│ └── index.css
├── components/ # 公共组件
│ ├── message-item/ # 聊天气泡
│ └── loading/ # 加载动画
├── services/ # 业务逻辑层
│ ├── deepseek.js # API 请求封装（多 Provider 路由 + reasoning 回退解析）
│ ├── storage.js # 本地存储操作
│ └── chat.js # 聊天逻辑管理
├── utils/ # 工具函数
│ ├── time.js # 时间格式化
│ ├── uuid.js # ID 生成
│ └── constants.js # 常量定义
├── assets/ # 静态资源
├── app.js
└── manifest.json

text

### 2.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | 小写 + 短横线 | `message-item.js` |
| 变量/函数 | camelCase | `getChatList()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_MESSAGES` |
| CSS 类名 | kebab-case | `.chat-bubble-user` |
| 页面 ID | 小写 + 短横线 | `chat-list` |

### 2.3 数据模型

```javascript
// ChatSession
{
  id: string,           // 唯一标识，如 "chat_001"
  title: string,        // 会话标题（自动生成）
  createTime: number,   // Unix 时间戳
  updateTime: number,   // Unix 时间戳
  messages: Message[]
}

// Message
{
  id: string,           // 唯一标识，如 "msg_001"
  role: 'user' | 'assistant',
  content: string,
  timestamp: number
}
2.4 存储规范
使用 system.storage 进行 JSON 存储

分离存储：chat_list 存储列表，chat_{id} 存储单个会话

单会话最多保留 50 条消息，超出后裁剪旧消息

写入时机：仅当消息发送/接收完成时写入，禁止高频写入

三、测试要求
3.1 功能验收
功能	验收标准
新建聊天	点击后创建新会话并跳转至聊天页
AI 回复	发送消息后正常获取 AI 回复（DeepSeek / GLM）并显示
历史记录	重启应用后会话和消息仍存在
删除聊天	长按/右滑后删除，数据不可恢复
输入功能	软键盘正常唤出，可输入并发送
3.2 稳定性验收
连续使用 30 分钟：无崩溃、无明显卡顿、无内存泄漏

网络异常场景：超时后显示错误提示，支持重试

数据损坏场景：自动重建空数据，不崩溃

3.3 性能测试
冷启动时间 ≤ 2s（模拟器 + 真机）

页面切换动画 ≤ 300ms

发送消息后 UI 不卡死，loading 正常显示

3.4 兼容性测试
圆形表盘 UI 适配（消息气泡、按钮不贴边）

深色主题下文字可读

蓝牙联网和 Wi-Fi 联网两种场景

四、代码风格
4.1 JavaScript 规范
使用 ES6 语法（let/const、箭头函数、模板字符串、解构）

每条语句末尾加分号

使用 === 和 !==，避免 ==

异步操作优先使用 async/await，避免回调地狱

javascript
// 推荐
async function sendMessage(text) {
  try {
    const response = await sendChatMessage(messages, done, fail, key, endpoint, model, maxTokens);
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// 避免
function sendMessage(text, callback) {
  // 回调方式
}
4.2 样式规范
使用 rpx 或 px 进行尺寸定义，确保圆形屏幕适配

按钮最小高度 44px（符合手指触控）

圆角统一使用 12px～16px

边距统一使用 8px～12px

字体大小：正文 14px，标题 18px

css
/* 推荐 */
.button {
  min-height: 44px;
  border-radius: 16px;
  padding: 10px 16px;
  font-size: 16px;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 16px;
}
4.3 注释规范
文件头部注释说明用途

函数注释使用 JSDoc 风格

复杂逻辑必须添加行内注释

javascript
/**
 * 发送消息到 AI API（根据 Provider 路由 DeepSeek / GLM）
 * @param {Array} messages - 消息历史
 * @param {Function} done - 成功回调
 * @param {Function} fail - 失败回调
 * @param {string} apiKey - API Key
 * @param {string} endpoint - API 端点
 * @param {string} model - 模型名称
 * @param {number} maxTokens - 最大 token 数
 */
function sendChatMessage(messages, done, fail, apiKey, endpoint, model, maxTokens) {
  // ...
}
4.4 错误处理规范
所有 fetch 调用必须包含 try-catch

网络错误、超时、API 错误分别给出明确提示

错误提示文案简洁友好，如 "网络异常，请重试"

javascript
// 标准错误处理模式
try {
  const result = await fetch(url, options);
  // 处理成功
} catch (err) {
  if (err.code === 'ETIMEDOUT') {
    showToast('请求超时');
  } else {
    showToast('网络错误，请重试');
  }
  // 上报日志（可选）
}
五、注意事项（关键风险点）
5.1 性能限制
问题	解决方案
手表 CPU/内存有限	避免多层嵌套、大列表渲染；单会话限制 50 条消息
动画导致卡顿	仅使用 Fade / Translate 轻量动画，避免复杂动效
高频写入存储	仅在消息发送/接收完成后写入，禁止实时写入
5.2 网络稳定性
问题	解决方案
蓝牙联网不稳定	设置 10 秒超时，失败后自动重试 1 次
API 请求慢	显示 loading 动画，不允许连续点击发送
断网场景	显示错误提示，提供重试按钮
5.3 API Key 安全（强烈警告）
禁止在前端代码中硬编码 API Key

当前状态：双 Provider（DeepSeek + GLM）各持独立 Key，通过设置页面分别输入保存

推荐方案：自建服务端代理，由服务端管理 Key

MVP 临时方案：混淆 + 限制额度 + 速率限制 + `constants.js` 存放默认 Key（用户可通过设置覆盖）

5.4 输入法限制
手表软键盘体验较差，建议增加快捷输入按钮（如"你好"、"翻译一下"）

限制单次输入最大 200 字符

发送后清空输入框并收起键盘

5.5 长文本处理
请求时按 Provider 设置 max_tokens：DeepSeek 300，GLM 1024（reasoning 模型需更大配额）

长文本自动换段，确保圆形屏幕内不溢出

5.6 页面状态同步
使用状态机管理请求状态：idle → loading → success / error

页面切换时取消进行中的请求，避免状态残留

javascript
const RequestState = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};
5.7 流式输出（Streaming）
MVP 版本不做流式输出，直接等待完整回复

后续版本如需支持，需确认 Vela JS 是否支持 SSE / WebSocket

5.8 圆形屏幕适配
避免将重要内容放在屏幕四角边缘（被圆角裁切风险）

使用 padding 留出安全边距

列表内容使用圆形裁剪或渐变遮罩优化边缘显示

六、开发顺序建议
Phase 1（MVP）
搭建项目结构 + 页面路由

实现会话列表（展示、新建、删除）

实现聊天页面（消息展示、输入框）

接入 AI API（非流式，DeepSeek + GLM 双 Provider）

实现本地存储（保存/加载会话）

Phase 2（稳定性优化）
增加 loading 状态和错误处理

增加重试机制

优化动画效果（Fade / Slide Up）

限制消息数量和文本长度

Phase 3（扩展功能，可选）
流式输出

语音输入

快捷指令

云端同步

七、附录
7.1 常用 API 参考
功能	调用方式
网络请求	import fetch from '@system.fetch'
本地存储	import storage from '@system.storage'
页面跳转	router.push('/pages/chat/index')
提示框	showToast({ message: '...' })
7.2 调试建议
使用 AIOT IDE 模拟器进行基础调试

真机调试时开启 Console 日志输出

使用 console.time/timeEnd 监控关键函数耗时

7.3 参考文档
Xiaomi Vela JS 官方文档 

DeepSeek API 文档 https://api-docs.deepseek.com/
GLM API 文档 https://docs.bigmodel.cn/

本指南适用于 AI Agent 辅助开发及团队协作。遇到未覆盖问题，请优先遵循"简洁、稳定、低功耗"的核心原则。
## Vela pre4.0 Debug Notes

When debugging on `vela-pre4.0`, if the screen is black/white and the DevTools Elements panel is empty, do not assume it is a CSS or page layout issue. Empty Elements usually means the entry page did not mount.

Known recovery workflow:

1. First replace the entry page with a static smoke page: no `@system.*` imports, no service imports, no storage/fetch/router calls.
2. Keep the entry path conservative: use `pages/index` instead of a hyphenated route such as `pages/chat-list`.
3. Verify that the smoke page appears in both screen and Elements. The tested text was `LanAI / pre4 smoke page`.
4. Add features back one layer at a time. Start with static UI, then router navigation, then local page state, then storage, then network.
5. Avoid static-importing heavy service chains from the entry page on pre4.0. A static import of chat services can pull in `system.storage`, `system.fetch`, and API modules before the first render, causing the entry page to fail before Elements has nodes.
6. Prefer callback-style code for pre4.0 compatibility. Avoid `async/await`, `Promise`, object spread, dynamic class binding, and complex template expressions in first-render paths.
7. If a smoke page renders but the full page does not, the issue is likely an imported system module, route configuration, or startup-side effect rather than the package format.
8. If even the smoke page does not render, check package name, stale installed RPK, start page, and AIOT toolkit compatibility with the selected `vela-pre4.0` image.

---
