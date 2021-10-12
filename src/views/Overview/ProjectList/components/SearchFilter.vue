<template>
  <div>
    <el-popover placement="bottom" trigger="click">
      <el-form>
        <el-form-item>
          <el-select>
            <el-option>
              123
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
        <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  data() {
    return {
      listFilter: this.$t('general.Filter')
    }
  }
}
</script>
