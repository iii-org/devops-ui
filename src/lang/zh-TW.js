export default {
  route: {
    dashboard: '儀表板',
    projectOverview: '專案總覽',
    projectList: '專案列表',

    planList: '工作規劃',
    issueTracking: '議題追蹤',
    issueTrackChart: '需求追溯表',

    testManagement: '測試管理',
    testFile: '測試檔案',
    testPlan: '測試計畫',

    singleProject: '個別專案',
    kanban: '議題看板',
    issueList: '議題列表',
    createTest: '測試創建',
    testItem: '測試項目',
    overview: '專案總覽',
    wikiList: 'Wiki列表',
    fileList: '檔案列表',

    'Activity Log': '議題異動紀錄',
    'Project Roadmap': '專案藍圖',
    advanceBranchSettings: '進階分支設定',
    'Project Settings': '專案設定',

    devProgress: '開發進度',
    devBranch: '開發分支',
    gitGraph: '開發線圖',
    pipelines: 'Pipeline',
    devEnvironment: '實證環境',
    kubernetesResources: 'Kubernetes 資源',
    releaseVersion: '釋出版本',

    autoTesting: '測試紀錄',
    postman: 'API 測試(Postman)',
    fromDevops: '來自 DevOps',
    fromCollection: '來自 Postman Collection',
    checkMarx: '白箱測試(CheckMarx)',
    sonarQube: '白箱測試(SonarQube)',
    webInspect: '黑箱測試(WebInspect)',
    webInspectReport: '報告',
    zap: '黑箱測試(OWASP ZAP)',
    sideex: 'ＷEB 測試(Sideex)',

    'System Resource': '系統資源',
    Kubernetes: 'Kubernetes',
    'Deployment List': 'Deployment 列表',
    'Pods List': 'Pods 列表',
    'Service List': 'Service 列表',
    'Secret List': 'Secret 列表',
    'ConfigMaps List': 'ConfigMaps 列表',

    'Plugin Resource': 'Plugin 資源',
    Harbor: 'Harbor 資源',

    Activities: '操作記錄',
    'Project Activities': '操作紀錄',

    Settings: '設定管理',
    'Participate Project': '參與專案',
    Members: '成員管理',
    Versions: '版本設定',

    Issues: '專案議題',
    'Issue Detail': '議題內容',

    Admin: '系統設定',
    'Account Manage': '帳號管理',
    'System Activities': '系統紀錄',
    'System Plugin Manage': '系統插件管理',
    'Project Settings (QA)': '專案品控清單設置',
    'Dev Branch Test Result': '開發分支測試紀錄',

    Artifacts: '資源成品',

    'System Arguments': '參數設定',

    track: '追溯管理',
    changeManagement: '變更管理',
    'Fail Management': '異常管理'
  },
  navbar: {
    logOut: '登出',
    profile: '個人資料',
    versions: '版本資訊'
  },
  errorMessage: {
    1001: '專案代號 {identifier} 已被使用。',
    1002: '專案代號 {name} 違反命名規則。專案代號只能使用小寫字母、數字、減號，且頭尾不可為減號，且必須為 2 到 225 個字元。',
    1003: '找不到 ID 為 {project_id} 的專案。',
    1004: '找不到 ID 為 {repository_id} 的 repo。',
    1005: 'ID 為 {project_id} 的專案不存在於 redmine 中。',
    1006: '無法刪除此版本。',
    1011: '專案經理角色必須為 PM',
    2001: '找不到 ID 為 {user_id} 的使用者。',
    2002: '使用者名稱 {name} 違反命名規則。只能使用大寫字母、小寫字母、數字、減號、底線、句點，且頭尾必須是字母或數字，且必須為 2 到 60 個字元。',
    2003: '密碼需要為 8 到 20 個字元長，且必須包含至少一個大寫字母，一個小寫字母，以及一個數字。',
    2004: '密碼或使用者帳號錯誤。',
    2005: '此使用者名稱或電子郵件信箱已有人使用。',
    2006: '使用者 {user_id} 已經在專案 {project_id} 內了。',
    2007: '該使用者為本專案之專案經理，不可刪除。',
    3001: '您的角色沒有權限進行此項操作。',
    3002: '您需要屬於此專案才能進行這項操作。',
    3003: '您不被允許存取其他使用者的資料。',
    4001: '該議題不存在。',
    8001: '{service_name} 回報錯誤：{response}',
    9001: '內部錯誤：{type}: {exception}',
    9003: '發生未被預期的資料庫錯誤：{message}',
    9999: '發生未知錯誤。'
  },
  general: {
    Name: '名稱',
    Title: '標題',
    Add: '新增',
    Edit: '編輯',
    Delete: '刪除',
    Participate: '參與專案',
    ProjectId: '專案代碼',
    Remove: '移除',
    Actions: '操作',
    Type: '種類',
    Status: '狀態',
    Confirm: '確認',
    Save: '儲存',
    Cancel: '取消',
    SearchName: '搜尋名稱',
    SearchBranch: '搜尋分支',
    Description: '描述',
    Active: '專案狀態',
    NoData: '暫無資料',
    NoIssue: '暫無議題',
    Email: '信箱',
    Creator: '建立者',
    CreateTime: '建立時間',
    StartTime: '開始時間',
    UpdateTime: '更新時間',
    PleaseInput: '請輸入',
    Close: '關閉',
    Disable: '停用',
    Enable: '啟用',
    LastUpdateTime: '最終更新',
    Redeploy: '重新部署',
    Success: '成功',
    Warning: '警告',
    Info: '資訊',
    Error: '錯誤',
    Refresh: '更新',
    RunAt: '執行時間',
    ScanAt: '掃描時間',
    Detail: '細節',
    Exit: '退出',
    Stop: '停止',
    Rerun: '重新運行',
    copied: '已複製。',
    caution: '注意！',
    ok: '確定',
    project_name: '專案名稱',
    owner_name: '專案經理',
    Department: '部門',
    UserTitle: '職稱',
    Back: '返回',
    All: '全部',
    Preview: '預覽',
    SelectAll: '全選',
    Search: '搜尋',
    Filter: '篩選'
  },
  Notify: {
    Updated: '已更新',
    Added: '已新增',
    Deleted: '已刪除',
    Uploaded: '已上傳',
    Created: '已建立',
    Copied: '已複製',
    Canceled: '已取消',
    Submit: '已送出',
    SwitchLanguage: '更換語言成功',
    NoProject: '目前沒有任何專案可供選擇，請先建立專案。',
    WrongProjectName: '請輸入正確的專案名稱。',
    WrongBranchName: '請輸入正確的分支名稱。',
    WrongResourceName: '請輸入正確的資源名稱。',
    WrongTagVersionName: '請輸入正確的版本名稱。',
    SingleFileLimit: '一次只能選擇一個檔案，請先移除已選擇的檔案。',
    UnsupportedFileFormat: '無法上傳，不支援此種檔案格式。',
    FileSizeLimit: '超過可上傳的檔案大小 (20 MB)。',
    LoadFail: '讀取失敗，請洽您的系統管理員。',
    UnSavedChanges: '您編輯的內容尚未儲存，確定離開嗎？'
  },
  TestCase: {
    Index: '項次',
    TestCase: '測試案例',
    AddTestCase: '新增測試案例',
    EditTestCase: '編輯測試案例',
    Id: '測試編號',
    Type: '類型',
    Description: '描述',
    Method: '方法',
    Path: '路徑',
    TestResult: '測試結果',
    TestMessage: '回傳訊息',
    SearchName: '搜尋 名稱、回傳訊息',
    SearchNameOrPathOrTestResult: '搜尋名稱或路徑或測試結果',
    TestItem: '{count} 測試項目',
    Pass: '通過',
    Fail: '失敗',
    TestPass: '測試通過',
    TestFail: '測試失敗'
  },
  RuleMsg: {
    PleaseInput: '請輸入',
    PleaseSelect: '請選擇',
    Invalid: '無效的',
    Member: '@:Member.Member',
    Email: '信箱',
    UserName: '使用者名稱',
    Password: '密碼',
    Description: '敘述',
    InputNewPwd: '請輸入新密碼',
    InputRepeatPwd: '請再次輸入密碼'
  },
  TestItem: {
    TestItem: '測試項目',
    AddTestItem: '新增測試項目',
    EditTestItem: '編輯測試項目',
    Id: '編號',
    IsPass: '是否通過?'
  },
  CheckMarx: {
    ScanId: '測試編號',
    Branch: '分支',
    Commit: 'Commit',
    Status: '狀態',
    HighSeverity: '高風險',
    MediumSeverity: '中風險',
    LowSeverity: '低風險',
    InfoSeverity: '資訊',
    RunAt: '開始時間',
    Report: '報告',
    SearchScanId: '搜尋 測試編號'
  },
  WebInspect: {
    ScanId: '測試編號',
    Branch: '分支',
    Commit: 'Commit',
    Status: '狀態',
    Critical: '嚴重',
    HighSeverity: '高風險',
    MediumSeverity: '中風險',
    LowSeverity: '低風險',
    InfoSeverity: '資訊',
    BpSeverity: '最佳實作',
    RunAt: '開始時間',
    Report: '報告',
    SearchCommitId: '搜尋 Commit'
  },
  TestValue: {
    TestValue: '測試資料',
    AddTestValue: '新增測試資料',
    EditTestValue: '編輯測試資料',
    Type: '類型',
    Location: '位置',
    SelectTestItem: '選擇測試項目',
    SearchValue: '搜尋Value',
    PleaseSelectTestItem: '請選擇測試項目!'
  },
  File: {
    AddFile: '新增檔案',
    Upload: '上傳',
    Id: '檔案編號',
    Download: '下載',
    SelectFileOrDragHere: '請點擊選擇檔案或將檔案拖曳至此',
    UploadBtn: '選擇檔案',
    InputName: '請輸入，若未輸入預設為上傳檔案名稱',
    File: '檔案',
    UploadAndSave: '上傳檔案並儲存'
  },
  Version: {
    Manage: '專案版本管理',
    AddVersion: '新增版本',
    EditVersion: '修改版本',
    Duration: '期間',
    Version: '版本',
    SelectVersion: '選擇版本',
    Id: '版本編號',
    DueDate: '到期日',
    Open: '開啟',
    Closed: '關閉',
    Locked: '鎖定',
    EndDate: '結束日期'
  },
  Issue: {
    AddIssue: '新增議題',
    EditIssue: '編輯議題',
    AddSubIssue: '新增子議題',
    CloseIssue: '關閉議題',
    Id: '議題編號 / 議題名稱',
    Assignee: '受分配者',
    Priority: '優先權',
    Status: '@:general.Status',
    Estimate: '預估工時',
    DoneRatio: '完成比率',
    StartDate: '開始日期',
    EndDate: '結束日期',
    Description: '議題描述',
    SelectDate: '選擇日期',
    SelectType: '選擇種類',
    SelectPriority: '選擇@:Issue.Priority',
    SelectStatus: '選擇@:general.Status',
    CleanFilter: '清除篩選',
    SearchNameOrAssignee: '搜尋名稱或受分配者',
    Save: '儲存',
    Notes: '處理紀錄 / 訊息回覆',
    AddComment: '新增備註',
    Flow: '流程',
    FlowId: '流程編號',
    AddFlow: '新增流程',
    Parameter: '參數',
    AddParameter: '新增參數',
    Length: '長度',
    Limit: '限制',
    AddBy: '由 {user} 於 {created_date} 新增',
    Author: '作者',
    CommentTime: '加註於',
    ParentIssue: '父議題',
    ChildrenIssue: '子議題',
    Active: '已開立',
    Assigned: '已分派',
    InProgress: '進行中',
    Solved: '已解決',
    Verified: '已確認',
    Closed: '已關閉',
    Unknown: '狀態不明',
    Low: '低',
    Normal: '一般',
    High: '高',
    Immediate: '緊急',
    Epic: '需求規格',
    Audit: '合規需求',
    Feature: '功能設計',
    Bug: '程式錯誤',
    Issue: '議題',
    'Change Request': '變更請求',
    Risk: '風險管理',
    'Test Plan': '測試計畫',
    'Fail Management': '異常管理',
    DeleteIssue: '確認要刪除「{issueName}」嗎?',
    RemoveIssueRelation: '確認要移除關聯議題嗎?',
    AskDeleteIssue: '關閉工作項目/議題?',
    DeleteIssueReason: '請註明關閉原因',
    Unlink: '移除關聯',
    TestFile: '@:route.testFile',
    Files: '附件',
    UploadFiles: '附件上傳',
    DeleteFile: '確認要刪除附件嗎?',
    RemovedIssue: '議題已被刪除或找不到該議題',
    id: '編號',
    name: '議題名稱',
    priority: '@:Issue.Priority',
    tracker: '@:general.Type',
    assigned_to: '@:Issue.Assignee',
    me: '<<我自己>>',
    ChildrenNotClosed: '子議題未關閉',
    NoAssignee: '議題尚未指派',
    VersionUndecided: '版本未定',
    Unassigned: '@:Dashboard.Unassigned',
    RelatedIssue: '關聯議題',
    detail: {
      message: {
        set_to: '{creator} {message}',
        creator: '{user}{action} ({time}) {detail}',
        detail: '詳細資料',
        Before: '原始值',
        After: '變更後',
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
      relation: '@:Issue.RelatedIssue'
    },
    FilterDimensions: {
      label: '篩選維度',
      status: '議題狀態',
      tracker: '議題類別',
      assigned_to: '專案成員',
      fixed_version: '專案版本'
    },
    Display: '顯示',
    DragTip: '拖曳到議題，可以將 {key} 改變成 {value}',
    GroupBy: '以 {filter} 分組',
    OriginalSetting: '原先設定',
    Result: '搜尋結果'
  },
  Wiki: {
    AddWiki: '新增Wiki',
    Title: '標題',
    Content: '內容',
    SearchTitle: '搜尋標題',
    edited: '此頁面最後由 {user} 編輯'
  },
  Dashboard: {
    UnfinishedIssues: '未完成議題',
    IssuesShouldBeClosedWithinThisWeek: '本週該完成議題',
    IssuesShouldBeClosedWithinThisMonth: '本月該完成議題',
    Finished: '已完成',
    Unfinished: '未完成',
    Unassigned: '尚未指派',
    TotalVersion: '全部版本',
    TotalMember: '全部成員',
    Total: '全部',
    AssignIssuesPriority: '受分配議題優先權',
    AssignIssuesProject: '受分配議題優先權',
    AssignIssuesType: '受分配議題種類',
    IssueTrackingStatus: '問題追蹤狀態',
    Workload: '議題狀態',
    ProjectUsers: '專案成員',
    TestStatus: '測試狀態',
    Software: '軟體',
    Brief: '摘要',
    Report: '報表',
    ADMIN: {
      sync_date: '統計日期：{0}',
      Overview: {
        NAME: '總覽',
        projects: '專案數',
        overdue: '@:Project.overdue',
        not_started: '@:Project.not_started',
        in_progress: '@:Project.in_progress'
      },
      ProjectMembers: {
        NAME: '專案成員',
        project_name: '@:general.project_name',
        owner_name: '@:general.owner_name',
        member_count: '參與人數',
        start_date: '專案起始日',
        end_date: '專案結束日'
      },
      CommitLog: {
        NAME: 'Commit紀錄'
      },
      IssueRank: {
        NAME: '議題排行',
        DETAIL: '{0} - 待解決議題',
        user_name: '專案成員',
        unclosed_count: '尚待解決',
        project_count: '專案參與數',
        project_name: '@:general.project_name',
        issue_name: '議題名稱',
        issue_type: '議題類別',
        status_id: '狀態',
        start_date: '開立時間'
      },
      PassingRate: {
        NAME: '功能測試結果',
        DETAIL: '專案測試品質',
        project_name: '@:general.project_name',
        count: '累積測試次數',
        success: '成功',
        fail: '失敗',
        total: '測試個案數',
        run_at: '最近測試時間',
        rate: '通過率'
      },
      ProjectList: {
        NAME: '專案清單',
        user_name: '專案成員',
        unclosed_count: '尚待解決',
        project_count: '參與專案數',
        project_name: '@:general.project_name',
        owner_name: '@:general.owner_name',
        project_status: '執行狀態',
        complete_percent: '完成百分比',
        unclosed_issue_count: '未解決問題數',
        closed_issue_count: '已解決問題數',
        member_count: '參與人數',
        expired_day: '到期天數',
        end_date: '到期日',
        all: '全部',
        overdue: '已超時',
        in_progress: '時限內',
        not_started: '未開始',
        csv_download: '下載CSV',
        all_download: '全部下載',
        organization: '組織',
        project_start_date: '計畫起始日',
        project_due_date: '計畫結束日'
      }
    }
  },
  Member: {
    Member: '成員',
    Manage: '專案成員管理',
    ProjectOwner: '專案經理',
    ProjectMember: '專案成員',
    AddMember: '新增成員',
    Id: '成員編號',
    Phone: '電話',
    Role: '角色',
    Account: '帳號',
    SelectMember: '選擇成員',
    confirmRemove: '確定@:(general.Remove)嗎？'
  },
  Plugin: {
    Manage: '測試工具管理',
    CustomEnvWarning: '本專案為自定義環境，無法透過網頁進行設定',
    CustomRecommendWarning: '建議使用本平台之環境範本建置'
  },
  DevOps: {
    Id: '編號',
    Phase: '階段',
    Tools: '工具',
    SearchTool: '搜尋工具'
  },
  User: {
    AddUser: '新增用戶',
    EditUser: '修改用戶',
    Account: '帳號',
    Department: '@:general.Department',
    Title: '@:general.UserTitle',
    Phone: '電話',
    Password: '密碼',
    RepeatPassword: '重新輸入密碼',
    IsEnable: '是否啟用',
    Disable: '停用',
    Enable: '啟用',
    SearchAccount: '搜尋帳號或名稱',
    Role: '角色',
    Source: '帳號來源',
    AD: 'Active Directory',
    SYSTEM: '系統',
    Selected: '已選',
    AccountRule: '帳號需要2-60個字並只接受._-特殊字元在中間',
    PasswordRule: '密碼需要8-20個字同時需要至少1個大寫1個小寫和1個數字'
  },
  Profile: {
    Basic: '基本設定',
    ProfileBasicSetting: '個人基本設定',
    Department: '@:general.Department',
    Title: '@:general.UserTitle',
    Phone: '電話',
    Security: '安全設定',
    ProfileSecuritySetting: '個人安全設定',
    NewPassword: '新密碼',
    RepeatNewPassword: '重新輸入新密碼',
    PasswordRule: '密碼需要8-20個字同時需要至少1個大寫1個小寫和1個數字',
    Save: '儲存',
    Password: '舊密碼',
    K8SConfigDownload: '下載K8S設定檔'
  },
  Project: {
    Project: '專案',
    AddProject: '新增專案',
    EditProject: '修改專案',
    NameIdentifier: '專案名稱/ID',
    Name: '專案名稱',
    Identifier: 'ID',
    Info: '專案資訊',
    Template: '開發範本',
    TemplateName: '開發範本名稱',
    TemplateDescription: '開發範本敘述',
    Version: '版本',
    Status: '專案狀態',
    Progress: '專案工作進度',
    UpdateTime: '更新時間',
    deleteProjectConfirmText:
      '確認刪除？此操作將無法復原，也會永久刪除此專案相關內容，包括所有的程式碼、測試結果、議題及檔案等。',
    PleaseType: '請輸入',
    AndThen: '進行刪除或關閉本視窗以取消操作。',
    IdRule: '請輸入2-30個字元的小寫英文或數字組合，中間可包含符號"-"，且不可全為數字',
    DisplayRule: '專案名稱不可包含符號 "<" 或 "&"',
    DescriptionRule: '敘述內容不可包含符號 "<" 或 "&"',
    WorkloadValue: '工作量',
    UpcomingDeadline: '最近逾期日',
    Title: '職稱',
    Branches: '原始碼分支',
    LastTest: '最後測試',
    LastTestResult: '最後測試結果',
    SearchIdentifier: '搜尋ID',
    SearchProjectName: '搜尋專案名稱',
    SearchProjectNameOrId: '搜尋專案名稱或 ID',
    StartDate: '起始日',
    DueDate: '到期日',
    Owner: '專案經理',
    SelectProject: '請選擇專案',
    SelectTemplate: '請選擇範本',
    overdue: '已超時',
    not_started: '未開始',
    in_progress: '進行中'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: '最後更新時間',
    Environment: '測試環境',
    SearchBranch: '搜尋分支',
    Branch: '分支',
    Status: '狀態'
  },
  ProgressPipelines: {
    Id: '項次',
    TestItems: '測試項目',
    Status: '狀態',
    Commit: 'Commit',
    Branch: '分支',
    CommitMessage: '上傳訊息',
    TransitioningMessage: '處理訊息',
    LastUpdateTime: '最後更新時間',
    SearchCommitMessage: '搜尋 上傳訊息',
    TestDetail: '測試細節'
  },
  ProcessDevEnvironment: {
    Branch: '分支',
    Deployment: '環境',
    State: '狀態',
    Container: '容器',
    Image: '映像檔',
    Services: '服務',
    Pod: 'Pod'
  },
  ProjectResource: {
    Usage: '使用量',
    Quota: '額度',
    Artifacts: '成品',
    EditResource: '修改資源',
    Vulnerabilities: '漏洞',
    DeleteResourceConfirmText: '確認刪除？',
    PleaseType: '請輸入',
    AndThen: '進行刪除或取消操作',
    Storage: '硬碟空間',
    Details: '詳細資料 》'
  },
  ProjectUsage: {
    SearchPods: '搜尋 Pods'
  },
  DeploymentList: {
    DeployName: 'Deploy 名稱',
    Container: 'Container',
    Image: 'Image'
  },
  Postman: {
    Id: '編號',
    Branch: '分支',
    TestPass: '測試通過',
    TestFail: '測試失敗',
    StartTime: '開始時間',
    SearchBranch: '搜尋 分支',
    DevOps: 'DevOps',
    Postman: 'Postman'
  },
  Activities: {
    User: '使用者',
    ActionType: '動作',
    ActionParts: '內容',
    ActAt: '發生時間',
    SearchPlaceholder: '搜尋 使用者、動作或內容'
  },
  Maintenance: {
    AddSecret: '新增 Secret',
    SecretName: 'Secret 名稱',
    Status: '狀態',
    SearchSecretName: '搜尋 Secret 名稱',
    AddRegistry: '新增 Registry',
    RegistryName: 'Registry 名稱',
    SearchRegistryName: '搜尋 Registry 名稱',
    AddConfigMap: '新增 Config Map',
    UserName: '使用者名稱',
    Password: '密碼'
  },
  PodsList: {
    Pods: 'Pods / 建立時間',
    Container: '容器',
    Image: '映像檔'
  },
  Loading: '讀取中……',
  Updating: '更新中……',
  Harbor: {
    PushTime: '推送時間'
  },
  System: {
    Secrets: 'Secrets',
    Registry: 'Registry',
    RedmineMail: 'Redmine Mail',
    AddPlugin: '新增插件',
    AddParams: '新增參數'
  },
  PipeLines: {
    TestDetail: '測試細節'
  },
  Git: {
    Branch: '分支',
    Commit: 'Commit',
    searchCommitId: '搜尋 Commit'
  },
  SonarQube: {
    ViewReport: '檢視報告',
    Bugs: 'Bugs',
    Vulnerabilities: '安全漏洞',
    CodeSmells: '程式異味',
    Duplicates: '重複程式碼',
    Coverage: '覆蓋率'
  },
  Log: {
    info: '資訊',
    duration: '消耗時間',
    fullLog: '報表',
    testId: '測試編號'
  },
  Zap: {
    id: '編號',
    high: '高風險',
    medium: '中風險',
    low: '低風險'
  },
  Sideex: {
    promptMessage: '本系統提供最新五份報表下載',
    suitesPassedRatio: '成功案例',
    casesPassedRatio: '通過項目'
  },
  Release: {
    internalVersions: '內部管控版號',
    selectVersion: '請選擇版號',
    writeNote: '撰寫Release note',
    openIssueHint: '注意: 包版前請確認所有議題單是否已完結關閉，以利後續之包版作業',
    openIssueAlert: '目前版本尚有未解之議單，請協助處理後再進行包版作業！',
    issueCount: '本版本共完成 ',
    issueCountLink: '{0} 議題',
    releaseNote: '[Release Note]',
    releaseVersionName: '包版版號',
    selectMainVersion: '請選擇主版本',
    startRelease: '開始包版',
    copyIssues: '複製選中議題名稱到剪貼簿',
    allCategories: '所有種類',
    batchClose: '批次關閉',
    confirmBatchClose: '確定批次關閉 {0} 個議題？',
    batchMove: '批次搬移',
    batchMoveDialogTitle: '批次版本搬移',
    futureVersion: '未來版本',
    selectMoveToVersion: '請選擇版本',
    batchMoveDialogHint: '將批次搬移 {0} 個議題',
    releaseDone: '版本 {0} 包版成功。'
  },
  LoadingText: {
    createRedmine: '建立Redmine專案中...',
    createGitLab: '創建GitLab資源中...',
    createHarbor: '連結Harbor資源...',
    integrationProject: '開始整合專案資源...',
    loadingTemplateText: '更新所有範本最新資訊中'
  }
}
