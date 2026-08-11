(function (global) {
  class QueueSafetyGuard {
    constructor(queue, options = {}) {
      this.queue = queue;
      this.window = options.windowRef || global;
      this.document = options.documentRef || global.document;
      this.location = options.locationRef || global.location;
      this.intervalMs = options.intervalMs || 250;
      this.active = false;
      this.route = null;
      this.intervalId = null;
      this.onRouteChange = () => this.checkRoute();
      this.onVisibilityChange = () => {
        if (this.document?.hidden) this.pause('tab-hidden');
      };
    }

    isRunning() { return this.queue?.snapshot?.().status === 'running'; }

    start() {
      if (this.active || !this.isRunning()) return;
      this.route = this.location?.href || '';
      this.active = true;
      this.window?.addEventListener?.('popstate', this.onRouteChange);
      this.window?.addEventListener?.('hashchange', this.onRouteChange);
      this.document?.addEventListener?.('visibilitychange', this.onVisibilityChange);
      this.intervalId = this.window?.setInterval?.(() => this.checkRoute(), this.intervalMs) ?? null;
    }

    stop() {
      if (!this.active && this.intervalId === null) return;
      this.window?.removeEventListener?.('popstate', this.onRouteChange);
      this.window?.removeEventListener?.('hashchange', this.onRouteChange);
      this.document?.removeEventListener?.('visibilitychange', this.onVisibilityChange);
      if (this.intervalId !== null) this.window?.clearInterval?.(this.intervalId);
      this.intervalId = null;
      this.route = null;
      this.active = false;
    }

    checkRoute() {
      if (!this.active || !this.isRunning()) return false;
      if ((this.location?.href || '') === this.route) return false;
      this.pause('page-change');
      return true;
    }

    pause(reason) {
      if (!this.active || !this.isRunning()) return false;
      this.queue.pause(reason);
      this.stop();
      return true;
    }
  }

  global.QueueSafetyGuard = QueueSafetyGuard;
  if (typeof module !== 'undefined') module.exports = { QueueSafetyGuard };
})(globalThis);
