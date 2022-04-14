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
      title: 'overview',
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
      title: 'overview',
      roles: ['QA']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListQA'),
        meta: {
          title: 'projectList',
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
      title: 'singleProject',
      icon: 'el-icon-data-analysis',
      roles: ['QA']
    },
    children: [
      {
        path: 'milestone',
        name: 'Milstone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
        redirect: { name: 'IssueList' },
        meta: {
          title: 'issueList',
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
        name: 'Track',
        component: () => import('@/views/Project/TrackManagement'),
        meta: {
          title: 'changeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exceptionManagement',
        name: 'ExceptionManagement',
        component: () => import('@/views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['QA']
        }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['QA'] }
      },
      {
        path: 'projectSettings',
        component: ParentBlank,
        meta: { title: 'Project Settings', roles: ['QA'] },
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
                meta: { title: 'Participate Project', roles: ['QA'] }
              }
            ]
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['QA'] }
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
      title: 'test-report',
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
              title: 'test-case',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'TestPlanDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: 'testReport/:commitId',
            name: 'TestReport',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines/components/TestReport'),
            meta: { title: 'testReport', roles: ['QA'] }
          }
        ]
      },
      {
        path: 'releaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: ParentBlank,
        meta: { title: 'test-result', roles: ['QA'] },
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
              title: 'Issue Detail',
              roles: ['QA'],
              rolePage: false
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
      title: 'overview',
      roles: ['Administrator']
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'projectList',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
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
          title: 'myWork',
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
        meta: { title: 'projectList', roles: ['Project Manager'] }
      },
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: { title: 'projectList', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/plan/:projectName?/',
    component: Layout,
    name: 'ProjectManagement',
    redirect: { name: 'Overview' },
    meta: {
      title: 'project-management',
      icon: 'el-icon-edit-outline',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Plan/Overview'),
        meta: { title: 'projectOverview', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'milestone',
        name: 'Milstone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'traceabilityMatrix',
        name: 'TraceabilityMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'projectSettings',
        component: ParentBlank,
        name: 'ProjectSettings',
        redirect: { name: 'ProjectSettings' },
        meta: { title: 'Project Settings', roles: ['Administrator', 'Project Manager'] },
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
            meta: { title: 'Participate Project', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'advanceBranchSettings',
            name: 'AdvanceBranchSettings',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'issueTransfer/:userId',
            name: 'IssueTransfer',
            hidden: true,
            component: () => import('@/views/Plan/Settings/ProjectIssueTransfer'),
            meta: { title: 'Issue Transfer', roles: ['Administrator', 'Project Manager'] }
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
      title: 'works',
      icon: 'el-icon-s-cooperation',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'issueBoards',
        name: 'IssueBoards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'issues',
        component: ParentBlank,
        meta: { title: 'issueList' },
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
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager', 'Engineer'],
              rolePage: false,
              subject: ''
            }
          }
        ]
      },
      {
        path: 'notes',
        name: 'WikiList',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'wikiList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'files',
        name: 'FileList',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'ProjectRoadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'releaseVersion',
        name: 'ReleaseVersion',
        redirect: { name: 'ReleaseVersion' },
        component: ParentBlank,
        meta: { title: 'releaseVersion', roles: ['Administrator', 'Project Manager', 'Engineer'] },
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
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'deploy',
        redirect: { name: 'Deploy' },
        name: 'RemoteDeploy',
        component: ParentBlank,
        meta: { title: 'deploy', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Deploy',
            component: () => import('@/views/Project/Deploy'),
            meta: {
              title: 'deploy',
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
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'devBranch',
        name: 'DevBranch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      // {
      //   path: 'GitGraph',
      //   name: 'GitGraph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'gitGraph', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      // },
      {
        path: 'pipelines',
        component: ParentBlank,
        name: 'PiplelineInfo',
        meta: { title: 'pipelines', roles: ['Administrator', 'Project Manager', 'Engineer'] },
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
            meta: { title: 'testReport', roles: ['Administrator', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'devEnvironment',
        name: 'DevEnvironment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'kubernetesResources',
        component: ParentBlank,
        name: 'KubernetesResources',
        meta: {
          title: 'kubernetesResources',
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
            meta: { title: 'Pods List', roles: ['Administrator', 'Project Manager', 'Engineer'] },
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
              title: 'Service List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'secretList',
            name: 'SecretList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'configmapsList',
            name: 'ConfigMapsList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'deploymentList',
            name: 'DeploymentList',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'Deployment List',
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
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'testFile',
        name: 'TestFile',
        component: () => import('@/views/Test/TestFile'),
        meta: {
          title: 'testFile',
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
              title: 'testPlan',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'create',
            name: 'CreateTestPlan',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          },
          {
            path: ':issueId',
            name: 'TestPlanDetail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'Project Manager', 'Engineer'],
              rolePage: false
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
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
    },
    redirect: { name: 'Postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'Sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'checkmarx',
        name: 'Checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'zap',
        name: 'Zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'cmas',
        name: 'Cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'cmas', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'webinspect',
        name: 'Webinspect',
        component: ParentBlank,
        redirect: { name: 'Webinspect' },
        meta: { title: 'webInspect', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
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
            meta: { title: 'webInspectReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'Postman',
        component: ParentBlank,
        redirect: { name: 'PostmanTest' },
        meta: {
          title: 'postman',
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
              title: 'fromDevops',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'PostmanTestCase',
            hidden: true,
            component: () => import('@/views/Scan/TestCasePostman'),
            meta: {
              title: 'fromCollection',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          }
        ]
      },
      {
        path: 'sideex',
        name: 'Sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/systemResource',
    component: Layout,
    name: 'SystemResource',
    redirect: { name: 'PluginResource' },
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: ':projectName?/pluginResource',
        component: ParentBlank,
        name: 'PluginResources',
        meta: { title: 'Plugin Resource', roles: ['Administrator', 'Project Manager'] },
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
        meta: { title: 'Service Monitoring', roles: ['Administrator', 'Project Manager'] }
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
        meta: { title: 'Project Activities', roles: ['Administrator', 'Project Manager'] }
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
        meta: { title: 'Account Manage', roles: ['Administrator'] },
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
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          }
        ]
      },
      {
        path: 'systemActivities',
        name: 'SystemActivities',
        component: () => import('@/views/SystemSettings/SystemActivities'),
        meta: { title: 'System Activities', roles: ['Administrator'] }
      },
      {
        path: 'systemArguments',
        name: 'SystemArguments',
        component: () => import('@/views/SystemSettings/SystemArguments'),
        meta: { title: 'System Arguments', roles: ['Administrator'] }
      },
      {
        path: 'systemDeploySettings',
        name: 'SystemDeploySettings',
        component: () => import('@/views/SystemSettings/SystemDeploySettings'),
        meta: { title: 'System Deploy Settings', roles: ['Administrator'] }
      },
      {
        path: 'subAdminProjects',
        name: 'SubAdminProjects',
        component: () => import('@/views/SystemSettings/SubAdminProjects'),
        meta: { title: 'Project Settings (QA)', roles: ['Administrator'] }
      },
      {
        path: 'systemPluginManage',
        name: 'SystemPluginManage',
        component: () => import('@/views/SystemSettings/SystemPluginManage'),
        meta: { title: 'System Plugin Manage', roles: ['Administrator'] }
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
          noCache: true,
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
          title: 'System Version',
          icon: 'user',
          noCache: true,
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
