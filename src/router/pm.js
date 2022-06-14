
const pmRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'MyWork' },
    meta: {
      roles: ['Project Manager']
    },
    hidden: true
  },
  // 我的工作
  {
    path: '/myWork/:projectName?',
    component: 'layout',
    name: 'MyWork',
    redirect: { name: 'MyWork' },
    meta: {
      icon: 'el-icon-s-home',
      roles: ['Project Manager']
    },
    children: [
      {
        path: '',
        name: 'MyWork',
        component: 'views/MyWork',
        meta: {
          title: 'MyWork',
          roles: ['Project Manager']
        }
      }
    ]
  },
  // 專案列表
  {
    path: '/projectList',
    component: 'layout',
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: 'views/Overview/ProjectList/ProjectListPM',
        meta: { title: 'projectList', icon: 'list', roles: ['Project Manager'] }
      }
    ]
  },
  // 專案管理
  {
    path: '/plan/:projectName?/',
    component: 'layout',
    redirect: { name: 'Overview' },
    meta: {
      title: 'project-management',
      icon: 'el-icon-edit-outline',
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: 'views/Plan/Overview',
        meta: { title: 'projectOverview', roles: ['Project Manager'] }
      },
      {
        path: 'milestone',
        name: 'Milstone',
        component: 'views/Plan/Milestone',
        meta: { title: 'milestone', roles: ['Project Manager'] }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: 'views/Plan/TraceabilityMatrix',
        meta: { title: 'traceabilityMatrix', roles: ['Project Manager'] }
      },
      {
        path: 'projectSettings',
        component: 'layout/components/parentBlank',
        meta: { title: 'Project Settings', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            component: 'layout/components/parentBlank',
            hidden: true,
            children: [
              {
                path: '',
                name: 'ProjectSettings',
                component: 'views/Plan/Settings/index',
                meta: { roles: ['Project Manager'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: 'views/SystemSettings/AccountManage/components/ParticipateProject',
                meta: { title: 'Participate Project', roles: ['Project Manager'] }
              }
            ]
          },
          {
            path: 'advanceBranchSettings',
            name: 'AdvanceBranchSettings',
            hidden: true,
            component: 'views/Plan/Settings/components/AdvanceBranchSettings',
            meta: { title: 'advanceBranchSettings', roles: ['Project Manager'] }
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: 'views/Plan/Settings/ProjectIssueTransfer',
            meta: { title: 'Issue Transfer', roles: ['Project Manager'] }
          }
        ]
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
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: 'views/Project/IssueBoards',
        meta: { title: 'kanban', roles: ['Project Manager'] }
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
              roles: ['Project Manager']
            }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager'],
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
        meta: { title: 'wikiList', roles: ['Project Manager'] }
      },
      {
        path: 'files',
        name: 'FileList',
        component: 'views/Project/Files',
        meta: { title: 'fileList', roles: ['Project Manager'] }
      },
      {
        path: 'roadmap',
        name: 'ProjectRoadmap',
        component: 'views/Project/Roadmap',
        meta: { title: 'Project Roadmap', roles: ['Project Manager'] }
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: 'layout/components/parentBlank',
        meta: { title: 'releaseVersion', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['Project Manager']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: 'views/Project/ReleaseVersion/ClosedIssueList',
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'deploy',
        name: 'Deploy',
        component: 'views/Project/Deploy',
        meta: { title: 'Deploy', roles: ['Project Manager'] }
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
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'devBranch',
        name: 'DevBranch',
        component: 'views/Progress/DevBranch',
        meta: { title: 'devBranch', roles: ['Project Manager'] }
      },
      // {
      //   path: 'GitGraph',
      //   name: 'GitGraph',
      //   component: 'views/Progress/GitGraph',
      //   meta: { title: 'gitGraph', roles: ['Project Manager'] }
      // },
      {
        path: 'pipelines',
        component: 'layout/components/parentBlank',
        meta: { title: 'pipelines', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: 'views/Progress/Pipelines',
            meta: { roles: ['Project Manager'] }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['Project Manager'] }
          }
        ]
      },
      {
        path: 'devEnvironment',
        name: 'DevEnvironment',
        component: 'views/Progress/DevEnvironment',
        meta: { title: 'devEnvironment', roles: ['Project Manager'] }
      },
      {
        path: 'kubernetesResources',
        component: 'layout/components/parentBlank',
        meta: {
          title: 'kubernetesResources',
          roles: ['Project Manager']
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
            meta: { title: 'Pods List', roles: ['Project Manager'] },
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
                component: () =>
                  import('@/views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'Pod Execute Shell', roles: ['Project Manager'] }
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
              roles: ['Project Manager']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/SecretList',
            meta: {
              title: 'Secret List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ConfigMapsList',
            meta: {
              title: 'ConfigMaps List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/DeploymentList',
            meta: {
              title: 'Deployment List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'ingressesList',
            name: 'IngressesList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/IngressesList',
            meta: {
              title: 'Ingresses List',
              roles: ['Project Manager']
            }
          }
        ]
      }
    ]
  },
  // 測試管理
  {
    path: '/test/:projectName?/',
    // name: 'Test',
    component: 'layout',
    redirect: { name: 'TestPlan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'testFile',
        name: 'TestFile',
        component: 'views/Test/TestFile',
        meta: {
          title: 'testFile',
          roles: ['Project Manager']
        }
      },
      {
        path: 'testPlan',
        redirect: '/test/testPlan',
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['Project Manager']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'testPlan',
              roles: ['Project Manager']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager'],
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
              roles: ['Project Manager'],
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
      roles: ['Project Manager']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['Project Manager'] }
      },
      {
        name: 'Checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['Project Manager'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['Project Manager'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['Project Manager'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'Webinspect' },
        meta: { title: 'webInspect', roles: ['Project Manager'] },
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
            meta: { title: 'webInspectReport', roles: ['Project Manager'] }
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
          roles: ['Project Manager']
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
              roles: ['Project Manager']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: 'views/Scan/TestCasePostman',
            meta: {
              title: 'fromCollection',
              roles: ['Project Manager']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: 'views/Scan/Sideex',
        meta: { title: 'sideex', roles: ['Project Manager'] }
      }
    ]
  },
  // 系統資源
  {
    path: '/systemResource',
    component: 'layout',
    name: 'SystemResource',
    redirect: { name: 'PluginResource' },
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Project Manager']
    },
    children: [
      {
        path: ':projectName?/pluginResource',
        component: 'layout/components/parentBlank',
        meta: {
          title: 'Plugin Resource',
          roles: ['Project Manager']
        },
        children: [
          {
            path: '',
            name: 'PluginResource',
            hidden: true,
            component: 'views/SystemResource/PluginResource'
          },
          {
            path: 'harbor',
            hidden: true,
            component: 'layout/components/parentBlank',
            meta: {
              title: 'Harbor',
              roles: ['Project Manager']
            },
            children: [
              {
                path: '',
                name: 'Harbor',
                hidden: true,
                component: 'views/SystemResource/Harbor/ResourceHarbor'
              },
              {
                path: ':rName/artifacts',
                name: 'Artifacts',
                hidden: true,
                component: 'views/SystemResource/Harbor/components/ProjectArtifacts',
                meta: {
                  title: 'Artifacts',
                  roles: ['Project Manager']
                }
              }
            ]
          }
        ]
      },
      {
        path: 'serviceMonitoring',
        name: 'ServiceMonitoring',
        component: 'views/SystemResource/ServiceMonitoring',
        meta: {
          title: 'Service Monitoring',
          roles: ['Project Manager']
        }
      }
    ]
  },
  // 操作記錄
  {
    path: '/projectActivities/:projectName?',
    component: 'layout',
    redirect: { name: 'ProjectActivities' },
    meta: {
      icon: 'el-icon-s-order',
      roles: ['Project Manager']
    },
    children: [
      {
        path: '',
        component: 'views/Activities/ProjectActivities',
        name: 'ProjectActivities',
        meta: { title: 'Project Activities', roles: ['Project Manager'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: 'layout',
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        component: 'views/Profile',
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Project Manager']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: 'layout',
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        component: 'views/SystemVersion',
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Project Manager']
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default pmRoute
