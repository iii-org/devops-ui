<template>
  <el-table
    v-loading="memberData.loading"
    :data="categoryByRole"
    row-key="user_id"
    :show-header="false"
  >
    <el-table-column
      :label="$t('Member.Role')"
      prop="role_name"
      width="200"
      sortable
      show-overflow-tooltip
    >
      <div
        slot-scope="scope"
        class="text-right"
      >
        <span>
          <strong>
            {{ scope.row.role_name }}
          </strong>
          ({{ scope.row.user_name.length }})
        </span>
      </div>
    </el-table-column>
    <el-table-column
      :label="$t('Dashboard.ADMIN.ProjectMembers.NAME')"
      prop="user_name"
      sortable
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        <el-tag
          v-for="(user,idx) in scope.row.user_name"
          :key="idx"
          class="member"
          :class="scope.row.role_name"
        >
          {{ user }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'AdminMemberTable',
  props: {
    memberData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    categoryByRole() {
      const category = {}
      const result = []
      this.memberData.children.forEach((item) => {
        if (!category.hasOwnProperty(item.role_name)) {
          category[item.role_name] = []
        }
        category[item.role_name].push(item.user_name)
      })
      Object.keys(category).forEach((item) => {
        result.push({ role_name: item, user_name: category[item] })
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.member {
  font-size: 1.025em;
  margin-left: 10px;
  border-radius: 5px;

  &.Administrator {
    border-color: $danger_border;
    color: $danger_text;
    background: $danger;
  }
  &.Manager {
    border-color: $warning_text;
    color: $warning_text;
    background: $warning;
  }
  &.Engineer {
    border-color: $success_text;
    color: $success_text;
    background: $success;
  }
}
</style>
