# Custom module

## Writing a custom module

Using the `-c / --custom-module` command-line switch, users can load a javascript file to tune the way Open Stage Control behaves regarding osc.

```js

// Do whatever you want, initialize some variables, declare some functions, ...

module.exports = {

    init: function(){
        // this will be executed once when the osc server starts
    },

    oscInFilter:function(data){
        // Filter incoming osc messages

        var {address, args, host, port} = data

        // do what you want

        // address = string
        // args = array of {value, type} objects
        // host = string
        // port = integer

        // return data if you want the message to be processed
        return {address, args, host, port}

    },

    oscOutFilter:function(data){
        // Filter outgoing osc messages

        var {address, args, host, port, clientId} = data

        // same as oscInFilter

        // return data if you want the message to be and sent
        return {address, args, host, port}
    }

}

```

## Available globals

The module is executed in a restricted context, only a few globals are available :

----

#### `app`
[`Event Emitter`](https://nodejs.org/api/events.html#events_class_eventemitter), useful for monitoring the events sent by the different clients. Event names can be found in [callbacks.js](https://github.com/jean-emmanuel/open-stage-control/blob/master/src/server/callbacks.js), callbacks are called with 2 arguments: `data` (object) and `client` (object: `{address, id}`)

----

#### `receive(host, port, address, ...args, options)`

Send osc/midi message to connected clients. `host` and `port` can be specified to simulate a specific origin for the message.

- `host` (optional): `string` ip address, valid hostname or `"midi"`
- `port` (optional): `integer` port number or `string` midi device name
- `address`: osc address
- `args`: value or `{type: "OSC_TYPE_LETTER", value: VALUE}` `object`
- `options` (optional): set to `{clientId: id}` to define which client receives the message (where `id` is the client's id as retreived from `app` events or `oscOutFilter`)

----

#### `send(host, port, address, ...args)`

Send osc/midi to a target.

----

#### `settings.read(name)`

Returns specified server option. `name` must be the option's long name without the leading dashes (ie: `"send"`, not `"s"`)

----

#### `settings.appAddresses()`

Returns the server's http addresses.

----

#### `options`

`Array` containing the extra options passed to `--custom-module` after the filename

----

#### `loadJSON(path)`

Loads a json file (path is relative to the custom module location)

----

#### `saveJSON(path, object)`

Saves an object/array to a json file (path is relative to the custom module location)

----

#### `require(path)`

Load another javascript module. Returns the value of `module.exports` defined in this module. If `path` is a relative path, it will be resolved against its parent module's path. See [Managing Big Modules](../managing-big-modules)

----

#### Other javascript globals
- `console`
- `setTimeout`
- `clearTimeout`
- `setInterval`
- `clearInterval`

----


## Autoreload

Custom modules (including submodules loaded with `require()`) are reloaded automatically when they are modified. Upon reload, timers (`setTimeout` and `setInterval`) and event listeners (added to the  `app` object) are reset.
