import $ from 'jquery'

const activeCss = 'wdgtz_active'

export class baseView {
  constructor(widget, state, selector, content){
    this.widget = widget
    this.selector = selector
    this.content = content
    this.state = state

    this._init()
  }

  _init(){
    this.initialize()
    this.setListeners()
    this.setActivator()
  }

  initialize(){
  }

  setActivator(){
    this.selector.on('click', () => {
      this.widget.setView(this)
    })
  }

  setListeners(){

  }

  toggleLoader(message){
    $('.wdgtz_loader').toggleClass('wdgtz_hide')
    if (message){
      $('.wdgtz_loader-text').text(message)
    }
  }

  clearAlert(){
    const _error = this.content.find('.wdgtz_error')
    _error.text('')
  }

  alert(notification){
    if (notification.message){
      const _error = this.content.find('.wdgtz_error')
      if (_error){
        if (_error.hasClass('wdgtz_hide')){
          _error.removeClass('wdgtz_hide')
        }
        _error.text(notification.message)
      }
    }
  }

  hide(){
    if (this.selector.hasClass(activeCss)){
      this.selector.removeClass(activeCss)
    }
    if (this.content.hasClass(activeCss)){
      this.content.removeClass(activeCss)
    }
  }

  show(){
    if (!this.selector.hasClass(activeCss)){
      this.selector.addClass(activeCss)
    }
    if (!this.content.hasClass(activeCss)){
      this.content.addClass(activeCss)
    }
  }
}