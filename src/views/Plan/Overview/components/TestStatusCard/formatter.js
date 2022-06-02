import i18n from '@/lang'

const postmanFormatter = (testResult) => {
  const ret = {}
  const status = testResult.status
  if (Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'postman',
      runAt: '',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    const { passed, failed, total } = testResult.result
    Object.assign(ret, {
      Software: 'postman',
      runAt: testResult.run_at,
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
    // '-1': i18n.t('CheckMarx.noScan'),
    // '1': i18n.t('CheckMarx.notCompletedScan'),
    // '2': i18n.t('CheckMarx.generatingReportScan'),
    // '4': i18n.t('CheckMarx.canceledScan'),
    // '5': i18n.t('CheckMarx.failedScan'),
    // '6': i18n.t('CheckMarx.removedScan')
    '-1': i18n.t('CheckMarx.failedScan'),
    '0': i18n.t('general.NoData'),
    '2': i18n.t('CheckMarx.Scanning')
  }
  return mapText[statusString]
}
const checkmarxFormatter = (testResult) => {
  const { highSeverity, mediumSeverity, lowSeverity, infoSeverity } = testResult.result
  const { report_id } = testResult
  const status = testResult.status
  const ret = {}
  if (status === 1) {
    Object.assign(ret, {
      Software: 'checkmarx',
      report_id: report_id,
      runAt: testResult.run_at,
      informationText: [
        { status: i18n.t('CheckMarx.HighSeverity'), count: highSeverity },
        { status: i18n.t('CheckMarx.MediumSeverity'), count: mediumSeverity },
        { status: i18n.t('CheckMarx.LowSeverity'), count: lowSeverity },
        { status: i18n.t('CheckMarx.InfoSeverity'), count: infoSeverity }
      ]
    })
  } else {
    Object.assign(ret, {
      Software: 'checkmarx',
      runAt: '',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  }
  return ret
}
const webinspectFormatter = (testResult) => {
  const ret = {}
  const status = testResult.status
  if (Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'webinspect',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    const { bpCount, criticalCount, highCount, mediumCount, lowCount, infoCount } = testResult.result
    Object.assign(ret, {
      Software: 'webinspect',
      runAt: testResult.run_at,
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
  const status = testResult.status
  if (Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'sonarqube',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    Object.assign(ret, {
      Software: 'sonarqube',
      runAt: !!testResult['run_at'] > -1 ? testResult['run_at'] : undefined,
      informationText: Object.keys(testResult.result).map((key) =>
        ({ status: i18n.t(`SonarQube.${key}`),
          count: testResult.result[key]
        }))
    })
  }
  return ret
}
const sideexFormatter = (testResult) => {
  const ret = {}
  const status = testResult.status
  if (Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'sideex',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    const { suitesPassed, suitesTotal, casesPassed, casesTotal } = testResult.result
    Object.assign(ret, {
      Software: 'sideex',
      runAt: testResult.run_at,
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
  const status = testResult.status
  if (Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'zap',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    const result = testResult.result
    Object.assign(ret, {
      Software: 'zap',
      runAt: testResult.run_at,
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
  const status = testResult.status
  if (!testResult.hasOwnProperty('result') || Object.keys(testResult.result).length === 0) {
    Object.assign(ret, {
      Software: 'cmas',
      informationText: [{ status: getCheckmarxStatusText(status), count: '' }],
      status: testResult.status
    })
  } else {
    const { MOEA, OWASP } = testResult.result
    Object.assign(ret, {
      Software: 'cmas',
      runAt: testResult.run_at,
      informationText: [
        { status: 'MOEA', count: MOEA['summary'] },
        { status: 'L3', count: MOEA['High'] },
        { status: 'L2', count: MOEA['Medium'] },
        { status: 'L1', count: MOEA['Low'] },
        { status: 'OWASP', count: OWASP['summary'] },
        { status: i18n.t('general.High'), count: OWASP['High'] },
        { status: i18n.t('general.Medium'), count: OWASP['Medium'] },
        { status: i18n.t('general.Low'), count: OWASP['Low'] }
      ]
    })
  }
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
