# Schema UniApp SaaS Factory

一套 **uni-app 微信小程序**模板，通过租户 schema 在编译前生成 `pages.json`、`manifest.json`、tabBar、模块入口和运行时配置，实现多租户小程序按需构建。

## 快速开始

```bash
npm install
npm run build:app1
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run dev -- --tenant=app1` | 生成 App1 配置并启动 uni-app `mp-weixin` 开发模式 |
| `npm run build -- --tenant=app1` | 生成 App1 配置并构建微信小程序产物 |
| `npm run dev:app1` / `npm run dev:app2` | 指定租户开发快捷命令 |
| `npm run build:app1` / `npm run build:app2` | 指定租户构建快捷命令 |
| `npm run validate:schema` | 校验内置租户 schema |
| `npm run typecheck` / `npm run lint` / `npm test` | 类型、静态检查和测试 |

构建产物在：

```txt
apps/miniapp-template/dist/build/mp-weixin/
```

用微信开发者工具导入该目录即可预览。

## 生成文件不要提交

每次 `dev` / `build` 都会先按租户生成本地文件：

```txt
apps/miniapp-template/src/generated/*
apps/miniapp-template/src/pages.json
apps/miniapp-template/src/manifest.json
apps/miniapp-template/dist/
```

这些都是本地构建产物，已被 `.gitignore` 忽略。提交前可运行：

```bash
npm run guard:artifacts
```

## Page A 模块导航

Page A 从生成的 `pages.config.ts` 读取当前租户配置的模块列表并按顺序渲染。`module-a` 只在生成的 `route.config.ts` 注册了 Page D 路由时才触发 `uni.navigateTo`，避免跳转到未进入当前租户包的页面。

## 租户裁剪规则

- `app1`：主包只放页面 A；分包包含页面 B/C/D；页面 A 额外渲染 `module-a`，点击进入页面 D
- `app2`：主包只放页面 A；分包包含页面 B/D；页面 A 不渲染 `module-a`
- `pages.json` 只包含当前租户启用的主包页面、分包和 tabBar
- `module-entry.ts` 只静态导入当前租户使用的模块

## Runner dry-run

这些命令模拟批量构建、上传和发布，不会调用外部小程序服务：

```bash
npm run build:tenant -- --tenant=app1
npm run batch:build -- --tenants=app1,app2
npm run upload:tenant -- --tenant=app1 --dry-run
npm run release:tenant -- --tenant=app1 --dry-run
```
