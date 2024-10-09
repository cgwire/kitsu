<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <div class="flexrow">
          <combobox
            class="flexrow-item"
            :label="$t('doodle.company')"
            :options="companyOptions"
            @input="onChangeCompany(companyOptions)"
            v-model="companyString"
          />

          <div class="flexrow-item selector" v-if="showAllUser()">
            <label class="label">
              {{ $t('main.person') }}
            </label>
            <people-field
              class="person-field"
              big
              :people="personList"
              @input="onChangePerson"
              v-model="person"
            />
          </div>

          <combobox
            class="flexrow-item"
            :label="$t('timesheets.year')"
            :options="yearOptions"
            @input="onChangeYear(yearOptions)"
            v-model="yearString"
          />

          <combobox
            class="flexrow-item"
            :label="$t('timesheets.month')"
            :options="monthOptions"
            @input="onChangeMonth(monthOptions)"
            v-model="monthString"
          />

          <combobox
            class="flexrow-item"
            :label="$t('doodle.day')"
            :options="dayOptions"
            @input="onChangeDay(dayOptions)"
            v-model="dayString"
            v-if="isActiveTab('duty')"
          />

          <span class="filler"></span>

          <div class="flexrow-item selector">
            <label class="label">
              {{ $t('doodle.action') }}
            </label>
            <button-simple
              class="flexrow-item"
              icon="export"
              :text="$t('doodle.export')"
              :title="$t('main.csv.export_file')"
              @click="exportButtonClick"
              v-if="isActiveTab('workSheet')"
            >
              {{ $t('doodle.export') }}
            </button-simple>

            <button
              class="button"
              :text="$t('doodle.get_time')"
              @click="getTimeClick"
              v-if="isActiveTab('workSheet')"
            >
              {{ $t('doodle.get_time') }}
            </button>

            <button
              v-if="isActiveTab('duty')"
              class="button"
              :text="$t('doodle.get_duty')"
              @click="getDutyClick"
            >
              {{ $t('doodle.get_duty') }}
            </button>

            <button
              v-if="isActiveTab('workSheet')"
              class="button"
              :text="$t('doodle.add_task')"
              @click="onNewClicked"
            >
              {{ $t('doodle.add_task') }}
            </button>
          </div>
        </div>

        <route-section-tabs
          class="section-tabs"
          :activeTab="currentSection"
          :route="$route"
          :tabs="workTabs"
        />

        <work-sheet-list
          ref="todo-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="notPendingTasks"
          :yearString="yearString"
          :monthString="monthString"
          :userId="getUserId"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          @set-sort-task="setSortTask"
          @remove-sort-task="removeSortTask"
          v-if="isActiveTab('workSheet')"
        />

        <div v-if="isActiveTab('duty')">&nbsp;</div>
        <work-duty-list
          ref="work-list"
          class="work-list"
          :tasks="notPendingDutys"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :done="true"
          v-if="isActiveTab('duty')"
        />
      </div>
    </div>
    <div class="column side-column">
      <div class="department-import flexcolumn mt2">
        <combobox-department
          class="flexrow-item export-btn"
          :label="$t('doodle.filter-person')"
          :department-list="departments"
          :with-empty-choice="false"
          v-model="selectedDepartment"
        />
        <p class="label mt2">
          {{ $t('doodle.batch-export-list') }}
        </p>
        <button-simple
          class="flexrow-item mt05 export-btn"
          :text="$t('doodle.batch-export')"
          @click="batchExport"
        />
      </div>
      <div class="export-list">
        <div
          :key="`unlisted-person-${person.id}`"
          class="flexrow person-to-add mb05"
          @click="selectPerson(person)"
          v-for="person in filterPersonList"
        >
          <input
            type="checkbox"
            class="mr1"
            :checked="person.checked ? person.checked : false"
            @input="event => onCheckChanged(person, event)"
          />
          <people-avatar
            class="flexrow-item"
            :font-size="14"
            :key="person.id"
            :person="person"
            :size="30"
            :with-link="false"
          />
          <people-name
            class="flexrow-item"
            :style="{
              color: person.name_color ? person.name_color : '#4a4a4a'
            }"
            :person="person"
            :with-link="false"
          />
        </div>
      </div>
    </div>
    <add-task-sheet-modal
      :active="modals.edit"
      ref="add-task-sheet-modal"
      :text="$t('doodle.add_task')"
      :title="$t('doodle.add_task')"
      @cancel="modals.edit = false"
      @add-sort-task="addSortTask"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import csv from '@/lib/csv'
import { range } from '@/lib/time'
import { formatFullDate } from '@/lib/time'

import AddTaskSheetModal from '@/components/modals/AddTaskSheetModal.vue'

import Combobox from '@/components/widgets/Combobox.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import WorkSheetList from '@/components/lists/WorkSheetList.vue'
import WorkDutyList from '@/components/lists/WorkDutyList.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment'

export default {
  name: 'work-sheet',

  components: {
    Combobox,
    RouteSectionTabs,
    WorkSheetList,
    WorkDutyList,
    AddTaskSheetModal,
    PeopleAvatar,
    PeopleField,
    PeopleName,
    ButtonSimple,
    ComboboxDepartment
  },

  data() {
    return {
      currentSection: 'workSheet',
      daysOff: [],
      dayOffError: false,
      productionId: undefined,
      selectedDate: moment().format('YYYY-MM-DD'),
      companyString: null,
      yearString: `${moment().year()}`,
      monthString: `${moment().month() + 1}`,
      dayString: `${moment().date()}`,
      modals: {
        del: false,
        edit: false
      },
      person: null,
      tasks: [],
      personTasks: [],
      sortedTasks: [],
      companyOptionList: [],
      dutys: [],
      selectPersons: [],
      selectedDepartment: null,
      filterPersonList: []
    }
  },

  async mounted() {
    this.updateActiveTab()
    //--------------------
    const action = 'getCompanyList'
    const l_params = {}
    this.$store
      .dispatch(action, l_params)
      .then(res => {
        console.log('getCompanyList Done')
        this.companyOptionList = res
      })
      .catch(err => {
        console.log('checkFileError')
        console.error(err)
        if (err.response) {
          alert(err.response.text)
        } else {
          alert(err.message)
        }
      })
    this.reload().then(res => {
      if (!this.showAllUser()) {
        this.onChangePerson(this.person)
      }
    })
    //--------------------
    this.filterPersonList = this.personList
  },

  afterDestroy() {},

  computed: {
    ...mapGetters([
      'displayedTodos',
      'doneSelectionGrid',
      'isTodosLoading',
      'isTodosLoadingError',
      'openProductions',
      'taskStatuses',
      'taskTypeMap',
      'timeSpentMap',
      'timeSpentTotal',
      'todoListScrollPosition',
      'todoSelectionGrid',
      'user',
      'productionMap',
      'personMap',
      'displayedPeople',
      'activePeopleWithoutBot',
      'activePeople',
      'departmentMap',
      'departments'
    ]),

    notPendingTasks() {
      return this.sortedTasks
    },

    notPendingDutys() {
      return this.dutys.filter(task => task != null)
    },

    getUserId() {
      return this.person ? this.person.id : null
    },

    workTabs() {
      return [
        {
          label: this.$t('doodle.task_sheet'),
          name: 'workSheet'
        },
        {
          label: this.$t('doodle.duty'),
          name: 'duty'
        }
      ].filter(Boolean)
    },

    todoList() {
      return this.$refs['todo-list']
    },

    haveDoneList() {
      return this.$refs['work-list']
    },

    companyOptions() {
      const list = []
      if (!this.companyString) list.push({ '': '' })
      this.companyOptionList.forEach(company => {
        const data = {
          label: company.name,
          value: company.id
        }
        list.push(data)
      })
      return list
    },

    yearOptions() {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear).map(year => ({
        label: year,
        value: `${year}`
      }))
    },

    monthOptions() {
      const currentYear = `${moment().year()}`
      const month = 1
      const currentMonth = moment().month() + 1
      let monthRange = range(month, 12)
      if (currentYear === this.yearString) {
        monthRange = range(month, currentMonth)
      }
      return monthRange.map(month => ({
        label: month,
        value: `${month}`
      }))
    },

    dayOptions() {
      const currentYear = `${moment().year()}`
      const currentMonth = moment().month() + 1
      let dayRange = range(1, 31)
      if (
        currentYear === this.yearString &&
        currentMonth === this.monthString
      ) {
        dayRange = range(1, moment().date())
      } else {
        const currentDate = moment(
          `${this.yearString}-${Number(this.monthString)}`,
          'YYYY-M',
          'en'
        )
        dayRange = range(1, currentDate.endOf('month').date())
      }
      return dayRange.map(day => ({
        label: day,
        value: `${day}`
      }))
    },

    personList() {
      const productionId = this.productionId
      const production = this.productionMap.get(productionId)
      if (production) {
        return sortPeople(
          production.team
            .map(personId => this.personMap.get(personId))
            .filter(person => !person.is_bot)
        )
      } else {
        return this.activePeopleWithoutBot
      }
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'loadAggregatedPersonDaysOff',
      'loadOpenProductions',
      'loadTodos',
      'setDayOff',
      'setTodoListScrollPosition',
      'loadOpenTasks',
      'loadTask'
    ]),

    isActiveTab(tab) {
      return this.currentSection === tab
    },

    updateActiveTab() {
      const availableSections = ['duty']
      const currentSection = this.$route.query.section
      this.currentSection = availableSections.includes(currentSection)
        ? currentSection
        : 'workSheet'
      this.clearSelectedTasks()
    },

    onNewClicked() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      this.modals.edit = true
      this.$refs['add-task-sheet-modal'].reload(this.person)
    },

    exportButtonClick() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      const nameData = [
        moment().utcOffset(8).format('HH-mm-ss'),
        this.person.name,
        this.yearString,
        this.monthString
      ]
      const name = stringHelpers.slugify(nameData.join('_'))
      const headers = this.exportHeader()
      const entries = [headers]
      this.sortedTasks.forEach(t => {
        const line = this.exportLine(this.person, t)
        entries.push(line)
      })
      csv.buildCsvFile(name, entries)
    },

    exportHeader() {
      return [
        '部门',
        '制作人',
        '项目',
        '集数',
        '开始时间',
        '结束时间',
        '持续时间/day',
        '时间备注',
        '名称',
        '等级'
      ]
    },

    exportLine(person, t) {
      const line = []
      const theTaskType = this.taskTypeMap.get(t.task_type_id)
      const department = this.departmentMap.get(theTaskType.department_id).name
      line.push(department)
      line.push(person.first_name)
      let episodes = ''
      if (theTaskType.for_entity.includes('Shot')) {
        episodes = t.sequence_name.replaceAll('EP', '') ?? ''
      } else {
        episodes = t.entity_data.ji_shu_lie
      }
      line.push(`《${t.project_name}》第${Math.ceil(Number(episodes) / 20)}季`)
      line.push(`EP${episodes}`)
      line.push(formatFullDate(t.start_time))
      line.push(formatFullDate(t.end_time))
      const duration = Number(
        t.duration / (1000 * 1000 * 60 * 60 * 24)
      ).toFixed(9)
      line.push(duration)
      line.push(t.time_remark)
      line.push(t.entity_name)
      const level = t.entity_data.deng_ji
      line.push(level)
      return line
    },

    async reload() {
      this.isLoading = true
      this.page = 1
      this.clearSelectedTasks()
      this.tasks = []
      try {
        const params = {
          project_id: this.productionId,
          person_id: this.person ? this.person.id : null
        }
        const taskInfos = await this.loadOpenTasks(params)
        this.tasks = taskInfos.data
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
      this.isLoading = false
    },

    async loadPersonTask(person_id) {
      this.isLoading = true
      this.personTasks = []
      try {
        const params = {
          project_id: this.productionId,
          person_id: person_id
        }
        const taskInfos = await this.loadOpenTasks(params)
        this.personTasks = taskInfos.data
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
      this.isLoading = false
    },

    getUserInfo(user_id) {
      const action = 'getUserInfo'
      const l_params = {
        user_id
      }
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('getUserInfo Done')
          if (res) {
            if (res.company) this.companyString = res.company
            this.getTaskTime(res.id)
            this.getDutyList(res.id)
          }
        })
        .catch(err => {
          console.log('getUserInfo Error')
          console.error(err)
          if (err.response) {
            if (err.response.statusCode == 404) {
              if (!this.companyString) {
                alert(this.$t('doodle.company_tip'))
                return
              }
              this.createUserInfo(user_id, this.companyString)
            }
          }
        })
    },

    createUserInfo(user_id, company) {
      const action = 'createUserInfo'
      const l_params = {
        user_id,
        company
      }
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('createUserInfo Done')
          if (res) {
            if (res.company) this.companyString = res.company
            this.getTaskTime(res.id)
            this.getDutyList(res.id)
          }
        })
        .catch(err => {
          console.log('createUserInfo Error')
          console.error(err)
          if (err.response) {
            if (err.response.statusCode == 500) {
              alert(this.$t('doodle.phone_tip'))
            }
          }
        })
    },

    getTaskTime(user_id) {
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month
      }
      const action = 'getTaskTime'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('getTaskTime Done')
          if (res.data) {
            this.setSortTask(res.data)
          }
        })
        .catch(err => {
          console.log('getTaskTime Error')
          console.error(err)
          if (err.response) {
            if (err.response.statusCode == 404) {
              this.countTaskTime(user_id)
            }
          } else {
            alert(err.message)
          }
        })
    },

    countTaskTime(user_id) {
      const data_list = []
      this.sortedTasks.forEach(task => {
        const data = {}
        data.start_date = task.start_date || task.created_at
        data.end_date = task.end_date || task.updated_at
        data.task_id = task.id
        data_list.push(data)
      })
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month,
        data_list
      }
      const action = 'countTaskTime'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('countTaskTime Done')
          if (res.data) {
            this.setSortTask(res.data)
          }
        })
        .catch(err => {
          console.log('countTaskTime Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getTimeClick() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      this.getUserInfo(this.person.id)
    },

    getDutyList(user_id) {
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month
      }
      const action = 'getDutyList'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('getDutyList Done')
          this.dutys = res
        })
        .catch(err => {
          console.log('getDutyList Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getDutyDingDing(user_id) {
      const year = this.yearString
      const month = this.monthString
      const day = this.dayString
      const l_params = {
        user_id,
        year,
        month,
        day
      }
      const action = 'getDutyDingDing'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('getDutyDingDing Done')
          res.forEach(n => {
            let contain = false
            for (const t of this.dutys) {
              if (t.id === n.id) {
                contain = true
              }
            }
            if (!contain) this.dutys.push(n)
          })
        })
        .catch(err => {
          console.log('getDutyDingDing Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getDutyClick() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      this.getDutyDingDing(this.person.id)
    },

    onChangePerson(item) {
      console.log('onChangePerson')
      this.person = item
      if (!this.showAllUser()) {
        this.person = this.user
      }
      if (this.person && this.person.id) {
        this.reload().then(res => {
          console.log(res)
          this.getUserInfo(this.person.id)
        })
      }
      if (!this.person) {
        this.sortedTasks = []
        this.dutys = []
      }
    },

    onChangeCompany(options) {
      console.log('onChangeCompany')
      if (this.companyString && this.person && this.person.id) {
        this.reload().then(res => {
          console.log(res)
          this.getUserInfo(this.person.id)
        })
      }
    },
    onChangeYear(options) {
      if (this.companyString && this.person && this.person.id) {
        this.reload().then(res => {
          console.log(res)
          this.getUserInfo(this.person.id)
        })
      }
    },
    onChangeMonth(options) {
      if (this.companyString && this.person && this.person.id) {
        this.reload().then(res => {
          console.log(res)
          this.getUserInfo(this.person.id)
        })
      }
    },
    onChangeDay(options) {
      if (this.companyString && this.person && this.person.id) {
        this.reload().then(res => {
          console.log(res)
          this.getUserInfo(this.person.id)
        })
      }
    },
    setSortTask(data) {
      this.sortedTasks = []
      data.forEach(item => {
        for (const t of this.tasks) {
          if (item.kitsu_task_ref_id === t.id) {
            const tt = t
            tt.duration = item.duration
            tt.doodle_task_id = item.id
            tt.time_remark = item.remark
            tt.start_time = item.start_time
            tt.end_time = item.end_time
            tt.user_remark = item.user_remark
            this.sortedTasks.push(tt)
          }
        }
      })
      this.person.tasks = this.sortedTasks
    },
    setPersonTask(data) {
      const l_tasks = []
      data.forEach(item => {
        for (const t of this.personTasks) {
          if (item.kitsu_task_ref_id === t.id) {
            const tt = t
            tt.duration = item.duration
            tt.doodle_task_id = item.id
            tt.time_remark = item.remark
            tt.start_time = item.start_time
            tt.end_time = item.end_time
            tt.user_remark = item.user_remark
            l_tasks.push(tt)
          }
        }
      })
      return l_tasks
    },
    addSortTask(data) {
      data.forEach(n => {
        let contain = false
        for (const t of this.sortedTasks) {
          if (t.id === n.id) {
            contain = true
          }
        }
        if (!contain) this.sortedTasks.push(n)
      })
      this.countTaskTime(this.person.id)
      this.modals.edit = false
    },
    removeSortTask(ent) {
      this.sortedTasks = this.sortedTasks.filter(task => task.id != ent.id)
      this.person.tasks = this.sortedTasks
    },
    showAllUser() {
      if (['admin', 'manager', 'supervisor'].includes(this.user.role)) {
        return true
      }
      return false
    },
    batchExport() {
      if (this.selectPersons.length <= 0) return
      const nameData = [
        moment().utcOffset(8).format('HH-mm-ss'),
        this.yearString,
        this.monthString
      ]
      const name = stringHelpers.slugify(nameData.join('_'))
      const headers = this.exportHeader()
      const sheets = []
      this.selectPersons.forEach(p => {
        const sheet = {}
        const entries = []
        if (p.tasks && p.tasks.length > 0) {
          for (const t of p.tasks) {
            const line = this.exportLine(p, t)
            entries.push(line)
          }
        }
        sheet.name = p.first_name
        sheet.entries = entries
        sheets.push(sheet)
      })
      csv.buildCsvFileAll(name, headers, sheets)
    },
    selectPerson(person) {},
    onCheckChanged(person, event) {
      person.checked = event.target.checked
      if (person.checked) {
        const year = this.yearString
        const month = this.monthString
        const user_id = person.id
        const l_params = {
          user_id,
          year,
          month
        }
        const action = 'getTaskTime'
        this.$store
          .dispatch(action, l_params)
          .then(res => {
            if (res.data) {
              this.loadPersonTask(person.id).then(e => {
                person.name_color = '#4a4a4a'
                person.tasks = this.setPersonTask(res.data)
                if (!this.selectPersons.includes(person))
                  this.selectPersons.push(person)
              })
            }
          })
          .catch(err => {
            console.log('getTaskTime Error')
            if (err.response) {
              if (err.response.statusCode == 404) {
                person.name_color = '#e74c3c'
                alert(this.$t('doodle.select-person-tip'))
              }
            } else {
              alert(err.message)
            }
            person.checked = false
            this.$forceUpdate()
          })
      } else {
        this.selectPersons = this.selectPersons.filter(p => p.id != person.id)
      }
      this.$forceUpdate()
    },
    updateDepartment() {
      const department = this.selectedDepartment
      this.filterPersonList = []
      this.personList.forEach(p => {
        if (p.departments.includes(department)) this.filterPersonList.push(p)
      })
      //this.$forceUpdate()
    }
  },

  socket: {
    events: {
      'task:update'(eventData) {
        const task = this.tasks.find(t => t.id === eventData.task_id)
        if (task) {
          this.loadTask({ taskId: task.id }).then(updatedTask => {
            Object.assign(task, updatedTask)
          })
        }
      }
    }
  },

  watch: {
    productionId() {
      this.$router.push({
        query: {
          productionId: this.productionId,
          section: this.currentSection
        }
      })
    },

    '$route.query.section'() {
      this.updateActiveTab()
    },

    $route() {
      this.currentSection = this.$route.query.section || 'workSheet'
    },

    selectedDepartment() {
      this.updateDepartment()
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('doodle.my_worksheet')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  padding: 0;
  overflow-y: auto;
}

.todos {
  display: flex;
  flex-direction: column;
}

.section-tabs {
  min-height: 18px;
}

.work-list {
  margin-top: 2em;
}

.field {
  margin-bottom: 0;
}

.person-label {
  margin-top: -23px;
}

.button {
  margin-left: 0.8em;
}

.side-column {
  border-left: 1px solid $light-grey;
}

.label {
  color: var(--text-alt);
  font-size: 0.8em;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0;
  margin-left: 10px;
}

.export-list {
  border: 1px solid var(--border);
  border-radius: 5px;
  margin-top: 0.5em;
  padding: 0.5em;
  flex: 1;
  overflow-y: auto;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.export-btn {
  margin: 0.5em;
}
</style>
