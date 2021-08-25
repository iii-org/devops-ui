import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/Login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    name: '404',
    hidden: true
  }
]

export const asyncRoutes = [
  {
    path: '/',
    redirect: { name: 'my-works' },
    meta: {
      roles: ['Project Manager', 'Engineer']
    },
    hidden: true
  },
  {
    path: '/',
    redirect: { name: 'dashboard-admin' },
    meta: {
      roles: ['Administrator']
    },
    hidden: true
  },
  {
    path: '/my-work',
    component: Layout,
    meta: {
      roles: ['Project Manager', 'Engineer']
    },
    children: [
      {
        path: '',
        name: 'my-works',
        component: () => import('@/views/MyWork'),
        meta: {
          title: 'myWork',
          icon: 'el-icon-s-home',
          roles: ['Project Manager', 'Engineer']
        }
      }
    ]
  },
  {
    path: '/overview',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-admin',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          icon: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'project-list',
        name: 'project-list-pm',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
          icon: 'list',
          roles: ['Administrator', 'Project Manager']
        }
      },
      {
        path: 'project-list',
        name: 'project-list-rd',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: { title: 'projectList', icon: 'list', roles: ['Engineer'] }
      }
    ],
    meta: {
      title: 'overview',
      icon: 'el-icon-data-analysis',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    }
  },
  {
    path: '/project',
    component: Layout,
    redirect: { name: 'Overview' },
    meta: {
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Project/Overview'),
        meta: { title: 'projectOverview', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Administrator', 'Project Manager', 'Engineer'] }
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
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager', 'Engineer'],
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
        meta: { title: 'wikiList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'files',
        name: 'file-list',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: '/release-version',
        redirect: { name: 'release-version' },
        component: parentBlank,
        meta: { title: 'releaseVersion', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['Administrator', 'Project Manager']
            }
          },
          {
            path: '/release-version/:issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: '/deploy',
        redirect: { name: 'deploy' },
        component: parentBlank,
        meta: { title: 'deploy', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            name: 'deploy',
            component: () => import('@/views/Project/Deploy'),
            meta: {
              title: 'deploy',
              roles: ['Administrator', 'Project Manager']
            }
          }
        ]
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Project/Settings/index'),
                meta: { roles: ['Administrator', 'Project Manager'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Administrator', 'QA'] }
              }
            ]
          },
          {
            path: 'advance-branch-settings',
            name: 'advance-branch-settings',
            hidden: true,
            component: () => import('@/views/Project/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Project/Settings/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['Administrator', 'Project Manager'] }
          }
        ]
      }
    ]
  },

  {
    path: '/progress',
    component: Layout,
    name: 'progress',
    redirect: { name: 'dev-environment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      // {
      //   path: 'git-graph',
      //   name: 'git-graph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'gitGraph', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      // },
      {
        path: 'pipelines',
        component: parentBlank,
        meta: { title: 'pipelines', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines'),
            meta: { roles: ['Administrator', 'Project Manager', 'Engineer'] }
          },
          {
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['Administrator', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'kubernetes-resources',
        component: parentBlank,
        meta: {
          title: 'kubernetesResources',
          roles: ['Administrator', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'Kubernetes-resources',
            component: () => import('@/views/Progress/KubernetesResources'),
            hidden: true
          },
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'Deployment List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'pods-list',
            hidden: true,
            component: parentBlank,
            meta: { title: 'Pods List', roles: ['Administrator', 'Project Manager', 'Engineer'] },
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
                component: () => import('@/views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'Pod Execute Shell', roles: ['Administrator', 'Project Manager', 'Engineer'] }
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
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/IngressesList'),
            meta: {
              title: 'Ingresses List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          }
        ]
      }
    ]
  },

  {
    path: '/commit_list/:rId/:branchName/:projectName',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'commitList',
        props: true,
        component: () => import('@/views/Progress/CommitList'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/scan',
    component: Layout,
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'postman',
        name: 'postman',
        component: parentBlank,
        redirect: { name: 'postman-test' },
        meta: {
          title: 'postman',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: 'scans',
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
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          }
        ]
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'web-inspect',
        name: 'webinspect',
        component: parentBlank,
        redirect: { name: 'webinspect-scans' },
        meta: { title: 'webInspect', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: 'scans',
            name: 'webinspect-scans',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scan_id',
            name: 'webinspect-report',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'sideex',
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: { name: 'Plugin Resource' },
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: 'plugin-resource',
        component: parentBlank,
        meta: { title: 'Plugin Resource', roles: ['Administrator', 'Project Manager'] },
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
              roles: ['Administrator', 'Project Manager']
            },
            children: [
              {
                path: '',
                name: 'Harbor',
                hidden: true,
                component: () => import('@/views/SystemResource/Harbor/ResourceHarbor')
              },
              {
                path: 'artifacts',
                name: 'Artifacts',
                hidden: true,
                component: () => import('@/views/SystemResource/Harbor/components/ProjectArtifacts'),
                meta: {
                  title: 'Artifacts',
                  roles: ['Administrator', 'Project Manager']
                }
              }
            ]
          }
        ]
      }
    ]
  },

  {
    path: '/project-activities',
    component: Layout,
    redirect: { name: 'ProjectActivities' },
    meta: {
      icon: 'el-icon-s-order',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Activities/ProjectActivities'),
        name: 'ProjectActivities',
        meta: { title: 'Project Activities', roles: ['Administrator', 'Project Manager'] }
      }
    ]
  },

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

  {
    path: '/profile',
    component: Layout,
    redirect: { name: 'Profile' },
    hidden: true,
    meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/Profile'),
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: Layout,
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
