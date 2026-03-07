'use client';

import React from 'react';

interface ToggleSwitchProps {
    label?: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    leftLabel?: string;
    rightLabel?: string;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    label,
    description,
    checked,
    onChange,
    leftLabel,
    rightLabel,
    disabled = false
}) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-theme-secondary">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-3">
                {leftLabel && (
                    <span className={`text-sm ${!checked ? 'font-bold text-theme-primary' : 'text-theme-secondary'}`}>
                        {leftLabel}
                    </span>
                )}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(!checked)}
                    className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background
                        ${checked ? 'bg-primary-500' : 'bg-theme-border'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <span
                        aria-hidden="true"
                        className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                            transition duration-200 ease-in-out
                            ${checked ? 'translate-x-5' : 'translate-x-0'}
                        `}
                    />
                </button>
                {rightLabel && (
                    <span className={`text-sm ${checked ? 'font-bold text-theme-primary' : 'text-theme-secondary'}`}>
                        {rightLabel}
                    </span>
                )}
            </div>
            {description && (
                <p className="text-xs text-theme-secondary italic">{description}</p>
            )}
        </div>
    );
};

export default ToggleSwitch;
