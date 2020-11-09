var osc = require('../../osc'),
    {isJSON} = require('../../utils')

module.exports = class OscReceiver {

    constructor(options) {

        var {address, value, parent, propName, usePreArgs} = options

        if (typeof value === 'string' && isJSON(value)) {
            try {
                this.value = JSON.parseFlex(value)
            } catch (err) {
                this.value = value
            }
        } else {
            this.value = value
        }

        this.parent = parent
        this.propNames = [propName]
        this.usePreArgs = usePreArgs
        this.bindedCallback = this.callback.bind(this)
        this.prefix = ''
        this.setAddress(address)

    }

    setAddress(address) {

        if (this.address !== address) {

            if (this.address) osc.off(this.prefix + this.address, this.bindedCallback, this.parent)

            if (address) this.address = address

            if (this.address[0] !== '/') {
                var parentAddress = this.parent.getProp('address') || this.parent.resolveProp('address', undefined, false, this)
                if (parentAddress === 'auto') {
                    var id = this.parent.getProp('id') || this.parent.resolveProp('id', undefined, false, this)
                    parentAddress = '/' + id
                }
                this.prefix = parentAddress
                if (this.prefix[this.prefix.length - 1] !== '/') this.prefix += '/'
            }

            osc.on(this.prefix + this.address, this.bindedCallback, {context: this.parent})

        }

    }

    addProp(propName){

        if (!this.propNames.includes(propName)) this.propNames.push(propName)

    }

    callback(args) {

        if (!Array.isArray(args)) args = [args]
        var preArgs = this.usePreArgs ? (this.parent.getProp('preArgs') || []) : []
        if (!Array.isArray(preArgs) && preArgs !== '') preArgs = [preArgs]
        if (args.length >= preArgs.length) {
            for (var i in preArgs) {
                if (preArgs[i] !== args[i]) return
            }
            var value = args.slice(preArgs.length)
            if (value.length < 2) value = value[0]
            if (typeof value === 'string' && isJSON(value)) {
                try {
                    this.value = JSON.parseFlex(value)
                } catch (err) {
                    this.value = value
                }
            } else {
                this.value = value
            }
            this.parent.updateProps(this.propNames)
        }

    }

}
