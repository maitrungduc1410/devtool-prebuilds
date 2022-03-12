(function (chrome$1) {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const visibility = writable({
      component: true,
      element: true,
      block: true,
      iteration: true,
      slot: true,
      text: true,
      anchor: false,
    });
    const selectedNode = writable({});
    const hoveredNodeId = writable(null);
    const rootNodes = writable([]);
    const searchValue = writable('');
    const profilerEnabled = writable(false);
    const profileFrame = writable({});


    function interactableNodes(list) {
      const _visibility = get_store_value(visibility);
      return list.filter(
        o => _visibility[o.type] && o.type !== 'text' && o.type !== 'anchor'
      )
    }

    window.addEventListener('keydown', e => {
      if (e.target !== document.body) return

      selectedNode.update(node => {
        if (node.invalidate === undefined) return node
        switch (e.key) {
          case 'Enter':
            node.collapsed = !node.collapsed;
            node.invalidate();
            return node

          case 'ArrowRight':
            node.collapsed = false;
            node.invalidate();
            return node

          case 'ArrowDown': {
            const children = interactableNodes(node.children);

            if (node.collapsed || children.length === 0) {
              var next = node;
              var current = node;
              do {
                const siblings = interactableNodes(
                  current.parent === undefined
                    ? get_store_value(rootNodes)
                    : current.parent.children
                );
                const index = siblings.findIndex(o => o.id === current.id);
                next = siblings[index + 1];

                current = current.parent;
              } while (next === undefined && current !== undefined)

              return next ?? node
            } else {
              return children[0]
            }
          }

          case 'ArrowLeft':
            node.collapsed = true;
            node.invalidate();
            return node

          case 'ArrowUp': {
            const siblings = interactableNodes(
              node.parent === undefined ? get_store_value(rootNodes) : node.parent.children
            );
            const index = siblings.findIndex(o => o.id === node.id);
            return index > 0 ? siblings[index - 1] : node.parent ?? node
          }

          default:
            return node
        }
      });
    });

    const nodeMap = new Map();

    const port = chrome.runtime.connect();

    /* Include all relevant content script settings in
     * message itself to avoid extra async queries
     */
    port.postMessage({
      type: 'init',
      profilerEnabled: get_store_value(profilerEnabled),
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    function reload() {
      port.postMessage({
        type: 'reload',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }

    function startPicker() {
      port.postMessage({
        type: 'startPicker',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }

    function stopPicker() {
      port.postMessage({
        type: 'stopPicker',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }

    selectedNode.subscribe(node => {
      port.postMessage({
        type: 'setSelected',
        tabId: chrome.devtools.inspectedWindow.tabId,
        nodeId: node.id,
      });

      let invalid = null;
      while (node.parent) {
        node = node.parent;
        if (node.collapsed) {
          invalid = node;
          node.collapsed = false;
        }
      }

      if (invalid) invalid.invalidate();
    });

    hoveredNodeId.subscribe(nodeId =>
      port.postMessage({
        type: 'setHover',
        tabId: chrome.devtools.inspectedWindow.tabId,
        nodeId,
      })
    );

    profilerEnabled.subscribe(o =>
      port.postMessage({
        type: o ? 'startProfiler' : 'stopProfiler',
        tabId: chrome.devtools.inspectedWindow.tabId,
      })
    );

    function noop() {}

    function insertNode(node, target, anchorId) {
      node.parent = target;

      let index = -1;
      if (anchorId) index = target.children.findIndex(o => o.id == anchorId);

      if (index != -1) {
        target.children.splice(index, 0, node);
      } else {
        target.children.push(node);
      }

      target.invalidate();
    }

    function resolveFrame(frame) {
      frame.children.forEach(resolveFrame);

      if (!frame.node) return

      frame.node = nodeMap.get(frame.node) || {
        tagName: 'Unknown',
        type: 'Unknown',
      };
    }

    function resolveEventBubble(node) {
      if (!node.detail || !node.detail.listeners) return

      for (const listener of node.detail.listeners) {
        if (!listener.handler.includes('bubble($$self, event)')) continue

        listener.handler = () => {
          let target = node;
          while ((target = target.parent)) if (target.type == 'component') break

          const listeners = target.detail.listeners;
          if (!listeners) return null

          const parentListener = listeners.find(o => o.event == listener.event);
          if (!parentListener) return null

          const handler = parentListener.handler;
          if (!handler) return null

          return (
            '// From parent\n' +
            (typeof handler == 'function' ? handler() : handler)
          )
        };
      }
    }

    port.onMessage.addListener(msg => {
      switch (msg.type) {
        case 'clear': {
          selectedNode.set({});
          hoveredNodeId.set(null);
          rootNodes.set([]);

          break
        }

        case 'addNode': {
          const node = msg.node;
          node.children = [];
          node.collapsed = true;
          node.invalidate = noop;
          resolveEventBubble(node);

          const targetNode = nodeMap.get(msg.target);
          nodeMap.set(node.id, node);

          if (targetNode) {
            insertNode(node, targetNode, msg.anchor);
            return
          }

          if (node._timeout) return

          node._timeout = setTimeout(() => {
            delete node._timeout;
            const targetNode = nodeMap.get(msg.target);
            if (targetNode) insertNode(node, targetNode, msg.anchor);
            else rootNodes.update(o => (o.push(node), o));
          }, 100);

          break
        }

        case 'removeNode': {
          const node = nodeMap.get(msg.node.id);
          nodeMap.delete(node.id);

          if (!node.parent) break

          const index = node.parent.children.findIndex(o => o.id == node.id);
          node.parent.children.splice(index, 1);

          node.parent.invalidate();

          break
        }

        case 'updateNode': {
          const node = nodeMap.get(msg.node.id);
          Object.assign(node, msg.node);
          resolveEventBubble(node);

          const selected = get_store_value(selectedNode);
          if (selected && selected.id == msg.node.id) selectedNode.update(o => o);

          node.invalidate();

          break
        }

        case 'inspect': {
          let node = nodeMap.get(msg.node.id);
          selectedNode.set(node);

          break
        }

        case 'updateProfile': {
          resolveFrame(msg.frame);
          profileFrame.set(msg.frame);
          break
        }
      }
    });

    /* src/toolbar/Toolbar.svelte generated by Svelte v3.46.4 */

    function create_fragment$q(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", "svelte-1qgmxrs");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Toolbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$p, create_fragment$q, safe_not_equal, {});
    	}
    }

    /* src/toolbar/Button.svelte generated by Svelte v3.46.4 */

    function create_fragment$p(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			button.disabled = /*disabled*/ ctx[0];
    			attr(button, "type", /*type*/ ctx[2]);
    			attr(button, "class", "svelte-1jb7vvd");
    			toggle_class(button, "active", /*active*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*disabled*/ 1) {
    				button.disabled = /*disabled*/ ctx[0];
    			}

    			if (!current || dirty & /*type*/ 4) {
    				attr(button, "type", /*type*/ ctx[2]);
    			}

    			if (dirty & /*active*/ 2) {
    				toggle_class(button, "active", /*active*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { disabled } = $$props;
    	let { active } = $$props;
    	let { type = 'button' } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [disabled, active, type, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$o, create_fragment$p, safe_not_equal, { disabled: 0, active: 1, type: 2 });
    	}
    }

    /* src/toolbar/Search.svelte generated by Svelte v3.46.4 */

    function create_if_block$g(ctx) {
    	let t0_value = /*resultsPosition*/ ctx[2] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*results*/ ctx[1].length + "";
    	let t2;
    	let t3;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = text(" of ");
    			t2 = text(t2_value);
    			t3 = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, t3, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*resultsPosition*/ 4 && t0_value !== (t0_value = /*resultsPosition*/ ctx[2] + 1 + "")) set_data(t0, t0_value);
    			if (dirty & /*results*/ 2 && t2_value !== (t2_value = /*results*/ ctx[1].length + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(t3);
    		}
    	};
    }

    // (53:2) <Button type="submit" disabled={!results.length}>
    function create_default_slot_1$2(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "next svelte-1jsa5ub");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (56:2) <Button on:click={prev} disabled={!results.length}>
    function create_default_slot$7(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "prev svelte-1jsa5ub");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	let form;
    	let div;
    	let t0;
    	let svg;
    	let path0;
    	let path1;
    	let t1;
    	let input;
    	let t2;
    	let t3;
    	let button0;
    	let t4;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*resultsPosition*/ ctx[2] > -1 && create_if_block$g(ctx);

    	button0 = new Button({
    			props: {
    				type: "submit",
    				disabled: !/*results*/ ctx[1].length,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			}
    		});

    	button1 = new Button({
    			props: {
    				disabled: !/*results*/ ctx[1].length,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			}
    		});

    	button1.$on("click", /*prev*/ ctx[4]);

    	return {
    		c() {
    			form = element("form");
    			div = element("div");
    			t0 = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			attr(div, "class", "separator svelte-1jsa5ub");
    			attr(path0, "fill", "rgba(135, 135, 137, 0.9)");
    			attr(path0, "d", "M15.707 14.293l-5-5-1.414 1.414 5 5a1 1 0 0 0 1.414-1.414z");
    			attr(path1, "fill", "rgba(135, 135, 137, 0.9)");
    			attr(path1, "fill-rule", "evenodd");
    			attr(path1, "d", "M6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2A6 6 0 1 0 6 0a6 6 0 0 0 0 12z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    			attr(svg, "class", "svelte-1jsa5ub");
    			attr(input, "placeholder", "Search");
    			attr(input, "class", "svelte-1jsa5ub");
    			attr(form, "class", "svelte-1jsa5ub");
    		},
    		m(target, anchor) {
    			insert(target, form, anchor);
    			append(form, div);
    			append(form, t0);
    			append(form, svg);
    			append(svg, path0);
    			append(svg, path1);
    			append(form, t1);
    			append(form, input);
    			set_input_value(input, /*$searchValue*/ ctx[0]);
    			append(form, t2);
    			if (if_block) if_block.m(form, null);
    			append(form, t3);
    			mount_component(button0, form, null);
    			append(form, t4);
    			mount_component(button1, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[5]),
    					listen(form, "submit", prevent_default(/*next*/ ctx[3]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$searchValue*/ 1 && input.value !== /*$searchValue*/ ctx[0]) {
    				set_input_value(input, /*$searchValue*/ ctx[0]);
    			}

    			if (/*resultsPosition*/ ctx[2] > -1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					if_block.m(form, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button0_changes = {};
    			if (dirty & /*results*/ 2) button0_changes.disabled = !/*results*/ ctx[1].length;

    			if (dirty & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*results*/ 2) button1_changes.disabled = !/*results*/ ctx[1].length;

    			if (dirty & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(form);
    			if (if_block) if_block.d();
    			destroy_component(button0);
    			destroy_component(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $searchValue;
    	let $rootNodes;
    	component_subscribe($$self, searchValue, $$value => $$invalidate(0, $searchValue = $$value));
    	component_subscribe($$self, rootNodes, $$value => $$invalidate(6, $rootNodes = $$value));

    	function next() {
    		if (resultsPosition >= results.length - 1) $$invalidate(2, resultsPosition = -1);
    		selectedNode.set(results[$$invalidate(2, ++resultsPosition)]);
    	}

    	function prev() {
    		if (resultsPosition <= 0) $$invalidate(2, resultsPosition = results.length);
    		selectedNode.set(results[$$invalidate(2, --resultsPosition)]);
    	}

    	function search(nodeList = $rootNodes) {
    		for (const node of nodeList) {
    			if (node.tagName.includes($searchValue) || node.detail && JSON.stringify(node.detail).includes($searchValue)) results.push(node);
    			search(node.children);
    		}
    	}

    	let results;
    	let resultsPosition;

    	function input_input_handler() {
    		$searchValue = this.value;
    		searchValue.set($searchValue);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$searchValue*/ 1) {
    			{
    				$$invalidate(1, results = []);
    				$$invalidate(2, resultsPosition = -1);
    				if ($searchValue.length > 1) search();
    			}
    		}
    	};

    	return [$searchValue, results, resultsPosition, next, prev, input_input_handler];
    }

    class Search extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$o, safe_not_equal, {});
    	}
    }

    /* src/toolbar/ProfileButton.svelte generated by Svelte v3.46.4 */

    function create_else_block$9(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M0,4.8H3.4V16H0ZM6.4,0H9.6V16H6.4Zm6.4,9H16V16h-3.2z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (3:111) {#if $profilerEnabled}
    function create_if_block$f(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M12.7,1.4 11.3,0l-8,8 8,8 1.4,-1.4L6,8Z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (3:47) <Button on:click={() => ($profilerEnabled = !$profilerEnabled)}>
    function create_default_slot$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$profilerEnabled*/ ctx[0]) return create_if_block$f;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$n(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler*/ ctx[1]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, $profilerEnabled*/ 5) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $profilerEnabled;
    	component_subscribe($$self, profilerEnabled, $$value => $$invalidate(0, $profilerEnabled = $$value));
    	const click_handler = () => set_store_value(profilerEnabled, $profilerEnabled = !$profilerEnabled, $profilerEnabled);
    	return [$profilerEnabled, click_handler];
    }

    class ProfileButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$m, create_fragment$n, safe_not_equal, {});
    	}
    }

    /* src/toolbar/PickerButton.svelte generated by Svelte v3.46.4 */

    function create_default_slot$5(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M3 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.6a1 1 0 1 1 0 2H3a3 3 0 0\n      1-3-3V4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2.6a1 1 0 1 1-2 0V4a1 1 0 0\n      0-1-1H3z");
    			attr(path1, "d", "M12.87 14.6c.3.36.85.4 1.2.1.36-.31.4-.86.1-1.22l-1.82-2.13 2.42-1a.3.3\n      0 0 0 .01-.56L7.43 6.43a.3.3 0 0 0-.42.35l2.13 7.89a.3.3 0 0 0\n      .55.07l1.35-2.28 1.83 2.14z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function create_fragment$m(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				active: /*active*/ ctx[0],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click*/ ctx[1]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*active*/ 1) button_changes.active = /*active*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let active = false;

    	let unsub = () => {
    		
    	};

    	function click() {
    		if (active) {
    			$$invalidate(0, active = false);
    			stopPicker();
    			return;
    		}

    		unsub();

    		unsub = selectedNode.subscribe(node => {
    			if (!active) return;
    			$$invalidate(0, active = false);
    			unsub();
    			setTimeout(() => node.dom && node.dom.scrollIntoView({ block: 'center' }), 120);
    		});

    		$$invalidate(0, active = true);
    		startPicker();
    	}

    	return [active, click];
    }

    class PickerButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$l, create_fragment$m, safe_not_equal, {});
    	}
    }

    /* src/toolbar/VisibilityButton.svelte generated by Svelte v3.46.4 */

    function create_if_block$e(ctx) {
    	let div;
    	let t0;
    	let ul;
    	let span;
    	let t1;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let li2;
    	let t7;
    	let li3;
    	let t9;
    	let li4;
    	let t11;
    	let li5;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			t0 = space();
    			ul = element("ul");
    			span = element("span");
    			t1 = space();
    			li0 = element("li");
    			li0.textContent = "Components";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Elements";
    			t5 = space();
    			li2 = element("li");
    			li2.textContent = "Blocks";
    			t7 = space();
    			li3 = element("li");
    			li3.textContent = "Slots";
    			t9 = space();
    			li4 = element("li");
    			li4.textContent = "Anchors";
    			t11 = space();
    			li5 = element("li");
    			li5.textContent = "Text";
    			attr(div, "class", "svelte-1yox9nf");
    			attr(span, "class", "svelte-1yox9nf");
    			attr(li0, "class", "svelte-1yox9nf");
    			toggle_class(li0, "checked", /*$visibility*/ ctx[1].component);
    			attr(li1, "class", "svelte-1yox9nf");
    			toggle_class(li1, "checked", /*$visibility*/ ctx[1].element);
    			attr(li2, "class", "svelte-1yox9nf");
    			toggle_class(li2, "checked", /*$visibility*/ ctx[1].block);
    			attr(li3, "class", "svelte-1yox9nf");
    			toggle_class(li3, "checked", /*$visibility*/ ctx[1].slot);
    			attr(li4, "class", "svelte-1yox9nf");
    			toggle_class(li4, "checked", /*$visibility*/ ctx[1].anchor);
    			attr(li5, "class", "svelte-1yox9nf");
    			toggle_class(li5, "checked", /*$visibility*/ ctx[1].text);
    			attr(ul, "class", "svelte-1yox9nf");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t0, anchor);
    			insert(target, ul, anchor);
    			append(ul, span);
    			append(ul, t1);
    			append(ul, li0);
    			append(ul, t3);
    			append(ul, li1);
    			append(ul, t5);
    			append(ul, li2);
    			append(ul, t7);
    			append(ul, li3);
    			append(ul, t9);
    			append(ul, li4);
    			append(ul, t11);
    			append(ul, li5);

    			if (!mounted) {
    				dispose = [
    					listen(div, "click", stop_propagation(/*click_handler*/ ctx[2])),
    					listen(li0, "click", /*click_handler_1*/ ctx[3]),
    					listen(li1, "click", /*click_handler_2*/ ctx[4]),
    					listen(li2, "click", /*click_handler_3*/ ctx[5]),
    					listen(li3, "click", /*click_handler_4*/ ctx[6]),
    					listen(li4, "click", /*click_handler_5*/ ctx[7]),
    					listen(li5, "click", /*click_handler_6*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li0, "checked", /*$visibility*/ ctx[1].component);
    			}

    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li1, "checked", /*$visibility*/ ctx[1].element);
    			}

    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li2, "checked", /*$visibility*/ ctx[1].block);
    			}

    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li3, "checked", /*$visibility*/ ctx[1].slot);
    			}

    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li4, "checked", /*$visibility*/ ctx[1].anchor);
    			}

    			if (dirty & /*$visibility*/ 2) {
    				toggle_class(li5, "checked", /*$visibility*/ ctx[1].text);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t0);
    			if (detaching) detach(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (8:0) <Button on:click={e => (isOpen = true)}>
    function create_default_slot$4(ctx) {
    	let svg;
    	let path;
    	let t;
    	let if_block_anchor;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$e(ctx);

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(path, "d", "M8 2C4.36364 2 1.25818 4.28067 0 7.5 1.25818 10.71933 4.36364 13 8\n      13s6.74182-2.28067 8-5.5C14.74182 4.28067 11.63636 2 8 2zm0\n      9.16667c-2.00727 0-3.63636-1.64267-3.63636-3.66667S5.99273 3.83333 8\n      3.83333 11.63636 5.476 11.63636 7.5 10.00727 11.16667 8 11.16667zM8\n      5.3c-1.20727 0-2.18182.98267-2.18182 2.2S6.79273 9.7 8 9.7s2.18182-.98267\n      2.18182-2.2S9.20727 5.3 8 5.3z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_7*/ ctx[9]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, $visibility, isOpen*/ 1027) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $visibility;
    	component_subscribe($$self, visibility, $$value => $$invalidate(1, $visibility = $$value));
    	let isOpen = false;
    	const click_handler = e => $$invalidate(0, isOpen = false);
    	const click_handler_1 = e => set_store_value(visibility, $visibility.component = !$visibility.component, $visibility);
    	const click_handler_2 = e => set_store_value(visibility, $visibility.element = !$visibility.element, $visibility);
    	const click_handler_3 = e => set_store_value(visibility, $visibility.block = !$visibility.block, $visibility);
    	const click_handler_4 = e => set_store_value(visibility, $visibility.slot = !$visibility.slot, $visibility);
    	const click_handler_5 = e => set_store_value(visibility, $visibility.anchor = !$visibility.anchor, $visibility);
    	const click_handler_6 = e => set_store_value(visibility, $visibility.text = !$visibility.text, $visibility);
    	const click_handler_7 = e => $$invalidate(0, isOpen = true);

    	return [
    		isOpen,
    		$visibility,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class VisibilityButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$k, create_fragment$l, safe_not_equal, {});
    	}
    }

    /* src/panel/Panel.svelte generated by Svelte v3.46.4 */

    const { window: window_1 } = globals;

    function create_fragment$k(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t;
    	let div1_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr(div0, "class", div0_class_value = "" + (/*grow*/ ctx[0] + " resize" + " svelte-1e8v8ud"));
    			attr(div1, "style", div1_style_value = "" + ((/*grow*/ ctx[0] == 'left' ? 'width' : 'height') + ": " + /*size*/ ctx[2] + "px"));
    			attr(div1, "class", "svelte-1e8v8ud");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div1, t);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window_1, "mousemove", /*mousemove_handler*/ ctx[5]),
    					listen(window_1, "mouseup", /*mouseup_handler*/ ctx[6]),
    					listen(div0, "mousedown", /*mousedown_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*grow*/ 1 && div0_class_value !== (div0_class_value = "" + (/*grow*/ ctx[0] + " resize" + " svelte-1e8v8ud"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*grow, size*/ 5 && div1_style_value !== (div1_style_value = "" + ((/*grow*/ ctx[0] == 'left' ? 'width' : 'height') + ": " + /*size*/ ctx[2] + "px"))) {
    				attr(div1, "style", div1_style_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { grow = 'left' } = $$props;
    	let isResizing = false;
    	let size = 300;

    	const mousemove_handler = e => isResizing && $$invalidate(2, size = grow == 'left'
    	? window.innerWidth - e.x
    	: window.innerHeight - e.y);

    	const mouseup_handler = e => $$invalidate(1, isResizing = false);
    	const mousedown_handler = e => $$invalidate(1, isResizing = true);

    	$$self.$$set = $$props => {
    		if ('grow' in $$props) $$invalidate(0, grow = $$props.grow);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [
    		grow,
    		isResizing,
    		size,
    		$$scope,
    		slots,
    		mousemove_handler,
    		mouseup_handler,
    		mousedown_handler
    	];
    }

    class Panel extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$k, safe_not_equal, { grow: 0 });
    	}
    }

    /* src/nodes/Collapse.svelte generated by Svelte v3.46.4 */

    function create_fragment$j(ctx) {
    	let span;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", span_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-h7v1gg"));
    			toggle_class(span, "selected", /*selected*/ ctx[1]);
    			toggle_class(span, "collapsed", /*collapsed*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*className*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-h7v1gg"))) {
    				attr(span, "class", span_class_value);
    			}

    			if (dirty & /*className, selected*/ 6) {
    				toggle_class(span, "selected", /*selected*/ ctx[1]);
    			}

    			if (dirty & /*className, collapsed*/ 5) {
    				toggle_class(span, "collapsed", /*collapsed*/ ctx[0]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { selected = false } = $$props;
    	let { collapsed } = $$props;
    	let { class: className } = $$props;
    	const click_handler = e => $$invalidate(0, collapsed = !collapsed);

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('class' in $$props) $$invalidate(2, className = $$props.class);
    	};

    	return [collapsed, selected, className, click_handler];
    }

    class Collapse extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$i, create_fragment$j, safe_not_equal, { selected: 1, collapsed: 0, class: 2 });
    	}
    }

    /* src/panel/Editable.svelte generated by Svelte v3.46.4 */

    function create_else_block$8(ctx) {
    	let span;
    	let t_value = JSON.stringify(/*value*/ ctx[0]) + "";
    	let t;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", span_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-1e74dxt"));
    			toggle_class(span, "readOnly", /*readOnly*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*value*/ 1 && t_value !== (t_value = JSON.stringify(/*value*/ ctx[0]) + "")) set_data(t, t_value);

    			if (dirty & /*className*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-1e74dxt"))) {
    				attr(span, "class", span_class_value);
    			}

    			if (dirty & /*className, readOnly*/ 6) {
    				toggle_class(span, "readOnly", /*readOnly*/ ctx[1]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (21:0) {#if isEditing}
    function create_if_block$d(ctx) {
    	let input_1;
    	let input_1_value_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input_1 = element("input");
    			input_1.value = input_1_value_value = JSON.stringify(/*value*/ ctx[0]);
    			attr(input_1, "class", "svelte-1e74dxt");
    		},
    		m(target, anchor) {
    			insert(target, input_1, anchor);
    			/*input_1_binding*/ ctx[6](input_1);

    			if (!mounted) {
    				dispose = [
    					listen(input_1, "keydown", /*keydown_handler*/ ctx[7]),
    					listen(input_1, "blur", /*commit*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*value*/ 1 && input_1_value_value !== (input_1_value_value = JSON.stringify(/*value*/ ctx[0])) && input_1.value !== input_1_value_value) {
    				input_1.value = input_1_value_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(input_1);
    			/*input_1_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*isEditing*/ ctx[4]) return create_if_block$d;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { readOnly } = $$props;
    	let { class: className } = $$props;
    	const dispatch = createEventDispatcher();

    	function commit(e) {
    		$$invalidate(4, isEditing = false);
    		dispatch('change', e.target.value);
    	}

    	let isEditing = false;
    	let input;

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	const keydown_handler = e => e.key == 'Enter' && commit(e);
    	const click_handler = () => $$invalidate(4, isEditing = !readOnly);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('readOnly' in $$props) $$invalidate(1, readOnly = $$props.readOnly);
    		if ('class' in $$props) $$invalidate(2, className = $$props.class);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*input*/ 8) {
    			if (input) input.select();
    		}
    	};

    	return [
    		value,
    		readOnly,
    		className,
    		input,
    		isEditing,
    		commit,
    		input_1_binding,
    		keydown_handler,
    		click_handler
    	];
    }

    class Editable extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$i, safe_not_equal, { value: 0, readOnly: 1, class: 2 });
    	}
    }

    /* src/panel/CollapsableValue.svelte generated by Svelte v3.46.4 */

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i][0];
    	child_ctx[13] = list[i][1];
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (73:29) 
    function create_if_block_7(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_8, create_if_block_10, create_if_block_11, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (dirty & /*value*/ 4) show_if = null;
    		if (/*value*/ ctx[2].__isFunction) return 0;
    		if (/*value*/ ctx[2].__isSymbol) return 1;
    		if (show_if == null) show_if = !!Object.keys(/*value*/ ctx[2]).length;
    		if (show_if) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type_2(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (54:33) 
    function create_if_block_4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*value*/ ctx[2].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (50:50) 
    function create_if_block_3(ctx) {
    	let t0;
    	let t1;
    	let editable;
    	let current;

    	editable = new Editable({
    			props: {
    				class: "number",
    				readOnly: /*readOnly*/ ctx[1],
    				value: /*value*/ ctx[2]
    			}
    		});

    	editable.$on("change", /*change_handler_2*/ ctx[9]);

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(": \n\n    ");
    			create_component(editable.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			mount_component(editable, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    			const editable_changes = {};
    			if (dirty & /*readOnly*/ 2) editable_changes.readOnly = /*readOnly*/ ctx[1];
    			if (dirty & /*value*/ 4) editable_changes.value = /*value*/ ctx[2];
    			editable.$set(editable_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(editable.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(editable.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			destroy_component(editable, detaching);
    		}
    	};
    }

    // (46:66) 
    function create_if_block_2$5(ctx) {
    	let t0;
    	let t1;
    	let editable;
    	let current;

    	editable = new Editable({
    			props: {
    				class: "null",
    				readOnly: /*readOnly*/ ctx[1],
    				value: /*value*/ ctx[2]
    			}
    		});

    	editable.$on("change", /*change_handler_1*/ ctx[8]);

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(": \n\n    ");
    			create_component(editable.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			mount_component(editable, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    			const editable_changes = {};
    			if (dirty & /*readOnly*/ 2) editable_changes.readOnly = /*readOnly*/ ctx[1];
    			if (dirty & /*value*/ 4) editable_changes.value = /*value*/ ctx[2];
    			editable.$set(editable_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(editable.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(editable.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			destroy_component(editable, detaching);
    		}
    	};
    }

    // (42:2) {#if type == 'string'}
    function create_if_block_1$9(ctx) {
    	let t0;
    	let t1;
    	let editable;
    	let current;

    	editable = new Editable({
    			props: {
    				class: "string",
    				readOnly: /*readOnly*/ ctx[1],
    				value: /*value*/ ctx[2]
    			}
    		});

    	editable.$on("change", /*change_handler*/ ctx[7]);

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(": \n\n    ");
    			create_component(editable.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			mount_component(editable, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    			const editable_changes = {};
    			if (dirty & /*readOnly*/ 2) editable_changes.readOnly = /*readOnly*/ ctx[1];
    			if (dirty & /*value*/ 4) editable_changes.value = /*value*/ ctx[2];
    			editable.$set(editable_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(editable.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(editable.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			destroy_component(editable, detaching);
    		}
    	};
    }

    // (101:4) {:else}
    function create_else_block_1$1(ctx) {
    	let t0;
    	let t1;
    	let span;

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(": \n      ");
    			span = element("span");
    			span.textContent = "Object { }";
    			attr(span, "class", "object svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (84:40) 
    function create_if_block_11(ctx) {
    	let collapse;
    	let t0;
    	let t1;
    	let t2;
    	let span;
    	let t4;
    	let if_block_anchor;
    	let current;

    	collapse = new Collapse({
    			props: {
    				class: "collapse",
    				collapsed: /*collapsed*/ ctx[4]
    			}
    		});

    	let if_block = !/*collapsed*/ ctx[4] && create_if_block_12(ctx);

    	return {
    		c() {
    			create_component(collapse.$$.fragment);
    			t0 = space();
    			t1 = text(/*key*/ ctx[3]);
    			t2 = text(": \n      ");
    			span = element("span");
    			span.textContent = "Object {…}";
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(span, "class", "object svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			mount_component(collapse, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, span, anchor);
    			insert(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const collapse_changes = {};
    			if (dirty & /*collapsed*/ 16) collapse_changes.collapsed = /*collapsed*/ ctx[4];
    			collapse.$set(collapse_changes);
    			if (!current || dirty & /*key*/ 8) set_data(t1, /*key*/ ctx[3]);

    			if (!/*collapsed*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_12(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(collapse, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(span);
    			if (detaching) detach(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (81:31) 
    function create_if_block_10(ctx) {
    	let t0;
    	let t1;
    	let span;
    	let t2_value = (/*value*/ ctx[2].name || 'Symbol()') + "";
    	let t2;

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(": \n      ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr(span, "class", "symbol svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    			append(span, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    			if (dirty & /*value*/ 4 && t2_value !== (t2_value = (/*value*/ ctx[2].name || 'Symbol()') + "")) set_data(t2, t2_value);
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (74:4) {#if value.__isFunction}
    function create_if_block_8(ctx) {
    	let collapse;
    	let t0;
    	let t1;
    	let t2;
    	let span;
    	let t3;
    	let t4_value = (/*value*/ ctx[2].name || '') + "";
    	let t4;
    	let t5;
    	let t6;
    	let if_block_anchor;
    	let current;

    	collapse = new Collapse({
    			props: {
    				class: "collapse",
    				collapsed: /*collapsed*/ ctx[4]
    			}
    		});

    	let if_block = !/*collapsed*/ ctx[4] && create_if_block_9(ctx);

    	return {
    		c() {
    			create_component(collapse.$$.fragment);
    			t0 = space();
    			t1 = text(/*key*/ ctx[3]);
    			t2 = text(": \n      ");
    			span = element("span");
    			t3 = text("function ");
    			t4 = text(t4_value);
    			t5 = text(" ()");
    			t6 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(span, "class", "function svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			mount_component(collapse, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, span, anchor);
    			append(span, t3);
    			append(span, t4);
    			append(span, t5);
    			insert(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const collapse_changes = {};
    			if (dirty & /*collapsed*/ 16) collapse_changes.collapsed = /*collapsed*/ ctx[4];
    			collapse.$set(collapse_changes);
    			if (!current || dirty & /*key*/ 8) set_data(t1, /*key*/ ctx[3]);
    			if ((!current || dirty & /*value*/ 4) && t4_value !== (t4_value = (/*value*/ ctx[2].name || '') + "")) set_data(t4, t4_value);

    			if (!/*collapsed*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(collapse, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(span);
    			if (detaching) detach(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (88:6) {#if !collapsed}
    function create_if_block_12(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value_1 = Object.entries(/*value*/ ctx[2]);
    	const get_key = ctx => /*key*/ ctx[3];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*readOnly, Object, value, dispatch, stringify*/ 70) {
    				each_value_1 = Object.entries(/*value*/ ctx[2]);
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, outro_and_destroy_block, create_each_block_1$2, null, get_each_context_1$2);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    // (90:10) {#each Object.entries(value) as [key, v] (key)}
    function create_each_block_1$2(key_2, ctx) {
    	let first;
    	let collapsablevalue;
    	let current;

    	function change_handler_4(...args) {
    		return /*change_handler_4*/ ctx[11](/*key*/ ctx[3], ...args);
    	}

    	collapsablevalue = new CollapsableValue({
    			props: {
    				readOnly: /*readOnly*/ ctx[1],
    				key: /*key*/ ctx[3],
    				value: /*v*/ ctx[13]
    			}
    		});

    	collapsablevalue.$on("change", change_handler_4);

    	return {
    		key: key_2,
    		first: null,
    		c() {
    			first = empty();
    			create_component(collapsablevalue.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(collapsablevalue, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const collapsablevalue_changes = {};
    			if (dirty & /*readOnly*/ 2) collapsablevalue_changes.readOnly = /*readOnly*/ ctx[1];
    			if (dirty & /*value*/ 4) collapsablevalue_changes.key = /*key*/ ctx[3];
    			if (dirty & /*value*/ 4) collapsablevalue_changes.value = /*v*/ ctx[13];
    			collapsablevalue.$set(collapsablevalue_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapsablevalue.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapsablevalue.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(collapsablevalue, detaching);
    		}
    	};
    }

    // (78:6) {#if !collapsed}
    function create_if_block_9(ctx) {
    	let pre;
    	let t_value = /*value*/ ctx[2].source + "";
    	let t;

    	return {
    		c() {
    			pre = element("pre");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, pre, anchor);
    			append(pre, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*value*/ 4 && t_value !== (t_value = /*value*/ ctx[2].source + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(pre);
    		}
    	};
    }

    // (72:4) {:else}
    function create_else_block$7(ctx) {
    	let t0;
    	let t1;
    	let span;

    	return {
    		c() {
    			t0 = text(/*key*/ ctx[3]);
    			t1 = text(":  ");
    			span = element("span");
    			span.textContent = "Array []";
    			attr(span, "class", "object svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*key*/ 8) set_data(t0, /*key*/ ctx[3]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (55:4) {#if value.length}
    function create_if_block_5(ctx) {
    	let collapse;
    	let t0;
    	let t1;
    	let t2;
    	let span;
    	let t3;
    	let t4_value = /*value*/ ctx[2].length + "";
    	let t4;
    	let t5;
    	let t6;
    	let if_block_anchor;
    	let current;

    	collapse = new Collapse({
    			props: {
    				class: "collapse",
    				collapsed: /*collapsed*/ ctx[4]
    			}
    		});

    	let if_block = !/*collapsed*/ ctx[4] && create_if_block_6(ctx);

    	return {
    		c() {
    			create_component(collapse.$$.fragment);
    			t0 = space();
    			t1 = text(/*key*/ ctx[3]);
    			t2 = text(": \n      ");
    			span = element("span");
    			t3 = text("Array [");
    			t4 = text(t4_value);
    			t5 = text("]");
    			t6 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(span, "class", "object svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			mount_component(collapse, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, span, anchor);
    			append(span, t3);
    			append(span, t4);
    			append(span, t5);
    			insert(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const collapse_changes = {};
    			if (dirty & /*collapsed*/ 16) collapse_changes.collapsed = /*collapsed*/ ctx[4];
    			collapse.$set(collapse_changes);
    			if (!current || dirty & /*key*/ 8) set_data(t1, /*key*/ ctx[3]);
    			if ((!current || dirty & /*value*/ 4) && t4_value !== (t4_value = /*value*/ ctx[2].length + "")) set_data(t4, t4_value);

    			if (!/*collapsed*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(collapse, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(span);
    			if (detaching) detach(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (59:6) {#if !collapsed}
    function create_if_block_6(ctx) {
    	let ul;
    	let current;
    	let each_value = /*value*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*readOnly, value, dispatch, stringify*/ 70) {
    				each_value = /*value*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (61:10) {#each value as v, key}
    function create_each_block$6(ctx) {
    	let collapsablevalue;
    	let current;

    	function change_handler_3(...args) {
    		return /*change_handler_3*/ ctx[10](/*key*/ ctx[3], ...args);
    	}

    	collapsablevalue = new CollapsableValue({
    			props: {
    				readOnly: /*readOnly*/ ctx[1],
    				key: /*key*/ ctx[3],
    				value: /*v*/ ctx[13]
    			}
    		});

    	collapsablevalue.$on("change", change_handler_3);

    	return {
    		c() {
    			create_component(collapsablevalue.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(collapsablevalue, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const collapsablevalue_changes = {};
    			if (dirty & /*readOnly*/ 2) collapsablevalue_changes.readOnly = /*readOnly*/ ctx[1];
    			if (dirty & /*value*/ 4) collapsablevalue_changes.value = /*v*/ ctx[13];
    			collapsablevalue.$set(collapsablevalue_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapsablevalue.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapsablevalue.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(collapsablevalue, detaching);
    		}
    	};
    }

    // (106:2) {#if errorMessage}
    function create_if_block$c(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "!";
    			attr(span, "class", "error svelte-19h4tbk");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let li;
    	let show_if;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block_1$9,
    		create_if_block_2$5,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_7
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*value*/ 4) show_if = null;
    		if (/*type*/ ctx[5] == 'string') return 0;
    		if (/*value*/ ctx[2] == null || /*value*/ ctx[2] == undefined || /*value*/ ctx[2] != /*value*/ ctx[2]) return 1;
    		if (/*type*/ ctx[5] == 'number' || /*type*/ ctx[5] == 'boolean') return 2;
    		if (show_if == null) show_if = !!Array.isArray(/*value*/ ctx[2]);
    		if (show_if) return 3;
    		if (/*type*/ ctx[5] == 'object') return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx, -1))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*errorMessage*/ ctx[0] && create_if_block$c();
    	let li_levels = [{ 'data-tooltip': /*errorMessage*/ ctx[0] }];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	return {
    		c() {
    			li = element("li");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			set_attributes(li, li_data);
    			toggle_class(li, "svelte-19h4tbk", true);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(li, null);
    			}

    			append(li, t);
    			if (if_block1) if_block1.m(li, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(li, "click", stop_propagation(/*click_handler*/ ctx[12]));
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(li, t);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*errorMessage*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$c();
    					if_block1.c();
    					if_block1.m(li, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [dirty & /*errorMessage*/ 1 && { 'data-tooltip': /*errorMessage*/ ctx[0] }]));
    			toggle_class(li, "svelte-19h4tbk", true);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function stringify$1(value, k, v) {
    	if (Array.isArray(value)) return `[${value.map((value, i) => i == k ? v : stringify$1(value)).join(',')}]`;
    	if (value === null) return 'null';
    	if (value === undefined) return 'undefined';

    	switch (typeof value) {
    		case 'string':
    			return `"${value}"`;
    		case 'number':
    			return value.toString();
    		case 'object':
    			return `{${Object.entries(value).map(([key, value]) => `"${key}":${key == k ? v : stringify$1(value)}`).join(',')}}`;
    	}
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let type;
    	let { errorMessage } = $$props;
    	let { readOnly } = $$props;
    	let { value } = $$props;
    	let { key } = $$props;
    	const dispatch = createEventDispatcher();
    	let collapsed = true;

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	const change_handler_3 = (key, e) => dispatch('change', stringify$1(value, key, e.detail));
    	const change_handler_4 = (key, e) => dispatch('change', stringify$1(value, key, e.detail));
    	const click_handler = e => $$invalidate(4, collapsed = !collapsed);

    	$$self.$$set = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    		if ('readOnly' in $$props) $$invalidate(1, readOnly = $$props.readOnly);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('key' in $$props) $$invalidate(3, key = $$props.key);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 4) {
    			$$invalidate(5, type = typeof value);
    		}
    	};

    	return [
    		errorMessage,
    		readOnly,
    		value,
    		key,
    		collapsed,
    		type,
    		dispatch,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3,
    		change_handler_4,
    		click_handler
    	];
    }

    class CollapsableValue extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$g, create_fragment$h, safe_not_equal, {
    			errorMessage: 0,
    			readOnly: 1,
    			value: 2,
    			key: 3
    		});
    	}
    }

    /* src/panel/PropertyList.svelte generated by Svelte v3.46.4 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].key;
    	child_ctx[8] = list[i].value;
    	return child_ctx;
    }

    // (37:0) {:else}
    function create_else_block$6(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "None";
    			attr(div, "class", "empty svelte-kz400h");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (25:0) {#if entries.length}
    function create_if_block$b(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*entries*/ ctx[1];
    	const get_key = ctx => /*key*/ ctx[7];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-kz400h");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*errorMessages, entries, readOnly, change*/ 30) {
    				each_value = /*entries*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    // (27:4) {#each entries as { key, value }
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let collapsablevalue;
    	let current;

    	function change_handler(...args) {
    		return /*change_handler*/ ctx[6](/*key*/ ctx[7], ...args);
    	}

    	collapsablevalue = new CollapsableValue({
    			props: {
    				errorMessage: /*errorMessages*/ ctx[3][/*key*/ ctx[7]],
    				readOnly: /*readOnly*/ ctx[2],
    				key: /*key*/ ctx[7],
    				value: /*value*/ ctx[8]
    			}
    		});

    	collapsablevalue.$on("change", change_handler);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(collapsablevalue.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(collapsablevalue, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const collapsablevalue_changes = {};
    			if (dirty & /*errorMessages, entries*/ 10) collapsablevalue_changes.errorMessage = /*errorMessages*/ ctx[3][/*key*/ ctx[7]];
    			if (dirty & /*readOnly*/ 4) collapsablevalue_changes.readOnly = /*readOnly*/ ctx[2];
    			if (dirty & /*entries*/ 2) collapsablevalue_changes.key = /*key*/ ctx[7];
    			if (dirty & /*entries*/ 2) collapsablevalue_changes.value = /*value*/ ctx[8];
    			collapsablevalue.$set(collapsablevalue_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapsablevalue.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapsablevalue.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(collapsablevalue, detaching);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$b, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*entries*/ ctx[1].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			h1 = element("h1");
    			t0 = text(/*header*/ ctx[0]);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr(h1, "class", "svelte-kz400h");
    		},
    		m(target, anchor) {
    			insert(target, h1, anchor);
    			append(h1, t0);
    			insert(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*header*/ 1) set_data(t0, /*header*/ ctx[0]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h1);
    			if (detaching) detach(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { header } = $$props;
    	let { entries = [] } = $$props;
    	let { id } = $$props;
    	let { readOnly = false } = $$props;
    	let errorMessages = {};

    	function change(key, value) {
    		chrome$1.devtools.inspectedWindow.eval(`__svelte_devtools_inject_state(${id}, '${key}', ${value})`, (result, error) => $$invalidate(
    			3,
    			errorMessages[key] = error && error.isException
    			? error.value.substring(0, error.value.indexOf('\n'))
    			: undefined,
    			errorMessages
    		));
    	}

    	const change_handler = (key, e) => change(key, e.detail);

    	$$self.$$set = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('entries' in $$props) $$invalidate(1, entries = $$props.entries);
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('readOnly' in $$props) $$invalidate(2, readOnly = $$props.readOnly);
    	};

    	return [header, entries, readOnly, errorMessages, change, id, change_handler];
    }

    class PropertyList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$f, create_fragment$g, safe_not_equal, {
    			header: 0,
    			entries: 1,
    			id: 5,
    			readOnly: 2
    		});
    	}
    }

    /* src/panel/ComponentView.svelte generated by Svelte v3.46.4 */

    function create_default_slot_2$1(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M4.5 4a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h7a.5.5 0 0 0\n            .5-.5v-7a.5.5 0 0 0-.5-.5h-7zM2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0\n            0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7M.5\n            7.5a.5.5 0 0 0 0 1H2v-1H.5zM14 7.5h1.5a.5.5 0 0 1 0 1H14v-1zM8 0c.28\n            0 .5.22.5.5V2h-1V.5c0-.28.22-.5.5-.5zM8.5 14v1.5a.5.5 0 0 1-1\n            0V14h1z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (12:4) <Toolbar>
    function create_default_slot_1$1(ctx) {
    	let div;
    	let t;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				disabled: /*$selectedNode*/ ctx[0].id === undefined,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler*/ ctx[1]);

    	return {
    		c() {
    			div = element("div");
    			t = space();
    			create_component(button.$$.fragment);
    			attr(div, "class", "spacer svelte-1kafhyl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*$selectedNode*/ 1) button_changes.disabled = /*$selectedNode*/ ctx[0].id === undefined;

    			if (dirty & /*$$scope*/ 4) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t);
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (48:46) 
    function create_if_block_2$4(ctx) {
    	let propertylist;
    	let current;

    	propertylist = new PropertyList({
    			props: {
    				readOnly: true,
    				id: /*$selectedNode*/ ctx[0].id,
    				header: "Attributes",
    				entries: /*$selectedNode*/ ctx[0].detail.attributes
    			}
    		});

    	return {
    		c() {
    			create_component(propertylist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(propertylist, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const propertylist_changes = {};
    			if (dirty & /*$selectedNode*/ 1) propertylist_changes.id = /*$selectedNode*/ ctx[0].id;
    			if (dirty & /*$selectedNode*/ 1) propertylist_changes.entries = /*$selectedNode*/ ctx[0].detail.attributes;
    			propertylist.$set(propertylist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(propertylist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(propertylist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(propertylist, detaching);
    		}
    	};
    }

    // (41:81) 
    function create_if_block_1$8(ctx) {
    	let propertylist;
    	let current;

    	propertylist = new PropertyList({
    			props: {
    				readOnly: true,
    				id: /*$selectedNode*/ ctx[0].id,
    				header: "State",
    				entries: /*$selectedNode*/ ctx[0].detail.ctx
    			}
    		});

    	return {
    		c() {
    			create_component(propertylist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(propertylist, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const propertylist_changes = {};
    			if (dirty & /*$selectedNode*/ 1) propertylist_changes.id = /*$selectedNode*/ ctx[0].id;
    			if (dirty & /*$selectedNode*/ 1) propertylist_changes.entries = /*$selectedNode*/ ctx[0].detail.ctx;
    			propertylist.$set(propertylist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(propertylist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(propertylist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(propertylist, detaching);
    		}
    	};
    }

    // (30:4) {#if $selectedNode.type == 'component'}
    function create_if_block$a(ctx) {
    	let propertylist0;
    	let t;
    	let propertylist1;
    	let current;

    	propertylist0 = new PropertyList({
    			props: {
    				id: /*$selectedNode*/ ctx[0].id,
    				header: "Props",
    				entries: /*$selectedNode*/ ctx[0].detail.attributes
    			}
    		});

    	propertylist1 = new PropertyList({
    			props: {
    				id: /*$selectedNode*/ ctx[0].id,
    				header: "State",
    				entries: /*$selectedNode*/ ctx[0].detail.ctx
    			}
    		});

    	return {
    		c() {
    			create_component(propertylist0.$$.fragment);
    			t = space();
    			create_component(propertylist1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(propertylist0, target, anchor);
    			insert(target, t, anchor);
    			mount_component(propertylist1, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const propertylist0_changes = {};
    			if (dirty & /*$selectedNode*/ 1) propertylist0_changes.id = /*$selectedNode*/ ctx[0].id;
    			if (dirty & /*$selectedNode*/ 1) propertylist0_changes.entries = /*$selectedNode*/ ctx[0].detail.attributes;
    			propertylist0.$set(propertylist0_changes);
    			const propertylist1_changes = {};
    			if (dirty & /*$selectedNode*/ 1) propertylist1_changes.id = /*$selectedNode*/ ctx[0].id;
    			if (dirty & /*$selectedNode*/ 1) propertylist1_changes.entries = /*$selectedNode*/ ctx[0].detail.ctx;
    			propertylist1.$set(propertylist1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(propertylist0.$$.fragment, local);
    			transition_in(propertylist1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(propertylist0.$$.fragment, local);
    			transition_out(propertylist1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(propertylist0, detaching);
    			if (detaching) detach(t);
    			destroy_component(propertylist1, detaching);
    		}
    	};
    }

    // (10:0) <Panel>
    function create_default_slot$3(ctx) {
    	let div;
    	let toolbar;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	toolbar = new Toolbar({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	const if_block_creators = [create_if_block$a, create_if_block_1$8, create_if_block_2$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$selectedNode*/ ctx[0].type == 'component') return 0;
    		if (/*$selectedNode*/ ctx[0].type == 'block' || /*$selectedNode*/ ctx[0].type == 'iteration') return 1;
    		if (/*$selectedNode*/ ctx[0].type == 'element') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			div = element("div");
    			create_component(toolbar.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr(div, "class", "root svelte-1kafhyl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(toolbar, div, null);
    			append(div, t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			const toolbar_changes = {};

    			if (dirty & /*$$scope, $selectedNode*/ 5) {
    				toolbar_changes.$$scope = { dirty, ctx };
    			}

    			toolbar.$set(toolbar_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(toolbar);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let panel;
    	let current;

    	panel = new Panel({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(panel.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(panel, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const panel_changes = {};

    			if (dirty & /*$$scope, $selectedNode*/ 5) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			panel.$set(panel_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(panel.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(panel.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(panel, detaching);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $selectedNode;
    	component_subscribe($$self, selectedNode, $$value => $$invalidate(0, $selectedNode = $$value));
    	const click_handler = e => chrome$1.devtools.inspectedWindow.eval('inspect(window.$s)');
    	return [$selectedNode, click_handler];
    }

    class ComponentView extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$e, create_fragment$f, safe_not_equal, {});
    	}
    }

    /* src/profiler/Operation.svelte generated by Svelte v3.46.4 */

    function create_fragment$e(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*frame*/ ctx[0].node.tagName + "";
    	let t1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			t0 = text("‌\n  ");
    			span = element("span");
    			t1 = text(t1_value);
    			attr(div, "class", div_class_value = "" + (null_to_empty(/*frame*/ ctx[0].type) + " svelte-11jbbiy"));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, span);
    			append(span, t1);

    			if (!mounted) {
    				dispose = listen(div, "click", /*click_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*frame*/ 1 && t1_value !== (t1_value = /*frame*/ ctx[0].node.tagName + "")) set_data(t1, t1_value);

    			if (dirty & /*frame*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(/*frame*/ ctx[0].type) + " svelte-11jbbiy"))) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { frame } = $$props;
    	const click_handler = () => dispatch('click', frame);

    	$$self.$$set = $$props => {
    		if ('frame' in $$props) $$invalidate(0, frame = $$props.frame);
    	};

    	return [frame, dispatch, click_handler];
    }

    class Operation extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, { frame: 0 });
    	}
    }

    /* src/profiler/Frame.svelte generated by Svelte v3.46.4 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (8:0) {#if children}
    function create_if_block$9(ctx) {
    	let ul;
    	let current;
    	let each_value = /*children*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-1xgh790");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*children, duration*/ 3) {
    				each_value = /*children*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (10:4) {#each children as child, i}
    function create_each_block$4(ctx) {
    	let li;
    	let operation;
    	let t0;
    	let frame;
    	let t1;
    	let current;
    	operation = new Operation({ props: { frame: /*child*/ ctx[4] } });
    	operation.$on("click", /*click_handler*/ ctx[2]);
    	const frame_spread_levels = [/*child*/ ctx[4]];
    	let frame_props = {};

    	for (let i = 0; i < frame_spread_levels.length; i += 1) {
    		frame_props = assign(frame_props, frame_spread_levels[i]);
    	}

    	frame = new Frame({ props: frame_props });
    	frame.$on("click", /*click_handler_1*/ ctx[3]);

    	return {
    		c() {
    			li = element("li");
    			create_component(operation.$$.fragment);
    			t0 = space();
    			create_component(frame.$$.fragment);
    			t1 = space();
    			set_style(li, "width", /*child*/ ctx[4].duration / /*duration*/ ctx[1] * 100 + "%");
    			attr(li, "class", "svelte-1xgh790");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			mount_component(operation, li, null);
    			append(li, t0);
    			mount_component(frame, li, null);
    			append(li, t1);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const operation_changes = {};
    			if (dirty & /*children*/ 1) operation_changes.frame = /*child*/ ctx[4];
    			operation.$set(operation_changes);

    			const frame_changes = (dirty & /*children*/ 1)
    			? get_spread_update(frame_spread_levels, [get_spread_object(/*child*/ ctx[4])])
    			: {};

    			frame.$set(frame_changes);

    			if (!current || dirty & /*children, duration*/ 3) {
    				set_style(li, "width", /*child*/ ctx[4].duration / /*duration*/ ctx[1] * 100 + "%");
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(operation.$$.fragment, local);
    			transition_in(frame.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(operation.$$.fragment, local);
    			transition_out(frame.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			destroy_component(operation);
    			destroy_component(frame);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*children*/ ctx[0] && create_if_block$9(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*children*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*children*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { children } = $$props;
    	let { duration } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('children' in $$props) $$invalidate(0, children = $$props.children);
    		if ('duration' in $$props) $$invalidate(1, duration = $$props.duration);
    	};

    	return [children, duration, click_handler, click_handler_1];
    }

    class Frame extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$d, safe_not_equal, { children: 0, duration: 1 });
    	}
    }

    /* src/profiler/Profiler.svelte generated by Svelte v3.46.4 */

    function create_else_block_1(ctx) {
    	let profilebutton;
    	let current;
    	profilebutton = new ProfileButton({});

    	return {
    		c() {
    			create_component(profilebutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profilebutton, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i(local) {
    			if (current) return;
    			transition_in(profilebutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profilebutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profilebutton, detaching);
    		}
    	};
    }

    // (26:2) {#if top}
    function create_if_block_2$3(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler*/ ctx[6]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (27:4) <Button on:click={() => (top = null)}>
    function create_default_slot_3(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M12.7,1.4 11.3,0l-8,8 8,8 1.4,-1.4L6,8Z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (35:2) <Button     on:click={() => {       $profileFrame = {}       top = null       selected = null     }}   >
    function create_default_slot_2(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "m2.7,14.2 c 0,1 0.8,1.8 1.8,1.8h7c1,0 1.8,-0.8\n        1.8,-1.8V3.6H2.7ZM14.2,0.9H11L10.2,0H5.8L4.9,0.9H1.8V2.7h12.5z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 16 16");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (25:0) <Toolbar>
    function create_default_slot_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let button;
    	let current;
    	const if_block_creators = [create_if_block_2$3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*top*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_1*/ ctx[7]);

    	return {
    		c() {
    			if_block.c();
    			t = space();
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, t, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(t.parentNode, t);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(t);
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (53:2) {:else}
    function create_else_block$5(ctx) {
    	let p;

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "Nothing to display. Perform an action or refresh the page.";
    			attr(p, "class", "svelte-1e93on8");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (51:2) {#if children.length}
    function create_if_block_1$7(ctx) {
    	let frame;
    	let current;

    	frame = new Frame({
    			props: {
    				children: /*children*/ ctx[1],
    				duration: /*duration*/ ctx[4]
    			}
    		});

    	frame.$on("click", /*handleClick*/ ctx[5]);

    	return {
    		c() {
    			create_component(frame.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(frame, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const frame_changes = {};
    			if (dirty & /*children*/ 2) frame_changes.children = /*children*/ ctx[1];
    			if (dirty & /*duration*/ 16) frame_changes.duration = /*duration*/ ctx[4];
    			frame.$set(frame_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(frame.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(frame.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(frame, detaching);
    		}
    	};
    }

    // (57:0) {#if selected}
    function create_if_block$8(ctx) {
    	let panel;
    	let current;

    	panel = new Panel({
    			props: {
    				grow: "up",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(panel.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(panel, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const panel_changes = {};

    			if (dirty & /*$$scope, selected*/ 264) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			panel.$set(panel_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(panel.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(panel.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(panel, detaching);
    		}
    	};
    }

    // (58:2) <Panel grow="up">
    function create_default_slot$2(ctx) {
    	let div6;
    	let div0;
    	let span0;
    	let t1;
    	let t2_value = /*selected*/ ctx[3].node.tagName + "";
    	let t2;
    	let t3;
    	let t4_value = /*selected*/ ctx[3].node.id + "";
    	let t4;
    	let t5;
    	let t6;
    	let div1;
    	let span1;
    	let t8;
    	let t9_value = round(/*selected*/ ctx[3].start) + "";
    	let t9;
    	let t10;
    	let t11;
    	let div2;
    	let span2;
    	let t13;
    	let t14_value = /*selected*/ ctx[3].type + "";
    	let t14;
    	let t15;
    	let div3;
    	let span3;
    	let t17;
    	let t18_value = /*selected*/ ctx[3].node.type + "";
    	let t18;
    	let t19;
    	let div4;
    	let span4;
    	let t21;
    	let t22_value = round(/*selected*/ ctx[3].end) + "";
    	let t22;
    	let t23;
    	let t24;
    	let div5;
    	let span5;
    	let t26;
    	let t27_value = round(/*selected*/ ctx[3].children.reduce(func, /*selected*/ ctx[3].duration)) + "";
    	let t27;
    	let t28;
    	let t29_value = round(/*selected*/ ctx[3].duration) + "";
    	let t29;
    	let t30;

    	return {
    		c() {
    			div6 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Tag name";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(" (#");
    			t4 = text(t4_value);
    			t5 = text(")");
    			t6 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Start";
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = text("ms");
    			t11 = space();
    			div2 = element("div");
    			span2 = element("span");
    			span2.textContent = "Operation";
    			t13 = space();
    			t14 = text(t14_value);
    			t15 = space();
    			div3 = element("div");
    			span3 = element("span");
    			span3.textContent = "Block type";
    			t17 = space();
    			t18 = text(t18_value);
    			t19 = space();
    			div4 = element("div");
    			span4 = element("span");
    			span4.textContent = "End";
    			t21 = space();
    			t22 = text(t22_value);
    			t23 = text("ms");
    			t24 = space();
    			div5 = element("div");
    			span5 = element("span");
    			span5.textContent = "Duration";
    			t26 = space();
    			t27 = text(t27_value);
    			t28 = text("ms of ");
    			t29 = text(t29_value);
    			t30 = text("ms");
    			attr(span0, "class", "svelte-1e93on8");
    			attr(div0, "class", "svelte-1e93on8");
    			attr(span1, "class", "svelte-1e93on8");
    			attr(div1, "class", "svelte-1e93on8");
    			attr(span2, "class", "svelte-1e93on8");
    			attr(div2, "class", "svelte-1e93on8");
    			attr(span3, "class", "svelte-1e93on8");
    			attr(div3, "class", "svelte-1e93on8");
    			attr(span4, "class", "svelte-1e93on8");
    			attr(div4, "class", "svelte-1e93on8");
    			attr(span5, "class", "svelte-1e93on8");
    			attr(div5, "class", "svelte-1e93on8");
    			attr(div6, "class", "panel svelte-1e93on8");
    		},
    		m(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div0);
    			append(div0, span0);
    			append(div0, t1);
    			append(div0, t2);
    			append(div0, t3);
    			append(div0, t4);
    			append(div0, t5);
    			append(div6, t6);
    			append(div6, div1);
    			append(div1, span1);
    			append(div1, t8);
    			append(div1, t9);
    			append(div1, t10);
    			append(div6, t11);
    			append(div6, div2);
    			append(div2, span2);
    			append(div2, t13);
    			append(div2, t14);
    			append(div6, t15);
    			append(div6, div3);
    			append(div3, span3);
    			append(div3, t17);
    			append(div3, t18);
    			append(div6, t19);
    			append(div6, div4);
    			append(div4, span4);
    			append(div4, t21);
    			append(div4, t22);
    			append(div4, t23);
    			append(div6, t24);
    			append(div6, div5);
    			append(div5, span5);
    			append(div5, t26);
    			append(div5, t27);
    			append(div5, t28);
    			append(div5, t29);
    			append(div5, t30);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*selected*/ 8 && t2_value !== (t2_value = /*selected*/ ctx[3].node.tagName + "")) set_data(t2, t2_value);
    			if (dirty & /*selected*/ 8 && t4_value !== (t4_value = /*selected*/ ctx[3].node.id + "")) set_data(t4, t4_value);
    			if (dirty & /*selected*/ 8 && t9_value !== (t9_value = round(/*selected*/ ctx[3].start) + "")) set_data(t9, t9_value);
    			if (dirty & /*selected*/ 8 && t14_value !== (t14_value = /*selected*/ ctx[3].type + "")) set_data(t14, t14_value);
    			if (dirty & /*selected*/ 8 && t18_value !== (t18_value = /*selected*/ ctx[3].node.type + "")) set_data(t18, t18_value);
    			if (dirty & /*selected*/ 8 && t22_value !== (t22_value = round(/*selected*/ ctx[3].end) + "")) set_data(t22, t22_value);
    			if (dirty & /*selected*/ 8 && t27_value !== (t27_value = round(/*selected*/ ctx[3].children.reduce(func, /*selected*/ ctx[3].duration)) + "")) set_data(t27, t27_value);
    			if (dirty & /*selected*/ 8 && t29_value !== (t29_value = round(/*selected*/ ctx[3].duration) + "")) set_data(t29, t29_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div6);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let toolbar;
    	let t0;
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let if_block1_anchor;
    	let current;

    	toolbar = new Toolbar({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	const if_block_creators = [create_if_block_1$7, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[1].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*selected*/ ctx[3] && create_if_block$8(ctx);

    	return {
    		c() {
    			create_component(toolbar.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr(div, "class", "frame svelte-1e93on8");
    		},
    		m(target, anchor) {
    			mount_component(toolbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			insert(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const toolbar_changes = {};

    			if (dirty & /*$$scope, $profileFrame, top, selected*/ 269) {
    				toolbar_changes.$$scope = { dirty, ctx };
    			}

    			toolbar.$set(toolbar_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, null);
    			}

    			if (/*selected*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*selected*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(toolbar, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    function round(n) {
    	return Math.round(n * 100) / 100;
    }

    const func = (acc, o) => acc - o.duration;

    function instance$b($$self, $$props, $$invalidate) {
    	let children;
    	let duration;
    	let $profileFrame;
    	component_subscribe($$self, profileFrame, $$value => $$invalidate(2, $profileFrame = $$value));
    	let selected;
    	let top;

    	function handleClick(e) {
    		if (selected == e.detail) $$invalidate(0, top = e.detail); else $$invalidate(3, selected = e.detail);
    	}

    	const click_handler = () => $$invalidate(0, top = null);

    	const click_handler_1 = () => {
    		set_store_value(profileFrame, $profileFrame = {}, $profileFrame);
    		$$invalidate(0, top = null);
    		$$invalidate(3, selected = null);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*top, $profileFrame*/ 5) {
    			$$invalidate(1, children = top ? [top] : $profileFrame.children || []);
    		}

    		if ($$self.$$.dirty & /*children*/ 2) {
    			$$invalidate(4, duration = children.reduce((acc, o) => acc + o.duration, 0));
    		}
    	};

    	return [
    		top,
    		children,
    		$profileFrame,
    		selected,
    		duration,
    		handleClick,
    		click_handler,
    		click_handler_1
    	];
    }

    class Profiler extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, {});
    	}
    }

    /* src/Breadcrumbs.svelte generated by Svelte v3.46.4 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (32:0) {#if breadcrumbList.length > 1}
    function create_if_block$7(ctx) {
    	let ul;
    	let t;
    	let if_block = /*shorttend*/ ctx[3] && create_if_block_2$2();
    	let each_value = /*breadcrumbList*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c() {
    			ul = element("ul");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-1frls2x");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);
    			if (if_block) if_block.m(ul, null);
    			append(ul, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[8](ul);
    		},
    		p(ctx, dirty) {
    			if (/*shorttend*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$2();
    					if_block.c();
    					if_block.m(ul, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*breadcrumbList, $selectedNode, $hoveredNodeId, $visibility*/ 53) {
    				each_value = /*breadcrumbList*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[8](null);
    		}
    	};
    }

    // (34:4) {#if shorttend}
    function create_if_block_2$2(ctx) {
    	let li;

    	return {
    		c() {
    			li = element("li");

    			li.innerHTML = `…
        <div class="svelte-1frls2x"></div>`;

    			attr(li, "class", "svelte-1frls2x");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (41:6) {#if $visibility[node.type]}
    function create_if_block_1$6(ctx) {
    	let li;
    	let t0_value = /*node*/ ctx[10].tagName + "";
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*node*/ ctx[10], ...args);
    	}

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[7](/*node*/ ctx[10], ...args);
    	}

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			attr(div, "class", "svelte-1frls2x");
    			attr(li, "class", "svelte-1frls2x");
    			toggle_class(li, "selected", /*node*/ ctx[10].id == /*$selectedNode*/ ctx[0].id);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    			append(li, div);
    			append(li, t2);

    			if (!mounted) {
    				dispose = [
    					listen(li, "click", click_handler),
    					listen(li, "mouseover", mouseover_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*breadcrumbList*/ 4 && t0_value !== (t0_value = /*node*/ ctx[10].tagName + "")) set_data(t0, t0_value);

    			if (dirty & /*breadcrumbList, $selectedNode*/ 5) {
    				toggle_class(li, "selected", /*node*/ ctx[10].id == /*$selectedNode*/ ctx[0].id);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (40:4) {#each breadcrumbList as node}
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*$visibility*/ ctx[4][/*node*/ ctx[10].type] && create_if_block_1$6(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*$visibility*/ ctx[4][/*node*/ ctx[10].type]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let if_block = /*breadcrumbList*/ ctx[2].length > 1 && create_if_block$7(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*breadcrumbList*/ ctx[2].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $selectedNode;
    	let $visibility;
    	let $hoveredNodeId;
    	component_subscribe($$self, selectedNode, $$value => $$invalidate(0, $selectedNode = $$value));
    	component_subscribe($$self, visibility, $$value => $$invalidate(4, $visibility = $$value));
    	component_subscribe($$self, hoveredNodeId, $$value => $$invalidate(5, $hoveredNodeId = $$value));
    	let root;
    	let breadcrumbList = [];
    	let shorttend;

    	async function setSelectedBreadcrumb(node) {
    		if (breadcrumbList.find(o => o.id == node.id)) return;
    		$$invalidate(2, breadcrumbList = []);

    		while (node && node.tagName) {
    			breadcrumbList.unshift(node);
    			node = node.parent;
    		}

    		$$invalidate(3, shorttend = false);
    		await tick();

    		while (root && root.scrollWidth > root.clientWidth) {
    			breadcrumbList.shift();
    			$$invalidate(3, shorttend = true);
    			$$invalidate(2, breadcrumbList);
    			await tick();
    		}
    	}

    	const click_handler = (node, e) => set_store_value(selectedNode, $selectedNode = node, $selectedNode);
    	const mouseover_handler = (node, e) => set_store_value(hoveredNodeId, $hoveredNodeId = node.id, $hoveredNodeId);

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			root = $$value;
    			$$invalidate(1, root);
    		});
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedNode*/ 1) {
    			setSelectedBreadcrumb($selectedNode);
    		}
    	};

    	return [
    		$selectedNode,
    		root,
    		breadcrumbList,
    		shorttend,
    		$visibility,
    		$hoveredNodeId,
    		click_handler,
    		mouseover_handler,
    		ul_binding
    	];
    }

    class Breadcrumbs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, {});
    	}
    }

    /* src/ConnectMessage.svelte generated by Svelte v3.46.4 */

    function create_fragment$a(ctx) {
    	let div;
    	let p;
    	let t0;
    	let b;
    	let t2;
    	let span;
    	let t4;
    	let t5;
    	let h1;
    	let t7;
    	let ul;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t0 = text("To connect to \n    ");
    			b = element("b");
    			b.textContent = "Svelte";
    			t2 = text("\n     perform a hard refresh (ctrl+F5) or \n    ");
    			span = element("span");
    			span.textContent = "click here";
    			t4 = text("\n    .");
    			t5 = space();
    			h1 = element("h1");
    			h1.textContent = "Not working? Did you...";
    			t7 = space();
    			ul = element("ul");

    			ul.innerHTML = `<li class="svelte-106hgb9">Use Svelte version 3.12.0 or above?</li> 
    <li class="svelte-106hgb9">Build with dev mode enabled?</li>`;

    			attr(span, "class", "button svelte-106hgb9");
    			attr(h1, "class", "svelte-106hgb9");
    			attr(ul, "class", "svelte-106hgb9");
    			attr(div, "class", "root svelte-106hgb9");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(p, b);
    			append(p, t2);
    			append(p, span);
    			append(p, t4);
    			append(div, t5);
    			append(div, h1);
    			append(div, t7);
    			append(div, ul);

    			if (!mounted) {
    				dispose = listen(span, "click", reload);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    class ConnectMessage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* src/nodes/SearchTerm.svelte generated by Svelte v3.46.4 */

    function create_else_block$4(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let t2;

    	return {
    		c() {
    			t0 = text(/*pre*/ ctx[5]);
    			span = element("span");
    			t1 = text(/*highlight*/ ctx[4]);
    			t2 = text(/*post*/ ctx[3]);
    			attr(span, "class", "svelte-q8dzkt");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, span, anchor);
    			append(span, t1);
    			insert(target, t2, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*pre*/ 32) set_data(t0, /*pre*/ ctx[5]);
    			if (dirty & /*highlight*/ 16) set_data(t1, /*highlight*/ ctx[4]);
    			if (dirty & /*post*/ 8) set_data(t2, /*post*/ ctx[3]);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(span);
    			if (detaching) detach(t2);
    		}
    	};
    }

    // (12:0) {#if i == -1 || $searchValue.length < 2}
    function create_if_block$6(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*text*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data(t, /*text*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[1] == -1 || /*$searchValue*/ ctx[2].length < 2) return create_if_block$6;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let i;
    	let pre;
    	let highlight;
    	let post;
    	let $searchValue;
    	component_subscribe($$self, searchValue, $$value => $$invalidate(2, $searchValue = $$value));
    	let { text } = $$props;

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text, $searchValue*/ 5) {
    			$$invalidate(1, i = text ? text.indexOf($searchValue) : -1);
    		}

    		if ($$self.$$.dirty & /*text, i*/ 3) {
    			$$invalidate(5, pre = text ? text.substring(0, i) : '');
    		}

    		if ($$self.$$.dirty & /*text, i, $searchValue*/ 7) {
    			$$invalidate(4, highlight = text ? text.substring(i, i + $searchValue.length) : '');
    		}

    		if ($$self.$$.dirty & /*text, i, $searchValue*/ 7) {
    			$$invalidate(3, post = text ? text.substring(i + $searchValue.length) : '');
    		}
    	};

    	return [text, i, $searchValue, post, highlight, pre];
    }

    class SearchTerm extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { text: 0 });
    	}
    }

    /* src/nodes/ElementAttributes.svelte generated by Svelte v3.46.4 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].event;
    	child_ctx[3] = list[i].handler;
    	child_ctx[4] = list[i].modifiers;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].key;
    	child_ctx[8] = list[i].value;
    	child_ctx[9] = list[i].isBound;
    	child_ctx[10] = list[i].flash;
    	return child_ctx;
    }

    // (12:6) {#if isBound}
    function create_if_block_1$5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("bind:");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (8:0) {#each attributes as { key, value, isBound, flash }
    function create_each_block_1$1(key_1, ctx) {
    	let t0;
    	let span2;
    	let span0;
    	let t1;
    	let searchterm0;
    	let t2;
    	let span1;
    	let searchterm1;
    	let current;
    	let if_block = /*isBound*/ ctx[9] && create_if_block_1$5();
    	searchterm0 = new SearchTerm({ props: { text: /*key*/ ctx[7] } });
    	searchterm1 = new SearchTerm({ props: { text: /*value*/ ctx[8] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			t0 = text(" \n  ");
    			span2 = element("span");
    			span0 = element("span");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(searchterm0.$$.fragment);
    			t2 = text("\n    =\n    ");
    			span1 = element("span");
    			create_component(searchterm1.$$.fragment);
    			attr(span0, "class", "attr-name svelte-1eqzefe");
    			attr(span1, "class", "attr-value svelte-1eqzefe");
    			toggle_class(span2, "flash", /*flash*/ ctx[10]);
    			this.first = t0;
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, span2, anchor);
    			append(span2, span0);
    			if (if_block) if_block.m(span0, null);
    			append(span0, t1);
    			mount_component(searchterm0, span0, null);
    			append(span2, t2);
    			append(span2, span1);
    			mount_component(searchterm1, span1, null);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*isBound*/ ctx[9]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$5();
    					if_block.c();
    					if_block.m(span0, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const searchterm0_changes = {};
    			if (dirty & /*attributes*/ 1) searchterm0_changes.text = /*key*/ ctx[7];
    			searchterm0.$set(searchterm0_changes);
    			const searchterm1_changes = {};
    			if (dirty & /*attributes*/ 1) searchterm1_changes.text = /*value*/ ctx[8];
    			searchterm1.$set(searchterm1_changes);

    			if (dirty & /*attributes*/ 1) {
    				toggle_class(span2, "flash", /*flash*/ ctx[10]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm0.$$.fragment, local);
    			transition_in(searchterm1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm0.$$.fragment, local);
    			transition_out(searchterm1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(span2);
    			if (if_block) if_block.d();
    			destroy_component(searchterm0);
    			destroy_component(searchterm1);
    		}
    	};
    }

    // (30:4) {#if modifiers && modifiers.length}
    function create_if_block$5(ctx) {
    	let t0;
    	let t1_value = /*modifiers*/ ctx[4].join('|') + "";
    	let t1;

    	return {
    		c() {
    			t0 = text("|");
    			t1 = text(t1_value);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*listeners*/ 2 && t1_value !== (t1_value = /*modifiers*/ ctx[4].join('|') + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (22:0) {#each listeners as { event, handler, modifiers }}
    function create_each_block$2(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let searchterm;
    	let t2;
    	let t3;
    	let span_data_tooltip_value;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*event*/ ctx[2] } });
    	let if_block = /*modifiers*/ ctx[4] && /*modifiers*/ ctx[4].length && create_if_block$5(ctx);

    	return {
    		c() {
    			t0 = text(" \n  ");
    			span = element("span");
    			t1 = text("on:\n    ");
    			create_component(searchterm.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr(span, "class", "attr-name svelte-1eqzefe");

    			attr(span, "data-tooltip", span_data_tooltip_value = typeof /*handler*/ ctx[3] == 'function'
    			? /*handler*/ ctx[3]()
    			: /*handler*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, span, anchor);
    			append(span, t1);
    			mount_component(searchterm, span, null);
    			append(span, t2);
    			if (if_block) if_block.m(span, null);
    			append(span, t3);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*listeners*/ 2) searchterm_changes.text = /*event*/ ctx[2];
    			searchterm.$set(searchterm_changes);

    			if (/*modifiers*/ ctx[4] && /*modifiers*/ ctx[4].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(span, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*listeners*/ 2 && span_data_tooltip_value !== (span_data_tooltip_value = typeof /*handler*/ ctx[3] == 'function'
    			? /*handler*/ ctx[3]()
    			: /*handler*/ ctx[3])) {
    				attr(span, "data-tooltip", span_data_tooltip_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(span);
    			destroy_component(searchterm);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t;
    	let each1_anchor;
    	let current;
    	let each_value_1 = /*attributes*/ ctx[0];
    	const get_key = ctx => /*key*/ ctx[7];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let each_value = /*listeners*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*attributes*/ 1) {
    				each_value_1 = /*attributes*/ ctx[0];
    				group_outros();
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, t.parentNode, outro_and_destroy_block, create_each_block_1$1, t, get_each_context_1$1);
    				check_outros();
    			}

    			if (dirty & /*listeners*/ 2) {
    				each_value = /*listeners*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d(detaching);
    			}

    			if (detaching) detach(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each1_anchor);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { attributes } = $$props;
    	let { listeners } = $$props;

    	$$self.$$set = $$props => {
    		if ('attributes' in $$props) $$invalidate(0, attributes = $$props.attributes);
    		if ('listeners' in $$props) $$invalidate(1, listeners = $$props.listeners);
    	};

    	return [attributes, listeners];
    }

    class ElementAttributes extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { attributes: 0, listeners: 1 });
    	}
    }

    /* src/nodes/Element.svelte generated by Svelte v3.46.4 */

    function create_else_block$3(ctx) {
    	let div;
    	let t0;
    	let span;
    	let searchterm;
    	let t1;
    	let elementattributes;
    	let t2;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[5] } });

    	elementattributes = new ElementAttributes({
    			props: {
    				attributes: /*_attributes*/ ctx[7],
    				listeners: /*listeners*/ ctx[6]
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			t0 = text("<\n    ");
    			span = element("span");
    			create_component(searchterm.$$.fragment);
    			t1 = space();
    			create_component(elementattributes.$$.fragment);
    			t2 = text("\n     />");
    			attr(span, "class", "tag-name svelte-1hhhsbv");
    			attr(div, "style", /*style*/ ctx[1]);
    			attr(div, "class", "svelte-1hhhsbv");
    			toggle_class(div, "hover", /*hover*/ ctx[3]);
    			toggle_class(div, "selected", /*selected*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, span);
    			mount_component(searchterm, span, null);
    			append(div, t1);
    			mount_component(elementattributes, div, null);
    			append(div, t2);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 32) searchterm_changes.text = /*tagName*/ ctx[5];
    			searchterm.$set(searchterm_changes);
    			const elementattributes_changes = {};
    			if (dirty & /*_attributes*/ 128) elementattributes_changes.attributes = /*_attributes*/ ctx[7];
    			if (dirty & /*listeners*/ 64) elementattributes_changes.listeners = /*listeners*/ ctx[6];
    			elementattributes.$set(elementattributes_changes);

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 8) {
    				toggle_class(div, "hover", /*hover*/ ctx[3]);
    			}

    			if (dirty & /*selected*/ 16) {
    				toggle_class(div, "selected", /*selected*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			transition_in(elementattributes.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			transition_out(elementattributes.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(searchterm);
    			destroy_component(elementattributes);
    		}
    	};
    }

    // (52:0) {#if hasChildren}
    function create_if_block$4(ctx) {
    	let div;
    	let collapse;
    	let updating_collapsed;
    	let t0;
    	let span;
    	let searchterm;
    	let t1;
    	let elementattributes;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function collapse_collapsed_binding(value) {
    		/*collapse_collapsed_binding*/ ctx[12](value);
    	}

    	let collapse_props = { selected: /*selected*/ ctx[4] };

    	if (/*collapsed*/ ctx[0] !== void 0) {
    		collapse_props.collapsed = /*collapsed*/ ctx[0];
    	}

    	collapse = new Collapse({ props: collapse_props });
    	binding_callbacks.push(() => bind(collapse, 'collapsed', collapse_collapsed_binding));
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[5] } });

    	elementattributes = new ElementAttributes({
    			props: {
    				attributes: /*_attributes*/ ctx[7],
    				listeners: /*listeners*/ ctx[6]
    			}
    		});

    	let if_block0 = /*collapsed*/ ctx[0] && create_if_block_2$1(ctx);
    	let if_block1 = !/*collapsed*/ ctx[0] && create_if_block_1$4(ctx);

    	return {
    		c() {
    			div = element("div");
    			create_component(collapse.$$.fragment);
    			t0 = text("\n    <\n    ");
    			span = element("span");
    			create_component(searchterm.$$.fragment);
    			t1 = space();
    			create_component(elementattributes.$$.fragment);
    			t2 = text("\n    >\n    ");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr(span, "class", "tag-name svelte-1hhhsbv");
    			attr(div, "style", /*style*/ ctx[1]);
    			attr(div, "class", "svelte-1hhhsbv");
    			toggle_class(div, "hover", /*hover*/ ctx[3]);
    			toggle_class(div, "selected", /*selected*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(collapse, div, null);
    			append(div, t0);
    			append(div, span);
    			mount_component(searchterm, span, null);
    			append(div, t1);
    			mount_component(elementattributes, div, null);
    			append(div, t2);
    			if (if_block0) if_block0.m(div, null);
    			insert(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "dblclick", /*dblclick_handler*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const collapse_changes = {};
    			if (dirty & /*selected*/ 16) collapse_changes.selected = /*selected*/ ctx[4];

    			if (!updating_collapsed && dirty & /*collapsed*/ 1) {
    				updating_collapsed = true;
    				collapse_changes.collapsed = /*collapsed*/ ctx[0];
    				add_flush_callback(() => updating_collapsed = false);
    			}

    			collapse.$set(collapse_changes);
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 32) searchterm_changes.text = /*tagName*/ ctx[5];
    			searchterm.$set(searchterm_changes);
    			const elementattributes_changes = {};
    			if (dirty & /*_attributes*/ 128) elementattributes_changes.attributes = /*_attributes*/ ctx[7];
    			if (dirty & /*listeners*/ 64) elementattributes_changes.listeners = /*listeners*/ ctx[6];
    			elementattributes.$set(elementattributes_changes);

    			if (/*collapsed*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 8) {
    				toggle_class(div, "hover", /*hover*/ ctx[3]);
    			}

    			if (dirty & /*selected*/ 16) {
    				toggle_class(div, "selected", /*selected*/ ctx[4]);
    			}

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			transition_in(searchterm.$$.fragment, local);
    			transition_in(elementattributes.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			transition_out(searchterm.$$.fragment, local);
    			transition_out(elementattributes.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(collapse);
    			destroy_component(searchterm);
    			destroy_component(elementattributes);
    			if (if_block0) if_block0.d();
    			if (detaching) detach(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (66:4) {#if collapsed}
    function create_if_block_2$1(ctx) {
    	let t0;
    	let span;
    	let searchterm;
    	let t1;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[5] } });

    	return {
    		c() {
    			t0 = text("…</\n      ");
    			span = element("span");
    			create_component(searchterm.$$.fragment);
    			t1 = text("\n      >");
    			attr(span, "class", "tag-name svelte-1hhhsbv");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, span, anchor);
    			mount_component(searchterm, span, null);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 32) searchterm_changes.text = /*tagName*/ ctx[5];
    			searchterm.$set(searchterm_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(span);
    			destroy_component(searchterm);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (74:2) {#if !collapsed}
    function create_if_block_1$4(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let span;
    	let searchterm;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[5] } });

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div = element("div");
    			t1 = text("</\n      ");
    			span = element("span");
    			create_component(searchterm.$$.fragment);
    			t2 = text("\n      >");
    			attr(span, "class", "tag-name svelte-1hhhsbv");
    			attr(div, "style", /*style*/ ctx[1]);
    			attr(div, "class", "svelte-1hhhsbv");
    			toggle_class(div, "hover", /*hover*/ ctx[3]);
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, t1);
    			append(div, span);
    			mount_component(searchterm, span, null);
    			append(div, t2);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 32) searchterm_changes.text = /*tagName*/ ctx[5];
    			searchterm.$set(searchterm_changes);

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 8) {
    				toggle_class(div, "hover", /*hover*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			destroy_component(searchterm);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasChildren*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function stringify(value) {
    	switch (typeof value) {
    		case 'string':
    			return `"${value}"`;
    		case 'undefined':
    			return 'undefined';
    		case 'number':
    			return value != value ? 'NaN' : value.toString();
    		case 'object':
    			if (value == null) return 'null';
    			if (Array.isArray(value)) return `[${value.map(stringify).join(', ')}]`;
    			if (value.__isFunction) return value.name + '()';
    			if (value.__isSymbol) return value.name;
    			return `{${Object.entries(value).map(([key, value]) => `${key}: ${stringify(value)}`).join(', ')}}`;
    	}
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { style } = $$props;
    	let { hasChildren } = $$props;
    	let { hover } = $$props;
    	let { selected } = $$props;
    	let { tagName } = $$props;
    	let { attributes = [] } = $$props;
    	let { listeners = [] } = $$props;
    	let { collapsed } = $$props;
    	let _attributes;
    	let cache = {};

    	function collapse_collapsed_binding(value) {
    		collapsed = value;
    		$$invalidate(0, collapsed);
    	}

    	const dblclick_handler = e => $$invalidate(0, collapsed = !collapsed);

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('hasChildren' in $$props) $$invalidate(2, hasChildren = $$props.hasChildren);
    		if ('hover' in $$props) $$invalidate(3, hover = $$props.hover);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('tagName' in $$props) $$invalidate(5, tagName = $$props.tagName);
    		if ('attributes' in $$props) $$invalidate(8, attributes = $$props.attributes);
    		if ('listeners' in $$props) $$invalidate(6, listeners = $$props.listeners);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*attributes, _attributes, cache*/ 896) {
    			{
    				let localCache = {};

    				$$invalidate(7, _attributes = attributes.map(o => {
    					const value = stringify(o.value);
    					localCache[o.key] = value;

    					return {
    						...o,
    						value,
    						flash: !!_attributes && value != cache[o.key]
    					};
    				}));

    				$$invalidate(9, cache = localCache);
    			}
    		}
    	};

    	return [
    		collapsed,
    		style,
    		hasChildren,
    		hover,
    		selected,
    		tagName,
    		listeners,
    		_attributes,
    		attributes,
    		cache,
    		$$scope,
    		slots,
    		collapse_collapsed_binding,
    		dblclick_handler
    	];
    }

    class Element extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			style: 1,
    			hasChildren: 2,
    			hover: 3,
    			selected: 4,
    			tagName: 5,
    			attributes: 8,
    			listeners: 6,
    			collapsed: 0
    		});
    	}
    }

    /* src/nodes/Block.svelte generated by Svelte v3.46.4 */

    function create_else_block$2(ctx) {
    	let t0;
    	let searchterm;
    	let t1;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });

    	return {
    		c() {
    			t0 = text("{#\n    ");
    			create_component(searchterm.$$.fragment);
    			t1 = text("\n    }");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			mount_component(searchterm, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			destroy_component(searchterm, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (21:2) {#if source}
    function create_if_block_2(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*source*/ ctx[5]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*source*/ 32) set_data(t, /*source*/ ctx[5]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (28:2) {#if collapsed}
    function create_if_block_1$3(ctx) {
    	let t0;
    	let searchterm;
    	let t1;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });

    	return {
    		c() {
    			t0 = text("…{/\n    ");
    			create_component(searchterm.$$.fragment);
    			t1 = text("\n    }");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			mount_component(searchterm, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			destroy_component(searchterm, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (34:0) {#if !collapsed}
    function create_if_block$3(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let searchterm;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div = element("div");
    			t1 = text("{/\n    ");
    			create_component(searchterm.$$.fragment);
    			t2 = text("\n    }");
    			attr(div, "class", "tag-close tag-name svelte-x8r9lc");
    			attr(div, "style", /*style*/ ctx[1]);
    			toggle_class(div, "hover", /*hover*/ ctx[2]);
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, t1);
    			mount_component(searchterm, div, null);
    			append(div, t2);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 4) {
    				toggle_class(div, "hover", /*hover*/ ctx[2]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			destroy_component(searchterm);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div;
    	let collapse;
    	let updating_collapsed;
    	let t0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let t2;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function collapse_collapsed_binding(value) {
    		/*collapse_collapsed_binding*/ ctx[8](value);
    	}

    	let collapse_props = { selected: /*selected*/ ctx[3] };

    	if (/*collapsed*/ ctx[0] !== void 0) {
    		collapse_props.collapsed = /*collapsed*/ ctx[0];
    	}

    	collapse = new Collapse({ props: collapse_props });
    	binding_callbacks.push(() => bind(collapse, 'collapsed', collapse_collapsed_binding));
    	const if_block_creators = [create_if_block_2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*source*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*collapsed*/ ctx[0] && create_if_block_1$3(ctx);
    	let if_block2 = !/*collapsed*/ ctx[0] && create_if_block$3(ctx);

    	return {
    		c() {
    			div = element("div");
    			create_component(collapse.$$.fragment);
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr(div, "class", "tag-open tag-name svelte-x8r9lc");
    			attr(div, "style", /*style*/ ctx[1]);
    			toggle_class(div, "hover", /*hover*/ ctx[2]);
    			toggle_class(div, "selected", /*selected*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(collapse, div, null);
    			append(div, t0);
    			if_blocks[current_block_type_index].m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "dblclick", /*dblclick_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const collapse_changes = {};
    			if (dirty & /*selected*/ 8) collapse_changes.selected = /*selected*/ ctx[3];

    			if (!updating_collapsed && dirty & /*collapsed*/ 1) {
    				updating_collapsed = true;
    				collapse_changes.collapsed = /*collapsed*/ ctx[0];
    				add_flush_callback(() => updating_collapsed = false);
    			}

    			collapse.$set(collapse_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, t1);
    			}

    			if (/*collapsed*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 4) {
    				toggle_class(div, "hover", /*hover*/ ctx[2]);
    			}

    			if (dirty & /*selected*/ 8) {
    				toggle_class(div, "selected", /*selected*/ ctx[3]);
    			}

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(collapse);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { style } = $$props;
    	let { hover } = $$props;
    	let { selected } = $$props;
    	let { tagName } = $$props;
    	let { source } = $$props;
    	let { collapsed } = $$props;

    	function collapse_collapsed_binding(value) {
    		collapsed = value;
    		$$invalidate(0, collapsed);
    	}

    	const dblclick_handler = e => $$invalidate(0, collapsed = !collapsed);

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('hover' in $$props) $$invalidate(2, hover = $$props.hover);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('tagName' in $$props) $$invalidate(4, tagName = $$props.tagName);
    		if ('source' in $$props) $$invalidate(5, source = $$props.source);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	return [
    		collapsed,
    		style,
    		hover,
    		selected,
    		tagName,
    		source,
    		$$scope,
    		slots,
    		collapse_collapsed_binding,
    		dblclick_handler
    	];
    }

    class Block extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			style: 1,
    			hover: 2,
    			selected: 3,
    			tagName: 4,
    			source: 5,
    			collapsed: 0
    		});
    	}
    }

    /* src/nodes/Slot.svelte generated by Svelte v3.46.4 */

    function create_if_block_1$2(ctx) {
    	let t0;
    	let searchterm;
    	let t1;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });

    	return {
    		c() {
    			t0 = text("…</\n    ");
    			create_component(searchterm.$$.fragment);
    			t1 = text("\n    >");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			mount_component(searchterm, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			destroy_component(searchterm, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (29:0) {#if !collapsed}
    function create_if_block$2(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let searchterm;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div = element("div");
    			t1 = text("</\n    ");
    			create_component(searchterm.$$.fragment);
    			t2 = text("\n    >");
    			attr(div, "class", "tag-close tag-name svelte-g71n30");
    			attr(div, "style", /*style*/ ctx[1]);
    			toggle_class(div, "hover", /*hover*/ ctx[2]);
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, t1);
    			mount_component(searchterm, div, null);
    			append(div, t2);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 4) {
    				toggle_class(div, "hover", /*hover*/ ctx[2]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			destroy_component(searchterm);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div;
    	let collapse;
    	let updating_collapsed;
    	let t0;
    	let searchterm;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function collapse_collapsed_binding(value) {
    		/*collapse_collapsed_binding*/ ctx[7](value);
    	}

    	let collapse_props = { selected: /*selected*/ ctx[3] };

    	if (/*collapsed*/ ctx[0] !== void 0) {
    		collapse_props.collapsed = /*collapsed*/ ctx[0];
    	}

    	collapse = new Collapse({ props: collapse_props });
    	binding_callbacks.push(() => bind(collapse, 'collapsed', collapse_collapsed_binding));
    	searchterm = new SearchTerm({ props: { text: /*tagName*/ ctx[4] } });
    	let if_block0 = /*collapsed*/ ctx[0] && create_if_block_1$2(ctx);
    	let if_block1 = !/*collapsed*/ ctx[0] && create_if_block$2(ctx);

    	return {
    		c() {
    			div = element("div");
    			create_component(collapse.$$.fragment);
    			t0 = text("\n  <\n  ");
    			create_component(searchterm.$$.fragment);
    			t1 = text("\n  >\n  ");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr(div, "class", "tag-open tag-name svelte-g71n30");
    			attr(div, "style", /*style*/ ctx[1]);
    			toggle_class(div, "hover", /*hover*/ ctx[2]);
    			toggle_class(div, "selected", /*selected*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(collapse, div, null);
    			append(div, t0);
    			mount_component(searchterm, div, null);
    			append(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			insert(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "dblclick", /*dblclick_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const collapse_changes = {};
    			if (dirty & /*selected*/ 8) collapse_changes.selected = /*selected*/ ctx[3];

    			if (!updating_collapsed && dirty & /*collapsed*/ 1) {
    				updating_collapsed = true;
    				collapse_changes.collapsed = /*collapsed*/ ctx[0];
    				add_flush_callback(() => updating_collapsed = false);
    			}

    			collapse.$set(collapse_changes);
    			const searchterm_changes = {};
    			if (dirty & /*tagName*/ 16) searchterm_changes.text = /*tagName*/ ctx[4];
    			searchterm.$set(searchterm_changes);

    			if (/*collapsed*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr(div, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*hover*/ 4) {
    				toggle_class(div, "hover", /*hover*/ ctx[2]);
    			}

    			if (dirty & /*selected*/ 8) {
    				toggle_class(div, "selected", /*selected*/ ctx[3]);
    			}

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			transition_in(searchterm.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapse.$$.fragment, local);
    			transition_out(searchterm.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(collapse);
    			destroy_component(searchterm);
    			if (if_block0) if_block0.d();
    			if (detaching) detach(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { style } = $$props;
    	let { hover } = $$props;
    	let { selected } = $$props;
    	let { tagName } = $$props;
    	let { collapsed } = $$props;

    	function collapse_collapsed_binding(value) {
    		collapsed = value;
    		$$invalidate(0, collapsed);
    	}

    	const dblclick_handler = e => $$invalidate(0, collapsed = !collapsed);

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('hover' in $$props) $$invalidate(2, hover = $$props.hover);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('tagName' in $$props) $$invalidate(4, tagName = $$props.tagName);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	return [
    		collapsed,
    		style,
    		hover,
    		selected,
    		tagName,
    		$$scope,
    		slots,
    		collapse_collapsed_binding,
    		dblclick_handler
    	];
    }

    class Slot extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			style: 1,
    			hover: 2,
    			selected: 3,
    			tagName: 4,
    			collapsed: 0
    		});
    	}
    }

    /* src/nodes/Iteration.svelte generated by Svelte v3.46.4 */

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			div = element("div");
    			t0 = text("↪");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr(div, "style", /*style*/ ctx[0]);
    			attr(div, "class", "svelte-x8r9lc");
    			toggle_class(div, "hover", /*hover*/ ctx[1]);
    			toggle_class(div, "selected", /*selected*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			insert(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*style*/ 1) {
    				attr(div, "style", /*style*/ ctx[0]);
    			}

    			if (dirty & /*hover*/ 2) {
    				toggle_class(div, "hover", /*hover*/ ctx[1]);
    			}

    			if (dirty & /*selected*/ 4) {
    				toggle_class(div, "selected", /*selected*/ ctx[2]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { style } = $$props;
    	let { hover } = $$props;
    	let { selected } = $$props;

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('hover' in $$props) $$invalidate(1, hover = $$props.hover);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [style, hover, selected, $$scope, slots];
    }

    class Iteration extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { style: 0, hover: 1, selected: 2 });
    	}
    }

    /* src/nodes/Text.svelte generated by Svelte v3.46.4 */

    function create_fragment$3(ctx) {
    	let div;
    	let searchterm;
    	let current;
    	searchterm = new SearchTerm({ props: { text: /*nodeValue*/ ctx[1] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(searchterm.$$.fragment);
    			attr(div, "style", /*style*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(searchterm, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const searchterm_changes = {};
    			if (dirty & /*nodeValue*/ 2) searchterm_changes.text = /*nodeValue*/ ctx[1];
    			searchterm.$set(searchterm_changes);

    			if (!current || dirty & /*style*/ 1) {
    				attr(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(searchterm.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(searchterm.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(searchterm);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { style } = $$props;
    	let { nodeValue } = $$props;

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('nodeValue' in $$props) $$invalidate(1, nodeValue = $$props.nodeValue);
    	};

    	return [style, nodeValue];
    }

    class Text extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { style: 0, nodeValue: 1 });
    	}
    }

    /* src/nodes/Anchor.svelte generated by Svelte v3.46.4 */

    function create_fragment$2(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text("#anchor");
    			attr(div, "style", /*style*/ ctx[0]);
    			attr(div, "class", "svelte-1oevsoq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*style*/ 1) {
    				attr(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { style } = $$props;

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    	};

    	return [style];
    }

    class Anchor extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { style: 0 });
    	}
    }

    /* src/nodes/Node.svelte generated by Svelte v3.46.4 */

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (72:0) {:else}
    function create_else_block$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*node*/ ctx[0].children;
    	const get_key = ctx => /*node*/ ctx[0].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*node, depth*/ 3) {
    				each_value_1 = /*node*/ ctx[0].children;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (41:0) {#if $visibility[node.type]}
    function create_if_block$1(ctx) {
    	let li;
    	let switch_instance;
    	let updating_collapsed;
    	let current;
    	let mounted;
    	let dispose;

    	const switch_instance_spread_levels = [
    		{ tagName: /*node*/ ctx[0].tagName },
    		/*node*/ ctx[0].detail,
    		{
    			hasChildren: /*node*/ ctx[0].children.length != 0
    		},
    		{
    			hover: /*$hoveredNodeId*/ ctx[5] == /*node*/ ctx[0].id
    		},
    		{
    			selected: /*$selectedNode*/ ctx[6].id == /*node*/ ctx[0].id
    		},
    		{
    			style: `padding-left: ${/*depth*/ ctx[1] * 12}px`
    		}
    	];

    	function switch_instance_collapsed_binding(value) {
    		/*switch_instance_collapsed_binding*/ ctx[8](value);
    	}

    	var switch_value = /*nodeType*/ ctx[3];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$1] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		if (/*node*/ ctx[0].collapsed !== void 0) {
    			switch_instance_props.collapsed = /*node*/ ctx[0].collapsed;
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'collapsed', switch_instance_collapsed_binding));
    	}

    	return {
    		c() {
    			li = element("li");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr(li, "class", "svelte-18cyfcm");
    			toggle_class(li, "flash", /*flash*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, li, null);
    			}

    			/*li_binding*/ ctx[9](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(li, "animationend", /*animationend_handler*/ ctx[10]),
    					listen(li, "mouseover", stop_propagation(/*mouseover_handler*/ ctx[11])),
    					listen(li, "click", stop_propagation(/*click_handler*/ ctx[12]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*node, $hoveredNodeId, $selectedNode, depth*/ 99)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*node*/ 1 && { tagName: /*node*/ ctx[0].tagName },
    					dirty & /*node*/ 1 && get_spread_object(/*node*/ ctx[0].detail),
    					dirty & /*node*/ 1 && {
    						hasChildren: /*node*/ ctx[0].children.length != 0
    					},
    					dirty & /*$hoveredNodeId, node*/ 33 && {
    						hover: /*$hoveredNodeId*/ ctx[5] == /*node*/ ctx[0].id
    					},
    					dirty & /*$selectedNode, node*/ 65 && {
    						selected: /*$selectedNode*/ ctx[6].id == /*node*/ ctx[0].id
    					},
    					dirty & /*depth*/ 2 && {
    						style: `padding-left: ${/*depth*/ ctx[1] * 12}px`
    					}
    				])
    			: {};

    			if (dirty & /*$$scope, node, depth, $selectedNode*/ 524355) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_collapsed && dirty & /*node*/ 1) {
    				updating_collapsed = true;
    				switch_instance_changes.collapsed = /*node*/ ctx[0].collapsed;
    				add_flush_callback(() => updating_collapsed = false);
    			}

    			if (switch_value !== (switch_value = /*nodeType*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'collapsed', switch_instance_collapsed_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, li, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (dirty & /*flash*/ 4) {
    				toggle_class(li, "flash", /*flash*/ ctx[2]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (switch_instance) destroy_component(switch_instance);
    			/*li_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (73:2) {#each node.children as node (node.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let node_1;
    	let current;

    	node_1 = new Node({
    			props: {
    				node: /*node*/ ctx[0],
    				depth: /*depth*/ ctx[1]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(node_1.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(node_1, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const node_1_changes = {};
    			if (dirty & /*node*/ 1) node_1_changes.node = /*node*/ ctx[0];
    			if (dirty & /*depth*/ 2) node_1_changes.depth = /*depth*/ ctx[1];
    			node_1.$set(node_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(node_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(node_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(node_1, detaching);
    		}
    	};
    }

    // (59:6) {#if $selectedNode.id == node.id}
    function create_if_block_1$1(ctx) {
    	let span;
    	let span_style_value;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "style", span_style_value = `left: ${/*depth*/ ctx[1] * 12 + 6}px`);
    			attr(span, "class", "svelte-18cyfcm");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*depth*/ 2 && span_style_value !== (span_style_value = `left: ${/*depth*/ ctx[1] * 12 + 6}px`)) {
    				attr(span, "style", span_style_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (63:8) {#each node.children as child (child.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let node_1;
    	let current;

    	node_1 = new Node({
    			props: {
    				node: /*child*/ ctx[14],
    				depth: /*node*/ ctx[0].type == 'iteration'
    				? /*depth*/ ctx[1]
    				: /*depth*/ ctx[1] + 1
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(node_1.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(node_1, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const node_1_changes = {};
    			if (dirty & /*node*/ 1) node_1_changes.node = /*child*/ ctx[14];

    			if (dirty & /*node, depth*/ 3) node_1_changes.depth = /*node*/ ctx[0].type == 'iteration'
    			? /*depth*/ ctx[1]
    			: /*depth*/ ctx[1] + 1;

    			node_1.$set(node_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(node_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(node_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(node_1, detaching);
    		}
    	};
    }

    // (49:4) <svelte:component       this={nodeType}       tagName={node.tagName}       bind:collapsed={node.collapsed}       {...node.detail}       hasChildren={node.children.length != 0}       hover={$hoveredNodeId == node.id}       selected={$selectedNode.id == node.id}       style={`padding-left: ${depth * 12}px`}     >
    function create_default_slot$1(ctx) {
    	let t;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*$selectedNode*/ ctx[6].id == /*node*/ ctx[0].id && create_if_block_1$1(ctx);
    	let each_value = /*node*/ ctx[0].children;
    	const get_key = ctx => /*child*/ ctx[14].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*$selectedNode*/ ctx[6].id == /*node*/ ctx[0].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*node, depth*/ 3) {
    				each_value = /*node*/ ctx[0].children;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			if (detaching) detach(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$visibility*/ ctx[4][/*node*/ ctx[0].type]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let nodeType;
    	let $visibility;
    	let $hoveredNodeId;
    	let $selectedNode;
    	component_subscribe($$self, visibility, $$value => $$invalidate(4, $visibility = $$value));
    	component_subscribe($$self, hoveredNodeId, $$value => $$invalidate(5, $hoveredNodeId = $$value));
    	component_subscribe($$self, selectedNode, $$value => $$invalidate(6, $selectedNode = $$value));
    	let { node } = $$props;
    	let { depth = 1 } = $$props;
    	let _timeout = null;

    	node.invalidate = () => {
    		if (_timeout) return;

    		_timeout = setTimeout(
    			() => {
    				_timeout = null;
    				$$invalidate(0, node);
    			},
    			100
    		);
    	};

    	let lastLength = node.children.length;
    	let flash = false;

    	function switch_instance_collapsed_binding(value) {
    		if ($$self.$$.not_equal(node.collapsed, value)) {
    			node.collapsed = value;
    			$$invalidate(0, node);
    		}
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			node.dom = $$value;
    			$$invalidate(0, node);
    		});
    	}

    	const animationend_handler = e => $$invalidate(2, flash = false);
    	const mouseover_handler = e => set_store_value(hoveredNodeId, $hoveredNodeId = node.id, $hoveredNodeId);
    	const click_handler = e => set_store_value(selectedNode, $selectedNode = node, $selectedNode);

    	$$self.$$set = $$props => {
    		if ('node' in $$props) $$invalidate(0, node = $$props.node);
    		if ('depth' in $$props) $$invalidate(1, depth = $$props.depth);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*node*/ 1) {
    			$$invalidate(3, nodeType = ({
    				element: Element,
    				component: Element,
    				block: Block,
    				slot: Slot,
    				iteration: Iteration,
    				text: Text,
    				anchor: Anchor
    			})[node.type]);
    		}

    		if ($$self.$$.dirty & /*flash, node, lastLength*/ 133) {
    			{
    				$$invalidate(2, flash = flash || node.children.length != lastLength);
    				$$invalidate(7, lastLength = node.children.length);
    			}
    		}
    	};

    	return [
    		node,
    		depth,
    		flash,
    		nodeType,
    		$visibility,
    		$hoveredNodeId,
    		$selectedNode,
    		lastLength,
    		switch_instance_collapsed_binding,
    		li_binding,
    		animationend_handler,
    		mouseover_handler,
    		click_handler
    	];
    }

    class Node extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { node: 0, depth: 1 });
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (35:0) {:else}
    function create_else_block(ctx) {
    	let connectmessage;
    	let current;
    	connectmessage = new ConnectMessage({});

    	return {
    		c() {
    			create_component(connectmessage.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(connectmessage, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i(local) {
    			if (current) return;
    			transition_in(connectmessage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(connectmessage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(connectmessage, detaching);
    		}
    	};
    }

    // (19:28) 
    function create_if_block_1(ctx) {
    	let div;
    	let toolbar;
    	let t0;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let breadcrumbs;
    	let t2;
    	let componentview;
    	let current;
    	let mounted;
    	let dispose;

    	toolbar = new Toolbar({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = /*$rootNodes*/ ctx[1];
    	const get_key = ctx => /*node*/ ctx[4].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	breadcrumbs = new Breadcrumbs({});
    	componentview = new ComponentView({});

    	return {
    		c() {
    			div = element("div");
    			create_component(toolbar.$$.fragment);
    			t0 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(breadcrumbs.$$.fragment);
    			t2 = space();
    			create_component(componentview.$$.fragment);
    			attr(ul, "class", "svelte-r67g7z");
    			attr(div, "class", "node-tree svelte-r67g7z");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(toolbar, div, null);
    			append(div, t0);
    			append(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append(div, t1);
    			mount_component(breadcrumbs, div, null);
    			insert(target, t2, anchor);
    			mount_component(componentview, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(ul, "mouseleave", /*mouseleave_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const toolbar_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				toolbar_changes.$$scope = { dirty, ctx };
    			}

    			toolbar.$set(toolbar_changes);

    			if (dirty & /*$rootNodes*/ 2) {
    				each_value = /*$rootNodes*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(breadcrumbs.$$.fragment, local);
    			transition_in(componentview.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(toolbar.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(breadcrumbs.$$.fragment, local);
    			transition_out(componentview.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(toolbar);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(breadcrumbs);
    			if (detaching) detach(t2);
    			destroy_component(componentview, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (15:0) {#if $profilerEnabled}
    function create_if_block(ctx) {
    	let div;
    	let profiler;
    	let current;
    	profiler = new Profiler({});

    	return {
    		c() {
    			div = element("div");
    			create_component(profiler.$$.fragment);
    			attr(div, "class", "svelte-r67g7z");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profiler, div, null);
    			current = true;
    		},
    		p: noop$1,
    		i(local) {
    			if (current) return;
    			transition_in(profiler.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profiler.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profiler);
    		}
    	};
    }

    // (21:4) <Toolbar>
    function create_default_slot(ctx) {
    	let profilebutton;
    	let t0;
    	let pickerbutton;
    	let t1;
    	let visibilitybutton;
    	let t2;
    	let search;
    	let current;
    	profilebutton = new ProfileButton({});
    	pickerbutton = new PickerButton({});
    	visibilitybutton = new VisibilityButton({});
    	search = new Search({});

    	return {
    		c() {
    			create_component(profilebutton.$$.fragment);
    			t0 = space();
    			create_component(pickerbutton.$$.fragment);
    			t1 = space();
    			create_component(visibilitybutton.$$.fragment);
    			t2 = space();
    			create_component(search.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profilebutton, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(pickerbutton, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(visibilitybutton, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(search, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profilebutton.$$.fragment, local);
    			transition_in(pickerbutton.$$.fragment, local);
    			transition_in(visibilitybutton.$$.fragment, local);
    			transition_in(search.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profilebutton.$$.fragment, local);
    			transition_out(pickerbutton.$$.fragment, local);
    			transition_out(visibilitybutton.$$.fragment, local);
    			transition_out(search.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profilebutton, detaching);
    			if (detaching) detach(t0);
    			destroy_component(pickerbutton, detaching);
    			if (detaching) detach(t1);
    			destroy_component(visibilitybutton, detaching);
    			if (detaching) detach(t2);
    			destroy_component(search, detaching);
    		}
    	};
    }

    // (28:6) {#each $rootNodes as node (node.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let node;
    	let current;
    	node = new Node({ props: { node: /*node*/ ctx[4] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(node.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(node, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const node_changes = {};
    			if (dirty & /*$rootNodes*/ 2) node_changes.node = /*node*/ ctx[4];
    			node.$set(node_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(node.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(node.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(node, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$profilerEnabled*/ ctx[0]) return 0;
    		if (/*$rootNodes*/ ctx[1].length) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $profilerEnabled;
    	let $rootNodes;
    	let $hoveredNodeId;
    	component_subscribe($$self, profilerEnabled, $$value => $$invalidate(0, $profilerEnabled = $$value));
    	component_subscribe($$self, rootNodes, $$value => $$invalidate(1, $rootNodes = $$value));
    	component_subscribe($$self, hoveredNodeId, $$value => $$invalidate(2, $hoveredNodeId = $$value));
    	const mouseleave_handler = e => set_store_value(hoveredNodeId, $hoveredNodeId = null, $hoveredNodeId);
    	return [$profilerEnabled, $rootNodes, $hoveredNodeId, mouseleave_handler];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    function setDarkMode(theme) {
      if (theme == 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    }

    setDarkMode(chrome$1.devtools.panels.themeName);
    if (chrome$1.devtools.panels.onThemeChanged)
      chrome$1.devtools.panels.onThemeChanged.addListener(setDarkMode);

    new App({ target: document.body });

})(chrome);
