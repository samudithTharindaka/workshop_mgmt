// Workshop Management - Sidebar Integration
// Copyright (c) 2025, Infoney

// Global flag to prevent duplicate additions
window.garage_sidebar_added = window.garage_sidebar_added || false;

// Add to workspace sidebar (Public modules section)
$(document).on('app_ready', function() {
	// Prevent duplicate additions
	if (window.garage_sidebar_added) {
		console.log('⚠️ Garage sidebar already added, skipping...');
		return;
	}
	
	setTimeout(function() {
		// Check if user has access
		if (window.frappe && frappe.boot && frappe.boot.user) {
			if (frappe.boot.user.can_read && frappe.boot.user.can_read.includes("Job Card")) {
				addGarageToWorkspaceSidebar();
				window.garage_sidebar_added = true;
			}
		}
	}, 1500);
});

function addGarageToWorkspaceSidebar() {
	// Target the workspace sidebar's public section
	const workspaceSidebar = $('.layout-side-section .desk-sidebar, .standard-sidebar-section, .sidebar-menu');
	
	if (workspaceSidebar.length > 0) {
		// Check if already exists
		if ($('[data-page-name="garage-dashboard"]').length > 0 || 
		    $('.sidebar-item-container:contains("Garage")').length > 0) {
			console.log('⚠️ Garage already in workspace sidebar');
			return;
		}
		
		// Create workspace item
		const garageWorkspace = `
			<div class="sidebar-item-container" data-page-name="garage-dashboard">
				<div class="desk-sidebar-item standard-sidebar-item">
					<a href="/app/garage-dashboard" 
					   class="item-anchor" 
					   title="Garage Management Dashboard">
						<span class="sidebar-item-icon" data-icon="tool">
							<svg class="icon icon-sm" style="">
								<use href="#icon-tool"></use>
							</svg>
						</span>
						<span class="sidebar-item-label">Garage Management</span>
					</a>
				</div>
			</div>
		`;
		
		// Find "Public" section or insert at top
		const publicSection = workspaceSidebar.find('.standard-sidebar-section').first();
		if (publicSection.length > 0) {
			publicSection.prepend(garageWorkspace);
		} else {
			workspaceSidebar.prepend(garageWorkspace);
		}
		
		addSidebarStyles();
		console.log('✓ Garage added to workspace sidebar (Public section)');
	}
	
	// Also try the alternative sidebar structure
	addGarageToAlternativeSidebar();
}

function addGarageToAlternativeSidebar() {
	// For older Frappe versions or different sidebar structures
	const sidebar = $('.layout-side-section, .desk-sidebar');
	
	if (sidebar.length > 0 && !sidebar.find('.garage-sidebar-item').length) {
		const garageItem = `
			<div class="garage-sidebar-item sidebar-item-container">
				<a href="/app/garage-dashboard" class="sidebar-item">
					<span class="sidebar-item-icon">
						<svg class="icon icon-sm">
							<use href="#icon-tool"></use>
						</svg>
					</span>
					<span class="sidebar-item-label">🚗 Garage</span>
				</a>
			</div>
		`;
		
		sidebar.prepend(garageItem);
	}
}


function addSidebarStyles() {
	// Add custom styles for garage workspace item
	if ($('#garage-sidebar-styles').length === 0) {
		$('head').append(`
			<style id="garage-sidebar-styles">
				/* Garage workspace item styling */
				.sidebar-item-container[data-page-name="garage-dashboard"] {
					border-left: 3px solid #FF6B35;
					background: linear-gradient(90deg, rgba(255,107,53,0.05) 0%, transparent 100%);
				}
				
				.sidebar-item-container[data-page-name="garage-dashboard"] .sidebar-item-icon {
					color: #FF6B35;
				}
				
				.sidebar-item-container[data-page-name="garage-dashboard"] .item-anchor:hover {
					background: rgba(255,107,53,0.1);
					border-radius: 6px;
				}
				
				.sidebar-item-container[data-page-name="garage-dashboard"] .sidebar-item-label {
					font-weight: 600;
					color: #333;
				}
				
				.sidebar-item-container[data-page-name="garage-dashboard"]:hover .sidebar-item-label {
					color: #FF6B35;
				}
				
				/* Alternative sidebar structure */
				.garage-sidebar-item {
					border-left: 3px solid #FF6B35;
					margin: 5px 0;
				}
				
				.garage-sidebar-item .sidebar-item {
					padding: 10px 15px;
					display: flex;
					align-items: center;
					color: #555;
					text-decoration: none;
					transition: all 0.2s;
					border-radius: 6px;
				}
				
				.garage-sidebar-item .sidebar-item:hover {
					background: rgba(255,107,53,0.1);
					color: #FF6B35;
					transform: translateX(3px);
				}
				
				.garage-sidebar-item .sidebar-item-icon {
					margin-right: 10px;
					color: #FF6B35;
				}
			</style>
		`);
	}
}

