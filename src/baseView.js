
const activeCss = 'wdgtz_active'

export class baseView {
  constructor(widget, selector, content){
    this.widget = widget
    this.selector = selector
    this.content = content

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