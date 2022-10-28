import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import store from '@/store'
import Layout from '@/layout'
import ParentBlank from '@/layout/components/parentBlank'
import pmRoute from './pm.json'
import adRoute from './ad.json'
import rdRoute from './rd.json'
import qaRoute from './qa.json'

/**
 * @summary route naming rules
 * 1. Upper Camel case if component and name, ex. UpperCamelCase
 * 2. Lower Camel case if other conditions ex. lowerCamelCase
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

export const asyncRoutes = (role) => {
  if (role === 'QA') return qaRoute
  else if (role === 'Administrator') return adRoute
  else if (role === 'Engineer') return rdRoute
  else if (role === 'Project Manager') return pmRoute
}

export const allRoutes = [
  {
    path: '/',
    redirect: { name: 'MyWork' },
    meta: {
      roles: ['Engineer', 'Project Manager']
    },
    hidden: true
  },
  {
    path: '/',
    redirect: { name: 'Dashboard' },
    meta: {
      roles: ['Administrator']
    },
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: { name: 'Dashboards' },
    meta: {
      icon: 'list',
      title: 'Overview',
      roles: ['QA']
    },
    hidden: true
  },

  // QA

  {
    path: '/overview',
    component: Layout,
    name: 'Dashboards',
    redirect: { name: 'Dashboard' },
    meta: {
      icon: 'dashboard',
      title: 'Overview',
      roles: ['QA']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'Dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListQA'),
        meta: {
          title: 'ProjectList',
          roles: ['QA']
        }
      }
    ]
  },
  {
    path: '/project/:projectName?',
    component: Layout,
    name: 'Works',
    redirect: { name: 'Milstone' },
    meta: {
      title: 'SingleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA']
    },
    children: [
      {
        path: 'whiteboard',
        name: 'whiteboard',
        component: () => import('@/views/WhiteBoard'),
        meta: { title: 'whiteboard', roles: ['QA'] }
      },
      {
        path: 'milestone',
        name: 'Milstone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'Milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
        name: 'IssueLists',
        redirect: { name: 'IssueList' },
        meta: {
          title: 'IssueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'IssueList',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
              // rolePage: false,
              // subject: ''
            }
          }
        ]
      },
      {
        path: 'track',
        name: 'Track',
        component: () => import('@/views/Project/TrackManagement'),
        meta: {
          title: 'ChangeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exceptionManagement',
        name: 'ExceptionManagement',
        component: () => import('@/views/Project/ExceptionManagement'),
        meta: {
          title: 'FailManagement',
          roles: ['QA']
        }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'TraceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'projectSettings',
        component: ParentBlank,
        name: 'ProjectSettings',
        redirect: { name: 'ProjectSetting' },
        meta: { title: 'ProjectSettings', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'ProjectSetting',
            hidden: true,
            component: () => import('@/views/Plan/Settings/roles/QA'),
            meta: { roles: ['QA'] }
          },
          {
            path: 'participateProject/:userId',
            name: 'ParticipateProject',
            hidden: true,
            component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
            meta: { title: 'ParticipateProject', roles: ['QA'] }
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'IssueTransfer', roles: ['QA'] }
          }
          // {
          //   path: '',
          //   component: ParentBlank,
          //   name: 'ProjectSetting',
          //   hidden: true,
          //   children: [
          //     {
          //       path: '',
          //       name: 'Setting',
          //       component: () => import('@/views/Plan/Settings/roles/QA'),
          //       meta: { roles: ['QA'] }
          //     },
          //     {
          //       path: 'participateProject/:userId',
          //       name: 'ParticipateProject',
          //       hidden: true,
          //       component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
          //       meta: { title: 'ParticipateProject', roles: ['QA'] }
          //     },
          //     {
          //       path: 'issueTransfer/:userId',
          //       name: 'IssueTransfer',
          //       hidden: true,
          //       component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
          //       meta: { title: 'IssueTransfer', roles: ['QA'] }
          //     }
          //   ]
          // }
        ]
      }
    ]
  },
  {
    path: '/test/:projectName?/',
    name: 'Test',
    component: Layout,
    redirect: { name: 'TestPlans' },
    meta: {
      title: 'TestReport',
      icon: 'el-icon-finished',
      roles: ['QA']
    },
    children: [
      {
        path: 'testPlan',
        redirect: { name: 'TestPlan' },
        name: 'TestPlans',
        component: ParentBlank,
        meta: {
          roles: ['QA']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'TestCase',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['QA']
              // rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'TestPlanDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
              // rolePage: false
            }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'TestReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        name: 'ReleaseVersions',
        component: ParentBlank,
        meta: { title: 'TestResult', roles: ['QA'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['QA']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'IssueDetail',
              roles: ['QA']
              // rolePage: false
            }
          }
        ]
      }
    ]
  },

  // other

  {
    path: '/overview',
    component: Layout,
    name: 'Overviews',
    redirect: { name: 'Dashboard' },
    meta: {
      icon: 'dashboard',
      title: 'Overview',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'Dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'ProjectList',
          roles: ['Administrator']
        }
      }
    ]
  },
  {
    path: '/myWork/:projectName?',
    component: Layout,
    name: 'MyWorks',
    redirect: { name: 'MyWork' },
    meta: {
      icon: 'el-icon-s-home',
      roles: ['Project Manager', 'Engineer']
    },
    children: [
      {
        path: '',
        name: 'MyWork',
        component: () => import('@/views/MyWork'),
        meta: {
          title: 'MyWork',
          roles: ['Project Manager', 'Engineer']
        }
      }
    ]
  },
  {
    path: '/inbox',
    component: Layout,
    name: 'Inboxs',
    redirect: { name: 'Inbox' },
    meta: {
      title: 'Inbox',
      icon: 'el-icon-message',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Inbox'),
        name: 'Inbox',
        meta: {
          title: 'Inbox',
          roles: ['Administrator', 'Project Manager']
        }
      },
      {
        path: 'message-console',
        name: 'MessageConsole',
        hidden: true,
        component: () => import('@/views/Inbox/MessageConsole'),
        meta: {
          title: 'Message Console',
          roles: ['Administrator']
        }
      }
    ]
  },
  {
    path: '/projectList',
    component: Layout,
    name: 'ProjectLists',
    redirect: { name: 'ProjectList' },
    meta: {
      icon: 'list',
      roles: ['Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'ProjectList',
          roles: ['Project Manager']
        }
      },
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: {
          title: 'ProjectList',
          roles: ['Engineer']
        }
      }
    ]
  },
  {
    path: '/plan/:projectName?',
    component: Layout,
    name: 'Management',
    redirect: { name: 'Overview' },
    meta: {
      title: 'ProjectManagement',
      icon: 'el-icon-edit-outline',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Plan/Overview'),
        meta: { title: 'ProjectOverview', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'milestone',
        name: 'Milstone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'Milestone', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'TraceabilityMatrix', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'projectSettings',
        component: ParentBlank,
        name: 'ProjectSettings',
        redirect: { name: 'ProjectSetting' },
        meta: { title: 'ProjectSettings', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            hidden: true,
            path: '',
            name: 'ProjectSetting',
            component: () => import('@/views/Plan/Settings/index'),
            meta: { roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'participateProject/:userId',
            name: 'ParticipateProject',
            hidden: true,
            component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
            meta: { title: 'ParticipateProject', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'advanceBranchSettings',
            name: 'AdvanceBranchSettings',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'AdvanceBranchSettings', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/ProjectIssueTransfer'),
            meta: { title: 'IssueTransfer', roles: ['Administrator', 'Project Manager'] }
          }
        ]
      }
    ]
  },
  {
    path: '/project/:projectName?',
    component: Layout,
    name: 'Works',
    redirect: { name: 'IssueBoards' },
    meta: {
      title: 'Works',
      icon: 'el-icon-s-cooperation',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'whiteboard',
        name: 'whiteboard',
        component: () => import('@/views/WhiteBoard'),
        meta: { title: 'whiteboard', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'Kanban', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
        name: 'IssueLists',
        redirect: { name: 'IssueList' },
        meta: { title: 'IssueList' },
        children: [
          {
            path: '',
            name: 'IssueList',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: {
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'IssueDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'Project Manager', 'Engineer']
              // rolePage: false,
              // subject: ''
            }
          }
        ]
      },
      {
        path: 'notes',
        name: 'WikiList',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'WikiList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'files',
        name: 'FileList',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'FileList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'ProjectRoadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'ProjectRoadmap', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'releaseVersion',
        name: 'ReleaseVersions',
        redirect: { name: 'ReleaseVersion' },
        component: ParentBlank,
        meta: { title: 'ReleaseVersions', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'ReleaseVersion',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueTag',
            name: 'ClosedIssueList',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'Project Manager', 'Engineer']
              // rolePage: false
            }
          }
        ]
      },
      {
        path: 'deploy',
        name: 'Deploy',
        component: () => import('@/views/Project/Deploy'),
        meta: { title: 'Deploy', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/progress/:projectName?',
    component: Layout,
    name: 'Progress',
    redirect: { name: 'DevEnvironment' },
    meta: {
      title: 'DevProgress',
      icon: 'el-icon-odometer',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'devBranch',
        name: 'DevBranch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'DevBranch', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      // {
      //   path: 'GitGraph',
      //   name: 'GitGraph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'GitGraph', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      // },
      {
        path: 'pipelines',
        component: ParentBlank,
        name: 'Pipelines',
        redirect: { name: 'Pipeline' },
        meta: { title: 'Pipelines', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Pipeline',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines'),
            meta: { roles: ['Administrator', 'Project Manager', 'Engineer'] }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'TestReport', roles: ['Administrator', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'devEnvironment',
        name: 'DevEnvironment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'DevEnvironment', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  // {
  //   path: '/commitList/:rId/:branchName/:projectName',
  //   component: Layout,
  //   hidden: true,
  //   meta: { roles: ['Engineer'] },
  //   children: [
  //     {
  //       path: '',
  //       name: 'CommitList',
  //       props: true,
  //       component: () => import('@/views/Progress/CommitList'),
  //       meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
  //     }
  //   ]
  // },
  {
    path: '/test/:projectName?',
    name: 'Test',
    component: Layout,
    redirect: { name: 'TestPlan' },
    meta: {
      title: 'TestManagement',
      icon: 'el-icon-finished',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'testFile',
        name: 'TestFile',
        component: () => import('@/views/Test/TestFile'),
        meta: {
          title: 'TestFile',
          roles: ['Administrator', 'Project Manager', 'Engineer']
        }
      },
      {
        path: 'testPlans',
        redirect: { name: 'TestPlan' },
        name: 'TestPlans',
        component: ParentBlank,
        meta: {
          roles: ['Administrator', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'TestPlan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'TestPlan',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'Project Manager', 'Engineer']
              // rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'TestPlanDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'IssueDetail',
              roles: ['Administrator', 'Project Manager', 'Engineer']
              // rolePage: false
            }
          }
        ]
      }
    ]
  },
  {
    path: '/scan/:projectName?',
    component: Layout,
    name: 'Scan',
    // alwaysShow: true,
    meta: {
      title: 'AutoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'SonarQube', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'checkmarx',
        name: 'Checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'CheckMarx', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'Zap', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'Cmas', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspects',
        component: ParentBlank,
        redirect: { name: 'Webinspect' },
        meta: { title: 'WebInspect', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Webinspect',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scanId',
            name: 'WebinspectReport',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'WebInspectReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'postmans',
        name: 'Postmans',
        component: ParentBlank,
        redirect: { name: 'Postman' },
        meta: {
          title: 'Postman',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'Postman',
            hidden: true,
            component: () => import('@/views/Scan/Postman')
          },
          {
            path: 'devops/:id',
            name: 'DevopsTestCase',
            hidden: true,
            component: () => import('@/views/Scan/TestCaseDevOps'),
            meta: {
              title: 'FromDevops',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'FromCollection',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'Sideex', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/systemResource',
    component: Layout,
    name: 'SystemResource',
    redirect: { name: 'PluginResource' },
    meta: {
      title: 'SystemResource',
      icon: 'el-icon-pie-chart',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: ':projectName?/pluginResource',
        component: ParentBlank,
        name: 'PluginResources',
        redirect: { name: 'PluginResource' },
        meta: { title: 'PluginResource', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            name: 'PluginResource',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource')
          },
          {
            path: 'harbor',
            hidden: true,
            component: ParentBlank,
            name: 'Harbors',
            redirect: { name: 'Harbor' },
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
                path: ':rName/artifacts',
                name: 'Artifacts',
                hidden: true,
                component: () => import('@/views/SystemResource/Harbor/components/ProjectArtifacts'),
                meta: {
                  title: 'Artifacts',
                  roles: ['Administrator', 'Project Manager']
                }
              }
            ]
          },
          {
            path: 'podsLists',
            hidden: true,
            component: ParentBlank,
            name: 'PodsLists',
            redirect: { name: 'PodsList' },
            meta: { title: 'PodsLists', roles: ['Administrator', 'Project Manager', 'Engineer'] },
            children: [
              {
                path: '',
                name: 'PodsList',
                hidden: true,
                component: () => import('@/views/SystemResource/PluginResource/components/PodsList')
              },
              {
                path: 'podExecuteShell',
                name: 'PodExecuteShell',
                hidden: true,
                component: () =>
                  import('@/views/SystemResource/PluginResource/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'PodExecuteShell', roles: ['Administrator', 'Project Manager', 'Engineer'] }
              }
            ]
          },
          {
            path: 'serviceList',
            name: 'ServiceList',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource/components/ServiceList'),
            meta: {
              title: 'ServiceList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource/components/SecretList'),
            meta: {
              title: 'SecretList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMapsList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource/components/DeploymentList'),
            meta: {
              title: 'DeploymentList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'ingressesList',
            name: 'IngressesList',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource/components/IngressesList'),
            meta: {
              title: 'IngressesList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          }
        ]
      },
      {
        path: 'serviceMonitoring',
        name: 'ServiceMonitoring',
        component: () => import('@/views/SystemResource/ServiceMonitoring'),
        meta: { title: 'ServiceMonitoring', roles: ['Administrator', 'Project Manager'] }
      }
    ]
  },

  {
    path: '/activities/:projectName?',
    component: Layout,
    name: 'Activities',
    redirect: { name: 'Activities' },
    meta: {
      title: 'Activities',
      icon: 'el-icon-s-order',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'deploy',
        name: 'deploy',
        component: () => import('@/views/Project/Deploy'),
        meta: { title: 'deploy', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'template-manage',
        name: 'Template Manage',
        component: () => import('@/views/Activities/TemplateManage'),
        meta: { title: 'Template Manage', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'project-activities',
        name: 'Project Activities',
        component: () => import('@/views/Activities/ProjectActivities'),
        meta: { title: 'Project Activities', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/systemSettings',
    component: Layout,
    name: 'Admin',
    redirect: { name: 'AccountManage' },
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'accountManage',
        component: () => import('@/views/SystemSettings/AccountManage'),
        name: 'AccountManage',
        meta: { title: 'AccountManage', roles: ['Administrator'] }
        // children: [
        //   {
        //     path: 'participateProject/:userId',
        //     name: 'ParticipateProject',
        //     hidden: true,
        //     component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
        //     meta: { title: 'ParticipateProject', roles: ['Administrator'] }
        //   }
        // ]
      },
      {
        path: 'systemActivities',
        name: 'SystemActivities',
        component: () => import('@/views/SystemSettings/SystemActivities'),
        meta: { title: 'SystemActivities', roles: ['Administrator'] }
      },
      {
        path: 'systemArguments',
        name: 'SystemArguments',
        component: () => import('@/views/SystemSettings/SystemArguments'),
        meta: { title: 'SystemArguments', roles: ['Administrator'] }
      },
      {
        path: 'systemDeploySettings',
        name: 'SystemDeploySettings',
        component: () => import('@/views/SystemSettings/SystemDeploySettings'),
        meta: { title: 'SystemDeploySettings', roles: ['Administrator'] }
      },
      {
        path: 'subAdminProjects',
        name: 'SubAdminProjects',
        component: () => import('@/views/SystemSettings/SubAdminProjects'),
        meta: { title: 'ProjectSettingsQA', roles: ['Administrator'] }
      },
      {
        path: 'systemPluginManage',
        name: 'SystemPluginManage',
        component: () => import('@/views/SystemSettings/SystemPluginManage'),
        meta: { title: 'SystemPluginManage', roles: ['Administrator'] }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
    name: 'UserProfile',
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
          // noCache: true,
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        }
      }
    ]
  },
  {
    path: '/SystemVersion',
    component: Layout,
    name: 'SystemVersions',
    redirect: { name: 'SystemVersion' },
    hidden: true,
    meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        component: () => import('@/views/SystemVersion'),
        name: 'SystemVersion',
        meta: {
          title: 'SystemVersion',
          icon: 'user',
          // noCache: true,
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

export async function loadRouter() {
  const accessRoutes = await store.dispatch('permission/generateRoutes', store.getters.userRole)
  router.addRoutes(accessRoutes)
}

export function reloadRouter() {
  resetRouter()
  loadRouter()
}

export default router
