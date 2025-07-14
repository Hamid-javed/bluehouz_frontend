// File: bluehouz_frontend/src/components/form/input/DropdownList.tsx

'use client'

import React from 'react'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownListProps {
  options: DropdownOption[]
  onSelect: (value: DropdownOption) => void
  className?: string
}

const DropdownList: React.FC<DropdownListProps> = ({ options, onSelect, className = '' }) => {
  return (
    <ul
      className={`absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
    >
      {options.map((option) => (
        <li
          key={option.value}
          onClick={() => onSelect(option)}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white/90"
        >
          {option.label}
        </li>
      ))}
    </ul>
  )
}

export default DropdownList
