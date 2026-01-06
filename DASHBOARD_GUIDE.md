# 🚗 Garage Dashboard - Quick Access Guide

## How to Access the Dashboard

The Garage Dashboard is your central hub for managing workshop operations. Here are **5 easy ways** to access it:

### 1. 📍 **Direct Link** (Fastest)
Simply navigate to:
```
http://127.0.0.1:8000/app/garage-dashboard
```
**Bookmark this for quick access!**

---

### 2. 🏠 **From Home Page**
- Click on the **"Workshop Management"** card on your home page
- The dashboard will be the first shortcut displayed

---

### 3. 🔍 **Using Search (Awesome Bar)**
- Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac) to open the search bar
- Type **"Garage Dashboard"** or **"workshop"**
- Click on the result or press Enter

---

### 4. 📋 **From Workspace Sidebar**
- Click on **"Workshop Management"** in the left sidebar
- Click on the **"Garage Dashboard"** card at the top

---

### 5. 💡 **Welcome Alert** (First Time)
- After logging in, you'll see a blue alert notification
- Click the link in the alert to go directly to the dashboard

---

## Dashboard Features

### Quick Action Buttons (Top Banner)
- **+ New Job Card** - Create a new service job
- **📅 New Appointment** - Schedule a service appointment
- **📋 View All Jobs** - See complete job card list

### Main Action Buttons (Top Right)
- **New Job Card** (Primary blue button)
- **📅 New Appointment** icon
- **🚗 New Vehicle** icon
- **View All Jobs** button
- **View Vehicles** button
- **Refresh** button
- **Company** filter dropdown

### KPI Cards
- 🔵 **Jobs In Progress** - Active service jobs
- 🟠 **Ready to Invoice** - Jobs awaiting billing
- 🟢 **Today's Revenue** - Daily earnings
- 🟣 **Vehicles Serviced** - Monthly count

### Charts
- **Revenue Trend** - Last 30 days line chart
- **Job Status Distribution** - Donut chart

### Lists
- **Recent Job Cards** - Last 10 jobs (clickable)
- **Pending Invoices** - Jobs ready for billing
- **Top Services** - Most used services
- **Top Parts** - Most consumed parts
- **Today's Appointments** - Scheduled for today

---

## Dashboard Features Summary

| Feature | Description |
|---------|-------------|
| **Auto-Refresh** | Dashboard updates every 2 minutes |
| **Company Filter** | View data for specific company |
| **Click-to-Navigate** | Click any job/vehicle to view details |
| **Real-Time KPIs** | Live data from your workshop |
| **Responsive Design** | Works on desktop, tablet, and mobile |

---

## Navigation Tips

### From Dashboard to Other Pages:
- **Job Cards List:** Click "View All Jobs" button
- **Create Job Card:** Click "+ New Job Card" (primary button)
- **View Reports:** Menu → View Reports
- **View Invoices:** Menu → View Invoices
- **Vehicle List:** Click "View Vehicles" button

### Keyboard Shortcuts:
- `Ctrl + K` or `Cmd + K` - Open search/awesome bar
- Then type "garage" to find the dashboard

---

## Customization

### Change Dashboard Appearance:
Edit: `apps/workshop_mgmt/workshop_mgmt/workshop_management/page/garage_dashboard/garage_dashboard.js`

### Modify KPIs:
Edit: `apps/workshop_mgmt/workshop_mgmt/workshop_management/page/garage_dashboard/garage_dashboard.py`

---

## Troubleshooting

### Dashboard Not Loading?
1. Clear browser cache (Ctrl + Shift + R)
2. Run: `bench --site [sitename] clear-cache`
3. Restart bench: `bench restart`

### Data Not Showing?
1. Check if you have created Vehicles and Job Cards
2. Ensure Fiscal Year is configured for current year
3. Verify company filter is correct

---

## Support

For issues or feature requests, contact:
- **Email:** info@infoney.com
- **App:** Workshop Management v0.0.1

---

**Happy Workshop Managing! 🔧**



