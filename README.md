# LanAI

运行于 **Xiaomi Watch S3** 的轻量级 AI 聊天应用，基于 **Xiaomi Vela JS（vela-pre4.0）** 平台，支持 **DeepSeek** / **GLM** 双 AI Provider 切换。
**注意** 此为alpha版，有bug。

> 版本：0.6 | 作者：LanZX | 包名：`com.lanai.watch`

## 功能

- **会话管理** — 新建、查看、长按删除聊天，会话列表自动按最近更新时间排序
- **AI 对话** — 文字输入、发送消息、流式伪回复（Loading 状态）、错误回退与重试提示
- **双 Provider 切换** — DeepSeek / GLM 全局切换，各自独立配置 API Key
- **本地持久化** — 会话及消息自动保存

## 操作指南

| 操作 | 方式 |
|------|------|
| 新建聊天 | 首页点击 **+ New Chat** 按钮 |
| 发送消息 | 进入聊天页 → 点击输入框弹出键盘 → 输入文字 → 点击 **Send** |
| 删除聊天 | 在首页长按目标聊天卡片，提示 "Chat deleted" 即完成 |
| 进入设置 | 首页顶部点击 **LanAI** 标题 |
| 切换模型 | 设置 → **模型选择** → 点击 DeepSeek 或 GLM |
| 配置 API Key | 设置 → **API** → 点击输入框 → 输入 Key → 点击 **Save** |
| 重置 API Key | API 设置页 → 点击 绿色的custom按钮 → 恢复为默认 Key |

## 目录结构

```
src/
├── app.ux                      # 应用入口（仅 onCreate/onDestroy 日志）
├── manifest.json                # 包配置、权限声明、路由表
│
├── pages/
│   ├── index/                   # 首页 —— 会话列表
│   ├── chat/                    # 聊天页 —— 消息气泡 + 自定义键盘 + API 调用
│   ├── chat-list/               # 备用会话列表（引入 services/chat.js 的版本）
│   ├── settings/                # 设置菜单（API / 模型选择 / 关于）
│   ├── settings-api/            # API Key 配置（DeepSeek + GLM 分别设置）
│   ├── settings-model/          # Provider 切换（DeepSeek ↔ GLM）
│   └── settings-about/          # 关于页面（版本、作者信息）
│
├── components/
│   ├── message-item/            # 聊天气泡组件（占位，当前 MVP 内联在 chat 页）
│   └── loading/                 # 加载动画组件（占位，当前使用内联 Thinking... 状态）
│
├── services/
│   ├── deepseek.js              # AI API 请求（双 Provider 路由 + 超时控制 + 回退解析）
│   ├── storage.js               # 本地存储读写（缓存、去重、JSON 解析/容错）
│   └── chat.js                  # 会话管理（CRUD + 消息追加 + 自动裁剪 + 列表同步）
│
├── utils/
│   ├── constants.js             # 常量（endpoint、model、Key、max_tokens、超时、限制）
│   ├── time.js                  # 时间工具（now、formatTime）
│   └── uuid.js                  # ID 生成（Math.random + Date.now）
│
├── InputMethod/                 # 小米输入法组件
│   ├── InputMethod.ux           # 键盘模板 + 逻辑 + 样式
│   └── assets/                  # 键盘图片资源 + 字典工具
│
└── common/                      # 静态资源（logo 等）
```

## AI Provider

| Provider | Endpoint | 模型 | max_tokens |
|----------|----------|------|------------|
| DeepSeek | `https://api.deepseek.com/chat/completions` | `deepseek-v4-flash` | 2048 |
| GLM（智谱） | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | `glm-4.7` | 1024 |

- **切换方式**：首页标题 → 设置 → 模型选择，全局生效
- **API Key**：默认 Key 从 `.env` 注入（`quickapp.config.js` → DefinePlugin）；用户在设置 → API 页输入的 Key 存储在 `@system.storage`，优先级更高
- **System Prompt**：根据 `max_tokens` 动态计算字数上限（`Math.floor(maxTokens / 1.5)`），提示 AI 保持回复简洁、适合小屏幕阅读、不使用 markdown

## 数据流

```
用户输入 → InputMethod 键盘
  ↓
chat/index.ux 接收字符 → appendUserMessage() 持久化
  ↓
getApiConfig() 读取 storage（Provider + Key + endpoint + model + maxTokens）
  ↓
sendChatMessage() → @system.fetch POST → AI API（10s 超时）
  ├─ 成功 → parseResponse() 提取 content → replaceMessage() 替换 Loading 占位
  └─ 失败 → replaceMessage() 替换为错误提示 "Network error, please retry"
  ↓
appendAssistantMessage() / saveFullChat() → 持久化 + 同步 chat_list 索引
```

## 存储模型

`@system.storage` 为 Key-Value 结构，使用以下 Key：

| Key | 内容 | 说明 |
|-----|------|------|
| `chat_list` | `[{id, title, preview, updateTime}]` | 会话摘要列表 |
| `chat_{id}` | `{id, title, createTime, updateTime, messages[]}` | 单会话完整数据 |
| `current_chat_id` | 字符串 | 当前活跃会话指针 |
| `settings_api_key` | 字符串 | DeepSeek 自定义 API Key |
| `settings_glm_api_key` | 字符串 | GLM 自定义 API Key |
| `settings_model_provider` | `"deepseek"` 或 `"glm"` | 当前选用的 Provider |

### 限制

- 单会话最多 **50 条**消息，超量自动裁剪（保留最新）
- 单次输入最大 **200 字**
- 请求超时 **10 秒**，无内置自动重试
- 会话标题默认为 "New Chat"，首条用户消息前 16 字自动设为标题

### 配置 API Key

1. 在项目根目录创建 `.env` 文件：

```env
ENV_DEEPSEEK_API_KEY=sk-your-deepseek-key
ENV_GLM_API_KEY=your-glm-key
```

2. `quickapp.config.js` 通过 DefinePlugin 将这些变量注入为 `process.env.ENV_*`，供 `src/utils/constants.js` 读取
3. 用户也可在手表端 **设置 → API** 页面覆盖 Key（保存在本地存储中，优先级高于 `.env` 默认值）

## 许可证

GNU General Public License v3.0
