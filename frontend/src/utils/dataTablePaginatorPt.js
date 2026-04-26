/**
 * Pass-through for DataTable `pt.pcPaginator` (unstyled mode).
 * Inline flex layout so paginator controls stay horizontal without relying on global CSS.
 */
export const dataTablePaginatorPt = {
	/** Outer `<nav>` — layout only; horizontal inset is in `style.css` (inner `> .p-paginator`). */
	paginatorContainer: {
		style: {
			width: "100%",
			display: "block",
			boxSizing: "border-box",
		},
	},
	root: {
		style: {
			display: "flex",
			flexFlow: "row nowrap",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "12px",
			minHeight: "3.25rem",
			padding: "0.45rem 0",
			width: "100%",
			minWidth: 0,
			overflowX: "auto",
			boxSizing: "border-box",
		},
	},
	contentStart: {
		style: {
			display: "flex",
			alignItems: "center",
			flexShrink: "0",
		},
	},
	content: {
		style: {
			display: "flex",
			flexFlow: "row nowrap",
			alignItems: "center",
			gap: "8px",
			flex: "1 1 auto",
			minWidth: "0",
			overflowX: "auto",
		},
	},
	contentEnd: {
		style: {
			display: "flex",
			alignItems: "center",
			flexShrink: "0",
		},
	},
	/** Rows-per-page PrimeVue Select */
	pcRowPerPageDropdown: {
		root: {
			style: {
				display: "inline-flex",
				alignItems: "center",
				width: "auto",
				minWidth: "5.5rem",
				border: "1px solid #cbd5e1",
				borderRadius: "10px",
				background: "#ffffff",
				color: "#334155",
				overflow: "hidden",
				minHeight: "2.25rem",
			},
		},
		label: {
			style: {
				background: "#ffffff",
				color: "#334155",
				padding: "0.4rem 0.6rem",
			},
		},
		dropdown: {
			style: {
				background: "#ffffff",
				color: "#334155",
				borderLeft: "1px solid #e2e8f0",
				padding: "0 0.45rem",
			},
		},
		overlay: {
			style: {
				background: "#ffffff",
				border: "1px solid #cbd5e1",
				borderRadius: "10px",
				boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
				padding: "0.25rem",
				marginTop: "0.3rem",
			},
		},
		list: {
			style: {
				background: "#ffffff",
				color: "#334155",
			},
		},
		option: {
			style: {
				background: "#ffffff",
				color: "#334155",
				borderRadius: "8px",
				padding: "0.4rem 0.55rem",
			},
		},
	},
	current: {
		style: {
			whiteSpace: "nowrap",
		},
	},
	first: { style: { display: "inline-flex", alignItems: "center", justifyContent: "center" } },
	prev: { style: { display: "inline-flex", alignItems: "center", justifyContent: "center" } },
	next: { style: { display: "inline-flex", alignItems: "center", justifyContent: "center" } },
	last: { style: { display: "inline-flex", alignItems: "center", justifyContent: "center" } },
	pages: { style: { display: "inline-flex", alignItems: "center", gap: "4px" } },
};
