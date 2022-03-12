(function () {
	'use strict';

	// MODULE: src/debug.ts
	/**
	 * Will be tree-shaken out in prod builds
	 */
	function debug(...args) {
	}

	// MODULE: src/shells/shared/popup/popup.ts
	function setPopupStatus(tabId, enabled) {
	  const status = enabled ? "enabled" : "disabled";
	  const suffix = enabled ? "" : "-disabled";
	  chrome.browserAction.setIcon({
	    tabId,
	    path: {
	      "16": `icons/icon-16${suffix}.png`,
	      "32": `icons/icon-32${suffix}.png`,
	      "48": `icons/icon-48${suffix}.png`,
	      "128": `icons/icon-128${suffix}.png`,
	      "192": `icons/icon-192${suffix}.png`
	    }
	  });
	  chrome.browserAction.setPopup({
	    tabId,
	    popup: `popup/${status}.html`
	  });
	}

	// MODULE: src/constants.ts
	const DevtoolsToClient = "preact-devtools-to-client";
	const ContentScriptName = "preact-content-script";
	const DevtoolsPanelName = "preact-devtools-panel";
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

	// MODULE: src/shells/shared/background/emitter.ts
	/**
	 * Emitter which will dispatch to everyone but the
	 * calling source.
	 */

	function BackgroundEmitter() {
	  const targets = {};
	  return {
	    on(source, handler) {
	      targets[source] = handler;
	    },

	    off(source) {
	      targets[source] = undefined;
	    },

	    emit(source, event) {
	      Object.entries(targets).forEach(([name, f]) => {
	        if (name !== source && f) {
	          f(event);
	        }
	      });
	    },

	    connected() {
	      return Object.keys(targets);
	    }

	  };
	}

	// MODULE: src/shells/shared/background/background.ts
	/**
	 * Collection of potential targets to connect to by tabId.
	 */

	const targets = new Map();

	function addToTarget(tabId, port) {
	  if (!targets.has(tabId)) {
	    targets.set(tabId, BackgroundEmitter());
	  }

	  const target = targets.get(tabId);
	  target.on(port.name, m => port.postMessage(m));
	  port.onMessage.addListener(m => target.emit(port.name, m));
	  port.onDisconnect.addListener(() => {
	    debug("disconnect", port.name);
	    target.emit(port.name, {
	      type: "disconnect",
	      data: null,
	      source: DevtoolsToClient
	    });
	    target.off(port.name);
	  });
	}
	/**
	 * Handle initial connection from content-script.
	 */


	function handleContentScriptConnection(port) {
	  const tabId = port.sender?.tab?.id;

	  if (tabId) {
	    addToTarget(tabId, port);
	    setPopupStatus(tabId, true);
	  }
	}
	/**
	 * Handle initial connection from devtools panel.
	 */


	function handleDevtoolsConnection(port) {
	  function initialListener(message) {
	    if (message.type !== "init") {
	      return;
	    }

	    const {
	      tabId
	    } = message;
	    addToTarget(tabId, port);
	    port.onMessage.removeListener(initialListener);

	    if (targets.get(tabId)?.connected().includes(ContentScriptName)) {
	      port.postMessage({
	        type: "init",
	        data: null
	      });
	    }
	  }

	  port.onMessage.addListener(initialListener);
	}
	/**
	 * Each port will have a name that was specified during connection via
	 * `chrome.runtime.connect()`. We leverage that to call the correct
	 * handler.
	 *
	 * TODO: Allow 1:n connections
	 */


	const connectionHandlers = {
	  [ContentScriptName]: handleContentScriptConnection,
	  [DevtoolsPanelName]: handleDevtoolsConnection
	};
	chrome.runtime.onConnect.addListener(port => {
	  const handler = connectionHandlers[port.name];
	  debug(`[${port.sender?.tab?.id}] %cBackground: %cconnecting ${port.name}`, "color: yellow;font-weight:bold", "color: inherit");
	  handler && handler(port);
	});

}());
