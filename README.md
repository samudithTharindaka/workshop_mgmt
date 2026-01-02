# 🚗 Workshop Management - Garage Management System for ERPNext

A comprehensive automotive workshop and garage management system built for ERPNext/Frappe Framework.

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Frappe](https://img.shields.io/badge/frappe-%3E%3D14.0.0-orange.svg)

## 🌟 Features

### 📊 **Custom Garage Dashboard**
- **Real-time KPIs**: Jobs in progress, ready to invoice, today's revenue, vehicles serviced
- **Interactive Charts**: Revenue trends (last 30 days), job status distribution
- **Live Lists**: Recent jobs, pending invoices, top services, top parts
- **Today's Appointments**: Real-time appointment tracking
- **Auto-refresh**: Dashboard updates every 2 minutes
- **Company Filter**: Multi-company support

### 🚗 **Core DocTypes**

#### **Vehicle**
- Registration number (license plate)
- VIN, make, model, year
- Color, fuel type, transmission
- Odometer tracking
- Customer linkage

#### **Service Appointment**
- Schedule with date/time
- Customer and vehicle linking
- Status tracking (Scheduled, Confirmed, In Progress, Completed, Cancelled)
- Service description

#### **Job Card**
- Complete job lifecycle management
- Service items (labor charges)
- Part items (stock management)
- Odometer reading tracking
- Service advisor assignment
- Automatic calculations
- **10-state workflow** (Draft → Checked In → Inspected → Estimated → Approved → In Progress → Ready to Invoice → Invoiced → Closed)
- Sales Invoice integration

#### **Vehicle Inspection**
- Comprehensive inspection checklist
- Inspection items (child table)
- Link to Job Card
- Inspector details

### 🔄 **Workflow Management**

**Job Card Workflow (10 States):**
1. Draft
2. Checked In
3. Inspected
4. Estimated
5. Approved
6. In Progress
7. Ready to Invoice
8. Invoiced
9. Closed
10. Cancelled

### 🤖 **Automations**

- **Create Quotation**: Auto-generate quotations from job cards
- **Create Sales Invoice**: One-click invoice generation with stock updates
- **Status Updates**: Automatic status progression
- **Total Calculations**: Automatic service + parts totals

### 📈 **Reports**

- **Job Cards by Status**: Filter by company, status, service advisor, date range
- **Jobs Ready to Invoice**: Pending billing report
- **Daily Revenue**: Revenue tracking
- **Parts Consumption**: Inventory analysis
- **Vehicle Service History**: Complete service records

### 🏢 **ERPNext Integration**

- **Customer Master**: Link jobs to existing customers
- **Item Master**: Services and parts inventory
- **Sales Invoice**: Complete billing integration
- **Stock Management**: Automatic inventory updates
- **Tax Calculations**: ERPNext tax engine
- **Accounting**: Full GL integration

### 🎨 **User Interface**

- **Workspace Integration**: Follows PosAwesome pattern
- **Sidebar Module**: Auto-appears in ERPNext sidebar
- **Search Integration**: Searchable via Ctrl+K
- **Responsive Design**: Works on all devices
- **Modern UI**: Beautiful gradient banners, hover effects

---

## 📦 Installation

### Prerequisites

- Frappe Framework >= 14.0.0
- ERPNext >= 14.0.0
- Python >= 3.10

### Install from GitHub

```bash
# Get the app
cd frappe-bench
bench get-app https://github.com/samudithTharindaka/workshop_mgmt.git

# Install on your site
bench --site [your-site] install-app workshop_mgmt

# Run migrations
bench --site [your-site] migrate

# Build assets
bench build --app workshop_mgmt

# Restart
bench restart
```

### Manual Installation

```bash
# Clone the repository
cd frappe-bench/apps
git clone https://github.com/samudithTharindaka/workshop_mgmt.git

# Install on site
bench --site [your-site] install-app workshop_mgmt
bench --site [your-site] migrate
bench build --app workshop_mgmt
bench restart
```

---

## 🚀 Quick Start

### 1. **Setup Fiscal Year**
```bash
# Make sure fiscal year exists for current year
# Setup > Fiscal Year > New Fiscal Year
```

### 2. **Configure Warehouse**
```bash
# Stock > Warehouse
# Create or select warehouse for parts
```

### 3. **Create Items**

**Services (Labor):**
- Item Type: Service
- Examples: Oil Change, Brake Service, Inspection

**Parts (Stock Items):**
- Item Type: Stock Item
- Examples: Oil Filter, Brake Pads, Air Filter

### 4. **Access Dashboard**

```
http://[your-site]:8000/app/garage-dashboard
```

Or click **"Workshop Management"** in the sidebar!

---

## 📖 Usage Guide

### Creating a Job

1. **Add Vehicle** (if new):
   - Go to Vehicle → New
   - Enter license plate, VIN, make, model
   - Link to customer

2. **Create Job Card**:
   - Click "New Job Card" in dashboard
   - Select customer and vehicle
   - Enter odometer reading
   - Add service items (labor)
   - Add parts (if needed)
   - Save

3. **Progress Through Workflow**:
   - Check In → Vehicle arrives
   - Inspect → Perform inspection
   - Estimate → Create estimate
   - Approve → Customer approves
   - In Progress → Start work
   - Ready to Invoice → Work completed

4. **Create Invoice**:
   - Click "Create Sales Invoice" button
   - Review and submit invoice
   - Job automatically marked as "Invoiced"

---

## 🎯 Access Points

1. **Sidebar**: Click "Workshop Management" (🔧 icon)
2. **Dashboard**: http://[site]/app/garage-dashboard
3. **Search**: Ctrl+K → "garage" or "workshop"
4. **Home Page**: Workshop Management workspace card
5. **Direct Links**:
   - Job Cards: /app/job-card
   - Vehicles: /app/vehicle
   - Appointments: /app/service-appointment

---

## 📂 File Structure

```
workshop_mgmt/
├── workshop_mgmt/
│   ├── config/
│   │   └── desktop.py              # Module definition
│   ├── public/
│   │   └── js/
│   │       └── workshop_mgmt.js    # Custom JS
│   ├── workshop_management/
│   │   ├── doctype/
│   │   │   ├── vehicle/
│   │   │   ├── job_card/
│   │   │   ├── service_appointment/
│   │   │   └── vehicle_inspection/
│   │   ├── page/
│   │   │   └── garage_dashboard/   # Custom dashboard
│   │   ├── report/
│   │   │   └── job_cards_by_status/
│   │   └── workspace/
│   │       └── workshop_management/
│   ├── hooks.py                     # App hooks
│   └── utils.py                     # Utility functions
├── DASHBOARD_GUIDE.md               # Dashboard documentation
├── SIDEBAR_INTEGRATION.md           # Sidebar setup guide
└── README.md                        # This file
```

---

## 🔧 Configuration

### Custom Fields on Sales Invoice

The app automatically adds:
- `custom_job_card` (Link to Job Card)

### Fixtures

Run this to export fixtures:
```bash
bench --site [your-site] export-fixtures
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Infoney**
- Email: info@infoney.com
- Website: [Your Website]

---

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check the [Issues](https://github.com/samudithTharindaka/workshop_mgmt/issues) page
2. Create a new issue with detailed description
3. Include error logs and screenshots

---

## 🎓 Documentation

- **Dashboard Guide**: [DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)
- **Sidebar Integration**: [SIDEBAR_INTEGRATION.md](SIDEBAR_INTEGRATION.md)
- **Frappe Docs**: https://frappeframework.com/docs
- **ERPNext Docs**: https://docs.erpnext.com

---

## 📊 Screenshots

### Garage Dashboard
![Dashboard](screenshots/dashboard.png)

### Job Card
![Job Card](screenshots/job-card.png)

### Workspace
![Workspace](screenshots/workspace.png)

---

## ✨ Features Roadmap

- [ ] Mobile app integration
- [ ] SMS/Email notifications
- [ ] Customer portal
- [ ] Online appointment booking
- [ ] Loyalty program
- [ ] Multi-location support
- [ ] Advanced analytics
- [ ] WhatsApp integration

---

## 🙏 Acknowledgments

- Built with [Frappe Framework](https://frappeframework.com)
- Integrated with [ERPNext](https://erpnext.com)
- Inspired by modern garage management systems

---

## 📞 Contact

For business inquiries or custom development:
- **Email**: info@infoney.com
- **GitHub**: [@samudithTharindaka](https://github.com/samudithTharindaka)

---

**Made with ❤️ for the automotive industry**
