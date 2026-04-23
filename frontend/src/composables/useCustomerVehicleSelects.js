import { ref, computed } from "vue";
import { restResourceList } from "../utils/api";

/**
 * Customer + vehicle dropdowns for Service Appointment (portal).
 * @param {import('vue').Reactive<{ customer: string, vehicle: string }>} form
 */
export function useCustomerVehicleSelects(form) {
	const customers = ref([]);
	const vehicles = ref([]);
	const loadingCustomers = ref(false);
	const loadingVehicles = ref(false);
	const pickerError = ref("");

	const vehicleSelectPlaceholder = computed(() => {
		if (!form.customer) return "Select a customer first…";
		if (loadingVehicles.value) return "Loading vehicles…";
		return "Select vehicle…";
	});

	function formatCustomerOption(c) {
		const name = c.name || "";
		const label = (c.customer_name || "").trim();
		if (label && label !== name) return `${label} (${name})`;
		return name || "—";
	}

	function formatVehicleOption(v) {
		const plate = v.license_plate || v.name || "";
		const bits = [v.make, v.model, v.year ? String(v.year) : ""].filter(Boolean).join(" ");
		if (bits) return `${bits} · ${plate}`;
		return plate;
	}

	async function loadCustomersForModal() {
		pickerError.value = "";
		customers.value = [];
		loadingCustomers.value = true;
		try {
			customers.value = await restResourceList("Customer", {
				fields: '["name","customer_name"]',
				order_by: "customer_name asc",
				limit_page_length: 500,
			});
		} catch (e) {
			pickerError.value = e.message || "Could not load customers";
		} finally {
			loadingCustomers.value = false;
		}
	}

	async function loadVehiclesForCustomer(customerName) {
		pickerError.value = "";
		vehicles.value = [];
		form.vehicle = "";
		if (!customerName) {
			return;
		}
		loadingVehicles.value = true;
		try {
			vehicles.value = await restResourceList("Vehicle", {
				fields: '["name","license_plate","make","model","year","customer"]',
				order_by: "modified desc",
				limit_page_length: 200,
				filters: [["customer", "=", customerName]],
			});
		} catch (e) {
			pickerError.value = e.message || "Could not load vehicles";
		} finally {
			loadingVehicles.value = false;
		}
	}

	function onCustomerChange() {
		pickerError.value = "";
		loadVehiclesForCustomer(form.customer);
	}

	function resetPickerLists() {
		customers.value = [];
		vehicles.value = [];
		pickerError.value = "";
	}

	return {
		customers,
		vehicles,
		loadingCustomers,
		loadingVehicles,
		pickerError,
		vehicleSelectPlaceholder,
		formatCustomerOption,
		formatVehicleOption,
		loadCustomersForModal,
		loadVehiclesForCustomer,
		onCustomerChange,
		resetPickerLists,
	};
}
