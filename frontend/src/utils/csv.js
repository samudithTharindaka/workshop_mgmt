/**
 * Download a CSV file (e.g. current filtered table rows).
 * @param {string} filename
 * @param {string[]} headers
 * @param {Array<Array<string|number|null|undefined>>} rows
 */
export function downloadCsv(filename, headers, rows) {
	const esc = (v) => {
		const s = v == null ? "" : String(v);
		if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
		return s;
	};
	const lines = [headers.map(esc).join(",")];
	for (const row of rows) {
		lines.push(row.map(esc).join(","));
	}
	const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
