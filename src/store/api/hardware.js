import client from '@/store/api/client'

export default {
  getHardwareItems() {
    return client.pget('/api/data/hardware-items')
  },

  getHardwareItem(hardwareItemId) {
    return client.pget(`/api/data/hardware-items/${hardwareItemId}`)
  },

  newHardwareItem(hardwareItem) {
    const data = {
      name: hardwareItem.name,
      short_name: hardwareItem.short_name,
      monthly_cost: hardwareItem.monthly_cost,
      inventory_amount: hardwareItem.inventory_amount
    }
    return client.ppost('/api/data/hardware-items', data)
  },

  updateHardwareItem(hardwareItem) {
    const data = {
      name: hardwareItem.name,
      short_name: hardwareItem.short_name,
      monthly_cost: hardwareItem.monthly_cost,
      inventory_amount: hardwareItem.inventory_amount,
      archived: hardwareItem.archived === 'true'
    }
    return client.pput(`/api/data/hardware-items/${hardwareItem.id}`, data)
  },

  deleteHardwareItem(hardwareItem) {
    return client.pdel(`/api/data/hardware-items/${hardwareItem.id}`)
  }
}
