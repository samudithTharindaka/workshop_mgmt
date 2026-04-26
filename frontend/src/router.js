import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "./views/DashboardView.vue";
import AppointmentsView from "./views/AppointmentsView.vue";
import JobCardsView from "./views/JobCardsView.vue";
import JobCardDetailView from "./views/JobCardDetailView.vue";
import InspectionsView from "./views/InspectionsView.vue";

const historyBase = import.meta.env.DEV ? "/" : "/workshop/";

export default createRouter({
	history: createWebHistory(historyBase),
	routes: [
		{ path: "/", name: "dashboard", component: DashboardView },
		{ path: "/appointments", name: "appointments", component: AppointmentsView },
		{ path: "/job-cards", name: "job-cards", component: JobCardsView },
		{ path: "/job-cards/:id", name: "job-card-detail", component: JobCardDetailView },
		{ path: "/inspections", name: "inspections", component: InspectionsView },
	],
});
