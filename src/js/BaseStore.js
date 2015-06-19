/** @flow */

var Dispatcher = require('./Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {Observable} = require('rx-lite');
var asap = require('asap');
var isOffline = require('./isOffline');

var CHANGE_EVENT = 'change';

class BaseStore {
  // Can't declare here, because Babel will treat it as a definition and make it
  // null. So cast to any below for flow.
  // handleDispatch: (action: Object) => void;

  constructor() {
    this._emitter = new EventEmitter();
    if ((this: any).handleDispatch) {
      Dispatcher.subscribe((this: any).handleDispatch.bind(this));
    }
  }

  emitChange(data: Object = {}) {
    this._emitter.emit(CHANGE_EVENT, {store: this, ...data});
  }

  loadCachedData() {
    loadCachedData(this);
  }

  subscribe(
    fn: (data: any) => void
  ): {remove: () => void;} {
    this._emitter.on(CHANGE_EVENT, fn);

    return {
      remove: () => {
        this._emitter.removeListener(CHANGE_EVENT, fn);
      }
    };
  }

  // Creates an observable for extended store methods that are
  // run when onNext is called. OnNext is also called when extended stores
  // emit a CHANGE_EVENT. OnNext is only called when an observable event
  // has changed.
  __wrapAsObservable<TOptions, TResult>(
    fn: (options: TOptions) => TResult,
    options: TOptions
  ): Observable<TResult> {
    return Observable.create(observer => {
      observer.onNext(fn(options));
      // hook up store emitter with 'change' event to observer onNext
      // whenever there are changes in stores, all wrapped observers will call their functions
      var subscription = this.subscribe(() => observer.onNext(fn(options)));
      console.log(1111111111);
      console.log(fn);
      return () => subscription.remove();
    }).distinctUntilChanged(
      /*keySelector*/ null,
      (a, b) => a === b,
    );
  }
}

function loadCachedData(instance: Object) {
  if (!isOffline()) {
    return;
  }

  Object.keys(instance).forEach(key => {
    var ctor: any = instance.constructor;
    var value = localStorage.getItem(ctor.name + '.' + key);
    if (value) {
      instance[key] = JSON.parse(value);
    }
  });
}

module.exports = BaseStore;
