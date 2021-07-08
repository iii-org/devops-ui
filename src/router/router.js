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
  // RD root
  {
    path: '/',
    component: Layout,
    redirect: '/overview/dashboard',
    meta: {
      title: 'overview',
      icon: 'el-icon-s-cooperation',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'overview/dashboard',
        name: 'dashboard-rd',
        component: () => import('@/views/Overview/Dashboard'),
        meta: { title: 'dashboard', icon: 'dashboard', roles: ['Engineer'] }
      },
      {
        path: 'overview/project-list',
        name: 'project-list-rd',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: { title: 'projectList', icon: 'list', roles: ['Engineer'] }
      }
    ]
  },

  // PM QA root
  {
    path: '/',
    component: Layout,
    name: 'project-pm',
    redirect: '/overview/project-list',
    meta: {
      title: 'projectList',
      icon: 'el-icon-s-cooperation',
      roles: ['Project Manager', 'QA']
    },
    children: [
      {
        path: 'overview/project-list',
        name: 'project-list-pm',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
          icon: 'list',
          roles: ['Project Manager', 'QA']
        }
      }
    ]
  },

  // admin root
  {
    path: '/',
    component: Layout,
    name: 'project-admin',
    redirect: '/overview/dashboard',
    meta: {
      title: 'overview',
      icon: 'el-icon-s-cooperation',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'overview/dashboard',
        name: 'dashboard',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          icon: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'overview/project-list',
        name: 'project-list-pm',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
          icon: 'list',
          roles: ['Administrator']
        }
      }
    ]
  },

  {
    path: '/project',
    component: Layout,
    redirect: '/project/overview',
    meta: {
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['Project Manager', 'QA', 'Administrator', 'Engineer']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Project/Overview'),
        meta: { title: 'projectOverview', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'issues',
        component: parentBlank,
        children: [
          {
            path: '',
            name: 'issue-list',
            component: () => import('@/views/Project/IssueList'),
            meta: {
              title: 'issueList',
              roles: ['Project Manager', 'Engineer', 'Administrator']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager', 'Engineer', 'Administrator']
            }
          }
        ]
      },
      {
        path: 'test-case',
        component: parentBlank,
        meta: {
          title: 'createTest',
          roles: ['Engineer', 'Project Manager', 'Administrator']
        },
        children: [
          {
            path: '',
            name: 'test-case',
            component: () => import('@/views/Project/TestCase/TestCase'),
            hidden: true
          },
          {
            path: 'test-item/:testCaseId',
            name: 'test-item',
            component: () => import('@/views/Project/TestCase/TestItem'),
            hidden: true,
            meta: {
              title: 'testItem',
              roles: ['Engineer', 'Project Manager', 'Administrator']
            }
          }
        ]
      },
      {
        path: 'wiki',
        name: 'wiki-list',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'wikiList', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'file',
        name: 'file-list',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: '/release-version',
        redirect: '/release-version',
        component: parentBlank,
        meta: { title: 'releaseVersion', roles: ['Project Manager', 'Administrator'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            meta: {
              title: 'releaseVersion', roles: ['Project Manager', 'Administrator']
            }
          },
          {
            path: '/release-version/:issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA', 'Administrator'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['Project Manager', 'Administrator'] },
        children: [
          {
            path: '',
            name: 'Project Settings',
            hidden: true,
            component: () => import('@/views/Project/Settings/index')
          },
          {
            path: 'advance-branch-settings',
            name: 'advance-branch-settings',
            hidden: true,
            component: () => import('@/views/Project/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Project Manager', 'Administrator'] }
          }
        ]
      },
      {
        path: 'settings',
        name: 'Project Settings',
        component: () => import('@/views/Project/Settings/roles/QA'),
        meta: { title: 'Project Settings', roles: ['QA'] }
      }
    ]
  },

  {
    path: '/progress',
    component: Layout,
    name: 'progress',
    redirect: '/progress/git-graph',
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Project Manager', 'Administrator', 'Engineer']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: () => import('@/views//Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'git-graph',
        name: 'git-graph',
        component: () => import('@/views/Progress/GitGraph'),
        meta: { title: 'gitGraph', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'pipelines',
        name: 'Pipelines',
        component: () => import('@/views/Progress/Pipelines'),
        meta: { title: 'pipelines', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'kubernetes-resources',
        component: parentBlank,
        meta: {
          title: 'kubernetesResources',
          roles: ['Project Manager', 'Administrator', 'Engineer']
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
              roles: ['Project Manager', 'Administrator', 'Engineer']
            }
          },
          {
            path: 'pods-list',
            name: 'Pods List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/PodsList'),
            meta: {
              title: 'Pods List',
              roles: ['Project Manager', 'Administrator', 'Engineer']
            }
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ServiceList'),
            meta: {
              title: 'Service List',
              roles: ['Project Manager', 'Administrator', 'Engineer']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Project Manager', 'Administrator', 'Engineer']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Project Manager', 'Administrator', 'Engineer']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/IngressesList'),
            meta: {
              title: 'Ingresses List',
              roles: ['Project Manager', 'Administrator', 'Engineer']
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
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
    },
    redirect: '/scan/postman',
    children: [
      {
        path: 'postman',
        component: parentBlank,
        meta: {
          title: 'postman',
          roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
        },
        children: [
          {
            path: '',
            name: 'postman',
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
              roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
            }
          }
        ]
      },
      {
        path: 'checkmarx',
        name: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] }
      },
      {
        path: 'web-inspect',
        component: parentBlank,
        meta: { title: 'webInspect', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] },
        children: [
          {
            path: '',
            name: 'webinspect',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scan_id',
            name: 'webInspectReport',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] }
          }
        ]
      },

      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] }
      },
      {
        path: 'sideex',
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] }
      },
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] }
      }
    ]
  },

  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: '/system-resource/plugin-resource',
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Project Manager', 'Administrator']
    },
    children: [
      {
        path: 'plugin-resource',
        component: parentBlank,
        meta: { title: 'Plugin Resource', roles: ['Project Manager', 'Administrator'] },
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
              roles: ['Project Manager', 'Administrator']
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
                  roles: ['Project Manager', 'Administrator']
                }
              }
            ]
          }
        ]
      }
    ]
  },

  {
    path: '/activities',
    component: Layout,
    name: 'Activities',
    redirect: '/activities/project-activities',
    meta: {
      title: 'Activities',
      icon: 'el-icon-s-order',
      roles: ['Project Manager', 'QA', 'Administrator']
    },
    children: [
      {
        path: 'project-activities',
        name: 'ProjectActivities',
        component: () => import('@/views/Activities/ProjectActivities'),
        meta: { title: 'Project Activities', roles: ['Project Manager', 'QA', 'Administrator'] }
      }
    ]
  },

  {
    path: '/system-settings',
    component: Layout,
    name: 'Admin',
    redirect: '/system-settings/account-manage',
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'account-manage',
        name: '',
        component: () => import('@/views/SystemSettings/AccountManage'),
        meta: { title: 'Account Manage', roles: ['Administrator'] }
      },
      {
        path: 'participate-project/:user_id',
        name: 'ParticipateProject',
        hidden: true,
        component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
        meta: { title: 'Participate Project', roles: ['Administrator'] }
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
    redirect: '/profile',
    hidden: true,
    meta: { roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] },
    children: [
      {
        path: '',
        component: () => import('@/views/Profile'),
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
        }
      }
    ]
  },

  {
    path: '/SystemVersion',
    component: Layout,
    redirect: '/SystemVersion',
    hidden: true,
    meta: { roles: ['Engineer', 'Project Manager', 'QA', 'Administrator'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Engineer', 'Project Manager', 'QA', 'Administrator']
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
