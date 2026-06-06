# 垃圾分类工作平台

为社区督导员和物业打造的垃圾分类现场工作页面，支持投放记录、居民积分、楼栋排名和兑换库存一体化管理。

## 原始需求

> 做一个给社区督导员和物业使用的垃圾分类工作页，Vue3 + Vite 可以把投放记录、居民积分、楼栋排名和兑换库存放在一个清楚的页面里。页面围绕居民账户、楼栋、投放点、垃圾类别、误投照片、督导记录、积分流水和兑换礼品展开。督导员在现场记录居民投放是否正确、误投原因和纠正结果；物业查看楼栋参与率、误投高发时间和兑换点库存；居民积分变化要能追到具体投放记录。页面需要适合现场平板操作，楼栋排名、误投明细和兑换记录要明确区分。

## 技术栈

- Vue 3 (Composition API)
- Vite 5
- Vue Router 4
- ECharts 5（数据可视化）
- 原生 CSS（响应式、适配平板横屏）

## 功能模块

| 模块 | 说明 |
|------|------|
| 督导记录 | 现场记录投放正确/误投、误投原因、照片、纠正结果，自动增减积分 |
| 楼栋排名 | 楼栋参与率、正确率排名，误投高发时段图表，误投原因分布分析 |
| 居民积分 | 居民列表搜索，积分流水可追溯到具体投放记录，投放记录明细 |
| 兑换库存 | 礼品库存展示，兑换记录查询，在线兑换操作（自动扣减积分） |

## 启动方式

### 前置要求

- Node.js >= 18
- npm 或 pnpm
- Docker（可选，用于容器化启动）

### 方式一：Docker 一键启动（推荐）

#### 1. 构建并启动

```bash
docker compose up --build
```

后台运行：

```bash
docker compose up --build -d
```

#### 2. 访问

打开浏览器访问：http://localhost:5173

#### 3. 停止服务

```bash
docker compose down
```

### 方式二：本地开发启动

#### 1. 安装依赖

```bash
npm install
```

> 国内用户可使用淘宝镜像加速：`npm install --registry=https://registry.npmmirror.com`

#### 2. 启动开发服务

```bash
npm run dev
```

#### 3. 访问

打开浏览器访问：http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 本地预览生产构建

```bash
npm run preview
```

访问地址：http://localhost:4173

## 目录结构

```
wmy-27/
├── src/
│   ├── components/
│   │   └── icons/              # SVG 图标组件
│   ├── data/
│   │   └── mockData.js         # 模拟数据
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── stores/
│   │   └── data.js             # 数据状态管理（响应式 Store）
│   ├── styles/
│   │   └── global.css          # 全局样式与 CSS 变量
│   ├── views/
│   │   ├── SupervisionView.vue # 督导记录页
│   │   ├── BuildingsView.vue   # 楼栋排名页
│   │   ├── PointsView.vue      # 居民积分页
│   │   └── ExchangeView.vue    # 兑换库存页
│   ├── App.vue                 # 根组件（布局框架）
│   └── main.js                 # 入口文件
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── vite.config.js
├── package.json
└── index.html
```

## 数据关联说明

- **投放记录 ↔ 积分流水**：通过 `recordId` 双向关联，点击积分流水可弹窗查看对应投放记录详情
- **投放记录 ↔ 纠正记录**：通过 `recordId` 关联，支持纠正状态追踪（onsite/pending/corrected/refused）
- **纠正记录 ↔ 积分流水**：居民纠正恢复积分通过 `correctionId` 关联
- **提醒名单 ↔ 居民/楼栋**：通过 `residentId` 和 `buildingId` 关联，按楼栋聚合展示
- **居民 ↔ 楼栋**：通过 `buildingId` 关联
- **兑换记录 ↔ 积分流水**：通过 `exchangeId` 关联
- 所有新增记录自动同步更新对应数据与积分余额

## 误投纠正流程

1. **督导发现误投** → 督导记录页选择误投类别、正确分类、是否当场纠正
   - 当场纠正：状态直接变为 `onsite`，记录完整闭环
   - 待居民纠正：状态变为 `pending`，扣减积分，进入待纠正队列
2. **居民自助纠正** → 居民积分页"待纠正"Tab 查看并确认纠正
   - 系统自动恢复 50% 扣减积分，状态变为 `corrected`
   - 幂等保护：仅 `pending` 状态可操作，避免重复恢复
3. **督导追踪处理** → 误投纠正管理页
   - 查看所有待纠正记录（支持按楼栋筛选）
   - 标记"确认已纠正"或"居民拒不纠正"
4. **拒不纠正公示** → 楼栋排名页楼栋提醒名单
   - 居民拒不纠正自动进入对应楼栋提醒名单
   - 同一居民多次拒不纠正累计 warnCount 提醒次数

## 设计说明

- 采用绿色环保主色调，误投区域使用红色警示，积分/兑换使用金色强调
- 按钮最小尺寸 44px，适合平板触控操作
- 横屏双栏布局，一屏展示核心数据与操作区
- 数据为前端 Mock，无需后端即可完整演示
