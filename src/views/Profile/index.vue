<template>
  <div class="app-container">
    <div style="background: white;padding: 15px 15px;">
      <el-tabs :tab-position="tabPosition">
        <el-tab-pane label="Basic">
          <div style="padding: 0px 25px;">
            <h3>Profile Basic Setting</h3>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Account
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Name
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Organization
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Email
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Phone
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <el-button type="primary">Save</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Security">
          <div style="padding: 0px 25px;">
            <h3>Profile Security Setting</h3>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Old Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                New Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Repeat New Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input />
              </el-col>
            </el-row>
            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <el-button type="primary">Save</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tabPosition: 'left'
    }
  },
  created() {},
  methods: {}
}
</script>
