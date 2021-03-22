import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/Login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

export const asyncRoutes = [
  {
    // RD root
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: 'projectOverview',
      icon: 'el-icon-s-cooperation',
      roles: ['Engineer']
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-rd',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'dashboard', icon: 'dashboard', roles: ['Engineer'] }
      },
      {
        path: 'project-list',
        name: 'project-list-rd',
        component: () => import('@/views/ProjectList/ProjectListRD'),
        meta: { title: 'projectList', icon: 'list', roles: ['Engineer'] }
      }
    ]
  },

  // PM Root
  {
    path: '/',
    component: Layout,
    name: 'project-pm',
    redirect: '/project-list',
    meta: {
      title: 'projectList',
      icon: 'el-icon-tickets',
      roles: ['Project Manager', 'Administrator']
    },
    children: [
      {
        path: 'project-list',
        name: 'project-list-pm',
        component: () => import('@/views/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
          icon: 'list',
          roles: ['Project Manager', 'Administrator']
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
      roles: ['Project Manager', 'Administrator', 'Engineer']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/ProjectOverview'),
        meta: { title: 'projectOverview', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/IssueBoards'),
        meta: { title: 'kanban', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'issue-list',
        name: 'issue-list',
        component: () => import('@/views/ProjectIssues'),
        meta: {
          title: 'issueList',
          roles: ['Project Manager', 'Engineer', 'Administrator'],
          rolePage: true
        },
        children: [
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('@/views/ProjectIssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager', 'Engineer', 'Administrator'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'test-case',
        name: 'test-case',
        component: () => import('@/views/TestCase'),
        meta: {
          title: 'createTest',
          roles: ['Engineer', 'Project Manager', 'Administrator'],
          rolePage: true
        },
        children: [
          {
            path: 'test-item/:testCaseId',
            name: 'test-item',
            hidden: true,
            component: () => import('@/views/TestItem'),
            meta: {
              title: 'Test Item',
              roles: ['Engineer', 'Project Manager', 'Administrator'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'activity-log',
        name: 'Activity Log',
        component: () => import('@/views/ProjectActivityLog'),
        meta: { title: 'Activity Log', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'wiki',
        name: 'wiki-list',
        component: () => import('@/views/ProjectWiki'),
        meta: { title: 'wikiList', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'file',
        name: 'file-list',
        component: () => import('@/views/ProjectFiles'),
        meta: { title: 'fileList', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'project-roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/ProjectRoadmap'),
        meta: { title: 'Project Roadmap', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'project-settings',
        name: 'Project Settings',
        component: () => import('@/views/ProjectSettings/index'),
        meta: { title: 'Project Settings', roles: ['Project Manager', 'Administrator'] }
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
        component: () => import('@/views/ProcessDevBranch'),
        meta: { title: 'devBranch', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'git-graph',
        name: 'git-graph',
        component: () => import('@/views/ProjectGraph'),
        meta: { title: 'gitGraph', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'pipelines',
        name: 'Pipelines',
        component: () => import('@/views/ProgressPipelines'),
        meta: { title: 'pipelines', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/ProgressDevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'kubernetes-resources',
        name: 'Kubernetes-resources',
        component: () => import('@/views/ProjectUsage'),
        meta: {
          title: 'kubernetesResources',
          roles: ['Project Manager', 'Administrator', 'Engineer'],
          rolePage: true
        },
        children: [
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/DeploymentList'),
            meta: {
              title: 'Deployment List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'pods-list',
            name: 'Pods List',
            hidden: true,
            component: () => import('@/views/PodsList'),
            meta: {
              title: 'Pods List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: () => import('@/views/ServiceList'),
            meta: {
              title: 'Service List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
            hidden: true,
            component: () => import('@/views/IngressesList'),
            meta: {
              title: 'Ingresses List',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
          }
        ]
      }
    ]
  },

  {
    path: '/test',
    component: Layout,
    name: 'test',
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Engineer', 'Project Manager', 'Administrator']
    },
    redirect: '/test/postman-result',
    children: [
      {
        path: 'postman-result',
        name: 'postman-result',
        component: () => import('@/views/PostmanResult'),
        meta: {
          title: 'postman',
          roles: ['Engineer', 'Project Manager', 'Administrator'],
          rolePage: true
        },
        children: [
          {
            path: 'devops/:id',
            name: 'devops-test-case',
            hidden: true,
            component: () => import('@/views/TestCaseDevOps'),
            meta: {
              title: 'fromDevops',
              roles: ['Engineer', 'Project Manager', 'Administrator'],
              rolePage: false
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
            hidden: true,
            component: () => import('@/views/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Engineer', 'Project Manager', 'Administrator'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'checkmarx',
        name: 'checkmarx',
        component: () => import('@/views/ScanCheckmarx'),
        meta: { title: 'checkMarx', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'web-inspect',
        name: 'web-inspect',
        component: () => import('@/views/ScanWebInspect'),
        meta: { title: 'webInspect', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/ScanSonarQube'),
        meta: { title: 'sonarQube', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/file_list/:rId/:branchName/:projectName',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'fileList',
        props: true,
        component: () => import('@/views/FileList'),
        meta: { title: 'File List', icon: 'tree', roles: ['Engineer'] }
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
        component: () => import('@/views/CommitList'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: '/system-resource/kubernetes',
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Project Manager', 'Administrator']
    },
    children: [

      {
        path: 'plugin-resource',
        name: 'Plugin Resource',
        component: () => import('@/views/PluginResource'),
        meta: { title: 'Plugin Resource', roles: ['Project Manager', 'Administrator', 'Engineer'] }
      },
      {
        path: 'harbor',
        name: 'Harbor',
        hidden: true,
        component: () => import('@/views/ResourceHarbor'),
        meta: {
          title: 'Harbor',
          roles: ['Project Manager', 'Administrator', 'Engineer'],
          rolePage: true
        },
        children: [
          {
            path: 'artifacts',
            name: 'Artifacts',
            hidden: true,
            component: () => import('@/views/ProjectArtifacts'),
            meta: {
              title: 'Artifacts',
              roles: ['Project Manager', 'Administrator', 'Engineer'],
              rolePage: false
            }
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
      roles: ['Project Manager', 'Administrator']
    },
    children: [
      {
        path: 'project-activities',
        name: 'ProjectActivities',
        component: () => import('@/views/ProjectActivities'),
        meta: { title: 'Project Activities', roles: ['Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/admin',
    component: Layout,
    name: 'Admin',
    redirect: '/admin/account-manage',
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'account-manage',
        name: '',
        component: () => import('@/views/UserManage'),
        meta: { title: 'Account Manage', roles: ['Administrator'] }
      },
      {
        path: 'system-activities',
        name: 'SystemActivities',
        component: () => import('@/views/SystemActivities'),
        meta: { title: 'System Activities', roles: ['Administrator'] }
      },
      {
        path: 'system-arguments',
        name: 'System Arguments',
        component: () => import('@/views/SystemArguments'),
        meta: { title: 'System Arguments', roles: ['Administrator'] }
      },
      {
        path: 'validation',
        name: 'validation',
        hidden: true,
        component: () => import('@/views/UserValidation'),
        meta: { title: 'validation', roles: ['Administrator'] }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    meta: { roles: ['Engineer', 'Project Manager', 'Administrator'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Profile'),
        name: 'Profile',
        meta: {
          title: 'Profile',
          icon: 'user',
          noCache: true,
          roles: ['Engineer', 'Project Manager', 'Administrator']
        }
      }
    ]
  },

  {
    path: '/SystemVersion',
    component: Layout,
    redirect: '/SystemVersion/index',
    hidden: true,
    meta: { roles: ['Engineer', 'Project Manager', 'Administrator'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/SystemVersion'),
        name: 'SystemVersion',
        meta: {
          title: 'System Version',
          icon: 'user',
          noCache: true,
          roles: ['Engineer', 'Project Manager', 'Administrator']
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
