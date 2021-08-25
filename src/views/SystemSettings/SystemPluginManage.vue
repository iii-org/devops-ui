<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-col>
      <el-row type="flex" justify="end">
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </el-row>
      <el-divider />
      <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" fit>
        <el-table-column :label="$t('general.Name')" align="center" prop="name" />
        <el-table-column :label="$t('general.Description')" align="center">
          <template slot-scope="scope">
            {{ $t(`Plugins.${scope.row.name}.description`) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Status')" align="center" prop="disabled" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column-time :label="$t('general.LastUpdateTime')" prop="update_at" width="200" />
        <el-table-column :label="$t('general.Actions')" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEditClick(scope.row.name)">
              {{ $t('general.Edit') }}
            </el-button>
            <el-button size="mini" @click="handleActiveClick(scope.row)">
              <div class="flex items-center">
                <span class="dot" :class="scope.row.disabled ? 'bg-success' : 'bg-danger'" />
                <span class="ml-2" :class="scope.row.disabled ? 'text-success' : 'text-danger'">
                  {{ !scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
                </span>
              </div>
            </el-button>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>

    <el-dialog :visible.sync="isDialogVisible" width="50vw" :show-close="false" @close="handleClose">
      <span slot="title">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-title capitalize">{{ pluginName }}</div>
            <div v-if="pluginName">{{ $t(`Plugins.${pluginName}.description`) }}</div>
          </div>
          <div>
            <el-popconfirm
              v-if="isRemovable"
              :confirm-button-text="$t('general.Remove')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              class="mr-3"
              :title="$t('Member.confirmRemove')"
              @confirm="handleDelete(pluginName)"
            >
              <el-button slot="reference" size="mini" type="danger">
                {{ $t('general.Remove') }}
              </el-button>
            </el-popconfirm>
            <el-button size="mini" @click="handleClose">{{ $t('general.Cancel') }}</el-button>
            <el-button type="primary" size="mini" @click="handleConfirm">
              {{ $t('general.Save') }}
            </el-button>
          </div>
        </div>
      </span>

      <el-form v-if="hasArguments" ref="form" :model="form" label-position="left" label-width="200px">
        <template v-for="(arg, argIdx) in form.arguments">
          <el-form-item
            :key="argIdx"
            :label="$t(`Plugins.${pluginName}.arguments.${arg.key}.title`)"
            :prop="'arguments.' + argIdx + '.value'"
            :rules="[
              { required: true, message: $t(`Plugins.${pluginName}.arguments.${arg.key}.hint`), trigger: 'blur' }
            ]"
          >
            <el-input
              v-if="arg.type === 'string'"
              v-model="form.arguments[argIdx].value"
              :placeholder="$t(`Plugins.${pluginName}.arguments.${arg.key}.placeholder`)"
            />
            <el-input
              v-if="arg.type === 'password'"
              v-model="form.arguments[argIdx].value"
              :placeholder="$t(`Plugins.${pluginName}.arguments.${arg.key}.placeholder`)"
              show-password
            />
            <el-select
              v-if="arg.type === 'select'"
              v-model="form.arguments[argIdx].value"
              :placeholder="$t(`Plugins.${pluginName}.arguments.${arg.key}.placeholder`)"
            >
              <el-option
                v-for="option in form.arguments[argIdx].options"
                :key="option.id"
                :label="option.name"
                :value="String(option.id)"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <div v-else>{{ $t('Plugins.NoArguments') }}</div>
    </el-dialog>
  </el-row>
</template>

<script>
import { getPlugins, getPluginDetails, updatePlugin, deletePlugin } from '@/api/systemPlugin'
import { SearchBar, Pagination } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const formTemplate = () => ({
  disabled: false,
  arguments: []
})

export default {
  name: 'SystemPluginManage',
  components: { ElTableColumnTime },
  mixins: [SearchBar, Pagination],
  data() {
    return {
      listLoading: false,
      listData: [],
      isLoading: false,
      isDialogVisible: false,
      pluginName: '',
      form: formTemplate(),
      isRemovable: false
    }
  },
  computed: {
    hasArguments() {
      return this.form.arguments.length > 0
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getPlugins()
      this.listData = res.data.sort((a, b) => (a.name < b.name ? -1 : 1))
      this.listLoading = false
    },
    async handleEditClick(pluginName) {
      this.isAddPlugin = false
      this.isLoading = true
      const res = await getPluginDetails(pluginName)
      const { name, disabled } = res.data
      this.pluginName = name
      Object.assign(this.form, { disabled, arguments: res.data.arguments })
      this.isLoading = false
      this.isDialogVisible = true
    },
    async handleActiveClick(row) {
      const { name, disabled } = row
      this.isLoading = true
      await updatePlugin(name, { disabled: !disabled })
      this.loadData()
      this.isLoading = false
    },
    handleClose() {
      this.isDialogVisible = false
      if (!this.hasArguments) return
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate()
      })
    },
    handleConfirm() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const sendData = Object.assign({}, this.form)
          sendData.arguments = this.form.arguments.reduce(
            (result, cur) => Object.assign(result, { [cur.key]: cur.value }),
            {}
          )
          await updatePlugin(this.pluginName, sendData)
          this.handleClose()
          this.loadData()
        }
      })
    },
    handleDelete(pluginName) {
      this.isLoading = true
      deletePlugin(pluginName)
        .then(() => {
          this.$message({
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error'
          })
        })
        .then(() => {
          this.loadData()
          this.isLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
