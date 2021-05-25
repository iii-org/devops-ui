<template>
  <el-row>
    <el-row v-if="note.notes.length>0" :span="24" type="flex" align="bottom" :justify="right|justifyRight">
      <el-col v-if="right" class="time">
        {{ note.created_on | formatTime }}
      </el-col>
      <el-col class="dialog" :class="{right:right}">
        <div class="author" :class="{'text-right':right}">{{ note.user.name }}</div>
        <div class="content">
          <viewer ref="viewer" class="text" :initial-value="note.notes" />
        </div>
      </el-col>
      <el-col v-if="!right" class="time">
        {{ note.created_on | formatTime }}
      </el-col>
    </el-row>
    <template v-if="note.hasOwnProperty('details')">
      <el-row v-for="(detail,index) in note.details" :key="index">
        <div class="el-divider el-divider--horizontal">
          <i18n path="Issue.detail.message.set_to" tag="div" class="el-divider__text is-center">
            <span slot="user">{{ note.user.name }}</span>
            <b slot="action">{{ ($te('Issue.detail.' + detail.name)) ? $t('Issue.detail.' + detail.name) : $t('Issue.detail.' + detail.property)
            }}</b>
            <span slot="message">
              <span v-if="detail.old_value&&detail.new_value">
                <i18n path="Issue.detail.message.from_to">
                  <el-link v-if="detail.name==='parent_id'" slot="0" @click="showParentIssue(detail.new_value.id)">
                    {{ detail.old_value.subject }}
                  </el-link>
                  <b v-else slot="0">
                    {{ ($te('Issue.' + getValueName(detail.old_value))) ? $t('Issue.' + getValueName(detail.old_value)) : getValueName(detail.old_value) }}
                  </b>
                  <el-link v-if="detail.name==='parent_id'" slot="1" @click="showParentIssue(detail.new_value.id)">
                    {{ detail.new_value.subject }}
                  </el-link>
                  <b v-else slot="1">
                    {{ ($te('Issue.' + getValueName(detail.new_value))) ? $t('Issue.' + getValueName(detail.new_value)) : getValueName(detail.new_value) }}
                  </b>
                </i18n>
              </span>
              <span v-else-if="detail.old_value">
                <i18n path="Issue.detail.message.from">
                  <el-link v-if="detail.name==='parent_id'" slot="0" @click="showParentIssue(detail.new_value.id)">
                    {{ detail.old_value.subject }}
                  </el-link>
                  <b v-else slot="0">
                    {{ ($te('Issue.' + getValueName(detail.old_value))) ? $t('Issue.' + getValueName(detail.old_value)) : getValueName(detail.old_value) }}
                  </b>
                </i18n>
              </span>
              <span v-else>
                <i18n path="Issue.detail.message.to">
                  <el-link v-if="detail.name==='parent_id'" slot="0" @click="showParentIssue(detail.new_value.id)">
                    {{ detail.new_value.subject }}
                  </el-link>
                  <b v-else slot="0">
                    {{ ($te(getValueName(detail.new_value))) ? $t('Issue.' + getValueName(detail.new_value)) : getValueName(detail.new_value) }}
                  </b>
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
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

import { Viewer } from '@toast-ui/vue-editor'

export default {
  name: 'DialogContent',
  i18n,
  components: {
    Viewer
  },
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
  watch: {
    note: {
      deep: true,
      handler(value) {
        this.$nextTick(() => {
          if (value.notes.length > 0) {
            this.$refs['viewer'].invoke('setMarkdown', value.notes)
          }
        })
      }
    }
  },
  methods: {
    getValueName(value) {
      if (value && typeof value === 'object') {
        return (value.hasOwnProperty('name')) ? value.name : this.getValueName(value[Object.keys(value)[0]])
      }
      return value
    },
    showParentIssue(id) {
      this.$emit('show-parent-issue', id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/variables";

.dialog {
  width: fit-content;
  display: inline;
  margin: 0 10px;

  .author {
    margin-top: 10px;
  }

  .content {
    border: 1px solid #eeeeee;
    background: #eeeeee;
    border-radius: 10px;
    padding: 0 5px;
    min-height: 2em;

    > > > .text {
      p {
        margin: 5px;
      }
    }
  }
}

.time {
  display: inline;
  bottom: 0;
  width: fit-content;
}

.right {
  float: right;

  .content {
    background: mix($success, #FFFFFF, 70)
  }
}
</style>
