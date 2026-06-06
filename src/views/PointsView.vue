<template>
  <div class="points-view">
    <div class="view-grid">
      <div class="panel residents-panel">
        <div class="panel-header">
          <h3 class="panel-title">👥 居民列表</h3>
          <span class="panel-badge gold-badge">共 {{ store.state.residents.length }} 人</span>
        </div>

        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索居民姓名、手机号..."
            class="search-input"
          />
        </div>

        <div class="residents-list">
          <div
            v-for="r in filteredResidents"
            :key="r.id"
            class="resident-card"
            :class="{ active: selectedResident === r.id }"
            @click="selectResident(r.id)"
          >
            <div class="resident-avatar" :style="{ background: avatarColor(r.id) }">
              {{ r.name.charAt(0) }}
            </div>
            <div class="resident-info">
              <div class="resident-top">
                <span class="resident-name">{{ r.name }}</span>
                <span class="resident-room">{{ getBuildingName(r.buildingId) }} {{ r.roomNo }}</span>
              </div>
              <div class="resident-bottom">
                <span class="resident-phone">{{ r.phone }}</span>
              </div>
            </div>
            <div class="resident-points">
              <span class="points-num">{{ r.points }}</span>
              <span class="points-unit">积分</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel detail-panel" v-if="currentResident">
        <div class="panel-header detail-header">
          <div class="resident-brief">
            <div class="big-avatar" :style="{ background: avatarColor(currentResident.id) }">
              {{ currentResident.name.charAt(0) }}
            </div>
            <div>
              <h3 class="panel-title">{{ currentResident.name }}</h3>
              <p class="resident-sub">
                {{ getBuildingName(currentResident.buildingId) }} {{ currentResident.roomNo }}
                · {{ currentResident.phone }}
              </p>
            </div>
          </div>
          <div class="points-display">
            <span class="points-label">当前积分</span>
            <span class="points-big">{{ currentResident.points }}</span>
          </div>
        </div>

        <div class="detail-tabs">
          <button
            class="detail-tab"
            :class="{ active: activeTab === 'flows' }"
            @click="activeTab = 'flows'"
          >
            <span>💰 积分流水</span>
            <span class="tab-count">{{ residentFlows.length }}</span>
          </button>
          <button
            class="detail-tab"
            :class="{ active: activeTab === 'records' }"
            @click="activeTab = 'records'"
          >
            <span>📋 投放记录</span>
            <span class="tab-count">{{ residentRecords.length }}</span>
          </button>
        </div>

        <div class="detail-content">
          <div v-if="activeTab === 'flows'" class="flows-list">
            <div
              v-for="flow in residentFlows"
              :key="flow.id"
              class="flow-item"
              :class="{ clickable: flow.recordId || flow.exchangeId }"
              @click="handleFlowClick(flow)"
            >
              <div class="flow-icon" :class="getFlowIconClass(flow.type)">
                {{ getFlowIcon(flow.type) }}
              </div>
              <div class="flow-body">
                <div class="flow-title">
                  <span class="flow-type">{{ flow.type }}</span>
                  <span v-if="flow.recordId" class="trace-link">🔗 查看投放记录</span>
                  <span v-if="flow.exchangeId" class="trace-link">🔗 查看兑换详情</span>
                </div>
                <div class="flow-desc">{{ flow.description }}</div>
                <div class="flow-time">{{ formatTime(flow.time) }}</div>
              </div>
              <div class="flow-points" :class="flow.points >= 0 ? 'positive' : 'negative'">
                {{ flow.points >= 0 ? '+' : '' }}{{ flow.points }}
              </div>
            </div>

            <div v-if="residentFlows.length === 0" class="empty-state">
              <div class="empty-icon">💸</div>
              <p>暂无积分流水</p>
            </div>
          </div>

          <div v-if="activeTab === 'records'" class="records-list">
            <div
              v-for="record in residentRecords"
              :key="record.id"
              class="record-item"
              :class="record.isCorrect ? 'correct' : 'wrong'"
            >
              <div class="record-status">
                <div class="status-icon" :class="record.isCorrect ? 'icon-correct' : 'icon-wrong'">
                  {{ record.isCorrect ? '✓' : '!' }}
                </div>
              </div>
              <div class="record-body">
                <div class="record-row">
                  <span
                    class="record-type"
                    :style="getTypeStyle(record.garbageType)"
                  >
                    {{ record.garbageTypeLabel }}
                  </span>
                  <span
                    class="record-points"
                    :class="record.pointsChange >= 0 ? 'positive' : 'negative'"
                  >
                    {{ record.pointsChange >= 0 ? '+' : '' }}{{ record.pointsChange }} 分
                  </span>
                </div>
                <div class="record-meta">
                  <span>{{ formatTime(record.time) }}</span>
                  <span>·</span>
                  <span>{{ getDropPointName(record.dropPointId) }}</span>
                  <span v-if="record.supervisor">·</span>
                  <span v-if="record.supervisor">{{ record.supervisor }}</span>
                </div>
                <div v-if="!record.isCorrect" class="record-mis投">
                  <span class="mis投-tag">误投原因：{{ record.mis投Reason }}</span>
                  <span v-if="record.correctionResult" class="mis投-correction">
                    纠正：{{ record.correctionResult }}
                  </span>
                </div>
              </div>
              <div v-if="record.photo" class="record-photo">📷</div>
            </div>

            <div v-if="residentRecords.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无投放记录</p>
            </div>
          </div>
        </div>

        <div v-if="tracedRecord" class="trace-modal" @click.self="tracedRecord = null">
          <div class="trace-card">
            <div class="trace-header">
              <h4>🔍 关联投放记录详情</h4>
              <button class="close-btn" @click="tracedRecord = null">✕</button>
            </div>
            <div class="trace-content">
              <div class="trace-row">
                <span class="trace-label">记录编号</span>
                <span class="trace-value">{{ tracedRecord.id }}</span>
              </div>
              <div class="trace-row">
                <span class="trace-label">投放居民</span>
                <span class="trace-value">{{ getResidentName(tracedRecord.residentId) }}</span>
              </div>
              <div class="trace-row">
                <span class="trace-label">垃圾类别</span>
                <span class="trace-value" :style="getTypeStyle(tracedRecord.garbageType)">
                  {{ tracedRecord.garbageTypeLabel }}
                </span>
              </div>
              <div class="trace-row">
                <span class="trace-label">投放结果</span>
                <span class="trace-value" :class="tracedRecord.isCorrect ? 'text-success' : 'text-danger'">
                  {{ tracedRecord.isCorrect ? '✓ 投放正确' : '✗ 发现误投' }}
                </span>
              </div>
              <div class="trace-row" v-if="!tracedRecord.isCorrect">
                <span class="trace-label">误投原因</span>
                <span class="trace-value">{{ tracedRecord.mis投Reason }}</span>
              </div>
              <div class="trace-row" v-if="!tracedRecord.isCorrect && tracedRecord.correctionResult">
                <span class="trace-label">纠正结果</span>
                <span class="trace-value">{{ tracedRecord.correctionResult }}</span>
              </div>
              <div class="trace-row">
                <span class="trace-label">投放点</span>
                <span class="trace-value">{{ getDropPointName(tracedRecord.dropPointId) }}</span>
              </div>
              <div class="trace-row">
                <span class="trace-label">督导员</span>
                <span class="trace-value">{{ tracedRecord.supervisor }}</span>
              </div>
              <div class="trace-row">
                <span class="trace-label">积分变动</span>
                <span class="trace-value" :class="tracedRecord.pointsChange >= 0 ? 'text-success' : 'text-danger'">
                  {{ tracedRecord.pointsChange >= 0 ? '+' : '' }}{{ tracedRecord.pointsChange }} 分
                </span>
              </div>
              <div class="trace-row">
                <span class="trace-label">投放时间</span>
                <span class="trace-value">{{ formatFullTime(tracedRecord.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel detail-panel empty-panel" v-else>
        <div class="empty-select">
          <div class="empty-big-icon">👆</div>
          <h3>请选择一位居民</h3>
          <p>查看积分流水与投放记录详情</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

const searchText = ref('')
const selectedResident = ref(null)
const activeTab = ref('flows')
const tracedRecord = ref(null)

const avatarColors = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #14b8a6, #0d9488)'
]

const avatarColor = (id) => {
  const idx = parseInt(id.replace(/\D/g, '')) % avatarColors.length
  return avatarColors[idx]
}

const filteredResidents = computed(() => {
  if (!searchText.value.trim()) return store.state.residents
  const kw = searchText.value.trim().toLowerCase()
  return store.state.residents.filter(
    (r) =>
      r.name.toLowerCase().includes(kw) ||
      r.phone.toLowerCase().includes(kw)
  )
})

const currentResident = computed(() =>
  selectedResident.value ? store.getResidentById(selectedResident.value) : null
)

const residentFlows = computed(() =>
  selectedResident.value ? store.getPointFlowsByResident(selectedResident.value) : []
)

const residentRecords = computed(() =>
  selectedResident.value ? store.getRecordsByResident(selectedResident.value) : []
)

const selectResident = (id) => {
  selectedResident.value = id
  activeTab.value = 'flows'
  tracedRecord.value = null
}

const handleFlowClick = (flow) => {
  if (flow.recordId) {
    tracedRecord.value = store.getRecordById(flow.recordId)
  }
}

const getFlowIcon = (type) => {
  if (type === '投放奖励') return '↑'
  if (type === '误投扣减') return '↓'
  if (type === '礼品兑换') return '🎁'
  return '•'
}

const getFlowIconClass = (type) => {
  if (type === '投放奖励') return 'icon-plus'
  if (type === '误投扣减') return 'icon-minus'
  if (type === '礼品兑换') return 'icon-gift'
  return ''
}

const getResidentName = (id) => store.getResidentById(id)?.name || '未知'
const getBuildingName = (id) => store.getBuildingById(id)?.name || ''
const getDropPointName = (id) => store.state.dropPoints.find((d) => d.id === id)?.name || ''

const getTypeStyle = (type) => {
  const gt = store.state.garbageTypes.find((g) => g.value === type)
  if (!gt) return {}
  return { color: gt.color, background: gt.bgColor, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }
}

const formatTime = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatFullTime = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
</script>

<style scoped>
.points-view {
  height: 100%;
}

.view-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.3fr;
  gap: 24px;
  height: 100%;
  min-height: 0;
}

.panel {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.panel-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text);
}

.panel-badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.gold-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 20px 12px;
  padding: 12px 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.search-icon {
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-text);
}

.residents-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 16px 20px;
}

.resident-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.resident-card:hover {
  transform: translateX(3px);
  background: #e5e7eb;
}

.resident-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.resident-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}

.resident-info {
  flex: 1;
  min-width: 0;
}

.resident-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.resident-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.resident-room {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  color: var(--color-text-secondary);
}

.resident-phone {
  font-size: 13px;
  color: var(--color-text-muted);
}

.resident-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.points-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gold);
  line-height: 1;
}

.points-unit {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.detail-header {
  gap: 16px;
}

.resident-brief {
  display: flex;
  align-items: center;
  gap: 14px;
}

.big-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
}

.resident-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.points-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px 18px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: var(--radius-md);
}

.points-label {
  font-size: 12px;
  color: #92400e;
  font-weight: 500;
}

.points-big {
  font-size: 26px;
  font-weight: 700;
  color: #78350f;
  line-height: 1.1;
  margin-top: 2px;
}

.detail-tabs {
  display: flex;
  gap: 8px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.detail-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.detail-tab:hover {
  background: #e5e7eb;
}

.detail-tab.active {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab-count {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  font-size: 12px;
}

.detail-tab:not(.active) .tab-count {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-secondary);
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
}

.flows-list,
.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.flow-item.clickable {
  cursor: pointer;
}

.flow-item.clickable:hover {
  background: #e5e7eb;
  transform: translateX(3px);
}

.flow-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.flow-icon.icon-plus {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.flow-icon.icon-minus {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.flow-icon.icon-gift {
  background: var(--color-gold-light);
  color: var(--color-gold);
}

.flow-body {
  flex: 1;
  min-width: 0;
}

.flow-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 3px;
}

.flow-type {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.trace-link {
  font-size: 11px;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  font-weight: 500;
}

.flow-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 3px;
}

.flow-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.flow-points {
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.flow-points.positive {
  color: var(--color-primary);
}

.flow-points.negative {
  color: var(--color-danger);
}

.record-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
}

.record-item.correct {
  border-left: 4px solid var(--color-primary);
}

.record-item.wrong {
  border-left: 4px solid var(--color-danger);
  background: linear-gradient(90deg, #fef2f2, var(--color-border-light));
}

.record-status {
  flex-shrink: 0;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.status-icon.icon-correct {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.status-icon.icon-wrong {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.record-body {
  flex: 1;
  min-width: 0;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.record-type {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.record-points {
  margin-left: auto;
  font-size: 15px;
  font-weight: 700;
}

.record-points.positive {
  color: var(--color-primary);
}

.record-points.negative {
  color: var(--color-danger);
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.record-mis投 {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mis投-tag {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-danger);
}

.mis投-correction {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.record-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-warning-light);
  border-radius: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-big-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.empty-select h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-select p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.trace-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.trace-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.trace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.trace-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-border-light);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.trace-content {
  padding: 20px 24px;
  overflow-y: auto;
}

.trace-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.trace-row:last-child {
  border-bottom: none;
}

.trace-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.trace-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.text-success {
  color: var(--color-primary) !important;
}

.text-danger {
  color: var(--color-danger) !important;
}
</style>
