class BookingWidget extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  private render() {
    const apiBase = this.getAttribute("api-base") ?? "";
    const tenantId = this.getAttribute("tenant-id") ?? "";

    this.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
        }
        .title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .meta {
          font-size: 12px;
          color: #6b7280;
        }
      </style>
      <div class="title">Booking widget</div>
      <div class="meta">API: ${apiBase}</div>
      <div class="meta">Tenant: ${tenantId}</div>
    `;
  }
}

customElements.define("booking-widget", BookingWidget);
