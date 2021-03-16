export default {
  route: {
    Dashboard: 'Dashboard',

    'Project List': 'Project List',
    'PM Project List': 'PM Project List',

    Projects: 'Projects',
    Project: 'Project',
    Overview: 'Overview',
    'Issue Boards': 'Issue Boards',
    'Activity Log': 'Activity Log',
    'Project Roadmap': 'Project Roadmap',

    Issues: 'Issues',
    'Issue List': 'Issue List',
    'Issue Detail': 'Issue Detail',
    Wiki: 'Wiki',
    'File List': 'File List',
    'Test Case': 'API Test Case',

    Progress: 'Progress',
    'Dev Branch': 'Dev Branch',
    'Git Graph': 'Git Graph',
    Pipelines: 'Pipelines',
    'Dev Environment': 'Dev Environment',

    'Auto Testing': 'Auto Testing',
    Postman: 'Postman',
    CheckMarx: 'CheckMarx',
    SonarQube: 'SonarQube',
    WebInspect: 'WebInspect',
    'DevOps Test Case': 'DevOps Test Case',
    'Postman Test Case': 'Postman Test Case',

    'System Resource': 'System Resource',
    Kubernetes: 'Kubernetes',
    'Plugin Resource': 'Plugin Resource',
    Harbor: 'Harbor',

    Activities: 'Activities',
    'Project Activities': 'Project Activities',

    Setting: 'Setting',
    Members: 'Members',
    Versions: 'Versions',

    Admin: 'System Settings',
    'Account Manage': 'Account Manage',
    'System Activities': 'System Activities',

    'Dev Branch Test Result': 'Dev Branch Test Result',

    'Deployment List': 'Deployment List',
    'Pods List': 'Pods List',
    'Service List': 'Service List',
    'Secret List': 'Secret List',
    'ConfigMaps List': 'ConfigMaps List',

    Artifacts: 'Project Artifacts',

    'System Arguments': 'System Arguments'
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
    RunAt: 'Run At'
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
    FileSizeLimit: 'This file cannot be uploaded because it exceeds the maximum allowed file size (20 MB)'
  },
  RuleMsg: {
    PleaseInput: 'Please input',
    PleaseSelect: 'Please select',
    Invalid: 'Invalid',
    Member: 'Member',
    Email: 'email',
    UserName: 'user name',
    Password: 'password',
    Description: 'description',
    InputNewPwd: 'Please input new password',
    InputRepeatPwd: 'Please input repeat password'
  },
  TestCase: {
    TestCase: 'Test Case',
    AddTestCase: 'Add Test Case',
    EditTestCase: 'Edit Test Case',
    Id: 'Id',
    Type: 'Type',
    Description: 'Description',
    Method: 'Method',
    Path: 'Path',
    TestResult: 'Test Result',
    SearchNameOrPathOrTestResult: 'Search Name, Path Or TestResult'
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
    Id: 'Id / Name',
    Assignee: 'Assignee',
    Priority: 'Priority',
    Estimate: 'Estimate',
    DoneRatio: 'Done Ratio',
    StartDate: 'Start Date',
    EndDate: 'End Date',
    SelectDate: 'Select Date',
    SearchNameOrAssignee: 'Search Name Or Assignee',
    Save: 'Save',
    Comment: 'Comment',
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
    ParentIssue: 'Parent Issue'
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
    Total: 'Total',
    AssignIssuesPriority: 'Assign Issues Priority',
    AssignIssuesProject: 'Assign Issues Project',
    AssignIssuesType: 'Assign Issues Type'
  },
  Member: {
    AddMember: 'Add Member',
    Id: 'Id',
    Phone: 'Phone',
    Role: 'Role',
    Account: 'Account',
    SelectMember: 'Select Member'
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
    Phone: 'Phone',
    Password: 'Password',
    RepeatPassword: 'Repeat Password',
    IsEnable: 'Is Enable',
    Disable: 'Disable',
    Enable: 'Enable',
    SearchAccount: 'Search Account',
    Role: 'Role',
    AccountRule: 'Account should be 2-60 characters long and "._-" can be accepted at the middle of string',
    PasswordRule: 'Password should be 8-20 characters long with at least 1 uppercase, 1 lowercase and 1 number'
  },
  Profile: {
    Basic: 'Basic',
    ProfileBasicSetting: 'Profile Basic Setting',
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
      'This action can lead to data loss. To prevent accidental actions we ask you to confirm your intention.',
    PleaseType: 'Please type',
    AndThen: 'to proceed or close this modal to cancel.',
    IdRule:
      'Identifier should be 2-30 lowercase or number characters long and "-" can be accepted at the middle of string and only numbers cannot be accepted.',
    Workload: 'Workload',
    WorkloadValue: 'Workload',
    UpcomingDeadline: 'Upcoming Deadline',
    ProjectMembers: 'Project Members',
    TestStatus: 'Test Status',
    Title: 'Title',
    Branches: 'Branches',
    LastTest: 'Last Test',
    LastTestResult: 'Last Test Result',
    SearchIdentifier: 'Please Input Project Identifier',
    Report: 'Report',
    Brief: 'Brief',
    Software: 'Software',
    SearchProjectName: 'Search Project Name'
  },
  ProjectActive: {
    Active: 'Active',
    Assigned: 'Assigned',
    Solved: 'Solved',
    Responded: 'Responded',
    Finished: 'Finished',
    Closed: 'Closed'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: 'Last Update Time',
    Environment: 'Environment',
    SearchBranch: 'Search Branch',
    Branch: 'Branch',
    Status: 'Status'
  },
  ProcessDevBranchTest: {
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
    UserName: 'User Name',
    Password: 'Password'
  },
  PodsList: {
    Pods: 'Pods / Created time',
    Container: 'Container',
    Image: 'Image'
  },
  Loading: 'Loading...',
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
    Commit: 'Commit ID'
  },
  SonarQube: {
    Bugs: 'Bugs'
  }
}
