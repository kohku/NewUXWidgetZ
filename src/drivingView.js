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
    // More/fewer options listeners
    this.content.find('.wdgtz_options > label').on('click', event => this.toggleRentalCarOptions(event))
    this.content.find('.wdgtz_options .wdgtz_params input[type="radio"]').on('change', event => this.toggleTripRule(event))
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