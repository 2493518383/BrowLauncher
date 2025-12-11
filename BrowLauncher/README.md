# App Launcher - 浏览器应用启动器

一个类似 Dawn Launcher 的浏览器插件，可以通过浏览器快速启动本地应用程序。

## 功能特性

- 📁 分类管理：自定义应用分类
- 🚀 快速启动：一键启动本地程序
- ✏️ 灵活编辑：支持添加、编辑、删除应用和分类
- 💾 数据持久化：配置自动保存到浏览器本地存储
- 🎨 美观界面：简洁现代的 UI 设计

## 安装步骤

### 1. 安装浏览器插件

1. 打开 Chrome/Edge 浏览器
2. 进入扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `extension` 文件夹
6. 记录显示的**扩展ID**（32位字母字符串）

### 2. 安装本地消息服务

> ⚠️ 需要已安装 Python 3.x

1. 进入 `native-host` 文件夹
2. **以管理员身份**运行 `install.bat`
3. 按提示输入上一步获取的扩展ID
4. 等待安装完成
5. **重启浏览器**

## 使用方法

1. 点击浏览器工具栏中的插件图标
2. 左侧是分类列表，点击切换分类
3. 右侧显示当前分类下的应用，点击即可启动
4. 使用顶部按钮添加分类或应用
5. 鼠标悬停在分类/应用上可显示编辑按钮

## 添加应用示例

| 应用名称 | 路径示例 |
|---------|---------|
| 记事本 | `notepad.exe` |
| 计算器 | `calc.exe` |
| CMD | `cmd.exe` |
| VSCode | `C:\Program Files\Microsoft VS Code\Code.exe` |
| Chrome | `C:\Program Files\Google\Chrome\Application\chrome.exe` |

## 文件结构

```
AppLauncher/
├── extension/           # 浏览器插件
│   ├── manifest.json    # 插件配置
│   ├── popup.html       # 弹出窗口
│   ├── popup.css        # 样式
│   ├── popup.js         # 逻辑
│   └── icons/           # 图标
├── native-host/         # 本地消息服务
│   ├── host.py          # Python 服务程序
│   ├── install.bat      # 安装脚本
│   ├── uninstall.bat    # 卸载脚本
│   └── com.applauncher.host.json  # Native Messaging 配置
└── README.md
```

## 卸载

1. 在浏览器扩展页面移除插件
2. 运行 `native-host/uninstall.bat` 清理注册表

## 注意事项

- 浏览器插件出于安全限制无法直接启动本地程序，必须配合 Native Messaging Host 使用
- 如果提示「未找到本地服务」，请确保已运行 install.bat 并重启浏览器
- 应用路径支持系统 PATH 中的程序（如 notepad.exe）或完整路径

## 技术原理

```
[浏览器插件] <--Native Messaging--> [Python Host] --> [启动程序]
```

浏览器通过 Native Messaging API 与本地 Python 脚本通信，由 Python 脚本执行实际的程序启动操作。
