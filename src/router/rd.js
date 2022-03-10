
const rdRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'my-works' },
    meta: {
      roles: ['Engineer']
    },
    hidden: true
  },
  // 我的工作
  {
    path: '/my-work/:projectName?',
    component: 'layout',
    meta: {
      roles: ['Engineer']
    },
    children: [
      {
        path: '',
        name: 'my-works',
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
    path: '/project-list',
    component: 'layout',
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'project-list',
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
        path: 'issue-boards',
        name: 'issue-boards',
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
            name: 'issue-list',
            hidden: true,
            component: 'views/Project/IssueList',
            meta: {
              roles: ['Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
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
        name: 'wiki-list',
        component: 'views/Project/Wiki',
        meta: { title: 'wikiList', roles: ['Engineer'] }
      },
      {
        path: 'files',
        name: 'file-list',
        component: 'views/Project/Files',
        meta: { title: 'fileList', roles: ['Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: 'views/Project/Roadmap',
        meta: { title: 'Project Roadmap', roles: ['Engineer'] }
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: 'layout/components/parentBlank',
        meta: { title: 'releaseVersion', roles: ['Engineer'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['Engineer']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
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
        redirect: { name: 'deploy' },
        component: 'layout/components/parentBlank',
        meta: { title: 'deploy', roles: ['Engineer'] },
        children: [
          {
            path: '',
            name: 'deploy',
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
    name: 'progress',
    redirect: { name: 'dev-environment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: 'views/Progress/DevBranch',
        meta: { title: 'devBranch', roles: ['Engineer'] }
      },
      // {
      //   path: 'git-graph',
      //   name: 'git-graph',
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
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['Engineer'] }
          }
        ]
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: 'views/Progress/DevEnvironment',
        meta: { title: 'devEnvironment', roles: ['Engineer'] }
      },
      {
        path: 'kubernetes-resources',
        component: 'layout/components/parentBlank',
        meta: {
          title: 'kubernetesResources',
          roles: ['Engineer']
        },
        children: [
          {
            path: '',
            name: 'Kubernetes-resources',
            component: 'views/Progress/KubernetesResources',
            hidden: true
          },
          {
            path: 'pods-list',
            hidden: true,
            component: 'layout/components/parentBlank',
            meta: { title: 'Pods List', roles: ['Engineer'] },
            children: [
              {
                path: '',
                name: 'Pods List',
                hidden: true,
                component: 'views/Progress/KubernetesResources/components/PodsList'
              },
              {
                path: 'pod-execute-shell',
                name: 'Pod Execute Shell',
                hidden: true,
                component: 'views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell',
                meta: { title: 'Pod Execute Shell', roles: ['Engineer'] }
              }
            ]
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ServiceList',
            meta: {
              title: 'Service List',
              roles: ['Engineer']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/SecretList',
            meta: {
              title: 'Secret List',
              roles: ['Engineer']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ConfigMapsList',
            meta: {
              title: 'ConfigMaps List',
              roles: ['Engineer']
            }
          },
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/DeploymentList',
            meta: {
              title: 'Deployment List',
              roles: ['Engineer']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
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
    path: '/commit_list/:rId/:branchName/:projectName',
    component: 'layout',
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'commitList',
        props: true,
        component: 'views/Progress/CommitList',
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },
  // 測試管理
  {
    path: '/test/:projectName?/',
    name: 'test',
    component: 'layout',
    redirect: { name: 'test-plan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: 'views/Test/TestFile',
        meta: {
          title: 'testFile',
          roles: ['Engineer']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['Engineer']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'testPlan',
              roles: ['Engineer']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
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
            name: 'test-plan-detail',
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
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Engineer']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['Engineer'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['Engineer'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['Engineer'] }
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['Engineer'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['Engineer'] },
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
            meta: { title: 'webInspectReport', roles: ['Engineer'] }
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
          roles: ['Engineer']
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
              roles: ['Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
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
        name: 'sideex',
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
