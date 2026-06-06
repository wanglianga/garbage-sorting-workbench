<template>
  <div class="buildings-view">
    <div class="view-grid">
      <div class="panel ranking-panel">
        <div class="panel-header">
          <h3 class="panel-title">🏆 楼栋参与率排名</h3>
          <span class="panel-badge rank-badge">物业视角</span>
        </div>

        <div class="ranking-list">
          <div
            v-for="(b, idx) in rankings"
            :key="b.id"
            class="ranking-item"
            :class="{ top3: idx < 3, active: selectedBuilding === b.id }"
            @click="selectedBuilding = b.id"
          >
            <div class="rank-num" :class="'rank-' + (idx + 1)">
              <span v-if="idx === 0">🥇</span>
              <span v-else-if="idx === 1">🥈</span>
              <span v-else-if="idx === 2">🥉</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>

            <div class="building-info">
              <div class="building-header">
                <span class="building-name">{{ b.name }}</span>
                <span class="building-addr">{{ b.address }}</span>
              </div>
              <div class="building-stats">
                <span>参与 {{ b.activeResidents }}/{{ b.totalHouseholds }} 户</span>
                <span>·</span>
                <span>投放 {{ b.recordCount }} 次</span>
                <span>·</span>
                <span>正确率 {{ b.correctRate }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: b.participationRate + '%', background: idx < 3 ? progressGradient(idx) : 'var(--color-primary)' }"
                ></div>
                <span class="progress-label">{{ b.participationRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-column">
        <div class="panel chart-panel">
          <div class="panel-header">
            <h3 class="panel-title">📊 误投高发时段</h3>
            <div class="stat-summary danger">
              <span class="summary-label">累计误投</span>
              <span class="summary-value">{{ mis投Analysis.total }} 次</span>
            </div>
          </div>
          <div class="chart-container" ref="hourChartRef"></div>
        </div>

        <div class="panel mis投-detail-panel">
          <div class="panel-header">
            <h3 class="panel-title">⚠️ 误投明细分析</h3>
          </div>
          <div class="mis投-grid">
            <div class="chart-container small" ref="reasonChartRef"></div>
            <div class="mis投-list">
              <h4 class="mis投-list-title">误投原因 TOP</h4>
              <div
                v-for="(item, idx) in sortedByReason"
                :key="item.name"
                class="mis投-item"
              >
                <div class="mis投-rank">{{ idx + 1 }}</div>
                <div class="mis投-info">
                  <div class="mis投-name">{{ item.name }}</div>
                  <div class="mis投-bar-wrap">
                    <div
                      class="mis投-bar"
                      :style="{ width: (item.value / maxReason) * 100 + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="mis投-count">{{ item.value }}次</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useDataStore } from '../stores/data'
import * as echarts from 'echarts'

const store = useDataStore()

const selectedBuilding = ref(null)
const hourChartRef = ref(null)
const reasonChartRef = ref(null)

let hourChart = null
let reasonChart = null

const rankings = computed(() => store.getBuildingRankings())
const mis投Analysis = computed(() => store.getMis投Analysis())

const sortedByReason = computed(() =>
  [...mis投Analysis.value.byReason].sort((a, b) => b.value - a.value).slice(0, 5)
)

const maxReason = computed(() => Math.max(...sortedByReason.value.map((i) => i.value), 1))

const progressGradient = (idx) => {
  const gradients = [
    'linear-gradient(90deg, #fbbf24, #f59e0b)',
    'linear-gradient(90deg, #9ca3af, #6b7280)',
    'linear-gradient(90deg, #d97706, #b45309)'
  ]
  return gradients[idx] || 'var(--color-primary)'
}

const initHourChart = () => {
  if (!hourChartRef.value) return
  hourChart = echarts.init(hourChartRef.value)
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  hourChart.setOption({
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter: (params) => {
        const p = params[0]
        return `${p.axisValue}<br/>误投次数: <b style="color:#ef4444">${p.value}</b> 次`
      }
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11, interval: 2 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
      minInterval: 1
    },
    series: [
      {
        type: 'bar',
        data: mis投Analysis.value.byHour,
        barWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#f87171' },
              { offset: 1, color: '#fecaca' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#ef4444' },
                { offset: 1, color: '#fca5a5' }
              ]
            }
          }
        }
      }
    ]
  })
}

const initReasonChart = () => {
  if (!reasonChartRef.value) return
  reasonChart = echarts.init(reasonChartRef.value)

  reasonChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}次 ({d}%)'
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 11,
          color: '#374151',
          formatter: '{b}\n{d}%'
        },
        labelLine: { length: 8, length2: 6 },
        data: mis投Analysis.value.byReason,
        color: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#6b7280']
      }
    ]
  })
}

const handleResize = () => {
  hourChart?.resize()
  reasonChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initHourChart()
  initReasonChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  hourChart?.dispose()
  reasonChart?.dispose()
})

watch(
  () => mis投Analysis.value,
  () => {
    hourChart?.setOption({ series: [{ data: mis投Analysis.value.byHour }] })
    reasonChart?.setOption({ series: [{ data: mis投Analysis.value.byReason }] })
  },
  { deep: true }
)
</script>

<style scoped>
.buildings-view {
  height: 100%;
}

.view-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.2fr;
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

.rank-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.ranking-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 20px;
}

.ranking-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.ranking-item:hover {
  transform: translateX(4px);
  background: #e5e7eb;
}

.ranking-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.ranking-item.top3 {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border: 2px solid #fde68a;
}

.rank-num {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-secondary);
  background: #ffffff;
  flex-shrink: 0;
}

.rank-1 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.rank-2 { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
.rank-3 { background: linear-gradient(135deg, #fed7aa, #fdba74); }

.building-info {
  flex: 1;
  min-width: 0;
}

.building-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.building-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
}

.building-addr {
  font-size: 12px;
  padding: 3px 10px;
  background: #ffffff;
  border-radius: 999px;
  color: var(--color-text-secondary);
}

.building-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.progress-bar {
  position: relative;
  height: 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.progress-label {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
}

.charts-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
}

.chart-panel {
  flex: 0.85;
  min-height: 0;
}

.stat-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 6px 14px;
  border-radius: 12px;
}

.stat-summary.danger {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.summary-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-danger);
  margin-top: 2px;
}

.chart-container {
  flex: 1;
  min-height: 220px;
  padding: 8px 16px 16px;
}

.chart-container.small {
  min-height: 180px;
  flex: 1;
  padding: 8px;
}

.mis投-detail-panel {
  flex: 1;
  min-height: 0;
}

.mis投-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  padding: 8px 20px 20px;
}

.mis投-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.mis投-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 6px 4px;
  margin-bottom: 4px;
}

.mis投-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-border-light);
  border-radius: var(--radius-sm);
}

.mis投-rank {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--color-danger);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.mis投-item:nth-child(2) .mis投-rank { background: #f97316; }
.mis投-item:nth-child(3) .mis投-rank { background: #f59e0b; }
.mis投-item:nth-child(4) .mis投-rank { background: #eab308; }
.mis投-item:nth-child(5) .mis投-rank { background: #84cc16; }

.mis投-info {
  flex: 1;
  min-width: 0;
}

.mis投-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.mis投-bar-wrap {
  height: 6px;
  background: #ffffff;
  border-radius: 999px;
  overflow: hidden;
}

.mis投-bar {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #fca5a5);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.mis投-count {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-danger);
  flex-shrink: 0;
}
</style>
