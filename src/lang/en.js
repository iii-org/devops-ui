const langFiles = require.context('./plugins', true, /\en.js$/)
const asyncLangs = langFiles.keys().reduce((plugins, langPath) => {
  const name = langPath.replace(/^\.\/(.*)\/(.*)/, '$1')
  const value = langFiles(langPath)
  plugins[name] = value.default
  return plugins
}, {})

export default {
  route: {
    myWork: 'My Work',
    dashboard: 'Dashboard',
    projectOverview: 'Project Overview',
    projectList: 'Project List',

    milestone: 'milestone',
    issueTracking: 'Issue Tracking',

    testManagement: 'Test Management',
    testFile: 'Test File',
    testPlan: 'Test Plan',

    singleProject: 'Single Project',
    kanban: 'Issue Board',
    issueList: 'Issue List',
    overview: 'Overview',
    wikiList: 'Wiki',
    fileList: 'File List',

    'Activity Log': 'Activity Log',
    'Project Roadmap': 'Project Roadmap',
    advanceBranchSettings: 'Advance Branch Settings',
    'Project Settings': 'Project Settings',
    'Issue Transfer': 'Issue Transfer',

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
    webInspectReport: '@:general.Report',
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

    Settings: 'Settings',
    'Participate Project': 'Participate In The Project',
    Members: 'Members',
    Versions: 'Versions',

    Issues: 'Issues',
    'Issue Detail': 'Issue Detail',

    Admin: 'System Settings',
    'Account Manage': 'Account Manage',
    'System Activities': 'System Activities',
    'System Plugin Manage': 'System Plugin Manage',
    'System Deploy Settings': 'System Deploy Settings',
    'Project Settings (QA)': 'Project Settings (QA)',
    'Dev Branch Test Result': 'Dev Branch Test Result',

    Artifacts: 'Project Artifacts',

    'System Arguments': 'System Arguments',
    'System Version': 'System @:navbar.versions',

    track: 'Traceability Manage',
    traceabilityMatrix: 'Traceability Matrix',
    changeManagement: 'Change Management',
    'Fail Management': 'Fail Management',
    testReport: 'III DevOps Test Report',
    deploy: 'Deploy'
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
    1011: 'Project owner role must be PM.',
    1012: 'You cannot change version {fixed_version} that status is {fixed_version_status}.',
    2001: 'User id {user_id} not found.',
    2002: 'User name {name} is not legal. The user name may only contain a-z, A-Z, 0-9, dot, dash, underline, and the heading and trailing character should be alphanumeric and should be 2 to 60 characters long.',
    2003: 'Password is not legal. You can only use a-z, A-Z, 0-9, !@#$%^&*()_+|{}[]``~-=\'";:/?.>,<, and should contain at least an upper case alphabet, a lower case alphabet, and a digit, and is 8 to 20 characters long.',
    2004: 'Wrong password or username.',
    2005: 'The username or e-mail is already used.',
    2006: 'The user {user_id} is already in project {project_id}.',
    2007: 'This user is project owner in the project.',
    3001: 'The user doesn\'t have permission for this operation.',
    3002: 'You need to be in the project for this operation.',
    3003: 'You are not permitted to access another user\'s data.',
    3004: 'Only project owner can set it, please contact project owner for assistance.',
    4001: 'Issue not found.',
    7005: 'Maximum number of {object} in a project is {num}.',
    8001: '{service_name} error: {response}',
    9001: 'Internal exception: {type}: {exception}',
    9003: 'An unexpected database error has occurred: {message}',
    9999: 'An unknown error has occurred.'
  },
  errorDetail: {
    locked: 'Locked',
    closed: 'Closed',
    trace_order: '@:Track.CheckRule'
  },
  general: {
    Name: 'Name',
    Title: 'Title',
    Add: 'Add',
    Edit: 'Edit',
    Delete: 'Delete',
    Participate: 'Participate',
    ProjectId: 'Project ID',
    Remove: 'Remove',
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
    owner_name: 'Project Manager',
    Department: 'Department',
    UserTitle: 'Title',
    Back: 'Back',
    All: 'All',
    Preview: 'Preview',
    SelectAll: 'Select All',
    Search: 'Search',
    Filter: 'Filter',
    Settings: '{name} Setting',
    Transfer: 'Transfer',
    DueDate: 'Due Date',
    Branch: 'Branch',
    Total: 'Total',
    AdvancedSettings: '》Advanced Settings',
    year: 'year',
    month: 'month',
    week: 'week',
    Report: 'Report',
    Nothing: 'N/A',
    ScrollToTop: 'Scroll to Top',
    ScrollToBottom: 'Scroll to Bottom',
    group: 'Group',
    on: 'On',
    off: 'Off',
    Index: 'Index',
    Account: 'Account',
    Password: 'Password'
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
    FileSizeLimit: 'This file cannot be uploaded because it exceeds the maximum allowed file size ({size})',
    FileNameLimit: 'A filename cannot contain any of the special characters.',
    LoadFail: 'Something went wrong, please contact your system administrator.',
    UnSavedChanges: 'Do you really want to leave? you have unsaved changes!',
    confirmDelete: 'Are you sure to @:(general.Delete)?',
    confirmDeleteSth: 'Are you sure to @:(general.Delete)「{name}」？'
  },
  RuleMsg: {
    PleaseInput: 'Please input',
    PleaseSelect: 'Please select',
    Invalid: ' Invalid',
    Member: ' @:Member.Member',
    Email: ' email',
    UserName: ' user name',
    Password: ' password',
    Description: ' description',
    InputNewPwd: 'Please input new password',
    InputRepeatPwd: 'Please input repeat password'
  },
  TestCase: {
    Index: 'Requests',
    Method: 'Method',
    Path: 'Path',
    TestResult: 'Test Result',
    TestMessage: 'Test Message',
    SearchKey: '搜尋 Collection 名稱',
    SearchNameOrPathOrTestResult: 'Search Name/Path/Test Result',
    TestItem: '{count} Test Item | {count} Test Items',
    Pass: 'Pass',
    Fail: 'Fail'
  },
  CheckMarx: {
    ScanId: 'Scan ID',
    Branch: '@:general.Branch',
    Commit: 'Commit',
    HighSeverity: 'High Severity',
    MediumSeverity: 'Medium Severity',
    LowSeverity: 'Low Severity',
    InfoSeverity: 'Info Severity',
    RunAt: 'Start Time',
    Report: '@:general.Report',
    SearchScanId: 'Search Scan ID',
    noScan: 'This project does not have any scan.',
    notCompletedScan: 'The scan is not completed yet. It may take several hours to complete.',
    generatingReportScan: 'Scan done, the system is generating a report. It may take several minutes to complete.',
    canceledScan: 'The scan is canceled.',
    failedScan: 'The scan failed.',
    removedScan: 'The scan removed.',
    registryReport: 'The report no longer exists, regenerate report?',
    registryReportTip: 'It might takes 3-5 minutes to regenerate report, please refresh page later.',
    New: 'New',
    Queued: 'Queued',
    Scanning: 'Scanning',
    Finished: 'Finished',
    Failed: 'Failed',
    InProcess: 'In Process'
  },
  WebInspect: {
    ScanId: 'Scan ID',
    Branch: '@:general.Branch',
    Commit: 'Commit',
    Critical: 'Critical',
    HighSeverity: 'High Severity',
    MediumSeverity: 'Medium Severity',
    LowSeverity: 'Low Severity',
    InfoSeverity: 'Info Severity',
    BpSeverity: 'Best Practice',
    RunAt: 'Start Time',
    Report: '@:general.Report',
    TestReport: 'Test Report',
    DownloadReport: 'Download Report',
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
    DragFilesHere: 'or drag and drop files here.',
    ChooseFile: 'Select File',
    InputName: 'Enter Name or Use Upload File Name',
    File: 'File',
    UploadAndSave: 'Upload File and Save',
    MaxFileSize: 'Max file size',
    AllowedFileTypes: 'Allowed file types',
    UploadWarning: 'A file name cannot contain any of'
  },
  Version: {
    Manage: 'Manage Project Versions',
    AddVersion: 'Add Version',
    EditVersion: 'Edit Version',
    Duration: 'Duration',
    Version: 'Version',
    SelectVersion: 'Select Version',
    Id: 'Id',
    closed: 'Closed',
    open: 'Open',
    Open: 'Open',
    Locked: 'Locked',
    EndDate: 'EndDate',
    ConfirmDelete: 'Are you sure to @:(general.Delete) 「{version}」?'
  },
  MyWork: {
    AssignedToMe: 'Assigned to me',
    ReportedIssue: 'Reported Issue'
  },
  Issue: {
    status: '@:general.Status',
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
    SelectVersion: '@:Version.SelectVersion',
    SelectPriority: 'Select @:Issue.Priority',
    SelectStatus: 'Select @:general.Status',
    SelectMember: '@:Member.SelectMember',
    CleanFilter: 'Clean Filter',
    SearchNameOrAssignee: 'Search ID, Name Or Assignee',
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
    AddBy: 'Added {created_date} by {user}',
    Author: 'Author',
    CommentTime: 'Comment Time',
    ParentIssue: 'Parent Issue',
    ChildrenIssue: 'Children Issue',
    Active: 'Active',
    Assigned: 'Assigned',
    InProgress: 'In Progress',
    Solved: 'Solved',
    Verified: 'Verified',
    Closed: 'Closed',
    Responded: 'Responded',
    Finished: 'Finished',
    Unknown: 'Unknown',
    Low: 'Low',
    Normal: 'Normal',
    High: 'High',
    Immediate: 'Immediate',
    Document: 'Document',
    Research: 'Research',
    Epic: 'Epic',
    Audit: 'Audit',
    Feature: 'Feature',
    Bug: 'Bug',
    Issue: 'Issue',
    'Change Request': 'Change Request',
    Risk: 'Risk',
    'Test Plan': 'Test Plan',
    'Fail Management': 'Fail Management',
    DeleteIssue: 'Are you sure to Delete {issueName}?',
    RemoveIssueRelation: 'Are you sure to Unlink Issue Relation?',
    AskDeleteIssue: 'Close work item/issue?',
    DeleteIssueReason: 'Please specify the reason for closure',
    Unlink: 'Unlink',
    TestFile: '@:route.testFile',
    TestResult: '@:TestCase.TestResult',
    Files: 'Files',
    UploadFiles: 'Upload Files',
    DeleteFile: 'Are you sure to Delete File?',
    RemovedIssue: 'The issue you were trying to edit doesn\'t exist or has been removed.',
    id: 'ID',
    name: 'Name',
    priority: '@:Issue.Priority',
    tracker: '@:general.Type',
    assigned_to: '@:Issue.Assignee',
    fixed_version: '@:Version.Version',
    me: '<<Me>>',
    ChildrenNotClosed: 'Children Issue are Not Closed',
    NoAssignee: 'Issue need a Assignee',
    VersionUndecided: 'Version Undecided',
    Unassigned: '@:Dashboard.Unassigned',
    RelatedIssue: 'Related Issue',
    DisplayClosedIssue: 'Show Closed Issues',
    DisplayClosedVersion: 'Show Closed Versions',
    open: '@:Version.Open',
    closed: '@:Version.closed',
    locked: '@:Version.Locked',
    ResetESCTip: 'Press Windows+ESC (Mac:Command+ESC) to Rest and Close Description Input area.',
    ChildrenNotClosedWarning: 'There are still sub-topics of this topic that have not been dealt with. Please enter the topic to confirm and close before moving.',
    PackageRecord: 'Package Record',
    NoImage: 'No Image',
    PackageVersionTime: 'Package Version Time',
    SourceCode: 'Source Code',
    IssueList: 'Issue List',
    DetermineContinue: 'Determine To Continue',
    NoImageWarning: 'There is no image file. Do you want to continue package version or press "Cancel" to give up?',
    NextStep: 'Next Step>',
    detail: {
      message: {
        set_to: '{creator} {message}',
        creator: '{user}{action} ({time}) {detail}',
        detail: 'Detail',
        Before: 'Before',
        After: 'After',
        Add: '@:general.Add'
      },
      assigned_to_id: '@:Issue.Assignee',
      subject: '@:general.Title',
      description: '@:Issue.Description',
      estimated_hours: '@:Issue.Estimate',
      start_date: '@:Issue.StartDate',
      due_date: '@:Issue.EndDate',
      priority_id: '@:Issue.Priority',
      status_id: '@:general.Status',
      tracker_id: '@:general.Type',
      fixed_version_id: '@:Version.Version',
      attachment: '@:Issue.Files',
      parent_id: '@:Issue.ParentIssue',
      relation: '@:Issue.RelatedIssue',
      attr: '@:Issue.DoneRatio'
    },
    FilterDimensions: {
      label: 'Filter Dimensions',
      status: 'Status',
      tracker: 'Type',
      assigned_to: 'Assigned',
      fixed_version: 'Version',
      priority: '@:Issue.Priority'
    },
    Display: 'Display',
    DragTip: 'Drag to issue, it can change {key} to {value}.',
    GroupBy: 'Group by {filter}',
    OriginalSetting: 'Original Setting',
    Result: 'Result',
    LastResult: 'Recently Result',
    NotExist: 'Data Not Exists',
    TraceabilityMatrix: 'Traceability Matrix',
    CheckChildrenIssueStatus: 'Check Children Issue Status',
    OriginalParentIssue: 'Original @:Issue.ParentIssue',
    NoParentIssue: 'No @:Issue.ParentIssue',
    Copy: 'Copy',
    CopyIssue: '@:Issue.Copy @:Issue.Issue',
    batchTransfer: 'Batch Transfer',
    batchClose: 'Batch Close',
    UploadSuccess: 'Upload Success',
    List: 'Issue List',
    TransferIssueTo: 'Transfer {value} issues to？'
  },
  Test: {
    TestPlan: {
      no: 'No',
      name: 'Test Plan',
      relations: 'Purpose',
      software_name: 'Tool',
      file_name: 'Test File',
      test_result: 'Test Result',
      branch: 'Branch'
    },
    TestFile: {
      UploadTestSet: 'Upload Test Set',
      TestSoftware: 'Test Software',
      TestName: 'Test Name',
      PostmanUpload: 'Postman Filename Rule: {file_name}.postman_collection.json ( Postman UI 匯出的格式(V2.1))',
      SideeXUpload: 'Sideex Filename Rule: {file_name}.sideex.json'
    }
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
        projects: 'Projects',
        overdue: '@:Project.overdue',
        not_started: '@:Project.not_started',
        in_progress: '@:Project.in_progress'
      },
      ProjectMembers: {
        NAME: 'Project Members',
        project_name: '@:general.project_name',
        owner_name: '@:general.owner_name',
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
        NAME: 'Test results (Quantity and Quality)',
        DETAIL: 'Test results (Latest)',
        project_name: '@:general.project_name',
        count: 'Test counts',
        success: 'Success',
        fail: 'Fail',
        total: 'Test cases',
        run_at: 'Last test',
        rate: 'Pass rate'
      },
      ProjectList: {
        NAME: 'Project list',
        user_name: 'PM',
        unclosed_count: '# unsolved',
        project_count: '# projects',
        project_name: '@:general.project_name',
        owner_name: '@:general.owner_name',
        project_status: 'Status',
        complete_percent: 'Progress',
        unclosed_issue_count: 'Unsolved',
        closed_issue_count: 'Solved',
        member_count: 'Members',
        expired_day: 'Remains(day)',
        all: 'All',
        overdue: 'Overdue',
        in_progress: 'In Progress',
        not_started: 'Not Started',
        csv_download: 'Download CSV',
        all_download: 'Download all',
        organization: 'Organization',
        project_start_date: 'Project start date',
        project_due_date: 'Project due date'
      }
    }
  },
  Member: {
    Member: 'Member',
    Manage: 'Manage Project Members',
    ProjectOwner: 'Project Owner',
    ProjectMember: 'Project Member',
    AddMember: 'Add Member',
    Id: 'Id',
    Phone: 'Phone',
    Role: 'Role',
    Account: 'Account',
    SelectMember: 'Select Member',
    confirmRemove: 'Are you sure to @:(general.Remove)?',
    TransferIssue: 'Transfer Issue  〉',
    ConfirmTransfer: '{userRole}  ({userName}) has {unClosedIssueCount} unclosed issues. For the integrity of this project, please transfer or close issues before remove this member.',
    ConfirmRemoveMember: 'Are you sure to @:(general.Remove) {userRole}（{userName}）？'
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
    Starred: 'Star Project',
    AddProject: 'Add Project',
    EditProject: 'Edit Project',
    NameIdentifier: 'Name / Identifier',
    Name: 'Name',
    Identifier: 'Identifier',
    Info: 'Project Info',
    Template: 'Template',
    TemplateName: 'Template Name',
    TemplateDescription: 'Template Description',
    Version: 'Version',
    IssueStatus: 'Issue Status',
    IssueProgress: 'Progress',
    IssueUpdate: 'Last Updated',
    Progress: 'Progress',
    UpdateTime: 'Update Time',
    deleteProjectConfirmText:
      'This action cannot be undone. This will permanently delete the project, including all commits, issues, test cases and files.',
    PleaseType: 'Please type',
    AndThen: 'to proceed or close this modal to cancel.',
    IdRule:
      'Identifier should be 2-30 lowercase or number characters long and "-" can be accepted at the middle of string and only numbers cannot be accepted.',
    DisplayRule: 'Name cannot includes "<" or "&"',
    DescriptionRule: 'Description cannot includes "<" or "&"',
    WorkloadValue: 'Workload',
    UpcomingDeadline: 'Upcoming Deadline',
    Title: 'Title',
    Branches: 'Branches',
    LastTest: 'Last Test',
    LastTestResult: 'Last Test Result',
    SearchIdentifier: 'Please Input Project Identifier',
    SearchProjectName: 'Search Project Name',
    SearchProjectNameOrId: 'Search Project Name or ID',
    SearchProjectNameOrManagerOrOrganization: 'Search Project Name, Manager or Organization',
    StartDate: 'Start Date',
    Owner: 'Project Owner',
    SelectProject: 'Select a project',
    SelectTemplate: 'Select a template',
    overdue: 'Overdue',
    not_started: 'Not Started',
    in_progress: 'In Progress',
    closed: 'Closed',
    ProjectPeriod: 'Project Period(due date)',
    ProjectOwner: '@:general.owner_name',
    DueDate: '@:general.DueDate'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: 'Last Update Time',
    Environment: 'Environment',
    SearchBranch: 'Search Branch',
    Branch: '@:general.Branch'
  },
  ProgressPipelines: {
    Id: 'Id',
    TestItems: 'Test Items',
    Commit: 'Commit',
    Branch: '@:general.Branch',
    CommitMessage: 'Commit Message',
    TransitioningMessage: 'Transitioning Message',
    LastUpdateTime: 'Last Update Time',
    SearchCommitMessage: 'Search Commit Message',
    TestDetail: 'Test Detail'
  },
  ProcessDevEnvironment: {
    Branch: '@:general.Branch',
    Deployment: 'Deployment',
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
    Branch: '@:general.Branch',
    TestPass: 'Test Pass',
    TestFail: 'Test Fail',
    TestTotal: 'Test total',
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
    SearchPlaceholder: 'Search User, Action Type or Action Parts'
  },
  Maintenance: {
    AddSecret: 'Add Secret',
    SecretName: 'Secret Name',
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
    Image: 'Image',
    ExecuteShellNotify: 'This page provides command-line tool to communicate with your Pod, currently supported commands are:'
  },
  Loading: 'Loading...',
  Updating: 'Updating...',
  Harbor: {
    PushTime: 'Push Time'
  },
  System: {
    Secrets: 'Secrets',
    Registry: 'Registry',
    RedmineMail: 'Redmine Mail'
  },
  PipeLines: {
    TestDetail: 'Test Detail'
  },
  Git: {
    Branch: '@:general.Branch',
    Commit: 'Commit',
    searchCommitId: 'Search Commit ID'
  },
  SonarQube: {
    ViewReport: 'View Report',
    Bugs: 'Bugs',
    Vulnerabilities: 'Vulnerabilities',
    CodeSmells: 'Code Smells',
    Duplicates: 'Duplicates',
    Coverage: 'Coverage',
    code_smells: 'Code Smells',
    sqale_index: 'Technical Debt',
    vulnerabilities: 'Vulnerabilities',
    duplicated_lines_density: 'Duplicated lines (%)',
    bugs: 'Bugs',
    coverage: 'Coverage',
    reliability_rating: 'Reliability Rating',
    duplicated_blocks: 'Duplicated blocks',
    sqale_rating: 'Maintainability Rating',
    security_rating: 'Security Rating',
    security_hotspots: 'Security Hotspots',
    alert_status: 'Quality Gate Status'
  },
  Log: {
    duration: 'Duration',
    fullLog: 'Report',
    testId: 'Test ID'
  },
  Zap: {
    id: 'ID',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },
  Sideex: {
    promptMessage: 'The system provides the latest 5 reports to download.',
    suitesPassedRatio: 'Suites Passed',
    suitesPassedTotal: 'Suites Passed Total',
    casesPassedRatio: 'Cases Passed',
    casesPassedTotal: 'Cases Passed Total'
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
    releaseDone: 'Done releasing version {0}.',
    startPackageVersion: 'Start Package Version',
    stopPackageVersion: 'Stop Package Version',
    checkIssue: 'Check Issues',
    packageVersionSettings: 'Package Version Settings'
  },
  SystemVersion: {
    Source: 'Source',
    Version: '@:Version.Version',
    CommitID: 'Commit ID',
    hasUpdate: 'New version is available.',
    UpdateNow: 'Update Now',
    Develop: 'Develop',
    NewVersion: 'New Version',
    UpdateFailed: 'Update Failed',
    DeploymentName: 'Deployment Name',
    DeploymentUuid: 'Deployment UUID',
    ReloadSystem: 'Reload System',
    UpdatedNotify: 'Please reload this page after a few minutes to check if the update is complete.'
  },
  LoadingText: {
    createRedmine: 'Adding a Redmine project...',
    createGitLab: 'Creating GitLab resources...',
    createHarbor: 'Linking to Harbor resources...',
    integrationProject: 'Start integrating project resources...',
    loadingTemplateText: 'Update latest templates'
  },
  TrackManagement: {
    description: 'Change content(Issue description)',
    relations: 'Original demand/Issues',
    assigned_to: 'Assignee'
  },
  Track: {
    StartingPoint: 'Starting Point',
    StartPaint: 'Start Paint',
    TraceChecking: 'Traceability checking might take at least 3-5 mins, please come back to check later......',
    DownloadExcel: 'Download the Excel summary sheet',
    DemandTraceability: 'Demand Traceability',
    CheckRule: 'Check Rule',
    CheckOrder: 'Check Order',
    CheckRuleSettings: 'Setting',
    Download: 'Download',
    TraceabilityCheck: 'Traceability Check',
    Run: 'Run',
    Portrait: 'Portrait',
    Landscape: 'Landscape',
    Enable: 'Enable',
    SelectTracker: 'Select a Tracker',
    Run_at: 'Run at',
    Running_time: 'Running time',
    OnlyCheckRule: 'only {0} rules can be set.',
    OnlyCheckOrder: 'only {0} ~ {1} order in an rule.',
    AddCheckRule: 'Add Check Rule'
  },
  ProjectRoadmap: {
    DisplayRange: 'Display Range'
  },
  TestReport: {
    TestTime: 'Test Time',
    Commit: 'Commit',
    WhiteBoxTesting: 'White-box Testing(Source Code Scanning)',
    BlackBoxTesting: 'Black-box Testing(Weakness Scanning)',
    ApiScriptTesting: 'API Script Testing',
    WebScriptTesting: 'Web Script Testing',
    DetailReport: 'Detail Report',
    DownloadPdf: 'Download PDF',
    DownloadCsv: 'Download CSV',
    DownloadExcel: 'Download EXCEL',
    Item: 'items',
    WarningPartOne: 'If no data, please connect',
    WarningPartTwo: 'to confirm whether the report has been produced',
    CheckMarxReport: 'CheckMarx'
  },
  ProjectSettings: {
    GeneralSettings: 'General Settings',
    NotifySettings: 'Notify Settings',
    IssueReminderFeature: 'Issue Reminder Feature',
    Index: '@:general.Index',
    NotificationConditions: 'Notification Conditions',
    Days: 'Days',
    Status: '@:general.Status',
    Actions: '@:general.Actions',
    NotYetEnabled: 'Not Yet Enabled',
    Comming: '__?__ days notice before due date',
    Unchange: 'The issue has not changed continuously for more than __?__ days',
    EnableMessage: 'The reminder feature has been successfully turned on',
    DisableMessage: 'The reminder feature has been successfully turned off',
    SuccessUpdateAlertSettings: 'The reminder Settings have been updated successfully'
  },
  SystemDeploySettings: {
    RemoteDeploymentEnvironment: 'Remote Env.',
    Index: '@:general.Index',
    ClusterName: 'Cluster Name',
    Account: '@:general.Account',
    LastUpdateTime: 'Last Update Time',
    Status: '@:general.Status',
    Actions: '@:general.Actions',
    ImpressionFileRepo: 'Impression File Repository',
    RegistryName: 'Registry Name',
    KubeConfigTextareaHint: 'Please directly paste Kubenate config or use the above to upload the file and upload directly',
    ClusterMessage: 'The Cluster settings have been updated successfully',
    RegistryMessage: 'The Registry settings have been updated successfully',
    FailMessage: 'Please check if the content of the form is correct and fill in the password',
    FillInPassword: 'Please fill in password',
    NoService: 'No service',
    NoImage: 'No image',
    Initializing: 'Initializing',
    StartReplication: 'Synchronizing',
    Finished: 'Finished',
    StartDeployment: 'Setting up'
  },
  Deploy: {
    AddApplication: 'Add Application',
    ApplicationSetting: 'Application Setting',
    ID: 'ID',
    Name: 'Application Name',
    Cluster: 'Cluster',
    Release: 'Release Version',
    Status: 'Status',
    Start: 'Start',
    Stop: 'Stop',
    Redeploy: 'Redeploy',
    Stopped: 'Stopped',
    Registry: 'Registry',
    Namespace: 'Namespace',
    Policy: 'Policy',
    Resource: 'Resource Settings',
    CPU: 'CPU',
    Memory: 'Memory',
    Replicas: 'Replicas',
    Network: 'Network Settings',
    Type: 'Type | Types',
    Protocol: 'Protocol',
    Port: 'Port',
    Domain: 'Domain Name',
    Path: 'Path',
    EnvironmentVariable: 'Environment Variable',
    AddVariable: 'Add Variable',
    Key: 'Key | Keys',
    Value: 'Value',
    Default: '(default)',
    KeyConflicts: '[System Variable] Variable conflicts : Please fix the following variables and re-save. {0}',
    KeyPair: 'Key[{0}] at {1} line.',
    AllNull: 'Please check all {0} are not null',
    PairCondition: 'Please input {0}. {1} are a pair condition.',
    ReleaseHelper: 'above release version requires an image included.',
    NoSetting: 'Deploy setting is not yet ready, please check with your system administrator.'
  },
  Validation: {
    Input: 'Please Input {0}',
    Select: 'Please Select {0}',
    Invalid: '{0} is invalid',
    Number: 'Number'
  },
  Plugins: { NoArguments: 'No Arguments.', ...asyncLangs }
}
