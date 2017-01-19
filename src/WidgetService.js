import * as axios from 'axios'
import { Promise } from 'es6-promise'

export default class WidgetService {
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
    return axios.get(`${this.endpointUrl}/Car/get`)
  }

  getCountries(){
    return axios.get(`${this.endpointUrl}/Countryes/get`)
  }

  getCarPickup(query){
    return axios.get(`${this.endpointUrl}/car/pickup?query=${query}`)
  }

  getCarDropoff(query){
    return axios.get(`${this.endpointUrl}/car/dropoff?query=${query}`)
  }

  getAirOriginDestination(query){
    return axios.get(`${this.endpointUrl}/Airport/OriginDestination?query=${query}`)
  }

  getAirVendor(query){
    return axios.get(`${this.endpointUrl}/airvendor/search?query=${query}`)
  }
}
