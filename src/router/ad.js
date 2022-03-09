import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'

const adRoute = [
  // 首頁
  {
    path: '/',
    redirect: { name: 'dashboard-admin' },
    meta: {
      roles: ['Administrator']
    },
    hidden: true
  },
  // 總覽
  {
    path: '/overview',
    component: Layout,
    redirect: '/overview/dashboard',
    meta: {
      icon: 'dashboard',
      title: 'overview',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-admin',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'project-list',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
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
    component: Layout,
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
        component: () => import('@/views/Plan/Overview'),
        meta: { title: 'projectOverview', roles: ['Administrator'] }
      },
      {
        path: 'milestone',
        name: 'milestone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['Administrator'] }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['Administrator'] }
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['Administrator'] },
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
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          },
          {
            path: 'advance-branch-settings',
            name: 'advance-branch-settings',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Administrator'] }
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Administrator'] }
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
              roles: ['Administrator']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
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
        name: 'wiki-list',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'wikiList', roles: ['Administrator'] }
      },
      {
        path: 'files',
        name: 'file-list',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Administrator'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Administrator'] }
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: parentBlank,
        meta: { title: 'releaseVersion', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['Administrator']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
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
        redirect: { name: 'deploy' },
        component: parentBlank,
        meta: { title: 'deploy', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'deploy',
            component: () => import('@/views/Project/Deploy'),
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
    component: Layout,
    name: 'progress',
    redirect: { name: 'dev-environment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Administrator'] }
      },
      // {
      //   path: 'git-graph',
      //   name: 'git-graph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'gitGraph', roles: ['Administrator'] }
      // },
      {
        path: 'pipelines',
        component: parentBlank,
        meta: { title: 'pipelines', roles: ['Administrator'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines'),
            meta: { roles: ['Administrator'] }
          },
          {
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['Administrator'] }
          }
        ]
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Administrator'] }
      },
      {
        path: 'kubernetes-resources',
        component: parentBlank,
        meta: {
          title: 'kubernetesResources',
          roles: ['Administrator']
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
            meta: { title: 'Pods List', roles: ['Administrator'] },
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
                meta: { title: 'Pod Execute Shell', roles: ['Administrator'] }
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
              roles: ['Administrator']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Administrator']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Administrator']
            }
          },
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'Deployment List',
              roles: ['Administrator']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/IngressesList'),
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
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: () => import('@/views/Test/TestFile'),
        meta: {
          title: 'testFile',
          roles: ['Administrator']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['Administrator']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'testPlan',
              roles: ['Administrator']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator'],
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
    component: Layout,
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Administrator']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Administrator'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Administrator'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Administrator'] }
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'cmas', roles: ['Administrator'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: parentBlank,
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['Administrator'] },
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
            meta: { title: 'webInspectReport', roles: ['Administrator'] }
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
          roles: ['Administrator']
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
              roles: ['Administrator']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Administrator']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: ':projectName?/plugin-resource',
        component: parentBlank,
        meta: { title: 'Plugin Resource', roles: ['Administrator'] },
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
              roles: ['Administrator']
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
                  roles: ['Administrator']
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
        meta: { title: 'Service Monitoring', roles: ['Administrator'] }
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
      roles: ['Administrator']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Activities/ProjectActivities'),
        name: 'ProjectActivities',
        meta: { title: 'Project Activities', roles: ['Administrator'] }
      }
    ]
  },
  // 系統設定
  {
    path: '/system-settings',
    component: Layout,
    name: 'Admin',
    redirect: { name: 'AccountManage' },
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'account-manage',
        component: parentBlank,
        meta: { title: 'Account Manage', roles: ['Administrator'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'AccountManage',
                component: () => import('@/views/SystemSettings/AccountManage'),
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'SystemParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          }
        ]
      },
      {
        path: 'system-activities',
        name: 'SystemActivities',
        component: () => import('@/views/SystemSettings/SystemActivities'),
        meta: { title: 'System Activities', roles: ['Administrator'] }
      },
      {
        path: 'system-arguments',
        name: 'System Arguments',
        component: () => import('@/views/SystemSettings/SystemArguments'),
        meta: { title: 'System Arguments', roles: ['Administrator'] }
      },
      {
        path: 'system-deploy-settings',
        name: 'System Deploy Settings',
        component: () => import('@/views/SystemSettings/SystemDeploySettings'),
        meta: { title: 'System Deploy Settings', roles: ['Administrator'] }
      },
      {
        path: 'sub-admin-projects',
        name: 'Sub Admin Projects',
        component: () => import('@/views/SystemSettings/SubAdminProjects'),
        meta: { title: 'Project Settings (QA)', roles: ['Administrator'] }
      },
      {
        path: 'system-plugin-manage',
        name: 'System Plugin Manage',
        component: () => import('@/views/SystemSettings/SystemPluginManage'),
        meta: { title: 'System Plugin Manage', roles: ['Administrator'] }
      }
    ]
  },
  // 個人資料 & 版本資訊
  {
    path: '/profile',
    component: Layout,
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Administrator'] },
    children: [
      {
        path: '',
        component: () => import('@/views/Profile'),
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
    component: Layout,
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Administrator'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
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
