import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/themes/base/base.css'

export class drivingView extends baseView {
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
  }

  initialize(){

    this.content.find('.wdgtz_options .wdgtz_params input.wdgtz_datepicker').datepicker({
      dateFormat: 'dMy',
      minDate: 0,
      maxDate: null,
      dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
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
}