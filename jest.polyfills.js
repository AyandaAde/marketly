if (typeof global.Request === 'undefined' && typeof globalThis.Request === 'undefined') {
  class HeadersPolyfill {
    constructor(init = {}) {
      this._headers = new Map();
      if (init instanceof HeadersPolyfill) {
        init.forEach((value, key) => this.set(key, value));
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value));
    }
    
    has(name) {
      return this._headers.has(name.toLowerCase());
    }
    
    delete(name) {
      this._headers.delete(name.toLowerCase());
    }
    
    forEach(callback) {
      this._headers.forEach((value, key) => callback(value, key, this));
    }
  }
  
  class RequestPolyfill {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : (input?.url || 'http://localhost');
      this.method = init.method || 'GET';
      this.headers = init.headers instanceof HeadersPolyfill 
        ? init.headers 
        : new HeadersPolyfill(init.headers || {});
      this.body = init.body || null;
      this._bodyInit = init.body;
    }
    
    async json() {
      if (this._bodyInit) {
        return typeof this._bodyInit === 'string' 
          ? JSON.parse(this._bodyInit) 
          : this._bodyInit;
      }
      return {};
    }
    
    async text() {
      return typeof this._bodyInit === 'string' ? this._bodyInit : '';
    }
  }
  
  if (typeof global.Headers === 'undefined') {
    global.Headers = HeadersPolyfill;
    globalThis.Headers = HeadersPolyfill;
  }
  
  global.Request = RequestPolyfill;
  globalThis.Request = RequestPolyfill;
}

if (typeof global.Response === 'undefined' && typeof globalThis.Response === 'undefined') {
  // Reuse HeadersPolyfill if it exists, otherwise create a simple one
  const HeadersClass = global.Headers || class {
    constructor(init = {}) {
      this._headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), String(value));
        });
      }
    }
    get(name) { return this._headers.get(name.toLowerCase()) || null; }
    set(name, value) { this._headers.set(name.toLowerCase(), String(value)); }
    has(name) { return this._headers.has(name.toLowerCase()); }
    delete(name) { this._headers.delete(name.toLowerCase()); }
    forEach(callback) { this._headers.forEach((value, key) => callback(value, key, this)); }
  };
  
  class ResponsePolyfill {
    constructor(body = null, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = init.headers instanceof HeadersClass 
        ? init.headers 
        : new HeadersClass(init.headers || {});
      this._bodyInit = body;
    }
    
    async text() {
      return typeof this._bodyInit === 'string' ? String(this._bodyInit || '') : String(this._bodyInit || '');
    }
    
    async json() {
      if (typeof this._bodyInit === 'string') {
        return JSON.parse(this._bodyInit);
      }
      return this._bodyInit || {};
    }
  }
  
  global.Response = ResponsePolyfill;
  globalThis.Response = ResponsePolyfill;
}

