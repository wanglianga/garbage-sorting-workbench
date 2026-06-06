<template>
  <div class="supervision-view">
    <div class="view-grid">
      <div class="panel record-panel">
        <div class="panel-header">
          <h3 class="panel-title">📋 现场投放记录</h3>
          <span class="panel-badge">督导员操作</span>
        </div>

        <div class="record-form">
          <div class="form-row">
            <div class="form-field">
              <label>投放居民</label>
              <select v-model="form.residentId" class="form-select large">
                <option value="">请选择居民</option>
                <option v-for="r in store.state.residents" :key="r.id" :value="r.id">
                  {{ r.name }} - {{ getBuildingName(r.buildingId) }}{{ r.roomNo }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>投放点</label>
              <select v-model="form.dropPointId" class="form-select large">
                <option v-for="dp in store.state.dropPoints" :key="dp.id" :value="dp.id">
                  {{ dp.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>垃圾类别</label>
              <div class="garbage-types">
                <button
                  v-for="gt in store.state.garbageTypes"
                  :key="gt.value"
                  class="type-btn"
                  :class="{ active: form.garbageType === gt.value }"
                  :style="{ '--type-color': gt.color, '--type-bg': gt.bgColor }"
                  @click="form.garbageType = gt.value; form.garbageTypeLabel = gt.label; form.points = gt.points"
                >
                  <span class="type-dot"></span>
                  <span class="type-name">{{ gt.label }}</span>
                  <span class="type-points">+{{ gt.points }}分</span>
                </button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>投放结果</label>
              <div class="result-toggle">
                <button
                  class="result-btn result-correct"
                  :class="{ active: form.isCorrect }"
                  @click="setCorrect(true)"
                >
                  <span class="result-icon">✓</span>
                  <span>投放正确</span>
                </button>
                <button
                  class="result-btn result-wrong"
                  :class="{ active: !form.isCorrect }"
                  @click="setCorrect(false)"
                >
                  <span class="result-icon">✗</span>
                  <span>发现误投</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="!form.isCorrect" class="mis投-section">
            <div class="form-row">
              <div class="form-field">
                <label>误投类别（投错类别）</label>
                <div class="garbage-types small">
                  <button
                    v-for="gt in store.state.garbageTypes"
                    :key="gt.value"
                    class="type-btn"
                    :class="{ active: form.garbageType === gt.value }"
                    :style="{ '--type-color': gt.color, '--type-bg': gt.bgColor }"
                    @click="form.garbageType = gt.value; form.garbageTypeLabel = gt.label; form.points = gt.points"
                  >
                    <span class="type-dot"></span>
                    <span class="type-name">{{ gt.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>正确分类</label>
                <div class="garbage-types small">
                  <button
                    v-for="gt in store.state.garbageTypes"
                    :key="gt.value"
                    class="type-btn"
                    :class="{ active: form.correctType === gt.value }"
                    :style="{ '--type-color': gt.color, '--type-bg': gt.bgColor }"
                    @click="form.correctType = gt.value; form.correctTypeLabel = gt.label"
                  >
                    <span class="type-dot"></span>
                    <span class="type-name">{{ gt.label }}</span>
                  </button>
                </div>
                <p class="field-hint">提示：标注正确分类，便于居民了解正确投放方式</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>误投原因</label>
                <div class="reason-chips">
                  <button
                    v-for="reason in store.state.mis投Reasons"
                    :key="reason"
                    class="reason-chip"
                    :class="{ active: form.mis投Reason === reason }"
                    @click="form.mis投Reason = reason"
                  >
                    {{ reason }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>现场照片</label>
                <div class="photo-upload" @click="togglePhoto">
                  <template v-if="form.photo">
                    <div class="photo-preview">
                      <div class="photo-placeholder">📷 已拍摄照片</div>
                      <span class="photo-time">{{ new Date().toLocaleTimeString() }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="photo-icon">📷</div>
                    <span>点击拍照/上传</span>
                  </template>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>是否当场纠正</label>
                <div class="onsite-toggle">
                  <button
                    class="onsite-btn onsite-yes"
                    :class="{ active: form.correctedOnSite === true }"
                    @click="form.correctedOnSite = true"
                  >
                    <span class="onsite-icon">✓</span>
                    <span>当场已纠正</span>
                  </button>
                  <button
                    class="onsite-btn onsite-no"
                    :class="{ active: form.correctedOnSite === false }"
                    @click="form.correctedOnSite = false"
                  >
                    <span class="onsite-icon">⏳</span>
                    <span>待居民纠正</span>
                  </button>
                </div>
                <p class="field-hint" v-if="form.correctedOnSite === true">
                  当场完成纠正，不进入待纠正队列
                </p>
                <p class="field-hint warning" v-else-if="form.correctedOnSite === false">
                  居民可主动纠正恢复 {{ Math.round(2 * store.CORRECTION_RESTORE_RATIO) }} 积分；拒不纠正将进入楼栋提醒名单
                </p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>{{ form.correctedOnSite ? '纠正结果' : '督导备注' }}</label>
                <textarea
                  v-model="form.correctionResult"
                  class="form-textarea"
                  rows="2"
                  :placeholder="form.correctedOnSite ? '请记录现场纠正情况...' : '请记录需居民纠正的说明...'"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="form-row submit-row">
            <div class="points-preview" v-if="form.residentId && form.garbageType">
              <span>积分变动：</span>
              <span class="points-value" :class="form.isCorrect ? 'positive' : 'negative'">
                {{ form.isCorrect ? '+' : '' }}{{ form.isCorrect ? form.points : -2 }} 分
              </span>
            </div>
            <button class="submit-btn" :disabled="!canSubmit" @click="submitRecord">
              <span>提交记录</span>
              <span class="submit-arrow">→</span>
            </button>
          </div>
        </div>
      </div>

      <div class="panel records-panel">
        <div class="panel-header">
          <h3 class="panel-title">📝 近期投放记录</h3>
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ active: activeFilter === tab.value }"
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="records-list">
          <div
            v-for="record in filteredRecords"
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
                <span class="record-resident">{{ getResidentName(record.residentId) }}</span>
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
                  {{ record.pointsChange >= 0 ? '+' : '' }}{{ record.pointsChange }}
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
                <div class="mis投-line">
                  <span class="mis投-tag">误投原因：{{ record.mis投Reason }}</span>
                  <span v-if="record.correctType" class="correct-type-tag">
                    正确分类：{{ getCorrectTypeLabel(record.correctType) }}
                  </span>
                  <span v-if="getCorrectionStatusBadge(record)" class="correction-status" :class="getCorrectionStatusBadge(record).class">
                    {{ getCorrectionStatusBadge(record).label }}
                  </span>
                </div>
                <span v-if="record.correctionResult" class="mis投-correction">
                  {{ record.correctedOnSite ? '当场纠正：' : '备注：' }}{{ record.correctionResult }}
                </span>
              </div>
            </div>
            <div v-if="record.photo" class="record-photo">
              📷
            </div>
          </div>

          <div v-if="filteredRecords.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '正确', value: 'correct' },
  { label: '误投', value: 'wrong' }
]

const activeFilter = ref('all')

const form = reactive({
  residentId: '',
  dropPointId: store.state.dropPoints[0]?.id || '',
  garbageType: '',
  garbageTypeLabel: '',
  isCorrect: true,
  mis投Reason: '',
  photo: null,
  correctType: '',
  correctTypeLabel: '',
  correctedOnSite: null,
  correctionResult: '',
  points: 0
})

const canSubmit = computed(() => {
  if (!form.residentId || !form.garbageType) return false
  if (!form.isCorrect) {
    if (!form.mis投Reason) return false
    if (!form.correctType) return false
    if (form.correctedOnSite === null) return false
  }
  return true
})

const filteredRecords = computed(() => {
  let list = [...store.state.投放Records].sort((a, b) => new Date(b.time) - new Date(a.time))
  if (activeFilter.value === 'correct') list = list.filter((r) => r.isCorrect)
  if (activeFilter.value === 'wrong') list = list.filter((r) => !r.isCorrect)
  return list.slice(0, 30)
})

const setCorrect = (val) => {
  form.isCorrect = val
  if (val) {
    form.mis投Reason = ''
    form.photo = null
    form.correctionResult = ''
    form.correctType = ''
    form.correctTypeLabel = ''
    form.correctedOnSite = null
  }
}

const togglePhoto = () => {
  form.photo = form.photo ? null : 'placeholder'
}

const submitRecord = () => {
  const resident = store.getResidentById(form.residentId)
  const buildingId = resident?.buildingId
  const pointsChange = form.isCorrect ? form.points : -2

  store.add投放Record({
    residentId: form.residentId,
    buildingId,
    dropPointId: form.dropPointId,
    garbageType: form.garbageType,
    garbageTypeLabel: form.garbageTypeLabel,
    isCorrect: form.isCorrect,
    pointsChange,
    photo: form.photo,
    mis投Reason: form.mis投Reason || null,
    correctType: form.correctType || null,
    correctedOnSite: form.correctedOnSite,
    correctionResult: form.correctionResult || null,
    supervisor: '李督导'
  })

  form.residentId = ''
  form.garbageType = ''
  form.garbageTypeLabel = ''
  form.isCorrect = true
  form.mis投Reason = ''
  form.photo = null
  form.correctType = ''
  form.correctTypeLabel = ''
  form.correctedOnSite = null
  form.correctionResult = ''
  form.points = 0
}

const getCorrectTypeLabel = (typeVal) => {
  const gt = store.state.garbageTypes.find((g) => g.value === typeVal)
  return gt?.label || ''
}

const getCorrectionStatusBadge = (record) => {
  if (record.isCorrect) return null
  switch (record.correctionStatus) {
    case 'onsite':
      return { label: '当场纠正', class: 'status-onsite' }
    case 'pending':
      return { label: '待纠正', class: 'status-pending' }
    case 'corrected':
      return { label: '已纠正', class: 'status-corrected' }
    case 'refused':
      return { label: '拒不纠正', class: 'status-refused' }
    default:
      return null
  }
}

const getResidentName = (id) => store.getResidentById(id)?.name || '未知'
const getBuildingName = (id) => store.getBuildingById(id)?.name || ''
const getDropPointName = (id) => store.state.dropPoints.find((d) => d.id === id)?.name || ''

const getTypeStyle = (type) => {
  const gt = store.state.garbageTypes.find((g) => g.value === type)
  if (!gt) return {}
  return { color: gt.color, background: gt.bgColor }
}

const formatTime = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.supervision-view {
  height: 100%;
}

.view-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
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
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.record-form {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  margin-bottom: 22px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.record-form > .form-row:first-of-type,
.record-form > .form-row:nth-of-type(2),
.record-form > .form-row:nth-of-type(3) {
  display: block;
}

.record-form > .form-row:nth-of-type(2) .form-field,
.record-form > .form-row:nth-of-type(3) .form-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 16px;
  background: #fff;
  transition: all 0.2s ease;
  min-height: 52px;
}

.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.form-select.large {
  font-size: 16px;
  min-height: 56px;
}

.garbage-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  transition: all 0.2s ease;
  min-height: 80px;
}

.type-btn:hover {
  transform: translateY(-2px);
}

.type-btn.active {
  border-color: var(--type-color);
  background: var(--type-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.type-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--type-color, #9ca3af);
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.type-points {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.result-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.result-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 17px;
  font-weight: 600;
  transition: all 0.25s ease;
  min-height: 64px;
}

.result-correct {
  color: var(--color-text-secondary);
  background: var(--color-border-light);
}

.result-correct.active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-color: var(--color-primary);
  color: #065f46;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.result-wrong {
  color: var(--color-text-secondary);
  background: var(--color-border-light);
}

.result-wrong.active {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-color: var(--color-danger);
  color: #991b1b;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.result-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.result-correct .result-icon {
  background: rgba(255, 255, 255, 0.6);
}

.result-correct.active .result-icon {
  background: #ffffff;
  color: #059669;
}

.result-wrong .result-icon {
  background: rgba(255, 255, 255, 0.6);
}

.result-wrong.active .result-icon {
  background: #ffffff;
  color: #dc2626;
}

.mis投-section {
  padding: 20px;
  background: var(--color-danger-light);
  border-radius: var(--radius-md);
  margin-bottom: 22px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.reason-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reason-chip {
  padding: 10px 18px;
  background: #ffffff;
  border: 2px solid var(--color-border);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  transition: all 0.2s ease;
  min-height: 44px;
}

.reason-chip:hover {
  border-color: var(--color-danger);
}

.reason-chip.active {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #ffffff;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.photo-upload:hover {
  border-color: var(--color-danger);
  background: #fff5f5;
}

.photo-icon {
  font-size: 36px;
}

.photo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.photo-placeholder {
  padding: 18px 28px;
  background: var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.photo-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: #fff;
  resize: vertical;
  min-height: 72px;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 0 !important;
  padding-top: 8px;
}

.points-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.points-value {
  font-size: 22px;
  font-weight: 700;
}

.points-value.positive {
  color: var(--color-primary);
}

.points-value.negative {
  color: var(--color-danger);
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-size: 17px;
  font-weight: 700;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  min-height: 58px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-arrow {
  font-size: 20px;
  font-weight: 700;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
}

.filter-tab {
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: #ffffff;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.records-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
}

.record-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.record-item:hover {
  background: #e5e7eb;
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

.record-resident {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
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

.garbage-types.small .type-btn {
  min-height: 60px;
  padding: 10px 8px;
}

.garbage-types.small .type-name {
  font-size: 13px;
}

.garbage-types.small .type-dot {
  width: 12px;
  height: 12px;
}

.field-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
  line-height: 1.5;
}

.field-hint.warning {
  color: var(--color-warning);
  font-weight: 500;
}

.onsite-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.onsite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  transition: all 0.25s ease;
  min-height: 58px;
  color: var(--color-text-secondary);
  background: var(--color-border-light);
}

.onsite-btn:hover {
  transform: translateY(-2px);
}

.onsite-btn.onsite-yes.active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-color: var(--color-primary);
  color: #065f46;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.onsite-btn.onsite-no.active {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: var(--color-warning);
  color: #92400e;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
}

.onsite-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
}

.mis投-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.correct-type-tag {
  padding: 2px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.correction-status {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.correction-status.status-onsite {
  background: #d1fae5;
  color: #065f46;
}

.correction-status.status-pending {
  background: #fef3c7;
  color: #92400e;
  animation: pulse-warn 2s ease-in-out infinite;
}

.correction-status.status-corrected {
  background: #dbeafe;
  color: #1d4ed8;
}

.correction-status.status-refused {
  background: #fee2e2;
  color: #991b1b;
}

@keyframes pulse-warn {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
