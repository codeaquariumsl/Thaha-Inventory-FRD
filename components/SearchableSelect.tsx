'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    sublabel?: string;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    required = false,
    disabled = false,
    className = '',
    id,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpen = () => {
        if (disabled) return;
        setIsOpen(true);
        setSearchTerm('');
    };

    const handleSelect = useCallback((optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    }, [onChange]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
        setSearchTerm('');
    };

    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            id={id}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between gap-2
                    px-4 py-3 rounded-lg text-left
                    border transition-all duration-200
                    ${disabled
                        ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10'
                        : 'cursor-pointer hover:border-primary-500/60'
                    }
                    ${isOpen
                        ? 'border-primary-500 ring-2 ring-primary-500/30 bg-[#1a1f35]'
                        : 'border-white/10 bg-[#1a1f35]'
                    }
                    [data-theme="light"]:bg-white
                    [data-theme="light"]:border-slate-300
                `}
                style={{
                    backgroundColor: 'var(--ss-bg, #1a1f35)',
                    borderColor: isOpen ? undefined : 'rgba(255,255,255,0.1)',
                    color: 'var(--ss-text, #ffffff)',
                }}
            >
                <span className={`flex-1 truncate text-sm ${!selectedOption ? 'opacity-50' : ''}`}>
                    {selectedOption ? (
                        <span>
                            {selectedOption.label}
                            {selectedOption.sublabel && (
                                <span className="text-xs opacity-60 ml-1">— {selectedOption.sublabel}</span>
                            )}
                        </span>
                    ) : (
                        placeholder
                    )}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                    {value && !disabled && (
                        <span
                            role="button"
                            onClick={handleClear}
                            className="p-0.5 rounded hover:opacity-70 transition-opacity"
                            title="Clear"
                        >
                            <X className="w-3.5 h-3.5 opacity-50" />
                        </span>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </span>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 rounded-lg shadow-2xl border overflow-hidden animate-scale-in"
                    style={{
                        backgroundColor: '#1a1f35',
                        borderColor: 'rgba(255,255,255,0.15)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Search Input */}
                    <div className="p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <Search className="w-4 h-4 shrink-0 opacity-50" style={{ color: '#ffffff' }} />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type to search..."
                                className="flex-1 bg-transparent text-sm outline-none placeholder-white/30"
                                style={{ color: '#ffffff' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="opacity-50 hover:opacity-100">
                                    <X className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-52 overflow-y-auto">
                        {/* Placeholder option */}
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150"
                            style={{
                                color: 'rgba(255,255,255,0.4)',
                                backgroundColor: value === '' ? 'rgba(14,165,233,0.1)' : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === '' ? 'rgba(14,165,233,0.1)' : 'transparent')}
                        >
                            {placeholder}
                        </button>

                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-center opacity-50" style={{ color: '#ffffff' }}>
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150"
                                    style={{
                                        color: '#ffffff',
                                        backgroundColor: option.value === value ? 'rgba(14,165,233,0.15)' : 'transparent',
                                        borderLeft: option.value === value ? '2px solid #0ea5e9' : '2px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        if (option.value !== value) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = option.value === value ? 'rgba(14,165,233,0.15)' : 'transparent';
                                    }}
                                >
                                    <div className="font-medium leading-tight">{option.label}</div>
                                    {option.sublabel && (
                                        <div className="text-xs opacity-50 mt-0.5 truncate">{option.sublabel}</div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Hidden native select for form validation */}
            {required && (
                <select
                    required={required}
                    value={value}
                    onChange={() => { }}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 w-full opacity-0 pointer-events-none"
                >
                    <option value="">‎</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
        </div>
    );
}
