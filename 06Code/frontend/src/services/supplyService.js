import { crudApi } from '@/services/http.js'

export default {
  getAllSupplies() {
    return crudApi.get('/fabuladental/supplies')
  },
  
  createSupply(data) {
    return crudApi.post('/fabuladental/supply', data)
  },
  
  updateSupply(id, data) {
    return crudApi.put(`/fabuladental/supplies/${id}`, data)
  },
  
  deleteSupply(id) {
    return crudApi.delete(`/fabuladental/supplies/${id}`)
  }
}
