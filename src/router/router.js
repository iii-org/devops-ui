import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'
import parentBlank from '@/layout/components/parentBlank'
// import pmRoute from './pm'
// import adRoute from './ad'
// import rdRoute from './rd'
// import qaRoute from './qa'
// import allRoutes from './all'

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
    redirect: { name: 'my-works' },
    meta: {
      roles: ['Engineer', 'Project Manager']
    },
    hidden: true
  },
  {
    path: '/',
    redirect: { name: 'dashboard-admin' },
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
        name: 'dashboard-admin',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['QA']
        }
      },
      {
        path: 'project-list',
        name: 'project-list',
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
    redirect: { name: 'milestone' },
    meta: {
      title: 'singleProject',
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
        name: 'milestone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['QA'] }
      },
      {
        path: 'issues',
        redirect: { name: 'issue-list' },
        component: parentBlank,
        meta: {
          title: 'issueList',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
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
        name: 'track',
        component: () => import('@/views/Project/TrackManagement'),
        meta: {
          title: 'changeManagement',
          roles: ['QA']
        }
      },
      {
        path: 'exception',
        name: 'exception-management',
        component: () => import('@/views/Project/ExceptionManagement'),
        meta: {
          title: 'Fail Management',
          roles: ['QA']
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
  {
    path: '/test/:projectName?/',
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'test-report',
      icon: 'el-icon-finished',
      roles: ['QA']
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
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'test-case',
              roles: ['QA']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
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
            name: 'test-plan-detail',
            hidden: true,
            component: () => import('@/views/Project/IssueDetail'),
            meta: {
              title: 'Issue Detail',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'],
              rolePage: false
            }
          }
        ]
      },
      {
        path: 'release-version',
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
            path: ':issueTag',
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
        name: 'dashboard-admin',
        component: () => import('@/views/Overview/Dashboard/roles/admin'),
        meta: {
          title: 'dashboard',
          roles: ['Administrator']
        }
      },
      {
        path: 'project-list',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: {
          title: 'projectList',
          roles: ['Administrator']
        }
      }
    ]
  },
  {
    path: '/my-work/:projectName?',
    component: Layout,
    meta: {
      roles: ['Project Manager', 'Engineer']
    },
    children: [
      {
        path: '',
        name: 'my-works',
        component: () => import('@/views/MyWork'),
        meta: {
          title: 'myWork',
          icon: 'el-icon-s-home',
          roles: ['Project Manager', 'Engineer']
        }
      }
    ]
  },
  {
    path: '/inbox',
    component: Layout,
    name: 'inboxs',
    redirect: { name: 'inbox' },
    meta: {
      title: 'inbox',
      icon: 'el-icon-message',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Inbox'),
        name: 'inbox',
        meta: {
          title: 'inbox',
          roles: ['Administrator', 'Project Manager']
        }
      },
      {
        path: 'message-console',
        name: 'message-console',
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
    path: '/project-list',
    component: Layout,
    meta: { roles: ['Project Manager', 'Engineer'] },
    children: [
      {
        path: '',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListPM'),
        meta: { title: 'projectList', icon: 'list', roles: ['Project Manager'] }
      },
      {
        path: '',
        name: 'project-list',
        component: () => import('@/views/Overview/ProjectList/ProjectListRD'),
        meta: { title: 'projectList', icon: 'list', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/plan/:projectName?/',
    component: Layout,
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
        name: 'milestone',
        component: () => import('@/views/Plan/Milestone'),
        meta: { title: 'milestone', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'traceability-matrix',
        name: 'TraceMatrix',
        component: () => import('@/views/Plan/TraceabilityMatrix'),
        meta: { title: 'traceabilityMatrix', roles: ['Administrator', 'Project Manager'] }
      },
      {
        path: 'settings',
        component: parentBlank,
        meta: { title: 'Project Settings', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'Project Settings',
                component: () => import('@/views/Plan/Settings/index'),
                meta: { roles: ['Administrator', 'Project Manager'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'ParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Administrator', 'Project Manager'] }
              }
            ]
          },
          {
            path: 'advance-branch-settings',
            name: 'advance-branch-settings',
            hidden: true,
            component: () => import('@/views/Plan/Settings/components/AdvanceBranchSettings'),
            meta: { title: 'advanceBranchSettings', roles: ['Administrator', 'Project Manager'] }
          },
          {
            path: 'issue-transfer/:userId',
            name: 'Issue Transfer',
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
    redirect: { name: 'Overview' },
    meta: {
      title: 'works',
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
        path: 'issue-boards',
        name: 'issue-boards',
        component: () => import('@/views/Project/IssueBoards'),
        meta: { title: 'kanban', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'issues',
        component: parentBlank,
        meta: { title: 'issueList' },
        children: [
          {
            path: '',
            name: 'issue-list',
            hidden: true,
            component: () => import('@/views/Project/IssueList'),
            meta: {
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueId',
            name: 'issue-detail',
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
        name: 'wiki-list',
        component: () => import('@/views/Project/Wiki'),
        meta: { title: 'wikiList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'files',
        name: 'file-list',
        component: () => import('@/views/Project/Files'),
        meta: { title: 'fileList', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'roadmap',
        name: 'Project Roadmap',
        component: () => import('@/views/Project/Roadmap'),
        meta: { title: 'Project Roadmap', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'release-version',
        redirect: { name: 'release-version' },
        component: parentBlank,
        meta: { title: 'releaseVersion', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'release-version',
            component: () => import('@/views/Project/ReleaseVersion'),
            hidden: true,
            meta: {
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: ':issueTag',
            name: 'closed-issue-list',
            hidden: true,
            component: () => import('@/views/Project/ReleaseVersion/ClosedIssueList'),
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
    path: '/progress/:projectName?/',
    component: Layout,
    name: 'progress',
    redirect: { name: 'dev-environment' },
    meta: {
      title: 'devProgress',
      icon: 'el-icon-odometer',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'dev-branch',
        name: 'dev-branch',
        component: () => import('@/views/Progress/DevBranch'),
        meta: { title: 'devBranch', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      // {
      //   path: 'git-graph',
      //   name: 'git-graph',
      //   component: () => import('@/views/Progress/GitGraph'),
      //   meta: { title: 'gitGraph', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      // },
      {
        path: 'pipelines',
        component: parentBlank,
        meta: { title: 'pipelines', roles: ['Administrator', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'Pipelines',
            hidden: true,
            component: () => import('@/views/Progress/Pipelines'),
            meta: { roles: ['Administrator', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'dev-environment',
        name: 'dev-environment',
        component: () => import('@/views/Progress/DevEnvironment'),
        meta: { title: 'devEnvironment', roles: ['Administrator', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'kubernetes-resources',
        component: parentBlank,
        meta: {
          title: 'kubernetesResources',
          roles: ['Administrator', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'Kubernetes-resources',
            component: () => import('@/views/Progress/KubernetesResources'),
            hidden: true
          },
          {
            path: 'pods-list',
            hidden: true,
            component: parentBlank,
            meta: { title: 'Pods List', roles: ['Administrator', 'Project Manager', 'Engineer'] },
            children: [
              {
                path: '',
                name: 'Pods List',
                hidden: true,
                component: () => import('@/views/Progress/KubernetesResources/components/PodsList')
              },
              {
                path: 'pod-execute-shell',
                name: 'Pod Execute Shell',
                hidden: true,
                component: () =>
                  import('@/views/Progress/KubernetesResources/components/PodsList/components/PodExecuteShell'),
                meta: { title: 'Pod Execute Shell', roles: ['Administrator', 'Project Manager', 'Engineer'] }
              }
            ]
          },
          {
            path: 'service-list',
            name: 'Service List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ServiceList'),
            meta: {
              title: 'Service List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'secret-list',
            name: 'Secret List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/SecretList'),
            meta: {
              title: 'Secret List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'configmaps-list',
            name: 'ConfigMaps List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/ConfigMapsList'),
            meta: {
              title: 'ConfigMaps List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'deployment-list',
            name: 'Deployment List',
            hidden: true,
            component: () => import('@/views/Progress/KubernetesResources/components/DeploymentList'),
            meta: {
              title: 'Deployment List',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'ingresses-list',
            name: 'Ingresses List',
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
    path: '/commit_list/:rId/:branchName/:projectName',
    component: Layout,
    hidden: true,
    meta: { roles: ['Engineer'] },
    children: [
      {
        path: '',
        name: 'commitList',
        props: true,
        component: () => import('@/views/Progress/CommitList'),
        meta: { title: 'Commit List', icon: 'tree', roles: ['Engineer'] }
      }
    ]
  },
  {
    path: '/test/:projectName?/',
    name: 'test',
    component: Layout,
    redirect: { name: 'test-plan' },
    meta: {
      title: 'testManagement',
      icon: 'el-icon-finished',
      roles: ['Administrator', 'Project Manager', 'Engineer']
    },
    children: [
      {
        path: 'test-file',
        name: 'test-file',
        component: () => import('@/views/Test/TestFile'),
        meta: {
          title: 'testFile',
          roles: ['Administrator', 'Project Manager', 'Engineer']
        }
      },
      {
        path: 'test-plan',
        redirect: '/test/test-plan',
        component: parentBlank,
        meta: {
          roles: ['Administrator', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'test-plan',
            component: () => import('@/views/Test/TestPlan'),
            meta: {
              title: 'testPlan',
              roles: ['Administrator', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'create',
            name: 'create-test-plan',
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
            name: 'test-plan-detail',
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
    name: 'scan',
    alwaysShow: true,
    meta: {
      title: 'autoTesting',
      icon: 'el-icon-circle-check',
      roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
    },
    redirect: { name: 'postman' },
    children: [
      {
        path: 'sonarqube',
        name: 'sonarqube',
        component: () => import('@/views/Scan/SonarQube'),
        meta: { title: 'sonarQube', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        name: 'checkmarx',
        path: 'checkmarx',
        component: () => import('@/views/Scan/Checkmarx'),
        meta: { title: 'checkMarx', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'zap',
        name: 'zap',
        component: () => import('@/views/Scan/Zap'),
        meta: { title: 'zap', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'docker',
        name: 'docker',
        component: parentBlank,
        redirect: { name: 'docker' },
        meta: { title: 'dockerImage', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'docker-scans',
            hidden: true,
            component: () => import('@/views/Scan/DockerImage')
          },
          {
            path: 'report/:commitBranch/:commitId',
            name: 'DockerReport',
            hidden: true,
            component: () => import('@/views/Scan/DockerReport'),
            meta: { title: 'dockerReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'cmas',
        name: 'cmas',
        component: () => import('@/views/Scan/Cmas'),
        meta: { title: 'cmas', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      },
      {
        path: 'webinspect',
        name: 'webinspect',
        component: parentBlank,
        redirect: { name: 'webinspect' },
        meta: { title: 'webInspect', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
        children: [
          {
            path: '',
            name: 'webinspect-scans',
            hidden: true,
            component: () => import('@/views/Scan/WebInspect')
          },
          {
            path: 'report/:scan_id',
            name: 'webinspect-report',
            component: () => import('@/views/Scan/WIEReportViewer'),
            hidden: true,
            meta: { title: 'webInspectReport', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
          }
        ]
      },
      {
        path: 'postman',
        name: 'postman',
        component: parentBlank,
        redirect: { name: 'postman-test' },
        meta: {
          title: 'postman',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        },
        children: [
          {
            path: '',
            name: 'postman-test',
            hidden: true,
            component: () => import('@/views/Scan/Postman')
          },
          {
            path: 'devops/:id',
            name: 'devops-test-case',
            hidden: true,
            component: () => import('@/views/Scan/TestCaseDevOps'),
            meta: {
              title: 'fromDevops',
              roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
            }
          },
          {
            path: 'postman/:id',
            name: 'postman-test-case',
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
        name: 'sideex',
        component: () => import('@/views/Scan/Sideex'),
        meta: { title: 'sideex', roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] }
      }
    ]
  },

  {
    path: '/system-resource',
    component: Layout,
    name: 'System Resource',
    redirect: { name: 'Plugin Resource' },
    meta: {
      title: 'System Resource',
      icon: 'el-icon-pie-chart',
      roles: ['Administrator', 'Project Manager']
    },
    children: [
      {
        path: ':projectName?/plugin-resource',
        component: parentBlank,
        meta: { title: 'Plugin Resource', roles: ['Administrator', 'Project Manager'] },
        children: [
          {
            path: '',
            name: 'Plugin Resource',
            hidden: true,
            component: () => import('@/views/SystemResource/PluginResource')
          },
          {
            path: 'harbor',
            hidden: true,
            component: parentBlank,
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
        path: 'service-monitoring',
        name: 'Service Monitoring',
        component: () => import('@/views/SystemResource/ServiceMonitoring'),
        meta: { title: 'Service Monitoring', roles: ['Administrator', 'Project Manager'] }
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
    path: '/system-settings',
    component: Layout,
    name: 'Admin',
    redirect: { name: 'AccountManage' },
    meta: { title: 'Admin', icon: 'el-icon-setting', roles: ['Administrator'] },
    children: [
      {
        path: 'account-manage',
        component: parentBlank,
        meta: { title: 'Account Manage', roles: ['Administrator'] },
        children: [
          {
            path: '',
            component: parentBlank,
            hidden: true,
            children: [
              {
                path: '',
                name: 'AccountManage',
                component: () => import('@/views/SystemSettings/AccountManage'),
                meta: { roles: ['Administrator'] }
              },
              {
                path: 'participate-project/:user_id',
                name: 'SystemParticipateProject',
                hidden: true,
                component: () => import('@/views/SystemSettings/AccountManage/components/ParticipateProject'),
                meta: { title: 'Participate Project', roles: ['Administrator'] }
              }
            ]
          }
        ]
      },
      {
        path: 'system-activities',
        name: 'SystemActivities',
        component: () => import('@/views/SystemSettings/SystemActivities'),
        meta: { title: 'System Activities', roles: ['Administrator'] }
      },
      {
        path: 'system-arguments',
        name: 'System Arguments',
        component: () => import('@/views/SystemSettings/SystemArguments'),
        meta: { title: 'System Arguments', roles: ['Administrator'] }
      },
      {
        path: 'system-deploy-settings',
        name: 'System Deploy Settings',
        component: () => import('@/views/SystemSettings/SystemDeploySettings'),
        meta: { title: 'System Deploy Settings', roles: ['Administrator'] }
      },
      {
        path: 'sub-admin-projects',
        name: 'Sub Admin Projects',
        component: () => import('@/views/SystemSettings/SubAdminProjects'),
        meta: { title: 'Project Settings (QA)', roles: ['Administrator'] }
      },
      {
        path: 'system-plugin-manage',
        name: 'System Plugin Manage',
        component: () => import('@/views/SystemSettings/SystemPluginManage'),
        meta: { title: 'System Plugin Manage', roles: ['Administrator'] }
      }
    ]
  },

  {
    path: '/test-report',
    name: 'TestReports',
    component: Layout,
    redirect: { name: 'TestReport' },
    hidden: true,
    meta: { roles: ['Administrator', 'QA', 'Project Manager', 'Engineer'] },
    children: [
      {
        path: ':projectId/:commitBranch/:commitId',
        component: () => import('@/views/Progress/Pipelines/components/TestReport'),
        name: 'TestReport',
        meta: {
          title: 'testReport',
          roles: ['Administrator', 'QA', 'Project Manager', 'Engineer']
        }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
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
