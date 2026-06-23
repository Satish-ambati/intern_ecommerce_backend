// api.js - Central place to store the backend URL
//
// Instead of writing "http://localhost:8080" in every file,
// we store it here once. If the URL ever changes, we only
// need to update it in this ONE file.
//
// HOW TO USE IN ANY PAGE:
//   import { API } from '../api.js'
//   await axios.get(`${API}/products/all`, ...)

export const API = "http://192.168.10.19:8080"
