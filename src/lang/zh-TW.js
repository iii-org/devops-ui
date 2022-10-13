const langFiles = require.context('./plugins', true, /\zh-TW.js$/)
const asyncLangs = langFiles.keys().reduce((plugins, langPath) => {
  const name = langPath.replace(/^\.\/(.*)\/(.*)/, '$1')
  const value = langFiles(langPath)
  plugins[name] = value.default
  return plugins
}, {})

export default {
  route: {
    MyWork: '我的工作',
    Inbox: '收件匣',
    MessageConsole: '推播管理',
    Whiteboard: '協作白板',
    Dashboard: '儀表板',
    ProjectOverview: '專案概述',
    ProjectList: '專案列表',
    Milestone: '工作規劃',
    TestManagement: '測試管理',
    TestFile: '測試檔案',
    TestPlan: '測試計畫',
    ProjectManagement: '專案管理',
    SingleProject: '個別專案',
    Works: '工作執行',
    Kanban: '議題看板',
    IssueList: '議題列表',
    Overview: '總覽',
    WikiList: '備忘記事',
    FileList: '檔案列表',
    ProjectRoadmap: '版本歷程',
    AdvanceBranchSettings: '進階分支設定',
    ProjectSettings: '專案設定',
    ProjectSetting: '專案設定',
    IssueTransfer: '議題轉移',
    DevProgress: '開發進度',
    DevBranch: '開發分支',
    GitGraph: '開發線圖',
    Pipelines: 'Pipelines',
    DevEnvironment: '實證環境',
    KubernetesResources: 'Kubernetes 資源',
    ReleaseVersions: '釋出版本',
    ReleaseVersion: '釋出版本',
    AutoTesting: '測試紀錄',
    Postman: 'API 測試(Postman)',
    FromDevops: '來自 DevOps',
    FromCollection: '來自 Postman Collection',
    CheckMarx: '白箱測試(CheckMarx)',
    SonarQube: '白箱測試(SonarQube)',
    Sbom: '軟體成分組成(SBOM)',
    WebInspect: '黑箱測試(WebInspect)',
    WebInspectReport: '@:general.Report',
    Zap: '黑箱測試(OWASP ZAP)',
    Sideex: 'ＷEB 測試(Sideex)',
    Cmas: 'APP檢測(CMAS)',
    DockerImage: '映像檔掃描(Clair)​',
    SystemResource: '系統資源',
    DeploymentList: 'Deployment 列表',
    PodsLists: 'Pods 列表',
    ServiceList: 'Service 列表',
    SecretList: 'Secret 列表',
    ConfigMapsList: 'ConfigMaps 列表',
    PluginResource: '專案資源',
    ServiceMonitoring: '服務監控',
    Harbor: 'Harbor 資源',
    ProjectActivities: '操作紀錄',
    ProjectActivity: '操作紀錄',
    ParticipateProject: '參與專案',
    IssueDetail: '議題內容',
    Admin: '系統設定',
    AccountManage: '帳號管理',
    SystemActivities: '系統紀錄',
    SystemPluginManage: '系統插件管理',
    SystemDeploySettings: '佈署設定',
    ProjectSettingsQA: '專案品控清單設置',
    SystemArguments: '參數設定',
    SystemVersion: '@:navbar.versions',
    TraceabilityMatrix: '需求追溯',
    ChangeManagement: '變更管理',
    FailManagement: '異常管理',
    TestCase: '測試個案',
    TestResult: '測試彙整',
    TestReport: 'III DevOps 測試彙整',
    Monitoring: 'III DevOps 服務監控',
    Deploy: '遠端部署',
    DockerReport: 'Docker 測試彙整',
    SbomReport: 'Docker 測試彙整',
    Activities: '服務操作',
    TemplateManage: '範本管理'
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
    1012: '指定版本 {fixed_version} 的狀態為 {fixed_version_status}，因此無法變更。',
    1013: '此議題尚有子議題，請再次確認是否真的要"刪除"此議題，同時一併"刪除"子議題。',
    1014: '檔案不存在，請確認之前是否下載.',
    1015: '找不到專案名稱為 {project_name} 的專案。',
    1016: '專案版本 {version_name} 已經存在，請換另一個名字。',
    1017: '專案被禁用。',
    1018: '父議題尚未關連，{tracker_id} 的議題修改或新增都須含有父議題。',
    2001: '找不到 ID 為 {user_id} 的使用者。',
    2002: '使用者名稱 {name} 違反命名規則。只能使用大寫字母、小寫字母、數字、減號、底線、句點，且頭尾必須是字母或數字，且必須為 2 到 60 個字元。',
    2003: '密碼需要為 8 到 20 個字元長，且必須包含至少一個大寫字母，一個小寫字母，以及一個數字。',
    2004: '密碼或使用者帳號錯誤。',
    2005: '此使用者名稱或電子郵件信箱已有人使用。',
    2006: '使用者 {user_id} 已經在專案 {project_id} 內了。',
    2007: '該使用者為本專案之專案經理，不可刪除。',
    2008: '使用者 {user_id} 有在專案內，無法變更其角色。',
    2011: '部屬主機 {server_name} 無法被存取。',
    3001: '您的角色沒有權限進行此項操作。',
    3002: '偵測到您的登入權限異動，請重新整理頁面，以確保操作順暢。',
    3003: '您不被允許存取其他使用者的資料。',
    3004: '僅專案經理才可設置，請洽專案經理協助。',
    3007: '{plugin_name} 佈署失敗，請洽III DevOps服務團隊',
    3008: '本環境尚未佈署服務套件。({plugin_name})',
    4001: '該議題不存在。',
    4002: '議題在此版本 {version_ids} 尚未結束',
    4003: '議題 {issue_id}, {issue_to_id} 無法建立關聯。',
    5001: '找不到範本 {template_id}',
    5002: '在範本 {template_id}, {template_name} 裡找不到特定檔案或資料夾',
    7001: '此錯誤不含詳細資訊。',
    7002: '參數 {arg} 輸入錯誤。',
    7005: '{object} 的最大數量為 {num}',
    7006: '當議題有子議題時，參數 {arg} 不能被調整。',
    7007: `參數 $arg 需要以 'ghp_'做開為開頭。`,
    7009: '根據google的政策, 需要申請app password來使用SMTP的服務。',
    7010: 'SMTP server回報錯誤, 請確認你的服務, 阜號, 帳號或是密碼是正確的。',
    8001: '{service_name} 回報錯誤：{response}',
    8101: '父議題設定異常，請確認設定之議題非為本議題之子議題或關係議題。',
    8901: '插件軟體的設定是關閉的狀態。',
    8902: '插件服務目前沒有存活。',
    9001: '內部錯誤：{type}: {exception}',
    9002: '出現無效的代碼路徑: {message}',
    9003: '發生未被預期的資料庫錯誤：{message}',
    9999: '發生未知錯誤。',
    20001: 'Token 是無效的。',
    20002: 'Token 並不屬於這個account。',
    20003: 'Token 並不屬於這項專案(iiidevops)。'
  },
  errorDetail: {
    locked: '鎖定',
    closed: '關閉',
    trace_order: '@:Track.CheckRule',
    start_date: '@:Issue.StartDate',
    due_date: '@:Issue.EndDate'
  },
  general: {
    Name: '名稱',
    Title: '標題',
    Add: '新增',
    Edit: '編輯',
    Delete: '刪除',
    Clear: '清除',
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
    Input: '請輸入{item}',
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
    SelectAll: '全選',
    Search: '搜尋',
    Filter: '篩選',
    Settings: '設定{name}',
    Transfer: '移轉',
    DueDate: '到期日',
    Branch: '分支',
    Commit: '提交碼',
    Total: '共',
    AdvancedSettings: '》進階設定',
    year: '年',
    month: '月',
    week: '週',
    Report: '報告',
    Nothing: '無',
    ScrollToTop: '滾動到頂部',
    ScrollToBottom: '滾動到底部',
    group: '群組',
    on: '開',
    off: '關',
    Index: '項次',
    Account: '帳號',
    Password: '密碼',
    DirectExecution: '直接執行',
    Notify: '提示',
    Login: '登入',
    ReLogin: '重新登入',
    Continue: '繼續使用',
    BackToHome: '返回首頁',
    SaveSettings: '儲存設定',
    SeeMore: '看更多',
    High: '高',
    Medium: '中',
    Low: '低',
    Run: '執行',
    ForceDelete: '刪除',
    Fix: '修復',
    Connected: '連線成功',
    Disconnected: '連線失敗',
    Tag: '標籤',
    Path: '路徑',
    Format: '格式',
    View: '已讀',
    SocketConnected: 'Socket 已連線成功',
    ReconnectByReload: '請重整頁面(F5)，以確保連線正常',
    Reload: '頁面重整',
    NoTestResult: '尚無測試結果',
    Parent: '父',
    Child: '子',
    CopyUrl: '複製網址',
    TemporarySave: '暫存',
    Modify: '修改'
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
    TemporarySaved: '已暫存',
    Saved: '已儲存',
    NoEmpty: '內容不得為空',
    Same: '內容相同，未變更。',
    SwitchLanguage: '更換語言成功',
    NoProject: '目前沒有任何專案可供選擇，請先建立專案。',
    WrongProjectName: '請輸入正確的專案名稱。',
    WrongBranchName: '請輸入正確的分支名稱。',
    WrongResourceName: '請輸入正確的資源名稱。',
    WrongTagVersionName: '請輸入正確的版本名稱。',
    SingleFileLimit: '一次只能選擇一個檔案，請先移除已選擇的檔案。',
    UnsupportedFileFormat: '無法上傳，不支援此種檔案格式。',
    FileSizeLimit: '超過可上傳的檔案大小 ({size})。',
    FileNameLimit: '檔名不可包含特殊字元。',
    LoadFail: '讀取失敗，請洽您的系統管理員。',
    UnSavedChanges: '您編輯的內容尚未儲存，確定離開嗎？',
    confirmDelete: '確定@:(general.Delete)嗎？',
    confirmClose: '確定@:(general.Close)嗎？',
    confirmDeleteSth: '確定@:(general.Delete)「{name}」嗎？',
    confirmDeleteSideex: '確定刪除該專案所有組合測試相關的設定檔及紀錄嗎？',
    confirmEditProject: '範本更換，將直接取代成您選擇的範本程式，請問確認要覆蓋嗎？',
    confirmVariableSetting: '注意，您尚有變數未設定！要直接產生測試資料嗎？',
    logoutNotifications: '看起來您已經閒置一段時間了，為保證您的資料安全，我們將協助您自動登出。',
    pluginWarnNotifications: '請確保同名 Plugin 開關的狀態一致再進行儲存和執行。',
    pluginRepeatMessage: '紅底為同分支有重複項目設定，請確認其設置為一致(如同為開或關)，以確保 Pipeline 運作正常。',
    ChangeProjectManager: '確認是否要變更專案經理人。',
    ConnectSocket: '看板正在連接 Socket...',
    UpdateKanban: '{issueName} 已更新',
    NoParentIssueWarning: '種類為{tracker_name}的議題需有父議題。',
    ChangeProject: '切換專案將清空版本、標籤及受分配者的資訊，確認移轉嗎？',
    RedmineMailWarning: '[注意] Redmine 將重新啟動，服務即將暫停，請3-5分鐘後再重新登入使用',
    RedmineMailActiveWarning: '平台Email設定尚未啟用，請洽系統管理者',
    RedmineMailAutoDisableWarning: '您的Email通知已被關閉，因後台Email設定尚未啟用或已關閉，請洽系統管理者',
    RedmineMailConfirmWarning: '信箱（SMTP）設定修改，即將重啟Redmine，屆時將導致DevOps平台停止服務5-8分鐘，請問確定要執行修改並重啟Redmine嗎？',
    ExcalidrawAliveWarning: '白板伺服器失效，請洽III DevOps服務團隊'
  },
  RuleMsg: {
    PleaseInput: '請輸入',
    PleaseSelect: '請選擇',
    Invalid: '無效的',
    Member: '@:Member.Member',
    Email: '信箱',
    UserName: '使用者名稱',
    Password: '密碼',
    Description: '描述',
    InputNewPwd: '請輸入新密碼',
    InputRepeatPwd: '請再次輸入密碼',
    PasswordLimit: '密碼不可少於 8 個字元',
    PasswordNotSame: '密碼不相同',
    DifferentNewPassword: '新密碼不可與舊密碼相同'
  },
  TestCase: {
    Index: '@:general.Index',
    Method: '方法',
    Path: '路徑',
    TestResult: '測試結果',
    TestMessage: '回傳訊息',
    SearchKey: '搜尋 Collection 名稱',
    SearchNameOrPathOrTestResult: '搜尋名稱或路徑或測試結果',
    TestItem: '{count} 測試項目',
    Pass: '通過',
    Fail: '失敗'
  },
  CheckMarx: {
    ScanId: '測試編號',
    Branch: '@:general.Branch',
    Commit: 'Commit',
    HighSeverity: '高風險',
    MediumSeverity: '中風險',
    LowSeverity: '低風險',
    InfoSeverity: '資訊',
    RunAt: '開始時間',
    Report: '@:general.Report',
    SearchScanId: '搜尋 測試編號',
    noScan: '目前沒有任何掃描。',
    notCompletedScan: '掃描尚未完成，可能需要數小時來完成。',
    generatingReportScan: '掃描已完成，正在產生報告，可能需要數分鐘來完成。',
    canceledScan: '掃描取消。',
    failedScan: '掃描未完成或異常。',
    removedScan: '掃描已被刪除。',
    registryReport: '報告已不存在，是否需要重新產生？',
    registryReportTip: '報告產生需要 3-5 分鐘不等，請稍後再進頁面下載，或重整頁面。',
    QueueSequence: '等候排序',
    cancelScansMessage: '已取消測試編號為 {0} 的掃描程序，請等待 CheckMarx 更新...',
    QueueTooltip: '本佇列訊息同 CheckMarx 佇列，採批次更新。',
    New: '已新增',
    PreScan: '準備中',
    Queued: '排程中',
    Scanning: '掃描中',
    PostScan: '掃瞄或處理中',
    Finished: '掃描完成',
    Canceled: '已取消',
    Failed: '掃描失敗',
    InProcess: '產生中'
  },
  Sbom: {
    Branch: '@:general.Branch',
    Commit: 'Commit',
    PackageCount: '套件數量',
    HighSeverity: '高風險',
    MediumSeverity: '中風險',
    LowSeverity: '低風險',
    RunAt: '開始時間',
    Report: '@:general.Report',
    TraceabilityDownload: '軟體溯源清單下載',
    VulnerabilityReport: '弱點掃描報告',
    Success: '成功',
    Running: '進行中',
    Fail: '失敗'
  },
  Cmas: {
    SUCCESS: '掃描完成',
    RUNNING: '掃描中',
    NOT_FOUND: '掃描失敗',
    FAIL: '建立失敗',
    MOEA: '行動應用APP基本資安規範'
  },
  WebInspect: {
    ScanId: '測試編號',
    Branch: '@:general.Branch',
    Commit: 'Commit',
    Critical: '嚴重',
    HighSeverity: '高風險',
    MediumSeverity: '中風險',
    LowSeverity: '低風險',
    InfoSeverity: '資訊',
    BpSeverity: '最佳實作',
    RunAt: '開始時間',
    Report: '@:general.Report',
    TestReport: '測試報告',
    DownloadReport: '下載報告',
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
    DragFilesHere: '或將檔案拖曳至此',
    ChooseFile: '選擇檔案',
    InputName: '請輸入，若未輸入預設為上傳檔案名稱',
    File: '檔案',
    UploadAndSave: '上傳檔案並儲存',
    MaxFileSize: '檔案大小限制',
    AllowedFileTypes: '檔案類型支援',
    UploadWarning: '檔案名稱請勿包含特殊字元'
  },
  Version: {
    ProjectManage: '專案版本管理',
    Manage: '版本管理',
    AddVersion: '新增版本',
    EditVersion: '修改版本',
    Duration: '期間',
    Version: '版本',
    SelectVersion: '選擇版本',
    Id: '版本編號',
    closed: '關閉',
    open: '開啟',
    Open: '開啟',
    locked: '鎖定',
    Locked: '鎖定',
    EndDate: '結束日期',
    ConfirmDelete: '確認@:(general.Delete)「{version}」嗎？'
  },
  MyWork: {
    AssignedToMe: '指派給我',
    ReportedIssue: '由我回報'
  },
  Issue: {
    Tag: '標籤',
    All: '全部',
    NoTag: '尚無標籤',
    AddTag: '新增標籤',
    AddIssue: '新增議題',
    EditIssue: '編輯議題',
    AddSubIssue: '新增子議題',
    CloseIssue: '關閉議題',
    IssueHookSetting: '程式關聯設定',
    CommitIssueHookSetting: '修改程式議題關聯',
    EditIssueHook: '修改議題關聯',
    BatchEditIssueHook: '批次修改議題關聯',
    Id: '議題編號 / 議題名稱',
    Assignee: '受分配者',
    Priority: '優先權',
    Estimate: '預估工時',
    DoneRatio: '完成比率',
    DoneRatio_sm: '完成率',
    StartDate: '開始日期',
    EndDate: '結束日期',
    Description: '議題描述',
    due_date: '@:Issue.EndDate',
    SelectProject: '選擇專案',
    SelectDate: '選擇日期',
    SelectType: '選擇種類',
    SelectTag: '選擇標籤',
    SelectVersion: '@:Version.SelectVersion',
    SelectPriority: '選擇@:Issue.Priority',
    SelectStatus: '選擇@:general.Status',
    SelectMember: '@:Member.SelectMember',
    CleanFilter: '清除篩選',
    SearchNameOrAssignee: '搜尋ID、名稱或受分配者',
    status: '@:general.Status',
    Save: '儲存',
    Notes: '處理紀錄 / 訊息回覆',
    History: '歷史紀錄',
    Commit: '程式提交',
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
    points: '點數',
    CommentTime: '加註於',
    ParentIssue: '父議題',
    ChildrenIssue: '子議題',
    Active: '已開立',
    Assigned: '已分派',
    InProgress: '進行中',
    Solved: '已解決',
    Verified: '已確認',
    Closed: '已關閉',
    Responded: '已回應',
    Finished: '已完成',
    Unknown: '狀態不明',
    Low: '低',
    Normal: '一般',
    High: '高',
    Immediate: '緊急',
    Document: '文件',
    Research: '研究',
    Epic: '需求規格',
    Audit: '情境故事',
    Feature: '功能設計',
    Bug: '程式錯誤',
    Issue: '議題',
    'Change Request': '變更請求',
    Risk: '風險管理',
    'Test Plan': '測試計畫',
    'Fail Management': '異常管理',
    DeleteIssue: '確認要刪除「{issueName}」嗎?',
    ConfirmDeleteIssue: '此議題「{issueName}」尚有子議題，請再次確認是否真的要"刪除"此議題，同時一併"刪除"下列子議題？',
    RemoveIssueRelation: '確認要移除關聯議題嗎?',
    AskDeleteIssue: '關閉工作項目/議題?',
    DeleteIssueReason: '請註明關閉原因',
    Unlink: '移除關聯',
    TestFile: '@:route.TestFile',
    TestResult: '@:TestCase.TestResult',
    Files: '附件',
    UploadFiles: '附件上傳',
    DeleteFile: '確認要刪除附件嗎?',
    RemovedIssue: '議題已被刪除或找不到該議題',
    id: '編號',
    project: '專案名稱',
    name: '議題名稱',
    tags: '@:Issue.Tag',
    priority: '@:Issue.Priority',
    tracker: '@:general.Type',
    assigned_to: '@:Issue.Assignee',
    fixed_version: '@:Version.Version',
    me: '<<我自己>>',
    ChildrenNotClosed: '子議題未關閉',
    NoAssignee: '議題尚未指派',
    VersionUndecided: '版本未定',
    Unassigned: '@:Dashboard.Unassigned',
    RelatedIssue: '關聯議題',
    DisplayClosedIssue: '顯示已關閉議題',
    DisplayClosedVersion: '顯示關閉@:Version.Version',
    open: '@:Version.Open',
    closed: '@:Version.closed',
    locked: '@:Version.Locked',
    ResetESCTip: '按下Windows+ESC (Mac:Command+ESC) 重置並關閉輸入欄位',
    ChildrenNotClosedWarning: '本議題尚有子議題未處理，請進入該議題確認與關閉後再進行搬移',
    PackageRecord: '包版紀錄',
    NoImage: '沒有映像檔',
    ReleaseTime: '包版時間',
    SourceCode: '原始碼',
    IssueList: '議題清單',
    DetermineContinue: '確定繼續',
    NoImageWarning: '沒有映像檔，是否繼續包版，或是按"取消"放棄?',
    NextStep: '下一步>',
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
      tag: '@:Issue.Tag',
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
      label: '篩選維度',
      tags: '議題標籤',
      status: '議題狀態',
      tracker: '議題類別',
      assigned_to: '專案成員',
      fixed_version: '專案版本',
      priority: '@:Issue.Priority',
      due_date_start: '@:Issue.EndDate(>=)',
      due_date_end: '@:Issue.EndDate(<=)'
    },
    Display: '顯示',
    DragTip: '拖曳到議題，可以將 {key} 改變成 {value}',
    GroupBy: '以 {filter} 分組',
    OriginalSetting: '原先設定',
    Result: '搜尋結果',
    LastResult: '近期',
    NotExist: '資料不存在',
    TraceabilityMatrix: '議題關聯圖',
    CheckChildrenIssueStatus: '檢核子議題關聯狀態',
    OriginalParentIssue: '原@:Issue.ParentIssue',
    NoParentIssue: '未設定@:Issue.ParentIssue',
    Copy: '副本',
    CopyIssue: '@:Issue.Issue@:Issue.Copy',
    batchTransfer: '批次移轉',
    batchClose: '批次關閉',
    UploadSuccess: '上傳成功',
    List: '議題清單',
    TransferIssueTo: '準備將 {value} 項議題轉移給？',
    due_date_start: '@:Issue.EndDate(>=)',
    due_date_end: '@:Issue.EndDate(<=)',
    CustomFilter: '自定義條件',
    CustomFilterName: '自定義條件名稱',
    InputFilterName: '請輸入篩選條件名稱',
    RemoveCustomFilter: '確認要移除自定義條件嗎?',
    ImportParentIssueData: '匯入父議題標題與敍述'
  },
  Milestone: {
    Saving: '儲存中',
    Success: '儲存@:general.Success',
    Error: '儲存@:general.Error',
    Display: '@:(Issue.Display)欄位'
  },
  Test: {
    TestPlan: {
      no: '@:general.Index',
      name: '測試名稱',
      relations: '測試目的',
      software_name: '測試軟體',
      file_name: '測試檔案',
      test_result: '測試結果',
      branch: '分支'
    },
    TestFile: {
      CreateTestData: '產生測試資料',
      CreateTestDataSetting: '測試資料產生設定',
      VariableAndRange: '變數名稱與範圍制定',
      VariableLimit: '變數指定限制',
      CreateNow: '立即產生',
      SettingReference: '設定方式請參照',
      ConnectTestPlan: '關聯測試計畫',
      DeleteTestFile: '刪除測試檔案',
      SetPlan: '設定測試計畫',
      AddPlan: '新增測試計畫',
      UploadTestSet: '上傳測試集',
      TestSoftware: '測試軟體',
      TestName: '測試名稱',
      PostmanUpload: 'Postman檔案名稱: {file_name}.postman_collection.json ( Postman UI 匯出的格式(V2.1))',
      SideeXUpload: 'Sideex檔案名稱: {file_name}.json',
      Type: '類型',
      RangePlaceholder: '請輸入範圍,請以,隔開,如1,2,3',
      LimitNotes: '[注意] 欲設限之變數，記得以中括弧包起來，如[變數]',
      EnterPositive: '請確認所輸入都是正整數!'
    }
  },
  Wiki: {
    AddWiki: '新增記事',
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
      UpdateNow: '@:SystemVersion.UpdateNow',
      syncing: '同步中......',
      sync_date: '統計日期：{0}',
      ExceptionNotification: '系統異常通知',
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
        all: '全部',
        overdue: '已超時',
        in_progress: '時限內',
        not_started: '未開始',
        csv_download: '下載CSV',
        excel_download: '下載EXCEL',
        all_download: '全部下載',
        organization: '組織',
        project_start_date: '計畫起始日',
        project_due_date: '計畫結束日',
        disable_tooltip: '僅本專案經理可啟用本專案',
        enable_tooltip: '僅本專案經理可停用本專案'
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
    Account: '@:general.Account',
    SelectMember: '選擇成員',
    confirmRemove: '確定@:(general.Remove)嗎？',
    TransferIssue: '進行議題處理  〉',
    ConfirmTransfer:
      '{userRole} ({userName}）仍有 {unClosedIssueCount} 項議題未完成，為確保專案執行之完整度，請先將議題移轉或關閉，再執行成員移除作業。',
    ConfirmRemoveMember: '確認@:(general.Remove) {userRole}（{userName}）嗎？'
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
    Account: '@:general.Account',
    Department: '@:general.Department',
    Title: '@:general.UserTitle',
    Phone: '電話',
    Password: '密碼',
    RepeatPassword: '重新輸入密碼',
    IsEnable: '是否啟用',
    SearchAccount: '搜尋帳號或名稱',
    Role: '角色',
    Source: '帳號來源',
    AD: 'Active Directory',
    SYSTEM: '系統',
    Selected: '已選',
    AccountRule: '帳號需要2-60個字並只接受._-特殊字元在中間',
    PasswordRule: '密碼需要8-20個字同時需要至少1個大寫1個小寫和1個數字',
    LastLogin: '上次登入'
  },
  Profile: {
    Basic: '基本設定',
    ProfileBasicSetting: '個人基本設定',
    Notice: '通知設定',
    MessageReceptionSetting: '訊息接收設定',
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
    K8SConfigDownload: '下載K8S設定檔',
    PlatformNotice: '訊息推播',
    MailNotice: '電子郵件'
  },
  Project: {
    Project: '專案',
    Starred: '重點專案',
    AddProject: '新增專案',
    EditProject: '修改專案',
    NameIdentifier: '專案名稱/ID',
    Name: '專案名稱',
    Identifier: 'ID',
    Info: '專案資訊',
    Template: '開發範本',
    TemplateName: '開發範本名稱',
    TemplateDescription: '開發範本敘述',
    OriginalTemplate: '原始範本',
    Version: '版本',
    IssueStatus: '議題狀態',
    IssueProgress: '議題執行進度',
    IssueUpdate: '議題更新',
    Progress: '進度',
    UpdateTime: '更新時間',
    deleteProjectConfirmText:
      '確認刪除？此操作將無法復原，也會永久刪除此專案相關內容，包括所有的程式碼、測試結果、議題及檔案等。',
    deleteHasSonProjectText:
      '將永久刪除此專案的子專案，包括{0}。',
    PleaseType: '請輸入',
    AndThen: '進行刪除或關閉本視窗以取消操作。',
    IdInvalid: 'ID 不符合格式，請修正',
    IdRule: `請輸入 2-30 英文為首之英數及'-'組合，注意英文須全為小寫且所設定之ID不可為全為數字。`,
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
    SearchProjectNameOrIdOrManager: '搜尋專案名稱、ID或經理',
    SearchProjectNameOrManagerOrOrganization: '搜尋專案名稱、經理或組織',
    StartDate: '起始日',
    Owner: '專案經理',
    SelectProject: '請選擇專案',
    SelectTemplate: '請選擇範本',
    overdue: '已超時',
    not_started: '未開始',
    in_progress: '進行中',
    closed: '已完成',
    ProjectPeriod: '專案期間(結束日)',
    ProjectOwner: '@:general.owner_name',
    DueDate: '@:general.DueDate',
    ParentProject: '父專案',
    InheritParentProjectMember: '繼承父專案成員'
  },
  ProcessDevBranch: {
    Commit: 'Commit',
    LastUpdateTime: '最後更新時間',
    Environment: '測試環境',
    SearchBranch: '搜尋分支',
    Branch: '@:general.Branch'
  },
  ProgressPipelines: {
    Id: '@:general.Index',
    TestItems: '測試項目',
    Commit: 'Commit',
    Branch: '@:general.Branch',
    CommitMessage: '上傳訊息',
    TransitioningMessage: '處理訊息',
    LastUpdateTime: '最後更新時間',
    SearchCommitMessage: '搜尋 上傳訊息',
    TestDetail: '測試細節',
    PipeLineSettings: 'Pipeline 設定',
    RerunPipeline: '{0} 分支已重新執行 Pipeline。'
  },
  ProcessDevEnvironment: {
    Branch: '@:general.Branch',
    Deployment: '環境',
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
    Branch: '@:general.Branch',
    TestPass: '測試通過',
    TestFail: '測試失敗',
    TestTotal: '測試總計',
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
    SearchPlaceholder: '搜尋 使用者、動作或內容',
    AddTemplate: '新增範本',
    TemplateName: '範本名稱',
    OriginalProject: '原始專案',
    QuoteTimes: '引用次數',
    OriginalProjectUpdatedTime: '原專案更新時間',
    SyncTime: '同步時間',
    CreateTemplate: '新增自製範本',
    EditTemplate: '修改自製範本',
    LocalProject: '本地專案',
    TemplateDescription: '範本簡述',
    DuplicatedTemplate: '同一專案僅能生成一個範本，此專案"{0}"於日前已被轉成範本，若需同步程式碼，請至外層範本清單按下編輯鈕，即可執行。'
  },
  Maintenance: {
    AddSecret: '新增 Secret',
    SecretName: 'Secret 名稱',
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
    Image: '映像檔',
    ExecuteShellNotify: '本功能提供查看 Pod 相關資訊，目前支援指令為：'
  },
  Loading: '讀取中……',
  Updating: '更新中……',
  Harbor: {
    PushTime: '推送時間'
  },
  System: {
    Secrets: 'Secrets',
    Registry: 'Registry',
    RedmineMail: 'Mail Setting',
    SystemTemplates: 'Templates',
    SystemConfigs: 'System Configs',
    AddPlugin: '新增插件',
    AddParams: '新增參數'
  },
  PipeLines: {
    TestDetail: '測試細節',
    ExecuteDetail: '執行細節',
    Report: '測試彙整報告'
  },
  Git: {
    Branch: '@:general.Branch',
    Commit: 'Commit',
    searchCommitId: '搜尋 Commit'
  },
  SonarQube: {
    ViewReport: '檢視報告',
    Bugs: 'Bugs',
    Vulnerabilities: '安全漏洞',
    CodeSmells: '程式異味',
    Duplicates: '重複程式碼',
    Coverage: '覆蓋率',
    code_smells: '代碼異味',
    sqale_index: '技術債務',
    vulnerabilities: '漏洞',
    duplicated_lines_density: '重複行數(%)',
    bugs: '程式錯誤',
    coverage: '覆蓋率',
    reliability_rating: '可靠性評分',
    duplicated_blocks: '重複程式碼',
    sqale_rating: '可維護性等級',
    security_rating: '安全等級',
    security_hotspots: '安全熱點',
    alert_status: '品質狀態',
    ScanLogs: '掃描記錄'
  },
  Log: {
    duration: '消耗時間',
    fullLog: '報表',
    testId: '測試編號'
  },
  Clair: {
    size: '檔案大小',
    critical: '嚴重',
    high: '高風險',
    medium: '中風險',
    low: '低風險'
  },
  Anchore: {
    count: '套件數量',
    high: '高風險',
    medium: '中風險',
    low: '低風險'
  },
  Zap: {
    id: '編號',
    critical: '嚴重',
    high: '高風險',
    medium: '中風險',
    low: '低風險'
  },
  Sideex: {
    promptMessage: '本系統提供最新五份報表下載',
    suitesPassedRatio: '成功案例',
    suitesPassedTotal: '成功案例總計',
    casesPassedRatio: '通過項目',
    casesPassedTotal: '通過項目總計'
  },
  Release: {
    internalVersions: '內部管控版號',
    selectVersion: '請選擇版號',
    writeNote: '撰寫Release note',
    openIssueHint: '注意: 包版前請確認所有議題單是否已完結關閉，以利後續之包版作業',
    openIssueAlert: '目前版本尚有未解之議單，請協助處理後再進行包版作業！',
    issueCount: '本版本共完成 ',
    issueCountLink: '{0} 議題',
    releaseNote: '釋版說明',
    releaseVersionName: '包版版號',
    selectMainVersion: '請選擇主版本',
    copyIssues: '複製選中議題名稱到剪貼簿',
    allCategories: '所有種類',
    batchClose: '批次關閉',
    confirmBatchClose: '確定批次關閉 {0} 個議題？',
    batchMove: '批次搬移',
    batchMoveDialogTitle: '批次版本搬移',
    futureVersion: '未來版本',
    selectMoveToVersion: '請選擇版本',
    batchMoveDialogHint: '將批次搬移 {0} 個議題',
    releaseDone: '版本 {0} 包版成功。',
    startRelease: '開始包版',
    stopRelease: '取消包版',
    checkIssue: '檢查議題',
    releaseSettings: '包版作業設定-',
    IssueVersion: '議題版本',
    ImageVersion: '程式/映像檔版本',
    ReleaseVersion: '打包版本',
    IssueVersionWarning1: '包版前請確認所有議題單是否已完結關閉，若未完全關閉，可於下方操作移轉或直接關閉，若尚未設定版本，請至上方',
    IssueVersionWarning2: '進行版本設定。',
    ImageVersionWarning: '請指定程式或映像檔版本，若無程式開發或不需更改，則可直接跳過。',
    ReleaseVersionWarning: '請確認以下程式、映像檔、議題版本是否有誤。',
    ImageList: '映像檔清單',
    RenderAllCommit: '呈現所有提交',
    OnlyImage: '僅有映像檔',
    CommitTime: '提交時間',
    TableReleaseVersion: '釋版版號',
    Previous: '上一步',
    Next: '下一步',
    ModifyImage: '修改映像檔',
    NoIssueWarning: '此版本尚未建立議題',
    CommitAndImage: '程式/映像檔',
    ImagePath: '映像檔路徑',
    NotePlaceholder: '請輸入版本說明，也可透過上方之議題版本內的已關閉議題清單進行複製、貼到此處。',
    ReleaseWarning: '包版版號與映像檔路徑皆可多個，唯版本路徑僅可至多兩個',
    Tags: '備註標籤',
    StopReleaseWarning: '請檢查映像檔路徑是否符合格式。',
    StopAddingPathWarning: '請檢查輸入的映像檔路徑是否符合以下格式。',
    FormatWarning: '(主要名稱):(標籤) ex. branch:version'
  },
  SystemVersion: {
    Source: '系統模組',
    Version: '@:Version.Version',
    CommitID: '程式提交編號',
    hasUpdate: '版本更新通知',
    UpdateNow: '立即更新',
    Develop: '開發版',
    NewVersion: '新版本通知',
    UpdateFailed: '更新失敗',
    DeploymentName: '部署名稱',
    DeploymentUuid: '部署 UUID',
    ReloadSystem: '刷新系統',
    UpdatedNotify: '請於數分鐘後重新整理頁面，檢查系統是否完成更新。',
    UploadSystemInfos: '上傳系統資訊'
  },
  LoadingText: {
    createRedmine: '建立Redmine專案中...',
    createGitLab: '創建GitLab資源中...',
    createHarbor: '連結Harbor資源...',
    integrationProject: '開始整合專案資源...',
    loadingTemplateText: '更新所有範本最新資訊中',
    saveParamsSetting: '儲存參數設定....',
    createTestData: '產生測試資料....',
    sideeXTestDataConverting: 'SideeX測試檔轉置中....'
  },
  TrackManagement: {
    description: '變更內容(議題描述)',
    relations: '原始需求/議題',
    assigned_to: '受分派者'
  },
  Track: {
    StartingPoint: '起始點',
    StartPaint: '開始繪圖',
    TraceChecking: '需求檢核中，需要至少3-5分鐘以上，請稍後再回來檢視結果......',
    DownloadExcel: '下載Excel總表',
    DemandTraceability: '需求追溯',
    CheckRule: '檢核模組',
    CheckOrder: '檢核條件',
    CheckRuleSettings: '設定條件清單',
    TraceabilityCheck: '追溯檢核',
    Run: '執行需求檢核',
    DownloadSVG: '下載圖檔(.svg)',
    Download: '下載',
    Enable: '啟用',
    SelectTracker: '選擇新增檢核類別',
    Run_at: '執行時間',
    Running_time: '運算時間',
    OnlyCheckRule: '提供至多{0}組檢核設定',
    OnlyCheckOrder: '檢核條件最少{0}項，最多{1}項。',
    AddCheckRule: '新增檢核模組'
  },
  ProjectRoadmap: {
    DisplayRange: '顯示範圍'
  },
  TestReport: {
    TestTime: '測試時間',
    Commit: '提交碼',
    WhiteBoxTesting: '白箱測試(原始碼掃描)',
    ISOWeaknessTesting: '映像檔弱點掃描',
    BlackBoxTesting: '黑箱測試(弱點掃描)',
    AppScriptTesting: 'APP測試',
    ApiScriptTesting: 'API腳本測試',
    WebScriptTesting: '網頁腳本測試',
    DetailReport: '詳細報告',
    DownloadPdf: '下載 PDF',
    DownloadCsv: '下載 CSV',
    DownloadExcel: '下載 EXCEL',
    Item: '項',
    WarningPartOne: '若尚無數據，請連入',
    WarningPartTwo: '確認報告是否已產出',
    CheckMarxReport: 'CheckMarx 報告區'
  },
  ProjectSettings: {
    GeneralSettings: '一般設定',
    NotifySettings: '通知設定',
    TagSettings: '標籤管理',
    Tag: '標籤',
    TagName: '標籤名稱',
    TagInputPlaceholder: '請輸入標籤名稱',
    AddCustomTag: '新增自訂義標籤',
    IssueReminderFeature: '議題提醒功能',
    Index: '@:general.Index',
    NotificationConditions: '通知條件',
    Days: '天數',
    Status: '@:general.Status',
    Actions: '@:general.Actions',
    NotYetEnabled: '尚未啟用',
    Comming: '到期日前__?__天通知',
    Unchange: '議題連續未異動達__?__天以上',
    EnableMessage: '已成功啟用提醒功能',
    DisableMessage: '已成功停用提醒功能',
    SuccessUpdateAlertSettings: '通知設定已更新成功',
    EnableForceTracker: '強制要求父議題設置已啟用',
    DisableForceTracker: '強制要求父議題設置已停用',
    TagUpdateMessage: '任務標籤已更新成功',
    ChangeManager: '變更專案經理',
    ParentIssueRequired: '議題提醒',
    ParentIssueRequiredSettings: '議題提醒功能',
    IssueType: '議題類型'
  },
  SystemDeploySettings: {
    RemoteDeploymentEnvironment: '遠端佈署環境',
    Index: '@:general.Index',
    ClusterName: 'Cluster 名稱',
    Account: '@:general.Account',
    LastUpdateTime: '最後更新時間',
    Status: '@:general.Status',
    Actions: '@:general.Actions',
    ImpressionFileRepo: '印象檔儲存庫',
    RegistryName: 'Registry 名稱',
    KubeConfigTextareaHint: '請直接貼上 kubenate config 或使⽤上⽅上傳檔案，直接上傳。',
    ClusterMessage: '遠端部署主機設定已更新成功。',
    RegistryMessage: '印象檔主機設定已更新成功。',
    FailMessage: '請檢查表單內容是否正確並填寫密碼。',
    NoNameWarning: '請填寫 Cluster 名稱。',
    FillInPassword: '請輸入密碼',
    NoService: '尚無服務',
    NoImage: '尚無映像檔',
    Initializing: '準備中',
    StartReplication: '同步中',
    Finished: '已完成',
    StartDeployment: '設置中'
  },
  Deploy: {
    AddApplication: '新增部署服務',
    ApplicationSetting: '部署服務設定',
    ID: 'ID',
    Name: '服務名稱',
    Cluster: '遠端環境',
    Release: '釋出版本',
    Status: '狀態',
    Pod: 'Pod數量',
    Start: '開始',
    Stop: '停止',
    Redeploy: '重新部署',
    Stopped: '已停止',
    Registry: '映像檔儲存庫',
    Namespace: '服務空間名稱',
    Policy: '同步映像檔規則',
    Resource: '資源空間設定',
    CPU: 'CPU',
    Memory: '記憶體',
    Replicas: '數量',
    Network: '網路設定',
    Type: '類型',
    Protocol: '連接埠',
    Port: '埠號',
    ExposePort: '對外埠號',
    Domain: '主機名稱',
    Path: '路徑',
    EnvironmentVariable: '服務環境變數',
    AddVariable: '新增環境變數',
    Default: '(系統預設值)',
    Key: '變數名稱',
    Value: '值',
    KeyConflicts: '[服務環境變數] @:(Deploy.Key)重覆定義，請調整後再存檔。 {0}',
    KeyPair: '@:(Deploy.Key)[{0}]： 第{1}行',
    AllNull: '請確認所有的 {0} 都已輸入',
    PairCondition: '請輸入{0}。 {1} 是一組條件。',
    ReleaseHelper: '若下拉未呈現任何版本可供選擇，請確認是否已執行過左方選單的「釋出版本」，或該釋出版本未含有映像檔。',
    NoSetting: '服務尚未建立，請洽系統管理員',
    LinkToApplication: '連結到服務'
  },
  Validation: {
    Input: '請輸入 {0}',
    Select: '請選擇 {0}',
    Invalid: '{0} 無效，請重新輸入',
    Range: '數值範圍是 {0} ~ {1}',
    Number: '數值',
    String: '文字'
  },
  ServiceMonitoring: {
    Services: '服務',
    Health: '健康度',
    Logs: '訊息',
    LastUpdateTime: '最後更新時間',
    true: '良好',
    false: '異常',
    loading: '載入中',
    CheckNow: '立即檢核'
  },
  SystemTemplates: {
    GithubAccount: 'Github @:general.Account',
    GithubAccountPlaceholder: '請填入 Github 之帳號名稱 ex: jason_dev',
    GithubTokenPlaceholder: `請填入 Github 已啟用 public_repo 之 Personal Token，請應以'ghp_'為開頭之字串`,
    TokenWarning: '確認 Github 的 access token 是否已包含 public_repo?',
    TemplatesSettings: '範本同步設定',
    EnableTemplateSync: '啟用範本同步',
    DocumentUrl: '相關教學請參考',
    ExecLogsButton: '執行細節',
    NotifyRun: '範本同步執行中，預計需時 3 - 10 分鐘，請耐心等候，或點入左下方執行細節，瞭解實際同步進度。',
    TemplateSyncExecLogs: '範本同步執行紀錄',
    VerifyGithubToken: '檢核GitHub token 中...'
  },
  SystemConfigs: {
    SystemConfig: '系統參數',
    Content: '狀態 / 設定內容',
    FileType: '檔案上傳類型',
    GitLabExternalAccess: 'GitLab對外連線',
    UploadFileTypes: '檔案上傳類型設定',
    FileExtension: '副檔名',
    includesMimeType: '資料內已有{mimeType}'
  },
  Kanban: {
    ChangeIssueError: '異動議題錯誤',
    unassignedErrorTitle: '尚未分派的議題：',
    unassignedErrorContent: '沒有人被分派到此議題，無法調整到"已分派"之後的議題狀態。',
    assignedErrorTitle: '已分派的議題',
    assignedErrorContent: '已分派的議題，無法調整議題狀態到"已開立"',
    childrenStatusErrorTitle: '子議題尚未全關閉：',
    childrenStatusErrorContent: '有未關閉的子議題，請確認所有議題皆已關閉。',
    priorityErrorTitle: '父議題不能改變優先權：',
    priorityErrorContent: '優先權會依據最後的子議題。',
    trackerErrorTitle: '議題更動失敗:',
    trackerErrorContent: '本專案已啟用強制引用父議題此議題異動須含有父議題',
    closedVersionErrorTitle: 'Closed Version Issue:',
    closedVersionErrorContent: 'An issue assigned to a closed version cannot be reopened',
    toClosedVersionErrorContent: '指定版本 {fixed_version} 的狀態為 關閉，因此無法變更。'
  },
  Status: {
    Finished: '掃描完成',
    Scanning: '掃描中',
    Aborted: '已取消',
    Failed: '失敗',
    Complete: '@:Status.Finished',
    Running: '@:Status.Scanning',
    NotRunning: '準備中',
    Interrupted: '已中斷'
  },
  Gantt: {
    Now: '今天',
    XScale: '日期寬度',
    YScale: '議題高度',
    TaskListWidth: '左側寬度',
    TimelineLength: '時間軸長度',
    DisplayTaskList: '顯示議題列表'
  },
  Inbox: {
    No: '項次',
    Title: '標題',
    Type: '訊息類型',
    Date: '日期',
    Sender: '公告者',
    Info: '一般訊息',
    Warning: '	警告訊息',
    Urgent: '緊急訊息',
    NewVersion: '有新版本可更新',
    SystemAlert: '系統警報',
    SystemWarning: '系統警告',
    'Merge Request': '合併提交',
    'GitHub Token Invalid': '範本同步異常',
    GroupReceiver: {
      Project: '專案名稱',
      User: '使用者',
      Role: '角色',
      ProjectOwner: '專案經理',
      All: '全部'
    },
    ViewAll: '全部',
    TimeRange: '訊息區間',
    From: '自',
    To: '到',
    SelectDate: '選擇日期',
    SelectMessageType: '選擇訊息種類',
    Unread: '僅顯示未讀訊息',
    IncludeSystemMessage: '含系統訊息',
    Apply: '確認',
    MessageConsole: '推播管理',
    MessageNote: '* 平台僅保留7天內訊息，如有重要資訊請另行儲存。',
    CreateMessage: '新增推播',
    EditMessage: '編輯推播',
    MessageContent: '訊息內容',
    Public: '公開',
    Private: '指定',
    GroupReceiverTitle: '推播對象',
    AlertLevel: '訊息類別',
    Send: '傳送',
    NotifyClosed: '訊息已關閉',
    SearchLabel: '搜尋訊息標題或寄送者'
  },
  Excalidraw: {
    Whiteboard: '協作白板',
    Name: '白板名稱',
    CreateBoard: '新增白板',
    EditBoard: '編輯白板'
  },
  IssueMatrix: {
    Relations: '關係',
    SearchAllRelations: '尋找全部關係',
    SearchFor: '僅往下找',
    OnlyDown: '往下',
    Layer: '層',
    RelatedIssue: '@:Issue.RelatedIssue',
    LayerWarning: '請填入數字，預設留空為全部。',
    DisplayItem: '顯示項目',
    SelectDisplayItem: '請選擇顯示項目',
    ConditionSettings: '設定條件',
    Id: '議題編號',
    Name: '@:Issue.name',
    Status: '@:Issue.FilterDimensions.status',
    Tracker: '@:Issue.FilterDimensions.tracker',
    Assignee: '@:Issue.Assignee',
    Version: '版號',
    DisplayItemWarning: '顯示項目請至少包含議題名稱或議題編號',
    CancelTrackerWarning: '開啓群組且選擇狀態時，顯示項目必須勾選議題類別',
    CancelStatusWarning: '開啓群組且選擇類別時，顯示項目必須勾選議題狀態'
  },
  Docker: {
    Title: 'Docker映像檔安全掃描​',
    Overview: '總　覽​',
    Severity: '風險等級​',
    Critical: '嚴重​',
    High: '高',
    Medium: '中',
    Low: '低',
    Negligible: '可忽略',
    Unknown: '其他',
    Fixable: '可被修復',
    AlertDetail: '詳細風險列表​',
    Reference: '風險敍述參照',
    Vulnerability: '弱點項目​',
    Package: '資源套件​​',
    Licenses: '軟體授權條款',
    Type: '安裝類別',
    CurrentVersion: '目前版本​',
    FixedVersion: '已修復版本​',
    Success: '@:general.Success',
    Complete: '@:Status.Finished',
    Scanning: '掃描中',
    Queued: '排程中',
    'Not Scanned': '準備中',
    Size: '檔案大小'
  },
  RedmineMail: {
    Warning: '[注意] Email 服務啟用或停用，將觸發 Redmine 重啟。其重啟時間將影響 3-5分鐘平台無法使用，請謹慎設定利用。'
  },
  Plugins: { NoArguments: '無可設定之參數。', ...asyncLangs }
}
