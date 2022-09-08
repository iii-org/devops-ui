<template>
  <div>
    <el-row>
      <el-col>
        <h2 class="text-center">
          {{ $t('Test.TestFile.CreateTestDataSetting') }}
        </h2>
      </el-col>
    </el-row>
    <el-row class="el-card scroll">
      <el-col class="el-card__body">
        <el-row :gutter="20">
          <el-col :span="24" class="mb-5">
            <h4 class="mb-3">
              {{ $t('Test.TestFile.ParamsAndRange') }}
            </h4>
            <el-form>
              <template v-for="item in params">
                <el-form-item :key="item.name">
                  <el-col :span="5">
                    <span class="font-bold">{{ item.name }}</span>
                  </el-col>
                  <el-col :span="5">
                    <el-select
                      v-model="item.type"
                      :placeholder="$t('RuleMsg.PleaseSelect')"
                    >
                      <el-option label="文字" value="text" />
                      <el-option label="數值" value="value" />
                    </el-select>
                  </el-col>
                  <el-col :span="9">
                    <el-input
                      v-model="item.range"
                      placeholder="請輸入範圍,請以,隔開,如1,2,3"
                    />
                  </el-col>
                  <el-col :span="5">
                    <el-button
                      type="danger"
                      icon="el-icon-close"
                    >
                      {{ $t('general.Clear') }}
                    </el-button>
                  </el-col>
                </el-form-item>
              </template>
            </el-form>
          </el-col>
          <el-col :span="24">
            <div class="flex justify-between mb-3">
              <h4 style="display: inline;">
                {{ $t('Test.TestFile.ParamsLimit') }}
              </h4>
              <div>
                {{ $t('Test.TestFile.SettingReference') }}
                <el-link
                  type="primary"
                  target="_blank"
                  href="https://github.com/microsoft/pict/blob/main/doc/pict.md"
                >
                  https://github.com/microsoft/pict/blob/main/doc/pict.md
                </el-link>
              </div>
            </div>
            <el-col :span="24">
              <el-input
                v-model="limit"
                type="textarea"
                :rows="10"
                :placeholder="limitPlaceholder"
              />
            </el-col>
            <el-col :span="24">
              <span class="text-danger">
                [注意] 欲設限之變數，記得以中括弧包起來，如[變數]
              </span>
            </el-col>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CreateTestDataDialog',
  data() {
    return {
      isLoading: false,
      params: [{
        name: 'Percentage',
        type: '',
        range: ''
      }],
      limit: '',
      limitPlaceholder: `IF [File system] = "FAT" THEN [Size] <= 4096;
IF [File system] = "FAT32" THEN [Size] <= 32000;

IF [File system] <> "NTFS" OR
( [File system] =  "NTFS" AND [Cluster size] > 4096 )
THEN [Compression] = "Off";

IF NOT ( [File system] = "NTFS" OR
      ( [File system] = "NTFS" AND NOT [Cluster size] <= 4096 ))
THEN [Compression] = "Off";`
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.scroll {
  overflow: auto;
  height: 500px;
}
</style>
