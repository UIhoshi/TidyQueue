(function (global) {
  class QueueController {
    constructor(processItem, options = {}) {
      this.processItem = processItem;
      this.milestoneEvery = options.milestoneEvery || 10;
      this.pauseDurationMs = options.pauseDurationMs || 900;
      this.interItemDelayMs = options.interItemDelayMs || 0;
      this.sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
      this.onChange = options.onChange || (() => {});
      this.reset();
    }

    reset() {
      this.items = [];
      this.index = 0;
      this.status = 'idle';
      this.pauseReason = null;
      this.error = null;
      this.current = null;
      this.runToken = 0;
      this.emit();
    }

    start(items) {
      if (this.status === 'running') return;
      this.items = [...items];
      this.index = 0;
      this.status = this.items.length ? 'running' : 'completed';
      this.pauseReason = null;
      this.error = null;
      this.current = null;
      this.runToken += 1;
      this.emit();
      if (this.status === 'running') this.pump(this.runToken);
    }

    pause(reason = 'manual') {
      if (this.status !== 'running') return;
      this.status = 'paused';
      this.pauseReason = reason;
      this.runToken += 1;
      this.emit();
    }

    resume() {
      if (this.status !== 'paused') return;
      this.status = 'running';
      this.pauseReason = null;
      this.error = null;
      this.runToken += 1;
      this.emit();
      this.pump(this.runToken);
    }

    stop() {
      if (!['running', 'paused'].includes(this.status)) return;
      this.status = 'stopped';
      this.current = null;
      this.runToken += 1;
      this.emit();
    }

    snapshot() {
      return {
        status: this.status, pauseReason: this.pauseReason, error: this.error,
        completed: this.index, total: this.items.length, current: this.current,
        upcoming: this.items.slice(this.index + (this.current ? 1 : 0), this.index + (this.current ? 4 : 3))
      };
    }

    emit() { this.onChange(this.snapshot()); }

    async pump(token) {
      while (this.status === 'running' && token === this.runToken && this.index < this.items.length) {
        const item = this.items[this.index];
        this.current = item;
        this.emit();
        try {
          await this.processItem(item);
        } catch (error) {
          if (token !== this.runToken) return;
          this.status = 'paused';
          this.pauseReason = 'failure';
          this.error = error instanceof Error ? error.message : String(error);
          this.current = null;
          this.runToken += 1;
          this.emit();
          return;
        }
        if (token !== this.runToken || this.status !== 'running') return;
        this.index += 1;
        this.current = null;
        this.emit();
        if (this.index < this.items.length && this.interItemDelayMs > 0) {
          this.pauseReason = 'pacing';
          this.emit();
          await this.sleep(this.interItemDelayMs);
          if (token !== this.runToken || this.status !== 'running') return;
          this.pauseReason = null;
          this.emit();
        }
        if (this.index < this.items.length && this.index % this.milestoneEvery === 0) {
          this.pauseReason = 'milestone';
          this.emit();
          await this.sleep(this.pauseDurationMs);
          if (token !== this.runToken || this.status !== 'running') return;
          this.pauseReason = null;
          this.emit();
        }
      }
      if (token === this.runToken && this.status === 'running' && this.index === this.items.length) {
        this.status = 'completed';
        this.current = null;
        this.emit();
      }
    }
  }
  global.QueueController = QueueController;
  if (typeof module !== 'undefined') module.exports = { QueueController };
})(globalThis);