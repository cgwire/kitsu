import client from '@/store/api/client'
import { buildQueryString } from '@/lib/query'

export default {
  getOrganisations() {
    return client.pget('/api/data/organisations')
  },

  updateOrganisation(organisation) {
    const data = {
      name: organisation.name,
      hours_by_day: organisation.hours_by_day,
      timesheets_locked: organisation.timesheets_locked,
      use_original_file_name: organisation.use_original_file_name,
      hd_by_default: organisation.hd_by_default,
      chat_token_slack: organisation.chat_token_slack,
      chat_webhook_mattermost: organisation.chat_webhook_mattermost,
      chat_token_discord: organisation.chat_token_discord,
      has_avatar: organisation.has_avatar,
      format_duration_in_hours: organisation.format_duration_in_hours,
      dark_theme_by_default: organisation.dark_theme_by_default
    }
    return client.pput(`/api/data/organisations/${organisation.id}`, data)
  },

  postOrganisationLogo(organisationId, formData) {
    return client.ppost(
      `/api/pictures/thumbnails/organisations/${organisationId}`,
      formData
    )
  },

  deleteOrganisationLogo(organisationId) {
    return client.pput(`/api/data/organisations/${organisationId}`, {
      has_avatar: false
    })
  },

  getPeople() {
    return client.pget('/api/data/persons?relations=true')
  },

  getPerson(personId) {
    return client.pget(`/api/data/persons/${personId}`)
  },

  createPerson(person) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      role: person.role,
      contract_type: person.contract_type,
      active: person.active,
      position: person.position,
      seniority: person.seniority,
      daily_salary: person.daily_salary,
      departments: person.departments,
      studio_id: person.studio_id,
      is_bot: person.is_bot,
      expiration_date: person.expiration_date?.toJSON().slice(0, 10)
    }
    return client.ppost('/api/data/persons', data)
  },

  invitePerson(person) {
    return client.pget(`/api/actions/persons/${person.id}/invite`)
  },

  generateToken(person) {
    const data = {
      expiration_date: person.expiration_date?.toJSON().slice(0, 10) || null
    }
    return client.pput(`/api/data/persons/${person.id}`, data)
  },

  updatePerson(person) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      timezone: person.timezone,
      locale: person.locale,
      role: person.role,
      contract_type: person.contract_type,
      active: person.active,
      position: person.position,
      seniority: person.seniority,
      daily_salary: person.daily_salary,
      notifications_enabled: person.notifications_enabled === 'true',
      notifications_slack_enabled:
        person.notifications_slack_enabled === 'true',
      notifications_slack_userid: person.notifications_slack_userid,
      notifications_mattermost_enabled:
        person.notifications_mattermost_enabled === 'true',
      notifications_mattermost_userid: person.notifications_mattermost_userid,
      notifications_discord_enabled:
        person.notifications_discord_enabled === 'true',
      notifications_discord_userid: person.notifications_discord_userid,
      departments: person.departments,
      studio_id: person.studio_id
    }
    return client.pput(`/api/data/persons/${person.id}`, data)
  },

  deletePerson(person) {
    return client.pdel(`/api/data/persons/${person.id}?force=true`)
  },

  changePasswordPerson(person, form) {
    const data = {
      password: form.password,
      password_2: form.password2
    }
    return client.ppost(
      `/api/actions/persons/${person.id}/change-password`,
      data
    )
  },

  disableTwoFactorAuthenticationPerson(person) {
    return client.pdel(
      `/api/actions/persons/${person.id}/disable-two-factor-authentication`
    )
  },

  postCsv(formData, toUpdate) {
    let path = '/api/import/csv/persons'
    if (toUpdate) path += '?update=true'
    return client.ppost(path, formData)
  },

  postAvatar(userId, formData) {
    return client.ppost(`/api/pictures/thumbnails/persons/${userId}`, formData)
  },

  changePassword(form, callback) {
    const data = {
      old_password: form.oldPassword,
      password: form.password,
      password_2: form.password2
    }
    client.post('/api/auth/change-password', data, callback)
  },

  preEnableTOTP() {
    return client.pput('/api/auth/totp', {}).then(body => Promise.resolve(body))
  },

  enableTOTP(totp) {
    return client
      .ppost('/api/auth/totp', { totp: totp })
      .then(body => Promise.resolve(body.otp_recovery_codes))
  },

  disableTOTP(twoFactorPayload) {
    return client.pdel('/api/auth/totp', twoFactorPayload)
  },

  sendEmailOTP(email) {
    return client.pget(`/api/auth/email-otp?email=${email}`)
  },

  preEnableEmailOTP() {
    return client
      .pput('/api/auth/email-otp', {})
      .then(body => Promise.resolve(body))
  },

  enableEmailOTP(emailOTP) {
    return client
      .ppost('/api/auth/email-otp', { email_otp: emailOTP })
      .then(body => Promise.resolve(body.otp_recovery_codes))
  },

  disableEmailOTP(twoFactorPayload) {
    return client.pdel('/api/auth/email-otp', twoFactorPayload)
  },

  preRegisterFIDO() {
    return client.pput('/api/auth/fido', {}).then(body => Promise.resolve(body))
  },

  registerFIDO(registrationResponse, deviceName) {
    return client
      .ppost('/api/auth/fido', {
        registration_response: registrationResponse,
        device_name: deviceName
      })
      .then(body => Promise.resolve(body.otp_recovery_codes))
  },

  getFIDOChallenge(email) {
    return client.pget(`/api/auth/fido?email=${email}`)
  },

  unregisterFIDO(twoFactorPayload, deviceName) {
    const data = { ...twoFactorPayload, device_name: deviceName }
    return client.pdel('/api/auth/fido', data)
  },

  newRecoveryCodes(twoFactorPayload) {
    return client
      .pput('/api/auth/recovery-codes', twoFactorPayload)
      .then(body => Promise.resolve(body.otp_recovery_codes))
  },

  loadTodos() {
    return client.pget('/api/data/user/tasks')
  },

  loadDone() {
    return client.pget('/api/data/user/done-tasks')
  },

  loadTasksToCheck() {
    return client.pget('/api/data/user/tasks-to-check')
  },

  loadTimeSpents(date) {
    return client.pget(`/api/data/user/time-spents/${date}`)
  },

  getPersonTasks(personId) {
    return client.pget(`/api/data/persons/${personId}/tasks`)
  },

  getPersonDoneTasks(personId) {
    return client.pget(`/api/data/persons/${personId}/done-tasks`)
  },

  getUserSearchFilterGroups() {
    return client.pget('/api/data/user/filter-groups')
  },

  createFilterGroup(
    listType,
    name,
    color,
    productionId,
    isShared,
    departmentId
  ) {
    const data = {
      list_type: listType,
      name,
      color,
      is_shared: isShared,
      project_id: productionId,
      department_id: departmentId
    }
    return client.ppost('/api/data/user/filter-groups', data)
  },

  updateFilterGroup(filterGroup) {
    const data = {
      name: filterGroup.name,
      color: filterGroup.color,
      is_shared: filterGroup.is_shared,
      project_id: filterGroup.project_id,
      department_id: filterGroup.department_id
    }
    return client.pput(`/api/data/user/filter-groups/${filterGroup.id}`, data)
  },

  removeFilterGroup(filterGroup) {
    return client.pdel(`/api/data/user/filter-groups/${filterGroup.id}`)
  },

  getUserSearchFilters(callback) {
    client.get('/api/data/user/filters', callback)
  },

  updateFilter(searchFilter) {
    const data = {
      name: searchFilter.name,
      search_query: searchFilter.search_query,
      search_filter_group_id: searchFilter.search_filter_group_id,
      is_shared: searchFilter.is_shared,
      project_id: searchFilter.project_id,
      department_id: searchFilter.department_id
    }
    return client.pput(`/api/data/user/filters/${searchFilter.id}`, data)
  },

  createFilter(listType, name, query, productionId, entityType) {
    const data = {
      list_type: listType,
      name,
      query,
      entity_type: entityType,
      project_id: productionId
    }
    return client.ppost('/api/data/user/filters', data)
  },

  removeFilter(searchFilter) {
    return client.pdel(`/api/data/user/filters/${searchFilter.id}`)
  },

  getTimeSpents(personId, date) {
    // Date is a string with following format: YYYYY-MM-DD.
    return client.pget(`/api/data/persons/${personId}/time-spents/${date}`)
  },

  getTimeSpentsByPeriod(personId, startDate, endDate) {
    return client.pget(
      `/api/data/persons/${personId}/time-spents/?start_date=${startDate}&end_date=${endDate}`
    )
  },

  setTimeSpent(taskId, personId, date, hours) {
    // Date is a string with following format: YYYYY-MM-DD.
    const url = `/api/actions/tasks/${taskId}/time-spents/${date}/persons/${personId}`
    if (hours > 0) {
      return client.ppost(url, { duration: hours * 60 })
    } else {
      return client.pdel(url)
    }
  },

  getDaysOff(year, month) {
    let path = '/api/data/day-offs'
    if (year) {
      path = `/api/data/persons/day-offs/${year}`
      if (month) {
        path += `/${month}`
      }
    }
    return client.pget(path)
  },

  getDayOff(personId, date) {
    // Date is a string with following format: YYYYY-MM-DD.
    return client.pget(`/api/data/persons/${personId}/day-offs/${date}`)
  },

  createDayOff(personId, startDate, endDate, description) {
    // Date is a string with following format: YYYYY-MM-DD.
    const data = {
      person_id: personId,
      date: startDate,
      end_date: endDate || startDate,
      description
    }
    return client.ppost('/api/data/day-offs', data)
  },

  updateDayOff(id, personId, startDate, endDate, description) {
    // Date is a string with following format: YYYYY-MM-DD.
    const data = {
      person_id: personId,
      date: startDate,
      end_date: endDate || startDate,
      description
    }
    return client.pput(`/api/data/day-offs/${id}`, data)
  },

  deleteDayOff(dayOff) {
    return client.pdel(`/api/data/day-offs/${dayOff.id}`)
  },

  getAggregatedPersonDaysOff(personId, detailLevel, year, month, week) {
    let path = `/api/data/persons/${personId}/day-offs/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    }
    return client.pget(path)
  },

  getDayTable(year, month, productionId, studioId) {
    const path = `/api/data/persons/time-spents/day-table/${year}/${month}`
    const params = {
      project_id: productionId,
      studio_id: studioId
    }
    return client.pget(buildQueryString(path, params))
  },

  getWeekTable(year, month, productionId, studioId) {
    const path = `/api/data/persons/time-spents/week-table/${year}`
    const params = {
      project_id: productionId,
      studio_id: studioId
    }
    return client.pget(buildQueryString(path, params))
  },

  getMonthTable(year, month, productionId, studioId) {
    const path = `/api/data/persons/time-spents/month-table/${year}`
    const params = {
      project_id: productionId,
      studio_id: studioId
    }
    return client.pget(buildQueryString(path, params))
  },

  getYearTable(year, month, productionId, studioId) {
    const path = '/api/data/persons/time-spents/year-table'
    const params = {
      project_id: productionId,
      studio_id: studioId
    }
    return client.pget(buildQueryString(path, params))
  },

  getAggregatedPersonTimeSpents(
    personId,
    detailLevel,
    year,
    month,
    week,
    day,
    productionId,
    studioId
  ) {
    let path = `/api/data/persons/${personId}/time-spents/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    } else {
      path += `day/${year}/${month}/${day}`
    }

    const params = {
      project_id: productionId,
      studio_id: studioId
    }
    return client.pget(buildQueryString(path, params))
  },

  getPersonQuotaShots(
    productionId,
    taskTypeId,
    personId,
    detailLevel,
    year,
    month,
    week,
    day,
    computeMode
  ) {
    let path = `/api/data/persons/${personId}/quota-shots/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    } else {
      path += `day/${year}/${month}/${day}`
    }

    if (productionId) {
      path += `?project_id=${productionId}`
    }

    if (taskTypeId) {
      if (!productionId) path += '?'
      else path += '&'
      path += `&task_type_id=${taskTypeId}`
    }
    path += `&count_mode=${computeMode}`

    return client.pget(path)
  },

  getContext() {
    return client.pget('/api/data/user/context')
  },

  clearAvatar() {
    return client.pdel('/api/actions/user/clear-avatar')
  },

  clearPersonAvatar(person) {
    return client.pdel(`/api/actions/persons/${person.id}/clear-avatar`)
  },

  getSalaryScales() {
    return client.pget('/api/data/salary-scales')
  },

  updateSalaryScale(scale) {
    const data = {
      salary: scale.salary
    }
    return client.pput(`/api/data/salary-scales/${scale.id}`, data)
  }
}
