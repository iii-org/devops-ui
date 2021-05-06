export default {
  route: {
    dashboard: 'Dashboard',
    projectOverview: 'Overview',
    projectList: 'Project List',

    singleProject: 'Single Project',
    kanban: 'Issue Board',
    issueList: 'Issue List',
    createTest: 'Create Test',
    overview: 'Overview',
    wikiList: 'Wiki List',
    fileList: 'File List',

    'Activity Log': 'Activity Log',
    'Project Roadmap': 'Project Roadmap',
    advanceBranchSettings: 'Advance Branch Settings',
    'Project Settings': 'Project Settings',

    devProgress: 'Develop Progress',
    devBranch: 'Git Branches',
    gitGraph: 'Git Graph',
    pipelines: 'Pipelines',
    devEnvironment: 'Deployed Environments',
    kubernetesResources: 'Kubernetes Resources',
    releaseVersion: 'Release Version',

    autoTesting: 'Auto Testing',
    postman: 'Postman',
    fromDevops: 'From DevOps',
    fromCollection: 'From Postman Collection',
    checkMarx: 'CheckMarx',
    sonarQube: 'SonarQube',
    webInspect: 'WebInspect',
    zap: 'OWASP ZAP',
    sideex: 'Sideex',

    'System Resource': 'System Resource',
    Kubernetes: 'Kubernetes',
    'Deployment List': 'Deployment List',
    'Pods List': 'Pods List',
    'Service List': 'Service List',
    'Secret List': 'Secret List',
    'ConfigMaps List': 'ConfigMaps List',

    'Plugin Resource': 'Plugin Resource',
    Harbor: 'Harbor',

    Activities: 'Activities',
    'Project Activities': 'Project Activities',

    Setting: 'Setting',
    Members: 'Members',
    Versions: 'Versions',

    Issues: 'Issues',
    'Issue Detail': 'Issue Detail',

    Admin: 'System Settings',
    'Account Manage': 'Account Manage',
    'System Activities': 'System Activities',

    'Dev Branch Test Result': 'Dev Branch Test Result',

    Artifacts: 'Project Artifacts',

    'System Arguments': 'System Arguments',
    'Project Settings (QA)': 'Project Settings (QA)'
  },
  navbar: {
    logOut: 'Log Out',
    profile: 'Profile',
    versions: 'Versions'
  },
  errorMessage: {
    1001: 'Project identifier {identifier} has been taken.',
    1002: 'Project name {name} is not legal. Project name may only contain lower cases, numbers, dash, and the heading and trailing character should be alphanumeric, and should be 2 to 225 characters long.',
    1003: 'Project id {project_id} not found.',
    1004: 'Repository id {repository_id} not found.',
    1005: 'Project id {project_id} does not exist in redmine.',
    1006: 'Unable to delete the version.',
    2001: 'User id {user_id} not found.',
    2002: 'User name {name} is not legal. The user name may only contain a-z, A-Z, 0-9, dot, dash, underline, and the heading and trailing character should be alphanumeric and should be 2 to 60 characters long.',
    2003: 'Password is not legal. You can only use a-z, A-Z, 0-9, !@#$%^&*()_+|{}[]``~-=\'";:/?.>,<, and should contain at least an upper case alphabet, a lower case alphabet, and a digit, and is 8 to 20 characters long.',
    2004: 'Wrong password or username.',
    2005: 'The username or e-mail is already used.',
    2006: 'The user {user_id} is already in project {project_id}.',
    2007: 'This user is project owner in the project.',
    3001: "The user doesn't have permission for this operation.",
    3002: 'You need to be in the project for this operation.',
    3003: "You are not permitted to access another user's data.",
    4001: 'Issue not found.',
    8001: '{service_name} error: {response}',
    9001: 'Internal exception: {type}: {exception}',
    9003: 'An unexpected database error has occurred: {message}',
    9999: 'An unknown error has occurred.'
  },
  general: {
    Name: 'Name',
    Title: 'Title',
    Edit: 'Edit',
    Delete: 'Delete',
    Actions: 'Actions',
    Type: 'Type',
    Status: 'Status',
    Confirm: 'Confirm',
    Save: 'Save',
    Cancel: 'Cancel',
    SearchName: 'Search Name',
    SearchBranch: 'Search Branch',
    Description: 'Description',
    Active: 'Project Status',
    NoData: 'No Data',
    NoIssue: 'No Issue',
    Email: 'Email',
    Creator: 'Creator',
    CreateTime: 'Create Time',
    StartTime: 'Start Time',
    UpdateTime: 'Update Time',
    PleaseInput: 'Please Input',
    Close: 'Close',
    Disable: 'Disable',
    Enable: 'Enable',
    LastUpdateTime: 'Last Update Time',
    Redeploy: 'Redeploy',
    Success: 'Success',
    Warning: 'Warning',
    Info: 'Info',
    Error: 'Error',
    Refresh: 'Refresh',
    RunAt: 'Run At',
    ScanAt: 'Scan At',
    Detail: 'Detail',
    Exit: 'Exit',
    Stop: 'Stop',
    Rerun: 'Rerun',
    copied: 'Copied.',
    caution: 'Caution!',
    ok: 'OK',
    project_name: 'Project Name',
    pm_user_name: 'Project Manager',
    Department: 'Department',
    UserTitle: 'Title',
    Back: 'Back'
  },
  Notify: {
    Updated: 'update successful',
    Added: 'add successful',
    Deleted: 'delete successful',
    Uploaded: 'upload successful',
    Created: 'create successful',
    Copied: 'Copied',
    Canceled: 'Cancel successful',
    Submit: 'Submit',
    SwitchLanguage: 'Switch Language Success',
    NoProject: 'There are no projects currently, please create a new project.',
    WrongProjectName: 'Please input project name correctly.',
    WrongBranchName: 'Please input branch name correctly.',
    WrongResourceName: 'Please input resource name correctly.',
    WrongTagVersionName: 'Please input tag version correctly.',
    SingleFileLimit: 'Only one file can be added at a time, please delete the existing file first.',
    UnsupportedFileFormat: 'Unable to upload a file: This file type is not supported',
    FileSizeLimit: 'This file cannot be uploaded because it exceeds the maximum allowed file size (20 MB)',
    LoadFail: 'Something went wrong, please contact your system administrator.',
    UnSavedChanges: 'Do you really want to leave? you have unsaved changes!'
  },
  RuleMsg: {
    PleaseInput: 'Please input',
    PleaseSelect: 'Please select',
    Invalid: ' Invalid',
    Member: ' Member',
    Email: ' email',
    UserName: ' user name',
    Password: ' password',
    Description: ' description',
    InputNewPwd: 'Please input new password',
    InputRepeatPwd: 'Please input repeat password'
  },
  TestCase: {
    Index: 'Requests',
    TestCase: 'Test Case',
    AddTestCase: 'Add Test Case',
    EditTestCase: 'Edit Test Case',
    Id: 'Id',
    Type: 'Type',
    Description: 'Description',
    Method: 'Method',
    Path: 'Path',
    TestResult: 'Test Result',
    TestMessage: 'Test Message',
    SearchName: 'Search Name',
    SearchNameOrPathOrTestResult: 'Search Name/Path/Test Result',
    Request: 'request | requests',
    Pass: 'Pass',
    Fail: 'Fail',
    TestPass: 'Test Pass',
    TestFail: 'Test Fail'
  },
  TestItem: {
    TestItem: 'Test Item',
    AddTestItem: 'Add Test Item',
    EditTestItem: 'Edit Test Item',
    Id: 'Id',
    IsPass: 'Is Pass?'
  },
  CheckMarx: {
    ScanId: 'Scan ID',
    Branch: 'Branch',
    Commit: 'Commit',
    Status: 'Status',
    HighSeverity: 'High Severity',
    MediumSeverity: 'Medium Severity',
    LowSeverity: 'Low Severity',
    InfoSeverity: 'Info Severity',
    RunAt: 'Start Time',
    Report: 'Report',
    SearchScanId: 'Search Scan ID'
  },
  WebInspect: {
    ScanId: 'Scan ID',
    Branch: 'Branch',
    Commit: 'Commit',
    Status: 'Status',
    Critical: 'Critical',
    HighSeverity: 'High Severity',
    MediumSeverity: 'Medium Severity',
    LowSeverity: 'Low Severity',
    InfoSeverity: 'Info Severity',
    RunAt: 'Start Time',
    Report: 'Report',
    SearchCommitId: 'Search Commit ID'
  },
  TestValue: {
    TestValue: 'Test Value',
    AddTestValue: 'Add Test Value',
    EditTestValue: 'Edit Test Value',
    Type: 'Type',
    Location: 'Location',
    SelectTestItem: 'Select Test Item',
    SearchValue: 'Search Value',
    PleaseSelectTestItem: 'Please Select Test Item'
  },
  File: {
    AddFile: 'Add File',
    Upload: 'Upload',
    Id: 'Id',
    Download: 'Download',
    SelectFileOrDragHere: 'Select File or drag it here',
    UploadBtn: 'Select File',
    InputName: 'Enter Name or Use Upload File Name',
    File: 'File',
    UploadAndSave: 'Upload File and Save'
  },
  Version: {
    Manage: 'Manage Project Versions',
    AddVersion: 'Add Version',
    EditVersion: 'Edit Version',
    Duration: 'Duration',
    Version: 'Version',
    SelectVersion: 'Select Version',
    Id: 'Id',
    DueDate: 'Due Date',
    Open: 'Open',
    Closed: 'Closed',
    Locked: 'Locked',
    EndDate: 'EndDate'
  },
  Issue: {
    Issue: 'Issue',
    AddIssue: 'Add Issue',
    EditIssue: 'Edit Issue',
    AddSubIssue: 'Add Sub Issue',
    CloseIssue: 'Close Issue',
    Id: 'Id / Name',
    Assignee: 'Assignee',
    Priority: 'Priority',
    Estimate: 'Estimate',
    DoneRatio: 'Done Ratio',
    StartDate: 'Start Date',
    EndDate: 'End Date',
    Description: 'Issue Description',
    SelectDate: 'Select Date',
    SelectType: 'Select Type',
    SearchNameOrAssignee: 'Search Name Or Assignee',
    Save: 'Save',
    Notes: 'Notes',
    AddComment: 'Add Comment',
    Flow: 'Flow',
    FlowId: 'Flow Id',
    AddFlow: 'Add Flow',
    Parameter: 'Parameter',
    AddParameter: 'Add Parameter',
    Length: 'Length',
    Limit: 'Limit',
    AddBy: 'Added by {user}',
    Author: 'Author',
    CommentTime: 'Comment Time',
    ParentIssue: 'Parent Issue',
    Active: 'Active',
    Assigned: 'Assigned',
    Closed: 'Closed',
    Solved: 'Solved',
    Responded: 'Responded',
    Finished: 'Finished',
    Unknown: 'Unknown',
    Low: 'Low',
    Normal: 'Normal',
    High: 'High',
    Immediate: 'Immediate',
    Document: 'Document',
    Research: 'Research',
    Bug: 'Bug',
    Feature: 'Feature',
    DeleteIssue: 'Are you sure to Delete {issueName}?',
    AskDeleteIssue: 'Close work item/issue?',
    DeleteIssueReason: 'Please specify the reason for closure',
    Files: 'Files',
    UploadFiles: 'Upload Files',
    RemovedIssue: "The issue you were trying to edit doesn't exist or has been removed.",
    id: 'ID',
    name: 'Name'
  },
  Wiki: {
    AddWiki: 'Add Wiki',
    Title: 'Title',
    Content: 'Content',
    SearchTitle: 'Search Title',
    edited: '{user} edited this page'
  },
  Dashboard: {
    UnfinishedIssues: 'Unfinished Issues',
    IssuesShouldBeClosedWithinThisWeek: 'Issues Should Be Closed Within This Week',
    IssuesShouldBeClosedWithinThisMonth: 'Issues Should Be Closed Within This Month',
    Finished: 'Finished',
    Unfinished: 'Unfinished',
    Unassigned: 'Unassigned',
    TotalVersion: 'All Versions',
    TotalMember: 'All Members',
    Total: 'Total',
    AssignIssuesPriority: 'Assign Issues Priority',
    AssignIssuesProject: 'Assign Issues Project',
    AssignIssuesType: 'Assign Issues Type',
    IssueTrackingStatus: 'Issue Tracking Status',
    Workload: 'Workload',
    ProjectUsers: 'Project Users',
    TestStatus: 'Test Status',
    Software: 'Software',
    Brief: 'Brief',
    Report: 'Report',
    ADMIN: {
      sync_date: 'created by: {0}',
      Overview: {
        NAME: 'Overview',
        Projects: 'Projects',
        Overdue: 'Overdue',
        Not_Started: 'Not Started'
      },
      ProjectMembers: {
        NAME: 'Project Members',
        project_name: '@:general.project_name',
        pm_user_name: '@:general.pm_user_name',
        member_count: 'members',
        start_date: 'start date',
        end_date: 'end date'
      },
      CommitLog: {
        NAME: 'Commit Log'
      },
      IssueRank: {
        NAME: 'Workload Top 5',
        DETAIL: '{0} - Unsolved',
        user_name: 'Member',
        unclosed_count: 'Unsolved',
        project_count: 'Projects',
        project_name: '@:general.project_name',
        issue_name: 'Issue title',
        issue_type: 'Types',
        status_id: 'Status',
        start_date: 'Created'
      },
      PassingRate: {
        NAME: 'Test results (Quauntity and Quality)',
        DETAIL: 'Test results (Lastest)',
        project_name: '@:general.project_name',
        count: 'Test cases',
        success: 'Success',
        fail: 'Fail',
        total: 'Test counts',
        run_at: 'Last test',
        rate: 'Pass rate'
      },
      ProjectList: {
        NAME: 'Project list',
        user_name: 'PM',
        unclosed_count: '# unsolved',
        project_count: '# projects',
        project_name: '@:general.project_name',
        pm_user_name: '@:general.pm_user_name',
        project_status: 'Status',
        complete_percent: 'Progress',
        unclosed_issue_count: 'Unsolved',
        closed_issue_count: 'Solved',
        member_count: 'Members',
        expired_day: 'Remains(day)',
        end_date: 'Due date'
      }
    }
  },
  Member: {
    Manage: 'Manage Project Members',
    AddMember: 'Add Member',
    Id: 'Id',
    Phone: 'Phone',
    Role: 'Role',
    Account: 'Account',
    SelectMember: 'Select Member'
  },
  Plugin: {
    Manage: 'Manage Plugins',
    CustomEnvWarning: 'This project is a custom environment and cannot be configured via this system.',
    CustomRecommendWarning: 'We recommend you use our templates to build project.'
  },
  DevOps: {
    Id: 'Id',
    Phase: 'Phase',
    Tools: 'Tools',
    SearchTool: 'Search Tool'
  },
  User: {
    AddUser: 'Add User',
    EditUser: 'Edit User',
    Account: 'Account',
    Department: '@:general.Department',
    Title: '@:general.UserTitle',
    Phone: 'Phone',
    Password: 'Password',
    RepeatPassword: 'Repeat Password',
    IsEnable: 'Is Enable',
    Disable: 'Disable',
    Enable: 'Enable',
    SearchAccount: 'Search Account or Name',
    Role: 'Role',
    Source: 'Source',
    AD: 'Active Directory',
    SYSTEM: 'System',
    Selected: 'Selected',
    AccountRule: 'Account should be 2-60 characters long and "._-" can be accepted at the middle of string',
    PasswordRule: 'Password should be 8-20 characters long with at least 1 uppercase, 1 lowercase and 1 number'
  },
  Profile: {
    Basic: 'Basic',
    ProfileBasicSetting: 'Profile Basic Setting',
    Department: '@:general.Department',
    Title: '@:general.UserTitle',
    Phone: 'Phone',
    Security: 'Security',
    ProfileSecuritySetting: 'Profile Security Setting',
    NewPassword: 'New Password',
    RepeatNewPassword: 'Repeat New Password',
    PasswordRule: 'Password should be 8-20 characters long with at least 1 uppercase, 1 lowercase and 1 number.',
    Save: 'Save',
    Password: 'Password',
    K8SConfigDownload: 'Download K8S Config'
  },
  Project: {
    Project: ' Project',
    AddProject: 'Add Project',
    EditProject: 'Edit Project',
    NameIdentifier: 'Name / Identifier',
    Name: 'Name',
    Identifier: 'Identifier',
    Info: 'Project Info',
    Template: 'Template',
    TemplateName: 'Template Name',
    Version: 'Version',
    Status: 'Status',
    Progress: 'Progress',
    UpdateTime: 'Update Time',
    deleteProjectConfirmText:
      'This action cannot be undone. This will permanently delete the project, including all commits, issues, test cases and files.',
    PleaseType: 'Please type',
    AndThen: 'to proceed or close this modal to cancel.',
    IdRule:
      'Identifier should be 2-30 lowercase or number characters long and "-" can be accepted at the middle of string and only numbers cannot be accepted.',
    WorkloadValue: 'Workload',
    UpcomingDeadline: 'Upcoming Deadline',
    Title: 'Title',
    Branches: 'Branches',
    LastTest: 'Last Test',
    LastTestResult: 'Last Test Result',
    SearchIdentifier: 'Please Input Project Identifier',
    SearchProjectName: 'Search Project Name',
    StartDate: 'Start Date',
    DueDate: 'Due Date',
    ProjectOwner: 'Project Owner',
    SelectProject: 'Select a project'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: 'Last Update Time',
    Environment: 'Environment',
    SearchBranch: 'Search Branch',
    Branch: 'Branch',
    Status: 'Status'
  },
  ProgressPipelines: {
    Id: 'Id',
    TestItems: 'Test Items',
    Status: 'Status',
    Commit: 'Commit',
    Branch: 'Branch',
    CommitMessage: 'Commit Message',
    TransitioningMessage: 'Transitioning Message',
    LastUpdateTime: 'Last Update Time',
    SearchCommitMessage: 'Search Commit Message',
    TestDetail: 'Test Detail'
  },
  ProcessDevEnvironment: {
    Branch: 'Branch',
    Deployment: 'Deployment',
    State: 'State',
    Container: 'Container',
    Image: 'Image',
    Services: 'Services',
    Pod: 'Pod'
  },
  ProjectResource: {
    Usage: 'Usage',
    Quota: 'Quota',
    Artifacts: 'Artifacts',
    EditResource: 'Edit Resource',
    Vulnerabilities: 'Vulnerabilities',
    DeleteResourceConfirmText:
      'This action can lead to data loss. To prevent accidental actions we ask you to confirm your intention.',
    PleaseType: 'Please type',
    AndThen: 'to proceed or close this modal to cancel.',
    Storage: 'Storage',
    Details: 'Show details >>'
  },
  ProjectUsage: {
    SearchPods: 'Search Pods'
  },
  DeploymentList: {
    DeployName: 'Deploy name',
    Container: 'Container',
    Image: 'Image'
  },
  Postman: {
    Id: 'Id',
    Branch: 'Branch',
    Success: 'Success',
    Fail: 'Fail',
    StartTime: 'Start Time',
    SearchBranch: 'Search Branch',
    DevOps: 'DevOps',
    Postman: 'Postman'
  },
  Activities: {
    User: 'User',
    ActionType: 'Action Type',
    ActionParts: 'Action Parts',
    ActAt: 'Act At',
    SearchActionParts: 'Search Action Parts'
  },
  Maintenance: {
    AddSecret: 'Add Secret',
    SecretName: 'Secret Name',
    Status: 'Status',
    SearchSecretName: 'Search Secret Name',
    AddRegistry: 'Add Registry',
    RegistryName: 'Registry Name',
    SearchRegistryName: 'Search Registry Name',
    AddConfigMap: 'Add ConfigMap',
    UserName: 'User Name',
    Password: 'Password'
  },
  PodsList: {
    Pods: 'Pods / Created time',
    Container: 'Container',
    Image: 'Image'
  },
  Loading: 'Loading...',
  Updating: 'Updating...',
  Harbor: {
    PushTime: 'Push Time'
  },
  System: {
    Secrets: 'Secrets',
    Registry: 'Registry'
  },
  PipeLines: {
    TestDetail: 'Test Detail'
  },
  Git: {
    Branch: 'Branch',
    Commit: 'Commit',
    searchCommitId: 'Search Commit ID'
  },
  SonarQube: {
    ViewReport: 'View Report',
    Bugs: 'Bugs',
    Vulnerabilities: 'Vulnerabilities',
    CodeSmells: 'Code Smells',
    Duplicates: 'Duplicates',
    Coverage: 'Coverage'
  },
  Log: {
    info: 'Info',
    duration: 'Duration',
    fullLog: 'Report',
    testId: 'Test ID'
  },
  Zap: {
    id: 'ID',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },
  Sideex: {
    promptMessage: 'The system provides the latest 5 reports to download.',
    suitesPassedRatio: 'Suites Passed',
    casesPassedRatio: 'Cases Passed'
  },
  Release: {
    internalVersions: 'Internal versions',
    selectVersion: 'Select Versions',
    writeNote: 'Write Release Note',
    openIssueHint: 'Note: Please make sure all issues are closed.',
    openIssueAlert: 'There are unclosed issues in selected versions, please close it first.',
    issueCount: 'In this version: ',
    issueCountLink: '{0} issues',
    releaseNote: '[Release Note]',
    releaseVersionName: 'Version name',
    selectMainVersion: 'Please main version',
    startRelease: 'Start releasing',
    copyIssues: 'Copy issue names to clipboard',
    allCategories: 'All',
    batchClose: 'Batch close',
    confirmBatchClose: 'Confirm closing {0} issues in batch?',
    batchMove: 'Batch move',
    batchMoveDialogTitle: 'Batch move version',
    futureVersion: 'Future version',
    selectMoveToVersion: 'Please select version',
    batchMoveDialogHint: 'Will batch move {0} issues',
    releaseDone: 'Done releasing version {0}.'
  }
}
