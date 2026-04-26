import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { initThemeFromStorage } from "./composables/useTheme.js";
import "primeicons/primeicons.css";
import "./style.css";

initThemeFromStorage();
createApp(App).use(router).use(PrimeVue, { unstyled: true }).use(ConfirmationService).use(ToastService).mount("#app");
