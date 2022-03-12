;(function () {
	"use strict";

	let installHook = function install() {
	'use strict';

	// MODULE: src/adapter/renderer.ts
	function getRendererByVNodeId(renderers, id) {
	  for (const r of renderers.values()) {
	    if (r.has(id)) return r;
	  }

	  return null;
	}

	// MODULE: src/shells/shared/utils.ts
	function debounce(callback, wait) {
	  let timeout = null;
	  return (...args) => {
	    const next = () => callback(...args);

	    clearTimeout(timeout);
	    timeout = setTimeout(next, wait);
	  };
	}
	function throttle(callback, wait) {
	  let running = false;
	  return (...args) => {
	    if (!running) {
	      callback(...args);
	      running = true;
	      setTimeout(() => running = false, wait);
	    }
	  };
	}
	function copyToClipboard(text) {
	  const dom = document.createElement("textarea");
	  dom.textContent = text;
	  document.body.appendChild(dom);
	  dom.select();
	  document.execCommand("copy");
	  dom.blur();
	  document.body.removeChild(dom);
	}

	// MODULE: src/adapter/adapter/picker.ts
	function createPicker(window, renderers, onHover, onStop) {
	  let picking = false;
	  let lastId = -1;
	  let lastTarget = null;

	  function clicker(e) {
	    e.preventDefault();
	    e.stopPropagation(); // eslint-disable-next-line @typescript-eslint/no-use-before-define

	    stop();
	  }

	  function listener(e) {
	    e.preventDefault();
	    e.stopPropagation();

	    if (picking && e.target != null && lastTarget !== e.target) {
	      let id = lastId;

	      for (const r of renderers.values()) {
	        id = r.findVNodeIdForDom(e.target);

	        if (id > -1 && lastId !== id) {
	          onHover(id);
	          break;
	        }
	      }

	      lastTarget = e.target;
	      lastId = id;
	    }
	  }

	  function onMouseEvent(e) {
	    e.preventDefault();
	    e.stopPropagation();
	  }

	  const onScroll = debounce(() => {
	    onHover(-1);
	    lastId = -1;
	    lastTarget = null;
	  }, 16);

	  function start() {
	    if (!picking) {
	      lastId = -1;
	      picking = true;
	      window.addEventListener("mousedown", onMouseEvent, true);
	      window.addEventListener("mousemove", listener, true);
	      window.addEventListener("mouseup", onMouseEvent, true);
	      window.addEventListener("click", clicker, true);
	      document.addEventListener("scroll", onScroll, true);
	    }
	  }

	  function stop() {
	    if (picking) {
	      lastId = -1;
	      picking = false;
	      onStop();
	      window.removeEventListener("mousedown", onMouseEvent, true);
	      window.removeEventListener("mousemove", listener, true);
	      window.removeEventListener("mouseup", onMouseEvent, true);
	      window.removeEventListener("click", clicker, true);
	      document.removeEventListener("scroll", onScroll);
	    }
	  }

	  return {
	    start,
	    stop
	  };
	}

	// MODULE: node_modules/preact/dist/preact.module.js
	var n,
	    u,
	    i,
	    t,
	    o,
	    r,
	    f = {},
	    e = [],
	    c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

	function s(n, l) {
	  for (var u in l) n[u] = l[u];

	  return n;
	}

	function a(n) {
	  var l = n.parentNode;
	  l && l.removeChild(n);
	}

	function v(n, l, u) {
	  var i,
	      t,
	      o,
	      r = arguments,
	      f = {};

	  for (o in l) "key" == o ? i = l[o] : "ref" == o ? t = l[o] : f[o] = l[o];

	  if (arguments.length > 3) for (u = [u], o = 3; o < arguments.length; o++) u.push(r[o]);
	  if (null != u && (f.children = u), "function" == typeof n && null != n.defaultProps) for (o in n.defaultProps) void 0 === f[o] && (f[o] = n.defaultProps[o]);
	  return h(n, f, i, t, null);
	}

	function h(l, u, i, t, o) {
	  var r = {
	    type: l,
	    props: u,
	    key: i,
	    ref: t,
	    __k: null,
	    __: null,
	    __b: 0,
	    __e: null,
	    __d: void 0,
	    __c: null,
	    __h: null,
	    constructor: void 0,
	    __v: null == o ? ++n.__v : o
	  };
	  return null != n.vnode && n.vnode(r), r;
	}

	function p(n) {
	  return n.children;
	}

	function d(n, l) {
	  this.props = n, this.context = l;
	}

	function _(n, l) {
	  if (null == l) return n.__ ? _(n.__, n.__.__k.indexOf(n) + 1) : null;

	  for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;

	  return "function" == typeof n.type ? _(n) : null;
	}

	function w(n) {
	  var l, u;

	  if (null != (n = n.__) && null != n.__c) {
	    for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
	      n.__e = n.__c.base = u.__e;
	      break;
	    }

	    return w(n);
	  }
	}

	function k(l) {
	  (!l.__d && (l.__d = !0) && u.push(l) && !g.__r++ || t !== n.debounceRendering) && ((t = n.debounceRendering) || i)(g);
	}

	function g() {
	  for (var n; g.__r = u.length;) n = u.sort(function (n, l) {
	    return n.__v.__b - l.__v.__b;
	  }), u = [], n.some(function (n) {
	    var l, u, i, t, o, r, f;
	    n.__d && (r = (o = (l = n).__v).__e, (f = l.__P) && (u = [], (i = s({}, o)).__v = o.__v + 1, t = $(f, o, i, l.__n, void 0 !== f.ownerSVGElement, null != o.__h ? [r] : null, u, null == r ? _(o) : r, o.__h), j(u, o), t != r && w(o)));
	  });
	}

	function m(n, l, u, i, t, o, r, c, s, v) {
	  var y,
	      d,
	      w,
	      k,
	      g,
	      m,
	      b,
	      A = i && i.__k || e,
	      P = A.length;

	  for (s == f && (s = null != r ? r[0] : P ? _(i, 0) : null), u.__k = [], y = 0; y < l.length; y++) if (null != (k = u.__k[y] = null == (k = l[y]) || "boolean" == typeof k ? null : "string" == typeof k || "number" == typeof k ? h(null, k, null, null, k) : Array.isArray(k) ? h(p, {
	    children: k
	  }, null, null, null) : null != k.__e || null != k.__c ? h(k.type, k.props, k.key, null, k.__v) : k)) {
	    if (k.__ = u, k.__b = u.__b + 1, null === (w = A[y]) || w && k.key == w.key && k.type === w.type) A[y] = void 0;else for (d = 0; d < P; d++) {
	      if ((w = A[d]) && k.key == w.key && k.type === w.type) {
	        A[d] = void 0;
	        break;
	      }

	      w = null;
	    }
	    g = $(n, k, w = w || f, t, o, r, c, s, v), (d = k.ref) && w.ref != d && (b || (b = []), w.ref && b.push(w.ref, null, k), b.push(d, k.__c || g, k)), null != g ? (null == m && (m = g), s = x(n, k, w, A, r, g, s), v || "option" != u.type ? "function" == typeof u.type && (u.__d = s) : n.value = "") : s && w.__e == s && s.parentNode != n && (s = _(w));
	  }

	  if (u.__e = m, null != r && "function" != typeof u.type) for (y = r.length; y--;) null != r[y] && a(r[y]);

	  for (y = P; y--;) null != A[y] && L(A[y], A[y]);

	  if (b) for (y = 0; y < b.length; y++) I(b[y], b[++y], b[++y]);
	}

	function x(n, l, u, i, t, o, r) {
	  var f, e, c;
	  if (void 0 !== l.__d) f = l.__d, l.__d = void 0;else if (t == u || o != r || null == o.parentNode) n: if (null == r || r.parentNode !== n) n.appendChild(o), f = null;else {
	    for (e = r, c = 0; (e = e.nextSibling) && c < i.length; c += 2) if (e == o) break n;

	    n.insertBefore(o, r), f = r;
	  }
	  return void 0 !== f ? f : o.nextSibling;
	}

	function A(n, l, u, i, t) {
	  var o;

	  for (o in u) "children" === o || "key" === o || o in l || C(n, o, null, u[o], i);

	  for (o in l) t && "function" != typeof l[o] || "children" === o || "key" === o || "value" === o || "checked" === o || u[o] === l[o] || C(n, o, l[o], u[o], i);
	}

	function P(n, l, u) {
	  "-" === l[0] ? n.setProperty(l, u) : n[l] = null == u ? "" : "number" != typeof u || c.test(l) ? u : u + "px";
	}

	function C(n, l, u, i, t) {
	  var o, r, f;
	  if (t && "className" == l && (l = "class"), "style" === l) {
	    if ("string" == typeof u) n.style.cssText = u;else {
	      if ("string" == typeof i && (n.style.cssText = i = ""), i) for (l in i) u && l in u || P(n.style, l, "");
	      if (u) for (l in u) i && u[l] === i[l] || P(n.style, l, u[l]);
	    }
	  } else "o" === l[0] && "n" === l[1] ? (o = l !== (l = l.replace(/Capture$/, "")), (r = l.toLowerCase()) in n && (l = r), l = l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, f = o ? N : z, u ? i || n.addEventListener(l, f, o) : n.removeEventListener(l, f, o)) : "list" !== l && "tagName" !== l && "form" !== l && "type" !== l && "size" !== l && "download" !== l && "href" !== l && !t && l in n ? n[l] = null == u ? "" : u : "function" != typeof u && "dangerouslySetInnerHTML" !== l && (l !== (l = l.replace(/xlink:?/, "")) ? null == u || !1 === u ? n.removeAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase()) : n.setAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase(), u) : null == u || !1 === u && !/^ar/.test(l) ? n.removeAttribute(l) : n.setAttribute(l, u));
	}

	function z(l) {
	  this.l[l.type + !1](n.event ? n.event(l) : l);
	}

	function N(l) {
	  this.l[l.type + !0](n.event ? n.event(l) : l);
	}

	function T(n, l, u) {
	  var i, t;

	  for (i = 0; i < n.__k.length; i++) (t = n.__k[i]) && (t.__ = n, t.__e && ("function" == typeof t.type && t.__k.length > 1 && T(t, l, u), l = x(u, t, t, n.__k, null, t.__e, l), "function" == typeof n.type && (n.__d = l)));
	}

	function $(l, u, i, t, o, r, f, e, c) {
	  var a,
	      v,
	      h,
	      y,
	      _,
	      w,
	      k,
	      g,
	      b,
	      x,
	      A,
	      P = u.type;

	  if (void 0 !== u.constructor) return null;
	  null != i.__h && (c = i.__h, e = u.__e = i.__e, u.__h = null, r = [e]), (a = n.__b) && a(u);

	  try {
	    n: if ("function" == typeof P) {
	      if (g = u.props, b = (a = P.contextType) && t[a.__c], x = a ? b ? b.props.value : a.__ : t, i.__c ? k = (v = u.__c = i.__c).__ = v.__E : ("prototype" in P && P.prototype.render ? u.__c = v = new P(g, x) : (u.__c = v = new d(g, x), v.constructor = P, v.render = M), b && b.sub(v), v.props = g, v.state || (v.state = {}), v.context = x, v.__n = t, h = v.__d = !0, v.__h = []), null == v.__s && (v.__s = v.state), null != P.getDerivedStateFromProps && (v.__s == v.state && (v.__s = s({}, v.__s)), s(v.__s, P.getDerivedStateFromProps(g, v.__s))), y = v.props, _ = v.state, h) null == P.getDerivedStateFromProps && null != v.componentWillMount && v.componentWillMount(), null != v.componentDidMount && v.__h.push(v.componentDidMount);else {
	        if (null == P.getDerivedStateFromProps && g !== y && null != v.componentWillReceiveProps && v.componentWillReceiveProps(g, x), !v.__e && null != v.shouldComponentUpdate && !1 === v.shouldComponentUpdate(g, v.__s, x) || u.__v === i.__v) {
	          v.props = g, v.state = v.__s, u.__v !== i.__v && (v.__d = !1), v.__v = u, u.__e = i.__e, u.__k = i.__k, v.__h.length && f.push(v), T(u, e, l);
	          break n;
	        }

	        null != v.componentWillUpdate && v.componentWillUpdate(g, v.__s, x), null != v.componentDidUpdate && v.__h.push(function () {
	          v.componentDidUpdate(y, _, w);
	        });
	      }
	      v.context = x, v.props = g, v.state = v.__s, (a = n.__r) && a(u), v.__d = !1, v.__v = u, v.__P = l, a = v.render(v.props, v.state, v.context), v.state = v.__s, null != v.getChildContext && (t = s(s({}, t), v.getChildContext())), h || null == v.getSnapshotBeforeUpdate || (w = v.getSnapshotBeforeUpdate(y, _)), A = null != a && a.type == p && null == a.key ? a.props.children : a, m(l, Array.isArray(A) ? A : [A], u, i, t, o, r, f, e, c), v.base = u.__e, u.__h = null, v.__h.length && f.push(v), k && (v.__E = v.__ = null), v.__e = !1;
	    } else null == r && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = H(i.__e, u, i, t, o, r, f, c);

	    (a = n.diffed) && a(u);
	  } catch (l) {
	    u.__v = null, (c || null != r) && (u.__e = e, u.__h = !!c, r[r.indexOf(e)] = null), n.__e(l, u, i);
	  }

	  return u.__e;
	}

	function j(l, u) {
	  n.__c && n.__c(u, l), l.some(function (u) {
	    try {
	      l = u.__h, u.__h = [], l.some(function (n) {
	        n.call(u);
	      });
	    } catch (l) {
	      n.__e(l, u.__v);
	    }
	  });
	}

	function H(n, l, u, i, t, o, r, c) {
	  var s,
	      a,
	      v,
	      h,
	      y,
	      p = u.props,
	      d = l.props;
	  if (t = "svg" === l.type || t, null != o) for (s = 0; s < o.length; s++) if (null != (a = o[s]) && ((null === l.type ? 3 === a.nodeType : a.localName === l.type) || n == a)) {
	    n = a, o[s] = null;
	    break;
	  }

	  if (null == n) {
	    if (null === l.type) return document.createTextNode(d);
	    n = t ? document.createElementNS("http://www.w3.org/2000/svg", l.type) : document.createElement(l.type, d.is && {
	      is: d.is
	    }), o = null, c = !1;
	  }

	  if (null === l.type) p === d || c && n.data === d || (n.data = d);else {
	    if (null != o && (o = e.slice.call(n.childNodes)), v = (p = u.props || f).dangerouslySetInnerHTML, h = d.dangerouslySetInnerHTML, !c) {
	      if (null != o) for (p = {}, y = 0; y < n.attributes.length; y++) p[n.attributes[y].name] = n.attributes[y].value;
	      (h || v) && (h && (v && h.__html == v.__html || h.__html === n.innerHTML) || (n.innerHTML = h && h.__html || ""));
	    }

	    A(n, d, p, t, c), h ? l.__k = [] : (s = l.props.children, m(n, Array.isArray(s) ? s : [s], l, u, i, "foreignObject" !== l.type && t, o, r, f, c)), c || ("value" in d && void 0 !== (s = d.value) && (s !== n.value || "progress" === l.type && !s) && C(n, "value", s, p.value, !1), "checked" in d && void 0 !== (s = d.checked) && s !== n.checked && C(n, "checked", s, p.checked, !1));
	  }
	  return n;
	}

	function I(l, u, i) {
	  try {
	    "function" == typeof l ? l(u) : l.current = u;
	  } catch (l) {
	    n.__e(l, i);
	  }
	}

	function L(l, u, i) {
	  var t, o, r;

	  if (n.unmount && n.unmount(l), (t = l.ref) && (t.current && t.current !== l.__e || I(t, null, u)), i || "function" == typeof l.type || (i = null != (o = l.__e)), l.__e = l.__d = void 0, null != (t = l.__c)) {
	    if (t.componentWillUnmount) try {
	      t.componentWillUnmount();
	    } catch (l) {
	      n.__e(l, u);
	    }
	    t.base = t.__P = null;
	  }

	  if (t = l.__k) for (r = 0; r < t.length; r++) t[r] && L(t[r], u, i);
	  null != o && a(o);
	}

	function M(n, l, u) {
	  return this.constructor(n, u);
	}

	function O(l, u, i) {
	  var t, r, c;
	  n.__ && n.__(l, u), r = (t = i === o) ? null : i && i.__k || u.__k, l = v(p, null, [l]), c = [], $(u, (t ? u : i || u).__k = l, r || f, f, void 0 !== u.ownerSVGElement, i && !t ? [i] : r ? null : u.childNodes.length ? e.slice.call(u.childNodes) : null, c, i || f, t), j(c, l);
	}

	function B(n, l) {
	  var u = {
	    __c: l = "__cC" + r++,
	    __: n,
	    Consumer: function (n, l) {
	      return n.children(l);
	    },
	    Provider: function (n, u, i) {
	      return this.getChildContext || (u = [], (i = {})[l] = this, this.getChildContext = function () {
	        return i;
	      }, this.shouldComponentUpdate = function (n) {
	        this.props.value !== n.value && u.some(k);
	      }, this.sub = function (n) {
	        u.push(n);
	        var l = n.componentWillUnmount;

	        n.componentWillUnmount = function () {
	          u.splice(u.indexOf(n), 1), l && l.call(n);
	        };
	      }), n.children;
	    }
	  };
	  return u.Provider.__ = u.Consumer.contextType = u;
	}

	n = {
	  __e: function (n, l) {
	    for (var u, i, t, o = l.__h; l = l.__;) if ((u = l.__c) && !u.__) try {
	      if ((i = u.constructor) && null != i.getDerivedStateFromError && (u.setState(i.getDerivedStateFromError(n)), t = u.__d), null != u.componentDidCatch && (u.componentDidCatch(n), t = u.__d), t) return l.__h = o, u.__E = u;
	    } catch (l) {
	      n = l;
	    }

	    throw n;
	  },
	  __v: 0
	}, d.prototype.setState = function (n, l) {
	  var u;
	  u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof n && (n = n(s({}, u), this.props)), n && s(u, n), null != n && this.__v && (l && this.__h.push(l), k(this));
	}, d.prototype.forceUpdate = function (n) {
	  this.__v && (this.__e = !0, n && this.__h.push(n), k(this));
	}, d.prototype.render = p, u = [], i = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, g.__r = 0, o = f, r = 0;

	// MODULE: src/constants.ts
	const DevtoolsToClient = "preact-devtools-to-client";
	const PageHookName = "preact-page-hook";
	var Status;

	(function (Status) {
	  Status["Disconnected"] = "disconnected";
	  Status["Connected"] = "connected";
	  Status["Pending"] = "pending";
	})(Status || (Status = {}));

	const PROFILE_RELOAD = "preact-devtools_profile-and-reload";
	const STATS_RELOAD = "preact-devtools_stats-and-reload";
	var HookType;

	(function (HookType) {
	  HookType[HookType["useState"] = 1] = "useState";
	  HookType[HookType["useReducer"] = 2] = "useReducer";
	  HookType[HookType["useEffect"] = 3] = "useEffect";
	  HookType[HookType["useLayoutEffect"] = 4] = "useLayoutEffect";
	  HookType[HookType["useRef"] = 5] = "useRef";
	  HookType[HookType["useImperativeHandle"] = 6] = "useImperativeHandle";
	  HookType[HookType["useMemo"] = 7] = "useMemo";
	  HookType[HookType["useCallback"] = 8] = "useCallback";
	  HookType[HookType["useContext"] = 9] = "useContext";
	  HookType[HookType["useErrorBoundary"] = 10] = "useErrorBoundary";
	  HookType[HookType["useDebugValue"] = 11] = "useDebugValue";
	  HookType[HookType["custom"] = 99] = "custom";
	  HookType[HookType["devtoolsParent"] = 9999] = "devtoolsParent";
	})(HookType || (HookType = {}));

	var NodeType;

	(function (NodeType) {
	  NodeType[NodeType["Element"] = 1] = "Element";
	  NodeType[NodeType["Text"] = 3] = "Text";
	  NodeType[NodeType["CData"] = 4] = "CData";
	  NodeType[NodeType["XMLProcessingInstruction"] = 7] = "XMLProcessingInstruction";
	  NodeType[NodeType["Comment"] = 8] = "Comment";
	  NodeType[NodeType["Document"] = 9] = "Document";
	  NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
	  NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
	})(NodeType || (NodeType = {}));

	// MODULE: src/adapter/dom.ts
	function getNearestElement(dom) {
	  return dom.nodeType === NodeType.Text ? dom.parentNode : dom;
	}
	function px2Int(input) {
	  return input ? +input.replace(/px/, "") : 0;
	}

	function getBoundsState(rect) {
	  return {
	    top: rect.top + window.pageYOffset < window.scrollY,
	    bottom: rect.top + rect.height > window.innerHeight + scrollY,
	    left: rect.left + window.pageXOffset < window.scrollX,
	    right: rect.left + rect.width > window.scrollX + window.innerWidth
	  };
	}

	function measureNode(dom) {
	  const s = window.getComputedStyle(dom);
	  const r = dom.getBoundingClientRect();
	  const top = r.top + window.pageYOffset;
	  const left = r.left + window.pageXOffset;
	  return {
	    top,
	    left,
	    bounds: getBoundsState(r),
	    boxSizing: s.boxSizing,
	    // Round to at most 2 decimals. This is not 100% accurate,
	    // but good enough for our use case
	    width: Math.round(r.width * 100) / 100,
	    height: Math.round(r.height * 100) / 100,
	    marginTop: px2Int(s.marginTop),
	    marginRight: px2Int(s.marginRight),
	    marginBottom: px2Int(s.marginBottom),
	    marginLeft: px2Int(s.marginLeft),
	    borderTop: px2Int(s.borderTopWidth),
	    borderRight: px2Int(s.borderRightWidth),
	    borderBottom: px2Int(s.borderBottomWidth),
	    borderLeft: px2Int(s.borderLeftWidth),
	    paddingTop: px2Int(s.paddingTop),
	    paddingRight: px2Int(s.paddingRight),
	    paddingBottom: px2Int(s.paddingBottom),
	    paddingLeft: px2Int(s.paddingLeft)
	  };
	}
	function mergeMeasure(a, b) {
	  const top = Math.min(a.top, b.top);
	  const left = Math.min(a.left, b.left);
	  const height = Math.max(a.top + a.height, b.top + b.height) - top;
	  const width = Math.max(a.left + a.width, b.left + b.width) - left;
	  return {
	    boxSizing: a.boxSizing,
	    top,
	    left,
	    bounds: getBoundsState({
	      height,
	      left,
	      top,
	      width
	    }),
	    width,
	    height,
	    // Reset all margins for combined nodes. There is no
	    // meaningful way to display them.
	    marginTop: 0,
	    marginRight: 0,
	    marginBottom: 0,
	    marginLeft: 0,
	    borderTop: 0,
	    borderRight: 0,
	    borderBottom: 0,
	    borderLeft: 0,
	    paddingTop: 0,
	    paddingRight: 0,
	    paddingBottom: 0,
	    paddingLeft: 0
	  };
	}

	// MODULE: node_modules/htm/dist/htm.module.js
	var n$1 = function (t, s, r, e) {
	  var u;
	  s[0] = 0;

	  for (var h = 1; h < s.length; h++) {
	    var p = s[h++],
	        a = s[h] ? (s[0] |= p ? 1 : 2, r[s[h++]]) : s[++h];
	    3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h]] = a : 6 === p ? e[1][s[++h]] += a + "" : p ? (u = t.apply(a, n$1(t, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h - 2] = 0, s[h] = u)) : e.push(a);
	  }

	  return e;
	},
	    t$1 = new Map();

	function e$1 (s) {
	  var r = t$1.get(this);
	  return r || (r = new Map(), t$1.set(this, r)), (r = n$1(this, r.get(s) || (r.set(s, r = function (n) {
	    for (var t, s, r = 1, e = "", u = "", h = [0], p = function (n) {
	      1 === r && (n || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h.push(0, n, e) : 3 === r && (n || e) ? (h.push(3, n, e), r = 2) : 2 === r && "..." === e && n ? h.push(4, n, 0) : 2 === r && e && !n ? h.push(5, 0, !0, e) : r >= 5 && ((e || !n && 5 === r) && (h.push(r, 0, e, s), r = 6), n && (h.push(r, n, 0, s), r = 6)), e = "";
	    }, a = 0; a < n.length; a++) {
	      a && (1 === r && p(), p(a));

	      for (var l = 0; l < n[a].length; l++) t = n[a][l], 1 === r ? "<" === t ? (p(), h = [h], r = 3) : e += t : 4 === r ? "--" === e && ">" === t ? (r = 1, e = "") : e = t + e[0] : u ? t === u ? u = "" : e += t : '"' === t || "'" === t ? u = t : ">" === t ? (p(), r = 1) : r && ("=" === t ? (r = 5, s = e, e = "") : "/" === t && (r < 5 || ">" === n[a][l + 1]) ? (p(), 3 === r && (h = h[0]), r = h, (h = h[0]).push(2, 0, r), r = 0) : " " === t || "\t" === t || "\n" === t || "\r" === t ? (p(), r = 2) : e += t), 3 === r && "!--" === e && (r = 4, h = h[0]);
	    }

	    return p(), h;
	  }(s)), r), arguments, [])).length > 1 ? r : r[0];
	}

	// MODULE: node_modules/htm/preact/index.module.js
	var m$1 = e$1.bind(v);

	var s$1 = {"root":"Highlighter-module_root__2IWf3","content":"Highlighter-module_content__31vgH","border":"Highlighter-module_border__1zhjb","margin":"Highlighter-module_margin__3NR2g","label":"Highlighter-module_label__1WN1a","value":"Highlighter-module_value__TLDi2","footer":"Highlighter-module_footer__2oVNw","fixed":"Highlighter-module_fixed__2ebe8","fixedLeft":"Highlighter-module_fixedLeft__3457P","fixedTop":"Highlighter-module_fixedTop__19NJY","fixedRight":"Highlighter-module_fixedRight__29Rt7","fixedBottom":"Highlighter-module_fixedBottom__CHJaR","outerContainer":"Highlighter-module_outerContainer__3UQ3c"};

	// MODULE: src/view/components/Highlighter.tsx
	function css2Border(top, right, bottom, left) {
	  return `
		border-top-width: ${top}px;
		border-right-width: ${right}px;
		border-bottom-width: ${bottom}px;
		border-left-width: ${left}px;
	`;
	}
	const style = s$1;
	function Highlighter(props) {
	  const {
	    width,
	    height,
	    boxSizing,
	    top,
	    left,
	    bounds
	  } = props;
	  const isOutOfBounds = bounds.bottom || bounds.left || bounds.right || bounds.top;
	  return m$1`<div class=${s$1.root} data-testid="highlight" style=${`top: ${top}px; left: ${left}px;`}><div class=${s$1.margin} style=${`width: ${width}px; height: ${height}px; ${css2Border(props.marginTop, props.marginRight, props.marginBottom, props.marginLeft)}`}><div class=${s$1.border} style=${css2Border(props.borderTop, props.borderRight, props.borderBottom, props.borderLeft)}><div class=${s$1.content} style=${`${css2Border(props.paddingTop, props.paddingRight, props.paddingBottom, props.paddingLeft)} ${boxSizing === "content-box" ? `height: calc(100% - ${props.paddingTop + props.paddingBottom}px); width: calc(100% - ${props.paddingLeft + props.paddingRight}px);` : ""}`}/></div></div><span class=${`${s$1.footer} ${isOutOfBounds ? s$1.fixed : ""} ${bounds.left && !bounds.right ? s$1.fixedLeft : ""} ${bounds.right ? s$1.fixedRight : ""} ${bounds.top && !bounds.bottom ? s$1.fixedTop : ""}  ${bounds.bottom ? s$1.fixedBottom : ""}`}><span class=${s$1.label}>${props.label}</span> | <span class=${s$1.value}>${width}px</span> × <span class=${s$1.value}>${height}px</span></span></div>`;
	}

	// MODULE: src/adapter/adapter/highlight.ts
	/**
	 * This module is responsible for displaying the transparent element overlay
	 * inside the user's web page.
	 */

	function createHightlighter(getRendererByVnodeId) {
	  /**
	   * Reference to the DOM element that we'll render the selection highlighter
	   * into. We'll cache it so that we don't unnecessarily re-create it when the
	   * hover state changes. We only destroy this elment once the user stops
	   * hovering a node in the tree.
	   */
	  let highlightRef = null;

	  function destroyHighlight() {
	    if (highlightRef) {
	      document.body.removeChild(highlightRef);
	    }

	    highlightRef = null;
	  }

	  function highlight(id) {
	    const renderer = getRendererByVnodeId(id);

	    if (!renderer) {
	      return destroyHighlight();
	    }

	    const vnode = renderer.getVNodeById(id);

	    if (!vnode) {
	      return destroyHighlight();
	    }

	    const dom = renderer.findDomForVNode(id);

	    if (dom != null) {
	      if (highlightRef == null) {
	        highlightRef = document.createElement("div");
	        highlightRef.id = "preact-devtools-highlighter";
	        highlightRef.className = style.outerContainer;
	        document.body.appendChild(highlightRef);
	      } // eslint-disable-next-line prefer-const


	      let [first, last] = dom;
	      if (first === null) return;
	      const node = getNearestElement(first);
	      const nodeEnd = last ? getNearestElement(last) : null;

	      if (node != null) {
	        const label = renderer.getDisplayName(vnode);
	        let size = measureNode(node);

	        if (nodeEnd !== null) {
	          const sizeLast = measureNode(nodeEnd);
	          size = mergeMeasure(size, sizeLast);
	        } // If the current DOM is inside an iframe, the position data
	        // is relative to the content inside the iframe. We need to
	        // add the position of the iframe in the parent document to
	        // display the highlight overlay at the correct place.


	        if (document !== first?.ownerDocument) {
	          let iframe;
	          const iframes = Array.from(document.querySelectorAll("iframe"));

	          for (let i = 0; i < iframes.length; i++) {
	            const w = iframes[i].contentWindow;

	            if (w && w.document === first?.ownerDocument) {
	              iframe = iframes[i];
	              break;
	            }
	          }

	          if (iframe) {
	            const sizeIframe = measureNode(iframe);
	            size.top += sizeIframe.top;
	            size.left += sizeIframe.left;
	          }
	        }

	        let height = size.height;
	        let width = size.width;

	        if (size.boxSizing === "border-box") {
	          height += size.marginTop + size.marginBottom;
	          width += size.marginLeft + size.marginRight;
	        }

	        O(v(Highlighter, {
	          label,
	          ...size,
	          top: size.top - size.marginTop,
	          left: size.left - size.marginLeft,
	          height,
	          width
	        }), highlightRef);
	      }
	    }
	  }

	  return {
	    highlight,
	    destroy: destroyHighlight
	  };
	}

	// MODULE: src/adapter/adapter/filter.ts
	function parseFilters(raw) {
	  const type = new Set();
	  if (raw.type.fragment) type.add("fragment");
	  if (raw.type.dom) type.add("dom");
	  if (raw.type.hoc) type.add("hoc");
	  return {
	    regex: raw.regex.filter(x => x.enabled).map(x => new RegExp(x.value, "gi")),
	    type
	  };
	}

	// MODULE: src/adapter/adapter/adapter.ts
	function createAdapter(port, renderers) {
	  const {
	    listen,
	    send
	  } = port;

	  const forAll = fn => {
	    for (const r of renderers.values()) {
	      fn(r);
	    }
	  };

	  const highlight = createHightlighter(id => getRendererByVNodeId(renderers, id));

	  const inspect = id => {
	    const data = getRendererByVNodeId(renderers, id)?.inspect(id);

	    if (data) {
	      send("inspect-result", data);
	    }
	  };

	  const picker = createPicker(window, renderers, id => {
	    highlight.highlight(id);

	    if (id > -1) {
	      inspect(id);
	      send("select-node", id);
	    }
	  }, () => {
	    send("stop-picker", null);
	    highlight.destroy();
	  });
	  listen("start-picker", () => picker.start());
	  listen("stop-picker", () => picker.stop());
	  listen("copy", value => {
	    try {
	      const data = JSON.stringify(value, null, 2);
	      copyToClipboard(data);
	    } catch (err) {
	      // eslint-disable-next-line no-console
	      console.log(err);
	    }
	  });
	  listen("inspect", id => {
	    if (id === null) return;
	    const res = getRendererByVNodeId(renderers, id)?.findDomForVNode(id);

	    if (res && res.length > 0) {
	      window.__PREACT_DEVTOOLS__.$0 = res[0];
	    }

	    inspect(id);
	  });
	  listen("log", e => {
	    getRendererByVNodeId(renderers, e.id)?.log(e.id, e.children);
	  });
	  listen("highlight", id => {
	    if (id == null) highlight.destroy();else highlight.highlight(id);
	  });
	  listen("disconnect", () => {
	    // The devtools disconnected, clear any stateful
	    // ui elements we may be displaying.
	    highlight.destroy();
	  });

	  const update = data => {
	    const {
	      id,
	      type,
	      path,
	      value
	    } = data;
	    getRendererByVNodeId(renderers, id)?.update(id, type, path.split(".").slice(1), value); // Notify all frontends that something changed

	    inspect(id);
	  };

	  listen("update-prop", data => update({ ...data,
	    type: "props"
	  }));
	  listen("update-state", data => update({ ...data,
	    type: "state"
	  }));
	  listen("update-context", data => update({ ...data,
	    type: "context"
	  }));
	  listen("update-hook", data => {
	    if (!data.meta) return;
	    getRendererByVNodeId(renderers, data.id)?.updateHook?.(data.id, data.meta.index, data.value);
	  });
	  listen("update-filter", data => {
	    const filters = parseFilters(data);
	    forAll(r => r.applyFilters(filters));
	  });
	  listen("refresh", () => forAll(r => r.refresh?.())); // Profiler

	  listen("start-profiling", options => forAll(r => r.startProfiling?.(options)));
	  listen("stop-profiling", () => forAll(r => r.stopProfiling?.()));
	  listen("reload-and-profile", options => {
	    window.localStorage.setItem(PROFILE_RELOAD, JSON.stringify(options));

	    try {
	      window.location.reload();
	    } catch (err) {
	      // eslint-disable-next-line no-console
	      console.error("Preact Devtools was not able to reload the current page."); // eslint-disable-next-line no-console

	      console.log(err);
	    }
	  }); // Stats

	  listen("start-stats-recording", () => forAll(r => r.startRecordStats?.()));
	  listen("stop-stats-recording", () => forAll(r => r.stopRecordStats?.()));
	  listen("reload-and-record-stats", () => {
	    window.localStorage.setItem(STATS_RELOAD, "true");

	    try {
	      window.location.reload();
	    } catch (err) {
	      // eslint-disable-next-line no-console
	      console.error("Preact Devtools was not able to reload the current page."); // eslint-disable-next-line no-console

	      console.log(err);
	    }
	  });
	  listen("start-highlight-updates", () => {
	    forAll(r => r.startHighlightUpdates?.());
	  });
	  listen("stop-highlight-updates", () => {
	    forAll(r => r.stopHighlightUpdates?.());
	  });
	  listen("load-host-selection", () => {
	    const hook = window.__PREACT_DEVTOOLS__;
	    const selected = hook.$0;

	    if (selected) {
	      forAll(r => {
	        const id = r.findVNodeIdForDom(selected);

	        if (id > -1) {
	          send("select-node", id);
	        }
	      });
	    }
	  });
	  listen("view-source", id => {
	    const vnode = getRendererByVNodeId(renderers, id)?.getVNodeById(id);
	    const hook = window.__PREACT_DEVTOOLS__;

	    if (vnode && typeof vnode.type === "function") {
	      const {
	        type
	      } = vnode;
	      hook.$type = type && type.prototype && type.prototype.render ? type.prototype.render : type;
	    } else {
	      hook.$type = null;
	    }
	  });
	  listen("suspend", data => {
	    getRendererByVNodeId(renderers, data.id)?.suspend?.(data.id, data.active);
	  });
	}

	// MODULE: src/adapter/string-table.ts
	/**
	 * The string table holds a mapping of strings to ids. This saves a lot of space
	 * in messaging because we can only need to declare a string once and can later
	 * refer to its id. This is especially true for component or element names which
	 * expectedoccur multiple times.
	 */

	/**
	 * Convert a string to an id. Works similar to a gzip dictionary.
	 */
	function getStringId(table, input) {
	  if (input === null) return 0;

	  if (!table.has(input)) {
	    table.set("" + input, table.size + 1);
	  }

	  return table.get(input);
	} // TODO: Use a proper LRU cache?

	const encoded = new Map();

	const toCodePoint = s => s.codePointAt(0) || 124; // "|"" symbol;

	/**
	 * Convert a string to an array of codepoints
	 */


	function encode(input) {
	  if (!encoded.has(input)) {
	    encoded.set(input, input.split("").map(toCodePoint));
	  }

	  return encoded.get(input);
	}
	/**
	 * Convert string table to something the extension understands
	 * @param {import('./devtools').AdapterState["stringTable"]} table
	 * @returns {number[]}
	 */

	function flushTable(table) {
	  const ops = [0];
	  table.forEach((_, k) => {
	    ops[0] += k.length + 1;
	    ops.push(k.length, ...encode(k));
	  });
	  return ops;
	}

	// MODULE: src/view/store/types.ts
	var DevNodeType;

	(function (DevNodeType) {
	  /**
	   * Groups are virtual nodes inserted by the devtools
	   * to make certain operations easier. They are not
	   * created by Preact.
	   */
	  DevNodeType[DevNodeType["Group"] = 0] = "Group";
	  DevNodeType[DevNodeType["Element"] = 1] = "Element";
	  DevNodeType[DevNodeType["ClassComponent"] = 2] = "ClassComponent";
	  DevNodeType[DevNodeType["FunctionComponent"] = 3] = "FunctionComponent";
	  DevNodeType[DevNodeType["ForwardRef"] = 4] = "ForwardRef";
	  DevNodeType[DevNodeType["Memo"] = 5] = "Memo";
	  DevNodeType[DevNodeType["Suspense"] = 6] = "Suspense";
	  DevNodeType[DevNodeType["Context"] = 7] = "Context";
	  DevNodeType[DevNodeType["Consumer"] = 8] = "Consumer";
	})(DevNodeType || (DevNodeType = {}));

	var Panel;

	(function (Panel) {
	  Panel["ELEMENTS"] = "ELEMENTS";
	  Panel["PROFILER"] = "PROFILER";
	  Panel["SETTINGS"] = "SETTINGS";
	  Panel["STATISTICS"] = "STATISTICS";
	})(Panel || (Panel = {}));

	// MODULE: src/view/components/profiler/data/commits.ts
	/**
	 * The Flamegraph supports these distinct
	 * view modes.
	 */

	var FlamegraphType;

	(function (FlamegraphType) {
	  FlamegraphType["FLAMEGRAPH"] = "FLAMEGRAPH";
	  FlamegraphType["RANKED"] = "RANKED";
	})(FlamegraphType || (FlamegraphType = {}));

	// MODULE: src/adapter/10/stats.ts
	var DiffType;

	(function (DiffType) {
	  DiffType[DiffType["UNKNOWN"] = 0] = "UNKNOWN";
	  DiffType[DiffType["KEYED"] = 1] = "KEYED";
	  DiffType[DiffType["UNKEYED"] = 2] = "UNKEYED";
	  DiffType[DiffType["MIXED"] = 3] = "MIXED";
	})(DiffType || (DiffType = {}));

	function getDiffType(child, prev) {
	  if (prev !== DiffType.MIXED) {
	    if (child.key != null) {
	      return prev === DiffType.UNKNOWN || prev === DiffType.KEYED ? DiffType.KEYED : DiffType.MIXED;
	    } else {
	      return prev === DiffType.UNKNOWN || prev === DiffType.UNKEYED ? DiffType.UNKEYED : DiffType.MIXED;
	    }
	  }

	  return prev;
	}
	function updateDiffStats(stats, diff, childCount) {
	  if (diff === DiffType.KEYED) {
	    stats.keyed.total++;
	    stats.keyed.children.push(childCount);
	  } else if (diff === DiffType.UNKEYED) {
	    stats.unkeyed.total++;
	    stats.unkeyed.children.push(childCount);
	  } else if (diff === DiffType.MIXED) {
	    stats.mixed.total++;
	    stats.mixed.children.push(childCount);
	  }
	} // TODO: store update depth

	function createStats() {
	  return {
	    roots: {
	      total: 0,
	      children: []
	    },
	    classComponents: {
	      total: 0,
	      children: []
	    },
	    functionComponents: {
	      total: 0,
	      children: []
	    },
	    fragments: {
	      total: 0,
	      children: []
	    },
	    forwardRef: {
	      total: 0,
	      children: []
	    },
	    memo: {
	      total: 0,
	      children: []
	    },
	    suspense: {
	      total: 0,
	      children: []
	    },
	    elements: {
	      total: 0,
	      children: []
	    },
	    text: 0,
	    keyed: {
	      total: 0,
	      children: []
	    },
	    unkeyed: {
	      total: 0,
	      children: []
	    },
	    mixed: {
	      total: 0,
	      children: []
	    },
	    mounts: 0,
	    unmounts: 0,
	    updates: 0,
	    singleChildType: {
	      roots: 0,
	      classComponents: 0,
	      functionComponents: 0,
	      fragments: 0,
	      forwardRef: 0,
	      memo: 0,
	      suspense: 0,
	      elements: 0,
	      text: 0
	    }
	  };
	}
	function recordComponentStats(config, stats, vnode, children) {
	  const childrenLen = children.length;
	  const type = vnode.type;

	  if (typeof type === "function") {
	    if (type.prototype && type.prototype.render) {
	      stats.classComponents.total++;
	      stats.classComponents.children.push(childrenLen);
	    } else {
	      if (type === config.Fragment) {
	        stats.fragments.total++;
	        stats.fragments.children.push(childrenLen);
	      }

	      stats.functionComponents.total++;
	      stats.functionComponents.children.push(childrenLen);
	    }
	  } else if (type !== null) {
	    stats.elements.total++;
	    stats.elements.children.push(childrenLen);
	  } else {
	    stats.text++;
	  }

	  const devType = getDevtoolsType(vnode);

	  switch (devType) {
	    case DevNodeType.ForwardRef:
	      stats.forwardRef.total++;
	      stats.forwardRef.children.push(childrenLen);
	      break;

	    case DevNodeType.Memo:
	      stats.memo.total++;
	      stats.memo.children.push(childrenLen);
	      break;

	    case DevNodeType.Suspense:
	      stats.suspense.total++;
	      stats.suspense.children.push(childrenLen);
	      break;
	  }

	  if (childrenLen === 1) {
	    const child = children[0];

	    if (child != null) {
	      if (typeof child.type === "function") {
	        if (child.type.prototype && child.type.prototype.render) {
	          stats.singleChildType.classComponents++;
	        } else {
	          if (child.type === config.Fragment) {
	            stats.singleChildType.fragments++;
	          } else {
	            const childType = getDevtoolsType(child);

	            switch (childType) {
	              case DevNodeType.ForwardRef:
	                stats.singleChildType.forwardRef++;
	                break;

	              case DevNodeType.Memo:
	                stats.singleChildType.memo++;
	                break;

	              case DevNodeType.Suspense:
	                stats.singleChildType.suspense++;
	                break;
	            }
	          }

	          stats.singleChildType.functionComponents++;
	        }
	      } else if (child.type !== null) {
	        stats.singleChildType.elements++;
	      } else {
	        stats.singleChildType.text++;
	      }
	    }
	  }
	}
	function stats2ops(rootId, stats) {
	  return [MsgTypes.COMMIT_STATS, rootId, stats.roots.total, stats.roots.children.length, ...stats.roots.children, stats.classComponents.total, stats.classComponents.children.length, ...stats.classComponents.children, stats.functionComponents.total, stats.functionComponents.children.length, ...stats.functionComponents.children, stats.fragments.total, stats.fragments.children.length, ...stats.fragments.children, stats.forwardRef.total, stats.forwardRef.children.length, ...stats.forwardRef.children, stats.memo.total, stats.memo.children.length, ...stats.memo.children, stats.suspense.total, stats.suspense.children.length, ...stats.suspense.children, stats.elements.total, stats.elements.children.length, ...stats.elements.children, stats.text, stats.keyed.total, stats.keyed.children.length, ...stats.keyed.children, stats.unkeyed.total, stats.unkeyed.children.length, ...stats.unkeyed.children, stats.mixed.total, stats.mixed.children.length, ...stats.mixed.children, stats.mounts, stats.updates, stats.unmounts, // Single child types
	  stats.singleChildType.roots, stats.singleChildType.classComponents, stats.singleChildType.functionComponents, stats.singleChildType.fragments, stats.singleChildType.forwardRef, stats.singleChildType.memo, stats.singleChildType.suspense, stats.singleChildType.elements, stats.singleChildType.text];
	}

	// MODULE: src/adapter/events/events.ts
	var MsgTypes;

	(function (MsgTypes) {
	  MsgTypes[MsgTypes["ADD_ROOT"] = 1] = "ADD_ROOT";
	  MsgTypes[MsgTypes["ADD_VNODE"] = 2] = "ADD_VNODE";
	  MsgTypes[MsgTypes["REMOVE_VNODE"] = 3] = "REMOVE_VNODE";
	  MsgTypes[MsgTypes["UPDATE_VNODE_TIMINGS"] = 4] = "UPDATE_VNODE_TIMINGS";
	  MsgTypes[MsgTypes["REORDER_CHILDREN"] = 5] = "REORDER_CHILDREN";
	  MsgTypes[MsgTypes["RENDER_REASON"] = 6] = "RENDER_REASON";
	  MsgTypes[MsgTypes["COMMIT_STATS"] = 7] = "COMMIT_STATS";
	  MsgTypes[MsgTypes["HOC_NODES"] = 8] = "HOC_NODES";
	})(MsgTypes || (MsgTypes = {}));
	/**
	 * Collect all relevant data from a commit and convert it to a message
	 * the detools can understand
	 */


	function flush(commit) {
	  const {
	    rootId,
	    unmountIds,
	    operations,
	    strings,
	    stats
	  } = commit;
	  if (unmountIds.length === 0 && operations.length === 0) return;
	  const msg = [rootId, ...flushTable(strings)];

	  if (unmountIds.length > 0) {
	    msg.push(MsgTypes.REMOVE_VNODE, unmountIds.length, ...unmountIds);
	  }

	  msg.push(...operations);

	  if (stats !== null) {
	    msg.push(...stats2ops(rootId, stats));
	  }

	  return {
	    type: "operation_v2",
	    data: msg
	  };
	}

	// MODULE: src/adapter/10/vnode.ts

	/**
	 * Get the direct parent of a `vnode`
	 */

	function getVNodeParent(vnode) {
	  return vnode._parent || vnode.__ || // Older Preact X versions used `__p`
	  vnode.__p || null;
	}
	/**
	 * Check if a `vnode` is the root of a tree
	 */

	function isRoot(vnode, config) {
	  return getVNodeParent(vnode) == null && vnode.type === config.Fragment;
	}
	/**
	 * Return the component instance of a `vnode` or `hookState`
	 */

	function getComponent(node) {
	  return node._component || node.__c || null;
	}
	/**
	 * Get a `vnode`'s _dom reference.
	 */

	function getDom(vnode) {
	  return vnode._dom || vnode.__e || null;
	}
	function hasDom(x) {
	  return x != null && ("_dom" in x || "__e" in x);
	}
	/**
	 * Check if a `vnode` represents a `Suspense` component
	 */

	function isSuspenseVNode(vnode) {
	  const c = getComponent(vnode); // FYI: Mangling of `_childDidSuspend` is not stable in Preact < 10.3.0

	  return c != null && !!(c._childDidSuspend || c.__c);
	}
	/**
	 * Get the internal hooks state of a component
	 */

	function getComponentHooks(c) {
	  return c.__hooks || c.__H || null;
	}
	function getStatefulHooks(c) {
	  const hooks = getComponentHooks(c);
	  return hooks !== null ? hooks._list || hooks.__ || hooks.i || // Preact 10.1.0
	  null : null;
	}
	function isUseReducerOrState(hookState) {
	  return !!hookState._component || !!hookState.__c;
	}
	function getStatefulHookValue(hookState) {
	  if (hookState !== null) {
	    const value = hookState._value || hookState.__ || null;

	    if (value !== null && Array.isArray(value)) {
	      return value[0];
	    }
	  }

	  return null;
	}
	function getHookState(c, index, type) {
	  const list = getStatefulHooks(c);

	  if (list && list[index]) {
	    // useContext
	    if (type === HookType.useContext) {
	      const context = list[index]._context || list[index].__c || list[index].c;
	      const provider = c.context[context._id] || c.context[context.__c];
	      return provider ? provider.props.value : context._defaultValue || context.__;
	    }

	    const value = list[index]._value || list[index].__;

	    if (type === HookType.useRef) {
	      return value.current;
	    } else if (type === HookType.useErrorBoundary && !value) {
	      return "__preact_empty__";
	    }

	    return value;
	  }

	  return [];
	}
	/**
	 * Get the diffed children of a `vnode`
	 */

	function getActualChildren(vnode) {
	  return vnode._children || vnode.__k || [];
	} // End Mangle accessors
	/**
	 * Get the ancestor component that rendered the current vnode
	 */

	function getAncestor(vnode) {
	  let next = vnode;

	  while ((next = getVNodeParent(next)) != null) {
	    return next;
	  }

	  return null;
	}
	/**
	 * Get human readable name of the component/dom element
	 */

	function getDisplayName(vnode, config) {
	  const {
	    type
	  } = vnode;
	  if (type === config.Fragment) return "Fragment";else if (typeof type === "function") {
	    // Context is a special case :((
	    // See: https://reactjs.org/docs/context.html#contextdisplayname
	    const c = getComponent(vnode);

	    if (c !== null) {
	      // Consumer
	      if (c.constructor) {
	        const ct = c.constructor.contextType;

	        if (ct && ct.Consumer === type && ct.displayName) {
	          return `${ct.displayName}.Consumer`;
	        }
	      } // Provider


	      if (c.sub) {
	        const ctx = type._contextRef || type.__;

	        if (ctx && ctx.displayName) {
	          return `${ctx.displayName}.Provider`;
	        }
	      }

	      if (isSuspenseVNode(vnode)) {
	        return "Suspense";
	      } // Preact 10.4.1 uses a raw Component as a child for Suspense
	      // by doing `createElement(Component, ...);`


	      if (type === config.Component) {
	        return "Component";
	      }
	    }

	    return type.displayName || type.name || "Anonymous";
	  } else if (typeof type === "string") return type;
	  return "#text";
	}
	function getEndTime(vnode) {
	  return vnode.endTime || 0;
	}
	function getStartTime(vnode) {
	  return vnode.startTime || 0;
	}
	function getNextState(c) {
	  return c._nextState || c.__s || null;
	}
	function setNextState(c, value) {
	  return c._nextState = c.__s = value;
	}
	function getSuspenseStateKey(c) {
	  if ("_suspended" in c.state) {
	    return "_suspended";
	  } else if ("__e" in c.state) {
	    return "__e";
	  } // This is a bit whacky, but property name mangling is unsafe in
	  // Preact <10.4.9


	  const keys = Object.keys(c.state);

	  if (keys.length > 0) {
	    return keys[0];
	  }

	  return null;
	}
	function createSuspenseState(vnode, suspended) {
	  const c = getComponent(vnode);
	  const key = getSuspenseStateKey(c);

	  if (c && key) {
	    return {
	      [key]: suspended
	    };
	  }

	  return {};
	}

	// MODULE: src/adapter/10/filter.ts
	function shouldFilter(vnode, filters, config) {
	  // Filter text nodes by default. They are too tricky to match
	  // with the previous one...
	  if (vnode.type == null) return true;

	  if (typeof vnode.type === "function") {
	    if (vnode.type === config.Fragment && filters.type.has("fragment")) {
	      const parent = getVNodeParent(vnode); // Only filter non-root nodes

	      if (parent != null) return true;
	      return false;
	    }
	  } else if ((typeof vnode.type === "string" || vnode.type === null) && filters.type.has("dom")) {
	    return true;
	  }

	  if (filters.regex.length > 0) {
	    const name = getDisplayName(vnode, config);
	    return filters.regex.some(r => {
	      // Regexes with a global flag are stateful in JS :((
	      r.lastIndex = 0;
	      return r.test(name);
	    });
	  }

	  return false;
	}

	// MODULE: src/adapter/10/utils.ts
	function traverse(vnode, fn) {
	  fn(vnode);
	  const children = getActualChildren(vnode);

	  for (let i = 0; i < children.length; i++) {
	    const child = children[i];

	    if (child != null) {
	      traverse(child, fn);
	      fn(child);
	    }
	  }
	}
	function jsonify(data, getVNode, seen) {
	  // Break out of circular references
	  if (seen.has(data)) {
	    return "[[Circular]]";
	  }

	  if (data !== null && typeof data === "object") {
	    seen.add(data);
	  }

	  if (typeof Element !== "undefined" && data instanceof Element) {
	    return {
	      type: "html",
	      name: `<${data.localName} />`
	    };
	  }

	  const vnode = getVNode(data);
	  if (vnode != null) return vnode;

	  if (Array.isArray(data)) {
	    return data.map(x => jsonify(x, getVNode, seen));
	  }

	  switch (typeof data) {
	    case "string":
	      return data.length > 300 ? data.slice(300) : data;

	    case "function":
	      {
	        return {
	          type: "function",
	          name: data.displayName || data.name || "anonymous"
	        };
	      }

	    case "symbol":
	      {
	        return {
	          type: "symbol",
	          name: data.toString()
	        };
	      }

	    case "object":
	      {
	        if (data === null) return null;else if (data instanceof window.Blob) {
	          return {
	            type: "blob",
	            name: "Blob"
	          };
	        } else if (data instanceof Set) {
	          return {
	            type: "set",
	            name: "Set",
	            entries: Array.from(data.values()).map(item => jsonify(item, getVNode, seen))
	          };
	        } else if (data instanceof Map) {
	          return {
	            type: "map",
	            name: "Map",
	            entries: Array.from(data.entries()).map(entry => {
	              return [jsonify(entry[0], getVNode, seen), jsonify(entry[1], getVNode, seen)];
	            })
	          };
	        }
	        const out = { ...data
	        };
	        Object.keys(out).forEach(key => {
	          out[key] = jsonify(out[key], getVNode, seen);
	        });
	        return out;
	      }

	    default:
	      return data;
	  }
	} // eslint-disable-next-line @typescript-eslint/ban-types

	function serialize(config, data) {
	  return jsonify(data, node => serializeVNode(node, config), new Set());
	}
	function isEditable(x) {
	  switch (typeof x) {
	    case "string":
	    case "number":
	    case "boolean":
	      return true;

	    default:
	      return false;
	  }
	} // eslint-disable-next-line @typescript-eslint/ban-types

	function cleanProps(props) {
	  if (typeof props === "string" || !props) return null;
	  const out = {};

	  for (const key in props) {
	    if (key === "__source" || key === "__self") continue;
	    out[key] = props[key];
	  }

	  if (!Object.keys(out).length) return null;
	  return out;
	}
	const reg = /__cC\d+/;
	function cleanContext(context) {
	  const res = {};

	  for (const key in context) {
	    if (reg.test(key)) continue;
	    res[key] = context[key];
	  }

	  if (Object.keys(res).length == 0) return null;
	  return res;
	}

	function clone(value) {
	  if (Array.isArray(value)) return value.slice();

	  if (value !== null && typeof value === "object") {
	    if (value instanceof Set) return new Set(value);
	    if (value instanceof Map) return new Map(value);
	    return { ...value
	    };
	  }

	  return value;
	}
	/**
	 * Deeply set a property and clone all parent objects/arrays
	 */


	function setInCopy(obj, path, value, idx = 0) {
	  if (idx >= path.length) return value;
	  const updated = clone(obj);

	  if (obj instanceof Set) {
	    const oldValue = Array.from(obj)[+path[idx]];
	    updated.delete(oldValue);
	    updated.add(setInCopy(oldValue, path, value, idx + 1));
	  } else if (obj instanceof Map) {
	    const oldEntry = Array.from(obj)[+path[idx]];
	    const isKey = +path[idx + 1] === 0;

	    if (isKey) {
	      updated.delete(oldEntry[0]);
	      updated.set(setInCopy(oldEntry[0], path, value, idx + 2), oldEntry[1]);
	    } else {
	      updated.delete(oldEntry[0]);
	      updated.set(oldEntry[0], setInCopy(oldEntry[1], path, value, idx + 2));
	    }
	  } else {
	    const key = path[idx];
	    updated[key] = setInCopy(obj[key], path, value, idx + 1);
	  }

	  return updated;
	}
	/**
	 * Deeply mutate a property by walking down an array of property keys
	 */

	function setIn(obj, path, value) {
	  const last = path.pop();
	  const parent = path.reduce((acc, attr) => acc ? acc[attr] : null, obj);

	  if (parent && last) {
	    parent[last] = value;
	  }
	}

	// MODULE: src/adapter/10/IdMapper.ts

	function getInstance(vnode) {
	  // For components we use the instance to check refs, otherwise
	  // we'll use a dom node
	  if (typeof vnode.type === "function") {
	    return getComponent(vnode);
	  }

	  return getDom(vnode);
	}

	function createIdMappingState(initial) {
	  return {
	    instToId: new Map(),
	    idToVNode: new Map(),
	    idToInst: new Map(),
	    nextId: initial
	  };
	}
	function getVNodeById(state, id) {
	  return state.idToVNode.get(id) || null;
	}
	function hasVNodeId(state, vnode) {
	  return vnode != null && state.instToId.has(getInstance(vnode));
	}
	function getVNodeId(state, vnode) {
	  if (vnode == null) return -1;
	  const inst = getInstance(vnode);
	  return state.instToId.get(inst) || -1;
	}
	function updateVNodeId(state, id, vnode) {
	  const inst = getInstance(vnode);
	  state.idToInst.set(id, inst);
	  state.idToVNode.set(id, vnode);
	}
	function removeVNodeId(state, vnode) {
	  if (hasVNodeId(state, vnode)) {
	    const id = getVNodeId(state, vnode);
	    state.idToInst.delete(id);
	    state.idToVNode.delete(id);
	  }

	  const inst = getInstance(vnode);
	  state.instToId.delete(inst);
	}
	function createVNodeId(state, vnode) {
	  const id = state.nextId++;
	  const inst = getInstance(vnode);
	  state.instToId.set(inst, id);
	  state.idToInst.set(id, inst);
	  state.idToVNode.set(id, vnode);
	  return id;
	}
	function hasId(state, id) {
	  return state.idToInst.has(id);
	}

	// MODULE: src/adapter/10/renderer/logVNode.ts
	/**
	 * Pretty print a `VNode` to the browser console. This can be triggered
	 * by clicking a button in the devtools ui.
	 */

	function logVNode(ids, config, id, children) {
	  const vnode = getVNodeById(ids, id);

	  if (vnode == null) {
	    // eslint-disable-next-line no-console
	    console.warn(`Could not find vnode with id ${id}`);
	    return;
	  }

	  const display = getDisplayName(vnode, config);
	  const name = display === "#text" ? display : `<${display || "Component"} />`;
	  /* eslint-disable no-console */

	  console.group(`LOG %c${name}`, "color: #ea88fd; font-weight: normal");
	  console.log("props:", vnode.props);
	  const c = getComponent(vnode);

	  if (c != null) {
	    console.log("state:", c.state);
	  }

	  console.log("vnode:", vnode);
	  console.log("devtools id:", id);
	  console.log("devtools children:", children);
	  console.groupEnd();
	  /* eslint-enable no-console */
	}

	// MODULE: node_modules/errorstacks/dist/esm/index.js
	function createRawFrame(raw) {
	  return {
	    column: -1,
	    fileName: "",
	    line: -1,
	    name: "",
	    raw: raw,
	    sourceColumn: -1,
	    sourceFileName: "",
	    sourceLine: -1,
	    type: ""
	  };
	}

	var FIREFOX = /([^@]+|^)@(.*):(\d+):(\d+)/;

	function parseFirefox(lines) {
	  return lines.map(function (str) {
	    var match = str.match(FIREFOX);

	    if (!match) {
	      return createRawFrame(str);
	    }

	    var line = match[3] ? +match[3] : -1;
	    var column = match[4] ? +match[4] : -1;
	    var fileName = match[2] ? match[2] : "";
	    return {
	      line: line,
	      column: column,
	      type: match[0] ? "" : "native",
	      fileName: fileName,
	      name: (match[1] || "").trim(),
	      raw: str,
	      sourceColumn: -1,
	      sourceFileName: "",
	      sourceLine: -1
	    };
	  });
	}

	var CHROME_MAPPED = /(.*?):(\d+):(\d+)(\s<-\s(.+):(\d+):(\d+))?/;

	function parseMapped(frame, maybeMapped) {
	  var match = maybeMapped.match(CHROME_MAPPED);

	  if (match) {
	    frame.fileName = match[1];
	    frame.line = +match[2];
	    frame.column = +match[3];
	    if (match[5]) frame.sourceFileName = match[5];
	    if (match[6]) frame.sourceLine = +match[6];
	    if (match[7]) frame.sourceColumn = +match[7];
	  }
	}

	var CHROME_IE_NATIVE_NO_LINE = /^at\s(<.*>)$/;
	var CHROME_IE_NATIVE = /^\s*at\s(<.*>):(\d+):(\d+)$/;
	var CHROME_IE_FUNCTION = /^at\s(.*)\s\((.*)\)$/;
	var CHROME_IE_DETECTOR = /\s*at\s.+/;

	function parseChromeIe(lines) {
	  // Many frameworks mess with error.stack. So we use this check
	  // to find the first line of the actual stack
	  var start = lines.findIndex(function (line) {
	    return CHROME_IE_DETECTOR.test(line);
	  });

	  if (start === -1) {
	    return [];
	  }

	  var frames = [];

	  for (var i = start; i < lines.length; i++) {
	    var str = lines[i].replace(/^\s+|\s+$/g, "");
	    var frame = createRawFrame(lines[i]);
	    var nativeNoLine = str.match(CHROME_IE_NATIVE_NO_LINE);

	    if (nativeNoLine) {
	      frame.fileName = nativeNoLine[1];
	      frame.type = "native";
	      frames.push(frame);
	      continue;
	    }

	    var native = str.match(CHROME_IE_NATIVE);

	    if (native) {
	      frame.fileName = native[1];
	      frame.type = "native";
	      if (native[2]) frame.line = +native[2];
	      if (native[3]) frame.column = +native[3];
	      frames.push(frame);
	      continue;
	    }

	    var withFn = str.match(CHROME_IE_FUNCTION);

	    if (withFn) {
	      frame.name = withFn[1];
	      parseMapped(frame, withFn[2]);
	      frames.push(frame);
	      continue;
	    }

	    frames.push(frame);
	  }

	  return frames;
	}

	function parseStackTrace(stack) {
	  var lines = stack.split("\n").filter(Boolean); // Libraries like node's "assert" module mess with the stack trace by
	  // prepending custom data. So we need to do a precheck, to determine
	  // which browser the trace is coming from.

	  if (lines.some(function (line) {
	    return CHROME_IE_DETECTOR.test(line);
	  })) {
	    return parseChromeIe(lines);
	  }

	  return parseFirefox(lines);
	}

	// MODULE: src/view/components/sidebar/inspect/parseProps.ts
	function parseProps(data, path, limit, depth = 0, name = path, out = new Map()) {
	  if (depth >= limit) {
	    out.set(path, {
	      depth,
	      name,
	      id: path,
	      type: "string",
	      editable: false,
	      value: "…",
	      children: [],
	      meta: null
	    });
	    return out;
	  }

	  if (Array.isArray(data)) {
	    const children = [];
	    out.set(path, {
	      depth,
	      name,
	      id: path,
	      type: "array",
	      editable: false,
	      value: data,
	      children,
	      meta: null
	    });
	    data.forEach((item, i) => {
	      const childPath = `${path}.${i}`;
	      children.push(childPath);
	      parseProps(item, childPath, limit, depth + 1, "" + i, out);
	    });
	  } else if (typeof data === "object") {
	    if (data === null) {
	      out.set(path, {
	        depth,
	        name,
	        id: path,
	        type: "null",
	        editable: false,
	        value: data,
	        children: [],
	        meta: null
	      });
	    } else {
	      const keys = Object.keys(data);
	      const maybeCustom = keys.length === 2;
	      const maybeCollection = keys.length === 3; // Functions are encoded as objects

	      if (maybeCustom && typeof data.name === "string" && data.type === "function") {
	        out.set(path, {
	          depth,
	          name,
	          id: path,
	          type: "function",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        });
	      } else if ( // Same for vnodes
	      maybeCustom && typeof data.name === "string" && data.type === "vnode") {
	        out.set(path, {
	          depth,
	          name,
	          id: path,
	          type: "vnode",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        });
	      } else if ( // Same for Set + Map
	      maybeCollection && typeof data.name === "string" && data.type === "set") {
	        const children = [];
	        const node = {
	          depth,
	          name,
	          id: path,
	          type: "set",
	          editable: false,
	          value: data,
	          children,
	          meta: null
	        };
	        data.entries.forEach((item, i) => {
	          const childPath = `${path}.${i}`;
	          children.push(childPath);
	          parseProps(item, childPath, limit, depth + 1, "" + i, out);
	        });
	        out.set(path, node);
	      } else if ( // Same for Map
	      maybeCollection && typeof data.name === "string" && data.type === "map") {
	        const children = [];
	        const node = {
	          depth,
	          name,
	          id: path,
	          type: "map",
	          editable: false,
	          value: data,
	          children,
	          meta: null
	        };
	        data.entries.forEach((item, i) => {
	          const childPath = `${path}.${i}`;
	          children.push(childPath);
	          parseProps(item, childPath, limit, depth + 1, "" + i, out);
	        });
	        out.set(path, node);
	      } else if ( // Same for Blobs
	      maybeCustom && typeof data.name === "string" && data.type === "blob") {
	        out.set(path, {
	          depth,
	          name,
	          id: path,
	          type: "blob",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        });
	      } else if ( // Same for Symbols
	      maybeCustom && typeof data.name === "string" && data.type === "symbol") {
	        out.set(path, {
	          depth,
	          name,
	          id: path,
	          type: "symbol",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        });
	      } else if ( // Same for HTML elements
	      maybeCustom && typeof data.name === "string" && data.type === "html") {
	        out.set(path, {
	          depth,
	          name,
	          id: path,
	          type: "html",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        });
	      } else {
	        const node = {
	          depth,
	          name,
	          id: path,
	          type: "object",
	          editable: false,
	          value: data,
	          children: [],
	          meta: null
	        };
	        out.set(path, node);
	        Object.keys(data).forEach(key => {
	          const nextPath = `${path}.${key}`;
	          node.children.push(nextPath);
	          parseProps(data[key], nextPath, limit, depth + 1, key, out);
	        });
	        out.set(path, node);
	      }
	    }
	  } else {
	    const type = typeof data;
	    out.set(path, {
	      depth,
	      name,
	      id: path,
	      type: type,
	      editable: type !== "undefined" && data !== "[[Circular]]",
	      value: data,
	      children: [],
	      meta: null
	    });
	  }

	  return out;
	}

	// MODULE: src/adapter/10/renderer/hooks.ts
	let hookLog = [];
	let inspectingHooks = false;
	let ancestorName = "unknown";
	const debugValues = new Map();
	let debugNames = [];
	function addHookName(name) {
	  if (!inspectingHooks) return;
	  debugNames.push(String(name));
	}
	function addDebugValue(value) {
	  if (!inspectingHooks) return;
	  const last = hookLog.pop();
	  const location = last.stack.reverse().slice(0, -1).map(x => x.name === "root" ? x.name : `${x.location}.${x.name}`).join(".");
	  debugValues.set(location, "" + value);
	}
	let ignoreNext = false;
	function addHookStack(type) {
	  if (!inspectingHooks || ignoreNext) {
	    ignoreNext = false;
	    return;
	  } // Ignore next useState call coming from useErrorBoundary


	  if (type === HookType.useErrorBoundary) {
	    ignoreNext = true;
	  } // By default browser limit stack trace length to 10 entries


	  const oldLimit = Error.stackTraceLimit;
	  Error.stackTraceLimit = 1000;
	  const err = new Error();
	  let stack = err.stack ? parseStackTrace(err.stack) : [];
	  const ancestorIdx = stack.findIndex(x => x.name === ancestorName);

	  if (ancestorIdx > -1 && stack.length > 0) {
	    // Remove `addHookStack` + `options._hook` + `getHookState` from stack
	    let trim = type === HookType.useDebugValue ? 2 : 3; // These hooks are implemented with other hooks

	    if (type === HookType.useState || type === HookType.useImperativeHandle || type === HookType.useCallback || type === HookType.useRef) {
	      trim += 1;
	    }

	    stack = stack.slice(trim, ancestorIdx);
	  }

	  const normalized = []; // To easy mappings we'll rotate all positional data.

	  for (let i = 0; i < stack.length; i++) {
	    if (i === stack.length - 1) {
	      normalized.push({
	        name: "root",
	        location: "root"
	      });
	      continue;
	    }

	    const frame = stack[i];
	    const next = stack[i + 1];
	    normalized.push({
	      name: frame.name,
	      location: `${next.fileName.replace(window.origin, "")}:${next.line}:${next.column}`
	    });
	  }

	  hookLog.push({
	    type,
	    stack: normalized
	  }); // Restore original stack trace limit

	  Error.stackTraceLimit = oldLimit;
	}
	function parseHookData(config, data, component, userHookNames) {
	  const tree = new Map();
	  const root = {
	    children: [],
	    depth: 0,
	    name: "root",
	    editable: false,
	    id: "root",
	    type: "object",
	    value: null,
	    meta: null
	  };
	  tree.set("root", root);
	  const out = [root];
	  data.forEach((hook, hookIdx) => {
	    const type = HookType[hook.type];
	    let parentId = "root";

	    for (let i = hook.stack.length - 2; i >= 0; i--) {
	      const frame = hook.stack[i];
	      const isNative = i === 0;
	      const id = `${parentId}.${frame.location}.${frame.name}`;

	      if (!tree.has(id)) {
	        let value = "__preact_empty__";
	        let editable = false;
	        let children = [];
	        let nodeType = "undefined";
	        const depth = hook.stack.length - i - 1;
	        let name = isNative ? type : frame.name;

	        if (userHookNames.length > 0 && (hook.type === HookType.useState || hook.type === HookType.useRef || hook.type === HookType.useMemo || hook.type === HookType.useReducer)) {
	          name = `${name} ${userHookNames.pop()}`;
	        }

	        if (debugValues.has(id)) {
	          value = debugValues.get(id);
	        }

	        let hookValueTree = [];

	        if (isNative) {
	          const s = getHookState(component, hookIdx, hook.type);
	          const rawValue = Array.isArray(s) ? s[0] : s;
	          value = serialize(config, rawValue); // The user should be able to click through the value
	          // properties if the value is an object. We parse it
	          // separately and append it as children to our hook node

	          if (typeof rawValue === "object" && !(rawValue instanceof Element)) {
	            const tree = parseProps(value, id, 7, 0, name);
	            children = tree.get(id).children;
	            hookValueTree = Array.from(tree.values());

	            if (hookValueTree.length > 1) {
	              hookValueTree = hookValueTree.slice(1);
	            }

	            nodeType = hookValueTree[0].type;
	            hookValueTree.forEach(node => {
	              node.id = id + node.id;
	              node.editable = false;
	              node.depth += depth;
	            });
	          }

	          editable = (hook.type === HookType.useState || hook.type === HookType.useReducer) && isEditable(rawValue);
	        }

	        const item = {
	          children,
	          depth,
	          editable,
	          id,
	          name,
	          type: nodeType,
	          meta: isNative ? {
	            index: hookIdx,
	            type
	          } : frame.name,
	          value
	        };
	        tree.set(id, item);
	        out.push(item);

	        if (tree.has(parentId)) {
	          tree.get(parentId).children.push(id);
	        }

	        if (hookValueTree.length) {
	          hookValueTree.forEach(v => {
	            tree.set(v.id, v);
	            out.push(v);
	          });
	        }
	      }

	      parentId = id;
	    }
	  });
	  return out;
	}
	function inspectHooks(config, options, vnode) {
	  inspectingHooks = true;
	  hookLog = [];
	  debugValues.clear();
	  debugNames = [];
	  ancestorName = parseStackTrace(new Error().stack)[0].name;
	  const c = getComponent(vnode);
	  const isClass = vnode.type.prototype && vnode.type.prototype.render; // Disable hook effects

	  options._skipEffects = options.__s = true;
	  const prevConsole = {}; // Temporarily disable all console methods to not confuse users
	  // It sucks that we need to do this :/

	  for (const method in console) {
	    try {
	      prevConsole[method] = console[method];

	      console[method] = () => undefined;
	    } catch (error) {// Ignore errors here
	    }
	  }

	  try {
	    // Call render on a dummy component, so that any possible
	    // state changes or effect are not written to our original
	    // component.
	    const hooks = getComponentHooks(c);
	    const dummy = {
	      props: c.props,
	      context: c.context,
	      state: {},
	      __hooks: hooks,
	      __H: hooks
	    }; // Force preact to reset internal hooks index

	    const renderHook = options._render || options.__r;

	    if (renderHook) {
	      const vnode = v("div", null); // Note: A "div" normally won't have the _component property set,
	      // but we can get away with that for the devtools

	      vnode._component = dummy;
	      vnode.__c = dummy;
	      renderHook(vnode);
	    }

	    if (isClass) {
	      c.render.call(dummy, dummy.props, dummy.state);
	    } else {
	      c.constructor.call(dummy, dummy.props, dummy.context);
	    }
	  } catch (error) {// We don't care about any errors here. We only need
	    // the hook call sites
	  } finally {
	    // Restore original console
	    for (const method in prevConsole) {
	      try {
	        console[method] = prevConsole[method];
	      } catch (error) {// Ignore errors
	      }
	    }

	    options._skipEffects = options.__s = false;
	  }

	  const parsed = hookLog.length ? parseHookData(config, hookLog, c, [...debugNames].reverse()) : null;
	  debugNames = [];
	  inspectingHooks = false;
	  ancestorName = "unknown";
	  hookLog = [];
	  return parsed;
	}

	// MODULE: src/adapter/10/renderer/inspectVNode.ts
	/**
	 * Serialize all properties/attributes of a `VNode` like `props`, `context`,
	 * `hooks`, and other data. This data will be requested when the user selects a
	 * `VNode` in the devtools. It returning information will be displayed in the
	 * sidebar.
	 */

	function inspectVNode(ids, config, options, id, supportsHooks) {
	  const vnode = getVNodeById(ids, id);
	  if (!vnode) return null;
	  const c = getComponent(vnode);
	  const hasState = typeof vnode.type === "function" && c != null && Object.keys(c.state).length > 0;
	  const hasHooks = c != null && getComponentHooks(c) != null;
	  const hooks = supportsHooks && hasHooks ? inspectHooks(config, options, vnode) : null;
	  const context = c != null ? serialize(config, cleanContext(c.context)) : null;
	  const props = vnode.type !== null ? serialize(config, cleanProps(vnode.props)) : null;
	  const state = hasState ? serialize(config, c.state) : null;
	  let suspended = false;
	  let canSuspend = false;
	  let item = vnode;

	  while (item) {
	    if (isSuspenseVNode(item)) {
	      canSuspend = true;
	      const c = getComponent(item);

	      if (c) {
	        const key = getSuspenseStateKey(c);

	        if (key) {
	          suspended = !!c._nextState[key];
	        }
	      }

	      break;
	    }

	    item = getVNodeParent(item);
	  }

	  return {
	    context,
	    canSuspend,
	    key: vnode.key || null,
	    hooks: supportsHooks ? hooks : !supportsHooks && hasHooks ? [] : null,
	    id,
	    name: getDisplayName(vnode, config),
	    props,
	    state,
	    // TODO: We're not using this information anywhere yet
	    type: getDevtoolsType(vnode),
	    suspended
	  };
	}

	// MODULE: src/adapter/10/renderer/renderReasons.ts

	function createReason(type, items) {
	  return {
	    type,
	    items
	  };
	}
	/**
	 * Get all keys that have differnt values in two objects. Does a
	 * shallow comparison.
	 */


	function getChangedKeys(a, b) {
	  const changed = [];
	  let key;

	  for (key in a) {
	    if (!(key in b) || a[key] !== b[key]) {
	      changed.push(key);
	    }
	  }

	  for (key in b) {
	    if (!(key in a)) {
	      changed.push(key);
	    }
	  }

	  return changed;
	}
	/**
	 * Detect why a VNode updated.
	 */

	function getRenderReason(old, next) {
	  if (old === null) {
	    return next !== null ? createReason(1
	    /* MOUNT */
	    , null) : null;
	  } else if (next === null) {
	    return null;
	  } // Components
	  else if (typeof old.type === "function" && old.type === next.type) {
	      const c = getComponent(next);

	      if (c !== null) {
	        // Check hooks
	        const hooks = getStatefulHooks(c);

	        if (hooks !== null) {
	          for (let i = 0; i < hooks.length; i++) {
	            if (isUseReducerOrState(hooks[i]) && hooks[i]._oldValue !== getStatefulHookValue(hooks[i])) {
	              return createReason(5
	              /* HOOKS_CHANGED */
	              , null);
	            }
	          }
	        } // Check state


	        const prevState = c._prevState;

	        if (prevState != null && prevState !== c.state) {
	          return createReason(4
	          /* STATE_CHANGED */
	          , getChangedKeys(prevState, c.state));
	        } else if (prevState === undefined && Object.keys(c.state).length > 0) {
	          return createReason(4
	          /* STATE_CHANGED */
	          , null);
	        }
	      }
	    } // Check props


	  if (old.props !== next.props) {
	    const propsChanged = getChangedKeys(old.props, next.props);

	    if (propsChanged.length > 0) {
	      return createReason(3
	      /* PROPS_CHANGED */
	      , propsChanged);
	    }
	  }

	  const parent = getVNodeParent(next);

	  if (parent != null && getStartTime(next) >= getStartTime(parent) && getEndTime(next) <= getEndTime(parent)) {
	    return createReason(2
	    /* PARENT_UPDATE */
	    , null);
	  }

	  return createReason(6
	  /* FORCE_UPDATE */
	  , null);
	}

	// MODULE: node_modules/preact/hooks/dist/hooks.module.js
	var t$2,
	    u$1,
	    r$1,
	    o$1 = 0,
	    i$1 = [],
	    c$1 = n.__b,
	    f$1 = n.__r,
	    e$2 = n.diffed,
	    a$1 = n.__c,
	    v$1 = n.unmount;

	function m$2(t, r) {
	  n.__h && n.__h(u$1, t, o$1 || r), o$1 = 0;
	  var i = u$1.__H || (u$1.__H = {
	    __: [],
	    __h: []
	  });
	  return t >= i.__.length && i.__.push({}), i.__[t];
	}

	function y(r, o) {
	  var i = m$2(t$2++, 3);
	  !n.__s && k$1(i.__H, o) && (i.__ = r, i.__H = o, u$1.__H.__h.push(i));
	}

	function h$1(r, o) {
	  var i = m$2(t$2++, 4);
	  !n.__s && k$1(i.__H, o) && (i.__ = r, i.__H = o, u$1.__h.push(i));
	}

	function s$2(n) {
	  return o$1 = 5, d$1(function () {
	    return {
	      current: n
	    };
	  }, []);
	}

	function d$1(n, u) {
	  var r = m$2(t$2++, 7);
	  return k$1(r.__H, u) && (r.__ = n(), r.__H = u, r.__h = n), r.__;
	}

	function F(n) {
	  var r = u$1.context[n.__c],
	      o = m$2(t$2++, 9);
	  return o.__c = n, r ? (null == o.__ && (o.__ = !0, r.sub(u$1)), r.props.value) : n.__;
	}

	function x$1() {
	  i$1.forEach(function (t) {
	    if (t.__P) try {
	      t.__H.__h.forEach(g$1), t.__H.__h.forEach(j$1), t.__H.__h = [];
	    } catch (u) {
	      t.__H.__h = [], n.__e(u, t.__v);
	    }
	  }), i$1 = [];
	}

	n.__b = function (n) {
	  u$1 = null, c$1 && c$1(n);
	}, n.__r = function (n) {
	  f$1 && f$1(n), t$2 = 0;
	  var r = (u$1 = n.__c).__H;
	  r && (r.__h.forEach(g$1), r.__h.forEach(j$1), r.__h = []);
	}, n.diffed = function (t) {
	  e$2 && e$2(t);
	  var o = t.__c;
	  o && o.__H && o.__H.__h.length && (1 !== i$1.push(o) && r$1 === n.requestAnimationFrame || ((r$1 = n.requestAnimationFrame) || function (n) {
	    var t,
	        u = function () {
	      clearTimeout(r), b && cancelAnimationFrame(t), setTimeout(n);
	    },
	        r = setTimeout(u, 100);

	    b && (t = requestAnimationFrame(u));
	  })(x$1)), u$1 = void 0;
	}, n.__c = function (t, u) {
	  u.some(function (t) {
	    try {
	      t.__h.forEach(g$1), t.__h = t.__h.filter(function (n) {
	        return !n.__ || j$1(n);
	      });
	    } catch (r) {
	      u.some(function (n) {
	        n.__h && (n.__h = []);
	      }), u = [], n.__e(r, t.__v);
	    }
	  }), a$1 && a$1(t, u);
	}, n.unmount = function (t) {
	  v$1 && v$1(t);
	  var u = t.__c;
	  if (u && u.__H) try {
	    u.__H.__.forEach(g$1);
	  } catch (t) {
	    n.__e(t, u.__v);
	  }
	};
	var b = "function" == typeof requestAnimationFrame;

	function g$1(n) {
	  var t = u$1;
	  "function" == typeof n.__c && n.__c(), u$1 = t;
	}

	function j$1(n) {
	  var t = u$1;
	  n.__c = n.__(), u$1 = t;
	}

	function k$1(n, t) {
	  return !n || n.length !== t.length || t.some(function (t, u) {
	    return t !== n[u];
	  });
	}

	// MODULE: src/view/store/react-bindings.ts
	// reference is not the same and won't trigger any "resize" (and likely
	// other) events at all.

	const WindowCtx = B(null);
	const AppCtx = B(null);
	const EmitCtx = B(() => null);

	// MODULE: src/view/components/utils.ts
	function useResize(fn, args, init = false) {
	  // If we're running inside the browser extension context
	  // we pull the correct window reference from context. And
	  // yes there are multiple `window` objects to keep track of.
	  // If you subscribe to the wrong one, nothing will be
	  // triggered. For testing scenarios we can fall back to
	  // the global window object instead.
	  const win = F(WindowCtx) || window;
	  y(() => {
	    if (init) fn();
	  }, []);
	  h$1(() => {
	    const fn2 = throttle(fn, 60);
	    win.addEventListener("resize", fn2);
	    return () => {
	      win.removeEventListener("resize", fn2);
	    };
	  }, args);
	}

	var s$3 = {"root":"CanvasHighlight-module_root__l0I57"};

	// MODULE: src/view/components/CanvasHighlight/CanvasHighlight.tsx
	function CanvasHighlight() {
	  const ref = s$2();
	  useResize(() => {
	    if (ref.current) {
	      ref.current.width = window.innerWidth;
	      ref.current.height = window.innerHeight;
	    }
	  }, []);
	  return m$1`<canvas class=${s$3.root} ref=${ref} width=${window.innerWidth} height=${window.innerHeight}/>`;
	}

	// MODULE: src/adapter/adapter/highlightUpdates.ts
	const DISPLAY_DURATION = 250;
	const MAX_DISPLAY_DURATION = 3000;
	const OUTLINE_COLOR = "#f0f0f0";
	const COLORS = ["#37afa9", "#63b19e", "#80b393", "#97b488", "#abb67d", "#beb771", "#cfb965", "#dfba57", "#efbb49", "#febc38"];
	function measureUpdate(updates, dom) {
	  const data = updates.get(dom);
	  const rect = dom.getBoundingClientRect();
	  const now = performance.now();
	  const expirationTime = data ? Math.min(now + MAX_DISPLAY_DURATION, data.expirationTime + DISPLAY_DURATION) : now + DISPLAY_DURATION;
	  updates.set(dom, {
	    expirationTime,
	    height: rect.height,
	    width: rect.width,
	    x: rect.x,
	    y: rect.y,
	    count: data ? data.count + 1 : 1
	  });
	}
	function drawRect(ctx, data) {
	  const colorIndex = Math.min(COLORS.length - 1, data.count - 1); // Outline

	  ctx.lineWidth = 1;
	  ctx.strokeStyle = OUTLINE_COLOR;
	  ctx.strokeRect(data.x - 1, data.y - 1, data.width + 2, data.height + 2); // Inset

	  ctx.lineWidth = 1;
	  ctx.strokeStyle = OUTLINE_COLOR;
	  ctx.strokeRect(data.x + 1, data.y + 1, data.width - 2, data.height - 2); // Border

	  ctx.strokeStyle = COLORS[colorIndex];
	  ctx.lineWidth = 1;
	  ctx.strokeRect(data.x, data.y, data.width, data.height);
	}
	let timer;
	let container = null;
	let canvas = null;
	function destroyCanvas() {
	  if (container) {
	    O(null, container);
	    container.remove();
	    container = null;
	    canvas = null;
	  }
	}

	function draw(updates) {
	  if (!canvas || !canvas.getContext) return;
	  if (timer) clearTimeout(timer);
	  const ctx = canvas.getContext("2d");
	  if (!ctx) return;
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  const now = performance.now();
	  let nextRedraw = Number.MAX_SAFE_INTEGER;
	  updates.forEach((data, key) => {
	    if (data.expirationTime < now) {
	      updates.delete(key);
	    } else {
	      drawRect(ctx, data);
	      nextRedraw = Math.min(nextRedraw, data.expirationTime);
	    }
	  });

	  if (nextRedraw !== Number.MAX_SAFE_INTEGER) {
	    timer = setTimeout(() => draw(updates), nextRedraw - now);
	  } else {
	    destroyCanvas();
	  }
	}

	function startDrawing(updateRects) {
	  if (!canvas) {
	    container = document.createElement("div");
	    container.id = "preact-devtools-highlight-updates";
	    document.body.appendChild(container);
	    O(v(CanvasHighlight, null), container);
	    canvas = container.querySelector("canvas");
	  }

	  draw(updateRects);
	}

	// MODULE: src/adapter/10/renderer.ts
	const memoReg = /^Memo\(/;
	const forwardRefReg = /^ForwardRef\(/;
	/**
	 * Get the type of a vnode. The devtools uses these constants to differentiate
	 * between the various forms of components.
	 */

	function getDevtoolsType(vnode) {
	  if (typeof vnode.type == "function") {
	    const name = vnode.type.displayName || "";
	    if (memoReg.test(name)) return DevNodeType.Memo;
	    if (forwardRefReg.test(name)) return DevNodeType.ForwardRef;
	    if (isSuspenseVNode(vnode)) return DevNodeType.Suspense; // TODO: Provider and Consumer

	    return vnode.type.prototype && vnode.type.prototype.render ? DevNodeType.ClassComponent : DevNodeType.FunctionComponent;
	  }

	  return DevNodeType.Element;
	}
	function isVNode(x) {
	  return x != null && x.type !== undefined && hasDom(x);
	}
	function serializeVNode(x, config) {
	  if (isVNode(x)) {
	    return {
	      type: "vnode",
	      name: getDisplayName(x, config)
	    };
	  }

	  return null;
	}
	function getFilteredChildren(vnode, filters, config) {
	  const children = getActualChildren(vnode);
	  const stack = children.slice();
	  const out = [];
	  let child;

	  while (stack.length) {
	    child = stack.pop();

	    if (child != null) {
	      if (!shouldFilter(child, filters, config)) {
	        out.push(child);
	      } else {
	        const nextChildren = getActualChildren(child);

	        if (nextChildren.length > 0) {
	          stack.push(...nextChildren.slice());
	        }
	      }
	    }
	  }

	  return out.reverse();
	}

	function isTextNode(dom) {
	  return dom != null && dom.nodeType === NodeType.Text;
	}

	function updateHighlight(profiler, vnode) {
	  if (profiler.highlightUpdates && typeof vnode.type === "function") {
	    let dom = getDom(vnode);

	    if (isTextNode(dom)) {
	      dom = dom.parentNode;
	    }

	    if (dom && !profiler.pendingHighlightUpdates.has(dom)) {
	      profiler.pendingHighlightUpdates.add(dom);
	      measureUpdate(profiler.updateRects, dom);
	    }
	  }
	}

	function getHocName(name) {
	  const idx = name.indexOf("(");
	  if (idx === -1) return null;
	  const wrapper = name.slice(0, idx);
	  return wrapper ? wrapper : null;
	}

	function addHocs(commit, id, hocs) {
	  if (hocs.length > 0) {
	    commit.operations.push(MsgTypes.HOC_NODES, id, hocs.length);

	    for (let i = 0; i < hocs.length; i++) {
	      const stringId = getStringId(commit.strings, hocs[i]);
	      commit.operations.push(stringId);
	    }
	  }
	}

	function mount(ids, commit, vnode, ancestorId, filters, domCache, config, profiler, hocs) {
	  if (commit.stats !== null) {
	    commit.stats.mounts++;
	  }

	  const root = isRoot(vnode, config);
	  const skip = shouldFilter(vnode, filters, config);

	  if (root || !skip) {
	    record: {
	      let name = getDisplayName(vnode, config);

	      if (filters.type.has("hoc")) {
	        const hocName = getHocName(name); // Filter out HOC-Components

	        if (hocName) {
	          if (name.startsWith("ForwardRef")) {
	            hocs = [...hocs, hocName];
	            const idx = name.indexOf("(");
	            name = name.slice(idx + 1, -1) || "Anonymous";
	          } else {
	            hocs = [...hocs, hocName];
	            break record;
	          }
	        }
	      }

	      const id = hasVNodeId(ids, vnode) ? getVNodeId(ids, vnode) : createVNodeId(ids, vnode);

	      if (isRoot(vnode, config)) {
	        commit.operations.push(MsgTypes.ADD_ROOT, id);
	      }

	      commit.operations.push(MsgTypes.ADD_VNODE, id, getDevtoolsType(vnode), // Type
	      ancestorId, 9999, // owner
	      getStringId(commit.strings, name), vnode.key ? getStringId(commit.strings, vnode.key) : 0, // Multiply, because operations array only supports integers
	      // and would otherwise cut off floats
	      (vnode.startTime || 0) * 1000, (vnode.endTime || 0) * 1000);

	      if (hocs.length > 0) {
	        addHocs(commit, id, hocs);
	        hocs = [];
	      } // Capture render reason (mount here)


	      if (profiler.isProfiling && profiler.captureRenderReasons) {
	        commit.operations.push(MsgTypes.RENDER_REASON, id, 1
	        /* MOUNT */
	        , 0);
	      }

	      updateHighlight(profiler, vnode);
	      ancestorId = id;
	    }
	  }

	  if (skip && typeof vnode.type !== "function") {
	    const dom = getDom(vnode);
	    if (dom) domCache.set(dom, vnode);
	  }

	  let diff = DiffType.UNKNOWN;
	  let childCount = 0;
	  const children = getActualChildren(vnode);

	  for (let i = 0; i < children.length; i++) {
	    const child = children[i];

	    if (child != null) {
	      if (commit.stats !== null) {
	        diff = getDiffType(child, diff);
	        childCount++;
	      }

	      mount(ids, commit, child, ancestorId, filters, domCache, config, profiler, hocs);
	    }
	  }

	  if (commit.stats !== null) {
	    updateDiffStats(commit.stats, diff, childCount);
	    recordComponentStats(config, commit.stats, vnode, children);
	  }
	}
	function resetChildren(commit, ids, id, vnode, filters, config) {
	  const children = getActualChildren(vnode);
	  if (!children.length) return;
	  const next = getFilteredChildren(vnode, filters, config); // Suspense internals mutate child outside of the standard render cycle.
	  // This leads to stale children on the devtools ends. To work around that
	  // We'll always reset the children of a Suspense vnode.

	  let forceReorder = false;

	  if (isSuspenseVNode(vnode)) {
	    forceReorder = true;
	  }

	  if (!forceReorder && next.length < 2) return;
	  commit.operations.push(MsgTypes.REORDER_CHILDREN, id, next.length, ...next.map(x => getVNodeId(ids, x)));
	}
	function update(ids, commit, vnode, ancestorId, filters, domCache, config, profiler, hocs) {
	  if (commit.stats !== null) {
	    commit.stats.updates++;
	  }

	  let diff = DiffType.UNKNOWN;
	  const skip = shouldFilter(vnode, filters, config);

	  if (skip) {
	    let childCount = 0;
	    const children = getActualChildren(vnode);

	    for (let i = 0; i < children.length; i++) {
	      const child = children[i];

	      if (child != null) {
	        if (commit.stats !== null) {
	          diff = getDiffType(child, diff);
	          childCount++;
	        }

	        update(ids, commit, child, ancestorId, filters, domCache, config, profiler, hocs);
	      }
	    }

	    if (commit.stats !== null) {
	      updateDiffStats(commit.stats, diff, childCount);
	      recordComponentStats(config, commit.stats, vnode, children);
	    }

	    return;
	  }

	  if (!hasVNodeId(ids, vnode)) {
	    mount(ids, commit, vnode, ancestorId, filters, domCache, config, profiler, hocs);
	    return true;
	  }

	  const id = getVNodeId(ids, vnode);
	  commit.operations.push(MsgTypes.UPDATE_VNODE_TIMINGS, id, (vnode.startTime || 0) * 1000, (vnode.endTime || 0) * 1000);
	  const name = getDisplayName(vnode, config);
	  const hoc = getHocName(name);

	  if (hoc) {
	    hocs = [...hocs, hoc];
	  } else {
	    addHocs(commit, id, hocs);
	    hocs = [];
	  }

	  const oldVNode = getVNodeById(ids, id);
	  updateVNodeId(ids, id, vnode);

	  if (profiler.isProfiling && profiler.captureRenderReasons) {
	    const reason = getRenderReason(oldVNode, vnode);

	    if (reason !== null) {
	      const count = reason.items ? reason.items.length : 0;
	      commit.operations.push(MsgTypes.RENDER_REASON, id, reason.type, count);

	      if (reason.items && count > 0) {
	        commit.operations.push(...reason.items.map(str => getStringId(commit.strings, str)));
	      }
	    }
	  }

	  updateHighlight(profiler, vnode);
	  const oldChildren = oldVNode ? getActualChildren(oldVNode).map(v => v && getVNodeId(ids, v)) : [];
	  let shouldReorder = false;
	  let childCount = 0;
	  const children = getActualChildren(vnode);

	  for (let i = 0; i < children.length; i++) {
	    const child = children[i];

	    if (child == null) {
	      if (oldChildren[i] != null) {
	        commit.unmountIds.push(oldChildren[i]);
	      }
	    } else if (hasVNodeId(ids, child) || shouldFilter(child, filters, config)) {
	      if (commit.stats !== null) {
	        diff = getDiffType(child, diff);
	        childCount++;
	      }

	      update(ids, commit, child, id, filters, domCache, config, profiler, hocs); // TODO: This is only sometimes necessary

	      shouldReorder = true;
	    } else {
	      if (commit.stats !== null) {
	        diff = getDiffType(child, diff);
	        childCount++;
	      }

	      mount(ids, commit, child, id, filters, domCache, config, profiler, hocs);
	      shouldReorder = true;
	    }
	  }

	  if (commit.stats !== null) {
	    updateDiffStats(commit.stats, diff, childCount);
	    recordComponentStats(config, commit.stats, vnode, children);
	  }

	  if (shouldReorder) {
	    resetChildren(commit, ids, id, vnode, filters, config);
	  }
	}
	function createCommit(ids, roots, vnode, filters, domCache, config, profiler, statState) {
	  const commit = {
	    operations: [],
	    rootId: -1,
	    strings: new Map(),
	    unmountIds: [],
	    renderReasons: new Map(),
	    stats: statState.isRecording ? createStats() : null
	  };
	  let parentId = -1;
	  const isNew = !hasVNodeId(ids, vnode);

	  if (isRoot(vnode, config)) {
	    if (commit.stats !== null) {
	      commit.stats.roots.total++;
	      const children = getActualChildren(vnode);
	      commit.stats.roots.children.push(children.length);
	    }

	    parentId = -1;
	    roots.add(vnode);
	  } else {
	    parentId = getVNodeId(ids, getAncestor(vnode));
	  }

	  if (isNew) {
	    mount(ids, commit, vnode, parentId, filters, domCache, config, profiler, []);
	  } else {
	    update(ids, commit, vnode, parentId, filters, domCache, config, profiler, []);
	  }

	  commit.rootId = getVNodeId(ids, vnode);
	  return commit;
	}
	const DEFAULT_FIlTERS = {
	  regex: [],
	  // TODO: Add default hoc-filter
	  type: new Set(["dom", "fragment"])
	};
	function createRenderer(port, namespace, config, options, supports, filters = DEFAULT_FIlTERS) {
	  const ids = createIdMappingState(namespace);
	  const roots = new Set();
	  let currentUnmounts = [];
	  const domToVNode = new WeakMap();
	  const profiler = {
	    isProfiling: false,
	    highlightUpdates: false,
	    updateRects: new Map(),
	    pendingHighlightUpdates: new Set(),
	    captureRenderReasons: false
	  };
	  const statState = {
	    isRecording: false
	  };

	  function onUnmount(vnode) {
	    if (!shouldFilter(vnode, filters, config)) {
	      if (hasVNodeId(ids, vnode)) {
	        currentUnmounts.push(getVNodeId(ids, vnode));
	      }
	    }

	    if (typeof vnode.type !== "function") {
	      const dom = getDom(vnode);
	      if (dom != null) domToVNode.delete(dom);
	    }

	    removeVNodeId(ids, vnode);
	  }

	  const inspect = id => inspectVNode(ids, config, options, id, supports.hooks);

	  return {
	    // TODO: Deprecate
	    // eslint-disable-next-line @typescript-eslint/no-empty-function
	    flushInitial() {},

	    clear() {
	      roots.forEach(vnode => {
	        onUnmount(vnode);
	      });
	    },

	    startHighlightUpdates() {
	      profiler.highlightUpdates = true;
	    },

	    stopHighlightUpdates() {
	      profiler.highlightUpdates = false;
	      profiler.updateRects.clear();
	      profiler.pendingHighlightUpdates.clear();
	    },

	    startRecordStats: () => {
	      statState.isRecording = true;
	    },
	    stopRecordStats: () => {
	      statState.isRecording = false;
	    },
	    startProfiling: options => {
	      profiler.isProfiling = true;
	      profiler.captureRenderReasons = !!options && !!options.captureRenderReasons;
	    },
	    stopProfiling: () => {
	      profiler.isProfiling = false;
	    },
	    getVNodeById: id => getVNodeById(ids, id),
	    has: id => hasId(ids, id),

	    getDisplayName(vnode) {
	      return getDisplayName(vnode, config);
	    },

	    getDisplayNameById: id => {
	      const vnode = getVNodeById(ids, id);

	      if (vnode) {
	        return getDisplayName(vnode, config);
	      }

	      return "Unknown";
	    },
	    log: (id, children) => logVNode(ids, config, id, children),
	    inspect,

	    findDomForVNode(id) {
	      const vnode = getVNodeById(ids, id);
	      if (!vnode) return null;
	      const first = getDom(vnode);
	      let last = null;

	      if (typeof vnode.type === "function") {
	        const children = getActualChildren(vnode);

	        for (let i = children.length - 1; i >= 0; i--) {
	          const child = children[i];

	          if (child) {
	            const dom = getDom(child);
	            if (dom === first) break;

	            if (dom !== null) {
	              last = dom;
	              break;
	            }
	          }
	        }
	      }

	      return [first, last];
	    },

	    findVNodeIdForDom(node) {
	      const vnode = domToVNode.get(node);

	      if (vnode) {
	        if (shouldFilter(vnode, filters, config)) {
	          let p = vnode;
	          let found = null;

	          while ((p = getVNodeParent(p)) != null) {
	            if (!shouldFilter(p, filters, config)) {
	              found = p;
	              break;
	            }
	          }

	          if (found != null) {
	            return getVNodeId(ids, found) || -1;
	          }
	        } else {
	          return getVNodeId(ids, vnode) || -1;
	        }
	      }

	      return -1;
	    },

	    refresh() {
	      this.applyFilters(filters);
	    },

	    applyFilters(nextFilters) {
	      /** Queue events and flush in one go */
	      const queue = [];
	      roots.forEach(root => {
	        const rootId = getVNodeId(ids, root);
	        traverse(root, vnode => this.onUnmount(vnode));
	        const commit = {
	          operations: [],
	          rootId,
	          strings: new Map(),
	          unmountIds: currentUnmounts,
	          stats: statState.isRecording ? createStats() : null
	        };

	        if (commit.stats !== null) {
	          commit.stats.unmounts += commit.unmountIds.length;
	        }

	        const unmounts = flush(commit);

	        if (unmounts) {
	          currentUnmounts = [];
	          queue.push(unmounts);
	        }
	      });
	      filters.regex = nextFilters.regex;
	      filters.type = nextFilters.type;
	      roots.forEach(root => {
	        const commit = createCommit(ids, roots, root, filters, domToVNode, config, profiler, statState);
	        const ev = flush(commit);
	        if (!ev) return;
	        queue.push(ev);
	      });
	      this.flushInitial();
	      queue.forEach(ev => port.send(ev.type, ev.data));
	    },

	    onCommit(vnode) {
	      const commit = createCommit(ids, roots, vnode, filters, domToVNode, config, profiler, statState);

	      if (commit.stats !== null) {
	        commit.stats.unmounts += currentUnmounts.length;
	      }

	      commit.unmountIds.push(...currentUnmounts);
	      currentUnmounts = [];
	      const ev = flush(commit);
	      if (!ev) return;

	      if (profiler.updateRects.size > 0) {
	        startDrawing(profiler.updateRects);
	        profiler.pendingHighlightUpdates.clear();
	      }

	      port.send(ev.type, ev.data);
	    },

	    onUnmount,

	    update(id, type, path, value) {
	      const vnode = getVNodeById(ids, id);

	      if (vnode !== null) {
	        if (typeof vnode.type === "function") {
	          const c = getComponent(vnode);

	          if (c) {
	            if (type === "props") {
	              vnode.props = setInCopy(vnode.props || {}, path.slice(), value);
	            } else if (type === "state") {
	              const res = setInCopy(c.state || {}, path.slice(), value);
	              setNextState(c, res);
	            } else if (type === "context") {
	              // TODO: Investigate if we should disallow modifying context
	              // from devtools and make it readonly.
	              setIn(c.context || {}, path.slice(), value);
	            }

	            c.forceUpdate();
	          }
	        }
	      }
	    },

	    updateHook(id, index, value) {
	      const vnode = getVNodeById(ids, id);

	      if (vnode !== null && typeof vnode.type === "function") {
	        const c = getComponent(vnode);

	        if (c) {
	          const s = getHookState(c, index); // Only useState and useReducer hooks marked as editable so state can
	          // cast to more specific ReducerHookState value.

	          s[0] = value;
	          c.forceUpdate();
	        }
	      }
	    },

	    suspend(id, active) {
	      let vnode = getVNodeById(ids, id);

	      while (vnode !== null) {
	        if (isSuspenseVNode(vnode)) {
	          const c = getComponent(vnode);

	          if (c) {
	            c.setState(createSuspenseState(vnode, active));
	          } // Get nearest non-filtered vnode


	          let nearest = vnode;

	          while (nearest && shouldFilter(nearest, filters, config)) {
	            nearest = getVNodeParent(nearest);
	          }

	          if (nearest && hasVNodeId(ids, nearest)) {
	            const nearestId = getVNodeId(ids, nearest);

	            if (id !== nearestId) {
	              const inspectData = inspect(nearestId);

	              if (inspectData) {
	                inspectData.suspended = active;
	                port.send("inspect-result", inspectData);
	              }
	            }
	          }

	          break;
	        }

	        vnode = getVNodeParent(vnode);
	      }
	    }

	  };
	}

	// MODULE: src/adapter/10/marks.ts
	// Here we use the "User Timing API" to collect samples for the
	// native profiling tools of browsers. These timings will show
	// up in the "Timing" category.
	const markName = s => `⚛ ${s}`;

	const supportsPerformance = globalThis.performance && typeof globalThis.performance.getEntriesByName === "function";
	function recordMark(s) {
	  if (supportsPerformance) {
	    performance.mark(markName(s));
	  }
	}
	function endMark(nodeName) {
	  if (supportsPerformance) {
	    const name = markName(nodeName);
	    const start = `${name}_diff`;
	    const end = `${name}_diffed`;

	    if (performance.getEntriesByName(start).length > 0) {
	      performance.mark(end);
	      performance.measure(name, start, end);
	    }

	    performance.clearMarks(start);
	    performance.clearMarks(end);
	    performance.clearMeasures(name);
	  }
	}

	// MODULE: src/adapter/10/options.ts
	/**
	 * Inject tracking into setState
	 */

	function trackPrevState(Ctor) {
	  const setState = Ctor.prototype.setState;

	  Ctor.prototype.setState = function (update, callback) {
	    // Duplicated in setState() but doesn't matter due to the guard.
	    const nextState = getNextState(this);
	    const s = nextState !== this.state && nextState || setNextState(this, Object.assign({}, this.state)); // Needed in order to check if state has changed after the tree has been committed:

	    this._prevState = Object.assign({}, s);
	    return setState.call(this, update, callback);
	  };
	}

	function setupOptions(options, renderer, config) {
	  // Track component state. Only supported in Preact > 10.4.0
	  if (config.Component) {
	    trackPrevState(config.Component);
	  }

	  const o = options; // Store (possible) previous hooks so that we don't overwrite them

	  const prevVNodeHook = options.vnode;
	  const prevCommitRoot = o._commit || o.__c;
	  const prevBeforeUnmount = options.unmount;
	  const prevBeforeDiff = o._diff || o.__b;
	  const prevAfterDiff = options.diffed;
	  let prevHook = o._hook || o.__h;
	  let prevUseDebugValue = options.useDebugValue; // @ts-ignore

	  let prevHookName = options.useDebugName;

	  options.vnode = vnode => {
	    // Tiny performance improvement by initializing fields as doubles
	    // from the start. `performance.now()` will always return a double.
	    // See https://github.com/facebook/react/issues/14365
	    // and https://slidr.io/bmeurer/javascript-engine-fundamentals-the-good-the-bad-and-the-ugly
	    vnode.startTime = NaN;
	    vnode.endTime = NaN;
	    vnode.startTime = 0;
	    vnode.endTime = -1;
	    if (prevVNodeHook) prevVNodeHook(vnode);
	    vnode.old = null;
	  }; // Make sure that we are always the first `option._hook` to be called.
	  // This is necessary to ensure that our callstack remains consistent.
	  // Othwerwise we'll end up with an unknown number of frames in-between
	  // the called hook and `options._hook`. This will lead to wrongly
	  // parsed hooks.


	  setTimeout(() => {
	    prevHook = o._hook || o.__h;
	    prevUseDebugValue = options.useDebugValue; // @ts-ignore

	    prevHookName = options._addHookName || options.__a;

	    o._hook = o.__h = (c, index, type) => {
	      const s = getStatefulHooks(c);

	      if (s && Array.isArray(s) && s.length > 0 && getComponent(s[0])) {
	        s[0]._oldValue = getStatefulHookValue(s);
	        s[0]._index = index;
	      }

	      if (type) {
	        addHookStack(type);
	      } // Don't continue the chain while the devtools is inspecting hooks.
	      // Otherwise the next hook will very likely throw as we're only
	      // faking a render and not doing a proper one. #278


	      if (!options._skipEffects && !options.__s) {
	        if (prevHook) prevHook(c, index, type);
	      }
	    };

	    options.useDebugValue = value => {
	      addHookStack(HookType.useDebugValue);
	      addDebugValue(value);
	      if (prevUseDebugValue) prevUseDebugValue(value);
	    }; // @ts-ignore


	    options._addHookName = options.__a = name => {
	      addHookName(name);
	      if (prevHookName) prevHookName(name);
	    };
	  }, 100);

	  o._diff = o.__b = vnode => {
	    vnode.startTime = performance.now();

	    if (typeof vnode.type === "function") {
	      const name = getDisplayName(vnode, config);
	      recordMark(`${name}_diff`);
	    }

	    if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	  };

	  options.diffed = vnode => {
	    vnode.endTime = performance.now();

	    if (typeof vnode.type === "function") {
	      endMark(getDisplayName(vnode, config));
	    }

	    if (prevAfterDiff) prevAfterDiff(vnode);
	  };

	  o._commit = o.__c = (vnode, queue) => {
	    if (prevCommitRoot) prevCommitRoot(vnode, queue); // These cases are already handled by `unmount`

	    if (vnode == null) return;
	    renderer.onCommit(vnode);
	  };

	  options.unmount = vnode => {
	    if (prevBeforeUnmount) prevBeforeUnmount(vnode);
	    renderer.onUnmount(vnode);
	  }; // Teardown devtools options. Mainly used for testing


	  return () => {
	    options.unmount = prevBeforeUnmount;
	    o._commit = o.__c = prevCommitRoot;
	    options.diffed = prevAfterDiff;
	    o._diff = o.__b = prevBeforeDiff;
	    options.vnode = prevVNodeHook;
	    o._hook = o.__h = prevHook;
	    options.useDebugValue = prevUseDebugValue;
	  };
	}

	// MODULE: src/adapter/parse-semverish.ts
	const MAJOR = 1;
	const MINOR = 2;
	const PATCH = 3;
	const PRERELEASE = 5;
	const PRERELEASE_TAG = 5;
	const PRERELEASE_VERSION = 6;
	const REGEXP_SEMVERISH = /^(\d+)\.(\d+)\.(\d+)(-(.+)\.(\d+))?$/i;
	/**
	 * semver-ish parsing based on https://github.com/npm/node-semver/blob/master/semver.js
	 *
	 * @param version Version to parse
	 * @param allowPreRelease Flag to indicate whether pre-releases should be allowed & parsed (e.g. -rc.1)
	 */

	function parseSemverish(version) {
	  const match = version.match(REGEXP_SEMVERISH);

	  if (match) {
	    let preRelease = undefined;

	    if (match[PRERELEASE]) {
	      preRelease = {
	        tag: match[PRERELEASE_TAG],
	        version: +match[PRERELEASE_VERSION]
	      };
	    }

	    return {
	      major: +match[MAJOR],
	      minor: +match[MINOR],
	      patch: +match[PATCH],
	      preRelease
	    };
	  }

	  return null;
	}

	// MODULE: src/adapter/hook.ts
	/**
	 * Create hook to which Preact will subscribe and listen to. The hook
	 * is the entrypoint where everything begins.
	 */

	function createHook(port) {
	  const {
	    listen,
	    send
	  } = port;
	  const renderers = new Map();
	  let uid = 0;
	  let status = "disconnected"; // Lazily init the adapter when a renderer is attached

	  const init = () => {
	    createAdapter(port, renderers);
	    status = "pending";
	    send("init", null);
	    listen("init", () => {
	      status = "connected";

	      for (const r of renderers.values()) {
	        r.flushInitial();
	      }
	    });
	  };

	  const attachRenderer = (renderer, supports) => {
	    if (status === "disconnected") {
	      init();
	    }

	    renderers.set(++uid, renderer); // Content Script is likely not ready at this point, so don't
	    // flush any events here and politely request it to initialize

	    const supportsProfiling = typeof renderer.startProfiling === "function" && typeof renderer.stopProfiling === "function";
	    send("attach", {
	      id: uid,
	      supportsProfiling,
	      supportsRenderReasons: !!supports.renderReasons,
	      supportsHooks: !!supports.hooks
	    }); // Feature: Profile and reaload
	    // Check if we should immediately start profiling on create

	    const profilerOptions = window.localStorage.getItem(PROFILE_RELOAD);

	    if (profilerOptions !== null) {
	      window.localStorage.removeItem(PROFILE_RELOAD);
	      renderer.startProfiling(JSON.parse(profilerOptions));
	    }

	    const statsOptions = window.localStorage.getItem(STATS_RELOAD);

	    if (statsOptions !== null) {
	      window.localStorage.removeItem(STATS_RELOAD);
	      renderer.startRecordStats();
	    }

	    return uid;
	  }; // Delete all roots when the current frame is closed


	  window.addEventListener("pagehide", () => {
	    renderers.forEach(r => {
	      if (r.clear) r.clear();
	    });
	  }); // TODO: This should be added to codesandbox itself. I'm not too
	  // happy with having site specific code in the extension, but
	  // codesandbox is very popular among the Preact/React community
	  // so this will get us started

	  window.addEventListener("message", e => {
	    if (renderers.size > 0 && e.data && e.data.codesandbox && e.data.type === "compile") {
	      renderers.forEach(r => {
	        if (r.clear) r.clear();
	      });
	    }
	  });
	  return {
	    $0: null,
	    $type: null,
	    renderers,

	    get connected() {
	      return status === "connected";
	    },

	    set connected(_) {
	      // eslint-disable-next-line no-console
	      console.warn("Mutating __PREACT_DEVTOOLS__.connected is deprecated.");
	    },

	    emit: port.send,
	    listen: () => {
	      // eslint-disable-next-line no-console
	      console.error("__PREACT_DEVTOOLS__.listen() is deprecated.");
	    },
	    attachPreact: (version, options, config) => {
	      if (status === "disconnected") {
	        init();
	      } // attach the correct renderer/options hooks based on the preact version


	      const preactVersionMatch = parseSemverish(version);

	      if (!preactVersionMatch) {
	        // eslint-disable-next-line no-console
	        console.error(`[PREACT DEVTOOLS] Could not parse preact version ${version}`);
	        return -1;
	      } // currently we only support preact >= 10, later we can add another branch for major === 8


	      if (preactVersionMatch.major == 10) {
	        const supports = {
	          renderReasons: !!config.Component,
	          hooks: preactVersionMatch.minor >= 4 && preactVersionMatch.patch >= 1
	        }; // Create an integer-based namespace to avoid clashing ids caused by
	        // multiple connected renderers

	        const namespace = Math.floor(Math.random() * 2 ** 32);
	        const renderer = createRenderer(port, namespace, config, options, supports);
	        setupOptions(options, renderer, config);
	        return attachRenderer(renderer, supports);
	      }

	      return -1;
	    },
	    attach: renderer => attachRenderer(renderer, {
	      renderReasons: false
	    }),
	    detach: id => renderers.delete(id)
	  };
	}

	// MODULE: src/adapter/adapter/port.ts
	function listenToDevtools(ctx, type, callback) {
	  ctx.addEventListener("message", e => {
	    if (e.source === window && e.data.source === DevtoolsToClient) {
	      const data = e.data;
	      if (data.type === type) callback(data.data);
	    }
	  });
	}
	function sendToDevtools(ctx, type, data) {
	  ctx.postMessage({
	    source: PageHookName,
	    type,
	    data
	  }, "*");
	}
	function createPortForHook(ctx) {
	  return {
	    send: (type, message) => sendToDevtools(ctx, type, message),
	    listen: (type, callback) => listenToDevtools(ctx, type, callback)
	  };
	}

	// MODULE: src/shells/shared/installHook.ts
	window.__PREACT_DEVTOOLS__ = createHook(createPortForHook(window));

}

	
	'use strict';

	// MODULE: src/shells/shared/utils.ts
	function inject(codeOrSrc, mode = "code") {
	  const s = document.createElement("script"); // This runs before `<head>` is available

	  const target = document.head || document.documentElement;
	  if (mode === "code") s.textContent = codeOrSrc;else s.src = codeOrSrc;
	  target.appendChild(s);
	  s.remove();
	}
	function injectStyles(href) {
	  const s = document.createElement("link");
	  s.rel = "stylesheet";
	  s.href = href;
	  const target = document.head || document.documentElement;
	  target.appendChild(s);
	}

	// MODULE: src/constants.ts
	const ClientToDevtools = "preact-client-to-devtools";
	const DevtoolsToClient = "preact-devtools-to-client";
	const ContentScriptName = "preact-content-script";
	const PageHookName = "preact-page-hook";
	var Status;

	(function (Status) {
	  Status["Disconnected"] = "disconnected";
	  Status["Connected"] = "connected";
	  Status["Pending"] = "pending";
	})(Status || (Status = {}));
	var HookType;

	(function (HookType) {
	  HookType[HookType["useState"] = 1] = "useState";
	  HookType[HookType["useReducer"] = 2] = "useReducer";
	  HookType[HookType["useEffect"] = 3] = "useEffect";
	  HookType[HookType["useLayoutEffect"] = 4] = "useLayoutEffect";
	  HookType[HookType["useRef"] = 5] = "useRef";
	  HookType[HookType["useImperativeHandle"] = 6] = "useImperativeHandle";
	  HookType[HookType["useMemo"] = 7] = "useMemo";
	  HookType[HookType["useCallback"] = 8] = "useCallback";
	  HookType[HookType["useContext"] = 9] = "useContext";
	  HookType[HookType["useErrorBoundary"] = 10] = "useErrorBoundary";
	  HookType[HookType["useDebugValue"] = 11] = "useDebugValue";
	  HookType[HookType["custom"] = 99] = "custom";
	  HookType[HookType["devtoolsParent"] = 9999] = "devtoolsParent";
	})(HookType || (HookType = {}));

	var NodeType;

	(function (NodeType) {
	  NodeType[NodeType["Element"] = 1] = "Element";
	  NodeType[NodeType["Text"] = 3] = "Text";
	  NodeType[NodeType["CData"] = 4] = "CData";
	  NodeType[NodeType["XMLProcessingInstruction"] = 7] = "XMLProcessingInstruction";
	  NodeType[NodeType["Comment"] = 8] = "Comment";
	  NodeType[NodeType["Document"] = 9] = "Document";
	  NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
	  NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
	})(NodeType || (NodeType = {}));

	// MODULE: src/shells/shared/content-script.ts
	/** Connection to background page */

	let connection = null;
	let status = Status.Disconnected;
	let queue = [];
	/** Handle message from background script */

	function handleMessage(message) {

	  if (message.type === "init" && message.tabId) {
	    status = Status.Connected; // If the queue is empty we re-openend the devtools. Whenever the
	    // panel is closed, our panel frame is completely destroyed and we
	    // need to requery the whole component tree

	    if (queue.length === 0) {
	      window.postMessage({
	        type: "refresh",
	        source: DevtoolsToClient
	      }, "*");
	      return;
	    } else {
	      queue.forEach(ev => connection.postMessage(ev));
	      queue = [];
	    }
	  }

	  window.postMessage({ ...message,
	    source: DevtoolsToClient
	  }, "*");
	}
	/** Handle disconnect from background script */


	function handleDisconnect() {
	  connection = null;
	  status = Status.Disconnected;
	}
	/** Forward messages from the page to the devtools */


	window.addEventListener("message", e => {
	  if (e.source === window && e.data && e.data.source === PageHookName) {
	    const data = e.data;

	    if (status === Status.Disconnected) {
	      status = Status.Pending;
	      connection = chrome.runtime.connect({
	        name: ContentScriptName
	      });
	      connection.onMessage.addListener(handleMessage);
	      connection.onDisconnect.addListener(handleDisconnect); // Inject styles only when when Preact was detected

	      injectStyles(chrome.runtime.getURL("preact-devtools-page.css"));
	    }

	    if (connection === null) {
	      // eslint-disable-next-line no-console
	      return console.warn("Unable to connect to Preact Devtools extension.");
	    }

	    if (status !== Status.Connected && data.type !== "init") {
	      queue.push(data);
	    } else {
	      connection.postMessage({ ...data,
	        source: ClientToDevtools
	      });
	    }
	  }
	}); // Only inject for HTML pages

	if (document.contentType === "text/html") {
	  // We need to inject in time to catch the initial mount. There is no
	  // reliable way to ensure that our code runs before the page's javascript.
	  // Using a script tag with an src attribute leads to a race condition
	  // where the page's js will be run before us when it's cached by the
	  // browser or by a service worker.
	  //
	  //   inject(chrome.runtime.getURL("installHook.js"), "script");
	  //
	  // The only solution so far is to set script.textContent directly. For
	  // that we need to do some custom bundling logic to store the content of
	  // installHook.ts in a variable.
	  //
	  // See: https://github.com/preactjs/preact-devtools/issues/85
	  //
	  // The string installHook.toString() will be replaced by our build tool.
	  inject(`;(${installHook.toString()}(window))`, "code");
	}


}());