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
  mockExchangeRecords,
  mockCorrectionRecords,
  mockReminderList,
  CORRECTION_STATUS,
  CORRECTION_RESTORE_RATIO
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
  exchangeRecords: [...mockExchangeRecords],
  correctionRecords: [...mockCorrectionRecords],
  reminderList: [...mockReminderList]
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
    const correctedOnSite = record.correctedOnSite === true
    let correctionStatus = null
    if (!record.isCorrect) {
      if (correctedOnSite) {
        correctionStatus = CORRECTION_STATUS.ONSITE
      } else {
        correctionStatus = CORRECTION_STATUS.PENDING
      }
    }

    const newRecord = {
      ...record,
      correctType: record.correctType || null,
      correctedOnSite,
      correctionStatus,
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

    if (correctedOnSite && !record.isCorrect) {
      state.correctionRecords.unshift({
        id: 'COR' + Date.now(),
        recordId: newRecord.id,
        residentId: record.residentId,
        buildingId: record.buildingId,
        action: 'onsite',
        pointsRestored: 0,
        operator: record.supervisor || '督导员',
        time: newRecord.time,
        remark: record.correctionResult || '当场纠正'
      })
    }

    return newRecord
  }

  const getPendingCorrections = (buildingId = null) => {
    let list = state.投放Records.filter(
      (r) => !r.isCorrect && r.correctionStatus === CORRECTION_STATUS.PENDING
    )
    if (buildingId) {
      list = list.filter((r) => r.buildingId === buildingId)
    }
    return list.sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  const getCorrectionsByResident = (residentId) => {
    return state.correctionRecords
      .filter((c) => c.residentId === residentId)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  const getPendingByResident = (residentId) => {
    return state.投放Records.filter(
      (r) =>
        r.residentId === residentId &&
        !r.isCorrect &&
        r.correctionStatus === CORRECTION_STATUS.PENDING
    ).sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  const confirmResidentCorrection = (recordId, remark = '', operator = '居民自助') => {
    const record = state.投放Records.find((r) => r.id === recordId)
    if (!record || record.correctionStatus !== CORRECTION_STATUS.PENDING) {
      return { success: false, message: '记录不存在或状态不允许纠正' }
    }

    record.correctionStatus = CORRECTION_STATUS.CORRECTED
    record.correctionResult = remark || '居民已完成纠正'

    const restorePoints = Math.round(Math.abs(record.pointsChange) * CORRECTION_RESTORE_RATIO)

    if (restorePoints > 0) {
      const resident = state.residents.find((r) => r.id === record.residentId)
      if (resident) {
        resident.points += restorePoints
      }
      state.pointFlows.unshift({
        id: 'FLOW' + Date.now(),
        residentId: record.residentId,
        type: '纠正恢复',
        points: restorePoints,
        time: new Date().toISOString(),
        recordId: record.id,
        description: `误投纠正恢复 ${restorePoints} 积分`
      })
    }

    const existingInReminder = state.reminderList.find(
      (r) => r.recordId === recordId && r.status === 'active'
    )
    if (existingInReminder) {
      existingInReminder.status = 'resolved'
      existingInReminder.resolvedTime = new Date().toISOString()
    }

    state.correctionRecords.unshift({
      id: 'COR' + Date.now(),
      recordId: record.id,
      residentId: record.residentId,
      buildingId: record.buildingId,
      action: 'corrected',
      pointsRestored: restorePoints,
      operator,
      time: new Date().toISOString(),
      remark: remark || '居民已完成纠正'
    })

    return { success: true, restorePoints, record }
  }

  const markAsRefused = (recordId, remark = '', operator = '督导员') => {
    const record = state.投放Records.find((r) => r.id === recordId)
    if (!record || record.correctionStatus !== CORRECTION_STATUS.PENDING) {
      return { success: false, message: '记录不存在或状态不允许操作' }
    }

    record.correctionStatus = CORRECTION_STATUS.REFUSED
    record.correctionResult = remark || '居民拒不纠正'

    const resident = state.residents.find((r) => r.id === record.residentId)

    const existingActive = state.reminderList.find(
      (r) => r.residentId === record.residentId && r.status === 'active'
    )
    if (existingActive) {
      existingActive.warnCount += 1
    } else {
      state.reminderList.unshift({
        id: 'REM' + Date.now(),
        residentId: record.residentId,
        buildingId: record.buildingId,
        roomNo: resident?.roomNo || '',
        residentName: resident?.name || '未知居民',
        recordId: record.id,
        mis投Reason: record.mis投Reason || '',
        addedTime: new Date().toISOString(),
        status: 'active',
        warnCount: 1
      })
    }

    state.correctionRecords.unshift({
      id: 'COR' + Date.now(),
      recordId: record.id,
      residentId: record.residentId,
      buildingId: record.buildingId,
      action: 'refused',
      pointsRestored: 0,
      operator,
      time: new Date().toISOString(),
      remark: remark || '居民拒不纠正，已进入楼栋提醒名单'
    })

    return { success: true, record }
  }

  const getReminderList = (buildingId = null) => {
    let list = state.reminderList
    if (buildingId) {
      list = list.filter((r) => r.buildingId === buildingId)
    }
    return list
      .filter((r) => r.status === 'active')
      .sort((a, b) => new Date(b.addedTime) - new Date(a.addedTime))
  }

  const getReminderListByBuilding = () => {
    return state.buildings.map((b) => {
      const activeReminders = state.reminderList.filter(
        (r) => r.buildingId === b.id && r.status === 'active'
      )
      return {
        ...b,
        reminderCount: activeReminders.length,
        reminders: activeReminders
      }
    })
  }

  const getCorrectionStats = () => {
    const mis投Records = state.投放Records.filter((r) => !r.isCorrect)
    const total = mis投Records.length
    const onsite = mis投Records.filter((r) => r.correctionStatus === CORRECTION_STATUS.ONSITE).length
    const corrected = mis投Records.filter((r) => r.correctionStatus === CORRECTION_STATUS.CORRECTED).length
    const pending = mis投Records.filter((r) => r.correctionStatus === CORRECTION_STATUS.PENDING).length
    const refused = mis投Records.filter((r) => r.correctionStatus === CORRECTION_STATUS.REFUSED).length
    return { total, onsite, corrected, pending, refused }
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
    addExchangeRecord,
    getPendingCorrections,
    getCorrectionsByResident,
    getPendingByResident,
    confirmResidentCorrection,
    markAsRefused,
    getReminderList,
    getReminderListByBuilding,
    getCorrectionStats,
    CORRECTION_STATUS,
    CORRECTION_RESTORE_RATIO
  }
}
