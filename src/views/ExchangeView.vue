<template>
  <div class="exchange-view">
    <div class="view-grid">
      <div class="panel stock-panel">
        <div class="panel-header">
          <h3 class="panel-title">🎁 兑换礼品库存</h3>
          <span class="panel-badge info-badge">{{ gifts.length }} 种礼品</span>
        </div>

        <div class="gift-filters">
          <button
            v-for="cat in categories"
            :key="cat"
            class="filter-chip"
            :class="{ active: activeCategory === cat }"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="gifts-grid">
          <div
            v-for="gift in filteredGifts"
            :key="gift.id"
            class="gift-card"
            :class="{ low: gift.stock < 20, out: gift.stock === 0 }"
            @click="openExchange(gift)"
          >
            <div class="gift-image">{{ gift.image }}</div>
            <div class="gift-info">
              <div class="gift-name">{{ gift.name }}</div>
              <div class="gift-bottom">
                <span class="gift-cost">
                  <span class="cost-icon">⭐</span>
                  {{ gift.pointsCost }}
                </span>
                <span
                  class="gift-stock"
                  :class="{ danger: gift.stock < 20, zero: gift.stock === 0 }"
                >
                  {{ gift.stock === 0 ? '已兑完' : `剩 ${gift.stock}` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel records-panel">
        <div class="panel-header">
          <h3 class="panel-title">📜 兑换记录</h3>
          <div class="stock-summary">
            <span class="summary-label">已兑换</span>
            <span class="summary-value">{{ exchangeRecords.length }} 笔</span>
          </div>
        </div>

        <div class="exchange-list">
          <div
            v-for="record in exchangeRecords"
            :key="record.id"
            class="exchange-item"
          >
            <div class="exchange-icon">🎁</div>
            <div class="exchange-body">
              <div class="exchange-row">
                <span class="exchange-gift">{{ record.giftName }}</span>
                <span class="exchange-cost">-{{ record.pointsCost }}分</span>
              </div>
              <div class="exchange-meta">
                <span>{{ getResidentName(record.residentId) }}</span>
                <span>·</span>
                <span>{{ getResidentRoom(record.residentId) }}</span>
                <span>·</span>
                <span>{{ record.operator }}</span>
              </div>
              <div class="exchange-time">{{ formatTime(record.time) }}</div>
            </div>
            <div class="exchange-status">
              <span class="status-badge success">已完成</span>
            </div>
          </div>

          <div v-if="exchangeRecords.length === 0" class="empty-state">
            <div class="empty-icon">🎁</div>
            <p>暂无兑换记录</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="exchange-modal" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>礼品兑换</h3>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <div v-if="selectedGift" class="modal-body">
          <div class="gift-banner">
            <div class="banner-image">{{ selectedGift.image }}</div>
            <div class="banner-info">
              <div class="banner-name">{{ selectedGift.name }}</div>
              <div class="banner-cost">
                <span class="cost-star">⭐</span>
                <span>{{ selectedGift.pointsCost }} 积分</span>
              </div>
              <div class="banner-stock">
                剩余库存：<b>{{ selectedGift.stock }}</b> 件
              </div>
            </div>
          </div>

          <div class="form-section">
            <label>兑换居民</label>
            <select v-model="exchangeForm.residentId" class="form-select">
              <option value="">请选择居民</option>
              <option
                v-for="r in eligibleResidents"
                :key="r.id"
                :value="r.id"
              >
                {{ r.name }} - {{ getBuildingName(r.buildingId) }}{{ r.roomNo }}（当前{{ r.points }}分）
              </option>
            </select>
          </div>

          <div v-if="selectedResident" class="balance-check">
            <div class="balance-row">
              <span>当前积分</span>
              <span class="balance-current">{{ selectedResident.points }} 分</span>
            </div>
            <div class="balance-row">
              <span>兑换消耗</span>
              <span class="balance-cost">-{{ selectedGift.pointsCost }} 分</span>
            </div>
            <div class="balance-divider"></div>
            <div class="balance-row result">
              <span>兑换后余额</span>
              <span
                class="balance-after"
                :class="balanceAfter >= 0 ? 'ok' : 'no'"
              >
                {{ balanceAfter }} 分
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button
            class="btn-primary"
            :disabled="!canExchange"
            @click="confirmExchange"
          >
            确认兑换
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

const categories = ['全部', '日用品', '食品']
const activeCategory = ref('全部')

const showModal = ref(false)
const selectedGift = ref(null)
const exchangeForm = reactive({ residentId: '' })

const gifts = computed(() => store.state.gifts)
const exchangeRecords = computed(() =>
  [...store.state.exchangeRecords].sort((a, b) => new Date(b.time) - new Date(a.time))
)

const filteredGifts = computed(() => {
  if (activeCategory.value === '全部') return gifts.value
  return gifts.value.filter((g) => g.category === activeCategory.value)
})

const selectedResident = computed(() =>
  exchangeForm.residentId ? store.getResidentById(exchangeForm.residentId) : null
)

const eligibleResidents = computed(() => {
  if (!selectedGift.value) return store.state.residents
  return store.state.residents
    .filter((r) => r.points >= (selectedGift.value?.pointsCost || 0))
    .sort((a, b) => b.points - a.points)
})

const balanceAfter = computed(() => {
  if (!selectedResident.value || !selectedGift.value) return 0
  return selectedResident.value.points - selectedGift.value.pointsCost
})

const canExchange = computed(() => {
  if (!exchangeForm.residentId) return false
  if (!selectedGift.value || selectedGift.value.stock <= 0) return false
  return balanceAfter.value >= 0
})

const openExchange = (gift) => {
  selectedGift.value = gift
  exchangeForm.residentId = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedGift.value = null
  exchangeForm.residentId = ''
}

const confirmExchange = () => {
  if (!canExchange.value) return
  store.addExchangeRecord({
    residentId: exchangeForm.residentId,
    giftId: selectedGift.value.id,
    giftName: selectedGift.value.name,
    pointsCost: selectedGift.value.pointsCost,
    operator: '物业张姐'
  })
  closeModal()
}

const getResidentName = (id) => store.getResidentById(id)?.name || '未知'
const getResidentRoom = (id) => {
  const r = store.getResidentById(id)
  if (!r) return ''
  return `${getBuildingName(r.buildingId)}${r.roomNo}`
}
const getBuildingName = (id) => store.getBuildingById(id)?.name || ''

const formatTime = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.exchange-view {
  height: 100%;
}

.view-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
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

.info-badge {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
}

.stock-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
}

.summary-label {
  font-size: 11px;
  color: #92400e;
  font-weight: 500;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #78350f;
}

.gift-filters {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  flex-shrink: 0;
}

.filter-chip {
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--color-border-light);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: #e5e7eb;
}

.filter-chip.active {
  background: var(--color-gold);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.gifts-grid {
  flex: 1;
  overflow-y: auto;
  padding: 4px 24px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  align-content: start;
}

.gift-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.gift-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-gold);
}

.gift-card.low {
  background: linear-gradient(135deg, #fff7ed, #fed7aa);
}

.gift-card.out {
  background: var(--color-border-light);
  cursor: not-allowed;
  opacity: 0.6;
}

.gift-card.out:hover {
  transform: none;
  box-shadow: none;
  border-color: transparent;
}

.gift-image {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.gift-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.gift-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.gift-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.gift-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gold);
}

.cost-icon {
  font-size: 14px;
}

.gift-stock {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
}

.gift-stock.danger {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.gift-stock.zero {
  color: var(--color-text-muted);
  background: var(--color-border);
}

.exchange-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 24px 24px;
}

.exchange-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  align-items: center;
}

.exchange-icon {
  width: 48px;
  height: 48px;
  background: var(--color-gold-light);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.exchange-body {
  flex: 1;
  min-width: 0;
}

.exchange-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.exchange-gift {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.exchange-cost {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-danger);
}

.exchange-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.exchange-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.exchange-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
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

.exchange-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 460px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 19px;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.gift-banner {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.banner-image {
  width: 68px;
  height: 68px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}

.banner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.banner-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
}

.banner-cost {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gold);
}

.cost-star {
  font-size: 18px;
}

.banner-stock {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-section {
  margin-bottom: 18px;
}

.form-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: #fff;
  transition: all 0.2s ease;
  min-height: 52px;
}

.form-select:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.12);
}

.balance-check {
  padding: 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.balance-row:first-child {
  padding-top: 0;
}

.balance-current {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.balance-cost {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-danger);
}

.balance-divider {
  height: 1px;
  background: var(--color-border);
  margin: 8px 0;
}

.balance-row.result {
  padding-bottom: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.balance-after {
  font-size: 22px;
  font-weight: 700;
}

.balance-after.ok {
  color: var(--color-primary);
}

.balance-after.no {
  color: var(--color-danger);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s ease;
  min-height: 52px;
}

.btn-secondary {
  background: var(--color-border-light);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(217, 119, 6, 0.45);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
