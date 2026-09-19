# 版本留痕规则

项目交付目录固定为：

```text
桌面/Vibe Coding/浮想/
├─ current/             当前可修改工作版
├─ versions/
│  └─ v1.0.0/          每次发布的完整快照
├─ CHANGELOG.md         每一版改了什么
└─ 启动浮想.bat        双击启动 current
```

今后每次修改遵守四步：

1. 只在 `current/` 修改。
2. 在 `current/VERSION` 与 `package.json` 提升版本号。
3. 在 `CHANGELOG.md` 顶部记录日期、功能和已知限制。
4. 运行 `npm.cmd run check` 通过后，把 `current/` 完整复制为 `versions/vX.Y.Z/`。

密钥只放在部署平台的 Environment Variables 中。`.env.local` 即使被 `.gitignore` 排除，也不进入 `versions/` 快照。
