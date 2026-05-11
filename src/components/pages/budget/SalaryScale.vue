<template>
  <page-layout>
    <template #main>
      <div class="flexcolumn page">
        <page-title class="mt1" :text="$t('budget.salary_scale_title')" />
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
                  <template
                    :key="position"
                    v-for="(position, pIdx) in positions"
                  >
                    <tr
                      class="datatable-row"
                      :key="seniority"
                      v-for="(seniority, sIdx) in seniorities"
                    >
                      <td v-if="pIdx === 0 && sIdx === 0" rowspan="9">
                        <department-name :department="department" />
                      </td>
                      <td v-if="sIdx === 0" rowspan="3">
                        {{ $t(`budget.positions.${position}`) }}
                      </td>
                      <td>{{ $t(`budget.seniorities.${seniority}`) }}</td>
                      <td>
                        <input
                          type="number"
                          class="input-editor"
                          @input="
                            event =>
                              modifySalaryScale(
                                department.id,
                                position,
                                seniority,
                                event
                              )
                          "
                          :value="
                            salaryScale[department.id]?.[position]?.[seniority]
                              ?.salary || 0
                          "
                        />
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </page-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import PageLayout from '@/components/layouts/PageLayout.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const store = useStore()

const positions = ['supervisor', 'lead', 'artist']
const seniorities = ['senior', 'mid', 'junior']

// State

const isLoading = ref(false)
const salaryScale = ref({})

// Computed

const departments = computed(() => store.getters.departments)

// Functions

const setSalaryScale = async () => {
  isLoading.value = true
  salaryScale.value = await store.dispatch('loadSalaryScale')
  isLoading.value = false
}

const modifySalaryScale = (departmentId, position, seniority, event) => {
  const salary = Math.trunc(event.target.valueAsNumber || 0)
  const scaleEntry = salaryScale.value[departmentId][position][seniority]
  scaleEntry.salary = salary
  store.dispatch('updateSalaryScale', scaleEntry)
}

// Lifecycle

onMounted(setSalaryScale)
</script>

<style lang="scss" scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
