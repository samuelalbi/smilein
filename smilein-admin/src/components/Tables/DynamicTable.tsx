import { useState, useMemo } from 'react';
import { TableProps } from '../../types/table';

interface PaginatedTableProps extends TableProps {
    itemsPerPage?: number;
    searchable?: boolean;
    filterable?: boolean;
    disableBuiltInFilter?: boolean; // New prop to disable built-in filtering
    searchFields?: string[];
    onPreview?: (item: any) => void;
    renderActions?: (row: any) => React.ReactNode;
}

interface FilterConfig {
    field: string;
    value: string;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const DynamicTable = ({
    columns,
    data,
    className = '',
    onEdit,
    onDelete,
    onPreview,
    renderActions,
    itemsPerPage = 10,
    searchable = true,
    filterable = true,
    disableBuiltInFilter = false,
    searchFields
}: PaginatedTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterConfig[]>([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterConfig[]>([]);

    // Filter and search data
    const filteredData = useMemo(() => {
        let result = [...data];

        // Only apply built-in filters if not disabled
        if (!disableBuiltInFilter) {
            // Apply filters
            if (filters.length > 0) {
                result = result.filter(item =>
                    filters.every(filter =>
                        String(item[filter.field])
                            .toLowerCase()
                            .includes(filter.value.toLowerCase())
                    )
                );
            }
        }

        // Apply search
        if (searchTerm) {
            const fieldsToSearch = searchFields || columns.map(col => col.accessor);
            result = result.filter(item =>
                fieldsToSearch.some(field =>
                    String(item[field])
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
            );
        }

        return result;
    }, [data, searchTerm, filters, disableBuiltInFilter]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Get current page data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Handle temporary filter change
    const handleTempFilterChange = (field: string, value: string) => {
        setTempFilters(prev => {
            const existing = prev.findIndex(f => f.field === field);
            if (existing !== -1) {
                if (!value) {
                    return prev.filter(f => f.field !== field);
                }
                const newFilters = [...prev];
                newFilters[existing] = { field, value };
                return newFilters;
            }
            if (!value) return prev;
            return [...prev, { field, value }];
        });
    };

    // Apply filters
    const applyFilters = () => {
        setFilters(tempFilters);
        setIsFilterMenuOpen(false);
        setCurrentPage(1);
    };

    // Reset filters
    const resetFilters = () => {
        setTempFilters([]);
        setFilters([]);
        setCurrentPage(1);
        setIsFilterMenuOpen(false);
    };

    // Change page
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Generate page numbers array
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (totalPages - endPage < Math.floor(maxVisiblePages / 2)) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const tableColumns = [
        ...columns,
        ...(onEdit || onDelete || onPreview || renderActions ? [{
            header: 'Aksi',
            accessor: 'actions',
            minWidth: '150px',
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    {renderActions && renderActions(item)}
                    {!renderActions && (
                        <>
                            {onPreview && (
                                <button
                                    onClick={() => onPreview(item)}
                                    className="flex items-center justify-center rounded-md bg-primary py-2 px-4 text-white hover:bg-opacity-90"
                                >
                                    Preview
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className="flex items-center justify-center rounded-md bg-amber-500 primary py-2 px-4 text-white hover:bg-opacity-90"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(item)}
                                    className="flex items-center justify-center rounded-md bg-danger py-2 px-4 text-white hover:bg-opacity-90"
                                >
                                    Delete
                                </button>
                            )}
                        </>
                    )}
                </div>
            ),
        }] : []),
    ];

    return (
        <div className={`rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ${className}`}>
            <div className="mb-4 flex flex-col sm:flex-row justify-end gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {searchable && (
                        <div className="w-full sm:w-72 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
                            />
                        </div>
                    )}

                    {filterable && !disableBuiltInFilter && (
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    setIsFilterMenuOpen(!isFilterMenuOpen);
                                    setTempFilters(filters);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-stroke bg-transparent px-4 py-2 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
                            >
                                <FilterIcon />
                                <span>Filter</span>
                            </button>

                            {isFilterMenuOpen && (
                                <div className="absolute right-0 mt-2 w-full sm:w-72 rounded-lg border border-stroke bg-white p-4 shadow-lg dark:border-strokedark dark:bg-boxdark z-50">
                                    <div className="space-y-4">
                                        {columns
                                            .filter(col => col.accessor !== 'actions')
                                            .map(column => (
                                                <div key={column.accessor}>
                                                    <label className="block text-sm font-medium mb-1">
                                                        {column.header}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Filter ${column.header}`}
                                                        value={tempFilters.find(f => f.field === column.accessor)?.value || ''}
                                                        onChange={(e) => handleTempFilterChange(column.accessor, e.target.value)}
                                                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm outline-none focus:border-primary dark:border-strokedark"
                                                    />
                                                </div>
                                            ))}
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                onClick={resetFilters}
                                                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={applyFilters}
                                                className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rest of the table code remains the same */}
            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            {tableColumns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`py-4 px-4 font-medium text-black dark:text-white ${column.minWidth ? `min-w-[${column.minWidth}]` : ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, rowIndex) => (
                            <tr key={rowIndex}>
                                {tableColumns.map((column, colIndex) => (
                                    <td
                                        key={`${rowIndex}-${colIndex}`}
                                        className="border-b border-[#eee] py-5 px-4 dark:border-strokedark"
                                    >
                                        {column.cell ? (
                                            column.cell(item)
                                        ) : (
                                            <span className="text-black dark:text-white">
                                                {item[column.accessor]}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stroke py-4 px-4 dark:border-strokedark">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center rounded-md p-2 ${currentPage === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-meta-4'
                                }`}
                            aria-label="Previous page"
                        >
                            <ChevronLeftIcon />
                        </button>

                        {getPageNumbers().map((number) => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`px-3 py-1 rounded-md ${currentPage === number
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-meta-4'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center rounded-md p-2 ${currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-meta-4'
                                }`}
                            aria-label="Next page"
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicTable;