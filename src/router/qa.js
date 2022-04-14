
const qaRoute = [
  // 首頁
  {
    path: '/',
    component: 'layout',
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
    component: 'layout',
    redirect: '/overview/dashboard',
    meta: {
      icon: 'dashboard',
      title: 'overview',
      roles: ['QA']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: 'views/Overview/Dashboard/roles/admin',
        meta: {
          title: 'dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: 'views/Overview/ProjectList/ProjectListQA',
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
    component: 'layout',
    redirect: { name: 'Milstone' },
    meta: {
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA']
    },
    children: [
      {
        path: 'milestone',
        name: 'Milstone',
        component: 'views/Plan/Milestone',
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        redirect: { name: 'IssueList' },
        component: 'layout/components/parentBlank',
        meta: {
          title: 'issueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'IssueList',
            hidden: true,
            component: 'views/Project/IssueList',
            meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: 'views/Project/IssueDetail',
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
        name: 'Track',
        component: 'views/Project/TrackManagement',
        meta: {
          title: 'changeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exception',
        name: 'ExceptionManagement',
        component: 'views/Project/ExceptionManagement',
        meta: {
          title: 'Fail Management',
          roles: ['QA']
        }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: 'views/Plan/TraceabilityMatrix',
        meta: { title: 'traceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'projectSettings',
        component: 'layout/components/parentBlank',
        meta: { title: 'Project Settings', roles: ['QA'] },
        children: [
          {
            path: '',
            component: 'layout/components/parentBlank',
            hidden: true,
            children: [
              {
                path: '',
                name: 'ProjectSettings',
                component: 'views/Plan/Settings/roles/QA',
                meta: { roles: ['QA'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: 'views/SystemSettings/AccountManage/components/ParticipateProject',
                meta: { title: 'Participate Project', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: 'views/Plan/Settings/components/ProjectIssueTransfer',
            meta: { title: 'Issue Transfer', roles: ['QA'] }
          }
        ]
      }
    ]
  },
  // 測試報告
  {
    path: '/test/:projectName?/',
    name: 'Test',
    component: 'layout',
    redirect: { name: 'TestPlan' },
    meta: {
      title: 'test-report',
      icon: 'el-icon-finished',
      roles: ['QA']
    },
    children: [
      {
        path: 'testPlan',
        redirect: '/test/testPlan',
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'test-case',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'TestPlanDetail',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: 'layout/components/parentBlank',
        meta: { title: 'test-result', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['QA']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: 'views/Project/ReleaseVersion/ClosedIssueList',
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
    component: 'layout',
    name: 'Scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['QA']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['QA'] }
      },
      {
        name: 'Checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['QA'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['QA'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['QA'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'Webinspect' },
        meta: { title: 'webInspect', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'WebinspectScans',
            hidden: true,
            component: 'views/Scan/WebInspect'
          },
          {
            path: 'report/:scan_id',
            name: 'WebinspectReport',
            component: 'views/Scan/WIEReportViewer',
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'Postman',
        component: 'layout/components/parentBlank',
        redirect: { name: 'PostmanTest' },
        meta: {
          title: 'postman',
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'PostmanTest',
            hidden: true,
            component: 'views/Scan/Postman'
          },
          {
            path: 'devops/:id',
            name: '',
            hidden: true,
            component: 'views/Scan/TestCaseDevOps',
            meta: {
              title: 'fromDevops',
              roles: ['QA']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: 'views/Scan/TestCasePostman',
            meta: {
              title: 'fromCollection',
              roles: ['QA']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: 'views/Scan/Sideex',
        meta: { title: 'sideex', roles: ['QA'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: 'layout',
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['QA'] },
    children: [
      {
        path: '',
        component: 'views/Profile',
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
    component: 'layout',
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['QA'] },
    children: [
      {
        path: '',
        component: 'views/SystemVersion',
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

export default qaRoute
