<template>
  <el-row>
    <el-row :span="24" type="flex" align="bottom" :justify="right|justifyRight">
      <template v-if="note.notes.length>0">
        <el-col v-if="right" class="time">
          {{ note.created_on | formatTime }}
        </el-col>
        <el-col class="dialog" :class="{right:right}">
          <div class="author" :class="{'text-right':right}">{{ note.user.name }}</div>
          <div class="content">
            <VueShowdown class="text" :markdown="note.notes" />
          </div>
        </el-col>
        <el-col v-if="!right" class="time">
          {{ note.created_on | formatTime }}
        </el-col>
      </template>
    </el-row>
    <template v-if="note.hasOwnProperty('details')">
      <el-divider v-for="(detail,index) in note.details" :key="index" content-position="center">
        {{ note.user.name }}: <b>{{ detail.name }}</b> set {{ getValueName(detail.old_value) }} to {{ getValueName(detail.new_value) }} ({{ note.created_on | formatTime }})
      </el-divider>
    </template>
  </el-row>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'DialogContent',
  filters: {
    justifyRight(value) {
      return (value) ? 'end' : 'start'
    },
    formatTime(value) {
      return dayjs(value).fromNow()
    }
  },
  props: {
    note: {
      type: Object,
      default: () => ({})
    },
    right: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getValueName(value) {
      if (value && typeof value === 'object') {
        return (value.hasOwnProperty('name')) ? value.name : this.getValueName(value[Object.keys(value)[0]])
      }
      return value
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/variables";
.dialog{
  width: fit-content;
  display: inline;
  margin: 0 10px;

  .author{
    margin-top:10px;
  }

  .content{
    border: 1px solid #eeeeee;
    background: #eeeeee;
    border-radius:10px;
    padding: 0 5px;
    min-height:2em;
    >>>.text {
      p {
        margin: 5px;
      }
    }
  }
}
.time{
  display: inline;
  bottom:0;
  width: fit-content;
}
.right{
  float:right;
  .content{
    background: mix($success, #FFFFFF, 70)
  }
}
</style>
