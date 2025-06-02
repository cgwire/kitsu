<template>
  <page-layout>
    <template #main>
      <div class="flexcolumn page">
        <page-title class="mt1" text="Salary Scale" />
        <div class="has-text-centered" v-if="isLoading">
          <spinner />
        </div>
        <div class="data-list" v-else>
          <div class="datatable-wrapper">
            <table class="datatable">
              <thead class="datatable-head">
                <tr>
                  <th>{{ $t('budget.fields.department') }}</th>
                  <th>{{ $t('budget.fields.seniority') }}</th>
                  <th>{{ $t('budget.fields.position') }}</th>
                  <th>{{ $t('budget.fields.base_salary') }}</th>
                </tr>
              </thead>

              <tbody class="datatable-body">
                <template
                  :key="department.id"
                  v-for="department in departments"
                >
                  <tr class="datatable-row">
                    <td rowspan="9">
                      <department-name :department="department" />
                    </td>
                    <td rowspan="3">{{ $t('budget.positions.supervisor') }}</td>
                    <td>{{ $t('budget.seniorities.senior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'supervisor',
                              'senior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.supervisor.senior
                            .salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.mid') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'supervisor',
                              'mid',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.supervisor.mid.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.junior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'supervisor',
                              'junior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.supervisor.junior
                            .salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td rowspan="3">{{ $t('budget.positions.lead') }}</td>
                    <td>{{ $t('budget.seniorities.senior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'lead',
                              'senior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.lead.senior.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.mid') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'lead',
                              'mid',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.lead.mid.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.junior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'lead',
                              'junior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.lead.junior.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td rowspan="3">{{ $t('budget.positions.artist') }}</td>
                    <td>{{ $t('budget.seniorities.senior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'artist',
                              'senior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.artist.senior.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.mid') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'artist',
                              'mid',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.artist.mid.salary || 0
                        "
                      />
                    </td>
                  </tr>
                  <tr class="datatable-row">
                    <td>{{ $t('budget.seniorities.junior') }}</td>
                    <td>
                      <input
                        type="number"
                        class="input-editor"
                        @input="
                          value =>
                            modifySalaryScale(
                              department.id,
                              'artist',
                              'junior',
                              value
                            )
                        "
                        :value="
                          salaryScale[department.id]?.artist.junior.salary || 0
                        "
                      />
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </page-layout>
</template>

<script>
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'salary-scale',

  components: {
    DepartmentName,
    PageLayout,
    PageTitle,
    Spinner
  },

  data() {
    return {
      isLoading: false,
      salaryScale: {}
    }
  },

  computed: {
    ...mapGetters(['departments'])
  },

  mounted() {
    this.setSalaryScale()
  },

  methods: {
    ...mapActions(['loadSalaryScale', 'updateSalaryScale']),

    async setSalaryScale() {
      this.isLoading = true
      this.salaryScale = await this.loadSalaryScale()
      this.isLoading = false
    },

    modifySalaryScale(departmentId, position, seniority, event) {
      const value = event.target.value
      const scaleEntry = this.salaryScale[departmentId][position][seniority]
      scaleEntry.salary = parseInt(value)
      this.updateSalaryScale(scaleEntry)
    }
  }
}
</script>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
