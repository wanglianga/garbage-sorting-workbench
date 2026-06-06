<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 20h10"></path>
            <path d="M5 20V9.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V20"></path>
            <path d="M9 14l2 2 4-4"></path>
            <path d="M10 4h4l-1 3h-2z"></path>
          </svg>
        </div>
        <div class="logo-text">
          <h1>垃圾分类</h1>
          <p>工作平台</p>
        </div>
      </div>

      <nav class="nav-menu">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-item"
          :class="{ active: isActive(route.path) }"
        >
          <span class="nav-icon">
            <component :is="getIconComponent(route.meta.icon)" />
          </span>
          <span class="nav-label">{{ route.meta.title }}</span>
        </router-link>
      </nav>

      <div class="user-panel">
        <div class="user-avatar">李</div>
        <div class="user-info">
          <div class="user-name">李督导</div>
          <div class="user-role">社区督导员</div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="page-title">
          <h2>{{ currentTitle }}</h2>
          <p>{{ currentDate }}</p>
        </div>
        <div class="top-stats">
          <div class="stat-chip stat-chip-primary">
            <span class="stat-chip-label">今日投放</span>
            <span class="stat-chip-value">{{ stats.todayCount }}</span>
          </div>
          <div class="stat-chip stat-chip-success">
            <span class="stat-chip-label">正确率</span>
            <span class="stat-chip-value">{{ stats.accuracy }}%</span>
          </div>
          <div class="stat-chip stat-chip-gold">
            <span class="stat-chip-label">累计积分</span>
            <span class="stat-chip-value">{{ stats.totalPoints }}</span>
          </div>
        </div>
      </header>

      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from './stores/data'
import IconClipboard from './components/icons/IconClipboard.vue'
import IconBuilding from './components/icons/IconBuilding.vue'
import IconStar from './components/icons/IconStar.vue'
import IconRefresh from './components/icons/IconRefresh.vue'
import IconGift from './components/icons/IconGift.vue'

const route = useRoute()
const router = useRouter()
const store = useDataStore()

const navRoutes = computed(() =>
  router.options.routes.filter((r) => r.path !== '/')
)

const currentTitle = computed(() => route.meta?.title || '垃圾分类工作平台')

const currentDate = computed(() => {
  const now = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
})

const stats = computed(() => store.getOverviewStats())

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const iconMap = {
  clipboard: IconClipboard,
  building: IconBuilding,
  star: IconStar,
  refresh: IconRefresh,
  gift: IconGift
}

const getIconComponent = (name) => iconMap[name] || IconClipboard
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--color-bg);
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #065f46 0%, #047857 50%, #059669 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  flex-shrink: 0;
  position: relative;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.25), transparent 60%);
  pointer-events: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 8px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  width: 30px;
  height: 30px;
}

.logo-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.logo-text p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 2px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  transition: all 0.25s ease;
  font-size: 17px;
  font-weight: 500;
  min-height: 58px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.nav-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(6px);
}

.user-avatar {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.user-info .user-name {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.user-info .user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
  margin-top: 2px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 32px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.page-title h2 {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.3px;
}

.page-title p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.top-stats {
  display: flex;
  gap: 14px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px 18px;
  border-radius: 14px;
  min-width: 110px;
}

.stat-chip-primary {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.stat-chip-success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.stat-chip-gold {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.stat-chip-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-chip-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 2px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
}
</style>
