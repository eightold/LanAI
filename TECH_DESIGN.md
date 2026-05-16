# Xiaomi Watch S3 AI Chat App 技术设计文档

> 基于 Xiaomi Vela JS + DeepSeek API 的 AI 聊天应用技术方案

---

# 一、技术栈选择

---

# 1.1 总体技术架构

```text id="gqztc4"
┌─────────────────────┐
│ Xiaomi Watch S3 App │
│   (Vela JS)         │
└─────────┬───────────┘
          │ HTTPS
          ▼
┌─────────────────────┐
│ DeepSeek API        │
│ chat/completions    │
└─────────────────────┘
```

---

# 1.2 前端技术栈

| 技术             | 用途     |
| -------------- | ------ |
| Xiaomi Vela JS | 手表应用开发 |
| JavaScript ES6 | 业务逻辑   |
| CSS            | 页面样式   |
| JSON           | 数据存储   |
| Fetch API      | 网络请求   |

---

## 选择原因

### Xiaomi Vela JS

官方支持：

* Xiaomi Watch S3
* 圆形屏幕适配
* 本地存储
* 网络请求

支持：

* `fetch.fetch()`
* `storage.get/set()`

适合开发轻量级 Watch 应用。([iot.mi.com][1])

---

# 1.3 AI 服务

---

## DeepSeek API

采用：

```text id="f02xv0"
OpenAI Compatible API
```

接口：

```text id="c03y9i"
https://api.deepseek.com/chat/completions
```

---

## 模型选择

MVP 推荐：

```text id="1c0nqv"
deepseek-chat
```

原因：

* 成本低
* 响应快
* API 简单
* 与 OpenAI SDK 兼容

---

# 1.4 数据存储方案

---

## MVP 方案

使用：

```text id="a8b1od"
system.storage
```

进行本地 JSON 存储。

---

## 为什么不用数据库

原因：

* 数据量小
* 会话数量有限
* JSON 足够
* 降低复杂度

---

## 后续扩展

后续版本可升级：

| 方案        | 用途     |
| --------- | ------ |
| SQLite    | 大量聊天记录 |
| 云端同步      | 多设备同步  |
| IndexedDB | 若平台支持  |

---

# 1.5 网络层

---

## 请求方案

使用：

```js id="u3zw2m"
import fetch from '@system.fetch'
```

发送 HTTPS 请求。([iot.mi.com][1])

---

## 请求特点

| 项目    | 说明   |
| ----- | ---- |
| 请求方式  | POST |
| 数据格式  | JSON |
| 超时控制  | 必须实现 |
| HTTPS | 必须开启 |

---

# 1.6 开发工具

---

## IDE

推荐：

```text id="8nyfrg"
AIOT IDE
```

---

## 调试方式

支持：

* 模拟器调试
* 真机调试
* Console 日志

---

# 二、项目结构设计

---

# 2.1 项目目录结构

```text id="68z2r0"
src/
│
├── pages/
│   ├── chat-list/
│   │    ├── index.hml
│   │    ├── index.js
│   │    └── index.css
│   │
│   └── chat/
│        ├── index.hml
│        ├── index.js
│        └── index.css
│
├── components/
│   ├── message-item/
│   └── loading/
│
├── services/
│   ├── deepseek.js
│   ├── storage.js
│   └── chat.js
│
├── utils/
│   ├── time.js
│   ├── uuid.js
│   └── constants.js
│
├── assets/
│
├── app.js
└── manifest.json
```

---

# 2.2 模块职责说明

---

## pages/

页面层。

负责：

* 页面 UI
* 用户交互
* 页面状态

---

## components/

公共组件。

例如：

| 组件           | 用途   |
| ------------ | ---- |
| message-item | 聊天气泡 |
| loading      | 加载动画 |

---

## services/

业务逻辑层。

---

### deepseek.js

负责：

* API 请求
* AI 对话

---

### storage.js

负责：

* 本地存储
* 会话保存
* 删除聊天

---

### chat.js

负责：

* 聊天逻辑管理
* 会话切换
* 消息追加

---

## utils/

工具函数。

---

# 2.3 页面跳转关系

```text id="8lmhbg"
Chat List
   ↓
Chat Page
```

MVP 不建议页面层级过深。

原因：

* 手表操作复杂
* 页面切换成本高

---

# 三、数据模型设计

---

# 3.1 Chat 数据结构

---

## ChatSession

```ts id="v1hq1y"
interface ChatSession {
  id: string
  title: string
  createTime: number
  updateTime: number
  messages: Message[]
}
```

---

# 3.2 Message 数据结构

---

## Message

```ts id="hq6v8r"
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
```

---

# 3.3 Storage 数据结构

---

## 本地存储格式

```json id="jlwmu1"
{
  "chat_list": [
    {
      "id": "chat_001",
      "title": "天气问题",
      "createTime": 1710000000,
      "updateTime": 1710000010,
      "messages": [
        {
          "id": "msg_001",
          "role": "user",
          "content": "今天会下雨吗",
          "timestamp": 1710000001
        },
        {
          "id": "msg_002",
          "role": "assistant",
          "content": "今天不会下雨",
          "timestamp": 1710000002
        }
      ]
    }
  ]
}
```

---

# 3.4 DeepSeek Request Model

---

## Request

```json id="ysotlr"
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
```

---

## Response

```json id="k0c3y8"
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！"
      }
    }
  ]
}
```

---

# 四、关键技术点

---

# 4.1 手表性能限制

---

## 问题

Watch S3 属于轻量设备：

* CPU 性能有限
* 内存有限
* 后台能力有限

---

## 风险

如果：

* 页面层级太深
* 状态过多
* 动画复杂

可能导致：

```text id="1i4m6v"
卡顿
掉帧
崩溃
```

---

## 解决方案

---

### 1）减少页面复杂度

避免：

* 多层嵌套
* 大列表渲染

---

### 2）限制消息数量

建议：

```text id="mbpxx6"
单会话最多 50 条消息
```

超过后裁剪旧消息。

---

### 3）避免复杂动画

仅使用：

* Fade
* Translate

---

# 4.2 网络请求稳定性

---

## 问题

手表联网通常依赖：

* 蓝牙
* 手机代理

网络不稳定。

---

## 风险

可能出现：

* 超时
* 断连
* API 请求失败

---

## 解决方案

---

### 1）增加超时控制

建议：

```text id="mf4h53"
10 秒超时
```

---

### 2）增加 Retry 机制

失败后：

```text id="8v9mb2"
自动重试 1 次
```

---

### 3）错误状态 UI

必须有：

* loading
* timeout
* retry

---

# 4.3 本地存储问题

---

## 问题

storage 为 Key-Value 模型。([iot.mi.com][2])

不适合：

* 大数据
* 高频写入

---

## 风险

大量聊天记录可能导致：

* 写入慢
* 数据损坏

---

## 解决方案

---

### 1）减少写入频率

不要：

```text id="u5s5pb"
每输入一个字符都存储
```

而是：

```text id="0e9q8d"
发送消息后统一保存
```

---

### 2）分离存储

建议：

| Key       | 内容   |
| --------- | ---- |
| chat_list | 会话列表 |
| chat_xxx  | 单个聊天 |

避免整个 JSON 过大。

---

# 4.4 API Key 安全问题

---

## 问题

如果：

```text id="m8p5lp"
API Key 写死在前端
```

容易泄露。

---

## 风险

可能导致：

* Key 被盗
* API 被刷
* 产生费用

---

## 推荐方案（强烈建议）

```text id="j7lryq"
Watch App
   ↓
自建 Server
   ↓
DeepSeek API
```

由服务端管理 API Key。

---

## MVP 临时方案

如果必须前端调用：

* API Key 混淆
* 限制额度
* 设置速率限制

---

# 4.5 输入法问题

---

## 问题

手表输入效率较低。

不同地区：

* 输入法能力不同
* 拼音支持可能不同

---

## 风险

用户体验下降。

---

## 解决方案

---

### 1）增加快捷输入

例如：

```text id="4c0hnm"
你好
翻译一下
总结一下
```

---

### 2）限制输入长度

建议：

```text id="djlwmu"
最大 200 字
```

---

# 4.6 长文本渲染问题

---

## 问题

AI 回复可能很长。

手表屏幕很小。

---

## 风险

可能：

* 滚动卡顿
* 文本溢出

---

## 解决方案

---

### 1）文本分段

长文本自动换段。

---

### 2）限制 AI 输出长度

请求时：

```json id="xmnjlwm"
{
  "max_tokens": 300
}
```

---

# 4.7 页面状态同步

---

## 问题

聊天页面：

* 请求中
* 页面返回
* 再次进入

容易状态错乱。

---

## 风险

例如：

* loading 不消失
* 消息重复

---

## 解决方案

---

### 状态机管理

建议：

```text id="18lx1r"
idle
loading
success
error
```

统一管理请求状态。

---

# 4.8 流式输出（后续版本）

---

## 问题

Streaming 实现复杂。

部分设备：

* 不支持 WebSocket
* 不支持 SSE

---

## MVP 建议

第一版：

```text id="0v1v4n"
不要做 Streaming
```

直接等待完整回复。

---

# 五、推荐开发顺序

---

# 第一阶段

实现：

* Chat List
* Chat Page
* 输入发送
* API 请求
* 本地存储

---

# 第二阶段

优化：

* loading
* retry
* 动画
* 错误处理

---

# 第三阶段

扩展：

* Streaming
* 语音输入
* 多端同步

---

# 六、总结

本项目核心难点不在 AI。

真正难点在于：

```text id="g5x03r"
如何在低性能手表设备上
实现稳定、流畅、低功耗的聊天体验
```

开发重点应该优先关注：

1. 页面性能
2. 网络稳定性
3. 本地存储设计
4. 输入体验
5. API 安全性

MVP 阶段建议：

```text id="o4j36u"
先完成稳定可用
再逐步增加高级功能
```

[1]: https://iot.mi.com/vela/quickapp/en/features/network/fetch.html?utm_source=chatgpt.com "Data Request fetch | Xiaomi Vela JS APP"
[2]: https://iot.mi.com/vela/quickapp/en/features/data/storage.html?utm_source=chatgpt.com "Data Storage | Xiaomi Vela JS APP"
