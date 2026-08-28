import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    Bot,
    Compass,
    History,
    LoaderCircle,
    MapPin,
    Plus,
    Square,
    Trash2,
    Volume2,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import ChatController from '@/actions/App/Http/Controllers/Cyclist/ChatController';
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import {
    PromptInput,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
    Sources,
    SourcesContent,
    SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import ImageWithFallback from '@/components/image-with-fallback';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { mediaUrl } from '@/lib/media';
import {
    browserNetworkStatus,
    getCurrentAppLocation,
    getNetworkStatus,
    getRememberedAppLocation,
    watchNetworkStatus,
} from '@/lib/native/capacitor';
import {
    isSpeechSupported,
    speakText,
    stopSpeaking,
} from '@/lib/native/speech';
import { cn } from '@/lib/utils';
import { index as chatIndex } from '@/routes/chat';
import { show as routeShow } from '@/routes/routes';
import type { Auth } from '@/types';

type ChatMessage = {
    id: number;
    role: 'user' | 'assistant' | 'system' | string;
    message: string;
    provider: string | null;
    sent_at: string | null;
    metadata?: Record<string, unknown> | null;
};

type AssistantResource = {
    kind: 'route' | 'poi';
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
    image_description: string | null;
    slug?: string;
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
    assistantConfigured: boolean;
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
    latestMessages: ChatMessage[];
    routes: RouteContextOption[];
};

type ChatSubmission = {
    message: string;
    conversation_id: number | null;
    route_id: number | null;
    travel_context: string | null;
    location: {
        latitude: string;
        longitude: string;
        accuracy_m: string;
        recorded_at: string;
    } | null;
};

const initialSuggestions = [
    '¿Qué ruta me recomiendas para hoy?',
    '¿Dónde puedo comer durante la ruta?',
    '¿Hay alertas antes de salir?',
];

export default function ChatIndex({
    assistantConfigured,
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
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const [agentIsLoading, setAgentIsLoading] = useState(false);
    const [speakingId, setSpeakingId] = useState<number | null>(null);
    const [routeId, setRouteId] = useState('none');
    const [travelContext, setTravelContext] = useState('none');
    const [submissionErrors, setSubmissionErrors] = useState<
        Record<string, string>
    >({});
    const speechSupported = useMemo(() => isSpeechSupported(), []);
    const { auth } = usePage<{ auth: Auth }>().props;
    const userInitial = firstUserInitial(auth.user?.name);

    const useSuggestion = useCallback((suggestion: string) => {
        if (messageRef.current) {
            messageRef.current.value = suggestion;
            messageRef.current.focus();
        }
    }, []);

    useEffect(() => {
        void getNetworkStatus().then((status) => setIsOnline(status.connected));

        return watchNetworkStatus((status) => setIsOnline(status.connected));
    }, []);

    useEffect(() => {
        return () => {
            void stopSpeaking();
        };
    }, []);

    const toggleSpeak = useCallback(
        async (id: number, rawMessage: string) => {
            if (speakingId === id) {
                await stopSpeaking();
                setSpeakingId(null);

                return;
            }

            const text = speakableText(rawMessage);

            if (text === '') {
                return;
            }

            setSpeakingId(id);

            try {
                await speakText(text);
            } catch {
                // Playback was interrupted or the engine failed; ignore.
            } finally {
                setSpeakingId((current) => (current === id ? null : current));
            }
        },
        [speakingId],
    );

    const canSend = assistantConfigured && isOnline;

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

    const submitMessage = (value: string): Promise<void> =>
        new Promise((resolve, reject) => {
            const submission: ChatSubmission = {
                message: value,
                conversation_id: activeConversation?.id ?? null,
                route_id: routeId === 'none' ? null : Number(routeId),
                travel_context: travelContext === 'none' ? null : travelContext,
                location:
                    location.status === 'ready'
                        ? {
                              latitude: location.latitude,
                              longitude: location.longitude,
                              accuracy_m: location.accuracyM,
                              recorded_at: location.recordedAt,
                          }
                        : null,
            };

            setSubmissionErrors({});

            router.post(ChatController.store.url(), submission, {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setAgentIsLoading(true),
                onError: (errors) => {
                    setSubmissionErrors(errors as Record<string, string>);

                    if (messageRef.current) {
                        messageRef.current.value = value;
                    }

                    reject(new Error('No se pudo enviar el mensaje.'));
                },
                onSuccess: () => resolve(),
                onFinish: () => setAgentIsLoading(false),
            });
        });

    return (
        <>
            <Head title="Asistente" />

            <section className="ueb-page flex min-h-0 flex-1 flex-col md:h-[calc(100dvh-64px-(var(--page-pad-y)*2))]">
                <header className="flex shrink-0 items-center gap-2 border-b pb-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                            Guía local de Guaranda
                        </p>
                        <p className="truncate text-sm font-bold text-foreground">
                            {activeConversation?.title ??
                                'Planifica tu próxima salida'}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="size-9 shrink-0 rounded-xl p-0"
                    >
                        <Link
                            href={chatIndex.url({ query: { new: 1 } })}
                            replace
                            prefetch
                            aria-label="Nueva consulta"
                        >
                            <Plus className="size-4" />
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

                {!assistantConfigured && (
                    <Alert className="m-3">
                        <Bot />
                        <AlertTitle>Asistente no disponible</AlertTitle>
                        <AlertDescription>
                            Intenta nuevamente más tarde.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="relative min-h-0 flex-1">
                    <Conversation className="min-h-0">
                        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-0 py-5 sm:px-4">
                            {latestMessages.map((message) => (
                                <MessageBubble
                                    key={`${message.role}-${message.id}`}
                                    message={message}
                                    userInitial={userInitial}
                                    speechSupported={speechSupported}
                                    isSpeaking={speakingId === message.id}
                                    onToggleSpeak={toggleSpeak}
                                    onUseSuggestion={useSuggestion}
                                />
                            ))}

                            {agentIsLoading && <AgentLoadingBubble />}

                            {latestMessages.length === 0 && !agentIsLoading && (
                                <ConversationEmptyState
                                    className="min-h-72"
                                    icon={
                                        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Compass className="size-4" />
                                        </span>
                                    }
                                    title="¿Qué quieres descubrir?"
                                    description="Te ayudo con rutas, comida, actividades, alojamiento y avisos vigentes."
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Compass className="size-4" />
                                    </span>
                                    <div className="flex max-w-sm flex-col gap-1">
                                        <h2 className="text-base font-bold text-foreground">
                                            ¿Qué quieres descubrir?
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Te ayudo con rutas, comida,
                                            actividades, alojamiento y avisos
                                            vigentes.
                                        </p>
                                    </div>
                                    <Suggestions className="max-w-full px-1 pt-2">
                                        {initialSuggestions.map(
                                            (suggestion) => (
                                                <Suggestion
                                                    key={suggestion}
                                                    suggestion={suggestion}
                                                    onClick={useSuggestion}
                                                />
                                            ),
                                        )}
                                    </Suggestions>
                                </ConversationEmptyState>
                            )}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>
                </div>

                <div className="shrink-0 border-t bg-background pt-3">
                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                {location.status === 'ready'
                                    ? 'Ubicación activa para recomendaciones cercanas.'
                                    : 'Recomendaciones basadas en información pública.'}
                            </p>
                            <ContextControls
                                location={location}
                                onRequestLocation={requestLocation}
                                routeId={routeId}
                                routes={routes}
                                setRouteId={setRouteId}
                                setTravelContext={setTravelContext}
                                travelContext={travelContext}
                            />
                        </div>
                        {location.status === 'error' && (
                            <p className="text-xs text-warning">
                                {location.message}
                            </p>
                        )}
                        <PromptInput
                            className="w-full"
                            onSubmit={({ text }) => {
                                if (!canSend || text.trim() === '') {
                                    return Promise.resolve();
                                }

                                return submitMessage(text.trim());
                            }}
                        >
                            <PromptInputTextarea
                                ref={messageRef}
                                aria-invalid={Boolean(submissionErrors.message)}
                                disabled={!canSend || agentIsLoading}
                                placeholder="Pregunta sobre tu salida..."
                            />
                            <PromptInputFooter>
                                <PromptInputTools>
                                    <span className="text-xs text-muted-foreground">
                                        Enter para enviar
                                    </span>
                                </PromptInputTools>
                                <PromptInputSubmit
                                    disabled={!canSend || agentIsLoading}
                                    status={
                                        agentIsLoading ? 'submitted' : 'ready'
                                    }
                                />
                            </PromptInputFooter>
                        </PromptInput>
                        <InputError message={submissionErrors.message} />
                        <InputError
                            message={
                                submissionErrors.route_id ??
                                submissionErrors.travel_context ??
                                submissionErrors.conversation_id
                            }
                        />
                    </div>
                </div>
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

function firstUserInitial(name: string | null | undefined): string {
    const initial = name?.trim().charAt(0).toLocaleUpperCase('es-EC');

    return initial && initial.length > 0 ? initial : 'U';
}

function ContextControls({
    location,
    onRequestLocation,
    routeId,
    routes,
    setRouteId,
    setTravelContext,
    travelContext,
}: {
    location: ChatLocationState;
    onRequestLocation: () => void;
    routeId: string;
    routes: RouteContextOption[];
    setRouteId: (value: string) => void;
    setTravelContext: (value: string) => void;
    travelContext: string;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                >
                    <Compass data-icon="inline-start" />
                    Personalizar
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="grid w-80 gap-4">
                <div className="grid gap-1">
                    <p className="text-sm font-bold">
                        Personaliza la respuesta
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Estos datos son opcionales y mejoran la recomendación.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="chat-route">Ruta</Label>
                    <Select value={routeId} onValueChange={setRouteId}>
                        <SelectTrigger id="chat-route">
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
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="chat-travel-context">Tipo de visita</Label>
                    <Select
                        value={travelContext}
                        onValueChange={setTravelContext}
                    >
                        <SelectTrigger id="chat-travel-context">
                            <SelectValue placeholder="Plan de viaje" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="none">
                                    Sin preferencia
                                </SelectItem>
                                <SelectItem value="local_cyclist">
                                    Salida local
                                </SelectItem>
                                <SelectItem value="day_visitor">
                                    Visita por el día
                                </SelectItem>
                                <SelectItem value="overnight_tourist">
                                    Me quedaré a dormir
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onRequestLocation}
                    disabled={location.status === 'loading'}
                >
                    {location.status === 'loading' ? (
                        <LoaderCircle
                            data-icon="inline-start"
                            className="animate-spin"
                        />
                    ) : (
                        <MapPin data-icon="inline-start" />
                    )}
                    {location.status === 'ready'
                        ? 'Actualizar ubicación'
                        : 'Usar mi ubicación'}
                </Button>
            </PopoverContent>
        </Popover>
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
            <SheetContent className="w-[86vw] gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b p-4 pr-10">
                    <SheetTitle>Historial</SheetTitle>
                    <SheetDescription>
                        Continúa una consulta anterior, oculta una conversación
                        o empieza una nueva.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                    <Button variant="outline" asChild className="justify-start">
                        <Link
                            href={chatIndex.url({ query: { new: 1 } })}
                            replace
                            prefetch
                        >
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
                                    href={chatIndex.url({
                                        query: {
                                            conversation: conversation.id,
                                        },
                                    })}
                                    replace
                                    prefetch
                                    className="min-w-0 flex-1 rounded-xl p-1"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <strong className="line-clamp-1">
                                            {conversation.title ??
                                                `Consulta ${conversation.id}`}
                                        </strong>
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
                            <p className="px-1 py-2 text-sm text-muted-foreground">
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
                        `¿Ocultar "${title}" de tu historial? Se conservará un registro interno por seguridad.`,
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

function AgentLoadingBubble() {
    return (
        <Message from="assistant">
            <div className="flex items-start gap-3">
                <AssistantAvatar />
                <MessageContent className="rounded-[var(--radius-surface)] border bg-card px-4 py-3">
                    <Shimmer className="text-sm">
                        Preparando una respuesta…
                    </Shimmer>
                </MessageContent>
            </div>
        </Message>
    );
}

function MessageBubble({
    message,
    userInitial,
    speechSupported,
    isSpeaking,
    onToggleSpeak,
    onUseSuggestion,
}: {
    message: ChatMessage;
    userInitial: string;
    speechSupported: boolean;
    isSpeaking: boolean;
    onToggleSpeak: (id: number, rawMessage: string) => void;
    onUseSuggestion: (suggestion: string) => void;
}) {
    const isUser = message.role === 'user';
    const canSpeak = !isUser && speechSupported;
    const suggestedActions = assistantSuggestedActions(message.metadata);
    const resources = assistantResources(message.metadata);

    return (
        <Message from={isUser ? 'user' : 'assistant'}>
            <div
                className={cn(
                    'flex items-start gap-3',
                    isUser && 'flex-row-reverse',
                )}
            >
                {isUser ? (
                    <Avatar className="border border-primary bg-primary text-primary-foreground">
                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <AssistantAvatar />
                )}
                <div
                    className={cn(
                        'flex min-w-0 flex-col gap-2',
                        isUser && 'items-end',
                    )}
                >
                    <MessageContent
                        className={cn(
                            'max-w-[min(78vw,42rem)] px-4 py-3',
                            isUser
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'rounded-[var(--radius-surface)] border bg-card',
                        )}
                    >
                        <MessageResponse className="grid gap-2 text-sm leading-6 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5">
                            {message.message}
                        </MessageResponse>
                    </MessageContent>
                    {suggestedActions.length > 0 && (
                        <Suggestions className="max-w-[min(78vw,42rem)] px-1">
                            {suggestedActions.map((suggestion) => (
                                <Suggestion
                                    key={suggestion}
                                    suggestion={suggestion}
                                    onClick={onUseSuggestion}
                                />
                            ))}
                        </Suggestions>
                    )}
                    {resources.length > 0 && (
                        <Sources className="max-w-[min(78vw,42rem)] px-1 text-muted-foreground">
                            <SourcesTrigger
                                count={resources.length}
                                className="rounded-lg text-xs hover:text-foreground"
                            >
                                Información verificada ({resources.length})
                            </SourcesTrigger>
                            <SourcesContent className="w-full">
                                {resources.map((resource) => (
                                    <AssistantResourceCard
                                        key={`${resource.kind}-${resource.id}`}
                                        resource={resource}
                                    />
                                ))}
                            </SourcesContent>
                        </Sources>
                    )}
                    <MessageActions className="px-1">
                        {message.sent_at && (
                            <span className="text-[0.625rem] leading-none font-black tracking-wide text-muted-foreground">
                                {new Date(message.sent_at).toLocaleTimeString(
                                    'es-EC',
                                    {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },
                                )}
                            </span>
                        )}
                        {canSpeak && (
                            <MessageAction
                                onClick={() =>
                                    onToggleSpeak(message.id, message.message)
                                }
                                className={cn(isSpeaking && 'text-primary')}
                                label={
                                    isSpeaking
                                        ? 'Detener lectura'
                                        : 'Escuchar mensaje'
                                }
                                tooltip={isSpeaking ? 'Detener' : 'Escuchar'}
                            >
                                {isSpeaking ? (
                                    <Square className="size-4 fill-current" />
                                ) : (
                                    <Volume2 className="size-4" />
                                )}
                            </MessageAction>
                        )}
                    </MessageActions>
                </div>
            </div>
        </Message>
    );
}

function AssistantAvatar() {
    return (
        <Avatar className="border bg-card text-primary shadow-sm">
            <AvatarFallback className="bg-card text-primary">
                <Bot className="size-4" />
            </AvatarFallback>
        </Avatar>
    );
}

function AssistantResourceCard({ resource }: { resource: AssistantResource }) {
    const image = resource.image_path ? (
        <ImageWithFallback
            src={mediaUrl(resource.image_path)}
            alt={resource.image_description ?? resource.title}
            className="size-14 shrink-0 rounded-lg object-cover"
            fallback={
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-[0.625rem] text-muted-foreground">
                    Sin foto
                </div>
            }
        />
    ) : null;

    const content = (
        <>
            {image}
            <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-primary">
                    {resource.kind === 'route'
                        ? 'Ruta oficial'
                        : 'Punto de interés'}
                </span>
                <strong className="line-clamp-1 text-sm text-foreground">
                    {resource.title}
                </strong>
                {resource.description && (
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                        {resource.description}
                    </span>
                )}
            </span>
        </>
    );

    const className =
        'flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors';

    if (resource.kind === 'route' && resource.slug) {
        return (
            <Link
                href={routeShow(resource.slug).url}
                className={`${className} hover:bg-accent`}
                prefetch
            >
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}

function assistantSuggestedActions(
    metadata: Record<string, unknown> | null | undefined,
): string[] {
    const suggestions = metadata?.suggested_actions;

    return Array.isArray(suggestions)
        ? suggestions
              .filter(
                  (suggestion): suggestion is string =>
                      typeof suggestion === 'string' &&
                      suggestion.trim() !== '',
              )
              .slice(0, 3)
        : [];
}

function assistantResources(
    metadata: Record<string, unknown> | null | undefined,
): AssistantResource[] {
    const resources = metadata?.resources;

    if (!Array.isArray(resources)) {
        return [];
    }

    return resources.filter(
        (resource): resource is AssistantResource =>
            typeof resource === 'object' &&
            resource !== null &&
            (resource.kind === 'route' || resource.kind === 'poi') &&
            typeof resource.id === 'number' &&
            typeof resource.title === 'string' &&
            (typeof resource.description === 'string' ||
                resource.description === null) &&
            (typeof resource.image_path === 'string' ||
                resource.image_path === null) &&
            (typeof resource.image_description === 'string' ||
                resource.image_description === null) &&
            (resource.slug === undefined || typeof resource.slug === 'string'),
    );
}

function speakableText(raw: string): string {
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/^\s*(?:[-*•]|\d+\.)\s+/gm, '')
        .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu, '')
        .replace(/[\uFE00-\uFE0F]|\u200D/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

ChatIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asistente',
            href: chatIndex.url(),
        },
    ],
};
