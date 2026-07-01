import { Form, Head, Link } from '@inertiajs/react';
import {
    Bot,
    History,
    MessageSquareText,
    Plus,
    Send,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
    getNetworkStatus,
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

type Props = {
    webhookConfigured: boolean;
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
    latestMessages: ChatMessage[];
    routes: RouteContextOption[];
};

const textareaClass =
    'max-h-28 min-h-11 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';

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

    useEffect(() => {
        void getNetworkStatus().then((status) => setIsOnline(status.connected));

        return watchNetworkStatus((status) => setIsOnline(status.connected));
    }, []);

    const canSend = webhookConfigured && isOnline;

    return (
        <>
            <Head title="Asistente" />

            <section className="flex min-h-[calc(100svh-7.5rem)] flex-col overflow-hidden rounded-2xl border bg-card">
                <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Bot className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold">
                                Asistente
                            </h1>
                            <p className="truncate text-xs text-muted-foreground">
                                {activeConversation?.title ??
                                    'Pregunta sobre rutas y puntos útiles'}
                            </p>
                        </div>
                    </div>

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

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted/20 px-3 py-4">
                    {latestMessages.map((message) => (
                        <MessageBubble
                            key={`${message.role}-${message.id}`}
                            message={message}
                        />
                    ))}

                    {latestMessages.length === 0 && (
                        <div className="m-auto flex max-w-64 flex-col items-center gap-3 text-center text-muted-foreground">
                            <div className="flex size-12 items-center justify-center rounded-xl border bg-card">
                                <MessageSquareText className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-foreground">
                                    Empieza una consulta
                                </p>
                                <p className="text-sm">
                                    Puedes preguntar por rutas, dificultad,
                                    lugares útiles o qué llevar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Form
                    {...ChatController.store.form()}
                    options={{ preserveScroll: true }}
                    className="border-t bg-card p-3"
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

                            <div className="grid gap-1">
                                <Label htmlFor="route_id" className="sr-only">
                                    Ruta opcional
                                </Label>
                                <Select name="route_id" defaultValue="none">
                                    <SelectTrigger
                                        id="route_id"
                                        className="h-9 w-full rounded-xl border bg-background text-xs"
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

                            <div className="flex items-end gap-2 rounded-2xl border bg-background px-2 py-1">
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={1}
                                    className={textareaClass}
                                    placeholder="Escribe tu mensaje..."
                                    aria-invalid={Boolean(errors.message)}
                                    disabled={!canSend || processing}
                                />
                                <Button
                                    size="icon"
                                    disabled={!canSend || processing}
                                    className="mb-1 size-9 shrink-0 rounded-xl"
                                    aria-label="Enviar mensaje"
                                >
                                    <Send className="size-4" />
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
                        Continúa una consulta anterior o empieza una nueva.
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
                            <Link
                                key={conversation.id}
                                href={`/chat?conversation=${conversation.id}`}
                                replace
                                prefetch
                                className={cn(
                                    'rounded-2xl border bg-card p-3 text-sm transition-colors hover:bg-accent/70',
                                    activeConversation?.id ===
                                        conversation.id &&
                                        'border-primary bg-secondary text-secondary-foreground',
                                )}
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

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'border bg-card text-card-foreground',
                )}
            >
                <div
                    className={cn(
                        'mb-1 text-[0.7rem] font-medium opacity-80',
                        isUser ? 'text-primary-foreground' : 'text-primary',
                    )}
                >
                    {isUser ? 'Tú' : 'Guía'}
                    {message.sent_at && (
                        <span className="ml-1 opacity-70">
                            · {new Date(message.sent_at).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
        </div>
    );
}

ChatIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asistente',
            href: '/chat',
        },
    ],
};
