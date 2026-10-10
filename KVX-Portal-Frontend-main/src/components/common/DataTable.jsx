import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Inbox } from "lucide-react";

const DataTable = ({
  columns,
  data,
  title,
  showSearch = true,
  showFilters = true,
  onRowClick,
  selectable = false,
  onSelectionChange,
  actions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter data based on search
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comparison =
        typeof aVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

  // Reset page when search changes
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Column sorting
  const handleSort = (accessor) => {
    setSortConfig((prev) => {
      if (prev.key === accessor) {
        if (prev.direction === "asc") return { key: accessor, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key: accessor, direction: "asc" };
    });
  };

  // Row selection
  const isAllSelected =
    currentRows.length > 0 && currentRows.every((_, i) => selectedRows.has(indexOfFirstRow + i));

  const toggleSelectAll = () => {
    const newSelection = new Set(selectedRows);
    if (isAllSelected) {
      currentRows.forEach((_, i) => newSelection.delete(indexOfFirstRow + i));
    } else {
      currentRows.forEach((_, i) => newSelection.add(indexOfFirstRow + i));
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(
      Array.from(newSelection).map((i) => sortedData[i])
    );
  };

  const toggleSelectRow = (globalIndex) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(globalIndex)) {
      newSelection.delete(globalIndex);
    } else {
      newSelection.add(globalIndex);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(
      Array.from(newSelection).map((i) => sortedData[i])
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = columns.map((col) => col.header).join(",");
    const rows = sortedData
      .map((row) =>
        columns
          .map((col) => {
            const val = row[col.accessor];
            const str = String(val ?? "");
            return str.includes(",") ? `"${str}"` : str;
          })
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(title || "data").replace(/\s+/g, "_").toLowerCase()}_export.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const SortIcon = ({ accessor }) => {
    if (sortConfig.key !== accessor) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}
            {showFilters && (
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export CSV"
            >
              <Download className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectable && selectedRows.size > 0 && (
          <div className="mt-3 flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2 animate-fadeIn">
            <span className="text-sm text-blue-700 font-medium">
              {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-2">
              {actions?.map((action, i) => (
                <button
                  key={i}
                  onClick={() =>
                    action.onClick(
                      Array.from(selectedRows).map((idx) => sortedData[idx])
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    action.variant === "danger"
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedRows(new Set());
                  onSelectionChange?.([]);
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {sortedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Inbox className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium text-gray-500">No results found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {selectable && (
                  <th className="px-6 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {isAllSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    onClick={() => column.accessor && handleSort(column.accessor)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none group"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.accessor && <SortIcon accessor={column.accessor} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRows.map((row, rowIndex) => {
                const globalIndex = indexOfFirstRow + rowIndex;
                const isSelected = selectedRows.has(globalIndex);
                return (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectRow(globalIndex);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(row[column.accessor], row)
                          : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstRow + 1} to{" "}
              {Math.min(indexOfLastRow, sortedData.length)} of{" "}
              {sortedData.length} entries
            </p>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;