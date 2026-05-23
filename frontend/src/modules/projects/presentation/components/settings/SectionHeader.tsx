import type React from 'react';
import { Separator } from '@/components/ui/separator';

interface SectionHeaderProps {
    title: string;
    description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps): React.ReactElement {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="text-sm text-tertiary mt-0.5">{description}</p>
            </div>
            <Separator className="bg-subtle" />
        </div>
    );
}
