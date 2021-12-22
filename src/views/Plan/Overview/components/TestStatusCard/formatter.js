import i18n from '@/lang'

const postmanFormatter = (testResult) => {
  const ret = {}
  if (Object.keys(testResult).length === 0) {
    Object.assign(ret, {
      Software: 'postman',
      runAt: '',
      informationText: []
    })
  } else {
    const { run_at, passed, failed, total } = testResult
    Object.assign(ret, {
      Software: 'postman',
      runAt: run_at,
      informationText: [
        { status: i18n.t('Postman.TestPass'), count: passed },
        { status: i18n.t('Postman.TestFail'), count: failed },
        { status: i18n.t('Postman.TestTotal'), count: total }
      ]
    })
  }
  return ret
}
const getCheckmarxStatusText = (status) => {
  const statusString = String(status)
  const mapText = {
    '-1': i18n.t('CheckMarx.noScan'),
    '1': i18n.t('CheckMarx.notCompletedScan'),
    '2': i18n.t('CheckMarx.generatingReportScan'),
    '4': i18n.t('CheckMarx.canceledScan'),
    '5': i18n.t('CheckMarx.failedScan'),
    '6': i18n.t('CheckMarx.removedScan')
  }
  return mapText[statusString]
}
const checkmarxFormatter = (testResult) => {
  const { status, report_id, run_at, highSeverity, mediumSeverity, lowSeverity, infoSeverity } = testResult
  const ret = {}
  if (status === 3) {
    Object.assign(ret, {
      Software: 'checkmarx',
      report_id: report_id,
      runAt: run_at,
      informationText: [
        { status: i18n.t('CheckMarx.HighSeverity'), count: highSeverity },
        { status: i18n.t('CheckMarx.MediumSeverity'), count: mediumSeverity },
        { status: i18n.t('CheckMarx.LowSeverity'), count: lowSeverity },
        { status: i18n.t('CheckMarx.InfoSeverity'), count: infoSeverity }
      ]
    })
  } else if (status === -1) {
    Object.assign(ret, {
      Software: 'checkmarx',
      report_id: report_id,
      runAt: run_at,
      informationText: []
    })
  } else {
    Object.assign(ret, {
      Software: 'checkmarx',
      runAt: '',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }]
    })
  }
  return ret
}
const webinspectFormatter = (testResult) => {
  const ret = {}
  if (Object.keys(testResult).length === 0) {
    Object.assign(ret, {
      Software: 'webinspect',
      informationText: []
    })
  } else {
    const { bpCount, criticalCount, highCount, mediumCount, lowCount, infoCount, run_at } = testResult
    Object.assign(ret, {
      Software: 'webinspect',
      runAt: run_at,
      informationText: [
        { status: i18n.t('WebInspect.BpSeverity'), count: bpCount },
        { status: i18n.t('WebInspect.Critical'), count: criticalCount },
        { status: i18n.t('WebInspect.HighSeverity'), count: highCount },
        { status: i18n.t('WebInspect.MediumSeverity'), count: mediumCount },
        { status: i18n.t('WebInspect.LowSeverity'), count: lowCount },
        { status: i18n.t('WebInspect.InfoSeverity'), count: infoCount }
      ]
    })
  }
  return ret
}
const sonarqubeFormatter = (testResult) => {
  const ret = {}
  const informationArr = testResult
    .map((row) => ({ status: row.metric, count: row.value }))
    .filter((item) => item.status !== 'run_at')
  const runAtIdx = testResult.findIndex((row) => row.metric === 'run_at')
  if (Object.keys(testResult).length === 0) {
    Object.assign(ret, {
      Software: 'sonarqube',
      informationText: []
    })
  } else {
    Object.assign(ret, {
      Software: 'sonarqube',
      runAt: runAtIdx > -1 ? testResult[runAtIdx].value : undefined,
      informationText: informationArr.map((row) => ({ status: i18n.t(`SonarQube.${row.status}`), count: row.count }))
    })
  }
  return ret
}
const sideexFormatter = (testResult) => {
  const ret = {}
  if (Object.keys(testResult).length === 0) {
    Object.assign(ret, {
      Software: 'sideex',
      informationText: []
    })
  } else {
    const { run_at } = testResult
    const { suitesPassed, suitesTotal, casesPassed, casesTotal } = testResult.result
    Object.assign(ret, {
      Software: 'sideex',
      runAt: run_at,
      informationText: [
        { status: i18n.t('Sideex.suitesPassedRatio'), count: suitesPassed },
        { status: i18n.t('Sideex.suitesPassedTotal'), count: suitesTotal },
        { status: i18n.t('Sideex.casesPassedRatio'), count: casesPassed },
        { status: i18n.t('Sideex.casesPassedTotal'), count: casesTotal }
      ]
    })
  }
  return ret
}
const zapFormatter = (testResult) => {
  const ret = {}
  if (Object.keys(testResult).length === 0) {
    Object.assign(ret, {
      Software: 'zap',
      informationText: []
    })
  } else {
    const { result, run_at } = testResult
    Object.assign(ret, {
      Software: 'zap',
      runAt: run_at,
      informationText: [
        { status: i18n.t('Zap.high'), count: result['3'] },
        { status: i18n.t('Zap.medium'), count: result['2'] },
        { status: i18n.t('Zap.low'), count: result['1'] },
        { status: i18n.t('general.Info'), count: result['0'] }
      ]
    })
  }
  return ret
}
const cmasFormatter = (testResult) => {
  const ret = {}
  Object.assign(ret, {
    Software: 'CMAS',
    informationText: []
  })
  return ret
}
export {
  postmanFormatter,
  checkmarxFormatter,
  webinspectFormatter,
  sonarqubeFormatter,
  sideexFormatter,
  zapFormatter,
  cmasFormatter
}
