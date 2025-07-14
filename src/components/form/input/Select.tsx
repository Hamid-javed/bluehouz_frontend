// File: src/components/form/input/Select.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  options: Option[]
  label?: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
  defaultValue?: string
  name: string
  value?: string
  id?: string
  disabled?: boolean
  error?: boolean
  success?: boolean
  errorMessage?: string
  required?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  label,
  placeholder = 'Select an option',
  onChange,
  className = '',
  defaultValue = '',
  name,
  value,
  id,
  disabled = false,
  error = true,
  success = false,
  errorMessage,
  required = false,
}) => {
  const t = useTranslations()
  const isControlled = value !== undefined
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue)
  const [isFocused, setIsFocused] = useState(false)

  const effectiveValue = isControlled ? value : selectedValue
  const hasContent = effectiveValue !== ''
  const labelShouldFloat = isFocused || hasContent

  useEffect(() => {
    if (!isControlled) {
      setSelectedValue(defaultValue)
    }
  }, [defaultValue, isControlled])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    if (!isControlled) {
      setSelectedValue(newValue)
    }
    onChange(newValue)
  }

  let selectClasses = `peer w-full rounded-md border bg-transparent px-3 py-2 text-sm appearance-none pr-8 shadow-sm transition duration-300 ease focus:outline-none focus:shadow ${className}`

  if (disabled) {
    selectClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`
  } else if (error || errorMessage) {
    selectClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`
  } else if (success) {
    selectClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`
  } else {
    selectClasses += ` text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`
  }

  console.log(options, 'options')

  return (
    <div className="relative w-full">
      <select
        name={name}
        id={id}
        value={effectiveValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={selectClasses}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="dark:bg-gray-900 dark:text-white/90"
          >
            {option.label}
          </option>
        ))}
      </select>

      {label && (
        <label
          className={`absolute left-2.5 z-10 bg-white dark:bg-gray-900 px-1 text-sm transition-all 
          ${labelShouldFloat ? '-top-2 text-xs scale-90' : 'top-2.5 scale-100'}
          ${error || errorMessage ? 'text-error-500' : 'text-gray-500 peer-focus:text-brand-500'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {errorMessage && (
        <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
      )}
    </div>
  )
}

export default Select