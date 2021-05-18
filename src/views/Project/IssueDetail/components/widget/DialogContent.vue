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
      <el-row v-for="(detail,index) in note.details" :key="index">
        <div class="el-divider el-divider--horizontal">
          <i18n path="Issue.detail.message.set_to" tag="div" class="el-divider__text is-center">
            <span slot="user">{{ note.user.name }}</span>
            <b slot="action">{{ ($te('Issue.detail.'+detail.name))?$t('Issue.detail.'+detail.name):$t('Issue.detail.'+detail.property) }}</b>
            <span slot="message">
              <span v-if="detail.old_value&&detail.new_value">
                <i18n path="Issue.detail.message.from_to">
                  <b slot="0">{{ getValueName(detail.old_value) }}</b>
                  <b slot="1">{{ getValueName(detail.new_value) }}</b>
                </i18n>
              </span>
              <span v-else-if="detail.old_value">
                <i18n path="Issue.detail.message.from">
                  <b slot="0">{{ getValueName(detail.old_value) }}</b>
                </i18n>
              </span>
              <span v-else>
                <i18n path="Issue.detail.message.to">
                  <b slot="0">{{ getValueName(detail.new_value) }}</b>
                </i18n>
              </span>
            </span>
            <span slot="time">{{ note.created_on | formatTime }}</span>
          </i18n>
        </div>
      </el-row>
    </template>
  </el-row>
</template>

<script>
import dayjs from 'dayjs'
import i18n from '@/lang'

export default {
  name: 'DialogContent',
  i18n,
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
