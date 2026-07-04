# 基于 Schema 的 UniApp 多租户 SaaS 小程序设计方案

## 一、方案目标

本方案要解决的问题是：

```txt
一套 uni-app 小程序模板工程
支持多个租户 / 多个小程序
每个小程序可以有不同 tab、页面、标题、模块组合、模块顺序
并且可以按单租户独立编译、独立上传、独立上线
```

核心目标不是做一个万能低代码平台，而是做一个：

```txt
基于 schema 的小程序 SaaS 工厂
```

整体思路是：

```txt
schema 描述租户差异
uni-app 模板承载业务能力
本地按单租户编译
Runner 按多租户批量编译、上传、发布
```

最终希望达到：

```txt
1. 代码只有一套
2. 租户差异由 schema 描述
3. 不同租户按需生成 manifest、pages、tabBar、模块入口
4. 未启用的页面和模块不进入当前租户包
5. 每个租户独立构建产物
6. Runner 可以批量构建、上传、提审、上线
```

---

## 二、核心架构

整体架构分为五层：

```txt
SaaS 配置层
  ↓
Schema 描述层
  ↓
代码生成层
  ↓
UniApp 模板运行层
  ↓
Runner 构建发布层
```

展开来看：

```txt
SaaS 后台 / 配置文件
  ↓
多租户 schema
  ↓
generator 生成配置代码
  ↓
uni-app 单模板工程
  ↓
按租户单独编译
  ↓
GitLab Runner / CI Runner 批量发布
```

可以理解成：

```txt
schema 负责描述“这个租户要什么”
generator 负责生成“这个租户该怎么编译”
uni-app 模板负责提供“这些功能怎么运行”
runner 负责完成“批量构建和上线”
```

---

## 三、核心原则

## 1. 不生成完整业务代码，只生成装配代码

这个方案不建议根据 schema 生成大量 Vue 页面和复杂业务逻辑。

推荐生成的是：

```txt
manifest 配置
pages 配置
tabBar 配置
路由配置
模块入口
租户配置
功能开关
运行时配置
```

不推荐生成的是：

```txt
复杂业务流程
支付逻辑
轮询逻辑
权限判断
接口请求逻辑
复杂组件内部逻辑
```

一句话：

```txt
schema 描述业务装配关系，业务能力仍然由代码实现。
```

---

## 2. 编译期裁剪，而不是运行时隐藏

如果 App1 不需要页面 D，那么页面 D 不应该进入 App1 的 `pages` 配置。

如果 App2 不需要模块 B，那么模块 B 不应该被 App2 的页面静态 import。

错误方式：

```txt
所有页面都打包
所有模块都 import
运行时根据租户 v-if 判断显示隐藏
```

正确方式：

```txt
编译前读取 schema
生成当前租户专属 pages 配置
生成当前租户专属模块入口
uni-app 只编译当前租户需要的页面和模块
```

---

## 3. 构建时 schema 和运行时 schema 分开

不是所有配置都应该运行时下发。

## 构建时 schema

这些配置影响小程序结构，应该在编译前确定：

```txt
appid
小程序名称
tabBar
pages
subPackages
页面是否存在
页面标题
分包结构
插件声明
模块入口
manifest 配置
```

## 运行时 schema

这些配置可以由后端下发，避免频繁重新提审：

```txt
主题色
Logo
banner
客服二维码
模块文案
按钮文案
活动配置
部分模块 props
接口 base 配置
功能开关
```

推荐原则：

```txt
影响小程序包结构的，构建时处理。
影响展示内容的，运行时处理。
```

---

## 四、工程目录设计

推荐整体工程结构如下：

```txt
apps/
  miniapp-template/
    src/
      pages/
        page-a/
          index.vue
          components/
          hooks/
          consts/
          utils/
          types/

        page-b/
          index.vue
          components/
          hooks/
          consts/
          utils/
          types/

        page-c/
          index.vue

        page-d/
          index.vue

      modules/
        module-a/
        module-b/
        module-c/
        module-d/
        module-e/

      generated/
        tenant.config.ts
        app.config.ts
        pages.config.ts
        tabbar.config.ts
        route.config.ts
        module-entry.ts
        runtime.config.ts

    manifest.config.js
    pages.config.js

packages/
  request/
  store/
  openapi/
  schema/
  generator/
  shared/
  ui/
  utils/
  types/

schemas/
  tenants/
    app1.schema.ts
    app2.schema.ts
    app1.schema.json
    app2.schema.json

scripts/
  emit-schema-json.ts
  validate-schema.ts
  generate-tenant.ts
  build-tenant.ts
  batch-build.ts
  upload-tenant.ts
  release-tenant.ts
```

说明：

```txt
apps/miniapp-template：唯一的小程序模板工程
schemas/tenants：多租户 schema 配置，优先维护 TS-first `.schema.ts`，并通过 `emit-schema-json.ts` 生成运行时/后端兼容 `.schema.json`
packages/generator：根据 schema 生成配置代码
src/generated：每次构建前按租户生成
manifest.config.js：读取 generated 配置生成 manifest
pages.config.js：读取 generated 配置生成 pages
```

`emit-schema-json.ts` 也支持 `--from-json`，用于把后端或旧流程产出的 `.schema.json` 迁移回规范化 TS-first 源；配合 `--check` 可验证 TS 与 JSON 是否同步而不写文件。

---

## 五、schema 总体设计

一个租户 schema 可以分为这些部分：

```txt
tenant
app
tabs
pages
modules
features
theme
runtime
build
release
```

建议不要把所有配置堆到一个巨大对象里，而是分层描述。

简化模型如下：

```txt
TenantSchema
  ├── tenant：租户信息
  ├── app：小程序基础信息
  ├── tabs：tabBar 配置
  ├── pages：页面配置
  ├── modules：模块配置
  ├── features：功能开关
  ├── theme：主题配置
  ├── runtime：运行时配置
  └── release：发布配置
```

---

## 六、App1 / App2 示例设计

## 示例背景

App1：

```txt
tab：A、B、C
页面：A、B、C
页面 A title：App1 首页
页面 B：流式布局，占用模块 a、b、c、d，顺序为 a b c d
```

App2：

```txt
tab：A、B、D
页面：A、B、D
页面 A title：App2 首页
页面 B：流式布局，占用模块 a、d、c，顺序为 a d c
```

系统一共有 5 个模块：

```txt
module-a
module-b
module-c
module-d
module-e
```

App1 使用：

```txt
module-a
module-b
module-c
module-d
```

App2 使用：

```txt
module-a
module-d
module-c
```

App1 不应该打包页面 D。

App2 不应该打包页面 C。

App1 不应该打包 module-e。

App2 不应该打包 module-b 和 module-e。

---

## 七、App1 schema 示例

这里不写具体实现代码，只展示 schema 结构。

```json
{
  "tenant": {
    "tenantId": "app1",
    "tenantName": "App1 租户"
  },
  "app": {
    "appKey": "app1",
    "appid": "wx_app1",
    "name": "App1 小程序"
  },
  "tabs": [
    {
      "key": "A",
      "text": "A",
      "page": "page-a"
    },
    {
      "key": "B",
      "text": "B",
      "page": "page-b"
    },
    {
      "key": "C",
      "text": "C",
      "page": "page-c"
    }
  ],
  "pages": {
    "page-a": {
      "route": "pages/page-a/index",
      "title": "App1 首页",
      "enabled": true
    },
    "page-b": {
      "route": "pages/page-b/index",
      "title": "App1 页面B",
      "enabled": true,
      "layout": "stream",
      "modules": [
        {
          "key": "module-a"
        },
        {
          "key": "module-b"
        },
        {
          "key": "module-c"
        },
        {
          "key": "module-d"
        }
      ]
    },
    "page-c": {
      "route": "pages/page-c/index",
      "title": "App1 页面C",
      "enabled": true
    }
  },
  "features": {
    "pageA": true,
    "pageB": true,
    "pageC": true,
    "pageD": false,
    "moduleA": true,
    "moduleB": true,
    "moduleC": true,
    "moduleD": true,
    "moduleE": false
  }
}
```

---

## 八、App2 schema 示例

```json
{
  "tenant": {
    "tenantId": "app2",
    "tenantName": "App2 租户"
  },
  "app": {
    "appKey": "app2",
    "appid": "wx_app2",
    "name": "App2 小程序"
  },
  "tabs": [
    {
      "key": "A",
      "text": "A",
      "page": "page-a"
    },
    {
      "key": "B",
      "text": "B",
      "page": "page-b"
    },
    {
      "key": "D",
      "text": "D",
      "page": "page-d"
    }
  ],
  "pages": {
    "page-a": {
      "route": "pages/page-a/index",
      "title": "App2 首页",
      "enabled": true
    },
    "page-b": {
      "route": "pages/page-b/index",
      "title": "App2 页面B",
      "enabled": true,
      "layout": "stream",
      "modules": [
        {
          "key": "module-a"
        },
        {
          "key": "module-d"
        },
        {
          "key": "module-c"
        }
      ]
    },
    "page-d": {
      "route": "pages/page-d/index",
      "title": "App2 页面D",
      "enabled": true
    }
  },
  "features": {
    "pageA": true,
    "pageB": true,
    "pageC": false,
    "pageD": true,
    "moduleA": true,
    "moduleB": false,
    "moduleC": true,
    "moduleD": true,
    "moduleE": false
  }
}
```

---

## 九、编译生成物设计

本地单租户编译时执行：

```txt
pnpm build:mp --tenant=app1
```

生成：

```txt
src/generated/
  tenant.config.ts
  app.config.ts
  pages.config.ts
  tabbar.config.ts
  route.config.ts
  module-entry.ts
  runtime.config.ts
```

App1 生成结果应该表达：

```txt
当前租户：app1
当前 appid：wx_app1
当前页面：A、B、C
当前 tab：A、B、C
当前页面 A 标题：App1 首页
当前页面 B 模块：a、b、c、d
```

App2 生成结果应该表达：

```txt
当前租户：app2
当前 appid：wx_app2
当前页面：A、B、D
当前 tab：A、B、D
当前页面 A 标题：App2 首页
当前页面 B 模块：a、d、c
```

---

## 十、manifest.config.js 设计

`manifest.config.js` 负责读取生成后的 app 配置，生成当前租户的 manifest。

它主要处理：

```txt
appid
小程序名称
版本号
微信小程序配置
插件配置
权限配置
分包优化配置
```

它不应该关心业务模块怎么渲染。

它只关心：

```txt
这个租户编译成哪个小程序
这个小程序有哪些平台级配置
```

---

## 十一、pages.config.js 设计

`pages.config.js` 负责读取生成后的 pages 和 tabs 配置，生成当前租户的 pages 配置。

App1 生成：

```txt
pages:
  pages/page-a/index
  pages/page-b/index
  pages/page-c/index

tabBar:
  A → pages/page-a/index
  B → pages/page-b/index
  C → pages/page-c/index
```

App2 生成：

```txt
pages:
  pages/page-a/index
  pages/page-b/index
  pages/page-d/index

tabBar:
  A → pages/page-a/index
  B → pages/page-b/index
  D → pages/page-d/index
```

这样 App1 不会包含页面 D，App2 不会包含页面 C。

---

## 十二、页面 B 的流式布局设计

页面 B 是一个流式布局页面，不同租户模块数量和顺序不同。

页面 B 的主入口应该尽量简单：

```txt
读取当前租户的 page-b 配置
获取模块列表
按顺序渲染模块
```

页面 B 不应该写成：

```txt
if app1 渲染 a b c d
if app2 渲染 a d c
```

而应该写成：

```txt
当前租户 page-b.modules 是什么
就按照 modules 顺序渲染什么
```

也就是：

```txt
App1:
  modules = [a, b, c, d]

App2:
  modules = [a, d, c]
```

页面 B 本身不关心租户是谁。

---

## 十三、模块入口生成设计

为了避免不需要的模块被打进包，需要生成当前租户专属模块入口。

不建议写一个全量模块 registry：

```txt
module-a
module-b
module-c
module-d
module-e
```

然后运行时判断是否显示。

因为这样可能导致所有模块都被 import，最终都进入包。

正确做法是编译前生成当前租户专属模块入口。

App1 的模块入口只包含：

```txt
module-a
module-b
module-c
module-d
```

App2 的模块入口只包含：

```txt
module-a
module-d
module-c
```

这样未使用模块不会被当前租户静态引用，从而降低被打包的概率。

核心原则：

```txt
当前租户没有启用的模块，不出现在当前租户生成的 import 入口中。
```

---

## 十四、页面 A 的 title 设计

页面 A 的 title 根据 App1 和 App2 不同。

这里要分两种情况。

## 1. 使用原生导航栏

如果使用 uni-app / 小程序原生导航栏，页面 title 通常应该在 `pages.config.js` 生成阶段写入。

App1：

```txt
page-a.navigationBarTitleText = App1 首页
```

App2：

```txt
page-a.navigationBarTitleText = App2 首页
```

这种属于构建时配置。

## 2. 使用自定义导航栏

如果使用自定义导航栏，那么 title 可以运行时从 runtime config 或 Pinia store 中读取。

App1：

```txt
runtime.pageA.title = App1 首页
```

App2：

```txt
runtime.pageA.title = App2 首页
```

这种属于运行时配置。

推荐做法：

```txt
需要原生导航栏能力的 title：构建时生成
需要动态变更的 title：使用自定义导航栏运行时控制
```

---

## 十五、Pinia Store 设计

store 使用 Pinia。

建议拆成几个 store：

```txt
useAppStore
useTenantStore
useRuntimeConfigStore
useFeatureStore
useUserStore
usePermissionStore
```

职责如下：

```txt
useAppStore：
  appKey、appid、版本、平台信息

useTenantStore：
  tenantId、租户名称、租户状态

useRuntimeConfigStore：
  运行时配置、主题、banner、客服二维码、页面模块 props

useFeatureStore：
  功能开关、模块开关

useUserStore：
  登录用户信息、token、会员状态

usePermissionStore：
  角色权限、按钮权限、页面权限
```

注意：

```txt
Pinia 只负责运行时状态
不负责决定当前租户编译哪些页面和模块
```

页面和模块是否进入包，由编译期生成物决定。

---

## 十六、OpenAPI 接口生成设计

接口层使用 OpenAPI 生成。

推荐放在：

```txt
packages/openapi
```

生成内容包括：

```txt
接口类型
请求 DTO
响应 DTO
API client
错误码类型
业务枚举
```

业务页面中不要直接拼 URL。

推荐依赖：

```txt
api client
request 封装
业务 service
```

接口调用层建议分三层：

```txt
openapi 生成层：
  只负责生成类型和原始请求方法

api service 层：
  封装业务接口语义

页面 hooks 层：
  处理页面状态和交互流程
```

这样页面不会直接依赖大量接口细节。

---

## 十七、页面编码规范

每个新页面必须拆成：

```txt
index.vue
components/
hooks/
consts/
utils/
types/
```

推荐结构：

```txt
pages/page-b/
  index.vue
  components/
    StreamModuleRenderer.vue
    PageHeader.vue
    EmptyState.vue
  hooks/
    index.ts
    usePageBController.ts
    usePageBModulesController.ts
    usePageBTrackController.ts
  consts/
    index.ts
    module.const.ts
  utils/
    index.ts
    module-sort.util.ts
    module-visible.util.ts
  types/
    index.ts
    page-b.type.ts
```

---

## 十八、页面主入口要求

页面主入口 `index.vue` 要尽量简单。

它只负责：

```txt
页面布局
调用主 hook
渲染组件
处理少量页面生命周期
```

不应该在 `index.vue` 中堆：

```txt
复杂接口请求
复杂状态处理
复杂模块判断
复杂数据转换
复杂权限判断
大量常量
大量类型声明
```

页面入口应该像一个装配层。

复杂逻辑下沉到：

```txt
hooks
components
utils
store
service
```

---

## 十九、组件拆分要求

组件按功能维度拆分，而不是按 UI 零碎程度过度拆分。

推荐拆分方式：

```txt
业务模块组件
布局组件
状态组件
弹窗组件
表单组件
列表组件
```

例如页面 B 是流式布局，可以拆成：

```txt
StreamLayout
StreamModuleRenderer
ModuleASection
ModuleBSection
ModuleCSection
ModuleDSection
ModuleESection
```

其中：

```txt
StreamLayout：负责流式布局
StreamModuleRenderer：负责根据模块配置渲染模块
ModuleXSection：负责具体模块展示和交互
```

不要把一个页面所有逻辑都塞到一个组件里。

---

## 二十、provide / inject 使用规范

跨组件传值可以使用 `provide / inject`。

适合场景：

```txt
页面级上下文
当前 page schema
当前 tenant 信息
当前模块渲染上下文
父组件向深层模块传递公共配置
```

例如页面 B 可以提供：

```txt
pageBContext
tenantContext
runtimeConfig
moduleContext
```

深层模块组件通过 inject 获取。

但不要滥用 provide / inject 传递所有状态。

推荐边界：

```txt
跨层级、稳定、不频繁变化的上下文：provide / inject
频繁变化的全局状态：Pinia
父子直接传值：props / emits
纯业务计算：hooks / utils
```

---

## 二十一、hooks 设计要求

hooks 要有一个简单的主入口，也要拆多个同功能或业务聚合的 controller。

例如页面 B：

```txt
hooks/
  index.ts
  usePageBController.ts
  usePageBModulesController.ts
  usePageBRuntimeController.ts
  usePageBTrackController.ts
```

职责：

```txt
index.ts：
  对外导出主 hook

usePageBController：
  组织页面初始化、生命周期、状态聚合

usePageBModulesController：
  处理模块列表、模块顺序、模块显示规则

usePageBRuntimeController：
  处理运行时配置读取、schema 合并

usePageBTrackController：
  处理埋点、曝光、点击上报
```

原则：

```txt
主 hook 简单
controller 负责聚合一类业务
不要一个 hook 写几百行
```

---

## 二十二、consts 设计要求

`consts` 放常量。

适合放：

```txt
模块 key
页面 key
默认文案
默认配置
魔法数字
状态枚举
固定字面量
埋点 key
错误码映射
```

例如：

```txt
PAGE_B_MODULE_KEYS
DEFAULT_MODULE_GAP
MAX_MODULE_COUNT
TRACK_EVENT_KEYS
```

原则：

```txt
业务中重复出现的字面量要抽 const
魔法数字要抽 const
和当前页面强相关的常量放页面 consts
跨页面常量放 packages/shared 或 packages/consts
```

---

## 二十三、utils 设计要求

`utils` 放纯函数。

适合放：

```txt
数组排序
schema 转换
字段格式化
模块过滤
可见性判断
安全取值
数据归一化
```

utils 要求：

```txt
无副作用
不直接依赖组件实例
不直接改 Pinia
不直接发请求
输入相同，输出相同
```

例如：

```txt
filterEnabledModules
sortModulesBySchemaOrder
normalizePageSchema
getModuleProps
```

如果函数需要请求接口、读写状态、处理生命周期，就不应该放 utils，应该放 hooks 或 service。

---

## 二十四、types 设计要求

`types` 放类型定义。

适合放：

```txt
页面 schema 类型
模块配置类型
组件 props 类型
hook 返回值类型
业务 DTO 扩展类型
状态枚举类型
```

页面内使用的类型放页面目录下：

```txt
pages/page-b/types/
```

跨页面复用的类型放：

```txt
packages/types
packages/schema
```

类型设计要和 schema 保持一致。

---

## 二十五、Runner 流水线设计

Runner 负责多租户编译上线。

整体流程：

```txt
选择租户列表
  ↓
拉取代码
  ↓
安装依赖
  ↓
读取租户 schema
  ↓
校验 schema
  ↓
生成租户配置代码
  ↓
生成 manifest 配置
  ↓
生成 pages 配置
  ↓
执行 uni-app 构建
  ↓
上传小程序体验版
  ↓
生成二维码
  ↓
通知测试
  ↓
提交审核
  ↓
发布上线
  ↓
记录发布结果
```

单租户命令：

```txt
build tenant app1
```

多租户命令：

```txt
build tenants app1,app2,app3
```

推荐 Runner 支持：

```txt
单租户构建
多租户批量构建
按分组构建
按 schema 变更影响范围构建
失败重试
失败隔离
发布记录回写
通知飞书/企微
```

---

## 二十六、流水线失败隔离

多租户构建时，不能因为 App1 失败，就导致 App2、App3 全部中断。

应该记录：

```txt
成功列表
失败列表
失败原因
schema 校验错误
构建错误
上传错误
审核错误
发布时间
产物版本
commit hash
runner job url
```

推荐发布记录结构：

```txt
tenantId
appKey
version
schemaVersion
commitSha
buildStatus
uploadStatus
auditStatus
releaseStatus
errorMessage
previewQrCode
createdAt
finishedAt
```

---

## 二十七、本地开发模式

本地开发应该支持指定租户启动：

```txt
dev tenant app1
dev tenant app2
```

本地流程：

```txt
读取 app1 schema
生成 src/generated
启动 uni-app dev
开发者看到的是 App1 的页面、tab、模块
```

切换 App2：

```txt
读取 app2 schema
重新生成 src/generated
重启或热更新 dev
开发者看到的是 App2 的页面、tab、模块
```

本地开发不要默认加载所有租户。

默认应该是：

```txt
当前只开发一个租户
当前只生成一个租户配置
当前只模拟一个小程序形态
```

---

## 二十八、schema 校验设计

schema 必须严格校验。

校验内容包括：

```txt
tenantId 是否存在
appid 是否存在
tabs 指向的 page 是否存在
pages 中 route 是否合法
page 是否 enabled
页面 title 是否存在
modules 是否在白名单里
模块顺序是否重复
模块是否启用
tabBar 数量是否合法
同一路由是否重复
构建时配置是否完整
运行时配置是否可解析
```

如果 schema 不合法，应该在生成前失败，而不是等到 uni-app 构建时失败。

---

## 二十九、模块白名单设计

所有模块必须注册在模块白名单里。

例如系统支持：

```txt
module-a
module-b
module-c
module-d
module-e
```

schema 只能引用这些模块。

如果 schema 写了：

```txt
module-x
```

但系统没有注册，构建应直接失败。

这样可以避免：

```txt
配置写错
引用不存在模块
运行时白屏
构建产物异常
```

---

## 三十、权限与功能边界

前端 SaaS 主要解决的是：

```txt
页面入口差异
模块差异
品牌差异
运行时展示差异
编译期裁剪
发布自动化
```

但真正的安全边界仍然在后端。

例如：

```txt
用户是否能访问数据
用户是否能使用某功能
用户套餐是否支持
用户是否越权
租户数据是否隔离
```

这些必须后端校验。

前端只做：

```txt
展示控制
入口控制
体验控制
构建控制
```

不要把权限安全完全放在前端。

---

## 三十一、最终推荐落地步骤

## 第一步：定义 schema 协议

先定义：

```txt
tenant
app
tabs
pages
modules
features
runtime
```

并完成 schema 校验。

## 第二步：完成单租户生成

支持：

```txt
读取 app1 schema
生成 manifest 配置
生成 pages 配置
生成 tabBar
生成模块入口
生成 runtime config
```

先让 App1 能跑。

## 第三步：接入 App2

验证：

```txt
App1 是 A/B/C
App2 是 A/B/D
App1 页面 B 是 a/b/c/d
App2 页面 B 是 a/d/c
页面 A title 不同
```

确认未启用页面和模块不进入对应构建入口。

## 第四步：完善页面 B 流式布局

页面 B 做成标准 schema-driven 页面：

```txt
读取 modules
按顺序渲染
模块独立维护
页面主入口保持简单
```

## 第五步：接入 Pinia 和 OpenAPI

完成：

```txt
租户状态
运行时配置
功能开关
用户状态
接口生成
request 封装
```

## 第六步：接入 Runner

支持：

```txt
单租户构建
多租户构建
构建日志
失败隔离
上传体验版
通知
发布记录
```

## 第七步：扩展更多页面和模块

当 A/B/C/D 跑通后，再扩展更多页面和模块。

不要一开始就做万能 schema。

---

## 三十二、最终总结

这套方案的核心是：

```txt
一套 uni-app 模板工程
多份租户 schema
编译前生成租户专属配置
单租户独立编译
Runner 多租户批量上线
```

对于 App1 和 App2：

```txt
App1：
  tab = A / B / C
  pages = A / B / C
  pageA.title = App1 首页
  pageB.modules = a / b / c / d

App2：
  tab = A / B / D
  pages = A / B / D
  pageA.title = App2 首页
  pageB.modules = a / d / c
```

实现重点是：

```txt
页面差异通过 pages schema 描述
tab 差异通过 tabs schema 描述
模块差异通过 modules schema 描述
标题差异通过 page config 描述
编译差异通过 generated 配置承接
```

最终你要做的不是 100 个小程序项目，而是：

```txt
一个可以生产多个小程序的 SaaS 编译发布系统。
```
