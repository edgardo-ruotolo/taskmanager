import type React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import {
    Bold,
    Italic,
    Code,
    List,
    ListOrdered,
    CheckSquare,
    Heading2,
    Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
    className?: string;
    editable?: boolean;
}

export function RichTextEditor({
    content,
    placeholder,
    onChange,
    className,
    editable = true,
}: RichTextEditorProps): React.ReactElement {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder ?? 'Agrega una descripción...' }),
            Link.configure({ openOnClick: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
        ],
        content: content ?? '',
        editable,
        onUpdate: ({ editor: e }) => {
            onChange?.(e.getHTML());
        },
    });

    const toolbarItems = [
        {
            icon: Bold,
            label: 'Negrita',
            action: () => editor?.chain().focus().toggleBold().run(),
            active: editor?.isActive('bold') ?? false,
        },
        {
            icon: Italic,
            label: 'Cursiva',
            action: () => editor?.chain().focus().toggleItalic().run(),
            active: editor?.isActive('italic') ?? false,
        },
        {
            icon: Code,
            label: 'Código',
            action: () => editor?.chain().focus().toggleCode().run(),
            active: editor?.isActive('code') ?? false,
        },
        {
            icon: Heading2,
            label: 'H2',
            action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
            active: editor?.isActive('heading', { level: 2 }) ?? false,
        },
        {
            icon: Heading3,
            label: 'H3',
            action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
            active: editor?.isActive('heading', { level: 3 }) ?? false,
        },
        {
            icon: List,
            label: 'Lista',
            action: () => editor?.chain().focus().toggleBulletList().run(),
            active: editor?.isActive('bulletList') ?? false,
        },
        {
            icon: ListOrdered,
            label: 'Lista numerada',
            action: () => editor?.chain().focus().toggleOrderedList().run(),
            active: editor?.isActive('orderedList') ?? false,
        },
        {
            icon: CheckSquare,
            label: 'Lista de tareas',
            action: () => editor?.chain().focus().toggleTaskList().run(),
            active: editor?.isActive('taskList') ?? false,
        },
    ] as const;

    return (
        <div className={cn('relative', className)}>
            {editor && editable && (
                <BubbleMenu editor={editor}>
                    <div className="flex items-center gap-0.5 rounded-lg border border-subtle bg-surface-1 shadow-lg p-1">
                        {toolbarItems.map(({ icon: Icon, label, action, active }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={action}
                                aria-label={label}
                                className={cn(
                                    'p-1.5 rounded transition-colors duration-150',
                                    active
                                        ? 'bg-accent-subtle text-accent-primary'
                                        : 'text-secondary hover:bg-layer-2 hover:text-primary',
                                )}
                            >
                                <Icon size={13} />
                            </button>
                        ))}
                    </div>
                </BubbleMenu>
            )}
            <EditorContent
                editor={editor}
                className={cn(
                    'prose prose-sm max-w-none text-primary focus-within:outline-none',
                    '[&_.tiptap]:outline-none [&_.tiptap]:min-h-[80px] [&_.tiptap]:leading-relaxed',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:text-placeholder',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
                    '[&_.tiptap_ul[data-type=taskList]]:list-none [&_.tiptap_ul[data-type=taskList]]:pl-0',
                    '[&_.tiptap_ul[data-type=taskList]_li]:flex [&_.tiptap_ul[data-type=taskList]_li]:items-start [&_.tiptap_ul[data-type=taskList]_li]:gap-2',
                )}
            />
        </div>
    );
}
