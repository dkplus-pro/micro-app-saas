# Design

## Source of truth
- Status: Draft
- Last refreshed: 2026-07-03
- Primary product surfaces:
  - uni-app 小程序多租户 SaaS 外壳
  - schema 驱动的单租户本地编译
  - Runner 驱动的多租户批量编译与上线
  - 页面 A/B/C/D 与页面 B 的流式模块布局
- Evidence reviewed:
  - Repository evidence: 当前仓库为空，仅存在 `.git/` 与本地 `.omx/` 状态目录。
  - Official docs: uni-app `pages.json` 用于全局页面、窗口、原生 tabBar 配置；`manifest.json` 用于应用名称、权限、平台节点等配置；CLI 支持小程序平台构建。

## Brand
- Personality:
  - 租户品牌可配置，基础产品保持“稳定、可复制、轻量、可扩展”。
  - App1 与 App2 共享产品骨架，但允许名称、标题、主题、tab 文案、图标、页面模块组合差异化。
- Trust signals:
  - 每个租户产物都来自冻结的 schema snapshot。
  - 编译产物携带 tenantId、schemaVersion、configHash，便于追踪。
  - Runner 输出每个租户的校验、构建、上传记录。
- Avoid:
  - 避免在运行时用远端 schema 动态创建未注册页面；小程序页面与 tabBar 应在编译期落到 `pages.json`。
  - 避免不同租户共用可变全局配置，防止串租户。
  - 避免手工改 generated 文件。

## Product goals
- Goals:
  - 用一套 uni-app 代码仓库支持多个小程序租户。
  - 用 schema 描述租户：页面、tab、页面标题、模块布局、manifest、运行时参数。
  - 本地开发按单租户编译，开发者能快速切换 App1/App2。
  - Runner 按租户矩阵批量生成、编译、验证、上传。
  - 页面 B 支持流式布局模块编排：App1 使用 a/b/c/d，App2 使用 a/d/c。
- Non-goals:
  - 本阶段不写业务代码。
  - 不做低代码运行时页面搭建器。
  - 不允许一个已发布小程序运行时访问未编译进包的页面。
- Success signals:
  - App1 产物只包含 A/B/C tab 与相关页面配置。
  - App2 产物只包含 A/B/D tab 与相关页面配置。
  - 页面 A 的导航标题按租户不同。
  - 页面 B 的模块顺序与数量由 schema 决定。
  - Runner 能独立失败/重试单个租户，不影响其他租户。

## Personas and jobs
- Primary personas:
  - SaaS 平台研发：维护共享页面、模块、生成器、Runner。
  - 租户交付/运营：配置每个租户的页面、tab、标题、模块、品牌和 appid。
  - QA/发布负责人：验证租户产物和上线状态。
- User jobs:
  - “我要为某个租户配置一个小程序，而不是复制一份代码。”
  - “我要本地只看 App1 或 App2 的效果。”
  - “我要一次性编译并上线多个租户。”
- Key contexts of use:
  - 本地开发：单租户 dev/build。
  - CI/Runner：多租户 matrix build。
  - 上线审计：追踪每个租户产物来自哪个 schema。

## Information architecture
- Primary navigation:
  - 原生 tabBar，由租户 schema 生成。
  - App1 tab：A、B、C，对应页面 A/B/C。
  - App2 tab：A、B、D，对应页面 A/B/D。
- Core routes/screens:
  - 页面 A：普通页面，title 按租户覆盖。
  - 页面 B：流式布局页面，由模块列表驱动。
  - 页面 C：App1 专属页面。
  - 页面 D：App2 专属页面。
- Content hierarchy:
  - 租户级：应用名称、平台 appid、主题、运行时环境、tab。
  - 页面级：路径、标题、是否进入 tab、页面类型。
  - 模块级：模块 id、组件入口、排序、props、数据源、权限/能力依赖。

## Design principles
- Principle 1: 编译期决定“有哪些页面和 tab”
  - uni-app 的页面注册、原生 tabBar、页面标题等应由 schema 生成静态配置，保证小程序端性能和平台兼容。
- Principle 2: 运行时只消费“当前租户快照”
  - App 启动后读取当前租户的 runtime config，不再跨租户查找配置。
- Principle 3: catalog 与 tenant override 分离
  - 页面、模块的全量能力放在 catalog；租户 schema 只引用和覆盖。
- Principle 4: 生成物可重建、可校验、不可手改
  - 所有 generated 文件由 schema + generator 生成，带 configHash。
- Tradeoffs:
  - 编译期多租户隔离牺牲一点构建时间，换取产物清晰、上线风险低、包体可控。
  - 页面壳保持通用，模块入口按租户生成，避免复制页面文件。

## Visual language
- Color:
  - 基础色板由平台默认 token 提供，租户可覆盖 primary、background、text、tab selectedColor。
- Typography:
  - 使用 uni-app/小程序默认字体栈；租户可覆盖导航标题文案，不在首期开放字体资产差异。
- Spacing/layout rhythm:
  - 页面 B 使用统一流式间距 token，例如模块上下间距、卡片内边距、页面边距。
- Shape/radius/elevation:
  - 模块卡片统一 radius/elevation，允许租户主题覆盖但不改变模块结构。
- Motion:
  - 首期不做复杂动效；模块加载使用轻量 skeleton。
- Imagery/iconography:
  - tab icon、selected icon 可由租户 schema 指向租户资产。

## Components
- Existing components to reuse:
  - 当前仓库为空，暂无可复用组件。
- New/changed components:
  - 页面壳：PageA、FlowPageB、PageC、PageD。
  - 模块：ModuleA、ModuleB、ModuleC、ModuleD、ModuleE。
  - 运行时：TenantProvider / RuntimeConfigProvider。
  - 生成入口：route registry、module registry、tenant config。
- Variants and states:
  - 页面 B 模块状态：loading、empty、error、hidden、normal。
  - 模块可按租户 props 配置展示密度、数据源、标题等。
- Token/component ownership:
  - SaaS 平台维护共享组件和 token。
  - 租户配置只允许覆盖白名单字段。

## Accessibility
- Target standard:
  - 以小程序平台能力为边界，保证文本可读、触控区域足够、状态有明确反馈。
- Keyboard/focus behavior:
  - 小程序场景以触控为主；H5/调试端尽量保留自然焦点顺序。
- Contrast/readability:
  - 租户主题色需过基础对比度校验。
- Screen-reader semantics:
  - 关键按钮、tab、状态提示保留可读 label。
- Reduced motion and sensory considerations:
  - 默认低动效；后续如加动效需支持关闭或降级。

## Responsive behavior
- Supported breakpoints/devices:
  - 以手机小程序为主，适配常见 320px-430px 宽度。
- Layout adaptations:
  - 页面 B 流式模块按一列纵向排列，模块间距统一。
  - 模块内部可根据屏宽调整密度，但模块顺序不得变。
- Touch/hover differences:
  - 不依赖 hover；所有交互都有触控反馈。

## Interaction states
- Loading:
  - App 启动读取 runtime config；页面 B 模块独立 loading，避免全页阻塞。
- Empty:
  - 模块无数据时展示模块级 empty，不影响其他模块。
- Error:
  - 模块失败局部展示错误与重试；页面级配置错误在构建期失败，不进入线上。
- Success:
  - Runner 每个租户输出 build/upload 成功记录。
- Disabled:
  - schema 中关闭的模块不生成入口，不在运行时隐藏已打包模块作为主要方案。
- Offline/slow network:
  - 页面壳可先渲染标题与模块 skeleton，模块数据请求超时独立处理。

## Content voice
- Tone:
  - 配置、报错、Runner 日志要明确租户、页面、模块和字段路径。
- Terminology:
  - tenant：租户或应用实例，如 App1、App2。
  - catalog：平台全量页面/模块能力目录。
  - schema：租户声明。
  - generated：由 schema 生成的静态产物。
  - runtime config：小程序运行时读取的租户快照。
- Microcopy rules:
  - 用户可见文案走 tenant copy/theme 配置；开发者错误信息包含可定位字段路径。

## Implementation constraints
- Framework/styling system:
  - uni-app 小程序项目。
  - `pages.json` 由 schema 生成页面、页面样式、tabBar。
  - `manifest.json` 由 base manifest + tenant platform override 生成。
- Design-token constraints:
  - 租户主题只能覆盖 token，不直接覆盖组件 CSS。
- Performance constraints:
  - 页面和模块入口按租户生成，尽量减少无关页面/模块进入产物。
  - 页面 B 模块数据独立加载，避免单个模块拖慢首屏。
- Compatibility constraints:
  - 需要以目标小程序平台能力为准；微信小程序 appid 等平台字段放在对应 manifest 平台节点。
  - 本地和 Runner 使用同一套 generator，避免“本地能跑、CI 不一致”。
- Test/screenshot expectations:
  - 生成器 snapshot 覆盖 App1/App2。
  - 构建后检查 `pages.json`、`manifest.json`、module registry、runtime config。
  - App1/App2 可各自做页面 A 标题、tab、页面 B 模块顺序的 smoke 测试。

## Proposed architecture

### 1. 分层模型
- Product catalog：
  - 定义全量页面 A/B/C/D。
  - 定义全量模块 a/b/c/d/e。
  - 定义页面类型：普通页面、流式模块页面。
- Tenant schema：
  - 引用 catalog 中的页面和模块。
  - 描述 tab、页面标题、模块顺序、manifest 覆盖、运行时配置。
- Generated snapshot：
  - generator 将 schema 固化为当前租户的静态产物。
  - 每次构建生成 configHash，Runner 记录 hash。
- Runtime：
  - 小程序内只读取当前租户 generated runtime config。
  - 页面 B 根据 runtime config 渲染模块列表。

### 2. 建议目录
- `schemas/catalog/pages`：页面能力目录。
- `schemas/catalog/modules`：模块能力目录。
- `schemas/tenants/app1`、`schemas/tenants/app2`：租户声明。
- `src/pages/a`、`src/pages/b`、`src/pages/c`、`src/pages/d`：共享页面壳。
- `src/modules/a` 到 `src/modules/e`：共享模块。
- `src/generated`：生成的 tenant config、routes、module registry、runtime config。
- `pages.base`、`manifest.base`：基础模板。
- `pages.json`、`manifest.json`：按租户生成给 uni-app 编译使用。

### 3. Schema 结构设计（概念，不是实现代码）
- tenant：
  - id、name、displayName、schemaVersion、platforms。
- platform：
  - mp-weixin appid、上传配置、权限、版本号。
- theme：
  - primaryColor、tabColor、selectedColor、backgroundColor、icon assets。
- tabs：
  - tab id、label、pageId、icon、selectedIcon、order。
- pages：
  - pageId、route、type、title、是否 tab 页、页面级 props。
- layouts：
  - pageId 为 B 时，layoutType 为 flow，modules 为有序列表。
- modules：
  - moduleId、componentRef、props、dataSource、featureFlags、权限依赖。
- runtime：
  - apiBaseUrl、tenantId、featureFlags、configHash、releaseChannel。

### 4. App1 / App2 租户设计

| 项 | App1 | App2 |
| --- | --- | --- |
| tab | A、B、C | A、B、D |
| 页面集合 | A、B、C | A、B、D |
| 页面 A title | App1 专属标题，例如“App1 首页” | App2 专属标题，例如“App2 工作台” |
| 页面 B 类型 | flow stream layout | flow stream layout |
| 页面 B 可用模块池 | a、b、c、d、e | a、b、c、d、e |
| 页面 B 实际模块 | a、b、c、d | a、d、c |
| 页面 B 顺序 | a → b → c → d | a → d → c |

### 5. 生成物映射
- 配置代码：
  - 当前租户 id、名称、主题、feature flags、平台、环境。
- 路由代码：
  - route constants、tab route list、页面 id 到 path 的映射、跳转白名单。
- `manifest.json`：
  - 应用名称、版本、平台节点、mp-weixin appid、权限、调试开关。
- `pages.json`：
  - 只注册当前租户页面。
  - 生成 tabBar。
  - 生成页面 A 的租户标题。
  - 页面 B/C/D 的标题与样式按 schema 生成。
- pages：
  - 共享页面壳不复制；如需要平台限制，可生成轻量 page adapter。
- 模块入口：
  - 只导入当前租户需要的模块。
  - App1 registry 包含 a/b/c/d；App2 registry 包含 a/d/c。
- 运行时配置：
  - 当前租户 runtime snapshot。
  - 页面 B 的 module order、module props、数据源配置。

### 6. 本地单租户编译
- 开发者选择一个 tenant，例如 App1。
- generator 读取 catalog + App1 schema。
- 输出 generated 文件、`pages.json`、`manifest.json`。
- uni-app 执行对应平台 dev/build。
- 切换 App2 时重新生成，避免两个租户配置混在同一工作区。

### 7. Runner 多租户编译上线
- 输入：
  - tenant matrix，例如 App1、App2。
  - target platform，例如 mp-weixin。
  - release channel，例如 preview、trial、production。
- 流程：
  1. 拉取代码与 schema。
  2. 校验 catalog 与 tenant schema。
  3. 为每个 tenant 创建隔离工作区或清理式构建目录。
  4. 生成 tenant snapshot 与静态配置。
  5. 执行 uni-app 小程序构建。
  6. 检查产物里的 `pages.json`、`manifest.json`、模块入口和 runtime config。
  7. 上传预览/体验版/正式版。
  8. 保存构建元数据：tenantId、schemaVersion、gitSha、configHash、artifactPath、uploadResult。
- 失败策略：
  - 单租户失败不阻断其他租户构建，最终聚合报告。
  - production 发布前需要 App1/App2 各自通过 schema 校验、构建、smoke、上传校验。

### 8. 校验规则
- 每个 tab 的 pageId 必须存在。
- 每个页面 path 唯一。
- tab 数量符合目标小程序平台限制。
- 页面 A 必须解析出当前租户 title。
- 页面 B 的 modules 必须来自模块 catalog。
- 页面 B 模块顺序不能重复。
- 租户不能引用未授权模块。
- `manifest` 平台 appid 必须存在于安全配置或租户 schema。
- generated 文件必须能从 schema 重建，禁止手改。
- configHash 必须写入 runtime config 和 Runner 元数据。

### 9. 风险与应对
- 风险：运行时动态 schema 想新增页面，但小程序未注册页面。
  - 应对：新增页面必须重新生成 `pages.json` 并重新编译。
- 风险：租户配置污染。
  - 应对：每个 tenant 用隔离工作区构建，runtime config 内写 tenantId/configHash。
- 风险：模块无序或缺失。
  - 应对：schema validator + snapshot 测试固定 App1/App2 期望结果。
- 风险：包体过大。
  - 应对：module registry 只引用租户启用模块；必要时按页面/模块分包。
- 风险：Runner 与本地生成不一致。
  - 应对：本地与 CI 共用同一个 generator，不维护第二套逻辑。

## Open questions
- [ ] 目标首个平台是否只做微信小程序，还是同时支持支付宝/抖音等？
- [ ] App1/App2 的真实应用名称、appid、tab 图标、主题色是否已有？
- [ ] 页面 B 的 5 个模块 a/b/c/d/e 是否都共享同一数据域，还是各有独立接口？
- [ ] 生成物是否提交到仓库，还是全部作为本地/CI 临时产物？
- [ ] Runner 上传正式版是否需要人工审批门禁？
