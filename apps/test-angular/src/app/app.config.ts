import { provideInsyte } from "@insyte/track/angular";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...provideInsyte({ autoPageView: true }),
  ],
};
