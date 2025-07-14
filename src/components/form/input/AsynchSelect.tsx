'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FieldConfig } from '@shared/types/fieldConfig'
import { useTranslations } from 'next-intl'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useEntityGetAll } from '@/hooks/useEntityGetAll'

interface AsyncSelectProps {
  name: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  label?: string
  placeholder?: string
  dataSource: FieldConfig['dataSource']
  errorMessage?: string
  disabled?: boolean
  required?: boolean
}

interface Option {
  label: string
  value: string
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({
  name,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  dataSource,
  errorMessage,
  disabled = false,
  required = false,
}) => {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [dropdownHovered, setDropdownHovered] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const minSearchLength = dataSource?.minSearchLength ?? 0

  const { data, loading } = useEntityGetAll<any>(
    dataSource?.entity ?? '',
    dataSource?.staticFilters ?? {},
    false
  )

  const getLabel = (label: string) =>
    label?.includes('.') ? t(label, { default: label }) : label ?? ''

  const options: Option[] = useMemo(() => (
    data?.map((item) => {
      const rawLabel =
        dataSource?.labelTemplate?.replace(/{{(\w+)}}/g, (_: string, key: string) => item[key as keyof typeof item] ?? '') ?? item.name

      const labelKey =
        item.translationKey ??
        item.labelKey ??
        dataSource?.labelKey ??
        rawLabel

      return {
        value: item[dataSource?.valueField ?? 'id'],
        label: labelKey,
      }
    }) ?? []
  ), [data, dataSource])

  const filteredOptions = useMemo(() => {
    const search = inputValue.toLowerCase()
    return options.filter((option) => {
      const translated = getLabel(option.label).toLowerCase()
      return translated.includes(search)
    })
  }, [inputValue, options])

  useEffect(() => {
    const matched = options.find((opt) => opt.value === value)
    const labelResolved = matched && getLabel(matched.label)

    if (value && !inputValue && labelResolved) {
      setInputValue(labelResolved)
    }
  }, [value, options, inputValue])

  useEffect(() => {
    const matched = options.find((opt) => opt.value === value)
    const labelResolved = matched && getLabel(matched.label)

    if (!value || (matched && labelResolved)) return

    const fetchSingle = async () => {
      try {
        const res = await fetch(`/api/entity/${dataSource?.entity}/${value}`)
        if (!res.ok) return
        const item = await res.json()
        const rawLabel = dataSource?.labelTemplate?.replace(/{{(\w+)}}/g, (_: string, key: string) => item[key as keyof typeof item] ?? '') ?? item.name
        const label = item.translationKey ?? item.labelKey ?? dataSource?.labelKey ?? rawLabel
        setInputValue(getLabel(label))
      } catch (_) {
        // silently ignore
      }
    }

    fetchSingle()
  }, [value, options, dataSource])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredOptions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
    } else if (e.key === 'Enter' && activeIndex >= 0 && filteredOptions[activeIndex]) {
      const selected = filteredOptions[activeIndex]
      onChange(selected.value)
      setInputValue(getLabel(selected.label))
      setIsFocused(false)
      setActiveIndex(-1)
    }
  }

  const labelShouldFloat = isFocused || inputValue !== ''

  let inputClasses = `peer w-full rounded-md border bg-transparent px-10 py-2 text-sm shadow-sm transition duration-300 ease focus:outline-none focus:shadow`

  if (disabled) {
    inputClasses += ' text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  } else if (errorMessage) {
    inputClasses += ' text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500'
  } else {
    inputClasses += ' text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800'
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={name}
          className={`absolute left-10 z-10 bg-white dark:bg-gray-900 px-1 text-sm transition-all
            ${labelShouldFloat ? '-top-2 text-xs scale-90' : 'top-2.5 scale-100'}
            ${errorMessage ? 'text-error-500' : 'text-gray-500 peer-focus:text-brand-500'}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <div className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          value={inputValue}
          placeholder=" "
          disabled={disabled}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!dropdownHovered) setIsFocused(false)
          }}
          onChange={(e) => {
            const val = e.target.value
            setInputValue(val)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {loading && <div className="text-xs text-gray-500 mt-1">Lade...</div>}

      {inputValue.length < minSearchLength && isFocused && (
        <div className="text-xs text-gray-400 mt-1">
          {t('common.minSearchLengthNotice', { count: minSearchLength })}
        </div>
      )}

      {inputValue.length >= minSearchLength && filteredOptions.length > 0 && isFocused && (
        <ul
          className="absolute z-50 top-full left-0 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-b-md shadow max-h-60 overflow-auto text-sm"
          onMouseEnter={() => setDropdownHovered(true)}
          onMouseLeave={() => setDropdownHovered(false)}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              onMouseDown={() => {
                onChange(option.value)
                setInputValue(getLabel(option.label))
                setIsFocused(false)
              }}
              className={`px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white/90 ${
                index === activeIndex ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              {getLabel(option.label)}
            </li>
          ))}
        </ul>
      )}

      {errorMessage && (
        <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
      )}
    </div>
  )
}

export default AsyncSelect
