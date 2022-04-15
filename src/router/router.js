import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'
import ParentBlank from '@/layout/components/parentBlank'
// import pmRoute from './pm'
// import adRoute from './ad'
// import rdRoute from './rd'
// import qaRoute from './qa'
// import allRoutes from './all'

/**
 * @summary route naming rules
 * 1. Upper Camel case if component and name, ex. UpperCamelCase
 * 2. Lower Camel case if other conditions ex. lowerCamelCase
 */

/* TODO: 1. i18n and title
  2. name the same as path
  3. component
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

// export const asyncRoutes = allRoutes

// export const asyncRoutes = (role) => {
//   if (role === 'QA') return qaRoute
//   else if (role === 'Administrator') return adRoute
//   else if (role === 'Engineer') return rdRoute
//   else if (role === 'Project Manager') return pmRoute
// }

export const asyncRoutes = [
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
    redirect: '/overview',
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
    redirect: '/overview/dashboard',
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
    path: '/project/:projectName?/',
    component: Layout,
    redirect: { name: 'Milstone' },
    meta: {
      title: 'SingleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA']
    },
    children: [
      {
        path: 'milestone',
        name: 'Milstone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'Milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
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
        meta: { title: 'ProjectSettings', roles: ['QA'] },
        children: [
          {
            path: '',
            component: ParentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'ProjectSettings',
                component: () => import('@/views/Plan/Settings/roles/QA'),
                meta: { roles: ['QA'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'ParticipateProject', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'IssueTransfer', roles: ['QA'] }
          }
        ]
      }
    ]
  },
  {
    path: '/test/:projectName?/',
    name: 'Test',
    component: Layout,
    redirect: { name: 'TestPlan' },
    meta: {
      title: 'TestReport',
      icon: 'el-icon-finished',
      roles: ['QA']
    },
    children: [
      {
        path: 'testPlan',
        redirect: '/test/testPlan',
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
    redirect: '/overview/dashboard',
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
    name: 'MyWork',
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
    path: '/projectList',
    component: Layout,
    name: 'ProjectList',
    redirect: { name: 'ProjectList' },
    meta: {
      icon: 'list',
      roles: ['Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: { title: 'ProjectList', roles: ['Project Manager'] }
      },
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: { title: 'ProjectList', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/plan/:projectName?/',
    component: Layout,
    name: 'ProjectManagement',
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
        redirect: { name: 'ProjectSettings' },
        meta: { title: 'ProjectSettings', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            hidden: true,
            path: '',
            name: 'ProjectSettings',
            component: () => import('@/views/Plan/Settings/index'),
            meta: { roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'participateProject/:user_id',
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
    path: '/project/:projectName?/',
    component: Layout,
    name: 'Works',
    redirect: { name: 'Overview' },
    meta: {
      title: 'Works',
      icon: 'el-icon-s-cooperation',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'Kanban', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
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
        name: 'ReleaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: ParentBlank,
        meta: { title: 'ReleaseVersion', roles: ['Administrator', 'Project Manager', 'Engineer'] },
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
        redirect: { name: 'Deploy' },
        name: 'RemoteDeploy',
        component: ParentBlank,
        meta: { title: 'Deploy', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Deploy',
            component: () => import('@/views/Project/Deploy'),
            meta: {
              title: 'Deploy',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          }
        ]
      }
    ]
  },

  {
    path: '/progress/:projectName?/',
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
        name: 'PiplelineInfo',
        meta: { title: 'Pipelines', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
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
      },
      {
        path: 'kubernetesResources',
        component: ParentBlank,
        name: 'KubernetesResources',
        meta: {
          title: 'KubernetesResources',
          roles: ['Administrator', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'KubernetesResources',
            component: () => import('@/views/Progress/KubernetesResources'),
            hidden: true
          },
          {
            path: 'podsList',
            hidden: true,
            component: ParentBlank,
            name: 'PodDetails',
            meta: { title: 'PodsList', roles: ['Administrator', 'Project Manager', 'Engineer'] },
            children: [
              {
                path: '',
                name: 'PodsList',
                hidden: true,
                component: () => import('@/views/Progress/KubernetesResources/components/PodsList')
              },
              {
                path: 'podExecuteShell',
                name: 'PodExecuteShell',
                hidden: true,
                component: () =>
                  import('@/views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'Pod Execute Shell', roles: ['Administrator', 'Project Manager', 'Engineer'] }
              }
            ]
          },
          {
            path: 'serviceList',
            name: 'ServiceList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ServiceList'),
            meta: {
              title: 'ServiceList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'SecretList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMapsList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'DeploymentList',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'ingressesList',
            name: 'IngressesList',
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
    path: '/commitList/:rId/:branchName/:projectName',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'CommitList',
        props: true,
        component: () => import('@/views/Progress/CommitList'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/test/:projectName?/',
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
        path: 'testPlan',
        redirect: '/test/testPlan',
        name: 'TestPlan',
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
    path: '/scan/:projectName?/',
    component: Layout,
    name: 'Scan',
    alwaysShow: true,
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
        name: 'Webinspect',
        component: ParentBlank,
        redirect: { name: 'Webinspect' },
        meta: { title: 'WebInspect', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'WebinspectScans',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scan_id',
            name: 'WebinspectReport',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'WebInspectReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'Postman',
        component: ParentBlank,
        redirect: { name: 'PostmanTest' },
        meta: {
          title: 'Postman',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'PostmanTest',
            hidden: true,
            component: () => import('@/views/Scan/Postman')
          },
          {
            path: 'devops/:id',
            name: '',
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
    path: '/projectActivities/:projectName?',
    component: Layout,
    name: 'ProjectActivities',
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
        meta: { title: 'ProjectActivities', roles: ['Administrator', 'Project Manager'] }
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
        component: ParentBlank,
        meta: { title: 'AccountManage', roles: ['Administrator'] },
        children: [
          {
            path: '',
            component: ParentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'AccountManage',
                component: () => import('@/views/SystemSettings/AccountManage'),
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participateProject/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'ParticipateProject', roles: ['Administrator'] }
              }
            ]
          }
        ]
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
    name: 'SystemVersion',
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

export default router
