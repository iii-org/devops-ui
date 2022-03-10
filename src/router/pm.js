import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'

const pmRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'my-works' },
    meta: {
      roles: ['Project Manager']
    },
    hidden: true
  },
  // 我的工作
  {
    path: '/my-work/:projectName?',
    component: Layout,
    meta: {
      roles: ['Project Manager']
    },
    children: [
      {
        path: '',
        name: 'my-works',
        component: () => import('@/views/MyWork'),
        meta: {
          title: 'myWork',
          icon: 'el-icon-s-home',
          roles: ['Project Manager']
        }
      }
    ]
  },
  // 專案列表
  {
    path: '/project-list',
    component: Layout,
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: { title: 'projectList', icon: 'list', roles: ['Project Manager'] }
      }
    ]
  },
  // 專案管理
  {
    path: '/plan/:projectName?/',
    component: Layout,
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
        component: () => import('@/views/Plan/Overview'),
        meta: { title: 'projectOverview', roles: ['Project Manager'] }
      },
      {
        path: 'milestone',
        name: 'milestone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['Project Manager'] }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['Project Manager'] }
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Plan/Settings/index'),
                meta: { roles: ['Project Manager'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Project Manager'] }
              }
            ]
          },
          {
            path: 'advance-branch-settings',
            name: 'advance-branch-settings',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Project Manager'] }
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['Project Manager'] }
          }
        ]
      }
    ]
  },
  // 工作執行
  {
    path: '/project/:projectName?/',
    component: Layout,
    redirect: { name: 'Overview' },
    meta: {
      title: 'works',
      icon: 'el-icon-s-cooperation',
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Project Manager'] }
      },
      {
        path: 'issues',
        component: parentBlank,
        meta: { title: 'issueList' },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: {
              roles: ['Project Manager']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
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
        name: 'wiki-list',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'wikiList', roles: ['Project Manager'] }
      },
      {
        path: 'files',
        name: 'file-list',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Project Manager'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Project Manager'] }
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: parentBlank,
        meta: { title: 'releaseVersion', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['Project Manager']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
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
        redirect: { name: 'deploy' },
        component: parentBlank,
        meta: { title: 'deploy', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            name: 'deploy',
            component: () => import('@/views/Project/Deploy'),
            meta: {
              title: 'deploy',
              roles: ['Project Manager']
            }
          }
        ]
      }
    ]
  },
  // 開發進度
  {
    path: '/progress/:projectName?/',
    component: Layout,
    name: 'progress',
    redirect: { name: 'dev-environment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Project Manager'] }
      },
      // {
      //   path: 'git-graph',
      //   name: 'git-graph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'gitGraph', roles: ['Project Manager'] }
      // },
      {
        path: 'pipelines',
        component: parentBlank,
        meta: { title: 'pipelines', roles: ['Project Manager'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines'),
            meta: { roles: ['Project Manager'] }
          },
          {
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['Project Manager'] }
          }
        ]
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Project Manager'] }
      },
      {
        path: 'kubernetes-resources',
        component: parentBlank,
        meta: {
          title: 'kubernetesResources',
          roles: ['Project Manager']
        },
        children: [
          {
            path: '',
            name: 'Kubernetes-resources',
            component: () => import('@/views/Progress/KubernetesResources'),
            hidden: true
          },
          {
            path: 'pods-list',
            hidden: true,
            component: parentBlank,
            meta: { title: 'Pods List', roles: ['Project Manager'] },
            children: [
              {
                path: '',
                name: 'Pods List',
                hidden: true,
                component: () => import('@/views/Progress/KubernetesResources/components/PodsList')
              },
              {
                path: 'pod-execute-shell',
                name: 'Pod Execute Shell',
                hidden: true,
                component: () =>
                  import('@/views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'Pod Execute Shell', roles: ['Project Manager'] }
              }
            ]
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ServiceList'),
            meta: {
              title: 'Service List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'Deployment List',
              roles: ['Project Manager']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/IngressesList'),
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
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Project Manager']
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: () => import('@/views/Test/TestFile'),
        meta: {
          title: 'testFile',
          roles: ['Project Manager']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['Project Manager']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'testPlan',
              roles: ['Project Manager']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager'],
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
    component: Layout,
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Project Manager']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Project Manager'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Project Manager'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Project Manager'] }
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'cmas', roles: ['Project Manager'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: parentBlank,
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['Project Manager'] },
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
            meta: { title: 'webInspectReport', roles: ['Project Manager'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'postman',
        component: parentBlank,
        redirect: { name: 'postman-test' },
        meta: {
          title: 'postman',
          roles: ['Project Manager']
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
              roles: ['Project Manager']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Project Manager']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Project Manager'] }
      }
    ]
  },
  // 系統資源
  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: { name: 'Plugin Resource' },
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Project Manager']
    },
    children: [
      {
        path: ':projectName?/plugin-resource',
        component: parentBlank,
        meta: {
          title: 'Plugin Resource',
          roles: ['Project Manager']
        },
        children: [
          {
            path: '',
            name: 'Plugin Resource',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource')
          },
          {
            path: 'harbor',
            hidden: true,
            component: parentBlank,
            meta: {
              title: 'Harbor',
              roles: ['Project Manager']
            },
            children: [
              {
                path: '',
                name: 'Harbor',
                hidden: true,
                component: () => import('@/views/SystemResource/Harbor/ResourceHarbor')
              },
              {
                path: ':rName/artifacts',
                name: 'Artifacts',
                hidden: true,
                component: () => import('@/views/SystemResource/Harbor/components/ProjectArtifacts'),
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
        path: 'service-monitoring',
        name: 'Service Monitoring',
        component: () => import('@/views/SystemResource/ServiceMonitoring'),
        meta: {
          title: 'Service Monitoring',
          roles: ['Project Manager']
        }
      }
    ]
  },
  // 操作記錄
  {
    path: '/project-activities/:projectName?',
    component: Layout,
    redirect: { name: 'ProjectActivities' },
    meta: {
      icon: 'el-icon-s-order',
      roles: ['Project Manager']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Activities/ProjectActivities'),
        name: 'ProjectActivities',
        meta: { title: 'Project Activities', roles: ['Project Manager'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: Layout,
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        component: () => import('@/views/Profile'),
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
    component: Layout,
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Project Manager'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
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
