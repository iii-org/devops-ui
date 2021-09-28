import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'

export const asyncRoutes = [
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
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        redirect: '/project/issues',
        component: parentBlank,
        meta: {
          title: 'issueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
          appendRoot: { path: 'issue-boards', position: 'after', replace: true }
        },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('../views/Project/IssueList'),
            meta: { roles: ['QA'] }
          },
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: { roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
            hidden: true,
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
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
          roles: ['QA'],
          appendRoot: { path: 'issues', position: 'after' }
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: () => import('../views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['QA'],
          appendRoot: { path: 'track', position: 'after' }
        }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['QA'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Plan/Settings/roles/QA'),
                meta: { roles: ['QA'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['QA'] }
          }
        ]
      }
    ]
  },
  // {
  //   path: '/traceability-matrix',
  //   component: Layout,
  //   redirect: { name: 'TraceMatrix' },
  //   meta: {
  //     title: 'track',
  //     icon: 'el-icon-s-marketing',
  //     roles: ['Administrator', 'QA', 'Project Manager'],
  //     appendRoot: { path: '/scan', position: 'after' }
  //   },
  //   children: [
  //     {
  //       path: '',
  //       name: 'TraceMatrix',
  //       component: () => import('../../../Plan/TraceabilityMatrix'),
  //       meta: { title: 'traceabilityMatrix', roles: ['Administrator', 'QA', 'Project Manager'] }
  //     }
  //   ]
  // },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'test-report',
      icon: 'el-icon-finished',
      roles: ['QA'],
      appendRoot: { path: '/scan', position: 'before' }
    },
    children: [
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('../views/Test/TestPlan'),
            meta: {
              title: 'test-case', roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
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
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'test-report/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: '/release-version',
        redirect: { name: 'release-version' },
        component: parentBlank,
        meta: { title: 'test-result', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['QA']
            }
          },
          {
            path: '/release-version/:issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
            }
          }
        ]
      }
    ]
  }
]
