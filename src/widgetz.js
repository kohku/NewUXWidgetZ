import './widget.less'
import { Observable } from './observable'
import $ from 'jquery'
import Promise from 'es6-promise'
// import 'jquery-ui/ui/widget'
// import 'jquery-ui/ui/widgets/button'
// import 'jquery-ui/ui/widgets/datepicker'
// import 'jquery-ui/ui/widgets/menu'
// import 'jquery-ui/themes/base/base.css'
// import Moment from 'moment'
import Mustache from 'mustache'
// import 'imports-loader?jQuery=jquery,moment=moment,this=>window!./jquery.comiseo.daterangepicker.js'
// import 'style-loader?css-loader!./jquery.comiseo.daterangepicker.css'
import 'imports-loader?this=>window!./selector-queries.js'
import { stayingView } from './stayingView'
import { drivingView } from './drivingView'
import { flyingView } from './flyingView'

export class WidgetZ extends Observable {
  constructor(params) {
    super()
    this.views = []
    this.params = params
    this.state = this.initState(params)
    this.initWidget()
  }

  initState(params){
    let state = {}

    let headerParam = params.find(p => p.key === 'header_text')
    let appendPoiParam = params.find(p => p.key === 'append_poi')
    let poiNameParam = params.find(p => p.key === 'poi_name')
    let picUrlParam = params.find(p => p.key === 'wdgt_image_url')
    let widgetUrlParam = params.find(p => p.key === 'wdgt_link_url')

    let tabsParam = params.find(p => p.key === 'tabs')
    let latitudeParam = params.find(p => p.key === 'latitude')
    let longitudeParam = params.find(p => p.key === 'longitude')

    let refIdParam = params.find(p => p.key === 'refid')
    let refClickIdParam = params.find(p => p.key === 'refclickid')
    let refClickId2Param = params.find(p => p.key === 'refclickid2')
    let cnameParam = params.find(p => p.key === 'cname')

    let addressParam = params.find(p => p.key === 'address')
    let cityParam = params.find(p => p.key === 'city')
    let stateProvinceParam = params.find(p => p.key === 'stateprovince')
    let airportParam = params.find(p => p.key === 'airport')
    let postalCodeParam = params.find(p => p.key === 'postalcode')
    let countryParam = params.find(p => p.key === 'country')

    let currencyParam = params.find(p => p.key === 'currency')

    let checkInDateOrDays = params.find(p => p.key === 'check_in')
    let checkOutDateOrDays = params.find(p => p.key === 'check_out')
    let guestsParam = params.find(p => p.key === 'guests')
    let roomsParam = params.find(p => p.key === 'rooms')
    let hotelStarsParam = params.find(p => p.key === 'hotel_stars')

    // Set calendar range
    let checkIn = moment()
    // is a number, calculate from now
    if (Number.isInteger(checkInDateOrDays.value)){
      checkIn.add(parseInt(checkInDateOrDays.value), 'days')
    // is moment?
    } else if (checkInDateOrDays.value instanceof moment){
      checkIn = checkInDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      checkIn = moment(checkInDateOrDays.value)
    }

    // Set calendar range
    let checkOut = moment()
    // is a number, calculate from now
    if (Number.isInteger(checkOutDateOrDays.value)){
      checkOut.add(parseInt(checkOutDateOrDays.value), 'days')
    // is moment?
    } else if (checkOutDateOrDays.value instanceof moment){
      checkOut = checkOutDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      checkOut = moment(checkOutDateOrDays.value)
    }

    let pickUpDateOrDays = params.find(p => p.key === 'pick_up')
    let dropOffDateOrDays = params.find(p => p.key === 'drop_off')

    // Set calendar range
    let pickUp = moment()
    // is a number, calculate from now
    if (Number.isInteger(pickUpDateOrDays.value)){
      pickUp.add(parseInt(pickUpDateOrDays.value), 'days')
    // is moment?
    } else if (pickUpDateOrDays.value instanceof moment){
      pickUp = pickUpDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      pickUp = moment(pickUpDateOrDays.value)
    }
    // default to noon
    pickUp.set('hour', 12)
    pickUp.set('minute', 0)

    // Set calendar range
    let dropOff = moment()
    // is a number, calculate from now
    if (Number.isInteger(dropOffDateOrDays.value)){
      dropOff.add(parseInt(dropOffDateOrDays.value), 'days')
    // is moment?
    } else if (dropOffDateOrDays.value instanceof moment){
      dropOff = dropOffDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      dropOff = moment(dropOffDateOrDays.value)
    }
    dropOff.set('hour', 12)
    dropOff.set('minute', 0)

    let departureDateOrDays = params.find(p => p.key === 'departure')
    let returnDateOrDays = params.find(p => p.key === 'return')

    // Set calendar range
    let departure = moment()
    // is a number, calculate from now
    if (Number.isInteger(departureDateOrDays.value)){
      departure.add(parseInt(departureDateOrDays.value), 'days')
    // is moment?
    } else if (departureDateOrDays.value instanceof moment){
      departure = departureDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      departure = moment(departureDateOrDays.value)
    }

    // Set calendar range
    let returnDate = moment()
    // is a number, calculate from now
    if (Number.isInteger(returnDateOrDays.value)){
      returnDate.add(parseInt(returnDateOrDays.value), 'days')
    // is moment?
    } else if (returnDateOrDays.value instanceof moment){
      returnDate = returnDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      returnDate = moment(returnDateOrDays.value)
    }

    let socialParam = params.find(p => p.key === 'social')
    let stylesUrlParam = params.find(p => p.key === 'stylesUrl')

    state.headerText = headerParam ? headerParam.value : 'Tripplanz Widget'
    state.appendPoi = !!appendPoiParam && appendPoiParam.value === 'N'
    state.socialPictureUrl = picUrlParam ? picUrlParam.value : 'http://getmywidget.com/graphicalwidget/images/tripplanz_icon.png'
    state.pictureUrl = picUrlParam ? picUrlParam.value : null
    state.widgetUrl = widgetUrlParam ? widgetUrlParam.value : null
    state.poiName = poiNameParam ? poiNameParam.value : null

    state.tabs = {
      staying: tabsParam ? (tabsParam.value & 0x100) === 0x100 : false,
      driving: tabsParam ? (tabsParam.value & 0x010) === 0x010 : false,
      flying: tabsParam ? (tabsParam.value & 0x001) === 0x001 : false
    }
    state.latitude = latitudeParam ? latitudeParam.value : null
    state.longitude = longitudeParam ? longitudeParam.value : null

    state.refId = refIdParam ? refIdParam.value : null
    state.refClickId = refClickIdParam ? refClickIdParam.value : null
    state.refClickId2 = refClickId2Param ? refClickId2Param.value : null
    state.cname = cnameParam ? cnameParam.value : null

    state.address = addressParam ? addressParam.value : null
    state.city = cityParam ? cityParam.value : null
    state.stateProvince = stateProvinceParam ? stateProvinceParam.value : null 
    state.airport = airportParam ? airportParam.value : null
    state.flyingToType = 'AIR'
    state.flyingTo = state.airport
    state.postalCode = postalCodeParam ? postalCodeParam.value : null
    state.country = countryParam ? countryParam.value : null
    state.stayingDestination = `${state.address || ''} ${state.city || ''} ${state.stateProvince || ''} ${state.postalCode || ''} ${state.country || ''}`
    state.drivingDestination = state.stayingDestination
    state.flyingDestination = `${state.city || ''} ${state.stateProvince || ''} ${state.country || ''}`

    state.currency = currencyParam ? currencyParam.value : 'USD'
    state.checkIn = checkIn
    state.checkOut = checkOut
    state.defaultGuests = guestsParam ? guestsParam.value : 1
    state.defaultRooms = roomsParam ? roomsParam.value : 1
    state.hotelStars = typeof hotelStarsParam !== 'undefined' ? hotelStarsParam.value.split(',').map(key => parseInt(key)) : []

    state.pickUp = pickUp
    state.dropOff = dropOff

    state.departure = departure
    state.returnDate = returnDate

    state.social = socialParam ? socialParam.value === 'Y' : false
    state.stylesUrl = stylesUrlParam ? stylesUrlParam.value : '//getmywidget.com/NewUXTripPlanz/styles.css'

    return state
  }

  initWidget(){
    // CSS
    // I'm going to use a promise to get the css
    // That way due to browser cache it's gonna be available after I create the link to the file
    new Promise((resolve, reject) => {
      $.get(this.state.stylesUrl).done(()=>{
        var cssElement = $("<link>", { rel: "stylesheet", type: "text/css", href: this.state.stylesUrl })
        cssElement.appendTo('head')
        resolve()
      }).fail(() => {
        reject()
      })
    }).then(() => {
      if (window.squery){
        window.squery.run()
      }

      // loading widget
      $.get('widget.htm', template => {
        let rendered = Mustache.render(template, this.state)
        $('#graphical-wdgtz-container').html(rendered)

        if (window.squery){
            window.squery.refresh()
        }

        // loading tabs and setting up listeners
        $.each($('ul.wdgtz_tabs > li'), (index, li) => {
          let selector = $(li)
          let key = selector.data('key')
          let content = $(`.wdgtz_content > *[data-content=${selector.data('key')}]`)
          switch(key){
            case 'staying':
              this.views.push(new stayingView(this, this.state, selector, content))
              break
            case 'driving':
              this.views.push(new drivingView(this, this.state, selector, content))
              break
            case 'flying':
              this.views.push(new flyingView(this, this.state, selector, content))
              break
            default:
              throw error(`Undefined view ${key}`)
          }
        })

        // set initial view
        if (this.views.length > 0){
          this.setView(this.views[0])
        }

        // Footer
        // Social
        if (this.state.social){
          let script = document.createElement( 'script' );
          script.setAttribute( 'src', '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-57624fad76e92068' );
          $.each($('#graphical-wdgtz-container'), (index, element) => {
            element.appendChild(script)
          })

          window.setTimeout(() => {
            window.addthis_share = {
              title: `${this.state.headerText}${this.state.appendPoi ? this.state.poiName : ''}`,
              media: this.state.pictureUrl
            }
          }, 250)
        }
      })
    })
  }

  setView(view){
    this.views.filter(vw => {
      return vw !== view
    }).forEach(vw => {
      vw.hide()
    })

    view.show()
  }
}