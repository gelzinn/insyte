import { Component, inject } from "@angular/core";
import { InsyteAnalyticsService } from "@insyte/track/angular";

@Component({
  selector: "app-root",
  imports: [],
  template: `
    <main class="demo">
      <span class="badge">Angular 19</span>
      <h1>&#64;insyte/track demo</h1>
      <p>
        Accept cookies, open the console, and click the button to see the analytics
        event.
      </p>
      <button type="button" class="demo-button" (click)="trackDemoEvent()">
        Track event
      </button>

      @if (showBanner) {
        <div class="consent-banner" role="dialog" aria-live="polite">
          <div>
            <strong>Analytics cookies</strong>
            <p>We use analytics to improve your experience.</p>
          </div>
          <div class="consent-actions">
            <button type="button" class="ghost" (click)="rejectConsent()">Decline</button>
            <button type="button" class="primary" (click)="acceptConsent()">Accept</button>
          </div>
        </div>
      }
    </main>
  `,
  styles: [
    `
      .demo {
        max-width: 640px;
        margin: 0 auto;
        padding: 48px 24px;
        font-family: Inter, system-ui, sans-serif;
      }

      .badge {
        display: inline-block;
        margin-bottom: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: #ffedd5;
        color: #c2410c;
        font-size: 12px;
        font-weight: 600;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 2rem;
        color: #111827;
      }

      p {
        margin: 0 0 24px;
        color: #4b5563;
      }

      .demo-button,
      .consent-actions button {
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }

      .demo-button {
        border: none;
        background: #111827;
        color: white;
      }

      .consent-banner {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #111827;
        color: #f9fafb;
      }

      .consent-banner p {
        margin: 4px 0 0;
        color: #d1d5db;
      }

      .consent-actions {
        display: flex;
        gap: 8px;
      }

      .consent-actions .ghost {
        border: 1px solid #4b5563;
        background: transparent;
        color: #f9fafb;
      }

      .consent-actions .primary {
        border: none;
        background: #2563eb;
        color: white;
      }
    `,
  ],
})
export class AppComponent {
  private analytics = inject(InsyteAnalyticsService);
  showBanner = !this.analytics.getConsent().analytics;

  async acceptConsent(): Promise<void> {
    this.analytics.grantConsent(["analytics", "marketing"]);
    await this.analytics.initialize();
    this.showBanner = false;
  }

  rejectConsent(): void {
    this.analytics.denyConsent(["analytics", "marketing"]);
    this.showBanner = false;
  }

  trackDemoEvent(): void {
    this.analytics.track("demo_button_clicked", {
      framework: "angular",
      source: "test-angular",
    });
  }
}
