import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RecurringForm } from './RecurringForm';
import { useCreateRecurringTemplate } from '../../application/use-recurring';
import type { RecurringTemplate, RecurringFromIssuePrefill } from '../../domain/types';
import type { RecurringTemplateFormValues } from '../../application/schemas';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    workspaceSlug: string;
    data?: RecurringTemplate;
    prefill?: RecurringFromIssuePrefill;
    onUpdated?: (values: RecurringTemplateFormValues) => Promise<void>;
}

export function CreateRecurringDialog({
    isOpen,
    onClose,
    workspaceSlug,
    data,
    prefill,
    onUpdated,
}: Props): React.ReactElement {
    const createMutation = useCreateRecurringTemplate(workspaceSlug);

    const handleSubmit = async (values: RecurringTemplateFormValues) => {
        if (data && onUpdated) {
            await onUpdated(values);
        } else {
            await createMutation.mutateAsync({
                name: values.name,
                descriptionHtml: values.descriptionHtml,
                frequency: values.frequency,
                interval: values.interval,
                daysOfWeek: values.daysOfWeek,
                dayOfMonth: values.dayOfMonth,
                monthOfYear: values.monthOfYear,
                runAtTime: values.runAtTime,
                endTime: values.endTime,
                timezone: values.timezone,
                startsOn: values.startsOn,
                endsOn: values.endsOn,
                stateGroup: values.stateGroup,
                priority: values.priority,
                startDateOffsetDays: values.startDateOffsetDays,
                targetDateOffsetDays: values.targetDateOffsetDays,
                blockPolicy: values.blockPolicy,
                companyIds: values.companyIds,
                assigneeIds: values.assigneeIds,
                labelIds: values.labelIds,
            });
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl p-0">
                <RecurringForm
                    workspaceSlug={workspaceSlug}
                    data={data}
                    prefill={prefill}
                    onSubmit={handleSubmit}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
