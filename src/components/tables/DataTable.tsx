//File: bluehouz_frontend\src\components\tables\DataTable.tsx

'use client';

import React, { useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { LuFilterX } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { GoXCircle } from "react-icons/go";
import { FiXCircle } from "react-icons/fi";
import { Plus, Pencil, Trash, Filter } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Papa from 'papaparse';

import Input from '../form/input/InputField';
import Checkbox from '../form/input/Checkbox';
import { useRouter } from "next/navigation";
import { useFormatter, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthProvider';
import { useEnumOptions } from '@/hooks/useEnumOptions';

function DateFilter({
  fromDate,
  toDate,
  setFromDate,
  setToDate
}: {
  fromDate: string;
  toDate: string;
  setFromDate: (val: string) => void;
  setToDate: (val: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm text-gray-600 dark:text-gray-300">From:</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="border px-2 py-1 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      <label className="text-sm text-gray-600 dark:text-gray-300">To:</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="border px-2 py-1 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
    </div>
  );
}

type FilterOperation = 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty';

type ColumnFilters = {
  [columnId: string]: {
    value: string;
    operation: FilterOperation;
  };
};

type DataTableProps<TData> = {
  data: TData[];
  columns?: ColumnDef<TData, any>[];
  selectedRows?: ColumnDef<TData, any>[];
  loadMore?: () => Promise<TData[]>;
  onEdit?: (row: TData) => void;
  setConfigModal?: (v: boolean) => void;
  onDelete: (row: TData) => void;
  onImport?: (rows: TData[]) => void;
  renderCreateModal?: (open: boolean, setOpen: (v: boolean) => void,) => React.ReactNode
  renderEditModal?: (isOpen: boolean, setIsOpen: (v: boolean) => void) => React.ReactNode;
  renderImportModal?: (isOpen: boolean, setIsOpen: (v: boolean) => void) => React.ReactNode;
  fieldConfig?: any;
  height?: string;
  entity?: string;
  loading?: boolean;
  updating?: boolean;
  deleting?: boolean;
  iscreatModal?: boolean;
  iseditModal?: boolean;
  isredirectEdit?: boolean;
  isredirectCreate?: boolean;
  isImportModal?: boolean;
  isAllBtns?: boolean;
};

export function DataTable<TData extends Record<string, any>>({
  data,
  columns,
  loadMore,
  onEdit,
  onDelete,
  renderCreateModal,
  renderEditModal,
  renderImportModal,
  fieldConfig,
  setConfigModal,
  height = '600px',
  loading,
  updating,
  deleting,
  entity,
  iscreatModal = true,
  iseditModal = false,
  isredirectEdit = false,
  isredirectCreate = false,
  isImportModal = false,
  isAllBtns = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalData, setInternalData] = React.useState<TData[]>(data);
  // *** uncomment this when want to update the original data instead of dummy/default
  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    (columns ?? [])
      .filter((col): col is { accessorKey: string } => 'accessorKey' in col && typeof col.accessorKey === 'string')
      .map((col) => col.accessorKey)
  );

  useEffect(() => {
    if (!columns) return;
    const newOrder = columns
      .filter((col): col is { accessorKey: string } => 'accessorKey' in col && typeof col.accessorKey === 'string')
      .map((col) => col.accessorKey);
    setColumnOrder(newOrder);
  }, [columns]);

  const { fetchEntityLoading, rowPendingDelete, setRowPendingDelete } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [stableLoading, setStableLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [isDeleteSelect, setIsDeleteSelect] = React.useState<string[]>([]);
  const [showImport, setshowImport] = React.useState(false);
  const [isFilters, setIsFilters] = React.useState(false);
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<Partial<TData>>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFilters>({});
  const router = useRouter();
  const stableLoadingTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const { dateTime } = useFormatter();
  const { options: genderOptions } = useEnumOptions('gender');

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const table = useReactTable({
    data: internalData,
    columns: columns ?? [],
    state: { sorting, columnOrder },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnOrderChange: setColumnOrder,
  });


  let lastScrollTop = 0;

  const handleScroll = async () => {
    const el = scrollRef.current;
    if (!el || isLoading) return;

    const currentScrollTop = el.scrollTop;

    // Only proceed if vertical scroll changed
    if (currentScrollTop === lastScrollTop) return;
    lastScrollTop = currentScrollTop;

    const nearBottom = currentScrollTop + el.clientHeight >= el.scrollHeight - 100;

    if (nearBottom && loadMore) {
      setIsLoading(true);
      const more = await loadMore();
      setInternalData((prev) => [...prev, ...more]);
      setIsLoading(false);
    }
  };


  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    return () => {
      el?.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumnOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);

      const newOrder = [...prev];
      newOrder.splice(oldIndex, 1);
      const adjustedIndex = oldIndex < newIndex ? newIndex : newIndex;
      newOrder.splice(adjustedIndex, 0, active.id);

      return newOrder;
    });

  };

  const handleExport = () => {
    const csv = Papa.unparse(internalData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (row: TData) => {
    if (iseditModal && onEdit) {
      onEdit(row)
    } else {
      setEditingRowId(row.id);
      setEditValues(row);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditValues({});
  };

  const handleSaveEdit = () => {
    if (editingRowId && onEdit) {
      onEdit(editValues as TData);
      setEditingRowId(null);
      setEditValues({});
    }
  };

  const handleInputChange = (field: keyof TData, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterOperationChange = (columnId: string, operation: FilterOperation) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: {
        value: prev[columnId]?.value || '',
        operation
      }
    }));
  };

  const handleFilterValueChange = (columnId: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: {
        value,
        operation: prev[columnId]?.operation || 'equals'
      }
    }));
  };
  const filteredRows = table.getRowModel().rows.filter((row) => {
    const createdDateColumn = row.original['createdAt'];
    const birthDateColumn = row.original['dateOfBirth'];
    const dateVal = createdDateColumn ? new Date(createdDateColumn) : null;
    const birthDateVal = birthDateColumn ? new Date(birthDateColumn) : null;
    const fromBirth = fromDate ? new Date(fromDate) : null;
    const toBirth = toDate ? new Date(toDate) : null;

    const matchesBirthDate = (!fromBirth || (birthDateVal && birthDateVal >= fromBirth)) && (!toBirth || (birthDateVal && birthDateVal <= toBirth));

    const matchesColumnFilters = Object.entries(columnFilters).every(([columnId, filter]) => {
      let cellValue
      console.log(columnId,"columId")
      if (columnId === 'name') {
        const firstName = row.original?.firstName || ''
        const lastName = row.original?.lastName || ''
        cellValue = `${firstName} ${lastName}`.trim();
      }else if (columnId === 'address'){
        const addressLine = row.original?.addressLine1 || ''
        const state = row.original?.state || ''
        const country = row.original?.country || ''
        cellValue = `${addressLine}, ${state}, ${country} `.trim();
      } else if (columnId.includes('.')) {
        const Entity = columnId?.split('.')[0];
        const key = columnId?.split('.').pop();
        cellValue = row.original?.[Entity]?.[key!];
      } else {
        cellValue = row.original?.[columnId];
      }


      const filterValue = filter.value.toLowerCase();
      if (
        ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'].includes(filter.operation) &&
        filterValue.trim() === ''
      ) {
        return true; // don't filter if no input
      }
      switch (filter.operation) {
        case 'equals':
          return cellValue?.toString()?.toLowerCase().includes(filterValue.toLowerCase());
        case 'notEquals':
          return !cellValue?.toString()?.toLowerCase().includes(filterValue.toLowerCase());
        case 'isEmpty':
          return cellValue === '' || cellValue == null;
        case 'isNotEmpty':
          return cellValue !== '' && cellValue != null;
        default:
          return true;
      }
    });

    const matchesSearch = row.getVisibleCells().some((cell) =>
      String(cell.getValue()).toLowerCase().includes(search.toLowerCase())
    );
    return matchesBirthDate && matchesColumnFilters && matchesSearch;
  });

  const handleDelete = () => {
    const selectedRowData = table.getRowModel().rows
      .filter(row => isDeleteSelect.includes(row.id))
      .map(row => row.original);
    selectedRowData.forEach((data) => onDelete(data))
    setIsDeleteSelect([])
  }

  useEffect(() => {
    setStableLoading(loading || fetchEntityLoading);
  }, [loading, fetchEntityLoading]);

  return (
    <div>
      {iscreatModal && renderCreateModal && renderCreateModal(showCreate, setShowCreate)}
      {iseditModal && renderEditModal && renderEditModal(showEdit, setShowEdit)}
      {isImportModal && renderImportModal && renderImportModal(showImport, setshowImport)}
      <div className="flex items-center flex-wrap gap-2 justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-60 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <div className="flex flex-wrap gap-2">
          {isAllBtns && <button
            value={`${isFilters ? "Hide Filters" : 'Show Filters'}`}
            onClick={() => setIsFilters(prev => !prev)}
            className="px-3 flex gap-1 items-center py-2 text-sm bg-gray-200 hover:bg-gray-300 text-black rounded-md md:px-4 md:text-base"
          >
            <div>{isFilters ? <LuFilterX className="w-4 h-4" /> : <Filter className="w-4 h-4" />}</div>
            <div>{isFilters ? "Filters" : "Filters"}</div>
          </button>}
          {iscreatModal && <button
            onClick={() => {
              if (isredirectCreate) {
                return router.push(`/${entity}/new`);
              }
              setShowCreate(true)
            }
            }
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md md:px-4 md:text-base hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>}
          {isAllBtns && <button
            onClick={() => setConfigModal?.(true)}
            className="px-4 py-2 border border-brand-500 text-brand-500 rounded hover:bg-brand-50"
          >
            ⚙️ Configure
          </button>}
          {isDeleteSelect.length > 0 ? <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-500 text-white rounded-md md:px-4 md:text-base hover:bg-red-600"
          >
            <Trash className="w-4 h-4 inline" /> <h3>Delete {isDeleteSelect.length} {isDeleteSelect.length <= 1 ? 'item' : "items"}</h3>
          </button> : isAllBtns ? <><button
            onClick={handleExport}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md md:px-4 md:text-base hover:bg-green-700"
          >
            Export CSV
          </button>
            <button
              onClick={() => setshowImport(true)}
              className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-md cursor-pointer md:px-4 md:text-base hover:bg-yellow-600"
            >
              Import CSV
            </button></> : <button
              onClick={() => { router.push("documentTemplate/create") }}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md md:px-4 md:text-base hover:bg-green-700"
            >
            + Add Document Template
          </button>}
        </div>
      </div>

      {isFilters && <>
        <div className="mb-4 overflow-x-auto">
          <div className="flex  gap-4 py-2">
            {table.getHeaderGroups()[0].headers.map((header) => {
              const accessor = header.column.id.replace(/_/g, '.');
              const type = fieldConfig?.find((f: any) => f.name === accessor)?.valueType
              const isDate = accessor === 'dateOfBirth';
              return (
                <div key={header.id} className="flex flex-col min-w-fit">
                  <div className="text-sm font-medium mb-1 truncate">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                  <div className="flex flex-col gap-1">
                    {isDate ? (
                      <div className="w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:shadow">
                        <DateFilter
                          fromDate={fromDate}
                          toDate={toDate}
                          setFromDate={setFromDate}
                          setToDate={setToDate}
                        />
                      </div>
                    ) : (
                      <Input
                        type={type}
                        placeholder={`Filter ${accessor}...`}
                        value={columnFilters[accessor]?.value || ''}
                        onChange={(e) => handleFilterValueChange(accessor, e.target.value)}
                        className="text-sm w-full"
                      />
                    )}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <button
                        onClick={() => handleFilterOperationChange(accessor, 'equals')}
                        className={`p-1 rounded ${columnFilters[accessor]?.operation === 'equals'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
                          }`}
                        title="Equals"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFilterOperationChange(accessor, 'notEquals')}
                        className={`p-1 rounded ${columnFilters[accessor]?.operation === 'notEquals'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
                          }`}
                        title="Not Equals"
                      >
                        <FiXCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFilterOperationChange(accessor, 'isEmpty')}
                        className={`p-1 rounded ${columnFilters[accessor]?.operation === 'isEmpty'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
                          }`}
                        title="Is Empty"
                      >
                        <LuFilterX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFilterOperationChange(accessor, 'isNotEmpty')}
                        className={`p-1 rounded ${columnFilters[accessor]?.operation === 'isNotEmpty'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
                          }`}
                        title="Is Not Empty"
                      >
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div></>}

      <div ref={scrollRef} style={{ height }} className="overflow-auto rounded-lg shadow">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {stableLoading ? <div className="p-4 text-center">Loading...</div> :
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} >
                    <th className="pl-4">
                      <Checkbox
                        checked={
                          isDeleteSelect.length === table.getRowModel().rows.length &&
                          isDeleteSelect.length > 0
                        }
                        onChange={(checked) => {
                          if (checked) {
                            // Select all visible rows
                            const allIds = table.getRowModel().rows.map((row) => row.id);
                            setIsDeleteSelect(allIds);
                          } else {
                            // Deselect all
                            setIsDeleteSelect([]);
                          }
                        }}
                      />
                    </th>
                    <SortableContext
                      items={columnOrder}
                      strategy={rectSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        return (
                          <SortableHeader
                            key={header.id}
                            header={header}
                            canSort={canSort}
                          />
                        );
                      })}
                    </SortableContext>
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columnOrder.length + 2} className="text-center py-8 text-gray-500">
                      No Data found
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td className="pl-4">
                        <Checkbox
                          checked={isDeleteSelect.includes(row.id)}
                          onChange={(checked) => {
                            setIsDeleteSelect((prev) =>
                              checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
                            );
                          }}
                        />
                      </td>

        {row.getVisibleCells().map((cell) => {
          const columnId = cell.column.id.replace(/_/g, '.');
          const isnested = cell.column.id.includes('_')
          const Entity = columnId?.split('.')[0];
          const key = columnId?.split('.').pop();
          const value = isnested ? row.original?.[Entity]?.[key!] ||'' : row.original[columnId] || '';
          const isgender = ['genderId'].includes(columnId)
          const genderLabel = genderOptions.find(opt => opt.value === value)?.label || value;
          const valueType = (cell.column.columnDef.meta as any)?.valueType;
          const isDateField = ['createdAt', 'dateOfBirth'].includes(columnId);
          const accessor = cell.column.columnDef?.accessorKey
          const date = accessor === 'dateOfBirth' || accessor === 'createdAt' || accessor === 'updatedAt' || accessor === 'yearBuild' ;
          const number = accessor === 'postalCode' || accessor === 'phone' || accessor === 'yearOfConstruction' || accessor === 'renewalFund';   
          
          return (
            <td
              key={cell.id}
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
            >
              {editingRowId === row.original.id ? (
                valueType === 'boolean' ? (
                  <Checkbox
                    checked={!!editValues[columnId]}
                    onChange={(checked) =>
                      handleInputChange(columnId as keyof TData, checked)
                    }
                  />
                ) : (
                  <Input
                    disabled={isnested || accessor === "organizationId" || accessor === "id" || accessor === "yearOfConstruction"}
                    type={number ? 'number' : date ? 'date' : 'text'}
                    value={isnested ? editValues?.[Entity]?.[key!] || ''  : editValues[columnId] || ''}
                    onChange={(e) =>
                      handleInputChange(columnId as keyof TData, e.target.value)
                    }
                    className="border px-2 py-1 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                )
              ) : isDateField && value ? (
                dateTime(new Date(value), { dateStyle: 'medium' })
              ) : valueType === 'boolean' ? (
                <Checkbox checked={!!value} disabled />
              ) : isgender ? genderLabel :(
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </td>
          );
        })}

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingRowId === row.original.id ? (
                          <>
                            <button onClick={handleSaveEdit} className="text-green-600 hover:underline mr-2">
                              Save
                            </button>
                            <button onClick={handleCancelEdit} className="text-gray-600 hover:underline">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              disabled={updating || deleting}
                              onClick={() => {
                                if (iseditModal) {
                                  setShowEdit(true);
                                } else if (isredirectEdit) {
                                  router.push(`/${entity}/${row.original.id}`);
                                } else {
                                  handleEditClick(row.original);
                                }
                              }}
                              className={`hover:underline mr-2 ${updating || deleting ? 'text-blue-300' : 'text-blue-600'}`}
                            >
                              <Pencil className="w-4 h-4 inline" />
                            </button>
                            <button
                              disabled={deleting || updating}
                              onClick={() => setRowPendingDelete(row.original)}
                              className={`hover:underline ${deleting || updating ? 'text-red-300' : 'text-red-600'}`}
                            >
                              <Trash className="w-4 h-4 inline" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>}
        </DndContext>
        {isLoading && <div className="p-4 text-center">Loading...</div>}
      </div>
      {rowPendingDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Are you sure you want to delete this item?</p>
            <div className="flex gap-2 mt-4 justify-between">
            <button
                disabled={deleting || updating}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  onDelete(rowPendingDelete);
                }}
              >
                Yes, Delete
              </button>
              <button
                disabled={deleting || updating}
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setRowPendingDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableHeader({ header, canSort }: { header: any; canSort: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f0f0' : undefined,
    cursor: 'pointer',
  };

  return (
    <th
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={(e) => {
        e.stopPropagation(); // Just in case
        const handler = header.column.getToggleSortingHandler();
        if (handler) handler(e);
      }}
      style={style}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${canSort ? 'cursor-pointer select-none' : ''}`}
      >
      <div className="flex items-center gap-1">
        {flexRender(header.column.columnDef.header, header.getContext())}
        {header.column.getIsSorted() === 'asc' && <FaArrowUp className="w-3 h-3" />}
        {header.column.getIsSorted() === 'desc' && <FaArrowDown className="w-3 h-3" />}
      </div>
    </th>
  );
}