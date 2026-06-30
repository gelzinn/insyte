<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { ANALYTICS_INJECTION_KEY } from "@insyte/track/vue";
import type { AnalyticsClient } from "@insyte/track";

const analytics = inject(ANALYTICS_INJECTION_KEY) as AnalyticsClient;
const consent = ref(analytics.getConsentManager().getConsent());

analytics.getConsentManager().onConsentChange((next) => {
  consent.value = next;
});

const showBanner = computed(() => !consent.value.analytics);

async function acceptConsent() {
  analytics.grantConsent(["analytics", "marketing"]);
  await analytics.init();
  analytics.setupAutoPageView();
}

function rejectConsent() {
  analytics.denyConsent(["analytics", "marketing"]);
}

function trackDemoEvent() {
  analytics.track("demo_button_clicked", {
    framework: "vue",
    source: "test-vue",
  });
}
</script>

<template>
  <main class="demo">
    <span class="badge">Vue 3 + Vite</span>
    <h1>@insyte/track demo</h1>
    <p>
      Aceite os cookies, abra o console e clique no botão para ver o evento de
      analytics.
    </p>
    <button type="button" class="demo-button" @click="trackDemoEvent">
      Disparar evento
    </button>

    <div v-if="showBanner" class="consent-banner" role="dialog" aria-live="polite">
      <div>
        <strong>Cookies de analytics</strong>
        <p>Usamos analytics para melhorar sua experiência.</p>
      </div>
      <div class="consent-actions">
        <button type="button" class="ghost" @click="rejectConsent">Recusar</button>
        <button type="button" class="primary" @click="acceptConsent">Aceitar</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.demo {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 24px;
}

.badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 600;
}

h1 {
  margin: 0 0 8px;
  font-size: 2rem;
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
</style>
