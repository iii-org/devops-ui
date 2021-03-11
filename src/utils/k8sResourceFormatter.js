// export const resData = {
//   quota: {
//     configmaps: '60',
//     cpu: '10',
//     memory: '10G',
//     persistentvolumeclaims: '0',
//     pods: '20',
//     secrets: '60',
//     'services.nodeports': '10',
//     deployments: null,
//     ingresses: null
//   },
//   used: {
//     configmaps: '0',
//     cpu: '0',
//     memory: '0',
//     persistentvolumeclaims: '0',
//     pods: '0',
//     secrets: '12',
//     'services.nodeports': '0',
//     deployments: '0',
//     ingresses: '0'
//   }
// }

export const roundValue = value => Math.round(value * 100) / 100

export const getQuotaUnit = (title, quotaItem) => {
  if (title === 'CPU') return getCpuQuotaUnit(quotaItem)
  if (title === 'Memory') return getMemoryQuotaUnit(quotaItem)
  else return ''
}
const getCpuQuotaUnit = () => 'cpu'
const getMemoryQuotaUnit = quotaItem => quotaItem.slice(quotaItem.length - 1) // 'K','M','G','T'

const getUsedUnit = (title, usedItem) => {
  if (title === 'CPU') return getCpuUsedUnit(usedItem)
  if (title === 'Memory') return getMemoryUsedUnit(usedItem)
  else return ''
}
const getCpuUsedUnit = usedItem => {
  if (usedItem.indexOf('cpu') > -1) return 'cpu'
  if (usedItem.indexOf('m') > -1) return 'm'
  else return ''
} // 'cpu','m'
const getMemoryUsedUnit = usedItem => usedItem.slice(usedItem.length - 2, usedItem.length - 1) // 'Ki','Mi','Gi','Ti'

export const formateUsedQuota = (title, quotaItem, usedItem) => {
  const quota = { value: parseInt(quotaItem), unit: getQuotaUnit(title, quotaItem) }
  const used = { value: parseInt(usedItem), unit: getUsedUnit(title, usedItem) }
  if (title === 'CPU') return formatCpuUsedQuota(quota, used)
  if (title === 'Memory') return formatMemoryUsedQuota(quota, used)
  else return used.value
}
const formatCpuUsedQuota = (quota, used) => {
  if (used.unit === 'm') return roundValue(used.value / 1000)
  // '0', 'cpu', 'm'  1m = 0.001 cpu
  else return used.value
}

const formatMemoryUsedQuota = (quota, used) => {
  if (used.unit === 'M') return roundValue(used.value / 1000)
  if (used.unit === 'K') return roundValue(used.value / 1000 / 1000)
  else return used.value
}

export const formatChartDataResult = result =>
  result.map(item => ({
    title: item.title,
    data: formatData(item),
    quota: item.quota.value === null ? '' : `（${item.quota.value}${item.quota.unit}）`
  }))

const formatData = item => {
  const result = []
  if (item.leftQuota.value) {
    result.push({
      value: item.leftQuota.value,
      name: item.leftQuota.unit ? `Left Quota (${item.leftQuota.unit})` : 'Left Quota',
      itemStyle: { color: '#3ECBBC', emphasis: { color: '#3ECBBC' } }
    })
  }
  if (item.used.value !== null) {
    result.push({
      value: item.used.value,
      name: item.used.unit ? `Usage (${item.used.unit})` : 'Usage',
      itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
    })
  }
  return result
}
