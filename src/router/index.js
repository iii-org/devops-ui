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

  // {
  //   path: '/my-issues',
  //   component: Layout,
  //   children: [
  //     {
  //       path: '',
  //       name: 'MyIssues',
  //       component: () => import('@/views/MyIssues/index'),
  //       meta: { title: 'My Issues', icon: 'list', roles: ['Engineer'] }
  //     }
  //   ]
  // },

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
    path: '/issues/:issue_num/setup',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/IssueSetUp/index'),
        meta: { title: 'Issue SetUp', roles: ['Engineer'] }
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
        component: () => import('@/views/Profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true, roles: ['Engineer', 'Project Manager', 'Administrator'] }
      }
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
        component: () => import('@/views/ProjectList/index'),
        meta: { title: 'Project List', roles: ['Engineer'] }
      },

      {
        path: 'graph',
        name: 'Project Graph',
        component: () => import('@/views/ProjectGraph/index'),
        meta: { title: 'Project Graph', roles: ['Engineer'] }
      },
      {
        path: 'branches/:bId/:projectName',
        name: 'branches',
        props: true,
        hidden: true,
        component: () => import('@/views/BranchList/index'),
        meta: { title: 'Branches', icon: 'tree', roles: ['Engineer'] }
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
        component: () => import('@/views/FileList/index'),
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
        component: () => import('@/views/CicdPipelines/index'),
        meta: { title: 'CICD Pipelines', icon: 'example', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      }
    ]
  },

  // {
  //   path: '/test',
  //   component: Layout,
  //   name: 'Test',
  //   meta: { title: 'Test', icon: 'el-icon-s-cooperation', roles: ['Engineer'] },
  //   redirect: '/Test/test-ite',
  //   children: [
  //     {
  //       path: 'test-item',
  //       name: 'Test Item',
  //       component: () => import('@/views/TestItem/index'),
  //       meta: { title: 'Test Item', icon: 'list', roles: ['Engineer'] }
  //     },
  //     {
  //       path: 'test-case/:testItemId',
  //       name: 'Test Case',
  //       hidden: true,
  //       component: () => import('@/views/TestCase/index'),
  //       meta: { title: 'Issue Detail', roles: ['Engineer'] }
  //     }
  //   ]
  // },

  // {
  //   path: '/cicd/pipelines/:pipeline_id/stages',
  //   component: Layout,
  //   hidden: true,
  //   meta: { roles: ['Engineer'] },
  //   children: [
  //     {
  //       path: '',
  //       component: () => import('@/views/CicdPipelinesStages/index'),
  //       meta: { title: 'Pipeline Stages', roles: ['Engineer'] }
  //     }
  //   ]
  // },

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
        component: () => import('@/views/CommitList/index'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    name: 'PMProjects',
    redirect: '/list',
    meta: { title: 'Project List', icon: 'el-icon-s-cooperation', roles: ['Project Manager', 'Administrator'] },
    children: [
      {
        path: 'list',
        name: 'PM Project List',
        component: () => import('@/views/ProjectListPM/index'),
        meta: { title: 'PM Project List', icon: 'list', roles: ['Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/project',
    component: Layout,
    name: 'project',
    redirect: '/project/index',
    meta: { title: 'Project', icon: 'el-icon-s-cooperation', roles: ['Project Manager', 'Administrator'] },
    children: [
      {
        path: 'index',
        name: 'Overview',
        component: () => import('@/views/OverviewProject/index'),
        meta: { title: 'Overview', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'current-activity',
        name: 'Current Activity',
        component: () => import('@/views/ProjectCurrentActivity/index'),
        meta: { title: 'Current Activity', roles: ['Project Manager', 'Administrator'] }
      },

      {
        path: 'activity-log',
        name: 'Activity Log',
        component: () => import('@/views/ProjectActivityLog/index'),
        meta: { title: 'Activity Log', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'roadmap',
        name: 'Roadmap',
        component: () => import('@/views/ProjectRoadmap/index'),
        meta: { title: 'Roadmap', roles: ['Project Manager', 'Administrator'] }
      }
    ]
  },
  {
    path: '/project-resource',
    component: Layout,
    name: 'Project Resource',
    meta: { title: 'Project Resource', icon: 'el-icon-s-tools', roles: ['Project Manager', 'Administrator'] },
    children: [
      {
        path: 'usage',
        name: 'Usage',
        component: () => import('@/views/ProjectUsage/index'),
        meta: { title: 'Usage', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'resource',
        name: 'Resource',
        component: () => import('@/views/ProjectResource/index'),
        meta: { title: 'Resource', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'artifacts',
        name: 'Artifacts',
        component: () => import('@/views/ProjectArtifacts/index'),
        meta: { title: 'Artifacts', roles: ['Project Manager', 'Administrator'] }
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
      // {
      //   path: 'project-gantt',
      //   name: 'ProjectGantt',
      //   component: () => import('@/views/ProgressGantt/index'),
      //   meta: { title: 'Project Gantt', roles: ['Project Manager'] }
      // },
      // {
      //   path: 'dev-gantt',
      //   name: 'DevGantt',
      //   component: () => import('@/views/ProgressDevGantt/index'),
      //   meta: { title: 'Dev Gantt', roles: ['Project Manager'] }
      // },
      {
        path: 'dev-branch',
        name: 'DevBranch',
        component: () => import('@/views/ProcessDevBranch/index'),
        meta: { title: 'Dev Branch', roles: ['Project Manager', 'Administrator'] }
      },
      // {
      //   path: 'dev-version',
      //   name: 'DevVersion',
      //   component: () => import('@/views/ProgressDevVersion/index'),
      //   meta: { title: 'Dev Version', roles: ['Project Manager'] }
      // },
      {
        path: 'test-record',
        name: 'TestRecord',
        component: () => import('@/views/ProgressDevVersionTestRecord/index'),
        meta: { title: 'Test Record', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'dev-branch/:branchName/test',
        name: 'DevBranchTest',
        hidden: true,
        component: () => import('@/views/ProcessDevBranchTestResult/index'),
        meta: { title: 'Dev Branch Test Result', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'graph',
        name: 'Project Graph',
        component: () => import('@/views/ProjectGraph/index'),
        meta: { title: 'Project Graph', roles: ['Project Manager'] }
      }
    ]
  },

  {
    path: '/issue',
    component: Layout,
    name: 'Issues',
    meta: { title: 'Issues', icon: 'el-icon-data-analysis', roles: ['Project Manager', 'Engineer', 'Administrator'] },
    redirect: '/issue/wiki',
    children: [
      {
        path: 'wiki',
        name: 'IssueWiki',
        component: () => import('@/views/ProjectWiki/index'),
        meta: { title: 'Wiki', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'list',
        name: 'IssueList',
        component: () => import('@/views/ProjectIssues/index'),
        meta: { title: 'Issue List', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'list/:issueId',
        name: 'IssueDetail',
        hidden: true,
        component: () => import('@/views/ProjectIssueDetail/index'),
        meta: { title: 'Issue Detail', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      },
      {
        path: 'listrd/:issue_num/setup',
        hidden: true,
        component: () => import('@/views/IssueSetUp/index'),
        meta: { title: 'Issue SetUp', roles: ['Engineer'] }
      },
      {
        path: 'file',
        name: 'File',
        component: () => import('@/views/ProjectFiles/index'),
        meta: { title: 'File List', roles: ['Project Manager', 'Engineer', 'Administrator'] }
      }
    ]
  },

  {
    path: '/test',
    component: Layout,
    name: 'Test',
    meta: { title: 'Test', icon: 'el-icon-s-cooperation', roles: ['Engineer', 'Project Manager', 'Administrator'] },
    redirect: '/Test/test-case',
    children: [
      {
        path: 'test-case',
        name: 'Test Case',
        component: () => import('@/views/TestCase/index'),
        meta: { title: 'Test Case', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'test-case/:testCaseId',
        name: 'Test Item',
        hidden: true,
        component: () => import('@/views/TestItem/index'),
        meta: { title: 'Test Item', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'test-case-expert-mode',
        name: 'Test Case Expert Mode',
        component: () => import('@/views/TestCaseExpertMode/index'),
        meta: { title: 'Test Case (Expert)', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      },
      {
        path: 'check-marx',
        name: 'check-marx',
        component: () => import('@/views/CheckMarx/index'),
        meta: { title: 'Check Marx', roles: ['Engineer', 'Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/project_setting',
    component: Layout,
    name: 'Setting',
    meta: { title: 'Setting', icon: 'el-icon-s-tools', roles: ['Project Manager', 'Administrator'] },
    redirect: '/project_setting/members',
    children: [
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/ProjectMembers/index'),
        meta: { title: 'Members', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'versions',
        name: 'Versions',
        component: () => import('@/views/ProjectVersions/index'),
        meta: { title: 'Versions', roles: ['Project Manager', 'Administrator'] }
      },
      {
        path: 'devops',
        name: 'DevOps',
        component: () => import('@/views/ProjectDevOps/index'),
        meta: { title: 'DevOps', roles: ['Project Manager', 'Administrator'] }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    name: 'Admin',
    redirect: '/user_manage',
    meta: { title: 'Admin', icon: 'el-icon-s-tools', roles: ['Administrator'] },
    children: [
      {
        path: 'user_manage',
        name: '',
        component: () => import('@/views/UserManage/index'),
        meta: { title: 'User Manage', roles: ['Administrator'] }
      },
      {
        path: 'validation',
        name: 'validation',
        hidden: true,
        component: () => import('@/views/UserValidation/index'),
        meta: { title: 'validation', roles: ['Administrator'] }
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
        component: () => import('@/views/SystemVersion/index'),
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
