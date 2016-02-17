(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Observable = factory());
}(this, function () { 'use strict';

  function Observable (obj) {
    if (!(this instanceof Observable)) {
      return new Observable(obj);
    };
    Object.defineProperty(this, 'listeners', {
      value: {},
      writable: true
    });
    if (obj) {
      for (var key in obj) {
        this[key] = obj[key];
      }
    }
  }

  Observable.prototype.on = on(false);
  Observable.prototype.one = on(true);
  Observable.prototype.off = off;
  Observable.prototype.trigger = trigger;

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
    } else if (!ctx) {
      var listeners = this.listeners[name];
      if (!listeners) {
        return this;
      }
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (listener.handler === handler) {
          listeners.splice(i--, 1);
        }
      }
    } else {
      var listeners = this.listeners[name];
      if (!listeners) {
        return this;
      }
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (listener.handler === handler && listener.ctx === ctx) {
          listeners.splice(i--, 1);
        }
      }
      return this;
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
      listener.handler.apply(listener.ctx || this, args);
      if (listener.one) {
        listeners.splice(i--, 1);
      }
    }
  }

  return Observable;

}));