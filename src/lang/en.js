export default {
  route: {
    Dashboard: 'Dashboard',
    Projects: 'Projects',
    'Project List': 'Project List',
    'PM Project List': 'PM Project List',
    Project: 'Project',
    Overview: 'Overview',
    'Current Activity': 'Current Activity',
    Progress: 'Progress',
    'Dev Branch': 'Dev Branch',
    'Test Record': 'Test Record',
    'Dev Branch Test Result': 'Dev Branch Test Result',
    Issues: 'Issues',
    Wiki: 'Wiki',
    'Issue List': 'Issue List',
    'File List': 'File List',
    Test: 'API Test',
    'Test Case': 'API Test Case',
    'Test Case (Expert)': 'API Test Case(Expert)',
    Setting: 'Setting',
    Members: 'Members',
    Versions: 'Versions',
    'User Manage': 'User Manage',
    'Activity Log': 'Activity Log',
    Roadmap: 'Project Roadmap',
    'Project Graph': 'Git Graph'
  },
  navbar: {
    logOut: 'Log Out',
    profile: 'Profile',
    versions: 'Versions'
  },
  general: {
    Name: 'Name',
    Edit: 'Edit',
    Delete: 'Delete',
    Actions: 'Actions',
    Type: 'Type',
    Status: 'Status',
    Confirm: 'Confirm',
    Cancel: 'Cancel',
    SearchName: 'Search Name',
    Description: 'Description',
    Active: 'Active',
    NoData: 'No Data',
    NoIssue: 'No Issue',
    Email: 'Email',
    Creator: 'Creator',
    CreateTime: 'Create Time',
    UpdateTime: 'Update Time',
    PleaseInput: 'Please Input',
    Close: 'Close',
    Disable: 'Disable',
    Enable: 'Enable'
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
    TestResult: 'Test Result'
  },
  TestItem: {
    TestItem: 'Test Item',
    AddTestItem: 'Add Test Item',
    EditTestItem: 'Edit Test Item',
    Id: 'Id',
    IsPass: 'Is Pass?'
  },
  TestValue: {
    TestValue: 'Test Value',
    AddTestValue: 'Add Test Value',
    EditTestValue: 'Edit Test Value',
    Type: 'Type',
    Location: 'Location',
    SelectTestItem: 'Select Test Item',
    SearchValue: 'Search Value'
  },
  File: {
    AddFile: 'Add File',
    Upload: 'Upload',
    Id: 'Id',
    Download: 'Download',
    DrapFileHereOrClickUpload: 'Drap File Here Or Click Upload'
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
    Id: 'Id',
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
    Addby: 'Added by {user}',
    Author: 'Author'
  },
  Wiki: {
    AddWiki: 'Add Wiki',
    Title: 'Title',
    Content: 'Content',
    SearchTitle: 'Search Title',
    edited: '{user} edited this page'
  },
  Dashboard: {
    UnfinishIssues: 'Unfinish Issues',
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
    Password: 'Password'
  },
  Project: {
    AddProject: 'Add Project',
    EditProject: 'Edit Project',
    NameIdentifier: 'Name / Identifier',
    Name: 'Name',
    Identifier: 'Identifier',
    Status: 'Status',
    Progress: 'Progress',
    UpdateTime: 'Update Time',
    deleteProjectComfirmText:
      'This action can lead to data loss. To prevent accidental actions we ask you to confirm your intention.',
    PleaseType: 'Please type',
    AndThen: 'to proceed or close this modal to cancel.',
    IdRule:
      'Identifier should be 2-255 lowercase or number characters long and "-" can be accepted at the middle of string and only numbers cannot be accepted.',
    Workload: 'Workload',
    WorkloadValue: 'Workload',
    UpcommingDeadline: 'Upcomming Deadline',
    ProjectMembers: 'Project Members',
    TestStatus: 'Test Status',
    Title: 'Title',
    Branches: 'Branches',
    LastTest: 'Last Test',
    LastTestResult: 'Last Test Result',
    Searchidentifier: 'Please input project identifier',
    Report: 'Report',
    Brief: 'Brief',
    Software: 'Software',
    SearchProjectName: 'Search Project Name'
  },
  ProjectActive: {
    Active: 'Active',
    Assigned: 'Assigned',
    Solved: 'Solved',
    Responsed: 'Responsed',
    Finished: 'Finished',
    Closed: 'Closed'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: 'LastUpdateTime',
    Environment: 'Environment',
    SearchBranch: 'Search Branch',
    Branch: 'Branch'
  },
  ProcessDevBranchTest: {
    Id: 'Id',
    CommitShortId: 'Commit Short Id',
    Branch: 'Branch',
    Status: 'Status',
    CommitMessage: 'Commit Message',
    LastUpdateTime: 'Last Update Time',
    SearchCommitMessage: 'Search Commit Message'
  }
}
