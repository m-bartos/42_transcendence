// node_modules/navigo/lib/es/constants.js
var PARAMETER_REGEXP = /([:*])(\w+)/g;
var REPLACE_VARIABLE_REGEXP = "([^/]+)";
var WILDCARD_REGEXP = /\*/g;
var REPLACE_WILDCARD = "?(?:.*)";
var NOT_SURE_REGEXP = /\/\?/g;
var REPLACE_NOT_SURE = "/?([^/]+|)";
var START_BY_SLASH_REGEXP = "(?:/^|^)";
var MATCH_REGEXP_FLAGS = "";

// node_modules/navigo/lib/es/utils.js
function getCurrentEnvURL(fallback) {
  if (fallback === void 0) {
    fallback = "/";
  }
  if (windowAvailable()) {
    return location.pathname + location.search + location.hash;
  }
  return fallback;
}
function clean(s) {
  return s.replace(/\/+$/, "").replace(/^\/+/, "");
}
function isString(s) {
  return typeof s === "string";
}
function isFunction(s) {
  return typeof s === "function";
}
function extractHashFromURL(url) {
  if (url && url.indexOf("#") >= 0) {
    return url.split("#").pop() || "";
  }
  return "";
}
function regExpResultToParams(match, names) {
  if (names.length === 0) return null;
  if (!match) return null;
  return match.slice(1, match.length).reduce(function(params, value, index) {
    if (params === null) params = {};
    params[names[index]] = decodeURIComponent(value);
    return params;
  }, null);
}
function extractGETParameters(url) {
  var tmp = clean(url).split(/\?(.*)?$/);
  return [clean(tmp[0]), tmp.slice(1).join("")];
}
function parseQuery(queryString) {
  var query = {};
  var pairs = queryString.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    if (pair[0] !== "") {
      var key = decodeURIComponent(pair[0]);
      if (!query[key]) {
        query[key] = decodeURIComponent(pair[1] || "");
      } else {
        if (!Array.isArray(query[key])) query[key] = [query[key]];
        query[key].push(decodeURIComponent(pair[1] || ""));
      }
    }
  }
  return query;
}
function matchRoute(context, route) {
  var _extractGETParameters = extractGETParameters(clean(context.currentLocationPath)), current = _extractGETParameters[0], GETParams = _extractGETParameters[1];
  var params = GETParams === "" ? null : parseQuery(GETParams);
  var paramNames = [];
  var pattern;
  if (isString(route.path)) {
    pattern = START_BY_SLASH_REGEXP + clean(route.path).replace(PARAMETER_REGEXP, function(full, dots, name) {
      paramNames.push(name);
      return REPLACE_VARIABLE_REGEXP;
    }).replace(WILDCARD_REGEXP, REPLACE_WILDCARD).replace(NOT_SURE_REGEXP, REPLACE_NOT_SURE) + "$";
    if (clean(route.path) === "") {
      if (clean(current) === "") {
        return {
          url: current,
          queryString: GETParams,
          hashString: extractHashFromURL(context.to),
          route,
          data: null,
          params
        };
      }
    }
  } else {
    pattern = route.path;
  }
  var regexp = new RegExp(pattern, MATCH_REGEXP_FLAGS);
  var match = current.match(regexp);
  if (match) {
    var data = isString(route.path) ? regExpResultToParams(match, paramNames) : match.groups ? match.groups : match.slice(1);
    return {
      url: clean(current.replace(new RegExp("^" + context.instance.root), "")),
      queryString: GETParams,
      hashString: extractHashFromURL(context.to),
      route,
      data,
      params
    };
  }
  return false;
}
function pushStateAvailable() {
  return !!(typeof window !== "undefined" && window.history && window.history.pushState);
}
function undefinedOrTrue(obj, key) {
  return typeof obj[key] === "undefined" || obj[key] === true;
}
function parseNavigateOptions(source) {
  if (!source) return {};
  var pairs = source.split(",");
  var options = {};
  var resolveOptions;
  pairs.forEach(function(str) {
    var temp = str.split(":").map(function(v) {
      return v.replace(/(^ +| +$)/g, "");
    });
    switch (temp[0]) {
      case "historyAPIMethod":
        options.historyAPIMethod = temp[1];
        break;
      case "resolveOptionsStrategy":
        if (!resolveOptions) resolveOptions = {};
        resolveOptions.strategy = temp[1];
        break;
      case "resolveOptionsHash":
        if (!resolveOptions) resolveOptions = {};
        resolveOptions.hash = temp[1] === "true";
        break;
      case "updateBrowserURL":
      case "callHandler":
      case "updateState":
      case "force":
        options[temp[0]] = temp[1] === "true";
        break;
    }
  });
  if (resolveOptions) {
    options.resolveOptions = resolveOptions;
  }
  return options;
}
function windowAvailable() {
  return typeof window !== "undefined";
}
function accumulateHooks(hooks, result) {
  if (hooks === void 0) {
    hooks = [];
  }
  if (result === void 0) {
    result = {};
  }
  hooks.filter(function(h) {
    return h;
  }).forEach(function(h) {
    ["before", "after", "already", "leave"].forEach(function(type) {
      if (h[type]) {
        if (!result[type]) result[type] = [];
        result[type].push(h[type]);
      }
    });
  });
  return result;
}

// node_modules/navigo/lib/es/Q.js
function Q(funcs, c, done) {
  var context = c || {};
  var idx = 0;
  (function next() {
    if (!funcs[idx]) {
      if (done) {
        done(context);
      }
      return;
    }
    if (Array.isArray(funcs[idx])) {
      funcs.splice.apply(funcs, [idx, 1].concat(funcs[idx][0](context) ? funcs[idx][1] : funcs[idx][2]));
      next();
    } else {
      funcs[idx](context, function(moveForward) {
        if (typeof moveForward === "undefined" || moveForward === true) {
          idx += 1;
          next();
        } else if (done) {
          done(context);
        }
      });
    }
  })();
}
Q["if"] = function(condition, one, two) {
  if (!Array.isArray(one)) one = [one];
  if (!Array.isArray(two)) two = [two];
  return [condition, one, two];
};

// node_modules/navigo/lib/es/middlewares/setLocationPath.js
function setLocationPath(context, done) {
  if (typeof context.currentLocationPath === "undefined") {
    context.currentLocationPath = context.to = getCurrentEnvURL(context.instance.root);
  }
  context.currentLocationPath = context.instance._checkForAHash(context.currentLocationPath);
  done();
}

// node_modules/navigo/lib/es/middlewares/matchPathToRegisteredRoutes.js
function matchPathToRegisteredRoutes(context, done) {
  for (var i = 0; i < context.instance.routes.length; i++) {
    var route = context.instance.routes[i];
    var match = matchRoute(context, route);
    if (match) {
      if (!context.matches) context.matches = [];
      context.matches.push(match);
      if (context.resolveOptions.strategy === "ONE") {
        done();
        return;
      }
    }
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForDeprecationMethods.js
function checkForDeprecationMethods(context, done) {
  if (context.navigateOptions) {
    if (typeof context.navigateOptions["shouldResolve"] !== "undefined") {
      console.warn('"shouldResolve" is deprecated. Please check the documentation.');
    }
    if (typeof context.navigateOptions["silent"] !== "undefined") {
      console.warn('"silent" is deprecated. Please check the documentation.');
    }
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForForceOp.js
function checkForForceOp(context, done) {
  if (context.navigateOptions.force === true) {
    context.instance._setCurrent([context.instance._pathToMatchObject(context.to)]);
    done(false);
  } else {
    done();
  }
}

// node_modules/navigo/lib/es/middlewares/updateBrowserURL.js
var isWindowAvailable = windowAvailable();
var isPushStateAvailable = pushStateAvailable();
function updateBrowserURL(context, done) {
  if (undefinedOrTrue(context.navigateOptions, "updateBrowserURL")) {
    var value = ("/" + context.to).replace(/\/\//g, "/");
    var isItUsingHash = isWindowAvailable && context.resolveOptions && context.resolveOptions.hash === true;
    if (isPushStateAvailable) {
      history[context.navigateOptions.historyAPIMethod || "pushState"](context.navigateOptions.stateObj || {}, context.navigateOptions.title || "", isItUsingHash ? "#" + value : value);
      if (location && location.hash) {
        context.instance.__freezeListening = true;
        setTimeout(function() {
          if (!isItUsingHash) {
            var tmp = location.hash;
            location.hash = "";
            location.hash = tmp;
          }
          context.instance.__freezeListening = false;
        }, 1);
      }
    } else if (isWindowAvailable) {
      window.location.href = context.to;
    }
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForLeaveHook.js
function checkForLeaveHook(context, done) {
  var instance = context.instance;
  if (!instance.lastResolved()) {
    done();
    return;
  }
  Q(instance.lastResolved().map(function(oldMatch) {
    return function(_, leaveLoopDone) {
      if (!oldMatch.route.hooks || !oldMatch.route.hooks.leave) {
        leaveLoopDone();
        return;
      }
      var runHook = false;
      var newLocationVSOldMatch = context.instance.matchLocation(oldMatch.route.path, context.currentLocationPath, false);
      if (oldMatch.route.path !== "*") {
        runHook = !newLocationVSOldMatch;
      } else {
        var someOfTheLastOnesMatch = context.matches ? context.matches.find(function(match) {
          return oldMatch.route.path === match.route.path;
        }) : false;
        runHook = !someOfTheLastOnesMatch;
      }
      if (undefinedOrTrue(context.navigateOptions, "callHooks") && runHook) {
        Q(oldMatch.route.hooks.leave.map(function(f) {
          return function(_2, d) {
            return f(function(shouldStop) {
              if (shouldStop === false) {
                context.instance.__markAsClean(context);
              } else {
                d();
              }
            }, context.matches && context.matches.length > 0 ? context.matches.length === 1 ? context.matches[0] : context.matches : void 0);
          };
        }).concat([function() {
          return leaveLoopDone();
        }]));
        return;
      } else {
        leaveLoopDone();
      }
    };
  }), {}, function() {
    return done();
  });
}

// node_modules/navigo/lib/es/middlewares/checkForBeforeHook.js
function checkForBeforeHook(context, done) {
  if (context.match.route.hooks && context.match.route.hooks.before && undefinedOrTrue(context.navigateOptions, "callHooks")) {
    Q(context.match.route.hooks.before.map(function(f) {
      return function beforeHookInternal(_, d) {
        return f(function(shouldStop) {
          if (shouldStop === false) {
            context.instance.__markAsClean(context);
          } else {
            d();
          }
        }, context.match);
      };
    }).concat([function() {
      return done();
    }]));
  } else {
    done();
  }
}

// node_modules/navigo/lib/es/middlewares/callHandler.js
function callHandler(context, done) {
  if (undefinedOrTrue(context.navigateOptions, "callHandler")) {
    context.match.route.handler(context.match);
  }
  context.instance.updatePageLinks();
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForAfterHook.js
function checkForAfterHook(context, done) {
  if (context.match.route.hooks && context.match.route.hooks.after && undefinedOrTrue(context.navigateOptions, "callHooks")) {
    context.match.route.hooks.after.forEach(function(f) {
      return f(context.match);
    });
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForAlreadyHook.js
function checkForAlreadyHook(context, done) {
  var current = context.instance.lastResolved();
  if (current && current[0] && current[0].route === context.match.route && current[0].url === context.match.url && current[0].queryString === context.match.queryString) {
    current.forEach(function(c) {
      if (c.route.hooks && c.route.hooks.already) {
        if (undefinedOrTrue(context.navigateOptions, "callHooks")) {
          c.route.hooks.already.forEach(function(f) {
            return f(context.match);
          });
        }
      }
    });
    done(false);
    return;
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/checkForNotFoundHandler.js
function checkForNotFoundHandler(context, done) {
  var notFoundRoute = context.instance._notFoundRoute;
  if (notFoundRoute) {
    context.notFoundHandled = true;
    var _extractGETParameters = extractGETParameters(context.currentLocationPath), url = _extractGETParameters[0], queryString = _extractGETParameters[1];
    var hashString = extractHashFromURL(context.to);
    notFoundRoute.path = clean(url);
    var notFoundMatch = {
      url: notFoundRoute.path,
      queryString,
      hashString,
      data: null,
      route: notFoundRoute,
      params: queryString !== "" ? parseQuery(queryString) : null
    };
    context.matches = [notFoundMatch];
    context.match = notFoundMatch;
  }
  done();
}

// node_modules/navigo/lib/es/middlewares/errorOut.js
function errorOut(context, done) {
  if (!context.resolveOptions || context.resolveOptions.noMatchWarning === false || typeof context.resolveOptions.noMatchWarning === "undefined") console.warn('Navigo: "' + context.currentLocationPath + `" didn't match any of the registered routes.`);
  done();
}

// node_modules/navigo/lib/es/middlewares/flushCurrent.js
function flushCurrent(context, done) {
  context.instance._setCurrent(null);
  done();
}

// node_modules/navigo/lib/es/middlewares/updateState.js
function updateState(context, done) {
  if (undefinedOrTrue(context.navigateOptions, "updateState")) {
    context.instance._setCurrent(context.matches);
  }
  done();
}

// node_modules/navigo/lib/es/lifecycles.js
var foundLifecycle = [checkForAlreadyHook, checkForBeforeHook, callHandler, checkForAfterHook];
var notFoundLifeCycle = [checkForLeaveHook, checkForNotFoundHandler, Q["if"](function(_ref) {
  var notFoundHandled = _ref.notFoundHandled;
  return notFoundHandled;
}, foundLifecycle.concat([updateState]), [errorOut, flushCurrent])];

// node_modules/navigo/lib/es/middlewares/processMatches.js
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function processMatches(context, done) {
  var idx = 0;
  function nextMatch() {
    if (idx === context.matches.length) {
      updateState(context, done);
      return;
    }
    Q(foundLifecycle, _extends({}, context, {
      match: context.matches[idx]
    }), function end() {
      idx += 1;
      nextMatch();
    });
  }
  checkForLeaveHook(context, nextMatch);
}

// node_modules/navigo/lib/es/middlewares/waitingList.js
function waitingList(context) {
  context.instance.__markAsClean(context);
}

// node_modules/navigo/lib/es/index.js
function _extends2() {
  _extends2 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends2.apply(this, arguments);
}
var DEFAULT_LINK_SELECTOR = "[data-navigo]";
function Navigo(appRoute, options) {
  var DEFAULT_RESOLVE_OPTIONS = options || {
    strategy: "ONE",
    hash: false,
    noMatchWarning: false,
    linksSelector: DEFAULT_LINK_SELECTOR
  };
  var self = this;
  var root = "/";
  var current = null;
  var routes = [];
  var destroyed = false;
  var genericHooks;
  var isPushStateAvailable2 = pushStateAvailable();
  var isWindowAvailable2 = windowAvailable();
  if (!appRoute) {
    console.warn('Navigo requires a root path in its constructor. If not provided will use "/" as default.');
  } else {
    root = clean(appRoute);
  }
  function _checkForAHash(url) {
    if (url.indexOf("#") >= 0) {
      if (DEFAULT_RESOLVE_OPTIONS.hash === true) {
        url = url.split("#")[1] || "/";
      } else {
        url = url.split("#")[0];
      }
    }
    return url;
  }
  function composePathWithRoot(path) {
    return clean(root + "/" + clean(path));
  }
  function createRoute(path, handler, hooks, name) {
    path = isString(path) ? composePathWithRoot(path) : path;
    return {
      name: name || clean(String(path)),
      path,
      handler,
      hooks: accumulateHooks(hooks)
    };
  }
  function on(path, handler, hooks) {
    var _this = this;
    if (typeof path === "object" && !(path instanceof RegExp)) {
      Object.keys(path).forEach(function(p) {
        if (typeof path[p] === "function") {
          _this.on(p, path[p]);
        } else {
          var _path$p = path[p], _handler = _path$p.uses, name = _path$p.as, _hooks = _path$p.hooks;
          routes.push(createRoute(p, _handler, [genericHooks, _hooks], name));
        }
      });
      return this;
    } else if (typeof path === "function") {
      hooks = handler;
      handler = path;
      path = root;
    }
    routes.push(createRoute(path, handler, [genericHooks, hooks]));
    return this;
  }
  function resolve(to, options2) {
    if (self.__dirty) {
      self.__waiting.push(function() {
        return self.resolve(to, options2);
      });
      return;
    } else {
      self.__dirty = true;
    }
    to = to ? clean(root) + "/" + clean(to) : void 0;
    var context = {
      instance: self,
      to,
      currentLocationPath: to,
      navigateOptions: {},
      resolveOptions: _extends2({}, DEFAULT_RESOLVE_OPTIONS, options2)
    };
    Q([setLocationPath, matchPathToRegisteredRoutes, Q["if"](function(_ref) {
      var matches = _ref.matches;
      return matches && matches.length > 0;
    }, processMatches, notFoundLifeCycle)], context, waitingList);
    return context.matches ? context.matches : false;
  }
  function navigate(to, navigateOptions) {
    if (self.__dirty) {
      self.__waiting.push(function() {
        return self.navigate(to, navigateOptions);
      });
      return;
    } else {
      self.__dirty = true;
    }
    to = clean(root) + "/" + clean(to);
    var context = {
      instance: self,
      to,
      navigateOptions: navigateOptions || {},
      resolveOptions: navigateOptions && navigateOptions.resolveOptions ? navigateOptions.resolveOptions : DEFAULT_RESOLVE_OPTIONS,
      currentLocationPath: _checkForAHash(to)
    };
    Q([checkForDeprecationMethods, checkForForceOp, matchPathToRegisteredRoutes, Q["if"](function(_ref2) {
      var matches = _ref2.matches;
      return matches && matches.length > 0;
    }, processMatches, notFoundLifeCycle), updateBrowserURL, waitingList], context, waitingList);
  }
  function navigateByName(name, data, options2) {
    var url = generate(name, data);
    if (url !== null) {
      navigate(url.replace(new RegExp("^/?" + root), ""), options2);
      return true;
    }
    return false;
  }
  function off(what) {
    this.routes = routes = routes.filter(function(r) {
      if (isString(what)) {
        return clean(r.path) !== clean(what);
      } else if (isFunction(what)) {
        return what !== r.handler;
      }
      return String(r.path) !== String(what);
    });
    return this;
  }
  function listen() {
    if (isPushStateAvailable2) {
      this.__popstateListener = function() {
        if (!self.__freezeListening) {
          resolve();
        }
      };
      window.addEventListener("popstate", this.__popstateListener);
    }
  }
  function destroy() {
    this.routes = routes = [];
    if (isPushStateAvailable2) {
      window.removeEventListener("popstate", this.__popstateListener);
    }
    this.destroyed = destroyed = true;
  }
  function notFound(handler, hooks) {
    self._notFoundRoute = createRoute("*", handler, [genericHooks, hooks], "__NOT_FOUND__");
    return this;
  }
  function updatePageLinks() {
    if (!isWindowAvailable2) return;
    findLinks().forEach(function(link2) {
      if ("false" === link2.getAttribute("data-navigo") || "_blank" === link2.getAttribute("target")) {
        if (link2.hasListenerAttached) {
          link2.removeEventListener("click", link2.navigoHandler);
        }
        return;
      }
      if (!link2.hasListenerAttached) {
        link2.hasListenerAttached = true;
        link2.navigoHandler = function(e) {
          if ((e.ctrlKey || e.metaKey) && e.target.tagName.toLowerCase() === "a") {
            return false;
          }
          var location2 = link2.getAttribute("href");
          if (typeof location2 === "undefined" || location2 === null) {
            return false;
          }
          if (location2.match(/^(http|https)/) && typeof URL !== "undefined") {
            try {
              var u = new URL(location2);
              location2 = u.pathname + u.search;
            } catch (err) {
            }
          }
          var options2 = parseNavigateOptions(link2.getAttribute("data-navigo-options"));
          if (!destroyed) {
            e.preventDefault();
            e.stopPropagation();
            self.navigate(clean(location2), options2);
          }
        };
        link2.addEventListener("click", link2.navigoHandler);
      }
    });
    return self;
  }
  function findLinks() {
    if (isWindowAvailable2) {
      return [].slice.call(document.querySelectorAll(DEFAULT_RESOLVE_OPTIONS.linksSelector || DEFAULT_LINK_SELECTOR));
    }
    return [];
  }
  function link(path) {
    return "/" + root + "/" + clean(path);
  }
  function setGenericHooks(hooks) {
    genericHooks = hooks;
    return this;
  }
  function lastResolved() {
    return current;
  }
  function generate(name, data, options2) {
    var route = routes.find(function(r) {
      return r.name === name;
    });
    var result = null;
    if (route) {
      result = route.path;
      if (data) {
        for (var key in data) {
          result = result.replace(":" + key, data[key]);
        }
      }
      result = !result.match(/^\//) ? "/" + result : result;
    }
    if (result && options2 && !options2.includeRoot) {
      result = result.replace(new RegExp("^/" + root), "");
    }
    return result;
  }
  function getLinkPath(link2) {
    return link2.getAttribute("href");
  }
  function pathToMatchObject(path) {
    var _extractGETParameters = extractGETParameters(clean(path)), url = _extractGETParameters[0], queryString = _extractGETParameters[1];
    var params = queryString === "" ? null : parseQuery(queryString);
    var hashString = extractHashFromURL(path);
    var route = createRoute(url, function() {
    }, [genericHooks], url);
    return {
      url,
      queryString,
      hashString,
      route,
      data: null,
      params
    };
  }
  function getCurrentLocation() {
    return pathToMatchObject(clean(getCurrentEnvURL(root)).replace(new RegExp("^" + root), ""));
  }
  function directMatchWithRegisteredRoutes(path) {
    var context = {
      instance: self,
      currentLocationPath: path,
      to: path,
      navigateOptions: {},
      resolveOptions: DEFAULT_RESOLVE_OPTIONS
    };
    matchPathToRegisteredRoutes(context, function() {
    });
    return context.matches ? context.matches : false;
  }
  function directMatchWithLocation(path, currentLocation, annotatePathWithRoot) {
    if (typeof currentLocation !== "undefined" && (typeof annotatePathWithRoot === "undefined" || annotatePathWithRoot)) {
      currentLocation = composePathWithRoot(currentLocation);
    }
    var context = {
      instance: self,
      to: currentLocation,
      currentLocationPath: currentLocation
    };
    setLocationPath(context, function() {
    });
    if (typeof path === "string") {
      path = typeof annotatePathWithRoot === "undefined" || annotatePathWithRoot ? composePathWithRoot(path) : path;
    }
    var match = matchRoute(context, {
      name: String(path),
      path,
      handler: function handler() {
      },
      hooks: {}
    });
    return match ? match : false;
  }
  function addHook(type, route, func) {
    if (typeof route === "string") {
      route = getRoute(route);
    }
    if (route) {
      if (!route.hooks[type]) route.hooks[type] = [];
      route.hooks[type].push(func);
      return function() {
        route.hooks[type] = route.hooks[type].filter(function(f) {
          return f !== func;
        });
      };
    } else {
      console.warn("Route doesn't exists: " + route);
    }
    return function() {
    };
  }
  function getRoute(nameOrHandler) {
    if (typeof nameOrHandler === "string") {
      return routes.find(function(r) {
        return r.name === composePathWithRoot(nameOrHandler);
      });
    }
    return routes.find(function(r) {
      return r.handler === nameOrHandler;
    });
  }
  function __markAsClean(context) {
    context.instance.__dirty = false;
    if (context.instance.__waiting.length > 0) {
      context.instance.__waiting.shift()();
    }
  }
  this.root = root;
  this.routes = routes;
  this.destroyed = destroyed;
  this.current = current;
  this.__freezeListening = false;
  this.__waiting = [];
  this.__dirty = false;
  this.__markAsClean = __markAsClean;
  this.on = on;
  this.off = off;
  this.resolve = resolve;
  this.navigate = navigate;
  this.navigateByName = navigateByName;
  this.destroy = destroy;
  this.notFound = notFound;
  this.updatePageLinks = updatePageLinks;
  this.link = link;
  this.hooks = setGenericHooks;
  this.extractGETParameters = function(url) {
    return extractGETParameters(_checkForAHash(url));
  };
  this.lastResolved = lastResolved;
  this.generate = generate;
  this.getLinkPath = getLinkPath;
  this.match = directMatchWithRegisteredRoutes;
  this.matchLocation = directMatchWithLocation;
  this.getCurrentLocation = getCurrentLocation;
  this.addBeforeHook = addHook.bind(this, "before");
  this.addAfterHook = addHook.bind(this, "after");
  this.addAlreadyHook = addHook.bind(this, "already");
  this.addLeaveHook = addHook.bind(this, "leave");
  this.getRoute = getRoute;
  this._pathToMatchObject = pathToMatchObject;
  this._clean = clean;
  this._checkForAHash = _checkForAHash;
  this._setCurrent = function(c) {
    return current = self.current = c;
  };
  listen.call(this);
  updatePageLinks.call(this);
}
export {
  Navigo as default
};
//# sourceMappingURL=navigo.js.map
