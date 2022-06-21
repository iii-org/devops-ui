
const rdRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'MyWork' },
    meta: {
      roles: ['Engineer']
    },
    hidden: true
  },
  // 我的工作
  {
    path: '/myWork/:projectName?',
    component: 'layout',
    meta: {
      roles: ['Engineer']
    },
    children: [
      {
        path: '',
        name: 'MyWork',
        component: 'views/MyWork',
        meta: {
          title: 'myWork',
          icon: 'el-icon-s-home',
          roles: ['Engineer']
        }
      }
    ]
  },
  // 專案列表
  {
    path: '/projectList',
    component: 'layout',
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: 'views/Overview/ProjectList/ProjectListRD',
        meta: { title: 'projectList', icon: 'list', roles: ['Engineer'] }
      }
    ]
  },
  // 工作執行
  {
    path: '/project/:projectName?/',
    component: 'layout',
    redirect: { name: 'Overview' },
    meta: {
      title: 'works',
      icon: 'el-icon-s-cooperation',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: 'views/Project/IssueBoards',
        meta: { title: 'kanban', roles: ['Engineer'] }
      },
      {
        path: 'issues',
        component: 'layout/components/parentBlank',
        meta: { title: 'issueList' },
        children: [
          {
            path: '',
            name: 'IssueList',
            hidden: true,
            component: 'views/Project/IssueList',
            meta: {
              roles: ['Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Engineer'],
              rolePage: false,
              subject: ''
            }
          }
        ]
      },
      {
        path: 'notes',
        name: 'WikiList',
        component: 'views/Project/Wiki',
        meta: { title: 'wikiList', roles: ['Engineer'] }
      },
      {
        path: 'files',
        name: 'FileList',
        component: 'views/Project/Files',
        meta: { title: 'fileList', roles: ['Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'ProjectRoadmap',
        component: 'views/Project/Roadmap',
        meta: { title: 'Project Roadmap', roles: ['Engineer'] }
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: 'layout/components/parentBlank',
        meta: { title: 'releaseVersion', roles: ['Engineer'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['Engineer']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: 'views/Project/ReleaseVersion/ClosedIssueList',
            meta: {
              title: 'Issue Detail',
              roles: ['Engineer'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'deploy',
        redirect: { name: 'Deploy' },
        component: 'layout/components/parentBlank',
        meta: { title: 'deploy', roles: ['Engineer'] },
        children: [
          {
            path: '',
            name: 'Deploy',
            component: 'views/Project/Deploy',
            meta: {
              title: 'deploy',
              roles: ['Engineer']
            }
          }
        ]
      }
    ]
  },
  // 開發進度
  {
    path: '/progress/:projectName?/',
    component: 'layout',
    name: 'Progress',
    redirect: { name: 'DevEnvironment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'devBranch',
        name: 'DevBranch',
        component: 'views/Progress/DevBranch',
        meta: { title: 'devBranch', roles: ['Engineer'] }
      },
      // {
      //   path: 'GitGraph',
      //   name: 'GitGraph',
      //   component: 'views/Progress/GitGraph',
      //   meta: { title: 'gitGraph', roles: ['Engineer'] }
      // },
      {
        path: 'pipelines',
        component: 'layout/components/parentBlank',
        meta: { title: 'pipelines', roles: ['Engineer'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: 'views/Progress/Pipelines',
            meta: { roles: ['Engineer'] }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['Engineer'] }
          }
        ]
      },
      {
        path: 'devEnvironment',
        name: 'DevEnvironment',
        component: 'views/Progress/DevEnvironment',
        meta: { title: 'devEnvironment', roles: ['Engineer'] }
      },
      {
        path: 'kubernetesResources',
        component: 'layout/components/parentBlank',
        meta: {
          title: 'kubernetesResources',
          roles: ['Engineer']
        },
        children: [
          {
            path: '',
            name: 'KubernetesResources',
            component: 'views/Progress/KubernetesResources',
            hidden: true
          },
          {
            path: 'podsList',
            hidden: true,
            component: 'layout/components/parentBlank',
            meta: { title: 'Pods List', roles: ['Engineer'] },
            children: [
              {
                path: '',
                name: 'PodsList',
                hidden: true,
                component: 'views/Progress/KubernetesResources/components/PodsList'
              },
              {
                path: 'podExecuteShell',
                name: 'PodExecuteShell',
                hidden: true,
                component: 'views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell',
                meta: { title: 'Pod Execute Shell', roles: ['Engineer'] }
              }
            ]
          },
          {
            path: 'serviceList',
            name: 'ServiceList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ServiceList',
            meta: {
              title: 'Service List',
              roles: ['Engineer']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/SecretList',
            meta: {
              title: 'Secret List',
              roles: ['Engineer']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ConfigMapsList',
            meta: {
              title: 'ConfigMaps List',
              roles: ['Engineer']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/DeploymentList',
            meta: {
              title: 'Deployment List',
              roles: ['Engineer']
            }
          },
          {
            path: 'ingressesList',
            name: 'IngressesList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/IngressesList',
            meta: {
              title: 'Ingresses List',
              roles: ['Engineer']
            }
          }
        ]
      }
    ]
  },
  {
    path: '/commitList/:rId/:branchName/:projectName',
    component: 'layout',
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'CommitList',
        props: true,
        component: 'views/Progress/CommitList',
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },
  // 測試管理
  {
    path: '/test/:projectName?/',
    name: 'Test',
    component: 'layout',
    redirect: { name: 'TestPlan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'testFile',
        name: 'TestFile',
        component: 'views/Test/TestFile',
        meta: {
          title: 'testFile',
          roles: ['Engineer']
        }
      },
      {
        path: 'testPlan',
        redirect: '/test/testPlan',
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['Engineer']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'testPlan',
              roles: ['Engineer']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Engineer'],
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
              roles: ['Engineer'],
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
      roles: ['Engineer']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['Engineer'] }
      },
      {
        name: 'Checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['Engineer'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['Engineer'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['Engineer'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'Webinspect' },
        meta: { title: 'webInspect', roles: ['Engineer'] },
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
            meta: { title: 'webInspectReport', roles: ['Engineer'] }
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
          roles: ['Engineer']
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
              roles: ['Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: 'views/Scan/TestCasePostman',
            meta: {
              title: 'fromCollection',
              roles: ['Engineer']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: 'views/Scan/Sideex',
        meta: { title: 'sideex', roles: ['Engineer'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: 'layout',
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: 'views/Profile',
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Engineer']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: 'layout',
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: 'views/SystemVersion',
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Engineer']
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default rdRoute
