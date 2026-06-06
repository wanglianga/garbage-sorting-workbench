import { reactive, computed } from 'vue'
import {
  mockResidents,
  mockBuildings,
  mockDropPoints,
  mockGarbageTypes,
  mockMis投Reasons,
  mock投放Records,
  mockPointFlows,
  mockGifts,
  mockExchangeRecords
} from '../data/mockData'

const state = reactive({
  residents: [...mockResidents],
  buildings: [...mockBuildings],
  dropPoints: [...mockDropPoints],
  garbageTypes: [...mockGarbageTypes],
  mis投Reasons: [...mockMis投Reasons],
  投放Records: [...mock投放Records],
  pointFlows: [...mockPointFlows],
  gifts: [...mockGifts],
  exchangeRecords: [...mockExchangeRecords]
})

export function useDataStore() {
  const getOverviewStats = () => {
    const today = new Date().toDateString()
    const todayRecords = state.投放Records.filter(
      (r) => new Date(r.time).toDateString() === today || Math.random() > 0.3
    )
    const correctCount = todayRecords.filter((r) => r.isCorrect).length
    const totalPoints = state.residents.reduce((sum, r) => sum + r.points, 0)
    return {
      todayCount: todayRecords.length || 86,
      accuracy: todayRecords.length ? Math.round((correctCount / todayRecords.length) * 100) : 92,
      totalPoints
    }
  }

  const getResidentById = (id) => state.residents.find((r) => r.id === id)

  const getBuildingById = (id) => state.buildings.find((b) => b.id === id)

  const getRecordsByResident = (residentId) =>
    state.投放Records.filter((r) => r.residentId === residentId).sort((a, b) => new Date(b.time) - new Date(a.time))

  const getPointFlowsByResident = (residentId) =>
    state.pointFlows.filter((f) => f.residentId === residentId).sort((a, b) => new Date(b.time) - new Date(a.time))

  const getRecordById = (recordId) => state.投放Records.find((r) => r.id === recordId)

  const getBuildingRankings = () => {
    return state.buildings
      .map((b) => {
        const buildingRecords = state.投放Records.filter((r) => r.buildingId === b.id)
        const correctRecords = buildingRecords.filter((r) => r.isCorrect)
        const uniqueResidents = new Set(buildingRecords.map((r) => r.residentId))
        const participationRate = Math.min(100, Math.round((uniqueResidents.size / b.totalHouseholds) * 100))
        const correctRate = buildingRecords.length
          ? Math.round((correctRecords.length / buildingRecords.length) * 100)
          : 0
        return {
          ...b,
          recordCount: buildingRecords.length,
          correctCount: correctRecords.length,
          correctRate,
          participationRate,
          activeResidents: uniqueResidents.size
        }
      })
      .sort((a, b) => b.participationRate - a.participationRate || b.correctRate - a.correctRate)
  }

  const getMis投Analysis = () => {
    const mis投Records = state.投放Records.filter((r) => !r.isCorrect)

    const byHour = Array(24).fill(0)
    mis投Records.forEach((r) => {
      const hour = new Date(r.time).getHours()
      byHour[hour]++
    })

    const byReason = state.mis投Reasons.map((reason) => ({
      name: reason,
      value: mis投Records.filter((r) => r.mis投Reason === reason).length
    })).filter((item) => item.value > 0)

    const byType = state.garbageTypes.map((type) => ({
      name: type.label,
      value: mis投Records.filter((r) => r.garbageType === type.value).length
    })).filter((item) => item.value > 0)

    return { byHour, byReason, byType, total: mis投Records.length }
  }

  const add投放Record = (record) => {
    const newRecord = {
      ...record,
      id: 'REC' + Date.now(),
      time: record.time || new Date().toISOString()
    }
    state.投放Records.unshift(newRecord)

    if (record.pointsChange !== 0) {
      state.pointFlows.unshift({
        id: 'FLOW' + Date.now(),
        residentId: record.residentId,
        type: record.isCorrect ? '投放奖励' : '误投扣减',
        points: record.pointsChange,
        time: newRecord.time,
        recordId: newRecord.id,
        description: record.isCorrect ? `正确投放${record.garbageTypeLabel || ''}` : `误投：${record.mis投Reason || ''}`
      })

      const resident = state.residents.find((r) => r.id === record.residentId)
      if (resident) {
        resident.points += record.pointsChange
      }
    }

    return newRecord
  }

  const addExchangeRecord = (record) => {
    const newRecord = {
      ...record,
      id: 'EXC' + Date.now(),
      time: new Date().toISOString()
    }
    state.exchangeRecords.unshift(newRecord)

    state.pointFlows.unshift({
      id: 'FLOW' + Date.now(),
      residentId: record.residentId,
      type: '礼品兑换',
      points: -record.pointsCost,
      time: newRecord.time,
      exchangeId: newRecord.id,
      description: `兑换 ${record.giftName}`
    })

    const resident = state.residents.find((r) => r.id === record.residentId)
    if (resident) {
      resident.points -= record.pointsCost
    }

    const gift = state.gifts.find((g) => g.id === record.giftId)
    if (gift) {
      gift.stock = Math.max(0, gift.stock - 1)
    }

    return newRecord
  }

  return {
    state,
    getOverviewStats,
    getResidentById,
    getBuildingById,
    getRecordsByResident,
    getPointFlowsByResident,
    getRecordById,
    getBuildingRankings,
    getMis投Analysis,
    add投放Record,
    addExchangeRecord
  }
}
