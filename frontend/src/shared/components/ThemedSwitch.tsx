import type React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface ThemedSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    ariaLabel?: string;
    className?: string;
}

export const ThemedSwitch = ({
    checked,
    onCheckedChange,
    disabled,
    id,
    ariaLabel,
    className,
}: ThemedSwitchProps): React.ReactElement => {
    return (
        <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
                'data-[state=checked]:bg-[var(--brand-700)] data-[state=unchecked]:bg-[var(--neutral-400)] [&>span]:bg-white [&>span]:shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
                className,
            )}
        />
    );
};
