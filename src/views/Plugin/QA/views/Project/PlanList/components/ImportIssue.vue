<template>
  <el-dialog :visible="visible" width="90%" top="20px" title="安全需求檢核表" @close="handleClose">
    <el-table ref="issueRequireTable" :data="data">
      <el-table-column type="selection" width="55px" />
      <el-table-column label="安全需求項目" min-width="200" prop="item" />
      <el-table-column label="適用分級">
        <el-table-column label="低" width="75px">
          <template slot-scope="prop">
            <i v-if="prop.row.low" class="el-icon-check" />
          </template>
        </el-table-column>
        <el-table-column label="中" width="75px">
          <template slot-scope="prop">
            <i v-if="prop.row.middle" class="el-icon-check" />
          </template>
        </el-table-column>
        <el-table-column label="高" width="75px">
          <template slot-scope="prop">
            <i v-if="prop.row.high" class="el-icon-check" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="安全特性分類" prop="category" />
    </el-table>
    <template slot="footer">
      <el-button type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'ImportIssue',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tracker: {
      type: Array,
      default: () => ([])
    },
    projectId: {
      type: Number,
      default: 0
    },
    saveData: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      data: [
        {
          'category': '機密性',
          'item': '1.1 機敏資料傳輸時，採用加密機制',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '機密性',
          'item': '1.2 使用公開、國際機構驗證且未遭破解的 \n演算法',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '機密性',
          'item': '1.3 使用演算法支援的最大長度金鑰',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '機密性',
          'item': '1.4 加密金鑰或憑證週期性更換',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '機密性',
          'item': '1.5 加密金鑰不與加密資料存放於同一系統 \n中，並對於加密金鑰的存取進行限制',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '機密性',
          'item': '1.6 機敏資料儲存時，採用加密機制',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.1 於伺服器端以正規表示式(Regular \nExpression)方式，檢查使用者輸入資料 合法性',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.2 針對開放下載的資料，也提供資料之雜 湊值(HASH Value)供使用者比對其完整 性',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.3 具有防範 SQL 命令注入攻擊(SQL Injection)之措施',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.4 具有防範跨站腳本攻擊(Cross-Site \nScripting)之措施',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.5 驗證網頁重導(Redirects)與導向 \n(Forwards)之目的地在合法名單內',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '完整性',
          'item': '2.6 重要系統資料或紀錄留存雜湊值以確保 \n完整性',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '可用性',
          'item': '3.1 重要資料定時同步至備份或備援環境， \n並加以保護限制存取',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '可用性',
          'item': '3.2 採用「高可用性」(High Availability) 架構(分散式或叢集伺服器架構)',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.1 除了允許匿名存取的功能外，所有功能 都必須已通過身分驗證才允許存取',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.2 身分驗證機制位於伺服器端且採用集中 \n過濾機制(例如使用 Filter 過濾器)',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.3 身分驗證相關資訊(帳號、密碼等)不留 \n存於程式原始碼中',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.4 確實規範使用者密碼強度 (密碼長度 12 \n個字元以上、包含英文大小寫、數字， 以及特殊字元)',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.5 使用者必須定期更換密碼，且至少不可 以與前 5 次使用過之密碼相同',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.6 具備帳戶鎖定機制，帳號登入進行身分 驗證失敗達 3 次後，至少 30 分鐘內不允 許該帳號及來源 IP 繼續嘗試登入',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.7 身分驗證相關資訊不以明文傳輸',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.8 密碼添加亂數(Salt)進行雜湊函式 (HASH Function)處理後，分別儲存亂數及雜湊後密碼',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.9 採用圖形驗證碼(CAPTCHA)機制於身分 \n驗證及重要交易行為，以防範自動化程 式之嘗試',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.10 重要交易行為要求使用者再次進行身 \n分驗證',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.11 採用多重因素身分驗證(兩種以上驗證 \n類型)',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '身分驗證',
          'item': '4.12 密碼重設機制對使用者重新身分確認 \n後，發送一次性及具有時效性令牌 (Token)，檢查傳回令牌有效性後，才 允許使用者進行重設密碼動作',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.1 執行功能及存取資源前，檢查使用者授 權',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.2 採用伺服端的集中過濾機制檢查使用者 \n授權',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.3 對使用者/角色，僅賦予所需要的最低權 限',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.4 軟體程序(process)及伺服器服務，以一 般使用者權限執行，不以系統管理員或 最高權限執行',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.5 除特殊管理者權限外，其他角色或權限 無法修改系統中授權資料及存取控制列 表(ACL)',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.6 重要行為由多人/角色授權後才得以進 \n行',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '授權與存取 控制',
          'item': '5.7 具有防範「跨站請求偽造」(Cross-Site \nRequest Forgery，CSRF)攻擊之措施',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '日誌紀錄',
          'item': '6.1 針對身分驗證失敗、存取資源失敗、重 \n要行為、重要資料異動、功能錯誤及管 理者行為進行日誌記錄',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '日誌紀錄',
          'item': '6.2 日誌紀錄包含以下項目 1.識別使用者之 \nID(不可為個資類型)。2.經系統校時後 \n的時間戳記。3.執行的功能或存取的資 源。4.事件類型或等級(priority)。5. 事件描述',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '日誌紀錄',
          'item': '6.3 採用單一的日誌紀錄機制，確保輸出格 式的一致性',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '日誌紀錄',
          'item': '6.4 對日誌紀錄進行適當保護及備份，避免 未經授權存取',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '會談 \n(Session) \n管理',
          'item': '7.1 使用者的會談階段，設定該帳號在合理 的時間(至多 30 分鐘)內未活動即自動失 效',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '會談 \n(Session) \n管理',
          'item': '7.2 使用者的會談階段在登出後失效',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '會談 \n(Session) \n管理',
          'item': '7.3 會談識別碼(Session ID)或使用者 ID 避 \n免顯示於使用者可以改寫處(例如網址 列)',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '會談 \n(Session) \n管理',
          'item': '7.4 會談識別碼(Session ID)採亂數隨機產生且不可預測',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '會談 \n(Session) \n管理',
          'item': '7.5 使用者登入後，重新賦予會談識別碼 \n(Session ID)',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '錯誤及例外 處理',
          'item': '8.1 發生錯誤時，使用者頁面僅顯示簡短錯 誤訊息及代碼，不包含詳細的錯誤訊息',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '錯誤及例外 處理',
          'item': '8.2 所有功能皆進行錯誤及例外處理，並確 保將資源正確釋放',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '錯誤及例外 處理',
          'item': '8.3 具備系統嚴重錯誤之通知機制(例如電 \n子郵件或簡訊)',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '組態管理',
          'item': '9.1 管理者介面限制存取來源或不允許遠端 \n存取',
          'low': 'TRUE',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '組態管理',
          'item': '9.2 作業平台定期更新並關閉不必要服務及 \n埠口(Port)',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '組態管理',
          'item': '9.3 系統依賴的外部元件或軟體，不使用預 設密碼',
          'low': '',
          'middle': 'TRUE',
          'high': 'TRUE'
        },
        {
          'category': '組態管理',
          'item': '9.4 參數設定或系統設定存放處，限制存取 或進行適當保護',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        },
        {
          'category': '組態管理',
          'item': '9.5 針對系統依賴的外部元件或軟體，注意 其安全漏洞通告，定期評估更新',
          'low': '',
          'middle': '',
          'high': 'TRUE'
        }
      ]
    }
  },
  methods: {
    handleClose() {
      this.$emit('close-dialog', false)
    },
    async handleSave() {
      const getSelection = this.$refs['issueRequireTable'].selection
      if (getSelection.length > 0) {
        this.LoadingConfirm = true
        // deep copy & remove field with empty value
        for (const select of getSelection) {
          const tracker = this.tracker.find((item) => (item.name === 'Audit'))
          const issueForm = {
            tracker_id: tracker.id,
            subject: select.item,
            status_id: 1,
            priority_id: 3
          }
          const data = JSON.parse(JSON.stringify(issueForm))
          Object.keys(data).map(item => {
            if (data[item] === '') delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          await this.saveData(form)
        }
        this.LoadingConfirm = false
        this.$refs['issueRequireTable'].clearSelection()
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
> > > .el-dialog__body {
  height: 75vh;
  overflow: auto;
}
</style>
