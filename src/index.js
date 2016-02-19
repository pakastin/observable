
export function Observable (obj) {
  if (!(this instanceof Observable)) {
    return new Observable(obj);
  };
  Object.defineProperty(this, 'listeners', {
    value: {},
    writable: true
  });
  Object.defineProperty(this, 'asyncListeners', {
    value: {},
    writable: true
  });
  if (obj) {
    for (var key in obj) {
      this[key] = obj[key];
    }
  }
}

export var observable = Observable;

Observable.prototype.on = on(false);
Observable.prototype.one = on(true);
Observable.prototype.off = off;
Observable.prototype.trigger = trigger;
Observable.prototype.onAsync = onAsync(false);
Observable.prototype.oneAsync = onAsync(true);
Observable.prototype.offAsync = offAsync;
Observable.prototype.triggerAsync = triggerAsync;

function on (one) {
  return function on (name, handler, ctx) {
    var listeners = this.listeners[name];

    if (!listeners) {
      listeners = this.listeners[name] = [];
    }

    listeners.push({
      one: one,
      handler: handler,
      ctx: ctx
    });

    return this;
  }
}

function off (name, handler, ctx) {
  if (!name) {
    this.listeners = {};
  } else if (!handler) {
    this.listeners[name] = [];
  }
  var listeners = this.listeners[name];
  if (!listeners) {
    return this;
  }
  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    if (listener.handler !== handler) {
      continue;
    }
    if (ctx && listener.ctx !== ctx) {
      continue;
    }
    listeners.splice(i--, 1);
  }
}

function trigger (name) {
  var args = new Array(arguments.length - 1);

  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i + 1];
  }

  var listeners = this.listeners[name];

  if (!listeners) {
    return this;
  }

  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    if (listener.one) {
      listeners.splice(i--, 1);
    }
    listener.handler.apply(listener.ctx || this, args);
  }
}

function onAsync (one) {
  return function (name, handler, ctx) {
    var listeners = this.asyncListeners[name];

    if (!listeners) {
      listeners = this.asyncListeners[name] = [];
    }

    listeners.push({
      one: one,
      handler: handler,
      ctx: ctx
    });

    return this;
  }
}

function offAsync (name, handler, ctx) {
  if (!name) {
    this.asyncListeners = {};
    return this;
  }

  if (!handler) {
    this.asyncListeners[name] = [];
    return this;
  }

  var listeners = this.asyncListeners[name];
  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    if (listener.handler !== handler) {
      continue;
    }
    if (ctx && listener.ctx !== ctx) {
      continue;
    }
    listeners.splice(i--, 1);
  }
}

function triggerAsync (name, cb, data) {
  var listeners = this.asyncListeners[name];

  if (!listeners) {
    cb(null, data);
    return;
  }

  var i = 0;

  trigger(null, data);

  function trigger (err, data) {
    if (err) {
      cb(err);
      return;
    }
    if (i > listeners.length - 1) {
      cb(null, data);
      return;
    }
    var listener = listeners[i++];
    if (listener.one) {
      listeners.splice(i--, 1);
    }
    listener.handler.call(listener.ctx || this, data, trigger);
  }

  return this;
}
