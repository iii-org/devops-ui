<template>
  <el-row class="app-container">
    <project-list-selector>
      <el-row slot="button">
        <el-col class="text-right">
          <p v-if="updateLoading" class="text-blue-500">
            <em class="el-icon-loading" /> 儲存中......
          </p>
          <p v-else-if="lastUpdated&&lastUpdated.time" class="text-success">
            <em class="el-icon-check" /> <strong>儲存完成：</strong>{{ lastUpdated.time|relativeTime }}
          </p>
          <p v-else-if="lastUpdated&&lastUpdated.error" class="text-danger">
            <em class="el-icon-check" /> <strong>儲存失敗：</strong>{{ lastUpdated.error }}
          </p>
        </el-col>
      </el-row>
      <!--      <el-popover-->
      <!--        placement="bottom"-->
      <!--        trigger="click"-->
      <!--      >-->
      <!--        <el-form v-loading="listLoading">-->
      <!--          &lt;!&ndash;          <el-form-item label="結束日期範圍">&ndash;&gt;-->
      <!--          &lt;!&ndash;            <el-date-picker&ndash;&gt;-->
      <!--          &lt;!&ndash;              v-model="dateRange"&ndash;&gt;-->
      <!--          &lt;!&ndash;              type="daterange"&ndash;&gt;-->
      <!--          &lt;!&ndash;            />&ndash;&gt;-->
      <!--          &lt;!&ndash;          </el-form-item>&ndash;&gt;-->
      <!--          <template v-for="dimension in filterOptions">-->
      <!--            <el-form-item :key="dimension.id">-->
      <!--              <div slot="label">-->
      <!--                {{ $t('Issue.' + dimension.value) }}-->
      <!--                <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">-->
      <!--                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>-->
      <!--                </el-tag>-->
      <!--              </div>-->
      <!--              <el-select-->
      <!--                v-model="filterValue[dimension.value]"-->
      <!--                :placeholder="$t('Issue.Select'+dimension.placeholder)"-->
      <!--                :disabled="selectedProjectId === -1"-->
      <!--                filterable-->
      <!--                :clearable="!dimension.non_cleanable"-->
      <!--                @change="onChangeFilter"-->
      <!--              >-->
      <!--                <el-option-->
      <!--                  v-for="item in (dimension.value==='status')? filterClosedStatus(getOptionsData(dimension.value)):getOptionsData(dimension.value)"-->
      <!--                  :key="(dimension.value==='assigned_to')? item.login: item.id"-->
      <!--                  :label="getSelectionLabel(item)"-->
      <!--                  :class="{[item.class]:item.class}"-->
      <!--                  :value="item.id"-->
      <!--                >-->
      <!--                  <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />-->
      <!--                </el-option>-->
      <!--              </el-select>-->
      <!--            </el-form-item>-->
      <!--          </template>-->
      <!--          <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">-->
      <!--            <el-checkbox v-model="displayClosed" @change="onChangeFilter" />-->
      <!--          </el-form-item>-->
      <!--        </el-form>-->
      <!--        <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}-->
      <!--          <i class="el-icon-arrow-down el-icon&#45;&#45;right" /></el-button>-->
      <!--      </el-popover>-->
      <!--      <el-divider direction="vertical" />-->
      <!--      <el-input-->
      <!--        v-if="searchVisible"-->
      <!--        id="input-search"-->
      <!--        v-model="keyword"-->
      <!--        prefix-icon="el-icon-search"-->
      <!--        :placeholder="$t('Issue.SearchNameOrAssignee')"-->
      <!--        style="width: 250px;"-->
      <!--        clearable-->
      <!--        @blur="searchVisible=!searchVisible"-->
      <!--        @change="onChangeFilter"-->
      <!--      />-->
      <!--      <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">-->
      <!--        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}-->
      <!--      </el-button>-->
      <!--      <template v-if="isFilterChanged">-->
      <!--        <el-divider direction="vertical" />-->
      <!--        <el-button size="small" icon="el-icon-close" @click="cleanFilter">-->
      <!--          {{ $t('Issue.CleanFilter') }}-->
      <!--        </el-button>-->
      <!--      </template>-->
    </project-list-selector>
    <el-divider />
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane name="plan" label="plan">
        <WBS @update-loading="handleUpdateLoading" @update-status="handleUpdateStatus" />
      </el-tab-pane>
      <el-tab-pane name="gannt" label="gantt">
        <Gantt />
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Gantt from '@/views/Plugin/QA/views/Project/Milestone/components/Gantt'
import WBS from '@/views/Plugin/QA/views/Project/Milestone/components/WBS'

export default {
  name: 'ProjectMilestone',
  components: {
    WBS,
    Gantt,
    ProjectListSelector
  },
  data() {
    return {
      listLoading: false,
      contentLoading: false,

      updateLoading: false,
      lastUpdated: null,

      activeNames: '',
      searchVisible: false,
      fixed_version_closed: false,
      displayClosed: false,
      fixed_version: [],
      assigned_to: [],
      status: [],
      priority: [],
      filterValue: {},
      originFilterValue: {},
      keyword: null,

      listData: [],
      activeTab: 'plan',
      addTopicDialog: {
        visible: false,
        parentId: 0,
        parentName: null,
        LoadingConfirm: false
      },
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProject', 'tracker', 'fixedVersionShowClosed']),
    selectedProjectId() {
      return this.selectedProject.id
    }
  },
  watch: {
    selectedProjectId: {
      immediate: false,
      async handler() {
      }
    }
  },
  async mounted() {
  },
  methods: {
    handleUpdateLoading(value) {
      this.updateLoading = value
    },
    handleUpdateStatus(value) {
      console.log(value)
      this.lastUpdated = value
    }
  }
}
</script>

<style lang="scss" scoped></style>
