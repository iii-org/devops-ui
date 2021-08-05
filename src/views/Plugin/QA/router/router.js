import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'

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
    name: '404',
    hidden: true
  }
]

export const asyncRoutes = [
  // {
  //   path: '/',
  //   component: Layout,
  //   name: 'dashboard-admin',
  //   redirect: '/dashboard',
  //   meta: {
  //     title: 'projectList',
  //     icon: 'el-icon-s-cooperation',
  //     roles: ['Administrator']
  //   },
  //   children: [
  //     {
  //       path: '/dashboard',
  //       name: 'dashboard',
  //       component: () => import('../views/Dashboard/roles/QA'),
  //       meta: {
  //         title: 'dashboard',
  //         icon: 'dashboard',
  //         roles: ['Administrator']
  //       }
  //     }
  //   ]
  // },
  {
    path: '/',
    component: Layout,
    redirect: '/project-list',
    meta: {
      icon: 'list',
      title: 'overview',
      roles: ['QA'],
      appendRoot: { path: '/', position: 'after' }
    },
    hidden: true
  },
  {
    path: '/project-list',
    component: Layout,
    redirect: '/project-list',
    meta: {
      icon: 'list',
      title: 'overview',
      roles: ['QA'],
      appendRoot: { path: '/', position: 'after' }
    },
    children: [
      {
        path: '',
        name: 'project-list-qa',
        component: () => import('../views/ProjectList/ProjectListQA'),
        meta: {
          title: 'projectList',
          roles: ['QA']
        }
      }
    ]
  },
  {
    path: '/project',
    component: Layout,
    redirect: '/project/milestone',
    meta: {
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA'],
      appendRoot: { path: '/project-list', position: 'after' }
    },
    children: [
      {
        path: 'milestone',
        name: 'milestone',
        component: () => import('../views/Project/Milestone'),
        meta: { title: 'milestone', roles: ['QA', 'Administrator'] }
      },
      {
        path: 'issues',
        redirect: '/project/issues',
        component: parentBlank,
        meta: {
          title: 'issueList',
          roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
          appendRoot: { path: 'issue-boards', position: 'after' }
        },
        children: [
          {
            path: '',
            name: 'issue-list',
            component: () => import('../views/Project/IssueList'),
            meta: {
              title: 'issueList',
              roles: ['QA']
            }
          },
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
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
              rolePage: false,
              subject: ''
            }
          }
        ]
      },
      {
        path: 'track',
        name: 'track',
        component: () => import('../views/Project/TrackManagement'),
        meta: {
          title: 'changeManagement',
          roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
          appendRoot: { path: 'issues', position: 'after' }
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: () => import('../views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
          appendRoot: { path: 'track', position: 'after' }
        }
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'Project Settings',
            hidden: true,
            component: () => import('@/views/Project/Settings/roles/QA')
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Project/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['QA', 'Project Manager', 'Administrator'] }
          }
        ]
      },
      {
        path: 'participate-project/:user_id',
        name: 'ParticipateProject',
        hidden: true,
        component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
        meta: { title: 'Participate Project', roles: ['QA', 'Administrator'] }
      }
    ]
  },
  {
    path: '/traceability-matrix',
    component: Layout,
    redirect: '/traceability-matrix',
    meta: {
      title: 'track',
      icon: 'el-icon-s-marketing',
      meta: { title: 'track', roles: ['QA', 'Administrator'] },
      appendRoot: { path: '/scan', position: 'after' }
    },
    children: [
      {
        path: '',
        name: 'traceability-matrix',
        component: () => import('../views/Track/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['QA', 'Administrator'] }
      }
    ]
  },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
      appendRoot: { path: '/scan', position: 'before' }
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: () => import('../views/Test/TestFile'),
        meta: {
          title: 'testFile',
          roles: ['Project Manager', 'Engineer', 'QA', 'Administrator']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['Project Manager', 'Engineer', 'QA', 'Administrator']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('../views/Test/TestPlan'),
            meta: {
              title: 'testPlan', roles: ['Project Manager', 'Engineer', 'QA', 'Administrator']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
              rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'test-plan-detail',
            hidden: true,
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Project Manager', 'Engineer', 'QA', 'Administrator'],
              rolePage: false
            }
          }
        ]
      }
    ]
  }
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
