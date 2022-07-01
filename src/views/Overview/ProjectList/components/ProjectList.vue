<template>
  <el-select
    v-model="form.parent_id"
    :placeholder="$t('Project.SelectProject')"
    class="mr-3"
    style="width:100%"
    filterable
    clearable
    @change="handleChange()"
    @clear="form.is_inheritance_member=false"
  >
    <el-option-group
      v-for="group in categoryProjectList"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="item in group.options"
        :key="item.id"
        :label="item.display"
        :value="item.id"
      />
    </el-option-group>
  </el-select>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectList',
  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProjectId'])
  },
  mounted() {
    this.getCategoryProjectList()
  },
  methods: {
    getCategoryProjectList() {
      if ((this.selectedProjectId === -1 || !this.selectedProjectId) && !this.clearable) {
        this.showNoProjectWarning()
        return []
      }
      const filteredArray = this.projectOptions.filter(obj => {
        return obj.is_lock !== true && obj.disabled !== true
      })
      const starred = filteredArray.filter((item) => item.starred)
      const projects = filteredArray.filter((item) => !item.starred)
      this.categoryProjectList = [
        {
          label: this.$t('Project.Starred'),
          options: starred
        },
        { options: projects }
      ]
    },
    handleChange() {
      this.$emit('change')
    }
  }
}
</script>
