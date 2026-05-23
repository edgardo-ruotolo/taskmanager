import type React from 'react';
import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemedMultiSelectOption {
    value: string;
    label: string;
    color?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface ThemedMultiSelectProps {
    options: ThemedMultiSelectOption[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    emptyText?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    triggerClassName?: string;
    contentClassName?: string;
    disabled?: boolean;
    maxBadges?: number;
    id?: string;
    ariaLabel?: string;
}

export const ThemedMultiSelect = ({
    options,
    selected,
    onChange,
    placeholder = 'Seleccionar...',
    emptyText = 'Sin resultados',
    searchable = true,
    searchPlaceholder = 'Buscar...',
    triggerClassName,
    contentClassName,
    disabled,
    maxBadges = 3,
    id,
    ariaLabel,
}: ThemedMultiSelectProps): React.ReactElement => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const toggle = (value: string): void => {
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value],
        );
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-label={ariaLabel}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between bg-layer-1 border-subtle text-primary hover:bg-layer-2 font-normal min-h-9',
                        triggerClassName,
                    )}
                >
                    {selected.length === 0 ? (
                        <span className="text-placeholder">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {selected.slice(0, maxBadges).map((v) => {
                                const opt = options.find((o) => o.value === v);
                                return (
                                    <Badge
                                        key={v}
                                        variant="secondary"
                                        className="text-xs bg-layer-2 text-secondary border-subtle px-1.5 py-0"
                                    >
                                        {opt?.color && (
                                            <span
                                                className="w-2 h-2 rounded-full mr-1 shrink-0 inline-block"
                                                style={{ backgroundColor: opt.color }}
                                            />
                                        )}
                                        {opt?.icon && (
                                            <span className="mr-1 shrink-0 inline-flex items-center">
                                                {opt.icon}
                                            </span>
                                        )}
                                        {opt?.label ?? v}
                                    </Badge>
                                );
                            })}
                            {selected.length > maxBadges && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs bg-layer-2 text-secondary border-subtle px-1.5 py-0"
                                >
                                    +{selected.length - maxBadges}
                                </Badge>
                            )}
                        </div>
                    )}
                    <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn('w-64 p-0 bg-layer-1 border-subtle', contentClassName)}
                align="start"
            >
                <Command className="bg-transparent">
                    {searchable && (
                        <CommandInput
                            placeholder={searchPlaceholder}
                            className="text-primary placeholder:text-placeholder border-b border-subtle"
                        />
                    )}
                    <CommandList>
                        <CommandEmpty className="py-3 text-center text-sm text-secondary">
                            {emptyText}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    disabled={opt.disabled}
                                    onSelect={() => toggle(opt.value)}
                                    className="text-primary data-[selected=true]:bg-layer-2 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {opt.color && (
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: opt.color }}
                                            />
                                        )}
                                        {opt.icon && (
                                            <span className="shrink-0 inline-flex items-center">
                                                {opt.icon}
                                            </span>
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                    </div>
                                    <Check
                                        size={13}
                                        className={cn(
                                            'ml-auto',
                                            selected.includes(opt.value) ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
