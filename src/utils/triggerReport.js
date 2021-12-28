import { getSonarQubeData } from '@/api/sonarQube'
import {
  getCheckMarxScans,
  getCheckMarxScanStats,
  getCheckMarxScanStatus,
  registerCheckMarxReport
} from '@/api/checkMarx'

/**
 * fix the error which TestReport encountered (#1379)
 * TestReport couldn't get SonarQube and CheckMarx data unless you click each report page
 * @param {Object} selectedProject
 * @param {String} commitId
 */
export async function triggerReport(selectedProject, commitId) {
  await triggerSonarQube(selectedProject)
  await triggerCheckMarx(selectedProject, commitId)
}

async function triggerSonarQube(selectedProject) {
  await getSonarQubeData(selectedProject.name)
}

async function triggerCheckMarx(selectedProject, commitId) {
  const checkMarxRes = (await getCheckMarxScans(selectedProject.id)).data
  checkMarxRes.sort((a, b) => Date.parse(b.run_at) - Date.parse(a.run_at))
  const selectedCommitData = checkMarxRes.find(item => item.commit_id === commitId)
  if (selectedCommitData && selectedCommitData.status === null) {
    registerReport(selectedCommitData.scan_id)
  }
}

async function registerReport(scanId) {
  await getCheckMarxScanStatus(scanId)
    .then(async (res) => {
      if (res.data.name === 'Finished') {
        await getCheckMarxScanStats(scanId)
        await registerCheckMarxReport(scanId)
      }
    })
}
