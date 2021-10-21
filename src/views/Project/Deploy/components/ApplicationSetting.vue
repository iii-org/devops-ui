<template>
  <el-form ref="deployForm" :model="deployForm" :rules="deployFormRules" label-width="150px">
    <el-row>
      <el-col>
        <el-form-item :label="$t('Deploy.Name')" prop="name">
          <el-input v-model="deployForm.name" />
        </el-form-item>
        <el-divider />
      </el-col>
      <el-col>
        <el-row class="form-container">
          <el-row>
            <el-col :md="12">
              <el-form-item :label="$t('Deploy.Cluster')" prop="cluster_id">
                <el-select v-model="deployForm.cluster_id" :disabled="cluster.length<=0">
                  <el-option v-for="item in cluster" :key="item.id" :label="item.name" :value="item.id"
                             :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item :label="$t('Deploy.Registry')" prop="registry_id">
                <el-select v-model="deployForm.registry_id" :disabled="registry.length<=0">
                  <el-option v-for="item in registry" :key="item.registries_id" :label="item.name"
                             :value="item.registries_id"
                             :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-form-item :label="$t('Deploy.Port')" prop="network.port">
              <el-input v-model.number="deployForm.network.port" />
            </el-form-item>
            <!--        <el-col :md="12">-->
            <!--          <el-form-item label="Volume" prop="volume">-->
            <!--            <el-select v-model="deployForm.volume" />-->
            <!--          </el-form-item>-->
            <!--        </el-col>-->
          </el-row>
          <template v-if="checkAvailable">
            <el-row>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Namespace')" prop="namespace">
                  <el-input v-model="deployForm.namespace" />
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Policy')" prop="image.policy">
                  <el-select v-model="deployForm.image.policy" clearable>
                    <el-option v-for="item in policy" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Release')" prop="release_id">
                  <el-select v-model="deployForm.release_id">
                    <el-option v-for="item in release" :key="item.id" :label="item.tag_name" :value="item.id" />
                  </el-select>
                  <p class="helper">* {{ $t('Deploy.ReleaseHelper') }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-divider content-position="left">{{ $t('Deploy.Resource') }}</el-divider>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.CPU')" prop="resources.cpu">
                  <el-input v-model.number="deployForm.resources.cpu" clearable :placeholder="$t('Deploy.Default')" />
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Memory')" prop="resources.memory">
                  <el-input v-model.number="deployForm.resources.memory" clearable :placeholder="$t('Deploy.Default')">
                    <template slot="append">GB</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Replicas')" prop="resources.replicas">
                  <el-input v-model.number="deployForm.resources.replicas" clearable
                            :placeholder="$t('Deploy.Default')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-divider content-position="left">{{ $t('Deploy.Network') }}</el-divider>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$tc('Deploy.Type')" prop="network.type">
                  <el-select v-model="deployForm.network.type">
                    <el-option v-for="item in network_type" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Protocol')" prop="network.protocol">
                  <el-radio-group v-model="deployForm.network.protocol">
                    <el-radio-button v-for="item in protocol" :key="item" :label="item" :value="item" />
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.ExposePort')" prop="network.port">
                  <el-input v-model.number="deployForm.network.expose_port" />
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Domain')" prop="network.domain">
                  <el-input v-model="deployForm.network.domain" clearable />
                </el-form-item>
              </el-col>
              <el-col :md="12">
                <el-form-item :label="$t('Deploy.Path')" prop="network.path">
                  <el-input v-model="deployForm.network.path" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-divider content-position="left">{{ $t('Deploy.EnvironmentVariable') }}
                  <el-button round size="small" icon="el-icon-plus" type="primary"
                             @click="addEnvironment"
                  >
                    {{ $t('Deploy.AddVariable') }}
                  </el-button>
                </el-divider>
              </el-col>
              <el-col>
                <el-form-item prop="environments" class="environments">
                  <el-table :data="deployForm.environments">
                    <el-table-column type="index" width="50px">
                      <template slot-scope="{$index}">
                        {{ $index + 1 }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="key" :label="$tc('Deploy.Key')">
                      <template slot-scope="{row}">
                        <el-input v-model="row.key" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="value" :label="$t('Deploy.Value')">
                      <template slot-scope="{row}">
                        <el-input v-model="row.value" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" :label="$tc('Deploy.Type')" width="150px">
                      <template slot-scope="{row}">
                        <el-select v-model="row.type">
                          <el-option v-for="item in environments_type" :key="item" :label="item" :value="item" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.Actions')" width="150px">
                      <template slot-scope="{row}">
                        <el-popconfirm :confirm-button-text="$t('general.Delete')"
                                       :cancel-button-text="$t('general.Cancel')"
                                       icon="el-icon-info"
                                       icon-color="red"
                                       :title="$t('Notify.confirmDelete')"
                                       @confirm="deployForm.environments.splice(deployForm.environments.indexOf(row),1)"
                        >
                          <el-button slot="reference" icon="el-icon-delete" size="mini" type="danger">
                            {{ $t('general.Delete') }}
                          </el-button>
                        </el-popconfirm>
                      </template>
                    </el-table-column>
                    <template slot="empty">
                      <el-empty>
                        <template slot="description">
                          <p>{{ $t('general.NoData') }}</p>
                          <el-button round size="small" icon="el-icon-plus" type="primary"
                                     @click="addEnvironment"
                          >
                            {{ $t('Deploy.AddVariable') }}
                          </el-button>
                        </template>
                      </el-empty>
                    </template>
                    <div v-if="deployForm.environments.length>0" slot="append">
                      <p>
                        <el-button round size="small" icon="el-icon-plus" type="primary"
                                   @click="addEnvironment"
                        >
                          {{ $t('Deploy.AddVariable') }}
                        </el-button>
                      </p>
                    </div>
                  </el-table>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          <el-empty v-else>
            <template slot="description">
              <span class="text-danger">
                {{ $t('Deploy.NoSetting') }}
              </span>
            </template>
          </el-empty>
        </el-row>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { getDeployedHostsLists, getRegistryHostsLists, getReleaseEnvironments, getService } from '@/api/deploy'
import { getReleaseVersion } from '@/api/release'
import { mapGetters } from 'vuex'

const protocol = ['TCP', 'UDP']
const policy = ['Always', 'Never', 'IfNotPresent']
const network_type = ['ClusterIP', 'NodePort', 'LoadBalancer'] // 'ExternalName',
const environments_type = ['configmap', 'secret']

export default {
  name: 'ApplicationSetting',
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    const _this = this
    const keyValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const keyCheck = []
        value.forEach((item, idx) => {
          const findKeyCheck = keyCheck.find(key => key.name === item.key)
          if (!findKeyCheck) {
            keyCheck.push({ name: item.key, index: [idx + 1] })
          } else {
            findKeyCheck.index.push(idx + 1)
          }
          if (!item.key || item.key.length <= 0) return reject(this.$t('Deploy.AllNull', [this.$tc('Deploy.Key', 2)]))
          if (!item.type || item.type.length <= 0) return reject(this.$t('Deploy.AllNull', [this.$tc('Deploy.Type', 2)]))
        })
        const checkDuplicate = keyCheck.filter(key => key.index.length > 1)
        if (checkDuplicate.length > 0) return reject(this.$t('Deploy.KeyConflicts', [checkDuplicate.map(key => this.$t('Deploy.KeyPair', [key.name, key.index.join(', ')])).join(', ')]))
        return resolve()
      })
    }
    const domainValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        if (
          (_this.deployForm.network.path && (_this.deployForm.network.path !== '' || _this.deployForm.network.path.length > 0)) &&
          (!value || value === '' || value.length <= 0)
        ) {
          return reject(this.$t('Deploy.PairCondition', [this.$t('Deploy.Domain'), [this.$t('Deploy.Domain'), this.$t('Deploy.Path')].join(', ')]))
        }
        return resolve()
      })
    }
    const pathValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        if (
          (_this.deployForm.network.domain && (_this.deployForm.network.domain !== '' || _this.deployForm.network.domain.length > 0)) &&
          (!value || value === '' || value.length <= 0)
        ) {
          return reject(this.$t('Deploy.PairCondition', [this.$t('Deploy.Path'), [this.$t('Deploy.Domain'), this.$t('Deploy.Path')].join(', ')]))
        }
        return resolve()
      })
    }
    const numberValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const valueInt = parseInt(value)
        if (value && (isNaN(valueInt) && value !== '' && value !== null) || valueInt <= 0) {
          return reject(this.$t(`Validation.Input`, [this.$t('Validation.Number')]))
        }
        return resolve()
      })
    }
    return {
      cluster: [],
      registry: [],
      protocol: protocol,
      policy: policy,
      network_type: network_type,
      environments_type: environments_type,
      release: [],
      deployForm: {
        name: '',
        cluster_id: '',
        registry_id: '',
        namespace: '',
        image: { policy: '' },
        release_id: '',
        resources: {
          cpu: '',
          memory: '',
          replicas: ''
        },
        network: { type: '', protocol: '', port: '', domain: '', path: '', expose_port: '' },
        environments: []
      },
      edit: {},
      deployFormRules: {
        name: [{ required: true, message: this.$t(`Validation.Input`, [this.$t('Deploy.Name')]), trigger: 'blur' }],
        cluster_id: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Cluster')]),
          trigger: 'blur'
        }],
        registry_id: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Registry')]),
          trigger: 'blur'
        }],
        namespace: [
          { required: true, message: this.$t(`Validation.Input`, [this.$t('Deploy.Namespace')]), trigger: 'blur' },
          {
            required: true,
            pattern: /^[a-z][a-z0-9-]{0,28}[a-z0-9]$/,
            message: this.$t(`Validation.Invalid`, [this.$t('Deploy.Namespace')]),
            trigger: 'blur'
          }
        ],
        release_id: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Release')]),
          trigger: 'blur'
        }],
        resources: {
          cpu: [{ validator: numberValidator, trigger: 'change' }],
          memory: [{ validator: numberValidator, trigger: 'change' }],
          replicas: [{ validator: numberValidator, trigger: 'change' }]
        },
        network: {
          type: [{ required: true, message: this.$t(`Validation.Select`, [this.$tc('Deploy.Type')]), trigger: 'blur' }],
          protocol: [{
            required: true,
            message: this.$t(`Validation.Select`, [this.$t('Deploy.Protocol')]),
            trigger: 'blur'
          }],
          port: [
            { required: true, message: this.$t(`Validation.Input`, [this.$t('Deploy.Port')]), trigger: 'blur' },
            { type: 'number', message: this.$t(`Validation.Input`, [this.$t('Validation.Number')]), trigger: 'blur' }
          ],
          domain: [{ validator: domainValidator, trigger: 'blur' }],
          path: [{ validator: pathValidator, trigger: 'blur' }]
        },
        environments: [
          { type: 'array', validator: keyValidator, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    checkAvailable() {
      return this.cluster.length > 0 && this.registry.length > 0
    }
  },
  watch: {
    id(value) {
      if (value) {
        this.getServiceDetail(this.id)
      } else {
        this.$refs['deployForm'].resetFields()
      }
    },
    edit: {
      deep: true,
      handler(value) {
        Object.keys(this.deployForm).forEach(item => {
          if (value[item]) {
            this.deployForm[item] = value[item]
          }
        })
      }
    },
    'deployForm.release_id': {
      immediate: false,
      handler(value) {
        if (value) {
          this.getEnvironmentFromRelease(value)
        }
      }
    }
  },
  mounted() {
    this.getSelectionList()
    if (this.id) {
      this.getServiceDetail(this.id)
    } else {
      this.$refs['deployForm'].resetFields()
    }
  },
  methods: {
    async getSelectionList() {
      const res = (await Promise.all([getDeployedHostsLists(), getRegistryHostsLists(), getReleaseVersion(this.selectedProjectId, { image: true })])).map(item => item.data)
      this.cluster = res[0].cluster
      this.registry = res[1].registries
      this.release = res[2].releases
    },
    async getEnvironmentFromRelease(value) {
      const getEnvironment = await getReleaseEnvironments(value)
      if (getEnvironment.data.env.length > 0) {
        this.deployForm.environments.push([...getEnvironment.data.env])
      }
    },
    async getServiceDetail(value) {
      const res = await getService(value)
      this.edit = res.data.application
    },
    addEnvironment() {
      this.deployForm.environments.push({ key: '', value: '', type: '' })
    }
  }
}
</script>

<style scoped>
.form-container {
  height: 50vh;
  padding: 0 20px;
  overflow-y: auto;
}

.helper {
  line-height: initial;
}
</style>
