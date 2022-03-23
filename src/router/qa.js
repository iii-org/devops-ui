
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
        name: 'dashboard-admin',
        component: 'views/Overview/Dashboard/roles/admin',
        meta: {
          title: 'dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'project-list',
        name: 'project-list',
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
        component: 'views/Plan/Milestone',
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        redirect: { name: 'issue-list' },
        component: 'layout/components/parentBlank',
        meta: {
          title: 'issueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: 'views/Project/IssueList',
            meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
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
        name: 'track',
        component: 'views/Project/TrackManagement',
        meta: {
          title: 'changeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: 'views/Project/ExceptionManagement',
        meta: {
          title: 'Fail Management',
          roles: ['QA']
        }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: 'views/Plan/TraceabilityMatrix',
        meta: { title: 'traceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'settings',
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
                name: 'Project Settings',
                component: 'views/Plan/Settings/roles/QA',
                meta: { roles: ['QA'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: 'views/SystemSettings/AccountManage/components/ParticipateProject',
                meta: { title: 'Participate Project', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
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
    name: 'test',
    component: 'layout',
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
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'test-case',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
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
            name: 'test-plan-detail',
            hidden: true,
            component: 'views/Project/IssueDetail',
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
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: 'layout/components/parentBlank',
        meta: { title: 'test-result', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['QA']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
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
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['QA'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['QA'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['QA'] }
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['QA'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'webinspect-scans',
            hidden: true,
            component: 'views/Scan/WebInspect'
          },
          {
            path: 'report/:scan_id',
            name: 'webinspect-report',
            component: 'views/Scan/WIEReportViewer',
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'postman',
        component: 'layout/components/parentBlank',
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
            component: 'views/Scan/Postman'
          },
          {
            path: 'devops/:id',
            name: 'devops-test-case',
            hidden: true,
            component: 'views/Scan/TestCaseDevOps',
            meta: {
              title: 'fromDevops',
              roles: ['QA']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
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
        name: 'sideex',
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