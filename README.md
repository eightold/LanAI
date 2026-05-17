# LanAI

基于 Xiaomi Vela JS 的 AI 聊天应用，运行于 Xiaomi Watch S3，支持 DeepSeek / GLM 双 AI Provider。

## 功能

- **会话列表** — 新建、查看、长按删除聊天
- **聊天页面** — 文字输入、发送消息、AI 回复、loading 状态
- **模型切换** — DeepSeek / GLM 全局切换，各自独立 API Key
- **本地存储** — 会话及消息自动保存，重启不丢失

## 技术栈

| 层 | 技术 |
|---|---|
| 平台 | Xiaomi Vela JS（`vela-pre4.0`） |
| 语言 | JavaScript ES6（callback 风格） |
| UI | HML + CSS（深色主题，圆形表盘适配） |
| 网络 | `@system.fetch`（HTTPS POST） |
| 存储 | `@system.storage`（JSON Key-Value） |
| AI API | DeepSeek / GLM（OpenAI 兼容格式） |
| 输入法 | 自定义 QWERTY 键盘组件 |

## 目录结构

```
src/
├── pages/
│   ├── index/              # 首页 —— 会话列表
│   ├── chat/               # 聊天页
│   ├── settings/           # 设置列表
│   ├── settings-api/       # API Key 配置（DeepSeek + GLM）
│   ├── settings-model/     # Provider 切换
│   └── settings-about/     # 关于页面
│
├── components/
│   ├── message-item/       # 聊天气泡组件
│   └── loading/            # 加载动画组件
│
├── services/
│   ├── deepseek.js         # API 请求（多 Provider 路由 + reasoning 回退解析）
│   ├── storage.js          # 本地存储读写
│   └── chat.js             # 会话管理（CRUD + 消息追加）
│
├── utils/
│   ├── constants.js        # 常量（endpoint、model、Key、max_tokens 等）
│   ├── time.js             # 时间工具
│   └── uuid.js             # ID 生成
│
├── InputMethod/            # 自定义输入法组件
├── common/                 # 静态资源（logo 等）
├── app.ux                  # 应用入口
└── manifest.json           # 应用配置 + 路由注册
```

## AI Provider

| Provider | Endpoint | 默认模型 | max_tokens |
| -------- | -------- | -------- | ---------- |
| DeepSeek | `api.deepseek.com` | `deepseek-v4-flash` | 300 |
| GLM（智谱） | `open.bigmodel.cn` | `glm-5.1` | 1024 |

切换方式：**首页标题 "LanAI" → 设置 → 模型选择**，全局生效。API Key 在 **设置 → API** 中分别配置。

## 数据流

```
用户输入 → chat/index.ux
  ├─ 追加 loading 占位消息
  ├─ getApiConfig() 读取 storage（Provider + Key + endpoint + model + maxTokens）
  └─ sendChatMessage() → fetch POST → AI API
       ├─ 成功 → replaceMessage（替换占位为回复）
       └─ 失败 → replaceMessage（替换为错误提示）
```

## 开发

```bash
# 使用 AIOT IDE 打开项目
# 模拟器选择 vela-pre4.0 镜像
# entry page: pages/index
```

### 要点

- pre4.0 兼容：使用 callback + `function() {}.bind(this)` 风格，避免 `async/await`、`Promise`、对象展开
- 单会话最多 50 条消息，超量自动裁剪
- 单次输入最大 200 字
- 网络超时 10 秒，失败自动重试 1 次
