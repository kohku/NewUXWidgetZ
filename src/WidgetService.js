import * as axios from 'axios'
import { Promise } from 'es6-promise'

export class WidgetService {
  constructor(endpointUrl){
    this.endpointUrl = endpointUrl || 'http://getmywidget.com/standalonewidget'
  }

  getHotelChains(){
    const hotelChains = [
      { key: 1100, value: 'All Best Western Hotel Brands' },
      { key: 1200, value: 'All Extended Stay Hotels' },
      { key: 1600, value: 'All Starwood Hotel Brands' },
      { key: 1700, value: 'All Wydnham Hotel Brands' },
      { key: 1400, value: 'All Hyatt Hotel Brands' },
      { key: 1300, value: 'All Hilton Hotel Brands' },
      { key: 1500, value: 'All Marriott Hotel Brands' },
      { key: 1000, value: 'All Accor Hotel Brands' }
    ]
    return new Promise((resolve, reject) => {
      try {
        resolve(hotelChains)
      }
      catch (error){
        reject(error)
      }
    })
    
  }

  getHotelRaiting(){
    const hotelRatings = [
      { key: 1, value: '1 Star' },
      { key: 2, value: '2 Stars' },
      { key: 3, value: '3 Stars' },
      { key: 4, value: '4 Stars' },
      { key: 5, value: '5 Stars' },
    ]
    return new Promise((resolve, reject) => {
      try {
        resolve(hotelRatings)
      }
      catch (error){
        reject(error)
      }
    })
  }

  getCarCompanies(){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/Car/get`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getCountries(){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/Countryes/get`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getCarPickup(query){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/car/pickup?query=${query}`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getCarDropoff(query){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/car/dropoff?query=${query}`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getAirOriginDestination(query){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/Airport/OriginDestination?query=${query}`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getAirVendor(query){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/airvendor/search?query=${query}`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  }

  getAirVendors(){
    return new Promise((resolve, reject) => {
      axios.get(`${this.endpointUrl}/airvendor/get`).then(response => {
        let sorted = response.data.sort((a, b) => a.Name.localeCompare(b.Name))
        resolve(sorted)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

