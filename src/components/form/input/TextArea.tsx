// File: src/components/form/input/TextArea.tsx

'use client'

import React, { forwardRef, useEffect, useState } from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: boolean
  success?: boolean
  helpText?: string
  errorMessage?: string
  hint?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      error,
      success,
      className = '',
      errorMessage,
      helpText,
      hint,
      rows = 3,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasContent, setHasContent] = useState(Boolean(value || defaultValue))

    useEffect(() => {
      setHasContent(Boolean(value || defaultValue))
    }, [value, defaultValue])

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      setHasContent(Boolean(e.target.value))
    }

    const labelShouldFloat = isFocused || hasContent

    let textareaClasses = `peer w-full rounded-md border bg-transparent px-3 pt-4 pb-2 text-sm placeholder-transparent shadow-sm transition duration-300 ease focus:outline-none focus:shadow ${className}`

    if (readOnly && !disabled) {
      textareaClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`
    } else if (error || errorMessage) {
      textareaClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`
    } else if (success) {
      textareaClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`
    } else {
      textareaClasses += ` text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`
    }

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={id}
          name={name}
          rows={rows}
          placeholder=" "
          value={value}
          // defaultValue={!value && defaultValue}
          onChange={(e) => {
            setHasContent(!!e.target.value)
            onChange?.(e)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          className={textareaClasses}
          {...rest}
        />
        {label && (
          <label
            htmlFor={id}
            className={`absolute left-2.5 z-10 cursor-text bg-white px-1 text-sm transition-all 
              ${labelShouldFloat ? '-top-2 text-xs scale-90' : 'top-2.5 scale-100'} 
              ${error || errorMessage ? 'text-error-500' : 'text-gray-500 peer-focus:text-brand-500'} 
              dark:bg-gray-900`}
          >
            {label}
          </label>
        )}
        {errorMessage ? (
          <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        ) : null}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
export default TextArea
