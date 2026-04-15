# Copyright (c) 2026, Infoney and contributors
# Standard vehicle inspection checklist (sections + check items). Used by Vehicle Inspection "Load checklist".

import frappe

# Template rows: section + check_item only; inspector fills status, notes, recommended_service, estimated_price.
STANDARD_VEHICLE_INSPECTION_CHECKLIST = [
	# 1. Engine & Fluids
	{"section": "Engine & Fluids", "check_item": "Engine oil level & quality"},
	{"section": "Engine & Fluids", "check_item": "Coolant level"},
	{"section": "Engine & Fluids", "check_item": "Brake fluid"},
	{"section": "Engine & Fluids", "check_item": "Transmission fluid"},
	{"section": "Engine & Fluids", "check_item": "Leaks (oil / coolant)"},
	# 2. Braking System
	{"section": "Braking System", "check_item": "Brake pads wear"},
	{"section": "Braking System", "check_item": "Brake discs condition"},
	{"section": "Braking System", "check_item": "Brake response"},
	# 3. Tires & Wheels
	{"section": "Tires & Wheels", "check_item": "Tire tread depth"},
	{"section": "Tires & Wheels", "check_item": "Tire pressure"},
	{"section": "Tires & Wheels", "check_item": "Wheel alignment issues"},
	# 4. Battery & Electrical
	{"section": "Battery & Electrical", "check_item": "Battery health"},
	{"section": "Battery & Electrical", "check_item": "Lights (headlights, indicators, brake lights)"},
	{"section": "Battery & Electrical", "check_item": "Horn, sensors"},
	# 5. Suspension & Steering
	{"section": "Suspension & Steering", "check_item": "Shock absorbers"},
	{"section": "Suspension & Steering", "check_item": "Steering play"},
	{"section": "Suspension & Steering", "check_item": "Suspension noise"},
	# 6. Exterior & Interior
	{"section": "Exterior & Interior", "check_item": "Body damage (scratches, dents)"},
	{"section": "Exterior & Interior", "check_item": "Mirrors, windshield"},
	{"section": "Exterior & Interior", "check_item": "Seat belts, dashboard warnings"},
]


@frappe.whitelist()
def get_standard_vehicle_inspection_checklist():
	"""Return the built-in section + check_item rows for the inspection grid."""
	return STANDARD_VEHICLE_INSPECTION_CHECKLIST
