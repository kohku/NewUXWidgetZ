import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/autocomplete'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/themes/base/base.css'
import { WidgetService } from './widgetService'

export class drivingView extends baseView {
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
  }


  /*
  TODO LIST

  Search
  Edit location address

  Get directions
  View driving time

  Autocomplete if exact match then select automatically

  DONE

  pick-up and drop-off dates
  time default to noon
  Starting location autocomplete (airport or place)
  Pick up autocomplete (airport or place)
  Drop off autocomplete (airport or place)
  autocomplete style
  Car company (web service)

  */

  initialize(){
    const service = new WidgetService()

    $('.wdgtz__pick-up__location').autocomplete({
      source: (request, response) => {
        service.getCarPickup(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)

          if (matchByKey){
            response([matchByKey])
          } else {
            response(suggestions)
          }
        }).catch(error => {
          response(error.status || error.message)
        })
      },
      minLength: 2,
    })

    $('.wdgtz__drop-off__location').autocomplete({
      source: (request, response) => {
        service.getCarDropoff(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)

          if (matchByKey){
            response([matchByKey])
          } else {
            response(suggestions)
          }
        }).catch(error => {
          response(error.status || error.message)
        })
      },
      minLength: 2,
    })

    this.content.find('.wdgtz_options .wdgtz_params input.wdgtz_datepicker').datepicker({
      dateFormat: 'dMy',
      minDate: 0,
      maxDate: null,
      dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    })

    $.each(this.content.find('.wdgtz_pick-up .wdgtz_datepicker'), (index, datepicker) => {
      $(datepicker).datepicker("setDate", this.state.pickUp.toDate())
    })

    $.each(this.content.find('.wdgtz_drop-off .wdgtz_datepicker'), (index, datepicker) => {
      $(datepicker).datepicker("setDate", this.state.dropOff.toDate())
    })

    const defaultTime = '12:00'
    $.each(this.content.find('.wdgtz_time-select'), (index, time) => {
      $(time).val(defaultTime)
    })

    $.each($('.wdgtz_car-company'), (index, element) => {
      service.getCarCompanies().then(all => {
        all.forEach(company => {
          $(element).append(`<option value="${company.Code}">${company.Name}</option>`)
        })
      })
    })
  }

  setListeners(){
    // Setup listeners for edit
    this.content.find('.wdgtz_destination').on('click', event => this.toggleEditAddress())
    // More/fewer options listeners
    this.content.find('.wdgtz_options > label').on('click', event => this.toggleRentalCarOptions(event))
    this.content.find('.wdgtz_options .wdgtz_params input[type="radio"]').on('change', event => this.toggleTripRule(event))
    this.content.find('.wdgtz_full-address').on('blur keyup', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur'){
        // removing the editable class on enter triggers a blur event
        if ($('.wdgtz_header').hasClass('editable')){
          this.toggleEditAddress()
        }
        if (this.state.fullAddress !== event.currentTarget.value){
          // this.setFullAddress()
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.updateMapAddress(response)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_header').addClass('edited')
            }
          })
        }
      } 

      if (event.keyCode == 13) {
        // removing the editable class on enter triggers a blur event
        this.toggleEditAddress()
        if (this.state.fullAddress !== event.currentTarget.value){
          // this.setFullAddress(event.currentTarget.value)
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.updateMapAddress(response)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_header').addClass('edited')
            }
          })
        }
      }
    })
    // Search
    this.content.find('.wdgtz_action').on('click', event => this.doSearch(event))
  }

  toggleEditAddress(){
    this.content.find('.wdgtz_destination').toggleClass('editable')
  }

  toggleTripRule(event){
    if (event.currentTarget.value === 'oneway'){
      this.content.find('.wdgtz_options .wdgtz_params').addClass('wdgtz_trip-rule-oneway')
    } else {
      this.content.find('.wdgtz_options .wdgtz_params').removeClass('wdgtz_trip-rule-oneway')
    }
  }

  toggleRentalCarOptions(event){
    event.preventDefault()
    $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
  }

  doSearch(event){
    event.preventDefault()
    event.stopPropagation()

    let rooms = this.state.defaultRooms
    let guests = this.state.defaultGuests
    let checkIn = this.state.checkIn.format('MM/DD/YYYY')
    let checkOut = this.state.checkOut.format('MM/DD/YYYY')
    let hotelChain = this.state.hotelChain || ''
    let hotelRating = this.state.hotelRating || ''
    let latitude = this.state.latitude
    let longitude = this.state.longitude
    let currency = this.state.currency
    let poiName = encodeURIComponent(this.state.poiName) //encodeURIComponent
    let refClickId = this.state.refClickId ? encodeURIComponent(this.state.refClickId) : '' // encodeURIComponent
    let refId = this.state.refId
    let refClickId2 = this.state.refClickId2 ? encodeURIComponent(this.state.refClickId2) : ''
    let fullAddress = encodeURIComponent(this.state.fullAddress)

    let searchUrl = `${this.state.cname}/hotels/results/?rooms=${rooms}&guests=${guests}` +
      `&check_in=${checkIn}&check_out=${checkOut}&chain_id=${hotelChain}&star_rating=${hotelRating}` +
      `&latitude=${latitude}&longitude=${longitude}&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

    if (rooms === 5){
      searchUrl = `https://tripplanz.groupize.com/search?` + 
      `search%5Bcheck_in%5D=${this.state.checkIn.format('YYYY-MM-DD')}&` +
      `search%5Bcheck_out%5D=${this.state.checkOut.format('YYYY-MM-DD')}&` + 
      `search%5Bentry_point%5D=umbrella&` +
      `search%5Bevent_duration%5D=${this.state.checkOut.diff(this.state.checkIn, 'days')}&` +
      `search%5Bfunction_date%5D=&search%5Blocation%5D=${fullAddress}&` +
      `search%5Bmaximum_adults_per_room%5D=2&search%5Bmeeting_space%5D=false&` +
      `search%5Bnumber_of_attendees%5D=&search%5Bpeople%5D=${guests}&` + 
      `search%5Brooms%5D=5&search%5Bsleeping_rooms%5D=true`
    } 
    
     window.open(searchUrl, "_blank")
  }
}