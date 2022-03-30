<template>
  <div class="flex right-menu items-center">
    <el-dropdown
      trigger="click"
      class="international"
    >
      <span class="flex items-center">
        <el-badge :value="msgs.length" class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-pointer"
            style="color: #D7A217;"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.28918 4.90761C10.4238 4.63513 13.5762 4.63512 16.7108 4.90761L18.2211 5.03889C19.2264 5.12629 20.0875 5.72596 20.5337 6.58374C20.5907 6.69347 20.5479 6.82633 20.4428 6.89144L14.1768 10.7704C12.833 11.6023 11.1384 11.6197 9.77772 10.8157L3.46989 7.08833C3.36798 7.02811 3.3212 6.90415 3.36713 6.79505C3.77529 5.82548 4.69292 5.1333 5.77895 5.0389L7.28918 4.90761Z" />
            <path d="M 3.362 8.76688 C 3.20603 8.67472 3.00703 8.7739 2.98885 8.95414 C 2.73512 11.4698 2.79653 14.0092 3.17308 16.5133 C 3.3716 17.8334 4.44901 18.8455 5.77895 18.9611 L 7.28918 19.0924 C 10.4238 19.3649 13.5762 19.3649 16.7108 19.0924 L 18.2211 18.9611 C 19.551 18.8455 20.6284 17.8334 20.8269 16.5133 C 21.2145 13.9363 21.2682 11.3217 20.9882 8.73428 C 20.9685 8.55276 20.7662 8.45541 20.6109 8.55151 L 14.9664 12.0458 C 13.1482 13.1713 10.8556 13.1949 9.01462 12.1071 L 3.362 8.76688 Z" />
          </svg>
        </el-badge>
      </span>
      <el-dropdown-menu slot="dropdown" style="{max-width: 300px; max-height: 80%}">
        <el-dropdown-item
          v-for="msg in msgs"
          :key="msg.id"
          class="pa-0"
          @click.native="showMessage(msg)"
        >
          <el-row class="flex">
            <el-col :span="4" style="line-height: 24px">
              <em class="el-icon-info" style="color: #606260" />
            </el-col>
            <el-col style="line-height: 28px"> 
              {{ msg.message }}
            </el-col>
          </el-row>
          <el-divider class="divider" />
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      title="Message"
      :show-close="false"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-input
        type="textarea"
        :value="message"
        readonly
        resize="none"
      />
      <span slot="footer" class="dialog-footer">
        <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'AbnormalChecker',
  props: {
    msgs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      message: '',
      dialogVisible: false
    }
  },
  methods: {
    showMessage(msg) {
      console.log(msg)
      this.dialogVisible = true
      this.message = msg.message
    }
  }
}
</script>

<style lang="scss" scoped>
.swing {
  animation: swing 2s infinite;
}
.divider {
  margin: 1px;
}
</style>
