
const adRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'Dashboard' },
    meta: {
      roles: ['Administrator']
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: 'views/Overview/Dashboard/roles/admin',
        meta: {
          title: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: 'views/Overview/ProjectList/ProjectListPM',
        meta: {
          title: 'projectList',
          roles: ['Administrator']
        }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: '/views/Plan/Overview',
        meta: { title: 'projectOverview', roles: ['Administrator'] }
      },
      {
        path: 'milestone',
        name: 'Milstone',
        component: 'views/Plan/Milestone',
        meta: { title: 'milestone', roles: ['Administrator'] }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: 'views/Plan/TraceabilityMatrix',
        meta: { title: 'traceabilityMatrix', roles: ['Administrator'] }
      },
      {
        path: 'projectSettings',
        component: 'layout/components/parentBlank',
        meta: { title: 'Project Settings', roles: ['Administrator'] },
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
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: 'views/SystemSettings/AccountManage/components/ParticipateProject',
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          },
          {
            path: 'advanceBranchSettings',
            name: 'AdvanceBranchSettings',
            hidden: true,
            component: 'views/Plan/Settings/components/AdvanceBranchSettings',
            meta: { title: 'advanceBranchSettings', roles: ['Administrator'] }
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: 'views/Plan/Settings/ProjectIssueTransfer',
            meta: { title: 'Issue Transfer', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: 'views/Project/IssueBoards',
        meta: { title: 'kanban', roles: ['Administrator'] }
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
              roles: ['Administrator']
            }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator'],
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
        meta: { title: 'wikiList', roles: ['Administrator'] }
      },
      {
        path: 'files',
        name: 'FileList',
        component: 'views/Project/Files',
        meta: { title: 'fileList', roles: ['Administrator'] }
      },
      {
        path: 'roadmap',
        name: 'ProjectRoadmap',
        component: 'views/Project/Roadmap',
        meta: { title: 'Project Roadmap', roles: ['Administrator'] }
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: 'layout/components/parentBlank',
        meta: { title: 'releaseVersion', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: 'views/Project/ReleaseVersion',
            hidden: true,
            meta: {
              roles: ['Administrator']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: 'views/Project/ReleaseVersion/ClosedIssueList',
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'deploy',
        redirect: { name: 'Deploy' },
        component: 'layout/components/parentBlank',
        meta: { title: 'deploy', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'Deploy',
            component: 'views/Project/Deploy',
            meta: {
              title: 'deploy',
              roles: ['Administrator']
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'devBranch',
        name: 'DevBranch',
        component: 'views/Progress/DevBranch',
        meta: { title: 'devBranch', roles: ['Administrator'] }
      },
      // {
      //   path: 'GitGraph',
      //   name: 'GitGraph',
      //   component: 'views/Progress/GitGraph',
      //   meta: { title: 'gitGraph', roles: ['Administrator'] }
      // },
      {
        path: 'pipelines',
        component: 'layout/components/parentBlank',
        meta: { title: 'pipelines', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: 'views/Progress/Pipelines',
            meta: { roles: ['Administrator'] }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: 'views/Progress/Pipelines/components/TestReport',
            meta: { title: 'testReport', roles: ['Administrator'] }
          }
        ]
      },
      {
        path: 'devEnvironment',
        name: 'DevEnvironment',
        component: 'views/Progress/DevEnvironment',
        meta: { title: 'devEnvironment', roles: ['Administrator'] }
      },
      {
        path: 'kubernetesResources',
        component: 'layout/components/parentBlank',
        meta: {
          title: 'kubernetesResources',
          roles: ['Administrator']
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
            meta: { title: 'Pods List', roles: ['Administrator'] },
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
                meta: { title: 'Pod Execute Shell', roles: ['Administrator'] }
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
              roles: ['Administrator']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/SecretList',
            meta: {
              title: 'Secret List',
              roles: ['Administrator']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/ConfigMapsList',
            meta: {
              title: 'ConfigMaps List',
              roles: ['Administrator']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/DeploymentList',
            meta: {
              title: 'Deployment List',
              roles: ['Administrator']
            }
          },
          {
            path: 'ingressesList',
            name: 'IngressesList',
            hidden: true,
            component: 'views/Progress/KubernetesResources/components/IngressesList',
            meta: {
              title: 'Ingresses List',
              roles: ['Administrator']
            }
          }
        ]
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'testFile',
        name: 'TestFile',
        component: 'views/Test/TestFile',
        meta: {
          title: 'testFile',
          roles: ['Administrator']
        }
      },
      {
        path: 'testPlan',
        redirect: '/test/testPlan',
        component: 'layout/components/parentBlank',
        meta: {
          roles: ['Administrator']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: 'views/Test/TestPlan',
            meta: {
              title: 'testPlan',
              roles: ['Administrator']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: 'views/Project/IssueDetail',
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator'],
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
              roles: ['Administrator'],
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
      roles: ['Administrator']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: 'views/Scan/SonarQube',
        meta: { title: 'sonarQube', roles: ['Administrator'] }
      },
      {
        name: 'Checkmarx',
        path: 'checkmarx',
        component: 'views/Scan/Checkmarx',
        meta: { title: 'checkMarx', roles: ['Administrator'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: 'views/Scan/Zap',
        meta: { title: 'zap', roles: ['Administrator'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: 'views/Scan/Cmas',
        meta: { title: 'cmas', roles: ['Administrator'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspect',
        component: 'layout/components/parentBlank',
        redirect: { name: 'Webinspect' },
        meta: { title: 'webInspect', roles: ['Administrator'] },
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
            meta: { title: 'webInspectReport', roles: ['Administrator'] }
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
          roles: ['Administrator']
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
              roles: ['Administrator']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: 'views/Scan/TestCasePostman',
            meta: {
              title: 'fromCollection',
              roles: ['Administrator']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: 'views/Scan/Sideex',
        meta: { title: 'sideex', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: ':projectName?/pluginResource',
        component: 'layout/components/parentBlank',
        meta: { title: 'Plugin Resource', roles: ['Administrator'] },
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
              roles: ['Administrator']
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
                  roles: ['Administrator']
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
        meta: { title: 'Service Monitoring', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: '',
        component: 'views/Activities/ProjectActivities',
        name: 'ProjectActivities',
        meta: { title: 'Project Activities', roles: ['Administrator'] }
      }
    ]
  },
  // 系統設定
  {
    path: '/systemSettings',
    component: 'layout',
    name: 'Admin',
    redirect: { name: 'AccountManage' },
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'accountManage',
        component: 'layout/components/parentBlank',
        meta: { title: 'Account Manage', roles: ['Administrator'] },
        children: [
          {
            path: '',
            component: 'layout/components/parentBlank',
            hidden: true,
            children: [
              {
                path: '',
                name: 'AccountManage',
                component: 'views/SystemSettings/AccountManage',
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: 'views/SystemSettings/AccountManage/components/ParticipateProject',
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          }
        ]
      },
      {
        path: 'systemActivities',
        name: 'SystemActivities',
        component: 'views/SystemSettings/SystemActivities',
        meta: { title: 'System Activities', roles: ['Administrator'] }
      },
      {
        path: 'systemArguments',
        name: 'SystemArguments',
        component: 'views/SystemSettings/SystemArguments',
        meta: { title: 'System Arguments', roles: ['Administrator'] }
      },
      {
        path: 'systemDeploySettings',
        name: 'SystemDeploySettings',
        component: 'views/SystemSettings/SystemDeploySettings',
        meta: { title: 'System Deploy Settings', roles: ['Administrator'] }
      },
      {
        path: 'subAdminProjects',
        name: 'SubAdminProjects',
        component: 'views/SystemSettings/SubAdminProjects',
        meta: { title: 'Project Settings (QA)', roles: ['Administrator'] }
      },
      {
        path: 'systemPluginManage',
        name: 'SystemPluginManage',
        component: 'views/SystemSettings/SystemPluginManage',
        meta: { title: 'System Plugin Manage', roles: ['Administrator'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: 'layout',
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Administrator'] },
    children: [
      {
        path: '',
        component: 'views/Profile',
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Administrator']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: 'layout',
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Administrator'] },
    children: [
      {
        path: '',
        component: 'views/SystemVersion',
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Administrator']
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default adRoute
