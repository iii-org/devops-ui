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
    'Test Case (Export)': 'API Test Case(Export)'
  },
  navbar: {
    dashboard: 'Dashboard',
    github: 'Github',
    logOut: 'Log Out',
    profile: 'Profile',
    theme: 'Theme',
    size: 'Global Size',
    versions: 'Versions'
  },
  login: {
    title: 'Login Form',
    logIn: 'Login',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Can not be simulated on local, so please combine you own business simulation! ! !'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    addRole: 'New Role',
    editPermission: 'Edit',
    roles: 'Your roles',
    switchRoles: 'Switch roles',
    tips:
      'In some cases, using v-permission will have no effect. For example: Element-UI  el-tab or el-table-column and other scenes that dynamically render dom. You can only do this with v-if.',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  guide: {
    description:
      'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    tinymceTips:
      'Rich text is a core feature of the management backend, but at the same time it is a place with lots of pits. In the process of selecting rich texts, I also took a lot of detours. The common rich texts on the market have been basically used, and I finally chose Tinymce. See the more detailed rich text comparison and introduction.',
    dropzoneTips:
      'Because my business has special needs, and has to upload images to qiniu, so instead of a third party, I chose encapsulate it by myself. It is very simple, you can see the detail code in @/components/Dropzone.',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    backToTopTips1:
      'When the page is scrolled to the specified position, the Back to Top button appears in the lower right corner',
    backToTopTips2:
      'You can customize the style of the button, show / hide, height of appearance, height of the return. If you need a text prompt, you can use element-ui el-tooltip elements externally',
    imageUploadTips:
      'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Imp',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'reviewer',
    id: 'ID',
    date: 'Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  example: {
    warning:
      'Creating and editing pages cannot be cached by keep-alive because keep-alive include does not currently support caching based on routes, so it is currently cached based on component name. If you want to achieve a similar caching effect, you can use a browser caching scheme such as localStorage. Or do not use keep-alive include to cache all pages directly. See details'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description:
      'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export Selected Items',
    placeholder: 'Please enter the file name (default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name (default file)'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  theme: {
    change: 'Change Theme',
    documentation: 'Theme documentation',
    tips:
      'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    tagsView: 'Open Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo'
  },
  general: {
    Name: 'Name',
    Edit: 'Edit',
    Delete: 'Delete',
    Actions: 'Actions',
    Confirm: 'Confirm',
    Cancel: 'Cancel',
    SearchName: 'Search Name'
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
    DrapFileHereOrClickUpload: 'Drap File Here Or Click Upload',
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
    EndDate: 'EndDate',
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
    Limit: 'Limit'
  },
  Wiki: {
    AddWiki: 'Add Wiki',
    Title: 'Title',
    Content: 'Content',
    SearchTitle: 'Search Title',
  },
  Dashboard:　{
    UnfinishIssues: 'Unfinish Issues',
    IssuesShouldBeClosedWithinThisWeek: 'Issues Should Be Closed Within This Week',
    IssuesShouldBeClosedWithinThisMonth: 'Issues Should Be Closed Within This Month',
    Finished: 'Finished',
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
    PasswordRule: 'Password Rule',
    Save: 'Save'
  }
}
