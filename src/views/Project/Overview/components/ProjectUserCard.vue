<template>
  <el-card class="mb-3" shadow="never">
    <div slot="header" class="flex align-center" :style="{ height: '30px' }">
      <span class="font-semibold">{{ $t('Dashboard.ProjectUsers') }}</span>
    </div>
    <div v-if="!selectedProjectId" class="flex justify-center align-center" style="height: 300px">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <el-table v-else :data="userList" style="width: 100%" stripe>
      <el-table-column prop="role_name" :label="$t('Project.Title')" />
      <el-table-column prop="name" :label="$t('general.Name')">
        <template slot-scope="scope">
          {{ `${scope.row.name} (${scope.row.login})` }}
        </template>
      </el-table-column>
      <el-table-column prop="email" :label="$t('general.Email')" />
    </el-table>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectUserCard',
  props: {
    userList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  }
}
</script>
