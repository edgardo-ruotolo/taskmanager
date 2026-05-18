import type React from 'react';
import { useEffect, useRef } from 'react';
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
    Wifi,
    WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentCollaboration } from '@/shared/hooks/useDocumentCollaboration';
import type { Participant } from '@/shared/hooks/useDocumentCollaboration';

export interface CollaborativeEditorProps {
    documentId: string;
    initialContent?: string;
    onSave?: (content: string) => void;
    readOnly?: boolean;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function ParticipantAvatar({ participant }: { participant: Participant }): React.ReactElement {
    return (
        <div
            title={participant.userName}
            className="w-7 h-7 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-[10px] font-semibold text-blue-400 shrink-0"
        >
            {getInitials(participant.userName)}
        </div>
    );
}

interface ParticipantsBarProps {
    participants: Participant[];
    isConnected: boolean;
}

function ParticipantsBar({ participants, isConnected }: ParticipantsBarProps): React.ReactElement {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-subtle bg-surface-1">
            <div className="flex items-center gap-1">
                {isConnected ? (
                    <Wifi size={12} className="text-green-400" aria-hidden="true" />
                ) : (
                    <WifiOff size={12} className="text-placeholder" aria-hidden="true" />
                )}
                <span className="text-[11px] text-placeholder">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
            </div>
            {participants.length > 0 && (
                <>
                    <span className="text-placeholder text-[10px]">·</span>
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-1.5">
                            {participants.slice(0, 5).map((p) => (
                                <ParticipantAvatar key={p.userId} participant={p} />
                            ))}
                            {participants.length > 5 && (
                                <div className="w-7 h-7 rounded-full bg-layer-2 border-2 border-subtle flex items-center justify-center text-[10px] text-placeholder">
                                    +{participants.length - 5}
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] text-placeholder ml-1">
                            {participants.length === 1
                                ? '1 persona editando'
                                : `${participants.length} personas editando`}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

export function CollaborativeEditor({
    documentId,
    initialContent,
    onSave,
    readOnly = false,
}: CollaborativeEditorProps): React.ReactElement {
    const { content, updateContent, participants, isConnected } =
        useDocumentCollaboration(documentId);

    // Track whether the last content change came from SignalR to avoid feedback loops
    const isRemoteUpdateRef = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Empieza a escribir...' }),
            Link.configure({ openOnClick: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
        ],
        content: initialContent ?? '',
        editable: !readOnly,
        onUpdate: ({ editor: e }) => {
            if (isRemoteUpdateRef.current) return;
            const json = JSON.stringify(e.getJSON());
            updateContent(json);
            onSave?.(json);
        },
    });

    // Sync content received from SignalR into the editor
    useEffect(() => {
        if (!editor || content === null) return;
        try {
            const parsed: unknown = JSON.parse(content);
            isRemoteUpdateRef.current = true;
            editor.commands.setContent(parsed as Parameters<typeof editor.commands.setContent>[0]);
        } catch {
            // If content is not valid JSON, treat as HTML
            isRemoteUpdateRef.current = true;
            editor.commands.setContent(content);
        } finally {
            // Use a microtask so the flag resets after TipTap's onUpdate fires
            queueMicrotask(() => {
                isRemoteUpdateRef.current = false;
            });
        }
    }, [content, editor]);

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
        <div className="flex flex-col rounded-lg border border-subtle overflow-hidden bg-surface-1">
            <ParticipantsBar participants={participants} isConnected={isConnected} />

            {editor && !readOnly && (
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
                    'prose prose-sm max-w-none text-primary focus-within:outline-none px-4 py-3',
                    '[&_.tiptap]:outline-none [&_.tiptap]:min-h-[120px] [&_.tiptap]:leading-relaxed',
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
