var ipc = require('../ipc/'),
    parser = require('../parser'),
    editor = require('../editor/'),
    lobby = require('../ui/lobby'),
    {loading, icon, Popup, upload, remoteBrowse} = require('../ui/utils'),
    {saveAs} = require('file-saver'),
    widgetManager = require('./widgets'),
    html = require('nanohtml'),
    raw = require('nanohtml/raw'),
    locales = require('../locales')


var SessionManager = class SessionManager {

    constructor() {

        this.session = null
        this.lock = false
        this.setSessionPath('')

        this.windowTitle = document.title

        ipc.on('connect', ()=>{
            ipc.send('sessionSetPath', {path: this.sessionPath})
        })

    }

    load(session, callback) {

        if (this.lock) return

        this.lock = true

        var container = DOM.get('#container')[0]

        container.classList.remove('show')
        container.innerHTML = ''

        lobby.close()

        var loader = loading(locales('loading_session'))

        setTimeout(()=>{
            try {
                parser.reset()

                try {

                    if (Array.isArray(session)) session = session[0]
                    if (session.type !== 'root') throw ''
                    this.session = session

                } catch(err) {

                    throw new Error(locales('session_malformed'))

                }

                parser.parse({
                    data: this.session,
                    parentNode: DOM.get('#container')[0]
                })
                editor.clearHistory()

            } catch (err) {
                loader.close()
                lobby.open()
                new Popup({title: raw(icon('exclamation-triangle')) + '&nbsp; ' + locales('session_parsingerror'), content: err, closable:true})
                this.lock = false
                throw err
            }

            for (var h in widgetManager.widgets) {
                if (widgetManager.widgets[h].value !== undefined) {
                    widgetManager.trigger('change', {
                        widget: widgetManager.widgets[h],
                        id: widgetManager.widgets[h].getProp('id'),
                        linkId: widgetManager.widgets[h].getProp('linkId'),
                        options: {}
                    })
                }
            }

            if (editor.enabled) editor.disable()

            DOM.dispatchEvent(window, 'resize')

            setTimeout(()=>{
                loader.close()
                container.classList.add('show')
                this.lock = false
                editor.unsavedSession = false
                this.setSessionPath('')
                if (callback) callback()
            }, 25)

        }, 25)

    }

    save(path) {

        if (!this.session) return

        if (path) this.setSessionPath(path)

        if (!this.sessionPath) return this.saveAs()

        ipc.send('sessionSave', {
            session: JSON.stringify(this.session, null, '  '),
            path: this.sessionPath
        })

    }

    saveAs() {

        if (!this.session) return

        remoteBrowse({extension: 'json', save:true}, (path)=>{
            this.save(path)
        })

    }

    export() {

        var sessionfile = JSON.stringify(this.session,null,'  '),
            blob = new Blob([sessionfile],{type : 'application/json'})

        saveAs(blob, new Date().toJSON().slice(0,10)+'_'+new Date().toJSON().slice(11,16) + '.json')

        edior.unsavedSession = false

    }

    list(data) {

        for (let i in data) {

            var max = 50
            var path = data[i],
                file = path.split('\\').pop().split('/').pop(),
                length = data[i].length

            path = path.replace(file,'')

            if (length > max - 3) {
                path = path.substr(0,Math.floor((path.length)/2)-(length-max)/2) + '...' + path.substr(Math.ceil((path.length)/2)+(length-max)/2, path.length)
            }

            lobby.list.appendChild(html`
                <a href="#" tabIndex="0" class="btn load" data-session="${data[i]}">
                    ${file} <em style="opacity:0.45">(${path})</em>
                    ${READ_ONLY? '' : html`<span>${raw(icon('times'))}</span>`}
                </a>
            `)

        }

        lobby.list.addEventListener('click', function(e){
            e.preventDefault()
            if (e.target.hasAttribute('data-session')) {
                ipc.send('sessionOpen',{path:e.target.getAttribute('data-session')})
            } else if (!READ_ONLY && e.target.tagName == 'SPAN') {
                ipc.send('sessionRemoveFromHistory',e.target.parentNode.getAttribute('data-session'))
                lobby.list.removeChild(e.target.parentNode)
            }
        })

        if (!READ_ONLY) {

            var brw = lobby.footer.appendChild(html`<a href="#" tabindex="0" class="btn browse">${raw(icon('folder-open'))} ${locales('session_browse')}</a>`)
            var imp = lobby.footer.appendChild(html`<a href="#" tabindex="0" class="btn import">${raw(icon('upload'))} ${locales('editor_import')}</a>`)
            var nws = lobby.footer.appendChild(html`<a href="#" tabindex="0" class="btn new">${raw(icon('file'))} ${locales('session_new')}</a>`)

            brw.addEventListener('click', (e)=>{
                this.browse()
            })

            imp.addEventListener('click', (e)=>{
                this.import()
            })

            nws.addEventListener('click', (e)=>{
                this.create()
            })

        }

        DOM.addEventListener(lobby.html, 'mousedown touchstart', function(e){
            if (e.type == 'mousedown') e.preventDefault()
            e.target.blur()
        })

        lobby.open()

    }

    open(data) {

        this.load(data.session, ()=>{
            this.setSessionPath(data.path)
            ipc.send('sessionOpened', {path: data.path})
        })

    }

    browse() {

        remoteBrowse({extension: 'json'}, (path)=>{
            if (editor.unsavedSession && !confirm(locales('session_unsaved'))) return
            ipc.send('sessionOpen',{path:path})
        })

    }

    import() {

        upload('.json', (path, result)=>{
            var session
            try {
                session = JSON.parse(result)
            } catch (err) {
                new Popup({title: raw(icon('exclamation-triangle')) + '&nbsp; ' + locales('session_parsingerror'), content: err, closable:true})
            }
            if (editor.unsavedSession && !confirm(locales('session_unsaved'))) return
            if (session) sessionManager.load(session)
        }, ()=>{
            new Popup({title: raw(icon('exclamation-triangle')) + '&nbsp; ' + locales('error'), content: locales('session_uploaderror'), closable:true})
        })

    }

    create() {
        this.load({type: 'root'},function(){
            require('../ui/sidepanel').open()
            editor.enable()
            editor.select(widgetManager.getWidgetById('root'))
        })
    }

    setSessionPath(path) {

        this.sessionPath = path

    }

}

var sessionManager = new SessionManager()

module.exports = sessionManager
