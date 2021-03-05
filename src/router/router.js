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
    component: () => import('@/views/login/index'),
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
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'Dashboard', icon: 'dashboard', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    name: 'PMProjects',
    redirect: '/list',
    meta: {
      title: 'Project List',
      icon: 'el-icon-s-cooperation',
      roles: ['Project Manager', 'Administrator']
    },
    children: [
      {
        path: 'list',
        name: 'PM Project List',
        component: () => import('@/views/ProjectList/ProjectListPM'),
        meta: { title: 'PM Project List', icon: 'list', roles: ['Project Manager', 'Administrator'] }
      }
      // {
      //   path: 'project-settings',
      //   name: 'Project Settings',
      //   component: () => import('@/views/ProjectSettings/index'),
      //   meta: { title: 'Project Settings', icon: 'el-icon-s-operation', roles: ['Project Manager', 'Administrator'] }
      // }
    ]
  },

  {
    path: '/projects',
    component: Layout,
    name: 'Projects',
    meta: { title: 'Projects', icon: 'el-icon-s-cooperation', roles: ['Engineer'] },
    redirect: '/projects/list',
    children: [
      {
        path: 'list',
        name: 'Project List',
        component: () => import('@/views/ProjectList/ProjectListRD'),
        meta: { title: 'Project List', roles: ['Engineer'] }
      },

      {
        path: 'graph',
        name: 'Project Graph',
        component: () => import('@/views/ProjectGraph'),
        meta: { title: 'Project Graph', roles: ['Engineer'] }
      },
      {
        path: 'branches/:bId/:projectName',
        name: 'branches',
        props: true,
        hidden: true,
        component: () => import('@/views/BranchList'),
        meta: { title: 'Branches', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/project',
    component: Layout,
    name: 'project',
    redirect: '/project/index',
    meta: {
      title: 'Project',
      icon: 'el-icon-s-cooperation',
      roles: ['Project Manager', 'Administrator']
    },
    children: [
      {
        path: 'index',
        name: 'Overview',
        component: () => import('@/views/ProjectOverview'),
        meta: { title: 'Overview', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'issue-boards',
        name: 'Issue Boards',
        component: () => import('@/views/IssueBoards'),
        meta: { title: 'Issue Boards', roles: ['Project Manager', 'Administrator'] }
      },

      {
        path: 'activity-log',
        name: 'Activity Log',
        component: () => import('@/views/ProjectActivityLog'),
        meta: { title: 'Activity Log', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'project-roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/ProjectRoadmap'),
        meta: { title: 'Project Roadmap', roles: ['Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/issue',
    component: Layout,
    name: 'Issues',
    meta: { title: 'Issues', icon: 'el-icon-data-analysis', roles: ['Project Manager', 'Engineer', 'Administrator'] },
    redirect: '/issue/list',
    children: [
      {
        path: 'list',
        name: 'IssueList',
        component: () => import('@/views/ProjectIssues'),
        meta: { title: 'Issue List', roles: ['Project Manager', 'Engineer', 'Administrator'], rolePage: true },
        children: [
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: () => import('@/views/ProjectIssueDetail/index'),
            meta: { title: 'Issue Detail', roles: ['Project Manager', 'Engineer', 'Administrator'], rolePage: false }
          }
        ]
      },
      {
        path: 'wiki',
        name: 'IssueWiki',
        component: () => import('@/views/ProjectWiki'),
        meta: { title: 'Wiki', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'listrd/:issue_num/setup',
        hidden: true,
        component: () => import('@/views/IssueSetUp'),
        meta: { title: 'Issue SetUp', roles: ['Engineer'] }
      },
      {
        path: 'file',
        name: 'File',
        component: () => import('@/views/ProjectFiles'),
        meta: { title: 'File List', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'test-case',
        name: 'Test Case',
        component: () => import('@/views/TestCase'),
        meta: { title: 'Test Case', roles: ['Engineer', 'Project Manager', 'Administrator'], rolePage: true },
        children: [
          {
            path: 'test-item/:testCaseId',
            name: 'Test Item',
            hidden: true,
            component: () => import('@/views/TestItem'),
            meta: { title: 'Test Item', roles: ['Engineer', 'Project Manager', 'Administrator'], rolePage: false }
          }
        ]
      }
    ]
  },

  {
    path: '/issues/:issue_num',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/IssueDetail'),
        meta: { title: 'Issue Detail', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/issues/:issue_num/setup',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/IssueSetUp'),
        meta: { title: 'Issue SetUp', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/progress',
    component: Layout,
    name: 'progress',
    redirect: '/progress/dev-branch',
    meta: { title: 'Progress', icon: 'el-icon-odometer', roles: ['Project Manager', 'Administrator'] },
    children: [
      {
        path: 'dev-branch',
        name: 'DevBranch',
        component: () => import('@/views/ProcessDevBranch'),
        meta: { title: 'Dev Branch', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'git-graph',
        name: 'Git Graph',
        component: () => import('@/views/ProjectGraph'),
        meta: { title: 'Git Graph', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'pipelines',
        name: 'Pipelines',
        component: () => import('@/views/ProgressPipelines'),
        meta: { title: 'Pipelines', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'dev-branch/:branchName/test',
        name: 'DevBranchTest',
        hidden: true,
        component: () => import('@/views/ProcessDevBranchTestResult'),
        meta: { title: 'Dev Branch Test Result', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'dev-environment',
        name: 'DevEnvironment',
        component: () => import('@/views/ProgressDevEnvironment'),
        meta: { title: 'Dev Environment', roles: ['Project Manager', 'Administrator'] }
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
    path: '/cicd/pipelines/:bId',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer', 'Project Manager', 'Administrator'] },
    children: [
      {
        path: '',
        name: 'cicdPipelines',
        component: () => import('@/views/CicdPipelines'),
        meta: {
          title: 'CICD Pipelines',
          icon: 'example',
          roles: ['Engineer', 'Project Manager', 'Administrator']
        }
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
    path: '/test',
    component: Layout,
    name: 'Test',
    meta: {
      title: 'Auto Testing',
      icon: 'el-icon-s-cooperation',
      roles: ['Engineer', 'Project Manager', 'Administrator']
    },
    redirect: '/test/postman-result',
    children: [
      {
        path: 'postman-result',
        name: 'Postman result',
        component: () => import('@/views/PostmanResult'),
        meta: { title: 'Postman', roles: ['Engineer', 'Project Manager', 'Administrator'], rolePage: true },
        children: [
          {
            path: 'devops/:id',
            name: 'DevOps Test Case',
            hidden: true,
            component: () => import('@/views/TestCaseDevOps'),
            meta: {
              title: 'DevOps Test Case',
              roles: ['Engineer', 'Project Manager', 'Administrator'],
              rolePage: false
            }
          },
          {
            path: 'postman/:id',
            name: 'Postman Test Case',
            hidden: true,
            component: () => import('@/views/TestCasePostman'),
            meta: {
              title: 'Postman Test Case',
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
        meta: { title: 'CheckMarx', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'web-inspect',
        name: 'web-inspect',
        component: () => import('@/views/ScanWebInspect'),
        meta: { title: 'WebInspect', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: '/system-resource/kubernetes',
    meta: { title: 'System Resource', icon: 'el-icon-pie-chart', roles: ['Project Manager', 'Administrator'] },
    children: [
      {
        path: 'kubernetes',
        name: 'Kubernetes',
        component: () => import('@/views/ProjectUsage'),
        meta: { title: 'Kubernetes', roles: ['Project Manager', 'Administrator'], rolePage: true },
        children: [
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/DeploymentList'),
            meta: { title: 'Deployment List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          },
          {
            path: 'pods-list',
            name: 'Pods List',
            hidden: true,
            component: () => import('@/views/PodsList'),
            meta: { title: 'Pods List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: () => import('@/views/ServiceList'),
            meta: { title: 'Service List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/SecretList'),
            meta: { title: 'Secret List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/ConfigMapsList'),
            meta: { title: 'ConfigMaps List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          },
          {
            path: 'ingress-list',
            name: 'Ingress List',
            hidden: true,
            component: () => import('@/views/IngressList'),
            meta: { title: 'Ingress List', roles: ['Project Manager', 'Administrator'], rolePage: false }
          }
        ]
      },
      {
        path: 'plugin-resource',
        name: 'Plugin Resource',
        component: () => import('@/views/PluginResource'),
        meta: { title: 'Plugin Resource', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'harbor',
        name: 'Harbor',
        hidden: true,
        component: () => import('@/views/ProjectResource'),
        meta: { title: 'Harbor', roles: ['Project Manager', 'Administrator'], rolePage: true },
        children: [
          {
            path: 'artifacts',
            name: 'Artifacts',
            hidden: true,
            component: () => import('@/views/ProjectArtifacts'),
            meta: { title: 'Artifacts', roles: ['Project Manager', 'Administrator'], rolePage: false }
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
    meta: { title: 'Activities', icon: 'el-icon-s-order', roles: ['Project Manager', 'Administrator'] },
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
    path: '/project-settings',
    component: Layout,
    name: 'Settings',
    meta: { title: 'Settings', icon: 'el-icon-s-tools', roles: ['Project Manager', 'Administrator'] },
    redirect: '/project-settings/members',
    children: [
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/ProjectMembers'),
        meta: { title: 'Members', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'versions',
        name: 'Versions',
        component: () => import('@/views/ProjectVersions'),
        meta: { title: 'Versions', roles: ['Project Manager', 'Administrator'] }
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
        path: 'system-secrets',
        name: 'System Secrets',
        component: () => import('@/views/SystemSecrets'),
        meta: { title: 'System Secrets', roles: ['Administrator'] }
      },
      {
        path: 'system-registry',
        name: 'System Registry',
        component: () => import('@/views/SystemRegistry'),
        meta: { title: 'System Registry', roles: ['Administrator'] }
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
