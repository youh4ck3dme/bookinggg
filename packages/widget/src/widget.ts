// File: /packages/widget/src/widget.ts

class BookingWidget extends HTMLElement {
  private apiBase: string = '';
  private tenantId: string = '';
  private apiKey: string = '';

  connectedCallback() {
    this.apiBase = this.getAttribute('api-base') || '';
    this.tenantId = this.getAttribute('tenant-id') || '';
    this.apiKey = this.getAttribute('api-key') || '';

    this.render();
  }

  private render() {
    this.innerHTML = `
      <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
        <h3>Booking Widget</h3>
        <p>Tenant: ${this.tenantId}</p>
        <p>API: ${this.apiBase}</p>
        <p>Widget placeholder - to be implemented in PROMPT 7</p>
      </div>
    `;
  }
}

customElements.define('booking-widget', BookingWidget);
