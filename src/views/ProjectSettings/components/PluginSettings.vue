<template>
  <el-collapse-item name="PluginSettings">
    <template slot="title">
      <span class="text-subtitle-1 font-weight-bold">測試工具管理</span>
    </template>
    <div class="d-flex justify-space-between align-center mb-1">
      <div>
        <span class="text-subtitle-2 mr-2">{{ $t('Git.Branch') }}</span>
        <el-select
          v-model="selectedBranch"
          :placeholder="$t('RuleMsg.PleaseSelect')"
          size="mini"
          :style="{ width: '120px' }"
        >
          <el-option v-for="branch in branchs" :key="branch.value" :label="branch.label" :value="branch.value" />
        </el-select>
      </div>
      <el-button type="text" size="medium">
        進階分支設定
      </el-button>
    </div>
    <el-table :data="tableData" fit :show-header="false">
      <el-table-column align="center" prop="name" />
      <el-table-column align="center" prop="type" />
      <el-table-column align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.active" active-color="#13ce66" inactive-color="gray" />
        </template>
      </el-table-column>
    </el-table>
  </el-collapse-item>
</template>

<script>
const res = () => ({
  message: 'success',
  data: {
    versions: [
      {
        name: 'Postman',
        key: 'Postman',
        type: 'API 測試',
        active: false
      },
      {
        name: 'WebInspect',
        key: 'WebInspect',
        type: '黑箱測試',
        active: true
      },
      {
        name: 'CheckMarx',
        key: 'CheckMarx',
        type: '源碼掃描',
        active: true
      },
      {
        name: 'SonarQube',
        key: 'SonarQube',
        type: '源碼掃描',
        active: false
      }
    ]
  }
})

export default {
  name: 'PluginSettings',
  components: {},
  data: () => ({
    tableData: res().data.versions,
    branchs: [
      {
        label: 'Master',
        value: 'Master'
      },
      {
        label: 'Developer',
        value: 'Developer'
      }
    ],
    selectedBranch: ''
  }),
  computed: {},
  watch: {},
  mounted() {},
  methods: {}
}
</script>
