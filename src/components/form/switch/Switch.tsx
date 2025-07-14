//File: src\components\form\switch\Switch.tsx

'use client';
import React, { useEffect, useState } from 'react';

interface SwitchProps {
  id?: string; // ✅ Add this line
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: 'blue' | 'gray';
}


const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
  color = 'blue',
}) => {
  const isControlled = typeof checked === 'boolean';
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const currentChecked = isControlled ? checked : internalChecked;

  useEffect(() => {
    if (isControlled) {
      setInternalChecked(checked!); // Sync internal state if needed
    }
  }, [checked, isControlled]);

  const handleToggle = () => {
    if (disabled) return;
    const newState = !currentChecked;
    if (!isControlled) {
      setInternalChecked(newState);
    }
    if (onChange) {
      onChange(newState);
    }
  };

  const switchColors =
    color === 'blue'
      ? {
          background: currentChecked
            ? 'bg-brand-500'
            : 'bg-gray-200 dark:bg-white/10',
          knob: currentChecked
            ? 'translate-x-full bg-white'
            : 'translate-x-0 bg-white',
        }
      : {
          background: currentChecked
            ? 'bg-gray-800 dark:bg-white/10'
            : 'bg-gray-200 dark:bg-white/10',
          knob: currentChecked
            ? 'translate-x-full bg-white'
            : 'translate-x-0 bg-white',
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-400'
      }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${
            disabled
              ? 'bg-gray-100 pointer-events-none dark:bg-gray-800'
              : switchColors.background
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
