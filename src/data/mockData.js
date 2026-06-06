const now = new Date()
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
const daysAgo = (d) => new Date(now.getTime() - d * 86400 * 1000).toISOString()

export const CORRECTION_STATUS = {
  PENDING: 'pending',
  CORRECTED: 'corrected',
  REFUSED: 'refused',
  ONSITE: 'onsite'
}

export const CORRECTION_RESTORE_RATIO = 0.5

export const mockResidents = [
  { id: 'R001', name: '张建华', phone: '138****1234', buildingId: 'B01', roomNo: '302', points: 1280 },
  { id: 'R002', name: '李淑芬', phone: '139****5678', buildingId: 'B01', roomNo: '501', points: 890 },
  { id: 'R003', name: '王志强', phone: '137****9012', buildingId: 'B02', roomNo: '203', points: 1560 },
  { id: 'R004', name: '刘美玲', phone: '136****3456', buildingId: 'B02', roomNo: '701', points: 450 },
  { id: 'R005', name: '陈国栋', phone: '135****7890', buildingId: 'B03', roomNo: '402', points: 2100 },
  { id: 'R006', name: '赵雅琴', phone: '134****2345', buildingId: 'B03', roomNo: '605', points: 720 },
  { id: 'R007', name: '孙德明', phone: '133****6789', buildingId: 'B04', roomNo: '102', points: 340 },
  { id: 'R008', name: '周丽华', phone: '132****0123', buildingId: 'B04', roomNo: '803', points: 1890 },
  { id: 'R009', name: '吴建军', phone: '131****4567', buildingId: 'B05', roomNo: '305', points: 560 },
  { id: 'R010', name: '郑秀兰', phone: '130****8901', buildingId: 'B05', roomNo: '901', points: 1340 }
]

export const mockBuildings = [
  { id: 'B01', name: '1号楼', totalHouseholds: 96, address: '东区' },
  { id: 'B02', name: '2号楼', totalHouseholds: 108, address: '东区' },
  { id: 'B03', name: '3号楼', totalHouseholds: 120, address: '中区' },
  { id: 'B04', name: '4号楼', totalHouseholds: 96, address: '西区' },
  { id: 'B05', name: '5号楼', totalHouseholds: 112, address: '西区' }
]

export const mockDropPoints = [
  { id: 'DP01', name: '东门投放点', location: '东区1号楼南侧' },
  { id: 'DP02', name: '中心投放点', location: '中区广场北侧' },
  { id: 'DP03', name: '西门投放点', location: '西区4号楼北侧' }
]

export const mockGarbageTypes = [
  { value: 'recyclable', label: '可回收物', color: '#3b82f6', bgColor: '#dbeafe', points: 5 },
  { value: 'kitchen', label: '厨余垃圾', color: '#10b981', bgColor: '#d1fae5', points: 3 },
  { value: 'other', label: '其他垃圾', color: '#6b7280', bgColor: '#e5e7eb', points: 1 },
  { value: 'hazardous', label: '有害垃圾', color: '#ef4444', bgColor: '#fee2e2', points: 8 }
]

export const mockMis投Reasons = [
  '未分类混装',
  '垃圾类别投错',
  '厨余未破袋',
  '大件垃圾误投',
  '未按时投放',
  '其他原因'
]

export const mock投放Records = [
  { id: 'REC001', residentId: 'R001', buildingId: 'B01', dropPointId: 'DP01', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: true, time: hoursAgo(1), pointsChange: 3, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC002', residentId: 'R003', buildingId: 'B02', dropPointId: 'DP01', garbageType: 'recyclable', garbageTypeLabel: '可回收物', isCorrect: true, time: hoursAgo(2), pointsChange: 5, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC003', residentId: 'R004', buildingId: 'B02', dropPointId: 'DP02', garbageType: 'other', garbageTypeLabel: '其他垃圾', isCorrect: false, time: hoursAgo(3), pointsChange: -2, photo: 'placeholder', mis投Reason: '垃圾类别投错', correctType: 'recyclable', correctedOnSite: true, correctionStatus: 'onsite', correctionResult: '已现场纠正，居民表示下次注意', supervisor: '李督导' },
  { id: 'REC004', residentId: 'R005', buildingId: 'B03', dropPointId: 'DP02', garbageType: 'hazardous', garbageTypeLabel: '有害垃圾', isCorrect: true, time: hoursAgo(4), pointsChange: 8, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC005', residentId: 'R002', buildingId: 'B01', dropPointId: 'DP01', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: false, time: hoursAgo(5), pointsChange: -2, photo: 'placeholder', mis投Reason: '厨余未破袋', correctType: 'kitchen', correctedOnSite: true, correctionStatus: 'onsite', correctionResult: '已指导破袋二次分拣', supervisor: '王督导' },
  { id: 'REC006', residentId: 'R006', buildingId: 'B03', dropPointId: 'DP03', garbageType: 'recyclable', garbageTypeLabel: '可回收物', isCorrect: true, time: hoursAgo(6), pointsChange: 5, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '王督导' },
  { id: 'REC007', residentId: 'R008', buildingId: 'B04', dropPointId: 'DP03', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: true, time: hoursAgo(7), pointsChange: 3, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '王督导' },
  { id: 'REC008', residentId: 'R009', buildingId: 'B05', dropPointId: 'DP03', garbageType: 'other', garbageTypeLabel: '其他垃圾', isCorrect: false, time: hoursAgo(8), pointsChange: -2, photo: 'placeholder', mis投Reason: '未分类混装', correctType: 'kitchen', correctedOnSite: false, correctionStatus: 'pending', correctionResult: null, supervisor: '李督导' },
  { id: 'REC009', residentId: 'R010', buildingId: 'B05', dropPointId: 'DP02', garbageType: 'recyclable', garbageTypeLabel: '可回收物', isCorrect: true, time: hoursAgo(9), pointsChange: 5, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC010', residentId: 'R007', buildingId: 'B04', dropPointId: 'DP03', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: false, time: hoursAgo(10), pointsChange: -2, photo: 'placeholder', mis投Reason: '未按时投放', correctType: 'kitchen', correctedOnSite: true, correctionStatus: 'onsite', correctionResult: '告知正确投放时段', supervisor: '王督导' },
  { id: 'REC011', residentId: 'R001', buildingId: 'B01', dropPointId: 'DP01', garbageType: 'recyclable', garbageTypeLabel: '可回收物', isCorrect: true, time: daysAgo(1), pointsChange: 5, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC012', residentId: 'R003', buildingId: 'B02', dropPointId: 'DP01', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: true, time: daysAgo(1), pointsChange: 3, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC013', residentId: 'R005', buildingId: 'B03', dropPointId: 'DP02', garbageType: 'recyclable', garbageTypeLabel: '可回收物', isCorrect: true, time: daysAgo(2), pointsChange: 5, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '王督导' },
  { id: 'REC014', residentId: 'R008', buildingId: 'B04', dropPointId: 'DP03', garbageType: 'hazardous', garbageTypeLabel: '有害垃圾', isCorrect: true, time: daysAgo(2), pointsChange: 8, photo: null, mis投Reason: null, correctType: null, correctedOnSite: null, correctionStatus: null, correctionResult: null, supervisor: '李督导' },
  { id: 'REC015', residentId: 'R010', buildingId: 'B05', dropPointId: 'DP02', garbageType: 'kitchen', garbageTypeLabel: '厨余垃圾', isCorrect: false, time: daysAgo(3), pointsChange: -2, photo: 'placeholder', mis投Reason: '垃圾类别投错', correctType: 'other', correctedOnSite: false, correctionStatus: 'pending', correctionResult: null, supervisor: '王督导' },
  { id: 'REC016', residentId: 'R001', buildingId: 'B01', dropPointId: 'DP01', garbageType: 'other', garbageTypeLabel: '其他垃圾', isCorrect: false, time: daysAgo(1), pointsChange: -2, photo: 'placeholder', mis投Reason: '未分类混装', correctType: 'kitchen', correctedOnSite: false, correctionStatus: 'refused', correctionResult: '居民拒绝配合纠正', supervisor: '李督导' }
]

export const mockPointFlows = [
  { id: 'FLOW001', residentId: 'R001', type: '投放奖励', points: 3, time: hoursAgo(1), recordId: 'REC001', description: '正确投放厨余垃圾' },
  { id: 'FLOW002', residentId: 'R003', type: '投放奖励', points: 5, time: hoursAgo(2), recordId: 'REC002', description: '正确投放可回收物' },
  { id: 'FLOW003', residentId: 'R004', type: '误投扣减', points: -2, time: hoursAgo(3), recordId: 'REC003', description: '误投：垃圾类别投错' },
  { id: 'FLOW004', residentId: 'R005', type: '投放奖励', points: 8, time: hoursAgo(4), recordId: 'REC004', description: '正确投放有害垃圾' },
  { id: 'FLOW005', residentId: 'R002', type: '误投扣减', points: -2, time: hoursAgo(5), recordId: 'REC005', description: '误投：厨余未破袋' },
  { id: 'FLOW006', residentId: 'R006', type: '投放奖励', points: 5, time: hoursAgo(6), recordId: 'REC006', description: '正确投放可回收物' },
  { id: 'FLOW007', residentId: 'R008', type: '投放奖励', points: 3, time: hoursAgo(7), recordId: 'REC007', description: '正确投放厨余垃圾' },
  { id: 'FLOW008', residentId: 'R009', type: '误投扣减', points: -2, time: hoursAgo(8), recordId: 'REC008', description: '误投：未分类混装' },
  { id: 'FLOW009', residentId: 'R010', type: '投放奖励', points: 5, time: hoursAgo(9), recordId: 'REC009', description: '正确投放可回收物' },
  { id: 'FLOW010', residentId: 'R007', type: '误投扣减', points: -2, time: hoursAgo(10), recordId: 'REC010', description: '误投：未按时投放' },
  { id: 'FLOW011', residentId: 'R005', type: '礼品兑换', points: -200, time: daysAgo(1), exchangeId: 'EXC001', description: '兑换 洗衣液(1kg)' },
  { id: 'FLOW012', residentId: 'R008', type: '礼品兑换', points: -500, time: daysAgo(2), exchangeId: 'EXC002', description: '兑换 食用油(1.8L)' }
]

export const mockGifts = [
  { id: 'G001', name: '洗衣液(1kg)', pointsCost: 200, stock: 45, category: '日用品', image: '🧴' },
  { id: 'G002', name: '食用油(1.8L)', pointsCost: 500, stock: 23, category: '食品', image: '🫒' },
  { id: 'G003', name: '抽纸(3包装)', pointsCost: 100, stock: 78, category: '日用品', image: '🧻' },
  { id: 'G004', name: '洗洁精(500ml)', pointsCost: 150, stock: 34, category: '日用品', image: '🧽' },
  { id: 'G005', name: '垃圾袋(50只装)', pointsCost: 80, stock: 120, category: '日用品', image: '🗑️' },
  { id: 'G006', name: '牙膏(120g)', pointsCost: 120, stock: 56, category: '日用品', image: '🪥' },
  { id: 'G007', name: '大米(5kg)', pointsCost: 800, stock: 12, category: '食品', image: '🍚' },
  { id: 'G008', name: '环保购物袋', pointsCost: 50, stock: 200, category: '日用品', image: '🛍️' }
]

export const mockExchangeRecords = [
  { id: 'EXC001', residentId: 'R005', giftId: 'G001', giftName: '洗衣液(1kg)', pointsCost: 200, time: daysAgo(1), operator: '物业张姐' },
  { id: 'EXC002', residentId: 'R008', giftId: 'G002', giftName: '食用油(1.8L)', pointsCost: 500, time: daysAgo(2), operator: '物业张姐' }
]

export const mockCorrectionRecords = [
  {
    id: 'COR001',
    recordId: 'REC003',
    residentId: 'R004',
    buildingId: 'B02',
    action: 'onsite',
    pointsRestored: 0,
    operator: '李督导',
    time: hoursAgo(3),
    remark: '居民当场完成重新分类'
  },
  {
    id: 'COR002',
    recordId: 'REC005',
    residentId: 'R002',
    buildingId: 'B01',
    action: 'onsite',
    pointsRestored: 0,
    operator: '王督导',
    time: hoursAgo(5),
    remark: '居民当场完成厨余破袋'
  },
  {
    id: 'COR003',
    recordId: 'REC010',
    residentId: 'R007',
    buildingId: 'B04',
    action: 'onsite',
    pointsRestored: 0,
    operator: '王督导',
    time: hoursAgo(10),
    remark: '居民已了解正确投放时段'
  }
]

export const mockReminderList = [
  {
    id: 'REM001',
    residentId: 'R001',
    buildingId: 'B01',
    roomNo: '302',
    residentName: '张建华',
    recordId: 'REC016',
    mis投Reason: '未分类混装',
    addedTime: daysAgo(1),
    status: 'active',
    warnCount: 1
  }
]
