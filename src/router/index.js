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
    path: '/my-issues',
    component: Layout,
    children: [
      {
        path: '',
        name: 'MyIssues',
        component: () => import('@/views/MyIssues/index'),
        meta: { title: 'My Issues', icon: 'list', roles: ['Engineer'] }
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
        component: () => import('@/views/IssueDetail/index'),
        meta: { title: 'Issue Detail', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true, roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/projects',
    component: Layout,
    name: 'Projects',
    meta: { title: 'Projects', icon: 'el-icon-s-cooperation', roles: ['Engineer'] },
    children: [
      {
        path: 'list',
        name: 'Project List',
        component: () => import('@/views/ProjectList/index'),
        meta: { title: 'Project List', icon: 'list', roles: ['Engineer'] }
      },

      {
        path: 'graph',
        name: 'Project Graph',
        component: () => import('@/views/ProjectGraph/index'),
        meta: { title: 'Project Graph', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/branches/:pId',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'branches',
        props: true,
        component: () => import('@/views/BranchList/index'),
        meta: { title: 'Branches', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/file_list/:bId',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'fileList',
        props: true,
        component: () => import('@/views/FileList/index'),
        meta: { title: 'File List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/cicd',
    component: Layout,
    redirect: '/cicd/pipelines',
    name: 'CICD',
    meta: { title: 'Pipelines', icon: 'el-icon-s-cooperation', roles: ['Engineer'] },
    children: [
      {
        path: 'pipelines',
        name: 'Pipelines',
        component: () => import('@/views/CicdPipelines/index'),
        meta: { title: 'Pipelines', icon: 'example', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/cicd/pipelines/:pipeline_id/stages',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/CicdPipelinesStages/index'),
        meta: { title: 'Pipeline Stages', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/commit_list/:bId',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'commitList',
        props: true,
        component: () => import('@/views/CommitList/index'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    name: 'PMProjects',
    meta: { title: 'Project List', icon: 'el-icon-s-cooperation', roles: ['pm'] },
    children: [
      {
        path: 'list',
        name: 'PM Project List',
        component: () => import('@/views/ProjectList/index'),
        meta: { title: 'PM Project List', icon: 'list', roles: ['pm'] }
      },
    ]
  },

  {
    path: '/overview',
    component: Layout,
    name: 'overview',
    meta: { title: 'Overview', icon: 'el-icon-s-cooperation', roles: ['pm'] },
    children: [
      {
        path: 'index',
        name: 'Overview',
        component: () => import('@/views/OverviewProject/index'),
        meta: { title: 'Overview', icon: 'dashboard', roles: ['pm'] }
      },
      {
        path: 'current-activity',
        name: 'Current Activity',
        component: () => import('@/views/ProjectCurrentActivity/index'),
        meta: { title: 'Current Activity', icon: 'list', roles: ['pm'] }
      },

      {
        path: 'activity-log',
        name: 'Activity Log',
        component: () => import('@/views/ProjectActivityLog/index'),
        meta: { title: 'Activity Log', icon: 'list', roles: ['pm'] }
      },
      {
        path: 'roadmap',
        name: 'Roadmap',
        component: () => import('@/views/ProjectRoadmap/index'),
        meta: { title: 'Roadmap', icon: 'el-icon-discover', roles: ['pm'] }
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
