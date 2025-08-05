import client from '@/store/api/client'

export default {
  getSoftwareLicenses() {
    return client.pget('/api/data/softwares')
  },

  getSoftwareLicense(softwareLicenseId) {
    return client.pget(`/api/data/softwares/${softwareLicenseId}`)
  },

  newSoftwareLicense(softwareLicense) {
    const data = {
      name: softwareLicense.name,
      short_name: softwareLicense.short_name,
      version: softwareLicense.version,
      file_extension: softwareLicense.file_extension,
      monthly_cost: softwareLicense.monthly_cost,
      inventory_amount: softwareLicense.inventory_amount
    }
    return client.ppost('/api/data/softwares', data)
  },

  updateSoftwareLicense(softwareLicense) {
    const data = {
      name: softwareLicense.name,
      short_name: softwareLicense.short_name,
      version: softwareLicense.version,
      file_extension: softwareLicense.file_extension,
      monthly_cost: softwareLicense.monthly_cost,
      inventory_amount: softwareLicense.inventory_amount,
      archived: softwareLicense.archived === 'true'
    }
    return client.pput(`/api/data/softwares/${softwareLicense.id}`, data)
  },

  deleteSoftwareLicense(softwareLicense) {
    return client.pdel(`/api/data/softwares/${softwareLicense.id}`)
  }
}
