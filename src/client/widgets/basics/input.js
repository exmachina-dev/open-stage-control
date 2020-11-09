var Canvas = require('../common/canvas'),
    {deepCopy} = require('../../utils'),
    html = require('nanohtml')

class Input extends Canvas {

    static description() {

        return 'Text input.'

    }

    static defaults() {

        return super.defaults().extend({
            style: {
                _separator_input_style: 'Input style',
                align: {type: 'string', value: 'center', choices: ['center', 'left', 'right'], help: 'Set to `left` or `right` to change text alignment (otherwise center)'},
                unit: {type: 'string', value: '', help: 'Unit will be appended to the displayed widget\'s value (it doesn\'t affect osc messages)'},
            },
            class_specific: {
                asYouType: {type: 'boolean', value: false, help: 'Set to `true` to make the input send its value at each keystroke'},
                fieldValidator: {type: 'string|boolean', value: false, help: [
                    'Set to `abc` to make the input reject all characters, except a, b or c',
                    '`0-9` will only allow integer to be entered',
                    '`a-z` will only allow lowercase characters']}
            }
        })

    }

    constructor(options) {

        super({...options, html: html`
            <inner>
                <canvas></canvas>
            </inner>
        `})

        this.value = ''
        this.stringValue = ''
        this.focused = false
        this.tabKeyBlur = false
        this.fieldValidator = null

        if (this.getProp('vertical')) this.widget.classList.add('vertical')
        if (this.getProp('align') === 'left') this.widget.classList.add('left')
        if (this.getProp('align') === 'right') this.widget.classList.add('right')


        if (this.getProp('interaction')) {

            this.widget.setAttribute('tabindex', 0)
            this.widget.addEventListener('focus', this.focus.bind(this))
            this.input = html`<input class="no-keybinding"></input>`
            this.input.addEventListener('blur', (e)=>{
                this.blur(this.tabKeyBlur)
                this.tabKeyBlur = false
            })
            var asYouType = this.getProp('asYouType')
            this.fieldValidator = new RegExp('[^'+this.getProp('fieldValidator')+']', 'g')
            this.input.addEventListener('keydown', (e)=>{
                if (e.keyCode === 13) this.blur() // enter
                else if (e.keyCode === 27) this.blur(false) // esc
                else if (e.keyCode === 9) this.tabKeyBlur = true // tab
                else if (asYouType) {
                    setTimeout(()=>{
                        this.inputChange()
                    })
                }
            })

        }

    }

    focus() {

        if (this.focused) return
        this.focused = true

        this.widget.setAttribute('tabindex','-1')
        this.input.value = this.stringValue
        this.widget.insertBefore(this.input, this.canvas)
        this.input.focus()
        this.input.setSelectionRange(0, this.input.value.length)

    }

    blur(change=true) {

        if (!this.focused) return
        this.focused = false

        if (change) this.inputChange()

        this.widget.setAttribute('tabindex','0')
        this.widget.removeChild(this.input)

    }

    inputChange() {

        if (this.fieldValidator) {
            this.input.value = this.input.value.replace(this.fieldValidator, '');
        }
        this.setValue(this.input.value, {sync:true, send:true})

    }

    resizeHandle(event){

        super.resizeHandle(event)

        // if (this.getProp('vertical')){
        //
        //     var ratio = CANVAS_SCALING * this.scaling
        //
        //     this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        //     this.ctx.rotate(-Math.PI/2)
        //     this.ctx.translate(-this.height * ratio, 0)
        //
        //
        //     if (ratio != 1) this.ctx.scale(ratio, ratio)
        // }


    }

    setValue(v, options={} ) {

        try {
            this.value = JSON.parse(v)
        } catch (err) {
            this.value = v
        }

        if (this.value === '' || this.value === null) this.value = this.getProp('default')

        this.stringValue = this.getStringValue()
        this.batchDraw()

        if (options.send && !options.fromSync) this.sendValue()
        if (options.sync) this.changed(options)

    }

    draw() {

        var v = this.stringValue,
            width = this.width,
            height = this.height

        if (this.getProp('unit') && v.length) v += ' ' + this.getProp('unit')

        this.clear()

        this.ctx.fillStyle = this.cssVars.colorText

        if (this.textAlign == 'center') {
            this.ctx.fillText(v, Math.round(width/2), Math.round(height/2))
        } else if (this.textAlign == 'right') {
            this.ctx.fillText(v, width, Math.round(height/2))
        } else {
            this.ctx.fillText(v, 0, Math.round(height/2))
        }

        this.clearRect = [0, 0, width, height]

    }

    getStringValue() {
        if (this.value === undefined) return ''
        return typeof this.value != 'string' ?
            JSON.stringify(deepCopy(this.value, this.decimals)).replace(/,/g, ', ') :
            this.value
    }

}

Input.dynamicProps = Input.prototype.constructor.dynamicProps
    .filter(x=>x !== 'interaction')


module.exports = Input
