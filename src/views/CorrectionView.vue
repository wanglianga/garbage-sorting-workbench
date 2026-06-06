<template>
  <div class="correction-view">
    <div class="stats-bar">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <span class="stat-label">累计误投</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card stat-onsite">
        <div class="stat-icon">✓</div>
        <div class="stat-info">
          <span class="stat-label">当场纠正</span>
          <span class="stat-value">{{ stats.onsite }}</span>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <span class="stat-label">待纠正</span>
          <span class="stat-value">{{ stats.pending }}</span>
        </div>
      </div>
      <div class="stat-card stat-corrected">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-label">居民已纠正</span>
          <span class="stat-value">{{ stats.corrected }}</span>
        </div>
      </div>
      <div class="stat-card stat-refused">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <span class="stat-label">拒不纠正</span>
          <span class="stat-value">{{ stats.refused }}</span>
        </div>
      </div>
    </div>

    <div class="view-grid">
      <div class="panel pending-panel">
        <div class="panel-header">
          <h3 class="panel-title">⏳ 待纠正记录</h3>
          <span class="panel-badge pending-badge">共 {{ pendingList.length }} 项</span>
        </div>

        <div class="filter-row">
          <select v-model="filterBuilding" class="form-select">
            <option value="">全部楼栋</option>
            <option v-for="b in store.state.buildings" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div class="pending-list">
          <div
            v-for="record in filteredPending"
            :key="record.id"
            class="pending-card"
          >
            <div class="pending-header">
              <div class="resident-brief">
                <div class="resident-avatar" :style="{ background: avatarColor(record.residentId) }">
                  {{ getResidentName(record.residentId).charAt(0) }}
                </div>
                <div>
                  <div class="resident-name">{{ getResidentName(record.residentId) }}</div>
                  <div class="resident-meta">
                    {{ getBuildingName(record.buildingId) }} {{ getResident(record.residentId)?.roomNo }}
                    · {{ formatTime(record.time) }}
                  </div>
                </div>
              </div>
              <span class="pending-tag">待纠正</span>
            </div>

            <div class="pending-body">
              <div class="detail-row">
                <span class="detail-label">误投类别</span>
                <span class="detail-value" :style="getTypeStyle(record.garbageType)">
                  {{ record.garbageTypeLabel }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">正确分类</span>
                <span class="detail-value correct" :style="getTypeStyle(record.correctType)">
                  {{ getCorrectTypeLabel(record.correctType) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">误投原因</span>
                <span class="detail-value">{{ record.mis投Reason }}</span>
              </div>
              <div class="detail-row" v-if="record.correctionResult">
                <span class="detail-label">督导备注</span>
                <span class="detail-value">{{ record.correctionResult }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">积分扣减</span>
                <span class="detail-value points negative">{{ record.pointsChange }} 分</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">可恢复积分</span>
                <span class="detail-value points restore">
                  +{{ Math.round(Math.abs(record.pointsChange) * store.CORRECTION_RESTORE_RATIO) }} 分
                </span>
              </div>
            </div>

            <div class="pending-footer" v-if="!processingId || processingId !== record.id">
              <button
                class="action-btn btn-refuse"
                @click="handleRefuse(record.id)"
              >
                居民拒不纠正
              </button>
              <button
                class="action-btn btn-confirm"
                @click="handleConfirm(record.id)"
              >
                确认已纠正
              </button>
            </div>
            <div class="pending-footer processing" v-else>
              <span class="processing-text">处理中...</span>
            </div>
          </div>

          <div v-if="filteredPending.length === 0" class="empty-state">
            <div class="empty-icon">🎉</div>
            <h3>暂无待纠正记录</h3>
            <p>所有误投项都已处理完毕</p>
          </div>
        </div>
      </div>

      <div class="panel history-panel">
        <div class="panel-header">
          <h3 class="panel-title">📜 纠正记录历史</h3>
          <div class="filter-tabs">
            <button
              v-for="tab in historyTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ active: activeHistoryTab === tab.value }"
              @click="activeHistoryTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="history-list">
          <div
            v-for="cor in filteredHistory"
            :key="cor.id"
            class="history-item"
          >
            <div class="history-icon" :class="'action-' + cor.action">
              {{ getActionIcon(cor.action) }}
            </div>
            <div class="history-body">
              <div class="history-title">
                <span class="history-action">{{ getActionLabel(cor.action) }}</span>
                <span class="history-resident">{{ getResidentName(cor.residentId) }}</span>
                <span v-if="cor.pointsRestored > 0" class="history-points positive">
                  +{{ cor.pointsRestored }} 分
                </span>
              </div>
              <div class="history-meta">
                <span>{{ getBuildingName(cor.buildingId) }}</span>
                <span>·</span>
                <span>{{ cor.operator }}</span>
                <span>·</span>
                <span>{{ formatTime(cor.time) }}</span>
              </div>
              <div class="history-remark" v-if="cor.remark">
                {{ cor.remark }}
              </div>
            </div>
          </div>

          <div v-if="filteredHistory.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无记录</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showResultModal" class="result-modal" @click.self="showResultModal = false">
      <div class="result-card" :class="resultModal.type">
        <div class="result-icon">{{ resultModal.icon }}</div>
        <h3 class="result-title">{{ resultModal.title }}</h3>
        <p class="result-desc">{{ resultModal.desc }}</p>
        <button class="result-btn" @click="showResultModal = false">
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

const filterBuilding = ref('')
const activeHistoryTab = ref('all')
const processingId = ref(null)
const showResultModal = ref(false)
const resultModal = reactive({
  type: 'success',
  icon: '',
  title: '',
  desc: ''
})

const avatarColors = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #14b8a6, #0d9488)'
]

const historyTabs = [
  { label: '全部', value: 'all' },
  { label: '当场纠正', value: 'onsite' },
  { label: '居民纠正', value: 'corrected' },
  { label: '拒不纠正', value: 'refused' }
]

const stats = computed(() => store.getCorrectionStats())
const pendingList = computed(() => store.getPendingCorrections())

const filteredPending = computed(() => {
  if (!filterBuilding.value) return pendingList.value
  return pendingList.value.filter((r) => r.buildingId === filterBuilding.value)
})

const filteredHistory = computed(() => {
  let list = [...store.state.correctionRecords].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  )
  if (activeHistoryTab.value !== 'all') {
    list = list.filter((c) => c.action === activeHistoryTab.value)
  }
  return list.slice(0, 50)
})

const avatarColor = (id) => {
  const idx = parseInt(id?.replace(/\D/g, '') || '0') % avatarColors.length
  return avatarColors[idx]
}

const getResident = (id) => store.getResidentById(id)
const getResidentName = (id) => store.getResidentById(id)?.name || '未知'
const getBuildingName = (id) => store.getBuildingById(id)?.name || ''
const getCorrectTypeLabel = (typeVal) => {
  const gt = store.state.garbageTypes.find((g) => g.value === typeVal)
  return gt?.label || ''
}

const getTypeStyle = (type) => {
  const gt = store.state.garbageTypes.find((g) => g.value === type)
  if (!gt) return {}
  return { color: gt.color, background: gt.bgColor, padding: '3px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }
}

const getActionIcon = (action) => {
  switch (action) {
    case 'onsite': return '✓'
    case 'corrected': return '✅'
    case 'refused': return '⚠️'
    default: return '•'
  }
}

const getActionLabel = (action) => {
  switch (action) {
    case 'onsite': return '当场纠正'
    case 'corrected': return '居民已纠正'
    case 'refused': return '拒不纠正'
    default: return '操作记录'
  }
}

const formatTime = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleConfirm = (recordId) => {
  processingId.value = recordId
  setTimeout(() => {
    const result = store.confirmResidentCorrection(recordId, '督导员现场确认已纠正', '李督导')
    processingId.value = null
    if (result.success) {
      resultModal.type = 'success'
      resultModal.icon = '✅'
      resultModal.title = '确认成功'
      resultModal.desc = `居民已完成纠正，恢复 ${result.restorePoints} 积分`
      showResultModal.value = true
    }
  }, 400)
}

const handleRefuse = (recordId) => {
  processingId.value = recordId
  setTimeout(() => {
    const result = store.markAsRefused(recordId, '', '李督导')
    processingId.value = null
    if (result.success) {
      resultModal.type = 'warning'
      resultModal.icon = '⚠️'
      resultModal.title = '已标记拒不纠正'
      resultModal.desc = '该居民已进入楼栋提醒名单'
      showResultModal.value = true
    }
  }, 400)
}
</script>

<style scoped>
.correction-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: var(--color-border-light);
}

.stat-total .stat-icon { background: #e5e7eb; }
.stat-onsite .stat-icon { background: var(--color-primary-light); color: var(--color-primary); }
.stat-pending .stat-icon { background: var(--color-warning-light); }
.stat-corrected .stat-icon { background: #dbeafe; }
.stat-refused .stat-icon { background: var(--color-danger-light); }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
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
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.panel-badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.filter-row {
  padding: 14px 22px;
  border-bottom: 1px solid var(--color-border-light);
}

.form-select {
  width: 100%;
  max-width: 200px;
  padding: 10px 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: #fff;
}

.pending-list,
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pending-card {
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 18px;
  border-left: 4px solid var(--color-warning);
  transition: all 0.2s ease;
}

.pending-card:hover {
  background: #e5e7eb;
  transform: translateX(3px);
}

.pending-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.resident-brief {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resident-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}

.resident-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.resident-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

.pending-tag {
  padding: 6px 14px;
  background: var(--color-warning-light);
  color: #92400e;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  animation: pulse-warn 2s ease-in-out infinite;
}

@keyframes pulse-warn {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.pending-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
}

.detail-value.correct {
  font-weight: 700;
}

.detail-value.points.negative {
  color: var(--color-danger);
}

.detail-value.points.restore {
  color: var(--color-primary);
}

.pending-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.pending-footer.processing {
  justify-content: center;
  padding: 10px;
}

.processing-text {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
}

.action-btn {
  padding: 12px 22px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 48px;
}

.btn-refuse {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.btn-refuse:hover {
  background: var(--color-danger);
  color: #fff;
  transform: translateY(-2px);
}

.btn-confirm {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.filter-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
}

.filter-tab {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: #fff;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.history-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
}

.history-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: #e5e7eb;
}

.history-icon.action-onsite { background: var(--color-primary-light); color: var(--color-primary); }
.history-icon.action-corrected { background: #dbeafe; color: #2563eb; }
.history-icon.action-refused { background: var(--color-danger-light); color: var(--color-danger); }

.history-body {
  flex: 1;
  min-width: 0;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.history-action {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.history-resident {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.history-points.positive {
  margin-left: auto;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 700;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.history-remark {
  font-size: 13px;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.6);
  padding: 8px 12px;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.empty-state p {
  font-size: 14px;
}

.result-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.result-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px 36px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 10px;
}

.result-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.result-btn {
  padding: 14px 36px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
  min-height: 50px;
}

.result-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}
</style>
