export default {
  'description': '描述',
  'host': { title: '主機位址', hint: '請輸入 AD 伺服器位址', placeholder: '127.0.0.1:389' },
  'ou': { title: '組織', hint: '請輸入 OU', placeholder: '部門名稱' },
  'domain': { title: '網域', hint: '請輸入 base dn', placeholder: 'test-ad.corp' },
  'account': { title: '帳號', hint: '請輸入 AD 連線帳號', placeholder: 'account' },
  'password': { title: '密碼', hint: '請輸入 AD 連線密碼', placeholder: 'password' },
  'default_password': { title: '新建帳號預設密碼', hint: '請輸入預設密碼', placeholder: 'password' },
  'connect_timeout': { title: '與AD連線時間', hint: '請輸入 Connect timeout', placeholder: '5' },
  'default_role_id': { title: '預設角色 ID', hint: '請輸入預設角色 ID', placeholder: '3' }
}
