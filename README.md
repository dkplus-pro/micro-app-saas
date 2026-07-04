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

> 注意：请导入 `dist/build/mp-weixin/`，不要导入仓库根目录或 `apps/miniapp-template/`。构建脚本会在微信小程序产物的 `app.json` 中保留 `subPackages` 字段，以兼容部分开发者工具版本的配置读取逻辑。

## 生成文件不要提交

每次 `dev` / `build` 都会先按租户生成本地文件：

```txt
apps/miniapp-template/src/generated/*
apps/miniapp-template/src/pages.json
apps/miniapp-template/src/manifest.json
apps/miniapp-template/src/pages/module-assets/module-entry.ts
apps/miniapp-template/dist/
```

这些都是本地构建产物，已被 `.gitignore` 忽略。提交前可运行：

```bash
npm run guard:artifacts
```

## Schema 用法与含义

租户 schema 放在：

```txt
schemas/tenants/app1.schema.json
schemas/tenants/app2.schema.json
```

构建命令会按 `--tenant=<id>` 读取对应 schema，先生成租户配置，再启动 uni-app 编译。例如：

```bash
npm run build -- --tenant=app1
npm run dev -- --tenant=app2
```

常用字段：

| 字段 | 含义 |
| --- | --- |
| `tenant` | 租户元信息，`tenantId` 必须和文件名/命令参数对应，`tenantName` 用于展示和生成描述 |
| `app` | 小程序应用信息，包含 `appKey`、微信 `appid`、应用名和版本号 |
| `tabs` | 底部 tabBar 配置；每项通过 `page` 指向 `pages` 里的页面 key |
| `pages` | 页面开关、路由、标题、分包归属和页面模块配置 |
| `features` | 功能开关；页面或模块被 schema 引用时，对应 feature 不能是 `false` |
| `runtime` | 运行时配置，例如主题色 `themeColor`、接口地址 `apiBase`、租户资源 `assets` |
| `release` | 上传、审核、发布等流水线开关；当前 runner 默认 dry-run |

### Schema contract migration notes

当前内置 JSON schema 仍兼容既有 `pages` 对象写法和 `features` 开关，以便后续由后台产出 JSON 后继续走同一套运行时校验。新的 schema 设计方向是把“结构组合”和“业务能力开关”分开：

- 首选页面结构会迁移到 `pages` 数组，每一项显式声明 `key`，例如 `{ "key": "page-a", "route": "pages/page-a/index", ... }`。生成器/校验层应先归一化为按 `key` 索引的内部结构，再保持现有 pages、tabBar、subPackages 输出行为。
- 页面是否进入包、tabBar 指向哪里、模块挂在哪个页面，由 `pages`、`tabs` 和页面 `modules` 决定；不要用页面级 feature 开关推断结构。
- 业务/运行时能力开关建议迁移到 `capabilities`；旧的 `features` 仍作为 JSON 兼容输入保留，特别是 `moduleA` / `moduleB` 这类模块开关为 `false` 时，校验仍会拒绝引用该模块的页面。
- TS-first authoring 可以生成同形 JSON 给构建和后台校验复用；提交源 schema / 测试 / 文档即可，不提交生成出的本地产物。

`pages` 中每个页面的关键字段：

| 字段 | 含义 |
| --- | --- |
| `route` | uni-app 页面路径，格式为 `pages/<page>/index` |
| `title` | 生成到 `pages.json` 的导航栏标题 |
| `enabled` | 是否进入当前租户构建；`false` 的页面不会进入 `pages.json` / 路由表 |
| `package` | `main` 表示主包，`subPackage` 表示分包 |
| `subPackageRoot` | 可选；自定义分包 root。未填时默认用页面目录，例如 `pages/page-d` |
| `layout` | 页面布局提示，目前支持 `standard` / `stream` |
| `modules` | 当前页面静态引用的模块列表；只引用启用租户需要的模块 |

当前规则：

- tab 页面必须在主包，因为微信小程序 tabBar 不能指向分包页面。
- 非 tab 的启用页面默认进入分包；需要跳转到分包页时，目标页面仍必须 `enabled: true`。
- `module-entry.ts` / `home-module-renderer.vue` 只生成首页 Page A 引用的模块，避免首页/主包静态加载其它模块。
- 首页没有引用、但其它页面引用的模块会进入 `subpackage-module-entry.ts`，并同步生成到技术分包 `pages/module-assets/module-entry.ts`。
- 当存在首页未引用模块时，生成器会自动追加隐藏技术分包 `pages/module-assets`；tab 页面仍保留在主包，模块入口则从分包侧承载。
- 同一页面位置展示不同租户图片时，把图片放到 `apps/miniapp-template/src/assets/tenants/<tenantId>/`，再在 schema 的 `runtime.assets.pageAImage.src` 配置 `assets/...` 路径；生成器会生成 `page-a-assets.ts` 静态 import 当前租户资源，Page A 在固定位置渲染。
- `module-a` 在 Page A 上可通过 `props.targetPage` 指向页面 key，例如 `page-d`，生成后会解析为 `uni.navigateTo` 可用的真实路由。
- 修改 schema 后先运行 `npm run validate:schema`，再运行对应租户的 `npm run build -- --tenant=<id>`。

示例：App1 的 Page A 多一个可跳转 Page D 的 `module-a`：

```json
{
  "pages": {
    "page-a": {
      "enabled": true,
      "package": "main",
      "modules": [
        {
          "key": "module-a",
          "props": {
            "title": "App1 专属 Module A",
            "targetPage": "page-d"
          }
        }
      ]
    },
    "page-d": {
      "enabled": true,
      "package": "subPackage"
    }
  }
}
```

示例：App1 和 App2 在 Page A 同一位置展示不同图片资源：

```json
{
  "runtime": {
    "assets": {
      "pageAImage": {
        "src": "assets/tenants/app1/page-a-demo.png",
        "title": "App1 同位置图片",
        "description": "App1 引用自己的蓝色租户资源"
      }
    }
  }
}
```

## Page A 模块导航

Page A 从生成的 `pages.config.ts` 读取当前租户配置的模块列表并按顺序渲染，也从 `page-a-assets.ts` 读取当前租户图片，在固定位置展示 `runtime.assets.pageAImage` 对应资源。`module-a` 只在生成的 `route.config.ts` 注册了 Page D 路由时才触发 `uni.navigateTo`，避免跳转到未进入当前租户包的页面。

## 租户裁剪规则

- `app1`：tab 为 A/B/C，对应页面 A/B/C；页面 A 额外渲染 `module-a`，点击进入分包页面 D
- `app2`：tab 为 A/B/D，对应页面 A/B/D；页面 A 不渲染 `module-a`
- tab 页面保留在主包；非 tab 的启用页面进入分包
- `pages.json` 只包含当前租户启用的主包页面、分包和 tabBar
- `module-entry.ts` / `home-module-renderer.vue` 只静态导入首页引用模块；`subpackage-module-entry.ts` / `pages/module-assets/module-entry.ts` 保存首页未引用模块并进入分包

## Runner dry-run

这些命令模拟批量构建、上传和发布，不会调用外部小程序服务：

```bash
npm run build:tenant -- --tenant=app1
npm run batch:build -- --tenants=app1,app2
npm run upload:tenant -- --tenant=app1 --dry-run
npm run release:tenant -- --tenant=app1 --dry-run
```
