import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  disabled?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: DataTableAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder,
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  className,
  loading = false,
  emptyMessage
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = (Array.isArray(data) ? data : []).filter((row) =>
        columns.some((column) => {
          if (!column.filterable) return false;
          const value = row[column.key as keyof T];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil((Array.isArray(processedData) ? processedData.length : 0) / pageSize);
  const paginatedData = pagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return;

    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleSelectRow = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedData = Array.from(newSelection).map(i => paginatedData[i]);
      onSelectionChange(selectedData);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === (Array.isArray(paginatedData) ? paginatedData.length : 0)) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIndices = new Set((Array.isArray(paginatedData) ? paginatedData : []).map((_, index) => index));
      setSelectedRows(allIndices);
      onSelectionChange?.(paginatedData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Search and filters */}
      {searchable && (
        <div className="mb-4 flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder || t('general.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
              aria-label="Search table data"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            {t('general.filter')}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === (Array.isArray(paginatedData) ? paginatedData.length : 0) && (Array.isArray(paginatedData) ? paginatedData.length : 0) > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {(Array.isArray(columns) ? columns : []).map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                    column.width
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "w-3 h-3",
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? "text-gray-900"
                              : "text-gray-400"
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            "w-3 h-3 -mt-1",
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? "text-gray-900"
                              : "text-gray-400"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (Array.isArray(actions) ? actions.length : 0) > 0 && (
                <th className="w-20 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('general.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(paginatedData) ? paginatedData.length : 0) === 0 ? (
              <tr>
                <td 
                  colSpan={(Array.isArray(columns) ? columns.length : 0) + (selectable ? 1 : 0) + (actions?.length ? 1 : 0)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage || t('general.noDataFound')}
                </td>
              </tr>
            ) : (
              (Array.isArray(paginatedData) ? paginatedData : []).map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="rounded border-gray-300"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}
                  {(Array.isArray(columns) ? columns : []).map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-900">
                      {column.render 
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                  {actions && (Array.isArray(actions) ? actions.length : 0) > 0 && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {(Array.isArray(actions) ? actions : []).map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                            size="sm"
                            onClick={() => action.onClick(row)}
                            disabled={action.disabled?.(row)}
                            className="p-1"
                            aria-label={action.label}
                          >
                            {action.icon || <MoreHorizontal className="w-4 h-4" />}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('general.showing')} {(currentPage - 1) * pageSize + 1} {t('general.to')}{' '}
            {Math.min(currentPage * pageSize, (Array.isArray(processedData) ? processedData.length : 0))} {t('general.of')}{' '}
            {(Array.isArray(processedData) ? processedData.length : 0)} {t('general.results')}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('general.previous')}
            </Button>
            <span className="text-sm text-gray-700">
              {t('general.page')} {currentPage} {t('general.of')} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('general.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add default export for compatibility
export default DataTable;