// File: bluehouz_frontend\src\components\form\input\InputField.tsx

'use client'

import React, { forwardRef, useState, useEffect } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  success?: boolean
  errorMessage?: string
  helpText?: string
  onHistoryClick?: () => void
  required?: boolean
  supportingText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      id,
      name,
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      disabled,
      readOnly,
      error,
      success,
      className = '',
      errorMessage,
      helpText,
      onHistoryClick,
      defaultValue,
      required,
      supportingText,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasContent, setHasContent] = useState(() => Boolean(value))

    useEffect(() => {
      setHasContent(Boolean(value))
    }, [value])

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasContent(Boolean(e.target.value))
      onBlur?.(e)
    }

    const handleFocus = () => setIsFocused(true)

    const labelShouldFloat = isFocused || hasContent

    let inputClasses = `peer w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition duration-300 ease focus:outline-none focus:shadow ${className}`

    if (readOnly && !disabled) {
      inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`
    } else if (error || errorMessage) {
      inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`
    } else if (success) {
      inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`
    } else {
      inputClasses += ` text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`
    }

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder ?? ' '}
          onChange={(e) => {
            setHasContent(!!e.target.value)
            onChange?.(e)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          required={required}
          {...(value !== undefined
            ? { value }
            : { defaultValue })}
          {...rest}
        />
        {label && (
          <label
            htmlFor={id}
            className={`absolute left-2.5 z-10 flex items-center space-x-1 bg-white px-1 text-sm transition-all
              ${labelShouldFloat ? '-top-2 text-xs scale-90' : 'top-2.5 scale-100'}
              ${error || errorMessage ? 'text-error-500' : 'text-gray-500 peer-focus:text-brand-500'}
              dark:bg-gray-900`}
          >
            <span>{label}</span>
            {required && <span className="text-error-500">*</span>}
            {onHistoryClick && (
              <button
                type="button"
                onClick={onHistoryClick}
                className="text-gray-400 hover:text-brand-500 focus:outline-none"
                aria-label="View history"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </label>
        )}
        {supportingText && !errorMessage && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{supportingText}</p>
        )}
        {errorMessage && (
          <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
