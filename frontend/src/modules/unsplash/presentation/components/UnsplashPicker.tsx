import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ImageIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnsplashSearch } from '../../application/use-unsplash';
import type { UnsplashPhoto } from '../../domain/types';

interface UnsplashPickerProps {
    onSelect: (photo: UnsplashPhoto) => void;
    trigger?: React.ReactNode;
}

function useDebounce(value: string, delay: number): string {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}

export function UnsplashPicker({ onSelect, trigger }: UnsplashPickerProps): React.ReactElement {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const debouncedQuery = useDebounce(inputValue, 400);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: photos, isLoading, isFetching } = useUnsplashSearch(debouncedQuery);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setInputValue('');
        }
    }, [open]);

    const handleSelect = (photo: UnsplashPhoto): void => {
        onSelect(photo);
        setOpen(false);
    };

    const showLoading = (isLoading || isFetching) && debouncedQuery.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs border-subtle text-secondary">
                        <ImageIcon size={13} />
                        Elegir imagen
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-surface-1 border-subtle">
                <DialogHeader>
                    <DialogTitle className="text-primary">Buscar imagen</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none" />
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Buscar fotos..."
                        className="pl-9 bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                    />
                </div>

                <div className="min-h-48">
                    {!debouncedQuery && (
                        <div className="flex flex-col items-center justify-center py-12 text-placeholder gap-2">
                            <Search size={24} />
                            <p className="text-sm">Escribe algo para buscar fotos</p>
                        </div>
                    )}

                    {showLoading && (
                        <div className="flex items-center justify-center py-12 gap-2 text-secondary">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Buscando...</span>
                        </div>
                    )}

                    {!showLoading && debouncedQuery && photos?.length === 0 && (
                        <p className="text-sm text-placeholder italic text-center py-10">
                            No se encontraron fotos para "{debouncedQuery}"
                        </p>
                    )}

                    {!showLoading && photos && photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                            {photos.map((photo) => (
                                <button
                                    key={photo.id}
                                    type="button"
                                    onClick={() => handleSelect(photo)}
                                    className={cn(
                                        'relative aspect-video rounded-md overflow-hidden border border-transparent',
                                        'hover:border-accent-primary/60 hover:scale-[1.02] transition-all duration-150',
                                        'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
                                    )}
                                    title={`Foto por ${photo.authorName}`}
                                >
                                    <img
                                        src={photo.thumbUrl}
                                        alt={`Foto por ${photo.authorName}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] truncate">{photo.authorName}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-subtle pt-2">
                    <p className="text-[11px] text-placeholder text-center">
                        Fotos de Picsum Photos
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
