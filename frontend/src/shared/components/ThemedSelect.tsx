import type React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ThemedSelectOption<TValue extends string = string> {
    value: TValue;
    label: string;
    icon?: React.ElementType;
    disabled?: boolean;
}

export interface ThemedSelectProps<TValue extends string = string> {
    value: TValue;
    onValueChange: (value: TValue) => void;
    options: readonly ThemedSelectOption<TValue>[];
    placeholder?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    triggerClassName?: string;
    contentClassName?: string;
    id?: string;
    ariaLabel?: string;
    align?: 'start' | 'center' | 'end';
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
    sm: 'h-8 text-xs px-2',
    md: '',
};

export const ThemedSelect = <TValue extends string = string>({
    value,
    onValueChange,
    options,
    placeholder,
    disabled,
    size = 'md',
    triggerClassName,
    contentClassName,
    id,
    ariaLabel,
    align = 'start',
}: ThemedSelectProps<TValue>): React.ReactElement => {
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v as TValue)}
            disabled={disabled}
        >
            <SelectTrigger
                id={id}
                aria-label={ariaLabel}
                className={cn(
                    'bg-layer-1 border-subtle text-primary',
                    SIZE_CLASSES[size],
                    triggerClassName,
                )}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
                align={align}
                className={cn(
                    'bg-surface-2 border-subtle shadow-md',
                    contentClassName,
                )}
            >
                {options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                            className="text-primary focus:bg-layer-2 data-[state=checked]:text-accent-primary cursor-pointer"
                        >
                            {Icon ? (
                                <span className="flex items-center gap-2">
                                    <Icon size={14} aria-hidden="true" />
                                    <span>{opt.label}</span>
                                </span>
                            ) : (
                                opt.label
                            )}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};
