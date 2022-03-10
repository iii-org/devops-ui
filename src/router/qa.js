// import Layout from '@/layout'
// import parentBlank from '@/layout/components/parentBlank'

const qaRoute = [
  // 首頁
  {
    path: '/',
    component: () => import('@/layout'),
    redirect: '/overview',
    meta: {
      icon: 'list',
      title: 'overview',
      roles: ['QA']
    },
    hidden: true
  },
  // 總覽
  {
    path: '/overview',
    component: () => import('@/layout'),
    redirect: '/overview/dashboard',
    meta: {
      icon: 'dashboard',
      title: 'overview',
      roles: ['QA']
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-admin',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'project-list',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListQA'),
        meta: {
          title: 'projectList',
          roles: ['QA']
        }
      }
    ]
  },
  // 個別專案
  {
    path: '/project/:projectName?/',
    component: () => import('@/layout'),
    redirect: { name: 'milestone' },
    meta: {
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA']
    },
    children: [
      {
        path: 'milestone',
        name: 'milestone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        redirect: { name: 'issue-list' },
        component: () => import('@/layout/components/parentBlank'),
        meta: {
          title: 'issueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false,
              subject: ''
            }
          }
        ]
      },
      {
        path: 'track',
        name: 'track',
        component: () => import('@/views/Project/TrackManagement'),
        meta: {
          title: 'changeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: () => import('@/views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['QA']
        }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'settings',
        component: () => import('@/layout/components/parentBlank'),
        meta: { title: 'Project Settings', roles: ['QA'] },
        children: [
          {
            path: '',
            component: () => import('@/layout/components/parentBlank'),
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Plan/Settings/roles/QA'),
                meta: { roles: ['QA'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['QA'] }
          }
        ]
      }
    ]
  },
  // 測試報告
  {
    path: '/test/:projectName?/',
    name: 'test',
    component: () => import('@/layout'),
    redirect: { name: 'test-plan' },
    meta: {
      title: 'test-report',
      icon: 'el-icon-finished',
      roles: ['QA']
    },
    children: [
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: () => import('@/layout/components/parentBlank'),
        meta: {
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'test-case',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'test-plan-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: () => import('@/layout/components/parentBlank'),
        meta: { title: 'test-result', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['QA']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
            }
          }
        ]
      }
    ]
  },
  // 測試紀錄
  {
    path: '/scan/:projectName?/',
    component: () => import('@/layout'),
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['QA']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['QA'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['QA'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['QA'] }
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'cmas', roles: ['QA'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: () => import('@/layout/components/parentBlank'),
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'webinspect-scans',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scan_id',
            name: 'webinspect-report',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'postman',
        component: () => import('@/layout/components/parentBlank'),
        redirect: { name: 'postman-test' },
        meta: {
          title: 'postman',
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'postman-test',
            hidden: true,
            component: () => import('@/views/Scan/Postman')
          },
          {
            path: 'devops/:id',
            name: 'devops-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCaseDevOps'),
            meta: {
              title: 'fromDevops',
              roles: ['QA']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['QA']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['QA'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: () => import('@/layout'),
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['QA'] },
    children: [
      {
        path: '',
        component: () => import('@/views/Profile'),
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['QA']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: () => import('@/layout'),
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['QA'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['QA']
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

// const qaRoute = JSON.stringify([{ 'path': '/', 'redirect': '/overview', 'meta': { 'icon': 'list', 'title': 'overview', 'roles': ['QA'] }, 'hidden': true }, { 'path': '/overview', 'redirect': '/overview/dashboard', 'meta': { 'icon': 'dashboard', 'title': 'overview', 'roles': ['QA'] }, 'children': [{ 'path': 'dashboard', 'name': 'dashboard-admin', 'meta': { 'title': 'dashboard', 'roles': ['QA'] }}, { 'path': 'project-list', 'name': 'project-list', 'meta': { 'title': 'projectList', 'roles': ['QA'] }}] }, { 'path': '/project/:projectName?/', 'redirect': { 'name': 'milestone' }, 'meta': { 'title': 'singleProject', 'icon': 'el-icon-data-analysis', 'roles': ['QA'] }, 'children': [{ 'path': 'milestone', 'name': 'milestone', 'meta': { 'title': 'milestone', 'roles': ['QA'] }}, { 'path': 'issues', 'redirect': { 'name': 'issue-list' }, 'meta': { 'title': 'issueList', 'roles': ['Administrator', 'QA', 'Project Manager', 'Engineer'] }, 'children': [{ 'path': '', 'name': 'issue-list', 'hidden': true, 'meta': { 'roles': ['Administrator', 'QA', 'Project Manager', 'Engineer'] }}, { 'path': ':issueId', 'name': 'issue-detail', 'hidden': true, 'meta': { 'title': 'Issue Detail', 'roles': ['Administrator', 'QA', 'Project Manager', 'Engineer'], 'rolePage': false, 'subject': '' }}] }, { 'path': 'track', 'name': 'track', 'meta': { 'title': 'changeManagement', 'roles': ['QA'] }}, { 'path': 'exception', 'name': 'exception-management', 'meta': { 'title': 'Fail Management', 'roles': ['QA'] }}, { 'path': 'traceability-matrix', 'name': 'TraceMatrix', 'meta': { 'title': 'traceabilityMatrix', 'roles': ['QA'] }}, { 'path': 'settings', 'meta': { 'title': 'Project Settings', 'roles': ['QA'] }, 'children': [{ 'path': '', 'hidden': true, 'children': [{ 'path': '', 'name': 'Project Settings', 'meta': { 'roles': ['QA'] }}, { 'path': 'participate-project/:user_id', 'name': 'ParticipateProject', 'hidden': true, 'meta': { 'title': 'Participate Project', 'roles': ['QA'] }}] }, { 'path': 'issue-transfer/:userId', 'name': 'Issue Transfer', 'hidden': true, 'meta': { 'title': 'Issue Transfer', 'roles': ['QA'] }}] }] }, { 'path': '/test/:projectName?/', 'name': 'test', 'redirect': { 'name': 'test-plan' }, 'meta': { 'title': 'test-report', 'icon': 'el-icon-finished', 'roles': ['QA'] }, 'children': [{ 'path': 'test-plan', 'redirect': '/test/test-plan', 'meta': { 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'test-plan', 'meta': { 'title': 'test-case', 'roles': ['QA'] }}, { 'path': 'create', 'name': 'create-test-plan', 'hidden': true, 'meta': { 'title': 'Issue Detail', 'roles': ['QA'], 'rolePage': false }}, { 'path': ':issueId', 'name': 'test-plan-detail', 'hidden': true, 'meta': { 'title': 'Issue Detail', 'roles': ['Administrator', 'QA', 'Project Manager', 'Engineer'], 'rolePage': false }}, { 'path': 'test-report/:commitId', 'name': 'TestReport', 'hidden': true, 'meta': { 'title': 'testReport', 'roles': ['QA'] }}] }, { 'path': 'release-version', 'redirect': { 'name': 'release-version' }, 'meta': { 'title': 'test-result', 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'release-version', 'hidden': true, 'meta': { 'roles': ['QA'] }}, { 'path': ':issueTag', 'name': 'closed-issue-list', 'hidden': true, 'meta': { 'title': 'Issue Detail', 'roles': ['QA'], 'rolePage': false }}] }] }, { 'path': '/scan/:projectName?/', 'name': 'scan', 'alwaysShow': true, 'meta': { 'title': 'autoTesting', 'icon': 'el-icon-circle-check', 'roles': ['QA'] }, 'redirect': { 'name': 'postman' }, 'children': [{ 'path': 'sonarqube', 'name': 'sonarqube', 'meta': { 'title': 'sonarQube', 'roles': ['QA'] }}, { 'name': 'checkmarx', 'path': 'checkmarx', 'meta': { 'title': 'checkMarx', 'roles': ['QA'] }}, { 'path': 'zap', 'name': 'zap', 'meta': { 'title': 'zap', 'roles': ['QA'] }}, { 'path': 'cmas', 'name': 'cmas', 'meta': { 'title': 'cmas', 'roles': ['QA'] }}, { 'path': 'webinspect', 'name': 'webinspect', 'redirect': { 'name': 'webinspect' }, 'meta': { 'title': 'webInspect', 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'webinspect-scans', 'hidden': true }, { 'path': 'report/:scan_id', 'name': 'webinspect-report', 'hidden': true, 'meta': { 'title': 'webInspectReport', 'roles': ['QA'] }}] }, { 'path': 'postman', 'name': 'postman', 'redirect': { 'name': 'postman-test' }, 'meta': { 'title': 'postman', 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'postman-test', 'hidden': true }, { 'path': 'devops/:id', 'name': 'devops-test-case', 'hidden': true, 'meta': { 'title': 'fromDevops', 'roles': ['QA'] }}, { 'path': 'postman/:id', 'name': 'postman-test-case', 'hidden': true, 'meta': { 'title': 'fromCollection', 'roles': ['QA'] }}] }, { 'path': 'sideex', 'name': 'sideex', 'meta': { 'title': 'sideex', 'roles': ['QA'] }}] }, { 'path': '/profile', 'redirect': { 'name': 'Profile' }, 'hidden': true, 'meta': { 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'Profile', 'meta': { 'title': 'Profile', 'icon': 'user', 'noCache': true, 'roles': ['QA'] }}] }, { 'path': '/SystemVersion', 'redirect': { 'name': 'SystemVersion' }, 'hidden': true, 'meta': { 'roles': ['QA'] }, 'children': [{ 'path': '', 'name': 'SystemVersion', 'meta': { 'title': 'System Version', 'icon': 'user', 'noCache': true, 'roles': ['QA'] }}] }, { 'path': '*', 'redirect': '/404', 'hidden': true }])
// console.log(qaRoute)

export default qaRoute
