import { Form, Head, Link } from '@inertiajs/react';
import {
    Bot,
    History,
    LoaderCircle,
    MapPin,
    MessageSquareText,
    Plus,
    Send,
    Trash2,
    WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import ChatController from '@/actions/App/Http/Controllers/Cyclist/ChatController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    browserNetworkStatus,
    getCurrentAppLocation,
    getNetworkStatus,
    getRememberedAppLocation,
    watchNetworkStatus,
} from '@/lib/native/capacitor';
import { cn } from '@/lib/utils';

type ChatMessage = {
    id: number;
    role: 'user' | 'assistant' | 'system' | string;
    message: string;
    provider: string | null;
    sent_at: string | null;
    metadata?: Record<string, unknown> | null;
};

type ChatConversation = {
    id: number;
    title: string | null;
    started_at: string | null;
    last_activity_at: string | null;
    messages: ChatMessage[];
};

type ConversationSummary = Omit<ChatConversation, 'messages'> & {
    messages_count: number;
    last_message: string | null;
};

type RouteContextOption = {
    id: number;
    name: string;
    slug: string;
    difficulty: string | null;
    category: string | null;
};

type ChatLocationState =
    | { status: 'idle' }
    | { status: 'loading' }
    | {
          status: 'ready';
          latitude: string;
          longitude: string;
          accuracyM: string;
          recordedAt: string;
      }
    | { status: 'error'; message: string };

type Props = {
    webhookConfigured: boolean;
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
    latestMessages: ChatMessage[];
    routes: RouteContextOption[];
};

export default function ChatIndex({
    webhookConfigured,
    conversations,
    activeConversation,
    latestMessages,
    routes,
}: Props) {
    const [isOnline, setIsOnline] = useState(
        () => browserNetworkStatus().connected,
    );
    const [location, setLocation] = useState<ChatLocationState>(() => {
        const rememberedLocation = getRememberedAppLocation();

        if (!rememberedLocation) {
            return { status: 'idle' };
        }

        return chatLocationFromSnapshot(rememberedLocation);
    });
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void getNetworkStatus().then((status) => setIsOnline(status.connected));

        return watchNetworkStatus((status) => setIsOnline(status.connected));
    }, []);

    useEffect(() => {
        const element = messagesRef.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [latestMessages]);

    const canSend = webhookConfigured && isOnline;

    const requestLocation = async () => {
        setLocation({ status: 'loading' });

        try {
            setLocation(
                chatLocationFromSnapshot(await getCurrentAppLocation()),
            );
        } catch {
            setLocation({
                status: 'error',
                message:
                    'No se pudo activar la ubicación. Puedes seguir en modo limitado.',
            });
        }
    };

    return (
        <>
            <Head title="Asistente" />

            <section className="ueb-page ueb-chat-shell md:w-full">
                <header className="ueb-chat-header">
                    <div className="ueb-chat-icon shrink-0">
                        <Bot className="size-5" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
                        {activeConversation?.title ??
                            'Pregunta sobre rutas y puntos útiles'}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9 shrink-0 rounded-xl px-3"
                    >
                        <Link href="/chat?new=1" replace prefetch>
                            <Plus className="size-4" />
                            <span>Nueva</span>
                        </Link>
                    </Button>
                    {activeConversation && (
                        <DeleteConversationForm
                            conversation={activeConversation}
                            compact
                        />
                    )}
                    <HistorySheet
                        conversations={conversations}
                        activeConversation={activeConversation}
                    />
                </header>

                {!isOnline && (
                    <Alert variant="destructive" className="m-3">
                        <WifiOff />
                        <AlertTitle>Sin conexión</AlertTitle>
                        <AlertDescription>
                            Conéctate para enviar mensajes al asistente.
                        </AlertDescription>
                    </Alert>
                )}

                {!webhookConfigured && (
                    <Alert className="m-3">
                        <Bot />
                        <AlertTitle>Asistente no disponible</AlertTitle>
                        <AlertDescription>
                            Intenta nuevamente más tarde.
                        </AlertDescription>
                    </Alert>
                )}

                <div ref={messagesRef} className="ueb-chat-messages">
                    {latestMessages.map((message) => (
                        <MessageBubble
                            key={`${message.role}-${message.id}`}
                            message={message}
                        />
                    ))}

                    {latestMessages.length === 0 && (
                        <div className="m-auto flex max-w-64 flex-col items-center gap-3 text-center text-muted-foreground">
                            <div className="grid size-12 place-items-center rounded-xl border bg-card">
                                <MessageSquareText className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-black text-foreground">
                                    Empieza una consulta
                                </p>
                                <p className="text-sm">
                                    Pregunta por rutas, dificultad, lugares
                                    útiles o qué llevar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Form
                    {...ChatController.store.form()}
                    options={{ preserveScroll: true }}
                    className="ueb-chat-footer"
                >
                    {({ processing, errors }) => (
                        <div className="flex flex-col gap-2">
                            {activeConversation && (
                                <input
                                    type="hidden"
                                    name="conversation_id"
                                    value={activeConversation.id}
                                />
                            )}

                            {location.status === 'ready' && (
                                <>
                                    <input
                                        type="hidden"
                                        name="location[latitude]"
                                        value={location.latitude}
                                    />
                                    <input
                                        type="hidden"
                                        name="location[longitude]"
                                        value={location.longitude}
                                    />
                                    <input
                                        type="hidden"
                                        name="location[accuracy_m]"
                                        value={location.accuracyM}
                                    />
                                    <input
                                        type="hidden"
                                        name="location[recorded_at]"
                                        value={location.recordedAt}
                                    />
                                </>
                            )}

                            <div className="grid gap-1">
                                <Label htmlFor="route_id" className="sr-only">
                                    Ruta opcional
                                </Label>
                                <Select name="route_id" defaultValue="none">
                                    <SelectTrigger
                                        id="route_id"
                                        className="h-9 w-full rounded-xl border bg-input text-xs"
                                        aria-invalid={Boolean(errors.route_id)}
                                    >
                                        <SelectValue placeholder="Sin ruta específica" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="none">
                                                Sin ruta específica
                                            </SelectItem>
                                            {routes.map((route) => (
                                                <SelectItem
                                                    key={route.id}
                                                    value={String(route.id)}
                                                >
                                                    {route.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.route_id} />
                            </div>

                            <div className="flex flex-col gap-1 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between gap-2">
                                    <span>
                                        {location.status === 'ready'
                                            ? 'Ubicación activa para recomendaciones cercanas.'
                                            : 'Modo limitado: sin rutas cercanas precisas.'}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 shrink-0 rounded-xl px-2 text-xs"
                                        onClick={requestLocation}
                                        disabled={
                                            processing ||
                                            location.status === 'loading'
                                        }
                                    >
                                        {location.status === 'loading' ? (
                                            <LoaderCircle className="size-3.5 animate-spin" />
                                        ) : (
                                            <MapPin className="size-3.5" />
                                        )}
                                        {location.status === 'ready'
                                            ? 'Actualizar'
                                            : 'Activar'}
                                    </Button>
                                </div>
                                {location.status === 'error' && (
                                    <span className="font-semibold text-warning">
                                        {location.message}
                                    </span>
                                )}
                            </div>

                            <div className="ueb-chat-input-area">
                                <div className="ueb-chat-input-box">
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={1}
                                        className="ueb-chat-input"
                                        placeholder="Escribe tu mensaje..."
                                        aria-invalid={Boolean(errors.message)}
                                        disabled={!canSend || processing}
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    disabled={!canSend || processing}
                                    className="ueb-chat-send"
                                    aria-label="Enviar mensaje"
                                >
                                    <Send className="size-5" />
                                </Button>
                            </div>
                            <InputError message={errors.message} />
                        </div>
                    )}
                </Form>
            </section>
        </>
    );
}

function chatLocationFromSnapshot(location: {
    latitude: number;
    longitude: number;
    accuracyM: number | null;
    recordedAt: string;
}): ChatLocationState {
    return {
        status: 'ready',
        latitude: location.latitude.toFixed(7),
        longitude: location.longitude.toFixed(7),
        accuracyM:
            typeof location.accuracyM === 'number' &&
            Number.isFinite(location.accuracyM)
                ? Math.round(location.accuracyM).toString()
                : '',
        recordedAt: location.recordedAt,
    };
}

function HistorySheet({
    conversations,
    activeConversation,
}: {
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
}) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-xl"
                    aria-label="Abrir historial"
                >
                    <History className="size-4" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[86vw] gap-0 p-0 sm:max-w-sm"
            >
                <SheetHeader className="border-b p-4 pr-10">
                    <SheetTitle>Historial</SheetTitle>
                    <SheetDescription>
                        Continúa una consulta anterior, oculta una conversación
                        o empieza una nueva.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                    <Button variant="outline" asChild className="justify-start">
                        <Link href="/chat?new=1" replace prefetch>
                            <Plus data-icon="inline-start" />
                            Nueva consulta
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-2">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={cn(
                                    'flex items-start gap-2 rounded-2xl border bg-card p-2 text-sm transition-colors hover:bg-accent/70',
                                    activeConversation?.id ===
                                        conversation.id &&
                                        'border-primary bg-secondary text-secondary-foreground',
                                )}
                            >
                                <Link
                                    href={`/chat?conversation=${conversation.id}`}
                                    replace
                                    prefetch
                                    className="min-w-0 flex-1 rounded-xl p-1"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <strong className="line-clamp-1">
                                            {conversation.title ??
                                                `Consulta ${conversation.id}`}
                                        </strong>
                                        <span className="text-xs text-muted-foreground">
                                            {conversation.messages_count}
                                        </span>
                                    </div>
                                    {conversation.last_message && (
                                        <p className="mt-1 line-clamp-2 text-muted-foreground">
                                            {conversation.last_message}
                                        </p>
                                    )}
                                </Link>
                                <DeleteConversationForm
                                    conversation={conversation}
                                />
                            </div>
                        ))}

                        {conversations.length === 0 && (
                            <p className="rounded-2xl border bg-muted/30 p-3 text-sm text-muted-foreground">
                                Aún no hay consultas guardadas.
                            </p>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DeleteConversationForm({
    conversation,
    compact = false,
}: {
    conversation: Pick<ChatConversation, 'id' | 'title'>;
    compact?: boolean;
}) {
    const title = conversation.title ?? `Consulta ${conversation.id}`;

    return (
        <Form
            {...ChatController.destroy.form(conversation.id)}
            options={{ preserveScroll: true }}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
                if (
                    !window.confirm(
                        `¿Ocultar "${title}" de tu historial? La conversación seguirá existiendo en la base para auditoría.`,
                    )
                ) {
                    event.preventDefault();
                }
            }}
        >
            {({ processing }) => (
                <Button
                    type="submit"
                    variant={compact ? 'outline' : 'ghost'}
                    size="icon"
                    className={cn(
                        compact
                            ? 'size-9 shrink-0 rounded-xl text-destructive hover:border-destructive hover:text-destructive'
                            : 'size-9 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive',
                    )}
                    disabled={processing}
                    aria-label={`Ocultar ${title}`}
                    title="Ocultar de mi historial"
                >
                    <Trash2 className="size-4" />
                </Button>
            )}
        </Form>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('ueb-message-row', isUser ? 'user' : 'bot')}>
            <div className={cn('ueb-message-avatar', isUser ? 'user' : 'bot')}>
                {isUser ? 'Tú'.slice(0, 1) : <Bot className="size-4" />}
            </div>
            <div className="flex flex-col gap-1">
                <div className="ueb-message-bubble">
                    <MarkdownMessage>{message.message}</MarkdownMessage>
                </div>
                {message.sent_at && (
                    <span className="px-1 font-bold text-[var(--fs-xs)] text-[var(--text-muted)]">
                        {new Date(message.sent_at).toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
}

function MarkdownMessage({ children }: { children: string }) {
    const blocks = parseMarkdownBlocks(children);

    return (
        <div className="ueb-message-markdown">
            {blocks.map((block, index) => {
                if (block.type === 'list') {
                    return (
                        <ul key={index}>
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                    {renderInlineMarkdown(item)}
                                </li>
                            ))}
                        </ul>
                    );
                }

                return <p key={index}>{renderParagraph(block.lines)}</p>;
            })}
        </div>
    );
}

type MarkdownBlock =
    | {
          type: 'paragraph';
          lines: string[];
      }
    | {
          type: 'list';
          items: string[];
      };

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
    const blocks: MarkdownBlock[] = [];
    const paragraphLines: string[] = [];
    const listItems: string[] = [];

    const flushParagraph = () => {
        if (paragraphLines.length > 0) {
            blocks.push({ type: 'paragraph', lines: [...paragraphLines] });
            paragraphLines.length = 0;
        }
    };

    const flushList = () => {
        if (listItems.length > 0) {
            blocks.push({ type: 'list', items: [...listItems] });
            listItems.length = 0;
        }
    };

    markdown
        .replace(/\r\n/g, '\n')
        .split('\n')
        .forEach((rawLine) => {
            const line = rawLine.trimEnd();

            if (line.trim() === '') {
                flushParagraph();
                flushList();

                return;
            }

            const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.+)$/);

            if (bullet?.[1]) {
                flushParagraph();
                listItems.push(bullet[1]);

                return;
            }

            flushList();
            paragraphLines.push(line.trimStart());
        });

    flushParagraph();
    flushList();

    return blocks.length > 0 ? blocks : [{ type: 'paragraph', lines: [''] }];
}

function renderParagraph(lines: string[]): ReactNode[] {
    return lines.flatMap((line, index) => {
        const nodes = renderInlineMarkdown(line);

        if (index === lines.length - 1) {
            return nodes;
        }

        return [...nodes, <br key={`br-${index}`} />];
    });
}

function renderInlineMarkdown(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const strongPattern = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = strongPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        nodes.push(
            <strong key={`${match.index}-${match[1]}`}>{match[1]}</strong>,
        );
        lastIndex = strongPattern.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes.length > 0 ? nodes : [text];
}

ChatIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asistente',
            href: '/chat',
        },
    ],
};
