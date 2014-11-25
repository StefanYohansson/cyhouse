/*
 * Meteor Charts v0.6.0
 * http://www.meteorcharts.com
 * Created by Eric Rowell @ericdrowell
 * License http://www.meteorcharts.com/license
 * Date: 2014-07-04
 */
 ;var MeteorChart;
(function() {
  MeteorChart = function(config) {
    var that = this,
        container = config.container,
        len, n, slot;

    this._id = MeteorChart.idCounter++;
    this.attrs= {};
    this.container = MeteorChart.Util._isString(container) ? document.getElementById(container) : container;

    this.set('width', config.width);
    this.set('height', config.height);
    this.set('style', config.style);

    this.id = config.id;
    this.layout = MeteorChart.Layouts[config.layout];
    this.theme = MeteorChart.Themes[config.theme];

    this.slots = {};
    this.components = {};

    // build content container
    this.content = document.createElement('div');
    this.content.className = 'meteorchart-content';
    this.content.style.position = 'relative';
    this.content.style.overflow = 'hidden';
    this.content.style.opacity = 0;
    MeteorChart.DOM.addVendorStyle(this.content, 'transition', 'opacity 0.3s ease-in-out');
    this.container.appendChild(this.content);

    // initialize renderer dummies
    MeteorChart.DOM.dummy = MeteorChart.DOM.createElement('div');
    MeteorChart.DOM.dummy.style.display = 'inline-block';
    MeteorChart.DOM.dummy.className = 'dom-dummy';
    this.content.appendChild(MeteorChart.DOM.dummy);

    // init components
    for (n=0, len = config.components.length; n<len; n++) {
      slot = config.components[n];
      that._initComponent(MeteorChart.Util._extend(this.layout[slot.slot], slot));
    }

    // add components to chart content
    for (n=0, len = config.components.length; n<len; n++) {
      that._addComponent(this.components[config.components[n].id]);
    }

    // bind events
    this._bind();

    // store reference to this chart
    MeteorChart.charts.push(this);

    // need to delay chart render in order for the css transition
    // fade in to be applied
    setTimeout(function() {
      that._show();
    }, 50);

    that.render();
  };

  MeteorChart.prototype = {
    defaults: {
      style: function() {
        return {
          padding: this.theme.padding
        };
      }
    },
    _show: function() {
      // make component visible and trigger css transition
      this.content.style.opacity = 1;
    },
    _initComponent: function(conf) {
      MeteorChart.log('init ' + conf.id);

      // final decorations
      conf.chart = this;

      var component = new MeteorChart.Components[conf.type](conf);
      this.components[conf.id] = component;
      this.slots[conf.slot] = component;
    },
    _addComponent: function(component) {
      if (component.init) {
        component.init();
      }

      MeteorChart.log('add ' + component.id);
      this.content.appendChild(component.content);
    },
    _bind: function() {
      var that = this,
          content = this.content;

      content.addEventListener('mousemove', MeteorChart.Util._throttle(function(evt) {
        var contentPos = MeteorChart.DOM.getElementPosition(content);

        that.fire('mousemove', {
          x: evt.clientX - contentPos.x,
          y: evt.clientY - contentPos.y
        });


      }, 17, {trailing: false}), false);

      // NOTE: this is technically a mouseleave event
      content.addEventListener('mouseout', function(evt) {
        var toElement = evt.toElement || evt.relatedTarget;
        while(toElement) {
          if (toElement == this) {
            return false;
          }
          toElement = toElement.parentNode;
        }

        that.fire('mouseout');
      });
    },
    add: function(conf) {
      this._initComponent(conf);
      this._addComponent(this.components.length-1);
    },
    destroy: function() {
      var components = this.components,
          len = components.length,
          n;

      // destroy components
      for (n=0; n<len; n++) {
        components[n].destroy();
      }

      // clear any leftover DOM
      this.container.innerHTML = '';
    },
    render: function() {
      MeteorChart.log('render chart');

      var components = this.components,
          len = components.length,
          key, component;

      this.content.style.width = this.get('width') + 'px';
      this.content.style.height = this.get('height') + 'px';
      this.content.style.backgroundColor = this.theme.background;

      for (key in components) {
        components[key].render();
      }
    }
  };

  MeteorChart.version = '0.6.0';
  MeteorChart.Components = {};
  MeteorChart.Formatters = {};
  MeteorChart.Layouts = {};
  MeteorChart.Themes = {};

  // global properties
  MeteorChart.charts = [];
  MeteorChart.debug = false;
  MeteorChart.idCounter = 0;

  // UA
  MeteorChart.UA = (function(root) {
    var userAgent = (root.navigator && root.navigator.userAgent) || '';
    var ua = userAgent.toLowerCase(),
        // jQuery UA regex
        match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [],

        // adding mobile flag as well
        mobile = !!(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i));

    return {
        browser: match[ 1 ] || '',
        version: match[ 2 ] || '0',

        // adding mobile flab
        mobile: mobile
    };
  })(this);

  MeteorChart.log = function(str) {
    if (this.debug) {
      console.log('-- ' + str);
    }
  };
})();

// Uses Node, AMD or browser globals to create a module.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrict.js

// Defines a module "returnExports" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

// if the module has no dependencies, the above pattern can be simplified to
( function(root, factory) {
    if( typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    }
    else if( typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
    else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function() {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return MeteorChart;
}));
;(function() {
  var ArrayProto = Array.prototype,
      slice = ArrayProto.slice,
      nativeForEach = ArrayProto.forEach;

  MeteorChart.Util = {
    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    replace: function(str, tokens) {
      var key;
      for (key in tokens) {
        str = str.replace('{' + key + '}', tokens[key]);
      }
      return str;
    },
    addMethod: function(constructor, attr, def) {
      constructor.prototype[attr] = function() {
        var val;

        // setter
        if (arguments.length) {
          this.attrs[attr] = arguments[0];

          // chainable
          return this;
        }
        // getter
        else {
          val = this.attrs[attr];

          if (val === undefined) {
            if (MeteorChart.Util._isFunction(def)) {
              return def.call(this);
            }
            else {
              return def;
            }
          }
          else if (MeteorChart.Util._isFunction(val)) {
            return val.call(this);
          }
          else {
            return val;
          }
        }
      };
    },
    isEqual: function(a, b) {

      var aType = Object.prototype.toString.call(a),
          len;

      if (aType === '[object Object]') {
        for (var key in a) {
          if (!this.isEqual(a[key], b[key])) {
            return false;
          }
        }
        return true;
      }
      else if (aType === '[object Array]') {
        len = a.length;

        // for large arrays, use sampling to approximate equality
        // TODO: for now, the sampling "algo" just looks at the first element
        // and the last element.  This should eventually bit a bit more
        // robust to reduce false positives
        if (len > 5) {
          if (!this.isEqual(a[0], b[0])) {
            return false;
          }
          if (!this.isEqual(a[len-1], b[len-1])) {
            return false;
          }
        }
        // for smaller arrays, compare every single element for 100% accuracy
        else {
          for (var n=0; n<len; n++) {
            if (!this.isEqual(a[n], b[n])) {
              return false;
            }
          }
        }

        return true;
      }
      else {
        return a === b
      }

    },
    squaredDistanceBetweenPoints: function(p1, p2) {
      var diffX = p2.x - p1.x,
          diffY = p2.y - p1.y;
      return (diffX*diffX) + (diffY*diffY);
    },
    getLongerValue: function(a, b) {
      return Math.max(
        Math.abs(a),
        Math.abs(b)
      );
    },
    addCommas: function(nStr){
      nStr += '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    },
    _getScale: function(val, scaleFactor) {
      if (!scaleFactor) {
        scaleFactor = 1;
      }

      // more than 0
      if (scaleFactor > 0) {
        return val * scaleFactor;
      }
      // less than 0
      else {
        return val / (-1 * scaleFactor);
      }
    },
    /*
     * cherry-picked utilities from underscore.js
     */
    _isElement: function(obj) {
      return !!(obj && obj.nodeType == 1);
    },
    _isFunction: function(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isObject: function(obj) {
      return (!!obj && obj.constructor == Object);
    },
    _isArray: function(obj) {
      return Object.prototype.toString.call(obj) == '[object Array]';
    },
    _isNumber: function(obj) {
      return Object.prototype.toString.call(obj) == '[object Number]';
    },
    _isString: function(obj) {
      return Object.prototype.toString.call(obj) == '[object String]';
    },
    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    _each: function(obj, iterator, context) {
      if (obj == null) return obj;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
      } else {
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
          if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
      }
      return obj;
    },
    // Fill in a given object with default properties.
    _defaults: function(obj) {
      this._each(slice.call(arguments, 1), function(source) {
        if (source) {
          for (var prop in source) {
            if (obj[prop] === void 0) obj[prop] = source[prop];
          }
        }
      });
      return obj;
    },
    // Create a (shallow-cloned) duplicate of an object.
    _clone: function(obj) {
      if (!this._isObject(obj)) return obj;
      return this._isArray(obj) ? obj.slice() : this._extend({}, obj);
    },
    // Extend a given object with all the properties in passed-in object(s).
    // _extend: function(obj) {
    //   this._each(slice.call(arguments, 1), function(source) {
    //     if (source) {
    //       for (var prop in source) {
    //         obj[prop] = source[prop];
    //       }
    //     }
    //   });
    //   return obj;
    // },
    _extend: function(c1, c2) {
      var key, obj = {};

      // first, clone c1
      for(key in c1) {
        obj[key] = c1[key]; 
      }

      // next, interate through keys of c2 and add them to obj
      for(key in c2) {
        // if there's a conflict...
        if((key in c1) && this._isObject(c2[key])) {
          obj[key] = this._extend(c1[key], c2[key]);
        }
        else {
          obj[key] = c2[key];
        }
      }

      return obj;
    },
    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _throttle: function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      };
      return function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    }
  };
})();;(function() {
  var VENDORS = ['Webkit', 'Moz', 'MS', 'O'],
      VENDORS_LENGTH = VENDORS.length,
      PX = 'px';

  MeteorChart.DOM = {
    createElement: function(tag) {
      var el = document.createElement(tag);

      // inline resets
      el.style.padding = 0;
      el.style.margin = 0;
      return el;
    },
    getNumber: function(val) {
      return (val.replace(PX, '')) * 1;
    },
    getElementPosition: function(el) {
      var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { top: 0, left: 0 };
      return {
        x: rect.left,
        y: rect.top
      }
    },
    addVendorStyle: function(el, style, val) {
      var n;

      el.style[style] = val;
      for (n=0; n<VENDORS_LENGTH; n++) {
        el.style[VENDORS[n] + MeteorChart.Util.capitalize(style)] = val;
      }
    },
    setBorderRadius: function(el, radius) {
      this.addVendorStyle(el, 'borderRadius', radius + 'px');
    },
    setScale: function(el, x, y) {
      this.addVendorStyle(el, 'transform', 'scale(' + x + ',' + y + ')');
    },
    getElementWidth: function(el) {
      var width = 0;
      this.dummy.innerHTML = el.innerHTML;
      width = this.dummy.offsetWidth;
      this.dummy.innerHTML = '';

      return width;
    },
    getElementHeight: function(el) {
      var width = 0;
      this.dummy.innerHTML = el.innerHTML;
      width = this.dummy.offsetHeight;
      this.dummy.innerHTML = '';

      return width;
    },
    getTextWidth: function(text) {
      var width = 0;
      this.dummy.innerHTML = text;
      width = this.dummy.offsetWidth;
      this.dummy.innerHTML = '';

      return width;
    },
    getTextHeight: function(text) {
      var height = 0;
      this.dummy.innerHTML = text;
      height = this.dummy.offsetHeight;
      this.dummy.innerHTML = '';

      return height;
    },
    hasClass: function(el, name) {
      return new RegExp(' ' + name + ' ').test(' ' + elem.className + ' ');
    },
    addClass: function(el, name) {
      if (!this.hasClass(el, name)) {
        elem.className += ' ' + name;
      }
    },
    removeClass: function(el, name) {
      var reg = new RegExp('(\\s|^)'+name+'(\\s|$)');
      el.className = el.className.replace(reg,' ');
    }
  }
})();;(function() {
  var SVG_NS = 'http://www.w3.org/2000/svg';

  MeteorChart.SVG = {
    createElement: function(tag) {
      return document.createElementNS(SVG_NS, tag);
    }
  };
})();;(function() {
  MeteorChart.Event = {
    on: function(obj, func) {
      var event = obj.event;

      if (!this._events[event]) {
        this._events[event] = [];
      }

      this._events[event].push({
        type: obj.type,
        id: obj.id,
        handler: func
      });
        
    },
    fire: function(obj) {
      var event = obj.event,
          type = obj.type,
          id = obj.id,
          events = MeteorChart.Event._events[event],
          len, n, event;

      if (events) {
        len = events.length;
        for (n=0; n<len; n++) {
          event = events[n];
          if (MeteorChart.Event._shouldExecuteHandler(event, type, id)) {
            event.handler(obj);
          }
        }
      }
    },
    map: function(eventArr, func) {
      var that = this,
          cachedEvt = {},
          n, len;

      // convert eventArr into an array if it's not an array
      if (!MeteorChart.Util._isArray(eventArr)) {
        eventArr = [eventArr];
      }

      for (n=0, len=eventArr.length; n<len; n++) {
        that.on(eventArr[n], function(evt) {
          cachedEvt = MeteorChart.Util.merge(cachedEvt, evt);
          MeteorChart.render();
        });
      }

      return function() {
        return func(cachedEvt);
      };
    },
    _shouldExecuteHandler: function(event, type, id) {
      // type check
      if (event.type && event.type !== type) {
        return false;
      }

      // id check
      if (event.id && event.id !== id) {
        return false;
      }

      // everything is okay, return true
      return true;
    },
    _events: {}
  };
})();;(function() {
  var PX = 'px';

  var ATTR_BLACKLIST = {
    'id': 1,
    'type': 1,
    'chart': 1,
    'slot': 1
  };

  MeteorChart.Component = function(config) {
    var key;

    this._id = MeteorChart.idCounter++;
    this.attrs = {};
    this.chart = config.chart;
    this.className = config.type;
    this.id = config.id;
    this.type = config.type;

    // set attrs
    for (key in config) {
      if (!ATTR_BLACKLIST[key]) {
        this.set(key, config[key]);
      }
    }

    // build content container
    this.content = document.createElement('div');
    this.content.className = 'component-content';
    this.content.setAttribute('data-component-type', this.type);
    this.content.setAttribute('data-component-id', this.id);
    this.content.style.display = 'inline-block';
    this.content.style.position = 'absolute';
  };

  MeteorChart.Component.prototype = {
    defaults: {
      align: 'left',
      style: {},
      visible: true
    },
    render: function() {
      var that = this;

      // only add render to renderer queue if visible
      if (this.get('visible')) {
        MeteorChart.Renderer.queue(this.chart._id + '-' + this._id, function() {
          MeteorChart.log('render ' + that.id);

          // reset width and height so that they do not affect component
          // width and height methods
          that.content.style.width = 'auto';
          that.content.style.height = 'auto';

          // render concrete component first because the component width and height
          // may depend on it
          if (that._render) {
            that._render();
          }

          that.content.style.textAlign = that.get('align');
          that.content.style.left =      that.get('x') + PX;
          that.content.style.top =       that.get('y') + PX;
          that.content.style.width =     that.get('width') + PX;
          that.content.style.height =    that.get('height') + PX;
    
        });
      }
    },

    destroy: function() {

    },
    getDataColor: function(n) {
      var colors = this.chart.theme.data;
      return colors[n % colors.length];
    },
    hide: function() {
      this.content.style.opacity = 0;
    },
    _getScale: function() {
      var viewport = this.get('viewport'),
          width = this.get('width'),
          height = this.get('height'),
          diffX = viewport.maxX - viewport.minX,
          diffY = viewport.maxY - viewport.minY;

      return {
        x: width / diffX,
        y: height / diffY
      };
    }
  };

  MeteorChart.Component.extend = function(type, methods) {
    MeteorChart.Components[type] = function(config) {
      MeteorChart.Component.call(this, config);
    };

    MeteorChart.Components[type].prototype = MeteorChart.Util._extend(methods, MeteorChart.Component.prototype);
  };
})();;// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function() {
  MeteorChart.Renderer = {
    handlers: {},
    waiting: false,
    queue: function(id, func) {
      var that = this;

      this.handlers[id] = func;

      if (!this.waiting) {
        setTimeout(function() {
          that.loop();
          that.waiting = false;
        }, 10);
        this.waiting = true;
      }
    },
    loop: function() {
      var that = MeteorChart.Renderer,
          handlers = that.handlers,
          arr = [], 
          key, n, len;

      for (key in handlers) {
        arr.push({
          id: key,
          handler: handlers[key]
        });
      }

      len = arr.length;

      if (MeteorChart.batchRender && len) {
        arr[0].handler();
        delete that.handlers[arr[0].id];
      }
      else {
        // cleanup the handlers hash
        for (n=0; n<len; n++) {
          arr[n].handler();
          delete that.handlers[arr[n].id];
        }
      }

      if (len) {
        requestAnimFrame(that.loop);
      }
    }
  };
})();;(function() {
  var ATTR_WHITELIST = [
    'x',
    'y',
    'width',
    'height',
    'orientation',
    'visible',
    'style',
    'data',
    'viewport'
  ];

  MeteorChart.Attrs = {
    fire: function(event, obj) {
      var that = this;
      MeteorChart.Event.fire.call(this, MeteorChart.Util._extend({
          event: event,
          type: this.type,
          id: this.id
        },
        obj)
      );
    },
    set: function(attr, val) {
      if (val !== undefined) {
        this.attrs[attr] = val;
      }
    },
    get: function(attr) {
      var val = this.attrs[attr],
          def = this.defaults[attr],
          ret;

      // if val is undefined, use default
      if ((val === undefined || val === null) && def !== undefined) {
        val = def;
      }

      // if val is a function then execute it to obtain the val
      if (MeteorChart.Util._isFunction(val)) {
        ret = val.call(this);
      }
      else {
        ret = val;
      }

      // if ret is an object, fill in missing keys from default object
      if (MeteorChart.Util._isObject(ret)) {
        ret = MeteorChart.Util._defaults(ret, def);
      }

      // auto round x, y, width, and height values because these should
      // resolve to integer pixels
      if (attr === 'x' 
       || attr === 'y'
       || attr === 'width'
       || attr === 'height') {
        ret = Math.round(ret);
      }

      return ret;
    }
  };

  (function() {
    var len = ATTR_WHITELIST.length,
        n, attr;

    for (n=0; n<len; n++) {
      (function(attr) {
        MeteorChart.Attrs[attr] = function() {
          if (arguments.length) {
            return this.set.call(this, attr, arguments[0]);
          }
          else {
            return this.get(attr);
          }
        }  
      })(ATTR_WHITELIST[n])
    }
  })();

  MeteorChart.prototype = MeteorChart.Util._extend(MeteorChart.prototype, MeteorChart.Attrs);
  MeteorChart.Component.prototype = MeteorChart.Util._extend(MeteorChart.Component.prototype, MeteorChart.Attrs);
  
})();;(function() {
  MeteorChart.Component.extend('Lines', {
    defaults: {
      style: {
        lineWidth: 2
      }
    },
    init: function() {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      this.content.appendChild(this.canvas);
    },
    _render: function() {
      var data = this.data(),
          width = this.width(),
          height = this.height(),
          dataLen = data.length,
          context = this.context,
          style = this.style(),
          padding = this.chart.theme.padding,
          canvasWidth = width + (padding * 2),
          canvasHeight = height + (padding * 2),
          scale = this._getScale(),
          scaleX = scale.x,
          scaleY = scale.y,
          viewport = this.viewport(),
          n, line, points, i, pointsLen;

      // render
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      this.canvas.style.marginLeft = '-' + padding + 'px';
      this.canvas.style.marginTop = '-' + padding + 'px';

      context.save();
      context.translate(padding, padding);

      for (n=0; n<dataLen; n++) {
        points = data[n].points;
        pointsLen = points.length;

        context.save();
        context.translate(0, height);
        context.scale(scaleX, scaleY * -1);
        context.translate(viewport.minX * -1, viewport.minY * -1);
        context.beginPath();
        context.moveTo(points[0], points[1]);

        for (i = 2; i<pointsLen; i+=2) {
          context.lineTo(points[i], points[i+1]);
        }

        context.restore();
        context.strokeStyle = this.getDataColor(n);
        context.lineWidth = style.lineWidth;
        context.stroke();
      } 

      context.restore();
    },
    getTitles: function() {
      var arr = [],
          data = this.data(),
          len = data.length,
          n;

      for (n=0; n<len; n++) {
        arr.push(data[n].title);
      }

      return arr;
    }
  });
})();;(function() {
  var PX = 'px';
  MeteorChart.Component.extend('Axis', {
    defaults: {
      width: function() {
        var that = this,
            maxWidth = 0;

        this._eachLabel(function(offset, val) {
          maxWidth = Math.max(maxWidth, MeteorChart.DOM.getTextWidth(val));
        });

        return maxWidth;
      },
      height: function() {
        return this.chart.theme.fontSize;
      },
      style: {
        padding: 0
      }
    },
    init: function() {
      this.innerContent = MeteorChart.DOM.createElement('div');
      this.innerContent.style.position = 'relative';
      this.content.appendChild(this.innerContent);
    },
    _render: function() {
      var that = this;

      this.innerContent.innerHTML = '';

      this._eachLabel(function(offset, val) {
        that._addLabel(offset, val);
      });
    },
    _eachLabel: function(func) {
      var data = this.get('data'),
          len = data.length,
          style = this.get('style'),
          padding = style.padding,
          formatter = style.formatter || MeteorChart.Formatters.String,
          offset = padding,
          increment, n, val;

      if (this.get('orientation') === 'vertical') {
        increment = (this.get('height') - (padding * 2)) / (len - 1);
      }
      else {
        increment = (this.get('width') - (padding * 2)) / (len - 1);
      }

      for (n=0; n<len; n++) {
        val = data[n];
        func(Math.floor(offset), formatter.short(val)); 
        offset += increment;
      }
    },
    getLabelInfo: function() {
      var that = this,
          info = {};

      this._eachLabel(function(offset, val) {
        info[val] = {
          offset: offset
        };
      });

      return info;
    },
    _getLabel: function(val) {
      var theme = this.chart.theme,
          text = MeteorChart.DOM.createElement('span');

      text.innerHTML = val;
      text.style.position = 'absolute';
      text.style.fontSize = theme.fontSize + PX;
      text.style.fontFamily = theme.fontFamily;
      text.style.color = theme.primary;

      return text;
    },
    _addLabel: function(offset, val) {
      var text = this._getLabel(val);

      this.innerContent.appendChild(text);

      if (this.get('orientation') === 'vertical') {
        text.style.top = (this.get('height') - offset - (MeteorChart.DOM.getTextHeight(val) /2)) + PX;
        text.style.left = 0 + PX;
      }
      // horizontal
      else {
        text.style.top = 0 + PX;
        text.style.left = (offset - (MeteorChart.DOM.getTextWidth(val)/2)) + PX;
      }
    }
  });
})();;(function() {
  var PX = 'px';

  MeteorChart.Component.extend('Title', {
    defaults: {
      height: function() {
        return (this.chart.theme.fontSize * 2) + this.chart.get('style').padding / 2;
      }
    },
    init: function() {
      this.text = MeteorChart.DOM.createElement('h2');
      this.content.appendChild(this.text);
    },
    _render: function() {
      var theme = this.chart.theme;

      this.text.style.fontSize = (theme.fontSize * 2) + PX;
      this.text.style.fontFamily = theme.fontFamily;
      this.text.style.color = theme.primary;
      this.text.style.textAlign = 'center';
      this.text.innerHTML = this.get('data');
    }
  });
})();;(function() {
  var PX = 'px';

  MeteorChart.Component.extend('Tooltip', {
    defaults: {
      width: function() {
        return this.tooltip.offsetWidth;
      },
      height: function() {
        return this.tooltip.offsetHeight;
      }
    },
    init: function() {
      // NOTE: the pointerEvents style is not supported in IE < 11
      // therefore, older IE users might have the tooltip stuck under
      // the cursor from time to time
      this.content.style.pointerEvents = 'none';

      this.tooltip = MeteorChart.DOM.createElement('div');

      this.tooltipTitle = MeteorChart.DOM.createElement('h2');
      this.tooltipTitle.style.whiteSpace = 'nowrap';

      this.tooltipContent = MeteorChart.DOM.createElement('p');
      this.tooltipContent.style.whiteSpace = 'nowrap';

      this.tooltip.appendChild(this.tooltipTitle);
      this.tooltip.appendChild(this.tooltipContent);
      this.content.appendChild(this.tooltip);
    },
    _render: function() {
      var data = this.get('data'),
         chart = this.chart,
          style = this.get('style'),
          theme = this.chart.theme;

      if (data && data.title && data.content) {
        // tooltip
        this.tooltip.style.display = 'inline-block';
        this.tooltip.style.fontFamily = style.fontFamily || theme.fontFamily;
        this.tooltip.style.color = style.fontColor || theme.primary;
        this.tooltip.style.padding = chart.padding(-1) + PX;
        this.tooltip.style.border = '2px solid ' + (style.borderColor || theme.secondary); 
        this.tooltip.style.backgroundColor = style.backgroundColor || theme.background; 

        // title
        this.tooltipTitle.style.fontSize = this.fontSize(0) + PX;
        this.tooltipTitle.innerHTML = data.title;

        // content
        this.tooltipContent.style.fontSize = this.fontSize(0) + PX;
        this.tooltipContent.style.marginTop = 5 + PX;
        this.tooltipContent.innerHTML = data.content;
      }
      else {
        this.tooltip.style.display = 'none';
      }
    }
  });
})();;(function() {
  MeteorChart.Component.extend('GridLines', {
    defaults: {
      style: {
        lineWidth: 2
      }
    },
    init: function() {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      // add canvas to the content container
      this.content.appendChild(this.canvas);
    },
    _render: function() {
      var theme = this.chart.theme,
          font = theme.font,
          orientation = this.get('orientation') || 'horizontal',
          data = this.get('data'),
          lineWidth = this.get('style').lineWidth,
          context = this.context,
          width = this.get('width'),
          height = this.get('height'),
          padding = theme.padding,
          canvasWidth = width + (padding * 2),
          canvasHeight = height + (padding * 2),
          key, offset;

      if (data) {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.marginLeft = '-' + padding + 'px';
        this.canvas.style.marginTop = '-' + padding + 'px';

        context.save();
        context.translate(padding, padding);
        context.clearRect(0, 0, width, height);
        context.strokeStyle = this.chart.theme.secondary;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        for (key in data) {
          offset = data[key].offset;
          context.beginPath();
          
          if (orientation === 'horizontal') {
            context.moveTo(0, offset);
            context.lineTo(width, offset);
            context.stroke();
          }
          else {
            // vertical
            context.moveTo(offset, 0);
            context.lineTo(offset, height);
            context.stroke();
          } 
        }

        context.restore();
      }
    }
  });
})();;(function() {
  var PX = 'px';

  MeteorChart.Component.extend('Slider', {
    defaults: {
      offset: 0,
      value: 0,
      width: function() {
        return this.get('style').handleWidth;
      },
      height: function() {
        return this.get('style').handleHeight;
      }
    },
    init: function() {
      var showTrack = this.get('style').showTrack;

      // default
      if (showTrack === undefined) {
        showTrack = true;
      }

      if (showTrack) {
        this.track = MeteorChart.DOM.createElement('div');
        this.track.style.position = 'absolute';
        this.content.appendChild(this.track);
      }
      
      this.handle = MeteorChart.DOM.createElement('span');
      this.handle.style.display = 'inline-block';
      this.handle.style.position = 'absolute';
      this.content.appendChild(this.handle);

      this._bind();
    },
    _render: function() {
      var handle = this.handle,
          track = this.track,
          style = this.get('style'),
          theme = this.chart.theme,
          handleWidth = style.handleWidth,
          handleHeight = style.handleHeight,
          trackSize = 2,
          showTrack = style.showTrack;

      // default
      if (showTrack === undefined) {
        showTrack = true;
      }

      // handle
      handle.style.width = handleWidth + PX;
      handle.style.height = handleHeight + PX;
      handle.style.backgroundColor = style.handleFill || theme.primary;
      MeteorChart.DOM.setBorderRadius(handle, Math.min(handleWidth, handleHeight) / 2);

      // track
      if (showTrack) {
        track.style.backgroundColor = theme.secondary, 0.1;
      }

      if (this.get('orientation') === 'vertical') {
        handle.style.top = this.get('height') - handleHeight + PX;
        handle.style.left = 0 + PX;

        if (showTrack) {
          this.track.style.width = trackSize + PX;
          this.track.style.height = this.get('height') + PX;
          this.track.style.left = ((this.get('width') - trackSize) / 2) + PX;
        }
      }
      else {
        handle.style.top = 0 + PX;
        handle.style.left = 0 + PX;

        if (showTrack) {
          this.track.style.width = this.get('width') + PX;
          this.track.style.height = trackSize + PX;
          this.track.style.top = ((this.get('height') - trackSize) / 2) + PX;
        }
      }

      
      
      
    },
    getValue: function() {
      return this.value;
    },
    getOffset: function() {
      return this.offset;
    },
    _bind: function() {
      var that = this,
          handle = this.handle,
          chartContent = this.chart.content,
          orientation = this.get('orientation') || 'horizontal',
          style = this.get('style'),
          handleWidth = style.handleWidth,
          handleHeight = style.handleHeight,
          startOffsetPos = null,
          startPointerPos = null;

      // start drag & drop
      handle.addEventListener('mousedown', function(evt) {
        // prevent browser from trying to select stuff when dragging
        evt.preventDefault();

        if (orientation === 'horizontal') {
          startOffsetPos = MeteorChart.DOM.getNumber(handle.style.left);
          startPointerPos = evt.clientX;
        }
        else {
          startOffsetPos = MeteorChart.DOM.getNumber(handle.style.top);
          startPointerPos = evt.clientY;
        }

        that.fire('dragstart');
      }); 

      // drag
      document.body.addEventListener('mousemove', MeteorChart.Util._throttle(function(evt) {
        var diff, newOffset, value;

        if (startOffsetPos !== null) {

          if (orientation === 'horizontal') {
            diff = that.get('width') - that.get('style').handleWidth;
            pointerPos = evt.clientX;
            newOffset = pointerPos - startPointerPos + startOffsetPos;
            if (newOffset < 0) {
              newOffset = 0;
            }
            else if (newOffset > diff) {
              newOffset = diff;
            }
            handle.style.left = newOffset + PX;
          }
          else {
            diff = that.get('height') - that.get('style').handleHeight;
            pointerPos = evt.clientY;
            newOffset = pointerPos - startPointerPos + startOffsetPos;
            if (newOffset < 0) {
              newOffset = 0;
            }
            else if (newOffset > diff) {
              newOffset = diff;
            }
            handle.style.top = newOffset + PX;    
          }

          value = newOffset / (orientation === 'horizontal' ? (that.get('width') - handleWidth) : (that.get('height') - handleHeight));

          that.set('offset', newOffset);
          that.set('value', value);

          that.fire('dragmove', {
            offset: newOffset,
            value: value
          });
        }
      }, 17));
 
      // end drag & drop
      document.body.addEventListener('mouseup', function(evt) {
        if (startOffsetPos !== null) {
          startOffsetPos = null;
          startPointerPos = null;

          that.fire('dragend', {
            offset: that.get('offset'),
            value: that.get('value')
          });
        }
      }); 

      // cursors
      handle.addEventListener('mouseover', function(evt) {
        handle.style.cursor = 'pointer';
      }); 
      handle.addEventListener('mouseout', function(evt) {
        handle.style.cursor = 'default';
      });

    }
  });
})();;(function() {
  var PX = 'px';

  MeteorChart.Component.extend('Legend', {
    defaults: {
      width: function() {
        return MeteorChart.DOM.getElementWidth(this.list);
      },
      height: function() {
        return MeteorChart.DOM.getElementHeight(this.list);
      },
      orientation: 'horizontal'
    },
    init: function() {
      this.list = MeteorChart.DOM.createElement('ol');
      this.content.appendChild(this.list);
    },
    _render: function() {
      var chart = this.chart,
          theme = chart.theme,
          data = this.get('data'),
          len = data.length,
          n, ser;

      // clear the list
      this.list.innerHTML = '';

      for (n=0; n<len; n++) {
        title = data[n];
        this._addItem(this.getDataColor(n), title, n === len - 1);
      }
    },
    _addItem: function(color, str, last) {
      var chart = this.chart,
          theme = chart.theme,
          style = this.get('style'),
          fontSize = this.chart.theme.fontSize + PX,
          orientation = this.get('orientation'),
          item = MeteorChart.DOM.createElement('li'),
          box =  MeteorChart.DOM.createElement('span'),
          text = MeteorChart.DOM.createElement('span');

      if (orientation === 'horizontal') {
        item.style.display = 'inline-block';

        if (!last) {
          item.style.marginRight = 10 + PX;
        }
      }
      else {
        item.style.display = 'block';
        item.style.marginBottom = 10 + PX;
      }


      box.style.backgroundColor = color;
      box.style.width = fontSize;
      box.style.height = fontSize;
      box.style.display = 'inline-block';
      box.style.verticalAlign = 'top';

      text.innerHTML = str;
      text.style.display = 'inline-block';
      text.style.fontSize = fontSize;
      text.style.fontFamily = theme.fontFamily;
      text.style.color = theme.primary;
      text.style.verticalAlign = 'top';
      text.style.marginLeft = 5 + PX;

      item.appendChild(box);
      item.appendChild(text);
      this.list.appendChild(item);
    }
  });
})();;(function() {
  MeteorChart.Component.extend('Bars', {
    defaults: {
      style: {
        barWidth: 20
      },
      orientation: 'vertical'
    },
    init: function() {

    },
    _render: function() {
      var data = this.get('data'),
          theme = this.chart.theme,
          dataLen = data.length,
          groupOffset = 0,
          style = this.get('style'),
          barWidth = Math.round(style.barWidth),
          // TODO: currently counting the number of bars for the first group
          // there's probably a better way
          barsLen = data[0].bars.length,
          viewport = this.get('viewport'),
          range = viewport.max - viewport.min,
          n, group, bars, barsLen, i, color, increment, barOffset, length;

      this.content.innerHTML = '';

      if (this.get('orientation') === 'vertical') {
        increment = Math.round((this.get('width') - (barWidth * barsLen)) / (dataLen - 1));  
      }

      for (n=0; n<dataLen; n++) {
        group = data[n];
        bars = group.bars; 
        barsLen = bars.length;
        
        for (i=0; i<barsLen; i++) {
          bar = bars[i];
          barOffset = barWidth * i;
          length = this.get('height') * bar.value / range;
          this._addBar(groupOffset + barOffset, barWidth, length, this.getDataColor(i));

        }

        groupOffset += increment;
      }
    },
    _addBar: function(offset, width, length, color) {
      var div = MeteorChart.DOM.createElement('div'),
          style = this.get('style'),
          length;

      if (this.get('orientation') === 'vertical') {
        div.style.bottom = '0';
        div.style.left = offset + 'px';
        div.style.width = width + 'px';
        div.style.height = Math.floor(length) + 'px';
      }

      div.style.backgroundColor = color;
      div.style.position = 'absolute';
      this.content.appendChild(div);
    },
    getTitles: function() {
      var arr = [],
          data = this.data(),
          bars = data[0].bars,
          len = bars.length,
          n;

      for (n=0; n<len; n++) {
        arr.push(bars[n].title);
      }

      return arr;
    }
  });
})();;(function() {
  var ALL_SHAPES = ['circle'];

  MeteorChart.Component.extend('Scatter', {
    defaults: {
      style: {
        shape: 'circle',
        filled: true,
        size: 10,
        lineWidth: 2
      }
    },
    init: function() {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.content.appendChild(this.canvas);
    },
    _render: function() {
      var data = this.data(),
          dataLen = data.length,
          context = this.context,
          style = this.style(),
          padding = this.chart.theme.padding,
          width = this.width(),
          height = this.height(),
          scale = this._getScale(),
          scaleX = scale.x,
          scaleY = scale.y,
          viewport = this.viewport(),
          canvasWidth = width + (padding * 2),
          canvasHeight = height + (padding * 2),
          n, line, points, i, pointsLen, color;

      // render
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      this.canvas.style.marginLeft = '-' + padding + 'px';
      this.canvas.style.marginTop = '-' + padding + 'px';

      context.save();
      context.translate(padding, padding);

      for (n=0; n<dataLen; n++) {
        points = data[n].points;
        pointsLen = points.length;
        color = this.getDataColor(n);

        for (i = 0; i<pointsLen; i+=2) {
          this._renderNode(points[i], points[i+1], color);
        }

      } 

      context.restore();
    },
    _renderNode: function(x, y, color) {
      var context = this.context,
          style = this.style(),
          shape = style.shape,
          filled = style.filled,
          lineWidth = style.lineWidth,
          size = style.size,
          backgroundColor = this.chart.theme.background;
          width = this.width(),
          height = this.height(),
          scale = this._getScale(),
          scaleX = scale.x,
          scaleY = scale.y,
          viewport = this.viewport(),
          _x = (x - viewport.minX) * scaleX,
          _y = (y - viewport.minY) * scaleY;

      context.save();
      context.translate(0, height);
      context.scale(1, -1);
      context.beginPath();
      
      if (shape === 'circle') {
        context.arc(_x, _y, size / 2, 0, Math.PI * 2, false);

        if (filled) {
          context.fillStyle = color;
          context.fill();
        }
        else {
          context.strokeStyle = color;
          context.fillStyle = backgroundColor;
          context.lineWidth = lineWidth;
          context.fill();
          context.stroke(); 
        }
      }
      
      context.restore();
    },
    getTitles: function() {
      var arr = [],
          data = this.data(),
          len = data.length,
          n;

      for (n=0; n<len; n++) {
        arr.push(data[n].title);
      }

      return arr;
    }
  });
})();;(function() {
  var WHITE = '#FEFFFF',
      DARK_GRAY = '#3C3F36',
      GREEN = '#9FB03E',
      GRAY = '#72918B',
      LIGHT_GRAY = '#CECFCD';

  MeteorChart.Themes.BeachsideShopping = {
    background: WHITE,
    primary: DARK_GRAY,
    secondary: LIGHT_GRAY,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [GREEN, GRAY]
  };
})();;(function() {
  var BLACK =     '#1C1919',
      WHITE =     '#EEEEEE',
      DARK_GRAY = '#403D3C',
      SALMON =    '#EB5937',
      GREEN =     '#456F74',
      LIGHT_GRAY ='#D3CBBD';

  MeteorChart.Themes.BlackMath = {
    background: BLACK,
    primary: WHITE,
    secondary: DARK_GRAY,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [SALMON, GREEN, LIGHT_GRAY]
  };
})();;(function() {
  var RED = '#B9121B',
      DARK_RED = '#4C1B1B',
      LIGHT_BROWN = '#DEC49E',
      CREME = '#FCFAE1',
      BROWN = '#BD8D46';

  MeteorChart.Themes.CherryCheescake = {
    background: CREME,
    primary: DARK_RED,
    secondary: LIGHT_BROWN,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [RED, BROWN]
  };
})();;(function() {
  var RED = '#FF3800',
      GREEN = '#009393',
      LIGHT_YELLOW = '#FFFFFC',
      YELLOW = '#CBDED1',
      DARK_BLUE = '#00585F';

  MeteorChart.Themes.CoteAzur = {
    background: LIGHT_YELLOW,
    primary: DARK_BLUE,
    secondary: YELLOW,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [RED, GREEN]
  };
})();;(function() {
  var DARK_GRAY = '#3D4C53',
      LIGHT_GRAY = '#CFD2D4',
      AQUA = '#70B7BA',
      SALMON = '#F1433F',
      WHITE = '#FFFFFF';

  MeteorChart.Themes.Dribble = {
    background: WHITE,
    primary: DARK_GRAY,
    secondary: LIGHT_GRAY,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [SALMON, AQUA]
  };
})();;(function() {
  var RED = '#8E2800',
      GREEN = '#468966',
      LIGHT_YELLOW = '#FFF0A5',
      ORANGE = '#FFB03B',
      SALMON = '#AC5A28';

  MeteorChart.Themes.Firenze = {
    background: RED,
    primary: LIGHT_YELLOW,
    secondary: SALMON,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [ORANGE, GREEN]
  };
})();;(function() {
  var RED = '#AB1A25',
      ORANGE = '#D97925',
      DARK_BLUE = '#002635',
      PEACH = '#EFE7BE',
      GRAY = '#3C5657';

  MeteorChart.Themes.Lollapalooza = {
    background: DARK_BLUE,
    primary: PEACH,
    secondary: GRAY,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [RED, ORANGE]
  };
})();;(function() {
  var BLACK =     '#111111',
      WHITE =     '#CCCCCC',
      DARK_GRAY = '#555555',
      PINK =      '#FF358B',
      BLUE =      '#01B0F0',
      GREEN =     '#AEEE00';

  MeteorChart.Themes.OddEnd = {
    background: BLACK,
    primary: WHITE,
    secondary: DARK_GRAY,
    fontFamily: 'Arial',
    fontSize: 12,
    padding: 20,
    data: [GREEN, BLUE, PINK]
  };
})();;(function() {
  /**
   * L1_A LAYOUT
   * +-------+
   * |   0   |
   * +-------+
   */
  MeteorChart.Layouts.L1_A = [
    {
      x: function () {
        return this.chart.get('style').padding;
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.get('width') - (this.chart.get('style').padding * 2);
      },
      height: function() {
        return this.chart.get('height') - (this.chart.get('style').padding * 2);
      }
    }
  ];
})();;(function() {
  /**
   * L3_A LAYOUT
   * +---+---+
   * | 0 | 1 |
   * +---+---+
   * | X | 2 |
   * +---+---+
   */
  MeteorChart.Layouts.L3_A = [  
    // slot 0
    {
      orientation: 'vertical',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      height: function() {
        return this.chart.slots[1].get('height');
      }
    },
    // slot 1
    {
      x: function() {
        return this.chart.slots[0].get('width') + (this.chart.get('style').padding * 2);
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.get('width') - this.chart.slots[0].get('width') - (this.chart.get('style').padding * 3);
      },
      height: function() {
        var slots = this.chart.slots;
        return this.chart.get('height') - (this.chart.get('style').padding * 3) - slots[2].get('height');
      }
    },
    // slot 2
    {
      orienation: 'horizontal',
      x: function() {
        return this.chart.slots[1].get('x');
      },
      y: function() {
        var slots = this.chart.slots;
        return slots[1].get('y') + slots[1].get('height') + this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.slots[1].get('width');
      }
    } 
  ];
})();;(function() {
  /**
   * L4_A LAYOUT
   * +-------+
   * |   0   |
   * +---+---+
   * | 1 | 2 |
   * +---+---+
   * | X | 3 |
   * +---+---+
   */
  MeteorChart.Layouts.L4_A = [ 
    // slot 0
    {
      orientation: 'horizontal',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.get('width') - (this.chart.get('style').padding * 2);
      }
    },
    // slot 1
    {
      orientation: 'vertical',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        var chart = this.chart;
        return chart.slots[0].get('height') + (chart.get('style').padding * 2);
      },
      height: function() {
        return this.chart.slots[2].get('height');
      }
    },
    // slot 2 
    {
      x: function() {
        var chart = this.chart;
        return chart.slots[1].get('width') + (chart.get('style').padding * 2);
      },
      y: function() {
        var chart = this.chart;
        return chart.slots[0].get('height') + (chart.get('style').padding * 2);
      },
      width: function() {
        var chart = this.chart;
        return chart.get('width') - chart.slots[1].get('width') - (chart.get('style').padding * 3);
      },
      height: function() {
        var chart = this.chart,
            slots = chart.slots;

        return chart.get('height') - (chart.get('style').padding * 4) - slots[3].get('height') - slots[0].get('height');
      }
    },
    // slot 3
    {
      orientation: 'horizontal',
      x: function() {
        return this.chart.slots[2].get('x');
      },
      y: function() {
        var slots = this.chart.slots;

        return slots[2].get('y') + slots[2].get('height') + this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.slots[2].get('width');
      }
    }
  ];
})();;(function() {
  /**
   * L4_B LAYOUT
   * +---+---+---+
   * | 0 | 1 |   |
   * +---+---+ 3 |  
   * | X | 2 |   |
   * +---+---+---+
   */
  MeteorChart.Layouts.L4_B = [ 
    // slot 0
    {
      orientation: 'vertical',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      height: function() {
        return this.chart.slots[1].get('height');
      }
    },
    // slot 1 
    {
      x: function() {
        var chart = this.chart;
        return chart.slots[0].get('width') + (chart.get('style').padding * 2);
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      width: function() {
        var chart = this.chart;
        return chart.get('width') - chart.slots[0].get('width') - chart.slots[3].get('width') - (chart.get('style').padding * 4);
      },
      height: function() {
        var chart = this.chart,
            slots = chart.slots;

        return chart.get('height') - (chart.get('style').padding * 3) - slots[2].get('height');
      }
    },
    // slot 2
    {
      orientation: 'horizontal',
      x: function() {
        return this.chart.slots[1].get('x');
      },
      y: function() {
        var slots = this.chart.slots;

        return this.chart.get('height') - this.get('height') - this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.slots[1].get('width');
      }
    },
    // slot 3
    {
      orientation: 'vertical',
      x: function() {
        var slots = this.chart.slots;
        return this.chart.get('width') - this.get('width') - this.chart.get('style').padding;
      },
      y: function() {
        return this.chart.get('style').padding;
      },
      height: function() {
        return this.chart.get('height') - (this.chart.get('style').padding * 2);
      }
    }
  ];
})();;(function() {
  /**
   * L4_C LAYOUT
   * +---+---+
   * | 0 | 1 |
   * +---+---+
   * | X | 2 |
   * +---+---+
   * |   3   |
   * +-------+
   */
  MeteorChart.Layouts.L4_C = [ 
    // slot 0
    {
      orientation: 'vertical',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        var chart = this.chart;
        return chart.get('style').padding;
      },
      height: function() {
        return this.chart.slots[1].get('height');
      }
    },
    // slot 1 
    {
      x: function() {
        var chart = this.chart;
        return chart.slots[0].get('width') + (chart.get('style').padding * 2);
      },
      y: function() {
        var chart = this.chart;
        return chart.get('style').padding;
      },
      width: function() {
        var chart = this.chart;
        return chart.get('width') - chart.slots[0].get('width') - (chart.get('style').padding * 3);
      },
      height: function() {
        var chart = this.chart,
            slots = chart.slots;

        return chart.get('height') - (chart.get('style').padding * 4) - slots[2].get('height') - slots[3].get('height');
      }
    },
    // slot 2
    {
      orientation: 'horizontal',
      x: function() {
        return this.chart.slots[1].get('x');
      },
      y: function() {
        var slots = this.chart.slots;

        return slots[1].get('y') + slots[1].get('height') + this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.slots[1].get('width');
      }
    },
    // slot 3
    {
      orientation: 'horizontal',
      x: function() {
        return this.chart.get('style').padding;
      },
      y: function() {
        var slots = this.chart.slots;
        return slots[2].get('y') + slots[2].get('height') + this.chart.get('style').padding;
      },
      width: function() {
        return this.chart.get('width') - (this.chart.get('style').padding * 2);
      }
    }
  ];
})();;(function() {
  var SECONDS_IN_MINUTE = 60,
      SECONDS_IN_HOUR = 3600,
      SECONDS_IN_DAY = 86400,
      SECONDS_IN_MONTH = 2628000,
      SECONDS_IN_YEAR = 31500000;

  MeteorChart.Formatters.Date = {
    short: function(seconds, min, max) {
      var range = max - min,
          date = new moment(seconds * 1000);

      if (range < SECONDS_IN_HOUR) {
        return date.format('h:mma'); // minute
      }
      else if (range < SECONDS_IN_DAY) {
        return date.format('ddd ha'); // hour
      }
      else if (range < SECONDS_IN_MONTH) {
        return date.format('MMM D'); // day
      }
      else if (range < SECONDS_IN_YEAR) {
        return date.format('MMM YYYY');  // month
      }
      else {
        return date.format('YYYY'); // year
      }
    },
    long: function(seconds) {
      var date = date = new moment(seconds * 1000);
      return date.format('MMM D YYYY h:mma'); // day
    }
  };
})();;(function() {
  MeteorChart.Formatters.Number = {
    short: function(num, min, max) {
      var longestValue = MeteorChart.Util.getLongerValue(min, max);

      if (longestValue < 10) {
        return Math.round(num);
      }
      else if (longestValue < 1000) {
        return (Math.round(num * 10)/10);
      }
      // thousands
      else if (longestValue < 1000000) {
        return (Math.round(num / 1000 * 10)/10) + 'k';
      }
      // millions
      else if (longestValue < 1000000000) {
        return (Math.round(num / 1000000 * 10)/10) + 'M';
      }
      // billions
      else {
        return (Math.round(num / 1000000000 * 10)/10) + 'B';
      }
    },
    long: function(num) {
      return MeteorChart.Util.addCommas(num);
    }

  };
})();;(function() {
  MeteorChart.Formatters.String = {
    short: function(str) {
      return str;
    },
    long: function(str) {
      return str;
    }
  };
})();