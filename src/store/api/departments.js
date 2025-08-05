import client from '@/store/api/client'

export default {
  getDepartments() {
    return client.pget('/api/data/departments')
  },

  getDepartment(departmentId) {
    return client.pget(`/api/data/departments/${departmentId}`)
  },

  newDepartment(department) {
    const data = {
      name: department.name,
      color: department.color,
      archived: department.archived === 'true'
    }
    return client.ppost('/api/data/departments', data)
  },

  editDepartment(department) {
    const data = {
      name: department.name,
      color: department.color,
      archived: department.archived === 'true'
    }
    return client.pput(`/api/data/departments/${department.id}`, data)
  },

  deleteDepartment(department) {
    return client.pdel(`/api/data/departments/${department.id}`)
  },

  loadLinkedHardwareItems() {
    return client.pget(`/api/data/departments/hardware-items`)
  },

  loadLinkedSoftwareLicenses() {
    return client.pget(`/api/data/departments/software-licenses`)
  },

  linkHardwareItem(data) {
    const { departmentId, hardwareItemId } = data
    return client.ppost(
      `/api/data/departments/${departmentId}/hardware-items`,
      {
        hardware_item_id: hardwareItemId
      }
    )
  },

  linkSoftwareLicense(data) {
    const { departmentId, softwareLicenseId } = data
    return client.ppost(
      `/api/data/departments/${departmentId}/software-licenses`,
      {
        software_id: softwareLicenseId
      }
    )
  },

  unlinkHardwareItem(data) {
    const { departmentId, hardwareItemId } = data
    return client.pdel(
      `/api/data/departments/${departmentId}/hardware-items/${hardwareItemId}`
    )
  },

  unlinkSoftwareLicense(data) {
    const { departmentId, softwareLicenseId } = data
    return client.pdel(
      `/api/data/departments/${departmentId}/software-licenses/${softwareLicenseId}`
    )
  }
}
