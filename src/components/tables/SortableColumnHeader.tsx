// components/tables/SortableColumnHeader.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

export const SortableColumnHeader = ({ header, table }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: header.column.id,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      <div className="flex items-center justify-between">
        {flexRender(header.column.columnDef.header, header.getContext())}
        <button {...listeners} className="cursor-grab" title="Drag to reorder">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </th>
  );
};
