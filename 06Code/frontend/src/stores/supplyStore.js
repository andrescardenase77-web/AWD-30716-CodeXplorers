import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import supplyService from '@/services/supplyService.js'

export const useSupplyStore = defineStore('supply', () => {
  const rawCache = JSON.parse(localStorage.getItem('supplies_cache')) || []
  const validCache = rawCache.filter(item => item && item.id && item.supplyName)
  const supplies = ref(validCache)
  const isLoaded = ref(supplies.value.length > 0)

  watch(supplies, (newVal) => {
    localStorage.setItem('supplies_cache', JSON.stringify(newVal))
  }, { deep: true })

  async function fetchSupplies() {
    if (isLoaded.value) return supplies.value
    const response = await supplyService.getAllSupplies()
    supplies.value = response.data
    isLoaded.value = true
    return supplies.value
  }

  async function addSupply(data) {
    const response = await supplyService.createSupply(data)
    // Invalidate cache and clear local array
    isLoaded.value = false
    supplies.value = []
    return response.data
  }

  async function updateSupply(id, data) {
    await supplyService.updateSupply(id, data)
    // Invalidate cache to fetch the freshly calculated status from the server
    isLoaded.value = false
    supplies.value = []
  }

  async function deleteSupply(id) {
    await supplyService.deleteSupply(id)
    if (isLoaded.value) {
      supplies.value = supplies.value.filter((s) => s.id !== id)
    }
  }

  return { supplies, isLoaded, fetchSupplies, addSupply, updateSupply, deleteSupply }
})
