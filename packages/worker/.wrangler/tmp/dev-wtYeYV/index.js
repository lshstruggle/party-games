var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now2 = Date.now();
  const seconds = Math.trunc(now2 / 1e3);
  const nanos = now2 % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../shared/src/types.ts
var ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var ROOM_CODE_LENGTH = 4;
var MAX_MEMBERS = 16;
var ROOM_TTL_MS = 24 * 60 * 60 * 1e3;
var EMPTY_ROOM_GRACE_MS = 30 * 60 * 1e3;
var REJOIN_WINDOW_MS = 30 * 1e3;
var HEARTBEAT_MS = 10 * 1e3;

// ../../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  __name(assertIs, "assertIs");
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  __name(assertNever, "assertNever");
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  __name(joinValues, "joinValues");
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = /* @__PURE__ */ __name((data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
}, "getParsedType");

// ../../node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = /* @__PURE__ */ __name((obj) => {
  const json3 = JSON.stringify(obj, null, 2);
  return json3.replace(/"([^"]+)":/g, "$1:");
}, "quotelessJson");
var ZodError = class _ZodError extends Error {
  static {
    __name(this, "ZodError");
  }
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = /* @__PURE__ */ __name((error3) => {
      for (const issue of error3.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }, "processError");
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error3 = new ZodError(issues);
  return error3;
};

// ../../node_modules/zod/v3/locales/en.js
var errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
}, "errorMap");
var en_default = errorMap;

// ../../node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
__name(setErrorMap, "setErrorMap");
function getErrorMap() {
  return overrideErrorMap;
}
__name(getErrorMap, "getErrorMap");

// ../../node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = /* @__PURE__ */ __name((params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
}, "makeIssue");
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
__name(addIssueToContext, "addIssueToContext");
var ParseStatus = class _ParseStatus {
  static {
    __name(this, "ParseStatus");
  }
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
var OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
var isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
var isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
var isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
var isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");

// ../../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  static {
    __name(this, "ParseInputLazyPath");
  }
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = /* @__PURE__ */ __name((ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error3 = new ZodError(ctx.common.issues);
        this._error = error3;
        return this._error;
      }
    };
  }
}, "handleResult");
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
__name(processCreateParams, "processCreateParams");
var ZodType = class {
  static {
    __name(this, "ZodType");
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = /* @__PURE__ */ __name((val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    }, "getIssueProperties");
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      }), "setError");
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: /* @__PURE__ */ __name((data) => this["~validate"](data), "validate")
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
__name(timeRegexSource, "timeRegexSource");
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
__name(timeRegex, "timeRegex");
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
__name(datetimeRegex, "datetimeRegex");
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidIP, "isValidIP");
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
__name(isValidJWT, "isValidJWT");
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidCidr, "isValidCidr");
var ZodString = class _ZodString extends ZodType {
  static {
    __name(this, "ZodString");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
__name(floatSafeRemainder, "floatSafeRemainder");
var ZodNumber = class _ZodNumber extends ZodType {
  static {
    __name(this, "ZodNumber");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  static {
    __name(this, "ZodBigInt");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  static {
    __name(this, "ZodBoolean");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  static {
    __name(this, "ZodDate");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  static {
    __name(this, "ZodSymbol");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  static {
    __name(this, "ZodUndefined");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  static {
    __name(this, "ZodNull");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  static {
    __name(this, "ZodAny");
  }
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  static {
    __name(this, "ZodUnknown");
  }
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  static {
    __name(this, "ZodNever");
  }
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  static {
    __name(this, "ZodVoid");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  static {
    __name(this, "ZodArray");
  }
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
__name(deepPartialify, "deepPartialify");
var ZodObject = class _ZodObject extends ZodType {
  static {
    __name(this, "ZodObject");
  }
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: /* @__PURE__ */ __name((issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }, "errorMap")
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...augmentation
      }), "shape")
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }), "shape"),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  static {
    __name(this, "ZodUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    __name(handleResults, "handleResults");
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = /* @__PURE__ */ __name((type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
}, "getDiscriminator");
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  static {
    __name(this, "ZodDiscriminatedUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
__name(mergeValues, "mergeValues");
var ZodIntersection = class extends ZodType {
  static {
    __name(this, "ZodIntersection");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    }, "handleParsed");
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  static {
    __name(this, "ZodTuple");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  static {
    __name(this, "ZodRecord");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  static {
    __name(this, "ZodMap");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  static {
    __name(this, "ZodSet");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    __name(finalizeSet, "finalizeSet");
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  static {
    __name(this, "ZodFunction");
  }
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error3) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error3
        }
      });
    }
    __name(makeArgsIssue, "makeArgsIssue");
    function makeReturnsIssue(returns, error3) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error3
        }
      });
    }
    __name(makeReturnsIssue, "makeReturnsIssue");
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error3 = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error3.addIssue(makeArgsIssue(args, e));
          throw error3;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error3.addIssue(makeReturnsIssue(result, e));
          throw error3;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  static {
    __name(this, "ZodLazy");
  }
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  static {
    __name(this, "ZodLiteral");
  }
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
__name(createZodEnum, "createZodEnum");
var ZodEnum = class _ZodEnum extends ZodType {
  static {
    __name(this, "ZodEnum");
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  static {
    __name(this, "ZodNativeEnum");
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  static {
    __name(this, "ZodPromise");
  }
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  static {
    __name(this, "ZodEffects");
  }
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: /* @__PURE__ */ __name((arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      }, "addIssue"),
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = /* @__PURE__ */ __name((acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      }, "executeRefinement");
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  static {
    __name(this, "ZodOptional");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  static {
    __name(this, "ZodNullable");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  static {
    __name(this, "ZodDefault");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  static {
    __name(this, "ZodCatch");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  static {
    __name(this, "ZodNaN");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  static {
    __name(this, "ZodBranded");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  static {
    __name(this, "ZodPipeline");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = /* @__PURE__ */ __name(async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }, "handleAsync");
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  static {
    __name(this, "ZodReadonly");
  }
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = /* @__PURE__ */ __name((data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    }, "freeze");
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
__name(cleanParams, "cleanParams");
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
__name(custom, "custom");
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = /* @__PURE__ */ __name((cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params), "instanceOfType");
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
var onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
var oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
var coerce = {
  string: /* @__PURE__ */ __name(((arg) => ZodString.create({ ...arg, coerce: true })), "string"),
  number: /* @__PURE__ */ __name(((arg) => ZodNumber.create({ ...arg, coerce: true })), "number"),
  boolean: /* @__PURE__ */ __name(((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })), "boolean"),
  bigint: /* @__PURE__ */ __name(((arg) => ZodBigInt.create({ ...arg, coerce: true })), "bigint"),
  date: /* @__PURE__ */ __name(((arg) => ZodDate.create({ ...arg, coerce: true })), "date")
};
var NEVER = INVALID;

// ../shared/src/protocol.ts
var ClientMsgSchema = external_exports.object({
  t: external_exports.enum([
    "join",
    "rejoin",
    "leave",
    "heartbeat",
    "action",
    "resync",
    "startGame",
    "endGame",
    "updateSettings",
    "kick",
    "transferHost"
  ]),
  roomCode: external_exports.string().length(4),
  clientToken: external_exports.string().min(8).max(128),
  seq: external_exports.number().int().nonnegative().optional(),
  payload: external_exports.unknown().optional()
});
var ActionPayloadSchema = external_exports.object({
  kind: external_exports.string().min(1).max(40)
});
var JoinPayloadSchema = external_exports.object({
  nickname: external_exports.string().min(1).max(12),
  avatarSeed: external_exports.string().min(1).max(32)
});
var StartGamePayloadSchema = external_exports.object({
  gameId: external_exports.string().min(1).max(32),
  options: external_exports.record(external_exports.unknown()).optional()
});
var KickPayloadSchema = external_exports.object({
  memberId: external_exports.string().min(1)
});
var UpdateSettingsPayloadSchema = external_exports.object({
  spice: external_exports.enum(["mild", "spicy"]).optional(),
  gameOptions: external_exports.record(external_exports.record(external_exports.unknown())).optional()
});

// ../shared/src/utils.ts
function createRng(seed) {
  let s = seed >>> 0;
  const next = /* @__PURE__ */ __name(() => {
    s = s + 1831565813 >>> 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }, "next");
  return {
    next,
    int: /* @__PURE__ */ __name((maxExclusive) => Math.floor(next() * maxExclusive), "int"),
    pick: /* @__PURE__ */ __name((arr) => arr[Math.floor(next() * arr.length)], "pick"),
    shuffle: /* @__PURE__ */ __name((arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }, "shuffle"),
    sample: /* @__PURE__ */ __name((arr, count3) => {
      const pool = arr.slice();
      const out = [];
      const n = Math.min(count3, pool.length);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(next() * pool.length);
        out.push(pool.splice(idx, 1)[0]);
      }
      return out;
    }, "sample"),
    get state() {
      return s;
    }
  };
}
__name(createRng, "createRng");
function randomRoomCode() {
  let out = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    out += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return out;
}
__name(randomRoomCode, "randomRoomCode");
function normalizeRoomCode(raw) {
  return raw.toUpperCase().replace(/O/g, "0").replace(/[^A-Z0-9]/g, "").slice(0, ROOM_CODE_LENGTH);
}
__name(normalizeRoomCode, "normalizeRoomCode");
function randomToken() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(randomToken, "randomToken");
function normalizeAnswer(raw) {
  return raw.replace(/[\s\u3000]/g, "").replace(/[，。！？、,.!?~～"'“”‘’()（）：:；;]/g, "").toLowerCase().trim();
}
__name(normalizeAnswer, "normalizeAnswer");

// ../shared/src/games.ts
var GAMES = [
  {
    id: "spy",
    name: "\u5367\u5E95\u627E\u832C",
    subtitle: "\u591A\u6570\u4EBA\u62FF\u5230\u540C\u4E00\u4E2A\u8BCD\uFF0C\u5C11\u6570\u4EBA\u662F\u5367\u5E95",
    minPlayers: 4,
    maxPlayers: 12,
    bestPlayers: [6, 8],
    durationMin: 8,
    tags: ["\u5634\u76AE\u5B50", "\u63A8\u7406", "\u7834\u51B0"],
    accent: "#7C5CFF",
    needsPrivateInfo: true,
    rules: [
      { icon: "EyeOff", title: "\u5404\u62FF\u4E00\u8BCD", desc: "\u5F00\u5C40\u6BCF\u4EBA\u6536\u5230\u4E00\u4E2A\u8BCD\u3002\u591A\u6570\u4EBA\u7684\u8BCD\u76F8\u540C\uFF0C\u5367\u5E95\u7684\u8BCD\u76F8\u8FD1\u4F46\u4E0D\u540C\u3002" },
      { icon: "MessageSquare", title: "\u8F6E\u6D41\u63CF\u8FF0", desc: "\u6BCF\u4EBA\u7528\u4E00\u53E5\u8BDD\u63CF\u8FF0\u81EA\u5DF1\u7684\u8BCD\uFF0C\u4E0D\u80FD\u76F4\u63A5\u8BF4\u51FA\u8BCD\u672C\u8EAB\u3002" },
      { icon: "Vote", title: "\u6295\u7968\u6293\u5367\u5E95", desc: "\u63CF\u8FF0\u5B8C\u6BD5\u5168\u5458\u6295\u7968\uFF0C\u5F97\u7968\u6700\u591A\u8005\u51FA\u5C40\u5E76\u516C\u5E03\u8EAB\u4EFD\u3002" }
    ]
  },
  {
    id: "draw",
    name: "\u4F60\u753B\u6211\u731C",
    subtitle: "\u4E00\u4EBA\u4F5C\u753B\uFF0C\u5176\u4ED6\u4EBA\u62A2\u7B54",
    minPlayers: 3,
    maxPlayers: 12,
    bestPlayers: [4, 8],
    durationMin: 10,
    tags: ["\u753B\u529F", "\u62A2\u7B54", "\u7206\u7B11"],
    accent: "#FF6B9D",
    needsPrivateInfo: true,
    rules: [
      { icon: "Brush", title: "\u9009\u8BCD\u4F5C\u753B", desc: "\u753B\u624B\u4E09\u9009\u4E00\u62FF\u5230\u8BCD\uFF0C\u5728\u753B\u677F\u4E0A\u4F5C\u753B\uFF0C\u4E0D\u80FD\u5199\u5B57\u3002" },
      { icon: "Timer", title: "\u9650\u65F6\u62A2\u7B54", desc: "\u5176\u4ED6\u4EBA\u5B9E\u65F6\u8F93\u5165\u731C\u6D4B\uFF0C\u731C\u5F97\u8D8A\u65E9\u5206\u8D8A\u9AD8\u3002" },
      { icon: "Play", title: "\u56DE\u653E\u5168\u573A", desc: "\u7ED3\u7B97\u65F6\u53EF\u56DE\u653E\u6574\u6BB5\u4F5C\u753B\u8FC7\u7A0B\uFF0C\u7B11\u70B9\u96C6\u4E2D\u5728\u8FD9\u91CC\u3002" }
    ]
  },
  {
    id: "spectrum",
    name: "\u5149\u8C31\u523B\u5EA6",
    subtitle: "\u4E00\u4E2A\u63D0\u793A\u8BCD\uFF0C\u731C\u5B83\u843D\u5728\u5149\u8C31\u7684\u54EA\u4E2A\u4F4D\u7F6E",
    minPlayers: 4,
    maxPlayers: 12,
    bestPlayers: [6, 10],
    durationMin: 15,
    tags: ["\u9ED8\u5951", "\u4E89\u8BBA", "\u5206\u961F"],
    accent: "#2BD9A0",
    needsPrivateInfo: true,
    rules: [
      { icon: "Gauge", title: "\u51FA\u9898\u4EBA\u770B\u523B\u5EA6", desc: "\u51FA\u9898\u4EBA\u62FF\u5230\u5149\u8C31\u4E0E\u9690\u85CF\u76EE\u6807\u4F4D\u7F6E\uFF0C\u7ED9\u51FA\u4E00\u4E2A\u63D0\u793A\u8BCD\u3002" },
      { icon: "MoveHorizontal", title: "\u5168\u5458\u62E8\u76D8", desc: "\u5176\u4ED6\u4EBA\u5404\u81EA\u5728\u624B\u673A\u4E0A\u62E8\u52A8\u8F6C\u76D8\uFF0C\u731C\u6D4B\u76EE\u6807\u4F4D\u7F6E\u3002" },
      { icon: "Target", title: "\u63ED\u6653\u770B\u8BEF\u5DEE", desc: "\u8D8A\u63A5\u8FD1\u5F97\u5206\u8D8A\u9AD8\uFF0C\u843D\u5728\u9519\u8BEF\u4E00\u4FA7\u5219\u5BF9\u624B\u5F97\u5206\u3002" }
    ]
  },
  {
    id: "truth",
    name: "\u771F\u5FC3\u8BDD\u5927\u5192\u9669",
    subtitle: "\u8F6C\u76D8\u9009\u4EBA\uFF0C\u7B54\u5B8C\u5927\u5BB6\u6253\u5206",
    minPlayers: 3,
    maxPlayers: 20,
    bestPlayers: [5, 10],
    durationMin: 15,
    tags: ["\u7834\u51B0", "\u516B\u5366", "\u523A\u6FC0"],
    accent: "#FFB020",
    needsPrivateInfo: false,
    rules: [
      { icon: "Disc3", title: "\u8F6C\u76D8\u9009\u4EBA", desc: "\u8F6C\u76D8\u505C\u4E0B\u6307\u5230\u8C01\uFF0C\u8C01\u5C31\u4E0A\u53F0\u63A5\u9898\u3002" },
      { icon: "HelpCircle", title: "\u9009\u9898\u4F5C\u7B54", desc: "\u9009\u62E9\u771F\u5FC3\u8BDD\u6216\u5927\u5192\u9669\uFF0C\u9650\u65F6\u5B8C\u6210\u3002" },
      { icon: "Flame", title: "\u5168\u5458\u6253\u5206", desc: "\u5176\u4ED6\u4EBA\u7ED9\u6577\u884D\u3001\u8FD8\u884C\u6216\u7CBE\u5F69\uFF0C\u5F97\u5206\u7D2F\u8BA1\u3002" }
    ]
  },
  {
    id: "wolf",
    name: "\u4E00\u591C\u72FC\u9547",
    subtitle: "\u53EA\u6709\u4E00\u4E2A\u591C\u665A\uFF0C\u4E00\u8F6E\u8BA8\u8BBA\uFF0C\u4E00\u6B21\u6295\u7968",
    minPlayers: 3,
    maxPlayers: 10,
    bestPlayers: [6, 9],
    durationMin: 10,
    tags: ["\u63A8\u7406", "\u6F14\u6280", "\u6CD5\u5B98"],
    accent: "#8B7CF6",
    needsPrivateInfo: true,
    rules: [
      { icon: "Moon", title: "\u591C\u665A\u884C\u52A8", desc: "\u7CFB\u7EDF\u5F53\u6CD5\u5B98\uFF0C\u6309\u8EAB\u4EFD\u4F9D\u6B21\u63D0\u793A\u4F60\u7741\u773C\u884C\u52A8\uFF0C\u5168\u7A0B\u95ED\u773C\u5373\u53EF\u3002" },
      { icon: "Users", title: "\u767D\u5929\u8BA8\u8BBA", desc: "\u9650\u65F6\u81EA\u7531\u8BA8\u8BBA\uFF0C\u8EAB\u4EFD\u53EF\u80FD\u5DF2\u88AB\u4EA4\u6362\uFF0C\u522B\u592A\u76F8\u4FE1\u81EA\u5DF1\u7684\u8BB0\u5FC6\u3002" },
      { icon: "Gavel", title: "\u4E00\u6B21\u5B9A\u80DC\u8D1F", desc: "\u5168\u5458\u6295\u7968\uFF0C\u5F97\u7968\u6700\u591A\u8005\u51FA\u5C40\uFF0C\u6309\u5176\u8EAB\u4EFD\u5224\u5B9A\u9635\u8425\u80DC\u8D1F\u3002" }
    ]
  }
];
var GAME_MAP = Object.fromEntries(GAMES.map((g) => [g.id, g]));

// ../shared/src/states.ts
var WOLF_NIGHT_ORDER = [
  "werewolf",
  "seer",
  "robber",
  "troublemaker",
  "drunk",
  "insomniac"
];

// src/room.ts
import { DurableObject } from "cloudflare:workers";

// ../game-core/src/content/wordPairs.ts
var WORD_PAIRS = [
  // 饮品食物
  { category: "\u5403\u559D", a: "\u53EF\u4E50", b: "\u96EA\u78A7" },
  { category: "\u5403\u559D", a: "\u5976\u8336", b: "\u5496\u5561" },
  { category: "\u5403\u559D", a: "\u706B\u9505", b: "\u70E7\u70E4" },
  { category: "\u5403\u559D", a: "\u5305\u5B50", b: "\u997A\u5B50" },
  { category: "\u5403\u559D", a: "\u9762\u6761", b: "\u7C73\u7EBF" },
  { category: "\u5403\u559D", a: "\u86CB\u7CD5", b: "\u9762\u5305" },
  { category: "\u5403\u559D", a: "\u51B0\u6DC7\u6DCB", b: "\u68D2\u68D2\u7CD6" },
  { category: "\u5403\u559D", a: "\u897F\u74DC", b: "\u51AC\u74DC" },
  { category: "\u5403\u559D", a: "\u8349\u8393", b: "\u6A31\u6843" },
  { category: "\u5403\u559D", a: "\u85AF\u6761", b: "\u85AF\u7247" },
  { category: "\u5403\u559D", a: "\u8C46\u6D46", b: "\u725B\u5976" },
  { category: "\u5403\u559D", a: "\u5564\u9152", b: "\u767D\u9152" },
  { category: "\u5403\u559D", a: "\u62AB\u8428", b: "\u714E\u997C" },
  { category: "\u5403\u559D", a: "\u5BFF\u53F8", b: "\u996D\u56E2" },
  { category: "\u5403\u559D", a: "\u6708\u997C", b: "\u997C\u5E72" },
  { category: "\u5403\u559D", a: "\u7CA5", b: "\u6C64" },
  { category: "\u5403\u559D", a: "\u8FA3\u6912", b: "\u82B1\u6912" },
  { category: "\u5403\u559D", a: "\u8702\u871C", b: "\u767D\u7CD6" },
  { category: "\u5403\u559D", a: "\u53E3\u9999\u7CD6", b: "\u8584\u8377\u7CD6" },
  { category: "\u5403\u559D", a: "\u70E4\u9E2D", b: "\u70E7\u9E21" },
  // 日常用品
  { category: "\u65E5\u5E38", a: "\u7259\u5237", b: "\u68B3\u5B50" },
  { category: "\u65E5\u5E38", a: "\u6BDB\u5DFE", b: "\u6D74\u5DFE" },
  { category: "\u65E5\u5E38", a: "\u96E8\u4F1E", b: "\u592A\u9633\u4F1E" },
  { category: "\u65E5\u5E38", a: "\u955C\u5B50", b: "\u73BB\u7483" },
  { category: "\u65E5\u5E38", a: "\u62D6\u978B", b: "\u51C9\u978B" },
  { category: "\u65E5\u5E38", a: "\u56F4\u5DFE", b: "\u9886\u5E26" },
  { category: "\u65E5\u5E38", a: "\u624B\u5957", b: "\u889C\u5B50" },
  { category: "\u65E5\u5E38", a: "\u4E66\u5305", b: "\u624B\u63D0\u5305" },
  { category: "\u65E5\u5E38", a: "\u53F0\u706F", b: "\u624B\u7535\u7B52" },
  { category: "\u65E5\u5E38", a: "\u6C99\u53D1", b: "\u5E8A" },
  { category: "\u65E5\u5E38", a: "\u51B0\u7BB1", b: "\u6D17\u8863\u673A" },
  { category: "\u65E5\u5E38", a: "\u7A7A\u8C03", b: "\u7535\u98CE\u6247" },
  { category: "\u65E5\u5E38", a: "\u5FAE\u6CE2\u7089", b: "\u70E4\u7BB1" },
  { category: "\u65E5\u5E38", a: "\u95F9\u949F", b: "\u624B\u8868" },
  { category: "\u65E5\u5E38", a: "\u94A5\u5319", b: "\u95E8\u5361" },
  { category: "\u65E5\u5E38", a: "\u7EB8\u5DFE", b: "\u6E7F\u5DFE" },
  { category: "\u65E5\u5E38", a: "\u6C34\u676F", b: "\u4FDD\u6E29\u676F" },
  { category: "\u65E5\u5E38", a: "\u6795\u5934", b: "\u62B1\u6795" },
  { category: "\u65E5\u5E38", a: "\u8721\u70DB", b: "\u706F\u7B3C" },
  { category: "\u65E5\u5E38", a: "\u526A\u5200", b: "\u83DC\u5200" },
  // 交通出行
  { category: "\u51FA\u884C", a: "\u81EA\u884C\u8F66", b: "\u7535\u52A8\u8F66" },
  { category: "\u51FA\u884C", a: "\u5730\u94C1", b: "\u516C\u4EA4" },
  { category: "\u51FA\u884C", a: "\u51FA\u79DF\u8F66", b: "\u7F51\u7EA6\u8F66" },
  { category: "\u51FA\u884C", a: "\u9AD8\u94C1", b: "\u98DE\u673A" },
  { category: "\u51FA\u884C", a: "\u8F6E\u8239", b: "\u6E38\u8247" },
  { category: "\u51FA\u884C", a: "\u7EA2\u7EFF\u706F", b: "\u8DEF\u724C" },
  { category: "\u51FA\u884C", a: "\u5B89\u5168\u5E26", b: "\u5B89\u5168\u5E3D" },
  { category: "\u51FA\u884C", a: "\u52A0\u6CB9\u7AD9", b: "\u5145\u7535\u7AD9" },
  { category: "\u51FA\u884C", a: "\u505C\u8F66\u573A", b: "\u8F66\u5E93" },
  { category: "\u51FA\u884C", a: "\u6591\u9A6C\u7EBF", b: "\u4EBA\u884C\u5929\u6865" },
  { category: "\u51FA\u884C", a: "\u65B9\u5411\u76D8", b: "\u8F66\u94A5\u5319" },
  { category: "\u51FA\u884C", a: "\u5730\u56FE", b: "\u6307\u5357\u9488" },
  // 数码科技
  { category: "\u6570\u7801", a: "\u8033\u673A", b: "\u97F3\u7BB1" },
  { category: "\u6570\u7801", a: "\u952E\u76D8", b: "\u9F20\u6807" },
  { category: "\u6570\u7801", a: "\u5145\u7535\u5B9D", b: "\u5145\u7535\u5668" },
  { category: "\u6570\u7801", a: "\u76F8\u673A", b: "\u6444\u50CF\u673A" },
  { category: "\u6570\u7801", a: "\u5E73\u677F", b: "\u7B14\u8BB0\u672C\u7535\u8111" },
  { category: "\u6570\u7801", a: "\u8DEF\u7531\u5668", b: "\u4EA4\u6362\u673A" },
  { category: "\u6570\u7801", a: "U\u76D8", b: "\u79FB\u52A8\u786C\u76D8" },
  { category: "\u6570\u7801", a: "\u6295\u5F71\u4EEA", b: "\u7535\u89C6" },
  { category: "\u6570\u7801", a: "\u81EA\u62CD\u6746", b: "\u4E09\u811A\u67B6" },
  { category: "\u6570\u7801", a: "\u9A8C\u8BC1\u7801", b: "\u5BC6\u7801" },
  { category: "\u6570\u7801", a: "\u670B\u53CB\u5708", b: "\u5FAE\u535A" },
  { category: "\u6570\u7801", a: "\u76F4\u64AD", b: "\u77ED\u89C6\u9891" },
  // 娱乐休闲
  { category: "\u5A31\u4E50", a: "\u7535\u5F71\u9662", b: "\u5267\u573A" },
  { category: "\u5A31\u4E50", a: "KTV", b: "\u9152\u5427" },
  { category: "\u5A31\u4E50", a: "\u6E38\u4E50\u56ED", b: "\u52A8\u7269\u56ED" },
  { category: "\u5A31\u4E50", a: "\u9EBB\u5C06", b: "\u6251\u514B" },
  { category: "\u5A31\u4E50", a: "\u8C61\u68CB", b: "\u56F4\u68CB" },
  { category: "\u5A31\u4E50", a: "\u7BEE\u7403", b: "\u6392\u7403" },
  { category: "\u5A31\u4E50", a: "\u7FBD\u6BDB\u7403", b: "\u4E52\u4E53\u7403" },
  { category: "\u5A31\u4E50", a: "\u6E38\u6CF3", b: "\u6F5C\u6C34" },
  { category: "\u5A31\u4E50", a: "\u6ED1\u96EA", b: "\u6ED1\u51B0" },
  { category: "\u5A31\u4E50", a: "\u8DF3\u7EF3", b: "\u8DD1\u6B65" },
  { category: "\u5A31\u4E50", a: "\u745C\u4F3D", b: "\u5065\u8EAB" },
  { category: "\u5A31\u4E50", a: "\u9732\u8425", b: "\u91CE\u9910" },
  { category: "\u5A31\u4E50", a: "\u5409\u5B83", b: "\u94A2\u7434" },
  { category: "\u5A31\u4E50", a: "\u6F14\u5531\u4F1A", b: "\u97F3\u4E50\u8282" },
  { category: "\u5A31\u4E50", a: "\u5C0F\u8BF4", b: "\u6F2B\u753B" },
  // 动物植物
  { category: "\u81EA\u7136", a: "\u732B", b: "\u8001\u864E" },
  { category: "\u81EA\u7136", a: "\u72D7", b: "\u72FC" },
  { category: "\u81EA\u7136", a: "\u5154\u5B50", b: "\u888B\u9F20" },
  { category: "\u81EA\u7136", a: "\u4F01\u9E45", b: "\u5317\u6781\u718A" },
  { category: "\u81EA\u7136", a: "\u7AE0\u9C7C", b: "\u4E4C\u8D3C" },
  { category: "\u81EA\u7136", a: "\u8774\u8776", b: "\u871C\u8702" },
  { category: "\u81EA\u7136", a: "\u4E4C\u9F9F", b: "\u8783\u87F9" },
  { category: "\u81EA\u7136", a: "\u5927\u8C61", b: "\u6CB3\u9A6C" },
  { category: "\u81EA\u7136", a: "\u957F\u9888\u9E7F", b: "\u6591\u9A6C" },
  { category: "\u81EA\u7136", a: "\u5411\u65E5\u8475", b: "\u84B2\u516C\u82F1" },
  { category: "\u81EA\u7136", a: "\u73AB\u7470", b: "\u6708\u5B63" },
  { category: "\u81EA\u7136", a: "\u4ED9\u4EBA\u638C", b: "\u82A6\u835F" },
  { category: "\u81EA\u7136", a: "\u7AF9\u5B50", b: "\u7518\u8517" },
  { category: "\u81EA\u7136", a: "\u8611\u83C7", b: "\u6728\u8033" },
  // 职业人物
  { category: "\u4EBA\u7269", a: "\u533B\u751F", b: "\u62A4\u58EB" },
  { category: "\u4EBA\u7269", a: "\u8001\u5E08", b: "\u6559\u6388" },
  { category: "\u4EBA\u7269", a: "\u8B66\u5BDF", b: "\u4FDD\u5B89" },
  { category: "\u4EBA\u7269", a: "\u53A8\u5E08", b: "\u670D\u52A1\u5458" },
  { category: "\u4EBA\u7269", a: "\u5F8B\u5E08", b: "\u6CD5\u5B98" },
  { category: "\u4EBA\u7269", a: "\u53F8\u673A", b: "\u98DE\u884C\u5458" },
  { category: "\u4EBA\u7269", a: "\u7406\u53D1\u5E08", b: "\u5316\u5986\u5E08" },
  { category: "\u4EBA\u7269", a: "\u5FEB\u9012\u5458", b: "\u5916\u5356\u5458" },
  { category: "\u4EBA\u7269", a: "\u6D88\u9632\u5458", b: "\u6551\u751F\u5458" },
  { category: "\u4EBA\u7269", a: "\u4F5C\u5BB6", b: "\u8BB0\u8005" },
  { category: "\u4EBA\u7269", a: "\u5BFC\u6F14", b: "\u6F14\u5458" },
  { category: "\u4EBA\u7269", a: "\u8001\u677F", b: "\u5458\u5DE5" },
  // 场所地点
  { category: "\u5730\u70B9", a: "\u533B\u9662", b: "\u836F\u5E97" },
  { category: "\u5730\u70B9", a: "\u5B66\u6821", b: "\u56FE\u4E66\u9986" },
  { category: "\u5730\u70B9", a: "\u8D85\u5E02", b: "\u4FBF\u5229\u5E97" },
  { category: "\u5730\u70B9", a: "\u94F6\u884C", b: "\u90AE\u5C40" },
  { category: "\u5730\u70B9", a: "\u516C\u56ED", b: "\u5E7F\u573A" },
  { category: "\u5730\u70B9", a: "\u7535\u68AF", b: "\u6276\u68AF" },
  { category: "\u5730\u70B9", a: "\u9633\u53F0", b: "\u7A97\u6237" },
  { category: "\u5730\u70B9", a: "\u53A8\u623F", b: "\u536B\u751F\u95F4" },
  { category: "\u5730\u70B9", a: "\u5065\u8EAB\u623F", b: "\u6E38\u6CF3\u9986" },
  { category: "\u5730\u70B9", a: "\u673A\u573A", b: "\u706B\u8F66\u7AD9" },
  // 抽象与时间
  { category: "\u62BD\u8C61", a: "\u521D\u604B", b: "\u6697\u604B" },
  { category: "\u62BD\u8C61", a: "\u52A0\u73ED", b: "\u71AC\u591C" },
  { category: "\u62BD\u8C61", a: "\u5DE5\u8D44", b: "\u5956\u91D1" },
  { category: "\u62BD\u8C61", a: "\u8003\u8BD5", b: "\u9762\u8BD5" },
  { category: "\u62BD\u8C61", a: "\u6691\u5047", b: "\u5BD2\u5047" },
  { category: "\u62BD\u8C61", a: "\u751F\u65E5", b: "\u5A5A\u793C" },
  { category: "\u62BD\u8C61", a: "\u7AE5\u5E74", b: "\u9752\u6625\u671F" },
  { category: "\u62BD\u8C61", a: "\u68A6\u60F3", b: "\u76EE\u6807" },
  { category: "\u62BD\u8C61", a: "\u56DE\u5FC6", b: "\u5E7B\u60F3" },
  { category: "\u62BD\u8C61", a: "\u540E\u6094", b: "\u9057\u61BE" },
  { category: "\u62BD\u8C61", a: "\u8FD0\u6C14", b: "\u5B9E\u529B" },
  { category: "\u62BD\u8C61", a: "\u666E\u901A\u8BDD", b: "\u65B9\u8A00" },
  // 天气自然现象
  { category: "\u5929\u6C14", a: "\u4E0B\u96E8", b: "\u4E0B\u96EA" },
  { category: "\u5929\u6C14", a: "\u5F69\u8679", b: "\u6781\u5149" },
  { category: "\u5929\u6C14", a: "\u53F0\u98CE", b: "\u9F99\u5377\u98CE" },
  { category: "\u5929\u6C14", a: "\u96F7\u7535", b: "\u95EA\u7535" },
  { category: "\u5929\u6C14", a: "\u6C99\u6F20", b: "\u8349\u539F" },
  { category: "\u5929\u6C14", a: "\u5927\u6D77", b: "\u6E56\u6CCA" },
  { category: "\u5929\u6C14", a: "\u65E5\u51FA", b: "\u65E5\u843D" },
  { category: "\u5929\u6C14", a: "\u6625\u5929", b: "\u79CB\u5929" }
];
var WORD_PAIR_CATEGORIES = Array.from(new Set(WORD_PAIRS.map((p) => p.category)));

// ../game-core/src/games/spy.ts
var REVEAL_SECONDS = 20;
var DESCRIBE_SECONDS = 30;
var VOTE_SECONDS = 25;
var RESULT_SECONDS = 8;
function autoSpyCount(playerCount) {
  if (playerCount <= 8) return 1;
  return 2;
}
__name(autoSpyCount, "autoSpyCount");
function num(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
__name(num, "num");
function speakersFor(state) {
  return state.revoteCandidates ?? state.aliveIds;
}
__name(speakersFor, "speakersFor");
function beginDescribe(state, now2) {
  const queue = speakersFor(state);
  return {
    ...state,
    phase: "describe",
    speakerQueue: queue,
    speakerId: queue[0] ?? null,
    votes: {},
    phaseEndsAt: now2 + DESCRIBE_SECONDS * 1e3
  };
}
__name(beginDescribe, "beginDescribe");
function beginVote(state, now2) {
  return {
    ...state,
    phase: "vote",
    speakerId: null,
    phaseEndsAt: now2 + VOTE_SECONDS * 1e3
  };
}
__name(beginVote, "beginVote");
function finishGame(state, winner, now2) {
  return { ...state, phase: "result", winner, speakerId: null, phaseEndsAt: now2 + RESULT_SECONDS * 1e3 };
}
__name(finishGame, "finishGame");
function tallyVotes(state, now2) {
  const counts = /* @__PURE__ */ new Map();
  for (const target of Object.values(state.votes)) {
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  const candidates = speakersFor(state);
  let max = 0;
  for (const id of candidates) {
    const c = counts.get(id) ?? 0;
    if (c > max) max = c;
  }
  const top = candidates.filter((id) => (counts.get(id) ?? 0) === max && max > 0);
  const toVoteResult = /* @__PURE__ */ __name((s) => ({
    ...s,
    votes: {},
    phase: "voteResult",
    phaseEndsAt: now2 + RESULT_SECONDS * 1e3
  }), "toVoteResult");
  if (top.length === 0) {
    return toVoteResult({ ...state, revoteCandidates: null, lastEliminated: null });
  }
  if (top.length > 1) {
    if (state.revoteCandidates) {
      return toVoteResult({ ...state, revoteCandidates: null, lastEliminated: null });
    }
    return beginDescribe({ ...state, revoteCandidates: top, votes: {} }, now2);
  }
  const eliminatedId = top[0];
  const role = state.spyIds.includes(eliminatedId) ? "spy" : "civilian";
  const elimination = { id: eliminatedId, role, round: state.round };
  return toVoteResult({
    ...state,
    aliveIds: state.aliveIds.filter((id) => id !== eliminatedId),
    outIds: [...state.outIds, eliminatedId],
    revoteCandidates: null,
    lastEliminated: elimination,
    history: [...state.history, elimination]
  });
}
__name(tallyVotes, "tallyVotes");
function advanceAfterElimination(state, _elimination, now2) {
  const spiesAlive = state.aliveIds.filter((id) => state.spyIds.includes(id));
  if (spiesAlive.length === 0) {
    return finishGame(state, "civilian", now2);
  }
  if (state.aliveIds.length <= 2) {
    return finishGame(state, "spy", now2);
  }
  if (state.round >= state.maxRounds) {
    return finishGame(state, "spy", now2);
  }
  return beginDescribe({ ...state, round: state.round + 1, lastEliminated: null }, now2);
}
__name(advanceAfterElimination, "advanceAfterElimination");
var spyModule = {
  id: "spy",
  defaultOptions: {
    spyCount: 0,
    // 0 = 自动
    maxRounds: 2,
    spyAware: false
  },
  create(ctx, options) {
    const seed = (ctx.now ^ ctx.memberIds.length * 2654435761) >>> 0;
    const rng = createRng(seed);
    const requested = num(options.spyCount, 0);
    const auto = autoSpyCount(ctx.memberIds.length);
    const spyCount = requested > 0 ? Math.min(requested, Math.max(1, ctx.memberIds.length - 2)) : auto;
    const pair = rng.pick(WORD_PAIRS);
    const flip = rng.next() < 0.5;
    const words = flip ? [pair.b, pair.a] : [pair.a, pair.b];
    const spyIds = rng.sample(ctx.memberIds, spyCount);
    return {
      seed: rng.state,
      phase: "reveal",
      round: 1,
      // 轮数上限至少要能投完所有卧底，否则多卧底局必定是卧底胜（平民没机会投完）。
      // 房主自定义时同样受此下限约束。
      maxRounds: Math.max(spyCount + 1, Math.min(5, num(options.maxRounds, spyCount + 1))),
      spyIds,
      words,
      category: pair.category,
      speakerQueue: [],
      speakerId: null,
      descriptions: [],
      votes: {},
      readyIds: [],
      revoteCandidates: null,
      aliveIds: [...ctx.memberIds],
      outIds: [],
      phaseEndsAt: ctx.now + REVEAL_SECONDS * 1e3,
      winner: null,
      lastEliminated: null,
      history: [],
      spyAware: options.spyAware === true
    };
  },
  reduce(state, action, ctx) {
    const alive = state.aliveIds.includes(ctx.playerId);
    if (action.kind === "ready" && state.phase === "reveal" && alive) {
      const readyIds = state.readyIds.includes(ctx.playerId) ? state.readyIds : [...state.readyIds, ctx.playerId];
      const allReady = state.aliveIds.every((id) => readyIds.includes(id));
      if (allReady) return beginDescribe({ ...state, readyIds }, ctx.now);
      return { ...state, readyIds };
    }
    if (action.kind === "describe" && state.phase === "describe") {
      if (ctx.playerId !== state.speakerId) return state;
      const raw = typeof action.text === "string" ? action.text.trim() : "";
      const text = raw.slice(0, 30);
      if (text.length < 2) return state;
      const descriptions = [...state.descriptions, { playerId: ctx.playerId, round: state.round, text }];
      const queue = state.speakerQueue;
      const idx = queue.indexOf(ctx.playerId);
      const nextSpeaker = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null;
      if (nextSpeaker === null) {
        return beginVote({ ...state, descriptions, speakerId: null }, ctx.now);
      }
      return {
        ...state,
        descriptions,
        speakerId: nextSpeaker,
        phaseEndsAt: ctx.now + DESCRIBE_SECONDS * 1e3
      };
    }
    if (action.kind === "vote" && state.phase === "vote") {
      if (!alive) return state;
      const candidates = speakersFor(state);
      const target = typeof action.targetId === "string" ? action.targetId : "";
      if (!candidates.includes(target)) return state;
      const votes = { ...state.votes, [ctx.playerId]: target };
      const allVoted = state.aliveIds.every((id) => votes[id]);
      if (allVoted) return tallyVotes({ ...state, votes }, ctx.now);
      return { ...state, votes };
    }
    return state;
  },
  privateView(state, playerId) {
    const isSpy = state.spyIds.includes(playerId);
    const role = state.outIds.includes(playerId) ? "spectator" : isSpy ? "spy" : "civilian";
    return {
      myWord: isSpy ? state.words[1] : state.words[0],
      myRole: role,
      // 卧底知悉身份的变体下，额外告知
      amISpy: isSpy && state.spyAware
    };
  },
  tick(state, now2) {
    if (state.phaseEndsAt === null || now2 < state.phaseEndsAt) return state;
    switch (state.phase) {
      case "reveal":
        return beginDescribe(state, now2);
      case "describe": {
        const queue = state.speakerQueue;
        const idx = state.speakerId ? queue.indexOf(state.speakerId) : -1;
        const nextSpeaker = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null;
        if (nextSpeaker === null) return beginVote({ ...state, speakerId: null }, now2);
        return { ...state, speakerId: nextSpeaker, phaseEndsAt: now2 + DESCRIBE_SECONDS * 1e3 };
      }
      case "vote":
        return tallyVotes(state, now2);
      case "voteResult":
        return advanceAfterElimination(state, state.lastEliminated, now2);
      case "result":
        return { ...state, phaseEndsAt: null };
      default:
        return state;
    }
  },
  nextDeadline(state, now2) {
    if (state.phase === "result") return null;
    if (state.phaseEndsAt === null) return null;
    return state.phaseEndsAt > now2 ? state.phaseEndsAt : null;
  },
  redact(state) {
    if (state.phase === "result") return state;
    return { ...state, words: ["", ""], spyIds: [] };
  }
};

// ../game-core/src/content/drawWords.ts
var DRAW_WORDS = [
  // ---- 难度 1：好画 ----
  { word: "\u592A\u9633", level: 1 },
  { word: "\u6708\u4EAE", level: 1 },
  { word: "\u661F\u661F", level: 1 },
  { word: "\u7231\u5FC3", level: 1 },
  { word: "\u96E8\u4F1E", level: 1 },
  { word: "\u623F\u5B50", level: 1 },
  { word: "\u6811", level: 1 },
  { word: "\u82B1", level: 1 },
  { word: "\u9C7C", level: 1 },
  { word: "\u732B", level: 1 },
  { word: "\u72D7", level: 1 },
  { word: "\u9E1F", level: 1 },
  { word: "\u5154\u5B50", level: 1 },
  { word: "\u5927\u8C61", level: 1 },
  { word: "\u957F\u9888\u9E7F", level: 1 },
  { word: "\u86C7", level: 1 },
  { word: "\u8783\u87F9", level: 1 },
  { word: "\u7AE0\u9C7C", level: 1 },
  { word: "\u8717\u725B", level: 1 },
  { word: "\u8774\u8776", level: 1 },
  { word: "\u82F9\u679C", level: 1 },
  { word: "\u9999\u8549", level: 1 },
  { word: "\u897F\u74DC", level: 1 },
  { word: "\u51B0\u6DC7\u6DCB", level: 1 },
  { word: "\u6C49\u5821", level: 1 },
  { word: "\u62AB\u8428", level: 1 },
  { word: "\u9762\u6761", level: 1 },
  { word: "\u9E21\u86CB", level: 1 },
  { word: "\u86CB\u7CD5", level: 1 },
  { word: "\u706B\u9505", level: 1 },
  { word: "\u7259\u5237", level: 1 },
  { word: "\u526A\u5200", level: 1 },
  { word: "\u94A5\u5319", level: 1 },
  { word: "\u773C\u955C", level: 1 },
  { word: "\u5E3D\u5B50", level: 1 },
  { word: "\u978B\u5B50", level: 1 },
  { word: "\u624B\u5957", level: 1 },
  { word: "\u4E66\u5305", level: 1 },
  { word: "\u624B\u8868", level: 1 },
  { word: "\u96E8\u9774", level: 1 },
  { word: "\u6C7D\u8F66", level: 1 },
  { word: "\u81EA\u884C\u8F66", level: 1 },
  { word: "\u98DE\u673A", level: 1 },
  { word: "\u706B\u7BAD", level: 1 },
  { word: "\u8239", level: 1 },
  { word: "\u706B\u8F66", level: 1 },
  { word: "\u7EA2\u7EFF\u706F", level: 1 },
  { word: "\u7BEE\u7403", level: 1 },
  { word: "\u8DB3\u7403", level: 1 },
  { word: "\u671B\u8FDC\u955C", level: 1 },
  { word: "\u76F8\u673A", level: 1 },
  { word: "\u7535\u89C6", level: 1 },
  { word: "\u7535\u8BDD", level: 1 },
  { word: "\u53F0\u706F", level: 1 },
  { word: "\u95F9\u949F", level: 1 },
  { word: "\u6C34\u676F", level: 1 },
  { word: "\u5FAE\u6CE2\u7089", level: 1 },
  { word: "\u6D17\u8863\u673A", level: 1 },
  { word: "\u9A6C\u6876", level: 1 },
  { word: "\u697C\u68AF", level: 1 },
  { word: "\u5F69\u8679", level: 1 },
  { word: "\u706B\u5C71", level: 1 },
  { word: "\u96EA\u4EBA", level: 1 },
  { word: "\u9A86\u9A7C", level: 1 },
  { word: "\u4F01\u9E45", level: 1 },
  { word: "\u6CB3\u9A6C", level: 1 },
  { word: "\u8003\u62C9", level: 1 },
  { word: "\u718A\u732B", level: 1 },
  { word: "\u523A\u732C", level: 1 },
  { word: "\u8611\u83C7", level: 1 },
  { word: "\u4ED9\u4EBA\u638C", level: 1 },
  { word: "\u7389\u7C73", level: 1 },
  { word: "\u8FA3\u6912", level: 1 },
  // ---- 难度 2：中等 ----
  { word: "\u53F0\u98CE", level: 2 },
  { word: "\u5730\u9707", level: 2 },
  { word: "\u6C99\u6F20", level: 2 },
  { word: "\u7011\u5E03", level: 2 },
  { word: "\u957F\u57CE", level: 2 },
  { word: "\u91D1\u5B57\u5854", level: 2 },
  { word: "\u57C3\u83F2\u5C14\u94C1\u5854", level: 2 },
  { word: "\u6469\u5929\u8F6E", level: 2 },
  { word: "\u8FC7\u5C71\u8F66", level: 2 },
  { word: "\u65CB\u8F6C\u6728\u9A6C", level: 2 },
  { word: "\u6F5C\u6C34\u8247", level: 2 },
  { word: "\u70ED\u6C14\u7403", level: 2 },
  { word: "\u964D\u843D\u4F1E", level: 2 },
  { word: "\u76F4\u5347\u673A", level: 2 },
  { word: "\u6551\u62A4\u8F66", level: 2 },
  { word: "\u6D88\u9632\u8F66", level: 2 },
  { word: "\u63A8\u571F\u673A", level: 2 },
  { word: "\u7535\u98CE\u6247", level: 2 },
  { word: "\u5439\u98CE\u673A", level: 2 },
  { word: "\u5438\u5C18\u5668", level: 2 },
  { word: "\u69A8\u6C41\u673A", level: 2 },
  { word: "\u9065\u63A7\u5668", level: 2 },
  { word: "\u5145\u7535\u5B9D", level: 2 },
  { word: "\u952E\u76D8", level: 2 },
  { word: "\u8033\u673A", level: 2 },
  { word: "\u6295\u5F71\u4EEA", level: 2 },
  { word: "\u663E\u5FAE\u955C", level: 2 },
  { word: "\u4F53\u6E29\u8BA1", level: 2 },
  { word: "\u8F93\u6DB2", level: 2 },
  { word: "\u8F6E\u6905", level: 2 },
  { word: "\u62D0\u6756", level: 2 },
  { word: "\u5A5A\u7EB1", level: 2 },
  { word: "\u897F\u88C5", level: 2 },
  { word: "\u7761\u8863", level: 2 },
  { word: "\u62D6\u628A", level: 2 },
  { word: "\u68AF\u5B50", level: 2 },
  { word: "\u706D\u706B\u5668", level: 2 },
  { word: "\u5B58\u94B1\u7F50", level: 2 },
  { word: "\u96F6\u94B1\u5305", level: 2 },
  { word: "\u5783\u573E\u6876", level: 2 },
  { word: "\u732B\u5934\u9E70", level: 2 },
  { word: "\u5B54\u96C0", level: 2 },
  { word: "\u6D77\u8C5A", level: 2 },
  { word: "\u9CB8\u9C7C", level: 2 },
  { word: "\u6C34\u6BCD", level: 2 },
  { word: "\u6D77\u661F", level: 2 },
  { word: "\u8759\u8760", level: 2 },
  { word: "\u6811\u888B\u718A", level: 2 },
  { word: "\u53D8\u8272\u9F99", level: 2 },
  { word: "\u7A7F\u5C71\u7532", level: 2 },
  { word: "\u9F99\u867E", level: 2 },
  { word: "\u5BFF\u53F8", level: 2 },
  { word: "\u68C9\u82B1\u7CD6", level: 2 },
  { word: "\u7206\u7C73\u82B1", level: 2 },
  { word: "\u68D2\u68D2\u7CD6", level: 2 },
  { word: "\u73CD\u73E0\u5976\u8336", level: 2 },
  { word: "\u70E4\u4E32", level: 2 },
  { word: "\u5C0F\u7B3C\u5305", level: 2 },
  { word: "\u69B4\u83B2", level: 2 },
  { word: "\u83E0\u841D", level: 2 },
  { word: "\u77F3\u69B4", level: 2 },
  // ---- 难度 3：抽象 / 需要巧思 ----
  { word: "\u65F6\u95F4", level: 3 },
  { word: "\u81EA\u7531", level: 3 },
  { word: "\u5B64\u72EC", level: 3 },
  { word: "\u7231\u60C5", level: 3 },
  { word: "\u538B\u529B", level: 3 },
  { word: "\u5931\u7720", level: 3 },
  { word: "\u62D6\u5EF6\u75C7", level: 3 },
  { word: "\u9009\u62E9\u56F0\u96BE", level: 3 },
  { word: "\u793E\u6050", level: 3 },
  { word: "\u5185\u5377", level: 3 },
  { word: "\u8EBA\u5E73", level: 3 },
  { word: "\u6478\u9C7C", level: 3 },
  { word: "\u52A0\u73ED", level: 3 },
  { word: "\u5468\u4E00", level: 3 },
  { word: "\u53D1\u5DE5\u8D44", level: 3 },
  { word: "\u7F51\u8D2D", level: 3 },
  { word: "\u5FEB\u9012", level: 3 },
  { word: "\u76F4\u64AD\u5E26\u8D27", level: 3 },
  { word: "\u81EA\u62CD", level: 3 },
  { word: "\u8868\u60C5\u5305", level: 3 },
  { word: "\u670B\u53CB\u5708", level: 3 },
  { word: "wifi \u4FE1\u53F7", level: 3 },
  { word: "\u624B\u673A\u6CA1\u7535", level: 3 },
  { word: "\u5835\u8F66", level: 3 },
  { word: "\u6392\u961F", level: 3 },
  { word: "\u76F8\u4EB2", level: 3 },
  { word: "\u5206\u624B", level: 3 },
  { word: "\u6697\u604B", level: 3 },
  { word: "\u5F02\u5730\u604B", level: 3 },
  { word: "\u56DE\u5FC6", level: 3 },
  { word: "\u7AE5\u5E74", level: 3 },
  { word: "\u6BD5\u4E1A", level: 3 },
  { word: "\u8003\u8BD5", level: 3 },
  { word: "\u4E2D\u5956", level: 3 },
  { word: "\u505A\u68A6", level: 3 },
  { word: "\u6253\u547C\u565C", level: 3 },
  { word: "\u6253\u55B7\u568F", level: 3 },
  { word: "\u6655\u8F66", level: 3 },
  { word: "\u8FD1\u89C6", level: 3 },
  { word: "\u51CF\u80A5", level: 3 },
  { word: "\u5065\u8EAB", level: 3 },
  { word: "\u5403\u74DC", level: 3 },
  { word: "\u80CC\u9505", level: 3 },
  { word: "\u5212\u6C34", level: 3 },
  { word: "\u4E94\u4EC1\u6708\u997C", level: 3 },
  { word: "\u9999\u83DC", level: 3 },
  { word: "\u6298\u8033\u6839", level: 3 },
  { word: "\u87BA\u86F3\u7C89", level: 3 }
];

// ../game-core/src/games/draw.ts
var PICK_SECONDS = 8;
var DRAW_SECONDS = 80;
var ROUND_END_SECONDS = 8;
var HINT_AT_40 = 40;
var HINT_AT_20 = 20;
var MAX_STROKES = 400;
var MAX_POINTS_PER_STROKE = 3e3;
function num2(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
__name(num2, "num");
function buildMask(word, positions, revealCount) {
  const chars = Array.from(word);
  const revealed = new Set(positions.slice(0, revealCount));
  return chars.map((c, i) => revealed.has(i) ? c : "\u25A1").join(" ");
}
__name(buildMask, "buildMask");
function revealPositions(word, seed) {
  const rng = createRng(seed);
  return rng.shuffle(Array.from(word).map((_, i) => i));
}
__name(revealPositions, "revealPositions");
function hintSchedule(now2, drawSeconds) {
  const total = drawSeconds * 1e3;
  return {
    hint1At: now2 + Math.max(0, total - HINT_AT_40 * 1e3),
    hint2At: now2 + Math.max(0, total - HINT_AT_20 * 1e3)
  };
}
__name(hintSchedule, "hintSchedule");
function beginDrawing(state, idx, rngSeed, now2, drawSeconds) {
  const word = state.choices[idx] ?? "";
  const difficulty = idx + 1;
  const positions = revealPositions(word, rngSeed);
  const { hint1At, hint2At } = hintSchedule(now2, drawSeconds);
  return {
    ...state,
    phase: "drawing",
    word,
    difficulty,
    revealMask: buildMask(word, positions, 0),
    hintLevel: 0,
    hint1At,
    hint2At,
    phaseEndsAt: now2 + drawSeconds * 1e3
  };
}
__name(beginDrawing, "beginDrawing");
function startRound(state, rng, now2) {
  const easyPool = DRAW_WORDS.filter((w) => w.level === 1).map((w) => w.word);
  const midPool = DRAW_WORDS.filter((w) => w.level === 2).map((w) => w.word);
  const hardPool = DRAW_WORDS.filter((w) => w.level === 3).map((w) => w.word);
  const pickUnused = /* @__PURE__ */ __name((pool) => {
    const fresh = pool.filter((w) => !state.usedWords.includes(w));
    const source = fresh.length > 0 ? fresh : pool;
    return source[Math.floor(rng.next() * source.length)];
  }, "pickUnused");
  const choices = [pickUnused(easyPool), pickUnused(midPool), pickUnused(hardPool)];
  const drawerId = state.order[state.drawerIndex % state.order.length];
  return {
    ...state,
    seed: rng.state,
    phase: "pick",
    drawerId,
    choices,
    word: null,
    difficulty: 2,
    strokes: [],
    guessFeed: [],
    correctOrder: [],
    revealMask: "",
    hintLevel: 0,
    hint1At: null,
    hint2At: null,
    roundDeltas: [],
    phaseEndsAt: now2 + PICK_SECONDS * 1e3
  };
}
__name(startRound, "startRound");
function endRound(state, now2) {
  const word = state.word ?? "";
  const deltas = [];
  const scores = { ...state.scores };
  const bonus = state.difficulty - 1;
  state.correctOrder.forEach((pid2, idx) => {
    const base = idx === 0 ? 3 : idx === 1 ? 2 : 1;
    const delta = base + bonus;
    scores[pid2] = (scores[pid2] ?? 0) + delta;
    deltas.push({ playerId: pid2, delta });
  });
  if (state.correctOrder.length > 0 && state.drawerId) {
    const drawerGain = Math.min(state.correctOrder.length, 3) + bonus;
    scores[state.drawerId] = (scores[state.drawerId] ?? 0) + drawerGain;
    deltas.push({ playerId: state.drawerId, delta: drawerGain });
  }
  return {
    ...state,
    phase: "roundEnd",
    scores,
    roundDeltas: deltas,
    word,
    hint1At: null,
    hint2At: null,
    phaseEndsAt: now2 + ROUND_END_SECONDS * 1e3
  };
}
__name(endRound, "endRound");
function advance(state, rng, now2) {
  const nextIndex = state.drawerIndex + 1;
  if (nextIndex >= state.totalRounds) {
    return { ...state, phase: "result", hint1At: null, hint2At: null, phaseEndsAt: null };
  }
  const usedWords = state.word ? [...state.usedWords, state.word] : state.usedWords;
  return startRound({ ...state, drawerIndex: nextIndex, round: state.round + 1, usedWords }, rng, now2);
}
__name(advance, "advance");
var drawModule = {
  id: "draw",
  defaultOptions: {
    /** 0 = 每人画一轮（最多 8 轮）；也可显式指定 3/5/8 */
    rounds: 0,
    drawSeconds: DRAW_SECONDS
  },
  create(ctx, options) {
    const seed = (ctx.now ^ ctx.memberIds.length * 40503) >>> 0;
    const rng = createRng(seed);
    const order = rng.shuffle(ctx.memberIds);
    const requested = num2(options.rounds, 0);
    const totalRounds = requested > 0 ? Math.max(1, Math.min(12, requested)) : Math.max(1, Math.min(8, ctx.memberIds.length));
    const base = {
      seed: rng.state,
      phase: "pick",
      round: 1,
      totalRounds,
      order,
      drawerIndex: 0,
      drawerId: order[0],
      choices: [],
      word: null,
      difficulty: 2,
      strokes: [],
      guessFeed: [],
      correctOrder: [],
      scores: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      revealMask: "",
      hintLevel: 0,
      hint1At: null,
      hint2At: null,
      phaseEndsAt: ctx.now + PICK_SECONDS * 1e3,
      usedWords: [],
      roundDeltas: [],
      drawSeconds: Math.max(30, Math.min(180, num2(options.drawSeconds, DRAW_SECONDS)))
    };
    return startRound(base, rng, ctx.now);
  },
  reduce(state, action, ctx) {
    const rng = createRng(state.seed);
    const isDrawer = ctx.playerId === state.drawerId;
    if (action.kind === "pickWord" && state.phase === "pick" && isDrawer) {
      const idx = num2(action.index, -1);
      if (idx < 0 || idx >= state.choices.length) return state;
      const next = beginDrawing(state, idx, rng.state, ctx.now, state.drawSeconds);
      return { ...next, seed: rng.state };
    }
    if (action.kind === "stroke" && state.phase === "drawing" && isDrawer) {
      const op = action.op;
      if (op === "clear") return { ...state, strokes: [] };
      if (op === "undo") return { ...state, strokes: state.strokes.slice(0, -1) };
      if (op === "end") return state;
      const strokeId = typeof action.strokeId === "string" ? action.strokeId.slice(0, 40) : "";
      if (!strokeId) return state;
      if (op === "begin") {
        if (state.strokes.length >= MAX_STROKES) return state;
        const color = typeof action.color === "string" ? action.color.slice(0, 24) : "#F5F5F7";
        const width = Math.max(1, Math.min(24, num2(action.width, 4)));
        const pts = Array.isArray(action.points) ? action.points.filter((n) => typeof n === "number") : [];
        const stroke = { id: strokeId, color, width, points: pts.slice(0, 2) };
        return { ...state, strokes: [...state.strokes, stroke] };
      }
      if (op === "points") {
        const idx = state.strokes.findIndex((s) => s.id === strokeId);
        if (idx < 0) return state;
        const pts = Array.isArray(action.points) ? action.points.filter((n) => typeof n === "number") : [];
        if (pts.length === 0) return state;
        const strokes = state.strokes.slice();
        const cur = strokes[idx];
        const merged = cur.points.concat(pts);
        if (merged.length > MAX_POINTS_PER_STROKE) return state;
        strokes[idx] = { ...cur, points: merged };
        return { ...state, strokes };
      }
      return state;
    }
    if (action.kind === "guess" && state.phase === "drawing" && !isDrawer) {
      const raw = typeof action.text === "string" ? action.text : "";
      const text = raw.trim().slice(0, 20);
      if (!text) return state;
      const word = state.word ?? "";
      const correct = word.length > 0 && normalizeAnswer(text) === normalizeAnswer(word);
      const entry = { playerId: ctx.playerId, text, correct, at: ctx.now };
      const guessFeed = [...state.guessFeed, entry].slice(-60);
      if (!correct) return { ...state, guessFeed };
      if (state.correctOrder.includes(ctx.playerId)) return { ...state, guessFeed };
      const correctOrder = [...state.correctOrder, ctx.playerId];
      const next = { ...state, guessFeed, correctOrder };
      const others = state.order.filter((id) => id !== state.drawerId);
      const allGuessed = others.length > 0 && others.every((id) => correctOrder.includes(id));
      return allGuessed ? endRound(next, ctx.now) : next;
    }
    if (action.kind === "nextRound" && state.phase === "roundEnd") {
      return advance(state, rng, ctx.now);
    }
    return state;
  },
  privateView(state, playerId) {
    if (playerId === state.drawerId) {
      return {
        role: "drawer",
        choices: state.phase === "pick" ? state.choices : [],
        word: state.word
      };
    }
    return { role: "guesser", word: null };
  },
  tick(state, now2) {
    switch (state.phase) {
      case "pick": {
        if (state.phaseEndsAt === null || now2 < state.phaseEndsAt) return state;
        const rng = createRng(state.seed);
        const idx = Math.min(1, Math.max(0, state.choices.length - 1));
        const next = beginDrawing(state, idx, rng.state, now2, state.drawSeconds);
        return { ...next, seed: rng.state };
      }
      case "drawing": {
        if (state.phaseEndsAt === null) return state;
        const word = state.word ?? "";
        const positions = revealPositions(word, state.seed);
        const wanted = Math.min(word.length, 2);
        let hintLevel = state.hintLevel;
        if (state.hint1At !== null && now2 >= state.hint1At && hintLevel < 1) hintLevel = 1;
        if (state.hint2At !== null && now2 >= state.hint2At && hintLevel < wanted) hintLevel = wanted;
        if (hintLevel !== state.hintLevel) {
          return { ...state, hintLevel, revealMask: buildMask(word, positions, hintLevel) };
        }
        if (now2 >= state.phaseEndsAt) return endRound(state, now2);
        return state;
      }
      case "roundEnd": {
        if (state.phaseEndsAt === null || now2 < state.phaseEndsAt) return state;
        const rng = createRng(state.seed);
        return advance(state, rng, now2);
      }
      default:
        return { ...state, phaseEndsAt: null };
    }
  },
  nextDeadline(state, now2) {
    if (state.phase === "result") return null;
    const cands = [];
    if (state.phaseEndsAt !== null) cands.push(state.phaseEndsAt);
    if (state.phase === "drawing") {
      if (state.hint1At !== null && state.hintLevel < 1) cands.push(state.hint1At);
      if (state.hint2At !== null && state.hintLevel < 2) cands.push(state.hint2At);
    }
    const future = cands.filter((t) => t > now2);
    return future.length > 0 ? Math.min(...future) : null;
  },
  redact(state) {
    if (state.phase === "pick") return { ...state, choices: [], word: null };
    if (state.phase === "drawing") return { ...state, choices: [], word: null };
    return { ...state, choices: [] };
  }
};

// ../game-core/src/content/spectra.ts
var SPECTRA = [
  { left: "\u51B7\u6F20", right: "\u70ED\u60C5" },
  { left: "\u5B89\u9759", right: "\u5435\u95F9" },
  { left: "\u4FBF\u5B9C", right: "\u6602\u8D35" },
  { left: "\u7B80\u5355", right: "\u590D\u6742" },
  { left: "\u65E0\u804A", right: "\u6709\u8DA3" },
  { left: "\u7F13\u6162", right: "\u98DE\u5FEB" },
  { left: "\u67D4\u8F6F", right: "\u575A\u786C" },
  { left: "\u51B0\u51B7", right: "\u6EDA\u70EB" },
  { left: "\u8F7B\u76C8", right: "\u6C89\u91CD" },
  { left: "\u72ED\u5C0F", right: "\u5BBD\u655E" },
  { left: "\u5D2D\u65B0", right: "\u7834\u65E7" },
  { left: "\u4FDD\u5B88", right: "\u5192\u9669" },
  { left: "\u7406\u6027", right: "\u611F\u6027" },
  { left: "\u61D2\u60F0", right: "\u52E4\u594B" },
  { left: "\u80C6\u5C0F", right: "\u52C7\u6562" },
  { left: "\u908B\u9062", right: "\u6574\u6D01" },
  { left: "\u62A0\u95E8", right: "\u6325\u970D" },
  { left: "\u7C97\u5FC3", right: "\u7EC6\u81F4" },
  { left: "\u5185\u5411", right: "\u5916\u5411" },
  { left: "\u4E25\u8083", right: "\u5E7D\u9ED8" },
  { left: "\u7A1A\u5AE9", right: "\u6210\u719F" },
  { left: "\u8D2B\u7A77", right: "\u5BCC\u6709" },
  { left: "\u77ED\u6682", right: "\u6F2B\u957F" },
  { left: "\u5BB9\u6613", right: "\u56F0\u96BE" },
  { left: "\u5B89\u5168", right: "\u5371\u9669" },
  { left: "\u719F\u6089", right: "\u964C\u751F" },
  { left: "\u666E\u901A", right: "\u7A00\u6709" },
  { left: "\u6E05\u6DE1", right: "\u91CD\u53E3" },
  { left: "\u5065\u5EB7", right: "\u5783\u573E\u98DF\u54C1" },
  { left: "\u5BB6\u5E38", right: "\u7C73\u5176\u6797" },
  { left: "\u89E3\u6E34", right: "\u8D8A\u559D\u8D8A\u6E34" },
  { left: "\u586B\u9971\u809A\u5B50", right: "\u53D1\u80D6" },
  { left: "\u8DEF\u8FB9\u644A", right: "\u9AD8\u6863\u9910\u5385" },
  { left: "\u96BE\u5403", right: "\u597D\u5403" },
  { left: "\u65E9\u9910", right: "\u5BB5\u591C" },
  { left: "\u81EA\u5DF1\u505A\u996D", right: "\u70B9\u5916\u5356" },
  { left: "\u7D20", right: "\u8364" },
  { left: "\u5FAE\u8FA3", right: "\u53D8\u6001\u8FA3" },
  { left: "\u51B0\u9547", right: "\u70ED\u996E" },
  { left: "\u5DE5\u4EBA", right: "\u8001\u677F" },
  { left: "\u5B9E\u4E60", right: "\u9000\u4F11" },
  { left: "\u52A0\u73ED", right: "\u6478\u9C7C" },
  { left: "\u6253\u5DE5\u4EBA", right: "\u81EA\u7531\u804C\u4E1A" },
  { left: "\u671D\u4E5D\u665A\u4E94", right: "007" },
  { left: "\u5F00\u5377\u8003", right: "\u95ED\u5377\u8003" },
  { left: "\u53CA\u683C", right: "\u6EE1\u5206" },
  { left: "\u5C0F\u5B66", right: "\u535A\u58EB" },
  { left: "\u5B66\u6E23", right: "\u5B66\u9738" },
  { left: "\u8865\u8003", right: "\u4FDD\u7814" },
  { left: "\u6587\u79D1", right: "\u7406\u79D1" },
  { left: "\u521D\u604B", right: "\u8001\u592B\u8001\u59BB" },
  { left: "\u5355\u8EAB", right: "\u5DF2\u5A5A" },
  { left: "\u76F8\u4EB2", right: "\u81EA\u7531\u604B\u7231" },
  { left: "\u6697\u604B", right: "\u660E\u604B" },
  { left: "\u5206\u624B", right: "\u590D\u5408" },
  { left: "\u7F51\u604B", right: "\u73B0\u5B9E" },
  { left: "\u5F02\u5730", right: "\u540C\u57CE" },
  { left: "\u670B\u53CB", right: "\u604B\u4EBA" },
  { left: "\u719F\u4EBA", right: "\u964C\u751F\u4EBA" },
  { left: "\u793E\u6050", right: "\u793E\u725B" },
  { left: "\u72EC\u5904", right: "\u805A\u4F1A" },
  { left: "\u5B85\u5BB6", right: "\u51FA\u95E8" },
  { left: "\u8EBA\u5E73", right: "\u5185\u5377" },
  { left: "\u4F5B\u7CFB", right: "\u8F83\u771F" },
  { left: "\u65E9\u8D77", right: "\u71AC\u591C" },
  { left: "\u5DE5\u4F5C\u65E5", right: "\u5468\u672B" },
  { left: "\u4E0B\u96E8", right: "\u66B4\u6652" },
  { left: "\u5BD2\u51AC", right: "\u9177\u6691" },
  { left: "\u6625\u5929", right: "\u79CB\u5929" },
  { left: "\u57CE\u5E02", right: "\u4E61\u6751" },
  { left: "\u5E02\u4E2D\u5FC3", right: "\u90CA\u533A" },
  { left: "\u5730\u94C1", right: "\u81EA\u9A7E" },
  { left: "\u5F92\u6B65", right: "\u5750\u8F66" },
  { left: "\u7A77\u6E38", right: "\u5962\u534E\u6E38" },
  { left: "\u8BF4\u8D70\u5C31\u8D70", right: "\u8BA1\u5212\u534A\u5E74" },
  { left: "\u732B", right: "\u72D7" },
  { left: "\u751C\u7CBD", right: "\u54B8\u7CBD" },
  { left: "\u8C46\u8150\u8111\u751C\u7684", right: "\u54B8\u7684" },
  { left: "\u756A\u8304\u7092\u86CB\u52A0\u7CD6", right: "\u4E0D\u52A0\u7CD6" },
  { left: "\u9999\u83DC\u597D\u5403", right: "\u9999\u83DC\u662F\u6BD2\u836F" },
  { left: "\u4E94\u4EC1\u6708\u997C", right: "\u86CB\u9EC4\u83B2\u84C9" },
  { left: "\u5496\u5561", right: "\u8336" },
  { left: "\u53EF\u53E3\u53EF\u4E50", right: "\u767E\u4E8B\u53EF\u4E50" },
  { left: "iOS", right: "\u5B89\u5353" },
  { left: "\u6709\u7EBF\u8033\u673A", right: "\u65E0\u7EBF\u8033\u673A" },
  { left: "\u7535\u5B50\u4E66", right: "\u7EB8\u8D28\u4E66" },
  { left: "\u7535\u5F71", right: "\u7535\u89C6\u5267" },
  { left: "\u8FFD\u5267", right: "\u8FFD\u7EFC\u827A" },
  { left: "\u6D41\u884C\u4E50", right: "\u53E4\u5178\u4E50" },
  { left: "\u770B\u5C55", right: "\u901B\u5546\u573A" },
  { left: "\u9EBB\u5C06", right: "\u5267\u672C\u6740" },
  { left: "\u5355\u673A", right: "\u8054\u673A" },
  { left: "\u624B\u6E38", right: "\u4E3B\u673A\u6E38\u620F" },
  { left: "\u5065\u8EAB\u623F", right: "\u5BB6\u91CC\u8EBA" },
  { left: "\u8DD1\u6B65", right: "\u6E38\u6CF3" },
  { left: "\u722C\u5C71", right: "\u6D77\u8FB9" },
  { left: "\u513F\u7AE5", right: "\u6210\u4EBA" },
  { left: "\u6587\u79D1\u751F", right: "\u7406\u79D1\u751F" },
  { left: "\u5357\u65B9", right: "\u5317\u65B9" },
  { left: "\u6625\u8282", right: "\u5723\u8BDE" },
  { left: "\u5C0F\u65F6\u5019", right: "\u73B0\u5728" },
  { left: "\u73B0\u5B9E", right: "\u7406\u60F3" },
  { left: "\u8FD0\u6C14", right: "\u5B9E\u529B" },
  { left: "\u8FC7\u7A0B", right: "\u7ED3\u679C" },
  { left: "\u7701\u94B1", right: "\u7701\u65F6\u95F4" },
  { left: "\u5B9E\u7528", right: "\u597D\u770B" },
  { left: "\u8D28\u91CF", right: "\u6570\u91CF" }
];

// ../game-core/src/games/spectrum.ts
var CLUE_SECONDS = 45;
var GUESS_SECONDS = 35;
var REVEAL_SECONDS2 = 10;
var PERFECT_RADIUS = 4;
function num3(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
__name(num3, "num");
function other(t) {
  return t === "A" ? "B" : "A";
}
__name(other, "other");
function sideOf(v) {
  return v >= 50 ? "B" : "A";
}
__name(sideOf, "sideOf");
function nextClueGiver(state) {
  const team = state.teamTurn;
  const members = Object.keys(state.teamOf).filter((id) => state.teamOf[id] === team);
  if (members.length === 0) return Object.keys(state.teamOf)[0];
  const cursor = state.turnCursor[team] ?? 0;
  return members[cursor % members.length];
}
__name(nextClueGiver, "nextClueGiver");
function setupRound(state, rng, now2) {
  const available = SPECTRA.map((_, i) => i).filter((i) => !state.usedSpectra.includes(i));
  const pool = available.length > 0 ? available : SPECTRA.map((_, i) => i);
  const idx = pool[Math.floor(rng.next() * pool.length)];
  const spectrum = SPECTRA[idx];
  const target = 12 + Math.floor(rng.next() * 77);
  const usedSpectra = available.length > 0 ? [...state.usedSpectra, idx] : [idx];
  const cursor = { ...state.turnCursor };
  cursor[state.teamTurn] = (cursor[state.teamTurn] ?? 0) + 1;
  return {
    ...state,
    seed: rng.state,
    phase: "clue",
    clueGiverId: nextClueGiver(state),
    left: spectrum.left,
    right: spectrum.right,
    target,
    clue: null,
    guesses: {},
    usedSpectra,
    turnCursor: cursor,
    lastResult: null,
    phaseEndsAt: now2 + CLUE_SECONDS * 1e3
  };
}
__name(setupRound, "setupRound");
function enterReveal(state, now2) {
  const result = scoreRound(state);
  const scores = {
    A: state.scores.A + result.teamDeltas.A,
    B: state.scores.B + result.teamDeltas.B
  };
  const perPlayer = { ...state.perPlayer };
  for (const [id, d] of Object.entries(result.deltas)) {
    perPlayer[id] = (perPlayer[id] ?? 0) + d;
  }
  return {
    ...state,
    phase: "reveal",
    lastResult: result,
    scores,
    perPlayer,
    phaseEndsAt: now2 + REVEAL_SECONDS2 * 1e3
  };
}
__name(enterReveal, "enterReveal");
function scoreRound(state) {
  const guessers = Object.keys(state.teamOf).filter((id) => id !== state.clueGiverId);
  const targetSide = sideOf(state.target);
  const deltas = {};
  const teamDeltas = { A: 0, B: 0 };
  let perfect = true;
  for (const id of guessers) {
    const g = state.guesses[id];
    if (typeof g !== "number") {
      perfect = false;
      continue;
    }
    if (Math.abs(g - state.target) <= PERFECT_RADIUS) {
      deltas[id] = 3;
      teamDeltas[state.teamOf[id]] += 3;
    } else if (sideOf(g) === targetSide) {
      deltas[id] = 1;
      teamDeltas[state.teamOf[id]] += 1;
      perfect = false;
    } else {
      deltas[id] = 0;
      teamDeltas[other(state.teamOf[id])] += 1;
      perfect = false;
    }
  }
  const correctCount = guessers.filter((id) => (deltas[id] ?? 0) > 0).length;
  const clueGain = Math.min(3, correctCount);
  deltas[state.clueGiverId] = clueGain;
  teamDeltas[state.teamOf[state.clueGiverId]] += clueGain;
  return { target: state.target, clue: state.clue ?? "", guesses: { ...state.guesses }, deltas, teamDeltas, perfect };
}
__name(scoreRound, "scoreRound");
var spectrumModule = {
  id: "spectrum",
  defaultOptions: {
    rounds: 4,
    useTeams: true
  },
  create(ctx, options) {
    const seed = (ctx.now ^ ctx.memberIds.length * 22695477) >>> 0;
    const rng = createRng(seed);
    const useTeams = options.useTeams !== false && ctx.memberIds.length >= 4;
    const teamOf = {};
    ctx.memberIds.forEach((id, i) => {
      teamOf[id] = useTeams ? i % 2 === 0 ? "A" : "B" : "A";
    });
    const totalRounds = Math.max(2, Math.min(10, num3(options.rounds, 4)));
    const base = {
      seed: rng.state,
      phase: "clue",
      round: 1,
      totalRounds,
      clueGiverId: ctx.memberIds[0],
      left: "",
      right: "",
      target: 50,
      clue: null,
      guesses: {},
      teamOf,
      teamTurn: "A",
      turnCursor: { A: 0, B: 0 },
      scores: { A: 0, B: 0 },
      perPlayer: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      lastResult: null,
      phaseEndsAt: ctx.now + CLUE_SECONDS * 1e3,
      usedSpectra: [],
      useTeams
    };
    return setupRound(base, rng, ctx.now);
  },
  reduce(state, action, ctx) {
    const rng = createRng(state.seed);
    if (action.kind === "submitClue" && state.phase === "clue" && ctx.playerId === state.clueGiverId) {
      const raw = typeof action.clue === "string" ? action.clue.trim() : "";
      const clue = raw.slice(0, 12);
      if (clue.length < 1) return state;
      return {
        ...state,
        clue,
        phase: "guess",
        phaseEndsAt: ctx.now + GUESS_SECONDS * 1e3
      };
    }
    if (action.kind === "submitGuess" && state.phase === "guess") {
      if (ctx.playerId === state.clueGiverId) return state;
      if (!(ctx.playerId in state.teamOf)) return state;
      const raw = num3(action.value, -1);
      if (raw < 0 || raw > 100) return state;
      const guesses = { ...state.guesses, [ctx.playerId]: Math.round(raw) };
      const guessers = Object.keys(state.teamOf).filter((id) => id !== state.clueGiverId);
      const allGuessed = guessers.every((id) => guesses[id] !== void 0);
      if (allGuessed) {
        return enterReveal({ ...state, guesses }, ctx.now);
      }
      return { ...state, guesses };
    }
    if (action.kind === "nextRound" && (state.phase === "reveal" || state.phase === "result")) {
      if (state.round >= state.totalRounds) {
        return { ...state, phase: "result", phaseEndsAt: null };
      }
      const nextTurn2 = other(state.teamTurn);
      return setupRound(
        { ...state, round: state.round + 1, teamTurn: state.useTeams ? nextTurn2 : "A" },
        rng,
        ctx.now
      );
    }
    return state;
  },
  privateView(state, playerId) {
    if (playerId === state.clueGiverId) {
      return { isClueGiver: true, target: state.target };
    }
    return { isClueGiver: false, target: null };
  },
  tick(state, now2) {
    if (state.phaseEndsAt === null) return state;
    if (now2 < state.phaseEndsAt) return state;
    const rng = createRng(state.seed);
    switch (state.phase) {
      case "clue":
        if (state.round >= state.totalRounds) {
          return { ...state, phase: "result", phaseEndsAt: null };
        }
        return setupRound(
          { ...state, round: state.round + 1, teamTurn: state.useTeams ? other(state.teamTurn) : "A" },
          rng,
          now2
        );
      case "guess":
        return enterReveal(state, now2);
      case "reveal": {
        if (state.round >= state.totalRounds) {
          return { ...state, phase: "result", phaseEndsAt: null };
        }
        return setupRound(
          { ...state, round: state.round + 1, teamTurn: state.useTeams ? other(state.teamTurn) : "A" },
          rng,
          now2
        );
      }
      default:
        return { ...state, phaseEndsAt: null };
    }
  },
  nextDeadline(state, now2) {
    if (state.phase === "result") return null;
    if (state.phaseEndsAt === null) return null;
    return state.phaseEndsAt > now2 ? state.phaseEndsAt : null;
  },
  redact(state) {
    if (state.phase === "reveal" || state.phase === "result") return state;
    return { ...state, target: -1 };
  }
};

// ../game-core/src/content/questions.ts
var T = /* @__PURE__ */ __name((i, spice, text) => ({
  id: `t${i}`,
  type: "truth",
  spice,
  text
}), "T");
var D = /* @__PURE__ */ __name((i, spice, text) => ({
  id: `d${i}`,
  type: "dare",
  spice,
  text
}), "D");
var QUESTIONS = [
  // ================= 真心话 · 温和 =================
  T("001", "mild", "\u8BF4\u51FA\u5728\u573A\u6BCF\u4E00\u4E2A\u4EBA\u7684\u4E00\u4E2A\u4F18\u70B9\uFF0C\u4E0D\u8BB8\u91CD\u590D\u5F62\u5BB9\u8BCD"),
  T("002", "mild", "\u4F60\u624B\u673A\u76F8\u518C\u91CC\u6700\u65B0\u7684\u4E00\u5F20\u7167\u7247\u662F\u4EC0\u4E48\uFF1F\u7ED9\u5927\u5BB6\u770B"),
  T("003", "mild", "\u4ECA\u5E74\u505A\u8FC7\u6700\u8BA9\u81EA\u5DF1\u9A84\u50B2\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("004", "mild", "\u5982\u679C\u660E\u5929\u53EF\u4EE5\u4E0D\u4E0A\u73ED/\u4E0D\u4E0A\u8BFE\uFF0C\u4F60\u6700\u60F3\u505A\u4EC0\u4E48\uFF1F"),
  T("005", "mild", "\u4F60\u6700\u8FD1\u5355\u66F2\u5FAA\u73AF\u7684\u4E00\u9996\u6B4C\u662F\u4EC0\u4E48\uFF1F\u5531\u4E24\u53E5"),
  T("006", "mild", "\u8BF4\u4E00\u4E2A\u4F60\u4ECE\u5C0F\u575A\u6301\u5230\u73B0\u5728\u7684\u4E60\u60EF"),
  T("007", "mild", "\u4F60\u6700\u60F3\u53BB\u4F46\u8FD8\u6CA1\u53BB\u8FC7\u7684\u5730\u65B9\u662F\u54EA\u91CC\uFF1F\u4E3A\u4EC0\u4E48\u6CA1\u53BB\uFF1F"),
  T("008", "mild", "\u4F60\u5C0F\u65F6\u5019\u7684\u68A6\u60F3\u804C\u4E1A\u662F\u4EC0\u4E48\uFF1F\u73B0\u5728\u8FD8\u60F3\u505A\u5417\uFF1F"),
  T("009", "mild", "\u6700\u8FD1\u4E00\u6B21\u5F00\u6000\u5927\u7B11\u662F\u56E0\u4E3A\u4EC0\u4E48\uFF1F"),
  T("010", "mild", "\u4F60\u505A\u8FC7\u6700\u50BB\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("011", "mild", "\u5982\u679C\u7ED9\u4F60\u4E00\u767E\u4E07\u4F46\u53EA\u80FD\u82B1\u5728\u522B\u4EBA\u8EAB\u4E0A\uFF0C\u4F60\u4F1A\u600E\u4E48\u82B1\uFF1F"),
  T("012", "mild", "\u4F60\u6700\u559C\u6B22\u81EA\u5DF1\u8EAB\u4E0A\u54EA\u4E2A\u5730\u65B9\uFF1F"),
  T("013", "mild", "\u4F60\u6700\u4E0D\u60F3\u518D\u5403\u7B2C\u4E8C\u6B21\u7684\u98DF\u7269\u662F\u4EC0\u4E48\uFF1F"),
  T("014", "mild", "\u8BF4\u4E00\u4E2A\u4F60\u5077\u5077\u575A\u6301\u5F88\u4E45\u4F46\u6CA1\u544A\u8BC9\u8FC7\u522B\u4EBA\u7684\u5C0F\u4E60\u60EF"),
  T("015", "mild", "\u4F60\u6700\u8FD1\u5B66\u5230\u7684\u4E00\u4E2A\u65B0\u6280\u80FD\u6216\u51B7\u77E5\u8BC6\u662F\u4EC0\u4E48\uFF1F"),
  T("016", "mild", "\u5982\u679C\u53EF\u4EE5\u77AC\u95F4\u638C\u63E1\u4E00\u9879\u6280\u80FD\uFF0C\u4F60\u9009\u4EC0\u4E48\uFF1F"),
  T("017", "mild", "\u4F60\u6253\u7535\u8BDD\u58F0\u97F3\u548C\u5E73\u65F6\u8BF4\u8BDD\u4E00\u6837\u5417\uFF1F"),
  T("018", "mild", "\u4F60\u6700\u820D\u4E0D\u5F97\u6254\u7684\u4E00\u4EF6\u65E7\u4E1C\u897F\u662F\u4EC0\u4E48\uFF1F"),
  T("019", "mild", "\u4E0A\u4E00\u6B21\u9053\u6B49\u662F\u56E0\u4E3A\u4EC0\u4E48\u4E8B\uFF1F"),
  T("020", "mild", "\u4F60\u4E00\u822C\u51E0\u70B9\u7761\uFF1F\u8BF4\u51FA\u4F60\u7684\u771F\u5B9E\u4F5C\u606F"),
  T("021", "mild", "\u4F60\u624B\u673A\u91CC\u6700\u820D\u4E0D\u5F97\u5220\u7684 App \u662F\u4EC0\u4E48\uFF1F\u4E3A\u4EC0\u4E48\uFF1F"),
  T("022", "mild", "\u4F60\u662F\u90A3\u79CD\u4F1A\u56DE\u6D88\u606F\u79D2\u56DE\u8FD8\u662F\u8F6E\u56DE\u7684\u4EBA\uFF1F"),
  T("023", "mild", "\u4F60\u505A\u8FC7\u6700\u7701\u94B1\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("024", "mild", "\u4F60\u6700\u8BA8\u538C\u505A\u4F46\u4E0D\u5F97\u4E0D\u505A\u7684\u5BB6\u52A1\u662F\u4EC0\u4E48\uFF1F"),
  T("025", "mild", "\u5982\u679C\u4F60\u80FD\u56DE\u5230\u5341\u5E74\u524D\uFF0C\u4F60\u4F1A\u5BF9\u81EA\u5DF1\u8BF4\u4EC0\u4E48\uFF1F"),
  T("026", "mild", "\u4F60\u76F8\u4FE1\u8FD0\u6C14\u8FD8\u662F\u52AA\u529B\uFF1F\u4E3E\u4E2A\u81EA\u5DF1\u7684\u4F8B\u5B50"),
  T("027", "mild", "\u8BF4\u4E00\u4EF6\u8BA9\u4F60\u89C9\u5F97\u300C\u8FD8\u597D\u5F53\u65F6\u6CA1\u653E\u5F03\u300D\u7684\u4E8B"),
  T("028", "mild", "\u4F60\u6700\u8FD1\u4E00\u6B21\u54ED\u662F\u56E0\u4E3A\u4EC0\u4E48\uFF1F"),
  T("029", "mild", "\u4F60\u6700\u597D\u7684\u670B\u53CB\u662F\u8C01\uFF1F\u8BF4\u51FA\u4E09\u4E2A TA \u7684\u4F18\u70B9"),
  T("030", "mild", "\u4F60\u6709\u6CA1\u6709\u4E00\u4E2A\u5F88\u60F3\u89C1\u4F46\u5F88\u4E45\u6CA1\u89C1\u7684\u4EBA\uFF1F"),
  T("031", "mild", "\u4F60\u505A\u8FC7\u6700\u6D6A\u8D39\u65F6\u95F4\u4F46\u5F88\u5FEB\u4E50\u7684\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("032", "mild", "\u4F60\u5C0F\u65F6\u5019\u88AB\u8D77\u8FC7\u4EC0\u4E48\u5916\u53F7\uFF1F"),
  T("033", "mild", "\u5982\u679C\u53EF\u4EE5\u517B\u4EFB\u4F55\u4E00\u79CD\u52A8\u7269\u5F53\u5BA0\u7269\uFF0C\u4F60\u9009\u4EC0\u4E48\uFF1F"),
  T("034", "mild", "\u4F60\u6700\u60F3\u5BF9\u5728\u573A\u54EA\u4E2A\u4EBA\u8BF4\u4E00\u53E5\u8C22\u8C22\uFF1F\u8BF4\u4EC0\u4E48\uFF1F"),
  T("035", "mild", "\u4F60\u6700\u8FD1\u5728\u8FFD\u4EC0\u4E48\u5267/\u7EFC\u827A/\u6E38\u620F\uFF1F\u5B89\u5229\u7ED9\u5927\u5BB6"),
  T("036", "mild", "\u4F60\u8863\u67DC\u91CC\u6700\u8D35\u7684\u4E00\u4EF6\u8863\u670D\u591A\u5C11\u94B1\uFF1F"),
  T("037", "mild", "\u4F60\u6709\u6CA1\u6709\u505A\u8FC7\u4EC0\u4E48\u8BA9\u81EA\u5DF1\u540E\u6094\u7684\u51B3\u5B9A\uFF1F"),
  T("038", "mild", "\u4F60\u6700\u7231\u5403\u7684\u4E00\u9053\u5BB6\u5E38\u83DC\u662F\u8C01\u505A\u7684\uFF1F"),
  T("039", "mild", "\u4F60\u89C9\u5F97\u81EA\u5DF1\u6700\u50CF\u54EA\u79CD\u52A8\u7269\uFF1F\u4E3A\u4EC0\u4E48\uFF1F"),
  T("040", "mild", "\u4F60\u6700\u8FD1\u4E00\u6B21\u8BF4\u8C0E\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F\u5185\u5BB9\u662F\u4EC0\u4E48\uFF1F"),
  T("041", "mild", "\u4F60\u5E73\u65F6\u600E\u4E48\u7F13\u89E3\u538B\u529B\uFF1F"),
  T("042", "mild", "\u4F60\u6700\u60F3\u53BB\u54EA\u4E2A\u57CE\u5E02\u751F\u6D3B\u4E00\u5E74\uFF1F"),
  T("043", "mild", "\u4F60\u505A\u8FC7\u6700\u5927\u80C6\u7684\u4E00\u6B21\u5C1D\u8BD5\u662F\u4EC0\u4E48\uFF1F"),
  T("044", "mild", "\u4F60\u6709\u6CA1\u6709\u5077\u5077\u7FA1\u6155\u8FC7\u5728\u573A\u67D0\u4E2A\u4EBA\uFF1F\u7FA1\u6155\u4EC0\u4E48\uFF1F"),
  T("045", "mild", "\u5982\u679C\u4ECA\u5929\u662F\u4E16\u754C\u672B\u65E5\uFF0C\u4F60\u4F1A\u505A\u4EC0\u4E48\uFF1F"),
  T("046", "mild", "\u4F60\u624B\u673A\u91CC\u5B58\u7684\u6700\u65E9\u4E00\u6761\u804A\u5929\u8BB0\u5F55\u662F\u4EC0\u4E48\uFF1F"),
  T("047", "mild", "\u4F60\u6700\u4E0D\u60F3\u6539\u53D8\u81EA\u5DF1\u7684\u54EA\u4E2A\u7F3A\u70B9\uFF1F"),
  T("048", "mild", "\u4F60\u5C0F\u65F6\u5019\u6700\u5BB3\u6015\u4EC0\u4E48\uFF1F"),
  T("049", "mild", "\u8BF4\u4E00\u4EF6\u4F60\u4EE5\u4E3A\u81EA\u5DF1\u505A\u4E0D\u5230\u4F46\u6700\u540E\u505A\u5230\u7684\u4E8B"),
  T("050", "mild", "\u4F60\u6700\u8FD1\u6536\u5230\u7684\u6700\u6696\u5FC3\u7684\u4E00\u53E5\u8BDD\u662F\u4EC0\u4E48\uFF1F"),
  T("051", "mild", "\u4F60\u6709\u6CA1\u6709\u4E00\u4E2A\u575A\u6301\u4E86\u5F88\u4E45\u7684\u602A\u7656\uFF1F"),
  T("052", "mild", "\u4F60\u6700\u60F3\u62E5\u6709\u7684\u8D85\u80FD\u529B\u662F\u4EC0\u4E48\uFF1F\u7528\u6765\u5E72\u561B\uFF1F"),
  T("053", "mild", "\u4F60\u6700\u8BA8\u538C\u522B\u4EBA\u5BF9\u4F60\u8BF4\u7684\u4E00\u53E5\u8BDD\u662F\u4EC0\u4E48\uFF1F"),
  T("054", "mild", "\u4F60\u6700\u8FD1\u4E00\u6B21\u4E3B\u52A8\u8054\u7CFB\u7684\u4E00\u4E2A\u8001\u670B\u53CB\u662F\u8C01\uFF1F"),
  T("055", "mild", "\u4F60\u89C9\u5F97\u5341\u5E74\u540E\u7684\u81EA\u5DF1\u4F1A\u5728\u505A\u4EC0\u4E48\uFF1F"),
  T("056", "mild", "\u4F60\u6700\u559C\u6B22\u4E00\u5929\u4E2D\u7684\u54EA\u4E2A\u65F6\u95F4\u6BB5\uFF1F\u4E3A\u4EC0\u4E48\uFF1F"),
  T("057", "mild", "\u4F60\u6709\u6CA1\u6709\u505A\u8FC7\u4EC0\u4E48\u88AB\u8BEF\u4F1A\u7684\u5012\u9709\u4E8B\uFF1F"),
  T("058", "mild", "\u4F60\u6700\u60F3\u5B66\u4F46\u4E00\u76F4\u6CA1\u5B66\u7684\u4E1C\u897F\u662F\u4EC0\u4E48\uFF1F"),
  T("059", "mild", "\u5982\u679C\u6362\u4E00\u4E2A\u804C\u4E1A\uFF0C\u4F60\u60F3\u505A\u4EC0\u4E48\uFF1F"),
  T("060", "mild", "\u4F60\u6700\u8FD1\u4E00\u6B21\u7761\u61D2\u89C9\u7761\u5230\u51E0\u70B9\uFF1F"),
  T("061", "mild", "\u4F60\u6700\u73CD\u89C6\u7684\u4E00\u6BB5\u56DE\u5FC6\u662F\u4EC0\u4E48\uFF1F"),
  T("062", "mild", "\u4F60\u505A\u8FC7\u6700\u51B2\u52A8\u7684\u4E00\u6B21\u6D88\u8D39\u662F\u4EC0\u4E48\uFF1F\u82B1\u4E86\u591A\u5C11\uFF1F"),
  T("063", "mild", "\u4F60\u7684\u5E78\u8FD0\u6570\u5B57\u662F\u591A\u5C11\uFF1F\u6709\u4EC0\u4E48\u6765\u5386\u5417\uFF1F"),
  T("064", "mild", "\u4F60\u7B2C\u4E00\u6B21\u505A\u996D\u505A\u7684\u662F\u4EC0\u4E48\uFF1F\u5473\u9053\u5982\u4F55\uFF1F"),
  T("065", "mild", "\u4F60\u6700\u60F3\u53BB\u7684\u4E00\u5BB6\u516C\u53F8\u6216\u5355\u4F4D\u662F\u54EA\u91CC\uFF1F"),
  T("066", "mild", "\u4F60\u6709\u6CA1\u6709\u7279\u522B\u8BA8\u538C\u7684\u4E00\u79CD\u58F0\u97F3\uFF1F"),
  T("067", "mild", "\u4F60\u6700\u8FD1\u5728\u575A\u6301\u7684\u4E00\u4EF6\u5C0F\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("068", "mild", "\u4F60\u6700\u611F\u8C22\u7684\u4E00\u4F4D\u8001\u5E08\u662F\u8C01\uFF1FTA \u8BF4\u8FC7\u4EC0\u4E48\u5F71\u54CD\u4F60\u7684\u8BDD\uFF1F"),
  T("069", "mild", "\u4F60\u89C9\u5F97\u81EA\u5DF1\u548C\u4E94\u5E74\u524D\u76F8\u6BD4\u6700\u5927\u7684\u53D8\u5316\u662F\u4EC0\u4E48\uFF1F"),
  T("070", "mild", "\u4F60\u6709\u6CA1\u6709\u4E00\u4E2A\u4E0D\u6562\u544A\u8BC9\u7236\u6BCD\u7684\u5C0F\u79D8\u5BC6\uFF1F"),
  // ================= 真心话 · 微辣 =================
  T("101", "spicy", "\u5728\u573A\u7684\u4EBA\u91CC\uFF0C\u4F60\u6700\u60F3\u548C\u8C01\u4EA4\u6362\u4EBA\u751F\uFF1F\u4E3A\u4EC0\u4E48\uFF1F"),
  T("102", "spicy", "\u4F60\u624B\u673A\u91CC\u6709\u6CA1\u6709\u4E0D\u80FD\u8BA9\u5BF9\u8C61\u770B\u5230\u7684\u4E1C\u897F\uFF1F"),
  T("103", "spicy", "\u8BF4\u51FA\u4F60\u524D\u4EFB\u7684\u4E00\u4E2A\u4F18\u70B9"),
  T("104", "spicy", "\u4F60\u8C08\u8FC7\u51E0\u6B21\u604B\u7231\uFF1F\u5206\u522B\u56E0\u4E3A\u4EC0\u4E48\u7ED3\u675F\uFF1F"),
  T("105", "spicy", "\u4F60\u6709\u6CA1\u6709\u5077\u5077\u559C\u6B22\u8FC7\u5728\u573A\u7684\u67D0\u4E2A\u4EBA\uFF1F"),
  T("106", "spicy", "\u4F60\u88AB\u7529\u8FC7\u8FD8\u662F\u7529\u8FC7\u522B\u4EBA\uFF1F\u8BF4\u8BF4\u7ECF\u8FC7"),
  T("107", "spicy", "\u4F60\u505A\u8FC7\u6700\u793E\u6B7B\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("108", "spicy", "\u4F60\u7684\u521D\u604B\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F\u73B0\u5728\u8FD8\u6709\u8054\u7CFB\u5417\uFF1F"),
  T("109", "spicy", "\u4F60\u6697\u604B\u8FC7\u6700\u4E45\u7684\u4EBA\u662F\u8C01\uFF1F\u591A\u4E45\uFF1F"),
  T("110", "spicy", "\u4F60\u6709\u6CA1\u6709\u5728\u6DF1\u591C\u7ED9\u8C01\u53D1\u8FC7\u51B2\u52A8\u6D88\u606F\uFF1F\u5185\u5BB9\u662F\u4EC0\u4E48\uFF1F"),
  T("111", "spicy", "\u4F60\u6492\u8FC7\u6700\u5927\u7684\u4E00\u4E2A\u8C0E\u662F\u4EC0\u4E48\uFF1F\u88AB\u62C6\u7A7F\u4E86\u5417\uFF1F"),
  T("112", "spicy", "\u5728\u573A\u8C01\u7684\u5916\u8868\u6700\u7B26\u5408\u4F60\u7684\u7406\u60F3\u578B\uFF1F"),
  T("113", "spicy", "\u4F60\u5077\u770B\u8FC7\u522B\u4EBA\u7684\u624B\u673A\u5417\uFF1F"),
  T("114", "spicy", "\u4F60\u505A\u8FC7\u6700\u6E23\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("115", "spicy", "\u4F60\u6709\u6CA1\u6709\u5BF9\u670B\u53CB\u8BF4\u8FC7\u8C0E\uFF1F\u4E3A\u4E86\u4EC0\u4E48\uFF1F"),
  T("116", "spicy", "\u4F60\u6700\u8FD1\u4E00\u6B21\u5FC3\u52A8\u662F\u56E0\u4E3A\u8C01\uFF1F"),
  T("117", "spicy", "\u4F60\u6709\u6CA1\u6709\u540E\u6094\u8FC7\u67D0\u6BB5\u611F\u60C5\uFF1F"),
  T("118", "spicy", "\u4F60\u6700\u4E0D\u80FD\u63A5\u53D7\u5BF9\u8C61\u7684\u54EA\u4E2A\u7F3A\u70B9\uFF1F"),
  T("119", "spicy", "\u4F60\u6709\u6CA1\u6709\u88AB\u522B\u4EBA\u8868\u767D\u8FC7\u4F46\u62D2\u7EDD\u4E86\uFF1F\u4E3A\u4EC0\u4E48\u62D2\u7EDD\uFF1F"),
  T("120", "spicy", "\u4F60\u624B\u673A\u5907\u5FD8\u5F55\u91CC\u6700\u79C1\u5BC6\u7684\u4E00\u6761\u5199\u7684\u662F\u4EC0\u4E48\uFF1F"),
  T("121", "spicy", "\u4F60\u6709\u6CA1\u6709\u5077\u5077\u67E5\u8FC7\u73B0\u4EFB/\u524D\u4EFB\u7684\u793E\u4EA4\u8D26\u53F7\uFF1F"),
  T("122", "spicy", "\u4F60\u73B0\u5728\u6700\u5728\u610F\u7684\u90A3\u4E2A\u4EBA\u662F\u8C01\uFF1F"),
  T("123", "spicy", "\u4F60\u505A\u8FC7\u6700\u75AF\u72C2\u7684\u4E00\u4EF6\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("124", "spicy", "\u4F60\u6709\u6CA1\u6709\u4E3A\u4E86\u67D0\u4E2A\u4EBA\u505A\u8FC7\u5F88\u8822\u7684\u4E8B\uFF1F"),
  T("125", "spicy", "\u5728\u573A\u7684\u4EBA\u91CC\u8C01\u6700\u6709\u53EF\u80FD\u5148\u7ED3\u5A5A\uFF1F"),
  T("126", "spicy", "\u4F60\u6700\u8FD1\u4E00\u6B21\u8BF4\u300C\u6211\u7231\u4F60\u300D\u662F\u5BF9\u8C01\u8BF4\u7684\uFF1F"),
  T("127", "spicy", "\u4F60\u6709\u6CA1\u6709\u8FC7\u811A\u8E0F\u4E24\u6761\u8239\u7684\u7ECF\u5386\uFF1F"),
  T("128", "spicy", "\u4F60\u88AB\u522B\u4EBA\u8BEF\u4F1A\u8FC7\u6700\u79BB\u8C31\u7684\u4E00\u6B21\u662F\u4EC0\u4E48\uFF1F"),
  T("129", "spicy", "\u4F60\u6700\u60F3\u5220\u6389\u81EA\u5DF1\u4EBA\u751F\u4E2D\u7684\u54EA\u4E00\u6BB5\uFF1F"),
  T("130", "spicy", "\u4F60\u6709\u6CA1\u6709\u5077\u5077\u54ED\u8FC7\uFF1F\u56E0\u4E3A\u4EC0\u4E48\uFF1F"),
  T("131", "spicy", "\u4F60\u89C9\u5F97\u81EA\u5DF1\u662F\u604B\u7231\u8111\u8FD8\u662F\u4E8B\u4E1A\u8111\uFF1F"),
  T("132", "spicy", "\u5982\u679C\u73B0\u5728\u5FC5\u987B\u7ED9\u5728\u573A\u4E00\u4E2A\u4EBA\u8868\u767D\uFF0C\u4F60\u9009\u8C01\uFF1F"),
  T("133", "spicy", "\u4F60\u6709\u6CA1\u6709\u4E00\u76F4\u5728\u7B49\u4E00\u4E2A\u4EBA\u7684\u6D88\u606F\uFF1F"),
  T("134", "spicy", "\u4F60\u6700\u4E0D\u60F3\u8BA9\u5728\u573A\u54EA\u4E2A\u4EBA\u77E5\u9053\u4F60\u7684\u4E00\u4EF6\u4E8B\uFF1F"),
  T("135", "spicy", "\u4F60\u6709\u6CA1\u6709\u5BF9\u5728\u573A\u7684\u4EBA\u6492\u8FC7\u8C0E\uFF1F"),
  T("136", "spicy", "\u4F60\u505A\u8FC7\u6700\u8BA9\u81EA\u5DF1\u77A7\u4E0D\u8D77\u81EA\u5DF1\u7684\u4E8B\u662F\u4EC0\u4E48\uFF1F"),
  T("137", "spicy", "\u4F60\u6709\u6CA1\u6709\u5077\u5077\u5AC9\u5992\u8FC7\u5728\u573A\u7684\u67D0\u4E2A\u4EBA\uFF1F"),
  T("138", "spicy", "\u4F60\u7B2C\u4E00\u6B21\u559D\u9152\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F\u53D1\u751F\u4E86\u4EC0\u4E48\uFF1F"),
  T("139", "spicy", "\u4F60\u6709\u6CA1\u6709\u8FC7\u4E00\u591C\u4E4B\u95F4\u5BF9\u67D0\u4EBA\u5F7B\u5E95\u5931\u671B\u7684\u7ECF\u5386\uFF1F"),
  T("140", "spicy", "\u4F60\u89C9\u5F97\u81EA\u5DF1\u6700\u5927\u7684\u60C5\u654C\u662F\u8C01\uFF1F"),
  // ================= 大冒险 · 温和 =================
  D("001", "mild", "\u6A21\u4EFF\u5728\u573A\u4E00\u4E2A\u4EBA\u7684\u8BF4\u8BDD\u65B9\u5F0F\uFF0C\u8BA9\u5927\u5BB6\u731C\u662F\u8C01"),
  D("002", "mild", "\u7528\u64AD\u97F3\u8154\u6717\u8BFB\u4F60\u624B\u673A\u4E0A\u6700\u8FD1\u4E00\u6761\u6D88\u606F"),
  D("003", "mild", "\u505A\u5341\u4E2A\u6DF1\u8E72\uFF0C\u8FB9\u505A\u8FB9\u62A5\u6570"),
  D("004", "mild", "\u5B66\u4E09\u79CD\u52A8\u7269\u7684\u53EB\u58F0\uFF0C\u8BA9\u5927\u5BB6\u731C"),
  D("005", "mild", "\u7ED9\u5728\u573A\u6BCF\u4E2A\u4EBA\u4E00\u4E2A\u771F\u8BDA\u5177\u4F53\u7684\u5938\u5956"),
  D("006", "mild", "\u7528\u5938\u5F20\u7684\u8BED\u6C14\u8BF4\u4E00\u53E5\u300C\u6211\u6700\u559C\u6B22\u4F60\u4E86\u300D"),
  D("007", "mild", "\u5355\u811A\u7AD9\u7ACB 30 \u79D2\uFF0C\u671F\u95F4\u56DE\u7B54\u5927\u5BB6\u4E00\u4E2A\u95EE\u9898"),
  D("008", "mild", "\u5531\u4E00\u9996\u6B4C\u7684\u526F\u6B4C\u90E8\u5206\uFF0C\u8DD1\u8C03\u4E5F\u8981\u5531\u5B8C"),
  D("009", "mild", "\u6A21\u4EFF\u4E00\u4E2A\u660E\u661F\u8D70\u8DEF\u7684\u65B9\u5F0F\u7ED5\u573A\u4E00\u5708"),
  D("010", "mild", "\u95ED\u773C\u6307\u8BA4\u5728\u573A\u6BCF\u4E2A\u4EBA\uFF0C\u9760\u58F0\u97F3\u731C\u540D\u5B57"),
  D("011", "mild", "\u7528\u5C41\u80A1\u5199\u81EA\u5DF1\u7684\u540D\u5B57\uFF0C\u8BA9\u5927\u5BB6\u731C"),
  D("012", "mild", "\u80CC\u4E00\u6BB5\u4F60\u8BB0\u5F97\u7684\u5E7F\u544A\u8BCD"),
  D("013", "mild", "\u7ED9\u5927\u5BB6\u8868\u6F14\u4E00\u4E2A\u4F60\u6700\u62FF\u624B\u7684\u624D\u827A\uFF0C\u6CA1\u6709\u624D\u827A\u5C31\u5B66\u732B\u53EB\u4E00\u5206\u949F"),
  D("014", "mild", "\u548C\u53F3\u8FB9\u7684\u4EBA\u5BF9\u89C6\u5341\u79D2\uFF0C\u8C01\u5148\u7B11\u8C01\u518D\u62BD\u4E00\u6B21"),
  D("015", "mild", "\u7528\u5916\u8BED\uFF08\u54EA\u6015\u53EA\u4F1A\u4E00\u53E5\uFF09\u8BF4\u4E00\u53E5\u60C5\u8BDD"),
  D("016", "mild", "\u6446\u4E09\u4E2A\u81EA\u62CDpose\uFF0C\u8BA9\u5927\u5BB6\u9009\u6700\u597D\u770B\u7684"),
  D("017", "mild", "\u8BF4\u51FA\u5728\u573A\u6BCF\u4E2A\u4EBA\u7684\u661F\u5EA7\u5E76\u7ED9\u51FA\u4E00\u53E5\u8FD0\u52BF"),
  D("018", "mild", "\u7ED9\u624B\u673A\u901A\u8BAF\u5F55\u91CC\u7B2C\u4E94\u4E2A\u4EBA\u53D1\u4E00\u6761\u300C\u6211\u60F3\u4F60\u4E86\u300D"),
  D("019", "mild", "\u5B66\u5A74\u513F\u54ED\u4E09\u5341\u79D2"),
  D("020", "mild", "\u505A\u4E00\u6BB5\u4F60\u81EA\u521B\u7684\u5065\u8EAB\u64CD\u52A8\u4F5C\uFF0C\u5E26\u5927\u5BB6\u4E00\u8D77\u505A"),
  D("021", "mild", "\u7528\u6700\u6162\u7684\u901F\u5EA6\u5FF5\u4E00\u6BB5\u7ED5\u53E3\u4EE4"),
  D("022", "mild", "\u5047\u88C5\u81EA\u5DF1\u662F\u670D\u52A1\u5458\uFF0C\u7ED9\u5728\u573A\u6BCF\u4E2A\u4EBA\u63A8\u8350\u4E00\u9053\u83DC"),
  D("023", "mild", "\u6A21\u4EFF\u4E00\u4E2A\u4F60\u8BA8\u538C\u7684\u8868\u60C5\u5305"),
  D("024", "mild", "\u5927\u58F0\u558A\u4E09\u904D\u300C\u6211\u662F\u6700\u68D2\u7684\u300D"),
  D("025", "mild", "\u8BA9\u5927\u5BB6\u7FFB\u4F60\u7684\u76F8\u518C\uFF0C\u7531\u5927\u5BB6\u6307\u5B9A\u4E00\u5F20\u516C\u5F00"),
  D("026", "mild", "\u73B0\u573A\u7F16\u4E00\u4E2A\u56DB\u53E5\u6253\u6CB9\u8BD7\uFF0C\u8981\u5305\u542B\u4ECA\u5929\u5728\u573A\u7684\u4E24\u4E2A\u4EBA\u540D\u5B57"),
  D("027", "mild", "\u548C\u5DE6\u8FB9\u7684\u4EBA\u7EC4\u6210\u642D\u6863\uFF0C\u4E00\u8D77\u8868\u6F14\u4E00\u4E2A\u9759\u6001\u96D5\u5851"),
  D("028", "mild", "\u7528\u5934\u9876\u4E00\u672C\u4E66\u8D70\u5341\u6B65\uFF0C\u6389\u4E86\u91CD\u6765"),
  D("029", "mild", "\u6A21\u4EFF\u4E3B\u6301\u4EBA\u64AD\u62A5\u4E00\u6761\u65B0\u95FB\uFF0C\u5185\u5BB9\u7531\u5927\u5BB6\u6307\u5B9A"),
  D("030", "mild", "\u7ED9\u5341\u5E74\u540E\u7684\u81EA\u5DF1\u5F55\u4E00\u6BB5\u5341\u79D2\u8BED\u97F3"),
  D("031", "mild", "\u8BA9\u5927\u5BB6\u5728\u4F60\u8138\u4E0A\u8D34\u4E09\u5F20\u7EB8\u6761\uFF0C\u4FDD\u6301\u4E94\u5206\u949F"),
  D("032", "mild", "\u95ED\u7740\u773C\u775B\u5403\u4E00\u53E3\u4E1C\u897F\uFF0C\u731C\u662F\u4EC0\u4E48"),
  D("033", "mild", "\u7528\u6700\u5938\u5F20\u7684\u8868\u60C5\u6F14\u7ECE\u300C\u5931\u671B\u3001\u60CA\u8BB6\u3001\u72C2\u559C\u300D\u4E09\u8FDE"),
  D("034", "mild", "\u8BB2\u4E00\u4E2A\u51B7\u7B11\u8BDD\uFF0C\u5982\u679C\u6709\u4EBA\u7B11\u4E86\u5C31\u8FC7\u5173"),
  D("035", "mild", "\u73B0\u573A\u6559\u5927\u5BB6\u4E00\u4E2A\u4F60\u5BB6\u4E61\u7684\u65B9\u8A00\u8BCD"),
  D("036", "mild", "\u6A21\u4EFF\u4E00\u4E2A\u8001\u5E08\u8BAD\u8BDD\u7684\u6837\u5B50"),
  D("037", "mild", "\u5728\u7FA4\u91CC\u53D1\u4E00\u6761\u300C\u6211\u4ECA\u5929\u5F88\u5F00\u5FC3\u300D\u5E76\u622A\u56FE"),
  D("038", "mild", "\u5B66\u4E00\u79CD\u52A8\u7269\u7684\u8D70\u8DEF\u65B9\u5F0F\u7ED5\u573A\u4E00\u5708"),
  D("039", "mild", "\u8BA9\u5927\u5BB6\u7ED9\u4F60\u6362\u4E00\u4E2A\u53D1\u578B\uFF0C\u4FDD\u6301\u5230\u6E38\u620F\u7ED3\u675F"),
  D("040", "mild", "\u8BF4\u51FA\u5728\u573A\u6240\u6709\u4EBA\u7684\u540D\u5B57\uFF0C\u8BF4\u9519\u4E00\u4E2A\u91CD\u6765"),
  D("041", "mild", "\u7528\u5531\u6B4C\u7684\u65B9\u5F0F\u8BF4\u4E00\u53E5\u8BDD\uFF0C\u8BF4\u7ED9\u53F3\u8FB9\u7684\u4EBA\u542C"),
  D("042", "mild", "\u505A\u4E8C\u5341\u4E2A\u5F00\u5408\u8DF3"),
  D("043", "mild", "\u6A21\u4EFF\u7535\u68AF\u91CC\u7684\u5C34\u5C2C\u6C89\u9ED8\u4E09\u5341\u79D2"),
  D("044", "mild", "\u7ED9\u5927\u5BB6\u8868\u6F14\u4F60\u600E\u4E48\u8D77\u5E8A\u7684"),
  D("045", "mild", "\u7528\u624B\u52BF\u6BD4\u5212\u4E00\u4E2A\u6210\u8BED\uFF0C\u8BA9\u5927\u5BB6\u731C"),
  D("046", "mild", "\u73B0\u573A\u7ED9\u5728\u573A\u67D0\u4E2A\u4EBA\u753B\u4E00\u5E45\u8096\u50CF\uFF0C\u5FC5\u987B\u8BA9 TA \u8BA4\u51FA\u6765"),
  D("047", "mild", "\u7528\u4E09\u4E2A\u8BCD\u5F62\u5BB9\u5728\u573A\u6BCF\u4E00\u4E2A\u4EBA"),
  D("048", "mild", "\u6A21\u4EFF\u4E00\u4E2A\u7F51\u7EA2\u6216\u4E3B\u64AD\u7684\u53E3\u5934\u7985"),
  D("049", "mild", "\u628A\u5916\u5957\u53CD\u8FC7\u6765\u7A7F\uFF0C\u4FDD\u6301\u5230\u6E38\u620F\u7ED3\u675F"),
  D("050", "mild", "\u7ED9\u5728\u573A\u6700\u597D\u7684\u670B\u53CB\u4E00\u4E2A\u62E5\u62B1"),
  D("051", "mild", "\u7528\u6700\u505A\u4F5C\u7684\u8BED\u6C14\u8BF4\u300C\u8BA8\u538C\uFF5E\u300D"),
  D("052", "mild", "\u9009\u4E00\u4E2A\u4EBA\u548C\u4ED6\u4E00\u8D77\u8DF3\u5341\u79D2\u7684\u821E"),
  D("053", "mild", "\u73B0\u573A\u7F16\u4E00\u6BB5rap\uFF0C\u5185\u5BB9\u662F\u5173\u4E8E\u4ECA\u5929\u7684\u805A\u4F1A"),
  D("054", "mild", "\u628A\u624B\u673A\u9012\u7ED9\u53F3\u8FB9\u7684\u4EBA\uFF0C\u8BA9\u4ED6\u6311\u4E00\u5F20\u7167\u7247\u53D1\u5230\u7FA4\u91CC"),
  D("055", "mild", "\u6A21\u4EFF\u5927\u5BB6\u5728\u5EA7\u6BCF\u4E00\u4E2A\u4EBA\u7684\u5750\u59FF"),
  D("056", "mild", "\u95ED\u773C\u4E09\u5341\u79D2\uFF0C\u7136\u540E\u8BF4\u51FA\u4F60\u542C\u5230\u7684\u6240\u6709\u58F0\u97F3"),
  D("057", "mild", "\u7528\u5DE6\u624B\u5199\u4E0B\u81EA\u5DF1\u7684\u540D\u5B57"),
  D("058", "mild", "\u8868\u6F14\u4E00\u6BB5\u65E0\u5B9E\u7269\u5403\u996D"),
  D("059", "mild", "\u7ED9\u5927\u5BB6\u8868\u6F14\u4F60\u600E\u4E48\u751F\u6C14"),
  D("060", "mild", "\u5BF9\u7740\u955C\u5B50\u5938\u81EA\u5DF1\u4E09\u5341\u79D2\uFF0C\u4E0D\u8BB8\u91CD\u590D"),
  D("061", "mild", "\u5B66\u4E94\u4E2A\u4E0D\u540C\u56FD\u5BB6\u7684\u6253\u62DB\u547C\u65B9\u5F0F"),
  D("062", "mild", "\u7528\u5938\u5F20\u7684\u53E3\u97F3\u5FF5\u4E00\u6BB5\u4F60\u624B\u673A\u4E0A\u7684\u6587\u5B57"),
  D("063", "mild", "\u7ED9\u5927\u5BB6\u8868\u6F14\u4F60\u6700\u4E0D\u64C5\u957F\u7684\u4E00\u4EF6\u4E8B"),
  D("064", "mild", "\u5728\u5341\u79D2\u5185\u8BF4\u51FA\u5341\u79CD\u6C34\u679C"),
  D("065", "mild", "\u6A21\u4EFF\u4E00\u53EA\u732B\u4ECE\u6C99\u53D1\u4E0A\u8DF3\u4E0B\u6765"),
  // ================= 大冒险 · 微辣 =================
  D("101", "spicy", "\u7ED9\u901A\u8BAF\u5F55\u91CC\u7B2C\u4E09\u4E2A\u5F02\u6027\u53D1\u4E00\u53E5\u300C\u5728\u5417\u300D\uFF0C\u622A\u56FE\u7ED9\u5927\u5BB6\u770B"),
  D("102", "spicy", "\u73B0\u573A\u7ED9\u524D\u4EFB\u53D1\u4E00\u6761\u6D88\u606F\uFF0C\u5185\u5BB9\u7531\u5927\u5BB6\u5B9A"),
  D("103", "spicy", "\u8BF4\u51FA\u4F60\u5FAE\u4FE1\u7F6E\u9876\u7684\u7B2C\u4E00\u4E2A\u4EBA\u662F\u8C01"),
  D("104", "spicy", "\u8BA9\u5927\u5BB6\u7FFB\u4F60\u6700\u8FD1\u5341\u6761\u7684\u641C\u7D22\u8BB0\u5F55"),
  D("105", "spicy", "\u7ED9\u5728\u573A\u6700\u964C\u751F\u7684\u4EBA\u4E00\u4E2A\u5341\u79D2\u7684\u62E5\u62B1"),
  D("106", "spicy", "\u7528\u6700\u8089\u9EBB\u7684\u8BED\u6C14\u5BF9\u5728\u573A\u67D0\u4E2A\u4EBA\u8BF4\u4E00\u6BB5\u60C5\u8BDD"),
  D("107", "spicy", "\u516C\u5F00\u4F60\u624B\u673A\u76F8\u518C\u91CC\u7684\u6700\u540E\u4E00\u5F20\u81EA\u62CD"),
  D("108", "spicy", "\u8BF4\u51FA\u4F60\u6700\u8FD1\u4E00\u6B21\u5FC3\u52A8\u7684\u65F6\u95F4\u548C\u5BF9\u8C61\u7279\u5F81"),
  D("109", "spicy", "\u8BA9\u53F3\u8FB9\u7684\u4EBA\u5728\u4F60\u7684\u670B\u53CB\u5708\u53D1\u4E00\u6761\u5185\u5BB9\uFF0C\u4FDD\u6301\u4E00\u5C0F\u65F6"),
  D("110", "spicy", "\u7ED9\u5728\u573A\u6BCF\u4E2A\u4EBA\u6309\u300C\u6700\u60F3\u4EA4\u5F80\u300D\u7A0B\u5EA6\u6392\u5E8F\u5E76\u8BF4\u660E\u7406\u7531"),
  D("111", "spicy", "\u73B0\u573A\u6253\u7535\u8BDD\u7ED9\u4E00\u4E2A\u5F02\u6027\u670B\u53CB\u8BF4\u300C\u6211\u60F3\u4F60\u4E86\u300D"),
  D("112", "spicy", "\u516C\u5F00\u4F60\u8D2D\u7269\u8F66\u91CC\u7684\u7B2C\u4E00\u4EF6\u5546\u54C1"),
  D("113", "spicy", "\u8BF4\u51FA\u4F60\u624B\u673A\u91CC\u5907\u6CE8\u6700\u66A7\u6627\u7684\u4E00\u4E2A\u8054\u7CFB\u4EBA"),
  D("114", "spicy", "\u8BA9\u5927\u5BB6\u9009\u4E00\u4E2A\u4EBA\uFF0C\u4F60\u7ED9 TA \u505A\u4E94\u5206\u949F\u80A9\u9888\u6309\u6469"),
  D("115", "spicy", "\u516C\u5F00\u4F60\u6700\u8FD1\u4E00\u6B21\u6DF1\u591C\uFF08\u51CC\u6668\u540E\uFF09\u53D1\u7684\u6D88\u606F"),
  D("116", "spicy", "\u5BF9\u5728\u573A\u67D0\u4E2A\u4EBA\u8BF4\u4E00\u53E5\u771F\u5FC3\u8BDD\uFF0C\u8BF4\u5B8C\u8981\u770B\u7740\u5BF9\u65B9\u7684\u773C\u775B"),
  D("117", "spicy", "\u628A\u4F60\u6700\u8FD1\u5220\u9664\u7684\u4E00\u6761\u804A\u5929\u8BB0\u5F55\u5185\u5BB9\u590D\u8FF0\u51FA\u6765"),
  D("118", "spicy", "\u8BA9\u5927\u5BB6\u770B\u4F60\u548C\u67D0\u4E2A\u4EBA\u7684\u804A\u5929\u8BB0\u5F55\uFF0C\u7531\u5927\u5BB6\u6307\u5B9A"),
  D("119", "spicy", "\u8BF4\u51FA\u4F60\u66FE\u7ECF\u7ED9\u8C01\u53D6\u8FC7\u5916\u53F7\uFF0C\u5916\u53F7\u662F\u4EC0\u4E48"),
  D("120", "spicy", "\u9009\u4E00\u4E2A\u4EBA\u548C\u4F60\u5341\u6307\u76F8\u6263\u5341\u79D2\uFF0C\u5E76\u6DF1\u60C5\u5BF9\u89C6"),
  D("121", "spicy", "\u516C\u5F00\u4F60\u7684\u624B\u673A\u5C4F\u4FDD\u5E76\u89E3\u91CA\u4E3A\u4EC0\u4E48\u7528\u5B83"),
  D("122", "spicy", "\u7ED9\u5728\u573A\u6700\u719F\u7684\u4EBA\u53D1\u4E00\u6761\u300C\u6211\u4EEC\u5728\u4E00\u8D77\u5427\u300D"),
  D("123", "spicy", "\u8BF4\u51FA\u4F60\u5077\u5077\u5173\u6CE8\u4E86\u8C01\u7684\u793E\u4EA4\u8D26\u53F7"),
  D("124", "spicy", "\u8BA9\u5927\u5BB6\u51B3\u5B9A\u4F60\u8981\u7ED9\u8C01\u53D1\u4E00\u4E2A\u8868\u60C5\u5305\u8F70\u70B8"),
  D("125", "spicy", "\u8BF4\u51FA\u4F60\u505A\u8FC7\u6700\u66A7\u6627\u7684\u4E00\u4EF6\u4E8B"),
  D("126", "spicy", "\u8BA9\u5728\u573A\u7684\u4EBA\u7ED9\u4F60\u62CD\u4E00\u5F20\u6700\u4E11\u7684\u7167\u7247\u5E76\u53D1\u7FA4\u91CC"),
  D("127", "spicy", "\u8BF4\u51FA\u4F60\u624B\u673A\u91CC\u5907\u6CE8\u6700\u7279\u522B\u7684\u4E00\u4E2A\u4EBA\uFF0C\u4EE5\u53CA\u5907\u6CE8\u5185\u5BB9"),
  D("128", "spicy", "\u7ED9\u5728\u573A\u67D0\u4E2A\u4EBA\u5582\u4E00\u53E3\u4E1C\u897F\u5403"),
  D("129", "spicy", "\u73B0\u573A\u7ED9\u4F60\u7684 crush \u53D1\u4E00\u6761\u6D88\u606F\uFF0C\u5185\u5BB9\u5927\u5BB6\u5B9A"),
  D("130", "spicy", "\u516C\u5F00\u4F60\u6700\u8FD1\u4E00\u4E2A\u6708\u7684\u5916\u5356\u8BA2\u5355\u91CC\u6700\u8D35\u7684\u4E00\u5355"),
  D("131", "spicy", "\u8BF4\u51FA\u4F60\u66FE\u7ECF\u4E3A\u4E86\u8C01\u6539\u8FC7\u81EA\u5DF1\u7684\u4E60\u60EF"),
  D("132", "spicy", "\u9009\u4E00\u4E2A\u4EBA\uFF0C\u6A21\u4EFF TA \u751F\u6C14\u65F6\u7684\u6837\u5B50\uFF0C\u76F4\u5230 TA \u627F\u8BA4\u5F88\u50CF"),
  D("133", "spicy", "\u8BA9\u5927\u5BB6\u770B\u4F60\u76F8\u518C\u91CC\u6700\u4E45\u8FDC\u7684\u4E00\u5F20\u81EA\u62CD"),
  D("134", "spicy", "\u5BF9\u5728\u573A\u7684\u6BCF\u4E2A\u4EBA\u8BF4\u4E00\u53E5\u53EA\u6709\u4F60\u4EEC\u4FE9\u61C2\u7684\u6697\u53F7"),
  D("135", "spicy", "\u8BF4\u51FA\u4F60\u624B\u673A\u4E0A\u6700\u540E\u4E00\u4E2A\u901A\u8BDD\u8BB0\u5F55\u662F\u8C01")
];
function availableQuestions(type, spice) {
  return spice === "spicy" ? QUESTIONS.filter((q) => q.type === type) : QUESTIONS.filter((q) => q.type === type && q.spice === "mild");
}
__name(availableQuestions, "availableQuestions");

// ../game-core/src/games/truth.ts
var SPIN_SECONDS = 4;
var CHOOSE_SECONDS = 20;
var ANSWER_SECONDS = 60;
var RATE_SECONDS = 20;
function num4(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
__name(num4, "num");
function pickQuestion(type, spice, usedIds, rng) {
  const all = availableQuestions(type, spice);
  if (all.length === 0) return null;
  const fresh = all.filter((q2) => !usedIds.includes(q2.id));
  const pool = fresh.length > 0 ? fresh : all;
  const q = pool[Math.floor(rng.next() * pool.length)];
  return { question: q.text, questionId: q.id };
}
__name(pickQuestion, "pickQuestion");
function eligible(state, memberIds) {
  const rest = memberIds.filter((id) => !state.completedIds.includes(id));
  return rest.length > 0 ? rest : memberIds;
}
__name(eligible, "eligible");
function beginSpin(state, memberIds, rng, now2) {
  const pool = eligible(state, memberIds);
  const targetId = pool[Math.floor(rng.next() * pool.length)];
  const wheelSpin = 360 * (5 + Math.floor(rng.next() * 4)) + Math.floor(rng.next() * 360);
  return {
    ...state,
    seed: rng.state,
    phase: "spin",
    targetId,
    type: null,
    question: null,
    questionId: null,
    ratings: {},
    witnesses: [],
    selfDone: false,
    wheelSpin,
    phaseEndsAt: now2 + SPIN_SECONDS * 1e3
  };
}
__name(beginSpin, "beginSpin");
function nextTurn(state, memberIds, now2) {
  const rng = createRng(state.seed);
  const done = [...state.completedIds];
  if (state.targetId && !done.includes(state.targetId)) done.push(state.targetId);
  const allDone = memberIds.every((id) => done.includes(id));
  if (allDone) {
    return { ...state, completedIds: done, phase: "result", phaseEndsAt: null };
  }
  return beginSpin({ ...state, completedIds: done }, memberIds, rng, now2);
}
__name(nextTurn, "nextTurn");
var truthModule = {
  id: "truth",
  defaultOptions: {},
  create(ctx, _options) {
    const seed = (ctx.now ^ ctx.memberIds.length * 69069) >>> 0;
    const rng = createRng(seed);
    const spice = ctx.settings.spice === "spicy" ? "spicy" : "mild";
    const base = {
      seed: rng.state,
      phase: "spin",
      targetId: null,
      type: null,
      question: null,
      questionId: null,
      ratings: {},
      completedIds: [],
      usedQuestionIds: [],
      skipUsed: {},
      witnesses: [],
      selfDone: false,
      phaseEndsAt: ctx.now + SPIN_SECONDS * 1e3,
      spice,
      perPlayer: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      wheelSpin: 0
    };
    return beginSpin(base, ctx.memberIds, rng, ctx.now);
  },
  reduce(state, action, ctx) {
    const rng = createRng(state.seed);
    const isTarget = ctx.playerId === state.targetId;
    const spice = state.spice;
    if (action.kind === "spinDone" && state.phase === "spin") {
      return { ...state, phase: "choose", phaseEndsAt: ctx.now + CHOOSE_SECONDS * 1e3 };
    }
    if (action.kind === "choose" && state.phase === "choose" && isTarget) {
      const raw = action.type;
      let type;
      if (raw === "truth" || raw === "dare") type = raw;
      else type = rng.next() < 0.5 ? "truth" : "dare";
      const picked = pickQuestion(type, spice, state.usedQuestionIds, rng);
      if (!picked) return state;
      return {
        ...state,
        seed: rng.state,
        phase: "answer",
        type,
        question: picked.question,
        questionId: picked.questionId,
        usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
        witnesses: [],
        selfDone: false,
        phaseEndsAt: ctx.now + ANSWER_SECONDS * 1e3
      };
    }
    if (action.kind === "skip" && state.phase === "answer" && isTarget) {
      if (state.skipUsed[ctx.playerId]) return state;
      const type = state.type ?? "truth";
      const picked = pickQuestion(type, spice, state.usedQuestionIds, rng);
      if (!picked) return state;
      return {
        ...state,
        seed: rng.state,
        skipUsed: { ...state.skipUsed, [ctx.playerId]: true },
        question: picked.question,
        questionId: picked.questionId,
        usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
        phaseEndsAt: ctx.now + ANSWER_SECONDS * 1e3
      };
    }
    if (action.kind === "done" && state.phase === "answer" && isTarget) {
      return { ...state, selfDone: true, phaseEndsAt: ctx.now + RATE_SECONDS * 1e3 };
    }
    if (action.kind === "witness" && state.phase === "answer" && !isTarget) {
      if (state.witnesses.includes(ctx.playerId)) return state;
      const witnesses = [...state.witnesses, ctx.playerId];
      const others = ctx.memberIds.filter((id) => id !== state.targetId);
      const needed = Math.min(2, others.length);
      const ready = witnesses.length >= needed && state.selfDone;
      return {
        ...state,
        witnesses,
        phase: ready ? "rate" : state.phase,
        phaseEndsAt: ready ? ctx.now + RATE_SECONDS * 1e3 : state.phaseEndsAt
      };
    }
    if (action.kind === "rate" && state.phase === "rate") {
      if (ctx.playerId === state.targetId) return state;
      const raw = num4(action.score, 2);
      const score = raw === 1 ? 1 : raw === 3 ? 3 : 2;
      const ratings = { ...state.ratings, [ctx.playerId]: score };
      const others = ctx.memberIds.filter((id) => id !== state.targetId);
      const allRated = others.every((id) => ratings[id]);
      if (!allRated) return { ...state, ratings };
      const values = Object.values(ratings);
      const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
      const perPlayer = { ...state.perPlayer };
      if (state.targetId) {
        perPlayer[state.targetId] = (perPlayer[state.targetId] ?? 0) + (avg >= 2.5 ? 1 : 0);
      }
      return nextTurn({ ...state, ratings, perPlayer }, ctx.memberIds, ctx.now);
    }
    if (action.kind === "nextTurn" && (state.phase === "rate" || state.phase === "result")) {
      return nextTurn(state, ctx.memberIds, ctx.now);
    }
    return state;
  },
  privateView(state, playerId) {
    return {
      isTarget: playerId === state.targetId,
      /** 本人是否已用过免死金牌 */
      skipUsed: state.skipUsed[playerId] === true
    };
  },
  tick(state, now2, ctx) {
    if (state.phaseEndsAt === null) return state;
    if (now2 < state.phaseEndsAt) return state;
    const rng = createRng(state.seed);
    const memberIds = ctx?.memberIds ?? [];
    switch (state.phase) {
      case "spin":
        return { ...state, phase: "choose", phaseEndsAt: now2 + CHOOSE_SECONDS * 1e3 };
      case "choose": {
        const type = rng.next() < 0.5 ? "truth" : "dare";
        const picked = pickQuestion(type, state.spice, state.usedQuestionIds, rng);
        if (!picked) return nextTurn(state, memberIds, now2);
        return {
          ...state,
          seed: rng.state,
          phase: "answer",
          type,
          question: picked.question,
          questionId: picked.questionId,
          usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
          phaseEndsAt: now2 + ANSWER_SECONDS * 1e3
        };
      }
      case "answer":
        return { ...state, phase: "rate", phaseEndsAt: now2 + RATE_SECONDS * 1e3 };
      case "rate":
        return nextTurn(state, memberIds, now2);
      default:
        return { ...state, phaseEndsAt: null };
    }
  },
  nextDeadline(state, now2) {
    if (state.phase === "result") return null;
    if (state.phaseEndsAt === null) return null;
    return state.phaseEndsAt > now2 ? state.phaseEndsAt : null;
  }
};

// ../game-core/src/games/wolf.ts
var REVEAL_SECONDS3 = 20;
var NIGHT_ACTION_SECONDS = 25;
var DISCUSSION_SECONDS = 300;
var VOTE_SECONDS2 = 40;
var ALL_ROLES = [
  "werewolf",
  "seer",
  "robber",
  "troublemaker",
  "drunk",
  "insomniac",
  "hunter",
  "villager"
];
var WOLF_ROLE_NAMES = {
  werewolf: "\u72FC\u4EBA",
  seer: "\u9884\u8A00\u5BB6",
  robber: "\u76D7\u8D3C",
  troublemaker: "\u6363\u86CB\u9B3C",
  drunk: "\u9152\u9B3C",
  insomniac: "\u5931\u7720\u8005",
  hunter: "\u730E\u4EBA",
  villager: "\u6751\u6C11"
};
function num5(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
__name(num5, "num");
function buildRoles(memberCount, rng, enabled) {
  const wolfCount = memberCount >= 6 ? 2 : 1;
  const total = memberCount + 3;
  const specials = ALL_ROLES.filter((r) => r !== "werewolf" && r !== "villager" && enabled.includes(r));
  const roles = [];
  for (let i = 0; i < wolfCount; i++) roles.push("werewolf");
  for (const r of specials) roles.push(r);
  while (roles.length < total) roles.push("villager");
  return rng.shuffle(roles).slice(0, total);
}
__name(buildRoles, "buildRoles");
function actorFor(state, role) {
  const ids = Object.keys(state.initialRoles);
  return ids.find((id) => state.initialRoles[id] === role) ?? null;
}
__name(actorFor, "actorFor");
function nightQueueOf(state) {
  const present = /* @__PURE__ */ new Set([...Object.values(state.initialRoles), ...state.center]);
  return WOLF_NIGHT_ORDER.filter((r) => present.has(r));
}
__name(nightQueueOf, "nightQueueOf");
function advanceNight(state, now2) {
  const queue = nightQueueOf(state);
  let idx = state.nightIndex + 1;
  while (idx < queue.length && actorFor(state, queue[idx]) === null) idx++;
  if (idx >= queue.length) {
    return { ...state, phase: "discussion", nightRole: null, nightIndex: queue.length, phaseEndsAt: now2 + DISCUSSION_SECONDS * 1e3 };
  }
  return {
    ...state,
    nightRole: queue[idx],
    nightIndex: idx,
    phaseEndsAt: now2 + NIGHT_ACTION_SECONDS * 1e3
  };
}
__name(advanceNight, "advanceNight");
function addKnowledge(state, playerId, text) {
  return { ...state.knowledge, [playerId]: [...state.knowledge[playerId] ?? [], text] };
}
__name(addKnowledge, "addKnowledge");
function swap(a, b, by, state) {
  const roles = { ...state.currentRoles };
  const center = [...state.center];
  const isCenterA = a.startsWith("center:");
  const isCenterB = b.startsWith("center:");
  const getA = /* @__PURE__ */ __name(() => isCenterA ? center[num5(a.slice(7), 0)] : roles[a], "getA");
  const getB = /* @__PURE__ */ __name(() => isCenterB ? center[num5(b.slice(7), 0)] : roles[b], "getB");
  const va = getA();
  const vb = getB();
  if (isCenterA) center[num5(a.slice(7), 0)] = vb;
  else roles[a] = vb;
  if (isCenterB) center[num5(b.slice(7), 0)] = va;
  else roles[b] = va;
  return { roles, center, record: { by, a, b } };
}
__name(swap, "swap");
function resolveVotes(state) {
  const counts = /* @__PURE__ */ new Map();
  for (const target of Object.values(state.votes)) {
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  let max = 0;
  for (const c of counts.values()) if (c > max) max = c;
  const top = Object.keys(state.currentRoles).filter((id) => (counts.get(id) ?? 0) === max && max > 0);
  let eliminated = top;
  for (const id of top) {
    if (state.currentRoles[id] === "hunter") {
      const target = state.votes[id];
      if (target && !eliminated.includes(target)) eliminated = [...eliminated, target];
    }
  }
  const hasWolf = eliminated.some((id) => state.currentRoles[id] === "werewolf");
  return {
    ...state,
    phase: "result",
    eliminated,
    winner: hasWolf ? "good" : "wolf",
    phaseEndsAt: null
  };
}
__name(resolveVotes, "resolveVotes");
var wolfModule = {
  id: "wolf",
  defaultOptions: {
    preset: "standard"
    // 'newbie' | 'standard' | 'chaos'
  },
  create(ctx, options) {
    const seed = (ctx.now ^ ctx.memberIds.length * 1103515245) >>> 0;
    const rng = createRng(seed);
    const preset = options.preset === "newbie" ? "newbie" : options.preset === "chaos" ? "chaos" : "standard";
    const enabled = preset === "newbie" ? ["werewolf", "seer", "robber", "troublemaker", "villager"] : preset === "chaos" ? ["werewolf", "seer", "robber", "troublemaker", "drunk", "insomniac", "hunter", "villager"] : ["werewolf", "seer", "robber", "troublemaker", "drunk", "insomniac", "villager"];
    const deck = buildRoles(ctx.memberIds.length, rng, enabled);
    const initialRoles = {};
    ctx.memberIds.forEach((id, i) => {
      initialRoles[id] = deck[i];
    });
    const center = deck.slice(ctx.memberIds.length, ctx.memberIds.length + 3);
    const base = {
      seed: rng.state,
      phase: "reveal",
      initialRoles,
      currentRoles: { ...initialRoles },
      center,
      nightRole: null,
      nightIndex: -1,
      nightDone: [],
      swaps: [],
      knowledge: {},
      votes: {},
      phaseEndsAt: ctx.now + REVEAL_SECONDS3 * 1e3,
      eliminated: [],
      winner: null,
      revealTrail: [],
      enabledRoles: enabled
    };
    const queue = nightQueueOf(base);
    const firstIdx = queue.findIndex((r) => actorFor(base, r) !== null);
    return {
      ...base,
      nightIndex: firstIdx,
      nightRole: firstIdx >= 0 ? queue[firstIdx] : null
    };
  },
  reduce(state, action, ctx) {
    if (action.kind === "ready" && state.phase === "reveal") {
      const nightDone = state.nightDone.includes(ctx.playerId) ? state.nightDone : [...state.nightDone, ctx.playerId];
      const allReady = Object.keys(state.initialRoles).every((id) => nightDone.includes(id));
      if (allReady) {
        return { ...state, nightDone: [], phase: "night", phaseEndsAt: ctx.now + NIGHT_ACTION_SECONDS * 1e3 };
      }
      return { ...state, nightDone };
    }
    if (action.kind === "endDiscussion" && state.phase === "discussion") {
      return { ...state, phase: "vote", votes: {}, phaseEndsAt: ctx.now + VOTE_SECONDS2 * 1e3 };
    }
    if (action.kind === "nightAction" && state.phase === "night") {
      const role = state.nightRole;
      if (!role || state.initialRoles[ctx.playerId] !== role) return state;
      let next = state;
      const centerIdxRaw = num5(action.centerIndex, -1);
      const targetId = typeof action.targetId === "string" ? action.targetId : "";
      const targetBId = typeof action.targetBId === "string" ? action.targetBId : "";
      switch (role) {
        case "werewolf": {
          const wolves = Object.keys(state.initialRoles).filter((id) => state.initialRoles[id] === "werewolf");
          if (wolves.length > 1) {
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `\u4F60\u7684\u540C\u4F34\u662F\uFF1A${wolves.filter((w) => w !== ctx.playerId).join("\u3001")}`) };
          } else if (centerIdxRaw >= 0 && centerIdxRaw < state.center.length) {
            const r = state.center[centerIdxRaw];
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `\u4F60\u67E5\u770B\u7684\u4E2D\u592E\u724C\u662F\u300C${WOLF_ROLE_NAMES[r]}\u300D`) };
          }
          break;
        }
        case "seer": {
          if (targetId && state.currentRoles[targetId]) {
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `${targetId} \u73B0\u5728\u662F\u300C${WOLF_ROLE_NAMES[state.currentRoles[targetId]]}\u300D`) };
          } else if (centerIdxRaw >= 0 && centerIdxRaw < state.center.length - 1) {
            const a = state.center[centerIdxRaw];
            const b = state.center[centerIdxRaw + 1];
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `\u4E2D\u592E\u724C\uFF1A${WOLF_ROLE_NAMES[a]}\u3001${WOLF_ROLE_NAMES[b]}`) };
          }
          break;
        }
        case "robber": {
          if (targetId && state.currentRoles[targetId] && targetId !== ctx.playerId && action.swap !== false) {
            const res = swap(ctx.playerId, targetId, "robber", state);
            next = {
              ...state,
              currentRoles: res.roles,
              center: res.center,
              swaps: [...state.swaps, res.record],
              knowledge: addKnowledge(state, ctx.playerId, `\u4F60\u4E0E\u5BF9\u65B9\u4EA4\u6362\u540E\uFF0C\u4F60\u73B0\u5728\u662F\u300C${WOLF_ROLE_NAMES[res.roles[ctx.playerId]]}\u300D`)
            };
          }
          break;
        }
        case "troublemaker": {
          if (targetId && targetBId && targetId !== targetBId && state.currentRoles[targetId] && state.currentRoles[targetBId]) {
            const res = swap(targetId, targetBId, "troublemaker", state);
            next = { ...state, currentRoles: res.roles, center: res.center, swaps: [...state.swaps, res.record] };
          }
          break;
        }
        case "drunk": {
          const idx = centerIdxRaw >= 0 && centerIdxRaw < state.center.length ? centerIdxRaw : 0;
          const res = swap(ctx.playerId, `center:${idx}`, "drunk", state);
          next = { ...state, currentRoles: res.roles, center: res.center, swaps: [...state.swaps, res.record] };
          break;
        }
        case "insomniac": {
          next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `\u591C\u665A\u7ED3\u675F\u65F6\u4F60\u662F\u300C${WOLF_ROLE_NAMES[state.currentRoles[ctx.playerId]]}\u300D`) };
          break;
        }
        default:
          break;
      }
      return advanceNight({ ...next, nightDone: [...state.nightDone, ctx.playerId] }, ctx.now);
    }
    if (action.kind === "vote" && state.phase === "vote") {
      if (!state.currentRoles[ctx.playerId]) return state;
      const target = typeof action.targetId === "string" ? action.targetId : "";
      if (!state.currentRoles[target]) return state;
      const votes = { ...state.votes, [ctx.playerId]: target };
      const allVoted = Object.keys(state.currentRoles).every((id) => votes[id]);
      return allVoted ? resolveVotes({ ...state, votes }) : { ...state, votes };
    }
    return state;
  },
  privateView(state, playerId) {
    return {
      initialRole: state.initialRoles[playerId] ?? null,
      /** 结算前不暴露，避免有人靠接口提前知道交换结果 */
      currentRole: state.phase === "result" ? state.currentRoles[playerId] ?? null : null,
      knowledge: state.knowledge[playerId] ?? [],
      myVote: state.votes[playerId] ?? null
    };
  },
  tick(state, now2) {
    if (state.phaseEndsAt === null) return state;
    if (now2 < state.phaseEndsAt) return state;
    switch (state.phase) {
      case "reveal":
        return { ...state, phase: "night", nightDone: [], phaseEndsAt: now2 + NIGHT_ACTION_SECONDS * 1e3 };
      case "night":
        return advanceNight(state, now2);
      case "discussion":
        return { ...state, phase: "vote", votes: {}, phaseEndsAt: now2 + VOTE_SECONDS2 * 1e3 };
      case "vote":
        return resolveVotes(state);
      default:
        return { ...state, phaseEndsAt: null };
    }
  },
  nextDeadline(state, now2) {
    if (state.phase === "result") return null;
    if (state.phaseEndsAt === null) return null;
    return state.phaseEndsAt > now2 ? state.phaseEndsAt : null;
  },
  redact(state) {
    if (state.phase === "result") return state;
    return {
      ...state,
      initialRoles: {},
      currentRoles: {},
      center: state.center.map(() => "villager"),
      knowledge: {},
      swaps: [],
      revealTrail: [],
      votes: Object.fromEntries(Object.keys(state.votes).map((k) => [k, ""]))
    };
  }
};

// ../game-core/src/index.ts
var GAME_MODULES = {
  spy: spyModule,
  draw: drawModule,
  spectrum: spectrumModule,
  truth: truthModule,
  wolf: wolfModule
};
function getModule(id) {
  return GAME_MODULES[id];
}
__name(getModule, "getModule");
function createGameState(gameId, ctx, options) {
  const mod = getModule(gameId);
  if (!mod) return null;
  return mod.create(ctx, { ...mod.defaultOptions, ...options });
}
__name(createGameState, "createGameState");
function applyAction(gameId, state, action, ctx) {
  const mod = getModule(gameId);
  if (!mod) return state;
  const rng = createRng(state.seed);
  const actx = { ...ctx, rng };
  try {
    const next = mod.reduce(state, action, actx);
    if (next && typeof next === "object") next.seed = rng.state;
    return next ?? state;
  } catch (err) {
    console.error("[game-core] reduce failed", gameId, action.kind, err);
    return state;
  }
}
__name(applyAction, "applyAction");
function applyTick(gameId, state, now2, ctx) {
  const mod = getModule(gameId);
  if (!mod) return state;
  try {
    const next = mod.tick(state, now2, ctx);
    return next ?? state;
  } catch (err) {
    console.error("[game-core] tick failed", gameId, err);
    return state;
  }
}
__name(applyTick, "applyTick");
function privateView(gameId, state, playerId, ctx) {
  const mod = getModule(gameId);
  if (!mod) return null;
  try {
    return mod.privateView(state, playerId, ctx);
  } catch (err) {
    console.error("[game-core] privateView failed", gameId, err);
    return null;
  }
}
__name(privateView, "privateView");
function redactState(gameId, state) {
  const mod = getModule(gameId);
  if (!mod?.redact) return state;
  try {
    return mod.redact(state);
  } catch (err) {
    console.error("[game-core] redact failed", gameId, err);
    return { seed: state.seed };
  }
}
__name(redactState, "redactState");
function nextDeadline(gameId, state, now2) {
  const mod = getModule(gameId);
  if (!mod) return null;
  try {
    return mod.nextDeadline(state, now2);
  } catch (err) {
    console.error("[game-core] nextDeadline failed", gameId, err);
    return null;
  }
}
__name(nextDeadline, "nextDeadline");

// src/room.ts
var HEARTBEAT_TIMEOUT_MS = 3e4;
var RoomDO = class extends DurableObject {
  static {
    __name(this, "RoomDO");
  }
  room = null;
  loaded = false;
  /**
   * clientToken -> memberId 的稳定身份映射。
   *
   * 为什么必须独立于 Room 存储：Room 对象会被广播给所有客户端，
   * 一旦把 token 表塞进 Room，任何人都能读到别人的 token 并冒充其身份。
   * 因此这张表只存在 DO storage 的独立 key 中，永不出现在任何出站消息里。
   */
  tokens = null;
  // ---------- 持久化 ----------
  async ensure() {
    if (!this.loaded) {
      this.room = await this.ctx.storage.get("room") ?? null;
      this.loaded = true;
    }
    return this.room;
  }
  async commit() {
    if (this.room) {
      this.room.lastActiveAt = Date.now();
      await this.ctx.storage.put("room", this.room);
    }
  }
  async ensureTokens() {
    if (!this.tokens) {
      const raw = await this.ctx.storage.get("tokens") ?? {};
      this.tokens = new Map(Object.entries(raw));
    }
    return this.tokens;
  }
  async commitTokens() {
    if (this.tokens) {
      await this.ctx.storage.put("tokens", Object.fromEntries(this.tokens));
    }
  }
  /**
   * 房主离线时把操作权移交给最早加入的在线成员。
   *
   * 聚会场景下必须立即转移：房主手机锁屏/来电导致断线时，
   * 若还死守房主身份，一屋子人会卡在「等房主点开始」无法继续。
   * 原房主重连后作为普通成员回来，不夺回房主身份。
   *
   * @returns 是否发生了转移
   */
  reassignHostIfNeeded(room) {
    const current = room.members.find((m) => m.id === room.hostId);
    if (current?.online) return false;
    const candidates = room.members.filter((m) => m.online).sort((a, b) => a.joinedAt - b.joinedAt);
    if (candidates.length === 0) return false;
    const next = candidates[0];
    if (next.id === room.hostId) return false;
    for (const m of room.members) m.isHost = false;
    next.isHost = true;
    room.hostId = next.id;
    return true;
  }
  // ---------- HTTP 入口 ----------
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname.endsWith("/init")) {
      const body = await request.json();
      const existing = await this.ensure();
      if (existing) return json({ code: existing.code });
      const now2 = Date.now();
      const room = {
        code: body.code ?? randomRoomCode(),
        // 首个通过 WebSocket 加入的人自动成为房主
        hostId: "",
        revision: 1,
        phase: "lobby",
        members: [],
        gameId: null,
        gameState: null,
        settings: { spice: "mild", gameOptions: {} },
        createdAt: now2,
        lastActiveAt: now2
      };
      this.room = room;
      await this.commit();
      return json({ code: room.code });
    }
    if (request.method === "GET" && url.pathname.endsWith("/info")) {
      const room = await this.ensure();
      if (!room) return json({ exists: false }, 404);
      return json({
        exists: true,
        code: room.code,
        memberCount: room.members.length,
        phase: room.phase,
        gameId: room.gameId,
        spice: room.settings.spice
      });
    }
    const upgrade = request.headers.get("Upgrade");
    if (upgrade === "websocket") {
      return this.handleUpgrade();
    }
    return json({ error: "not_found" }, 404);
  }
  handleUpgrade() {
    const pair = new WebSocketPair();
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ memberId: "", token: "" });
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  // ---------- WebSocket 生命周期 ----------
  async webSocketMessage(ws, message) {
    const room = await this.ensure();
    if (!room) {
      this.safeSend(ws, { t: "error", revision: 0, payload: { code: "ROOM_GONE", message: "\u623F\u95F4\u5DF2\u89E3\u6563" } });
      return;
    }
    let msg;
    try {
      msg = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message));
    } catch {
      return;
    }
    if (!msg || typeof msg.t !== "string") return;
    const att = ws.deserializeAttachment() ?? { memberId: "", token: "" };
    const now2 = Date.now();
    switch (msg.t) {
      case "join":
      case "rejoin": {
        await this.handleJoin(ws, room, msg, att, now2);
        break;
      }
      case "heartbeat": {
        if (!att.memberId) return;
        const m = room.members.find((x) => x.id === att.memberId);
        if (m) {
          m.lastSeenAt = now2;
          if (!m.online) {
            m.online = true;
            room.revision++;
            await this.commit();
            this.broadcastState();
          }
        }
        this.safeSend(ws, { t: "event", roomCode: room.code, revision: room.revision, payload: { kind: "pong" } });
        break;
      }
      case "resync": {
        this.sendWelcome(ws, room, att.memberId);
        break;
      }
      case "action": {
        if (!att.memberId || !room.gameId || !room.gameState) return;
        const action = msg.payload ?? {};
        if (!action.kind) return;
        const ctx = this.gameCtx(room);
        if (room.gameId === "draw" && action.kind === "stroke") {
          const applied = applyAction(room.gameId, room.gameState, action, {
            playerId: att.memberId,
            now: now2,
            memberIds: ctx.memberIds
          });
          room.gameState = applied;
          this.broadcastExcept(att.memberId, {
            t: "event",
            roomCode: room.code,
            revision: room.revision,
            payload: { kind: "stroke", stroke: action }
          });
          if (now2 - this.lastDrawBroadcast > 600) {
            this.lastDrawBroadcast = now2;
            room.revision++;
            await this.commit();
            this.broadcastState();
          }
          break;
        }
        const next = applyAction(room.gameId, room.gameState, action, {
          playerId: att.memberId,
          now: now2,
          memberIds: ctx.memberIds
        });
        if (next !== room.gameState) {
          room.gameState = next;
          room.revision++;
          await this.commit();
          await this.armAlarm();
        }
        this.broadcastState();
        break;
      }
      case "startGame": {
        await this.handleStartGame(room, msg, att.memberId, now2);
        break;
      }
      case "endGame": {
        if (att.memberId !== room.hostId) return;
        room.phase = "lobby";
        room.gameId = null;
        room.gameState = null;
        room.revision++;
        await this.commit();
        await this.ctx.storage.deleteAlarm();
        this.broadcastState();
        break;
      }
      case "updateSettings": {
        if (att.memberId !== room.hostId) return;
        const patch = msg.payload ?? {};
        if (patch.spice) room.settings.spice = patch.spice;
        if (patch.gameOptions) room.settings.gameOptions = { ...room.settings.gameOptions, ...patch.gameOptions };
        room.revision++;
        await this.commit();
        this.broadcastState();
        break;
      }
      case "kick": {
        if (att.memberId !== room.hostId) return;
        const targetId = msg.payload?.memberId;
        if (!targetId || targetId === room.hostId) return;
        await this.dropMember(room, targetId);
        break;
      }
      case "transferHost": {
        if (att.memberId !== room.hostId) return;
        const targetId = msg.payload?.memberId;
        const target = room.members.find((m) => m.id === targetId);
        if (!target) return;
        const prev = room.members.find((m) => m.id === room.hostId);
        if (prev) prev.isHost = false;
        target.isHost = true;
        room.hostId = target.id;
        room.revision++;
        await this.commit();
        this.broadcastState();
        break;
      }
      case "leave": {
        if (att.memberId) await this.dropMember(room, att.memberId);
        break;
      }
      default:
        break;
    }
  }
  async webSocketClose(ws) {
    const room = await this.ensure();
    const att = ws.deserializeAttachment() ?? null;
    if (!room || !att?.memberId) return;
    const m = room.members.find((x) => x.id === att.memberId);
    if (m && m.online) {
      m.online = false;
      const moved = this.reassignHostIfNeeded(room);
      room.revision++;
      await this.commit();
      this.broadcastState();
      if (moved) {
        const host = room.members.find((x) => x.id === room.hostId);
        this.broadcast({
          t: "event",
          roomCode: room.code,
          revision: room.revision,
          payload: { kind: "hostChanged", message: `${host?.nickname ?? "\u65B0\u623F\u4E3B"} \u6210\u4E3A\u623F\u4E3B` }
        });
      }
    }
  }
  async webSocketError(ws) {
    await this.webSocketClose(ws);
  }
  // ---------- 具体业务 ----------
  async handleJoin(ws, room, msg, att, now2) {
    const clientToken = typeof msg.clientToken === "string" ? msg.clientToken.slice(0, 80) : "";
    const tokens = await this.ensureTokens();
    let known = att.memberId ? room.members.find((x) => x.id === att.memberId) : void 0;
    if (!known && clientToken) {
      const mappedId = tokens.get(clientToken);
      if (mappedId) known = room.members.find((x) => x.id === mappedId);
    }
    if (known) {
      known.online = true;
      known.lastSeenAt = now2;
      ws.serializeAttachment({ memberId: known.id, token: clientToken });
      if (clientToken) {
        tokens.set(clientToken, known.id);
        await this.commitTokens();
      }
      room.revision++;
      await this.commit();
      this.sendWelcome(ws, room, known.id);
      this.broadcastState();
      return;
    }
    const payload = msg.payload ?? {};
    const existing = void 0;
    if (!existing && room.members.length >= MAX_MEMBERS) {
      this.safeSend(ws, {
        t: "error",
        roomCode: room.code,
        revision: room.revision,
        payload: { code: "ROOM_FULL", message: "\u623F\u95F4\u5DF2\u6EE1" }
      });
      ws.close(1008, "room full");
      return;
    }
    const member = existing ?? {
      id: crypto.randomUUID(),
      nickname: (payload.nickname ?? "\u73A9\u5BB6").slice(0, 12),
      avatarSeed: (payload.avatarSeed ?? "888888").slice(0, 32),
      isHost: false,
      online: true,
      score: 0,
      joinedAt: now2,
      lastSeenAt: now2
    };
    if (!existing) {
      member.online = true;
      member.lastSeenAt = now2;
      if (room.members.length === 0) {
        member.isHost = true;
        room.hostId = member.id;
      }
      room.members.push(member);
    }
    room.revision++;
    const token = clientToken || randomToken();
    ws.serializeAttachment({ memberId: member.id, token });
    tokens.set(token, member.id);
    await this.commitTokens();
    await this.commit();
    this.sendWelcome(ws, room, member.id);
    this.broadcastState();
  }
  async handleStartGame(room, msg, memberId, now2) {
    if (memberId !== room.hostId) return;
    const payload = msg.payload ?? {};
    const gameId = payload.gameId;
    if (!gameId) return;
    const ctx = this.gameCtx(room);
    const state = createGameState(gameId, ctx, payload.options ?? {});
    if (!state) {
      this.broadcast({
        t: "error",
        roomCode: room.code,
        revision: room.revision,
        payload: { code: "GAME_NOT_FOUND", message: "\u6E38\u620F\u4E0D\u5B58\u5728" }
      });
      return;
    }
    room.gameId = gameId;
    room.gameState = state;
    room.phase = "playing";
    room.revision++;
    await this.commit();
    await this.armAlarm();
    this.broadcastState();
  }
  async dropMember(room, memberId) {
    const before = room.members.length;
    room.members = room.members.filter((m) => m.id !== memberId);
    if (room.members.length === before) return;
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment();
      if (att?.memberId === memberId) {
        try {
          ws.close(1e3, "removed");
        } catch {
        }
      }
    }
    if (room.hostId === memberId && room.members.length > 0) {
      const online = room.members.filter((m) => m.online).sort((a, b) => a.joinedAt - b.joinedAt);
      const fallback = room.members.slice().sort((a, b) => a.joinedAt - b.joinedAt);
      const nextHost = online[0] ?? fallback[0];
      nextHost.isHost = true;
      room.hostId = nextHost.id;
    }
    if (room.members.length === 0) {
      room.lastActiveAt = now();
      await this.commit();
      await this.ctx.storage.setAlarm(Date.now() + 6e4);
      return;
    }
    if (room.gameId && room.gameState) {
      const st = room.gameState;
      if (st.phase && st.phase !== "result") {
        room.phase = "lobby";
        room.gameId = null;
        room.gameState = null;
      }
    }
    room.revision++;
    await this.commit();
    await this.armAlarm();
    this.broadcastState();
  }
  gameCtx(room) {
    return {
      memberIds: room.members.map((m) => m.id),
      hostId: room.hostId,
      settings: room.settings,
      now: Date.now()
    };
  }
  // ---------- 广播 ----------
  broadcastState() {
    const room = this.room;
    if (!room) return;
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment();
      const memberId = att?.memberId ?? "";
      const isPlaying = room.gameId !== null && room.gameState !== null;
      const payload = { ...room };
      if (isPlaying) {
        payload.gameState = redactState(room.gameId, room.gameState);
      }
      this.safeSend(ws, {
        t: "state",
        roomCode: room.code,
        revision: room.revision,
        payload
      });
      if (isPlaying && memberId) {
        this.safeSend(ws, {
          t: "private",
          roomCode: room.code,
          revision: room.revision,
          payload: {
            gameId: room.gameId,
            revision: room.revision,
            data: privateView(room.gameId, room.gameState, memberId, this.gameCtx(room))
          }
        });
      }
    }
  }
  sendWelcome(ws, room, memberId) {
    this.safeSend(ws, {
      t: "welcome",
      roomCode: room.code,
      revision: room.revision,
      payload: { memberId }
    });
    const payload = { ...room };
    if (room.gameId && room.gameState) {
      payload.gameState = redactState(room.gameId, room.gameState);
    }
    this.safeSend(ws, {
      t: "state",
      roomCode: room.code,
      revision: room.revision,
      payload
    });
  }
  lastDrawBroadcast = 0;
  broadcastExcept(excludeMemberId, msg) {
    const data = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment();
      if (att?.memberId === excludeMemberId) continue;
      try {
        ws.send(data);
      } catch {
      }
    }
  }
  broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(data);
      } catch {
      }
    }
  }
  safeSend(ws, msg) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
    }
  }
  // ---------- 定时推进 ----------
  async armAlarm() {
    const room = this.room;
    if (!room || !room.gameId || !room.gameState) {
      await this.ctx.storage.deleteAlarm();
      return;
    }
    const now2 = Date.now();
    const dl = nextDeadline(room.gameId, room.gameState, now2);
    if (dl === null) {
      await this.ctx.storage.deleteAlarm();
      return;
    }
    await this.ctx.storage.setAlarm(Math.min(dl, now2 + ROOM_TTL_MS));
  }
  async alarm() {
    const room = await this.ensure();
    if (!room) return;
    const now2 = Date.now();
    if (room.members.length === 0 || now2 - room.lastActiveAt > ROOM_TTL_MS) {
      await this.ctx.storage.deleteAll();
      this.room = null;
      this.loaded = false;
      return;
    }
    let changed = false;
    for (const m of room.members) {
      if (m.online && now2 - m.lastSeenAt > HEARTBEAT_TIMEOUT_MS) {
        m.online = false;
        changed = true;
      }
    }
    if (room.gameId && room.gameState) {
      const before = room.gameState;
      const next = applyTick(room.gameId, before, now2, this.gameCtx(room));
      if (next !== before) {
        room.gameState = next;
        changed = true;
      }
    }
    if (changed) {
      room.revision++;
      await this.commit();
      this.broadcastState();
    }
    await this.armAlarm();
  }
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
__name(json, "json");
function now() {
  return Date.now();
}
__name(now, "now");

// src/index.ts
var src_default = {
  async fetch(request, env2, _ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      return createRoom(env2);
    }
    if (url.pathname.startsWith("/api/rooms/") && request.method === "GET") {
      const code = normalizeRoomCode(url.pathname.slice("/api/rooms/".length));
      if (code.length !== 4) return json2({ exists: false }, 400);
      const stub = stubFor(env2, code);
      return stub.fetch("https://room/info", { method: "GET" });
    }
    if (url.pathname === "/api/health") {
      return json2({ ok: true, ts: Date.now() });
    }
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const code = normalizeRoomCode(url.searchParams.get("code") ?? "");
      if (code.length !== 4) {
        return json2({ error: "INVALID_CODE" }, 400);
      }
      const exists = await roomExists(env2, code);
      if (!exists) {
        return json2({ error: "ROOM_NOT_FOUND" }, 404);
      }
      const stub = stubFor(env2, code);
      return stub.fetch("https://room/ws", request);
    }
    if (env2.ASSETS) {
      return env2.ASSETS.fetch(request);
    }
    return json2({ error: "not_found" }, 404);
  }
};
function stubFor(env2, code) {
  return env2.ROOMS.get(env2.ROOMS.idFromName(code));
}
__name(stubFor, "stubFor");
async function roomExists(env2, code) {
  const res = await stubFor(env2, code).fetch("https://room/info", { method: "GET" });
  if (!res.ok) return false;
  const data = await res.json();
  return data.exists === true;
}
__name(roomExists, "roomExists");
async function createRoom(env2) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = randomRoomCode();
    const stub = stubFor(env2, code);
    const res = await stub.fetch("https://room/info", { method: "GET" });
    const data = await res.json();
    if (data.exists) continue;
    await stub.fetch("https://room/init", {
      method: "POST",
      body: JSON.stringify({ code })
    });
    return json2({ code }, 201);
  }
  return json2({ error: "CODE_ALLOC_FAILED" }, 500);
}
__name(createRoom, "createRoom");
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
__name(json2, "json");

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-nuy6QF/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-nuy6QF/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  RoomDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
