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
        component: () => import('../views/Project/Milestone'),
        meta: { title: 'milestone', roles: ['Administrator', 'QA'] }
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
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
          appendRoot: { path: 'issues', position: 'after' }
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: () => import('../views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
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
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Project/Settings/roles/QA'),
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
            component: () => import('@/views/Project/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['Administrator', 'QA', 'Project Manager'] }
          }
        ]
      }
    ]
  },
  {
    path: '/traceability-matrix',
    component: Layout,
    redirect: { name: 'TraceMatrix' },
    meta: {
      title: 'track',
      icon: 'el-icon-s-marketing',
      roles: ['QA', 'Administrator'],
      appendRoot: { path: '/scan', position: 'after' }
    },
    children: [
      {
        path: '',
        name: 'TraceMatrix',
        component: () => import('../views/Track/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['Administrator', 'QA'] }
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
      roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
      appendRoot: { path: '/scan', position: 'before' }
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: () => import('../views/Test/TestFile'),
        meta: {
          title: 'testFile',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('../views/Test/TestPlan'),
            meta: {
              title: 'testPlan', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
            hidden: true,
            component: () => import('../views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
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
          }
        ]
      }
    ]
  }
]
