// Workshop Management - Workspace Sidebar Integration
// Copyright (c) 2025, Infoney

// Add Garage Management to ERPNext workspace sidebar
frappe.provide("frappe.workspace_manager");

$(document).on('app_ready', function() {
	setTimeout(function() {
		addGarageWorkspaceToSidebar();
	}, 500);
});

function addGarageWorkspaceToSidebar() {
	// Check if workspace sidebar exists
	const workspaceSidebar = $('.workspace-sidebar');
	
	if (workspaceSidebar.length > 0) {
		// Check if Garage workspace already added
		if ($('.workspace-sidebar-item[data-workspace="Workshop Management"]').length === 0) {
			
			// Create workspace link
			const garageWorkspaceItem = `
				<div class="workspace-sidebar-item" data-workspace="Workshop Management">
					<a href="/app/garage-dashboard" class="workspace-sidebar-link">
						<span class="workspace-sidebar-icon" style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);">
							<svg class="icon icon-md" style="stroke: white;">
								<use href="#icon-tool"></use>
							</svg>
						</span>
						<span class="workspace-sidebar-label">Garage</span>
					</a>
				</div>
			`;
			
			// Find the right place to insert (after Home)
			const homeItem = workspaceSidebar.find('[data-workspace="Home"]');
			if (homeItem.length > 0) {
				homeItem.after(garageWorkspaceItem);
			} else {
				// Insert at the top
				workspaceSidebar.find('.standard-sidebar-section').first().prepend(garageWorkspaceItem);
			}
			
			console.log('✓ Garage workspace added to sidebar');
		}
	}
	
	// Also add to desk sidebar if it exists
	addToDeskSidebar();
}

function addToDeskSidebar() {
	// Modern Frappe V14+ sidebar structure
	const sidebar = $('#page-Workspaces .sidebar-menu, .layout-side-section');
	
	if (sidebar.length > 0 && $('.sidebar-menu-item[data-name="garage-dashboard"]').length === 0) {
		const garageSidebarItem = `
			<div class="sidebar-menu-item" data-name="garage-dashboard">
				<a href="/app/garage-dashboard" class="sidebar-menu-link">
					<span class="icon-container">
						<svg class="icon icon-sm">
							<use href="#icon-dashboard"></use>
						</svg>
					</span>
					<span class="sidebar-menu-label">🚗 Garage Dashboard</span>
				</a>
			</div>
		`;
		
		sidebar.prepend(garageSidebarItem);
	}
}

// Hook into workspace rendering
if (frappe.ui && frappe.ui.WorkspaceCategory) {
	const originalMake = frappe.ui.WorkspaceCategory.prototype.make;
	
	frappe.ui.WorkspaceCategory.prototype.make = function() {
		originalMake.apply(this, arguments);
		
		// Add garage management after render
		if (this.category === "Modules") {
			setTimeout(() => addGarageWorkspaceToSidebar(), 100);
		}
	};
}

// Add to awesome bar (command palette)
frappe.provide("frappe.search.utils");

if (frappe.search && frappe.search.utils) {
	$(document).on('app_ready', function() {
		// Register Garage Dashboard in search
		if (frappe.search.utils.add_to_awesomebar) {
			frappe.search.utils.add_to_awesomebar({
				type: "Page",
				name: "garage-dashboard",
				value: "Garage Dashboard",
				description: "Workshop management dashboard with real-time KPIs",
				index: 10
			});
		}
	});
}

