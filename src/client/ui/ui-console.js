var UiWidget = require('./ui-widget'),
    html = require('nanohtml'),
    raw = require('nanohtml/raw'),
    locales = require('../locales'),
    {icon} = require('./utils')

class UiConsole extends UiWidget {

    constructor(options) {

        super(options)

        this.header = DOM.get(this.container, 'osc-panel-header')[0]

        this.header.appendChild(html`<label>${locales('console_title')}</label>`)
        this.messages = this.container.appendChild(html`<osc-console></osc-console>`)
        // this.inputWrapper = this.container.appendChild(html`<osc-console-input></osc-console-inpu>`)
        // this.input = this.inputWrapper.appendChild(html`<textarea></textarea>`)

        this.actions = this.header.appendChild(html`<div class="actions"></div>`)
        this.clearBtn = this.actions.appendChild(html`<div class="clear" title="${locales('console_clear')}">${raw(icon('trash'))}</div>`)
        this.clearBtn.addEventListener('click', ()=>{
            this.clear()
        })

        this.length = 0
        this.maxLength = 200

        var _this = this,
            log = console.log,
            error = console.error,
            onerror = window.onerror

        console.log = function(message){
            _this.log('log', message)
            log(...arguments)
        }

        console.error = function(message){
            _this.log('error', message)
            error(...arguments)
        }

        window.onerror = function(message){
            _this.log('error', message)
            onerror(...arguments)
        }



        // this.input.addEventListener('keydown', (event)=>{
        //     if (event.keyCode === 13 && !event.shiftKey) {
        //
        //         event.preventDefault()
        //         DOM.dispatchEvent(event.target, 'change')
        //
        //     }
        // })
        //
        // this.input.addEventListener('change', (event)=>{
        //     try {
        //         console.log(eval(this.input.value))
        //     } catch (err) {
        //         console.error(err)
        //     }
        //     this.input.value = ''
        // })


    }

    log(type, message) {

        var node = this.messages.appendChild(html`
            <osc-console-message class="${type}">

            </osc-console-message>
        `)
        node.textContent = message
        if (type !== 'error' && node.textContent.match(/error/i)) node.classList.add('error')

        node.scrollIntoView()

        if (++this.length > this.maxLength) this.purge()


    }

    purge() {

        var children = [...this.messages.children]
        for (var i = 0; i < this.maxLength / 2; i++) {
            this.messages.removeChild(children[i])
        }
        this.length = this.maxLength / 2 + 1

    }

    clear() {

        this.messages.innerHTML = ''
        this.length = 0

    }

}

module.exports = new UiConsole({selector: '#osc-console'})
