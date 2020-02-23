var UiWidget = require('./ui-widget')

class UiSidePanel extends UiWidget {

    constructor(options) {

        super(options)

        this.resizeDirection = this.container.classList.contains('left') ? 1 : -1
        this.resizeHandle = DOM.get(this.container, '.resize-handle')[0]
        this.toggleButton = DOM.get(this.container, '.toggle-button')[0]
        this.content = DOM.get(this.container, 'osc-panel-inner')[0]

        this.minWidth = 250
        this.width = 250

        this.disabled = true
        this.minimized = false
        this.init = false

        this.on('drag', (event)=>{

            this.width += this.resizeDirection * event.movementX / PXSCALE
            this.container.style.width = this.width + 'rem'

        }, {element: this.resizeHandle})

        this.on('dragend', (event)=>{

            this.width = parseInt(this.container.offsetWidth) / PXSCALE
            DOM.dispatchEvent(window, 'resize')

        }, {element: this.resizeHandle})

        this.toggleButton.addEventListener('click', ()=>{

            if (this.disabled) return

            if (this.minimized) this.restore()
            else this.minimize()

        })

    }

    enable() {

        this.container.classList.remove('disabled')
        this.disabled = false

        if (!this.minimized) this.open()

    }

    disable() {

        this.container.classList.add('disabled')
        this.disabled = false

        this.close()

    }

    minimize() {

        if (this.minimized) return

        this.minimized = true
        this.close()


    }

    restore() {

        if (!this.minimized) return

        this.minimized = false
        this.open()


    }

    open() {

        this.container.style.width = this.width + 'rem'
        this.container.style.minWidth = this.minWidth + 'rem'
        this.container.classList.remove('minimized')

        DOM.dispatchEvent(window, 'resize')

    }

    close() {

        this.container.style.width = 0
        this.container.style.minWidth = 0
        this.container.classList.add('minimized')

        DOM.dispatchEvent(window, 'resize')

    }

}

var leftUiSidePanel = new UiSidePanel({selector: 'osc-panel-container.right'}),
    rightUiSidePanel = new UiSidePanel({selector: 'osc-panel-container.left'})

module.exports = {
    left: leftUiSidePanel,
    right: rightUiSidePanel
}