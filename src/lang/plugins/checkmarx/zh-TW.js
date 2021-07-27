export default {
  'description': 'Checkmarx 原始碼掃描',
  'arguments': {
    'client-secret': { title: 'Client Secret', hint: '請輸入 Client Secret', placeholder: 'Checkmarx client 的 secret' },
    'cm-url': { title: '伺服器位置', hint: '請輸入伺服器位置', placeholder: 'Checkmarx 伺服器的網址' },
    'username': { title: '使用者名稱', hint: '請輸入使用者名稱', placeholder: 'Checkmarx 的使用者名稱' },
    'password': { title: '密碼', hint: '請輸入密碼', placeholder: 'Checkmarx 的使用者密碼' }
  }
}
