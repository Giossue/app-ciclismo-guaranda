import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Bot,
    Compass,
    EllipsisVertical,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
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
import { index as routesIndex, show as routeShow } from '@/routes/routes';
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

type NetworkState = 'checking' | 'online' | 'offline';

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
    location: {
        latitude: string;
        longitude: string;
        accuracy_m: string;
        recorded_at: string;
    } | null;
};

export default function ChatIndex({
    assistantConfigured,
    conversations,
    activeConversation,
    latestMessages,
    routes,
}: Props) {
    const [networkState, setNetworkState] = useState<NetworkState>('checking');
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
    const [submissionErrors, setSubmissionErrors] = useState<
        Record<string, string>
    >({});
    const [visibleSuggestedMessageId, setVisibleSuggestedMessageId] = useState<
        number | null
    >(null);
    const initialLastMessageId = useRef<number | null>(
        latestMessages.at(-1)?.id ?? null,
    );
    const speechSupported = useMemo(() => isSpeechSupported(), []);
    const { auth } = usePage<{ auth: Auth }>().props;
    const userInitial = firstUserInitial(auth.user?.name);
    const lastAssistantMessage = useMemo(() => {
        const lastMessage = latestMessages.at(-1);

        return lastMessage?.role === 'assistant' ? lastMessage : null;
    }, [latestMessages]);
    const activeSuggestedActions = useMemo(() => {
        if (
            lastAssistantMessage?.id !== visibleSuggestedMessageId ||
            agentIsLoading
        ) {
            return [];
        }

        return assistantSuggestedActions(lastAssistantMessage.metadata);
    }, [agentIsLoading, lastAssistantMessage, visibleSuggestedMessageId]);
    const starterSuggestions = useMemo(
        () => starterSuggestionsFor(routes),
        [routes],
    );

    useEffect(() => {
        let active = true;
        const updateNetworkState = (status: { connected: boolean }) => {
            if (active) {
                setNetworkState(status.connected ? 'online' : 'offline');
            }
        };

        void getNetworkStatus()
            .then(updateNetworkState)
            .catch(() => updateNetworkState(browserNetworkStatus()));

        const stopWatching = watchNetworkStatus(updateNetworkState);

        return () => {
            active = false;
            stopWatching();
        };
    }, []);

    useEffect(() => {
        return () => {
            void stopSpeaking();
        };
    }, []);

    useEffect(() => {
        const lastMessage = latestMessages.at(-1);

        if (
            agentIsLoading ||
            lastMessage?.role !== 'assistant' ||
            lastMessage.id === initialLastMessageId.current
        ) {
            return;
        }

        initialLastMessageId.current = lastMessage.id;
        setVisibleSuggestedMessageId(lastMessage.id);
    }, [agentIsLoading, latestMessages]);

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

    const canSend = assistantConfigured && networkState === 'online';

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

    const submitMessage = useCallback(
        (value: string): Promise<void> =>
            new Promise((resolve, reject) => {
                const submission: ChatSubmission = {
                    message: value,
                    conversation_id: activeConversation?.id ?? null,
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
                    onStart: () => {
                        setVisibleSuggestedMessageId(null);
                        setAgentIsLoading(true);
                    },
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
            }),
        [activeConversation?.id, location],
    );

    const useSuggestion = useCallback(
        (suggestion: string) => submitMessage(suggestion),
        [submitMessage],
    );

    return (
        <>
            <Head title="Asistente" />

            <section className="flex h-full min-h-0 w-full flex-col bg-background">
                <header className="z-20 shrink-0 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
                    <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="shrink-0"
                        >
                            <Link href={routesIndex.url()} prefetch>
                                <ArrowLeft data-icon="inline-start" />
                                Volver
                            </Link>
                        </Button>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                                Guía local de Guaranda
                            </p>
                            <p className="truncate text-sm font-bold text-foreground">
                                {activeConversation?.title ??
                                    'Planifica tu próxima salida'}
                            </p>
                        </div>
                        <ChatOverflowMenu
                            conversations={conversations}
                            activeConversation={activeConversation}
                        />
                    </div>
                </header>

                {networkState === 'offline' && (
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

                <div className="relative min-h-0 flex-1 overflow-hidden">
                    <Conversation className="h-full min-h-0">
                        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-0 py-5 sm:px-4">
                            {latestMessages.map((message) => (
                                <MessageBubble
                                    key={`${message.role}-${message.id}`}
                                    message={message}
                                    userInitial={userInitial}
                                    speechSupported={speechSupported}
                                    isSpeaking={speakingId === message.id}
                                    onToggleSpeak={toggleSpeak}
                                />
                            ))}

                            {agentIsLoading && <AgentLoadingBubble />}

                            {activeSuggestedActions.length > 0 && (
                                <div className="flex flex-col gap-2 px-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Puedes continuar con una de estas
                                        preguntas
                                    </p>
                                    <Suggestions className="max-w-full px-0">
                                        {activeSuggestedActions.map(
                                            (suggestion) => (
                                                <Suggestion
                                                    key={suggestion}
                                                    suggestion={suggestion}
                                                    onClick={useSuggestion}
                                                />
                                            ),
                                        )}
                                    </Suggestions>
                                </div>
                            )}

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
                                        {starterSuggestions.map(
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

                <div className="z-20 shrink-0 border-t bg-background/95 px-4 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        <LocationNudge
                            location={location}
                            networkState={networkState}
                            onRequestLocation={requestLocation}
                        />
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
                                placeholder={
                                    networkState === 'checking'
                                        ? 'Comprobando conexión…'
                                        : 'Pregunta sobre tu salida...'
                                }
                            />
                            <PromptInputFooter>
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

function starterSuggestionsFor(routes: RouteContextOption[]): string[] {
    const route = routes.at(0);

    return [
        route
            ? `¿Cómo es la ruta ${route.name}?`
            : '¿Qué puedo hacer hoy en Guaranda?',
        '¿Dónde puedo comer durante mi salida?',
        '¿Hay alertas antes de salir?',
    ];
}

function LocationNudge({
    location,
    networkState,
    onRequestLocation,
}: {
    location: ChatLocationState;
    networkState: NetworkState;
    onRequestLocation: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
                {location.status === 'ready'
                    ? 'Ubicación activa para recomendaciones cercanas.'
                    : networkState === 'checking'
                      ? 'Comprobando conexión…'
                      : 'Activa tu ubicación para que tu guía te dé recomendaciones más útiles.'}
            </p>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
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
                    ? 'Actualizar'
                    : 'Activar ubicación'}
            </Button>
        </div>
    );
}

function ChatOverflowMenu({
    conversations,
    activeConversation,
}: {
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
}) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteActiveConversation = () => {
        if (!activeConversation || isDeleting) {
            return;
        }

        const title =
            activeConversation.title ?? `Consulta ${activeConversation.id}`;

        if (!window.confirm(`¿Borrar "${title}" de tu historial?`)) {
            return;
        }

        router.delete(ChatController.destroy.url(activeConversation.id), {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0 rounded-xl"
                        aria-label="Más opciones de conversación"
                    >
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link
                            href={chatIndex.url({ query: { new: 1 } })}
                            replace
                            prefetch
                        >
                            <Plus />
                            Nueva consulta
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
                        <History />
                        Historial
                    </DropdownMenuItem>
                    {activeConversation && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                disabled={isDeleting}
                                onSelect={deleteActiveConversation}
                            >
                                <Trash2 />
                                {isDeleting ? 'Borrando…' : 'Borrar'}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <HistorySheet
                conversations={conversations}
                activeConversation={activeConversation}
                open={historyOpen}
                onOpenChange={setHistoryOpen}
            />
        </>
    );
}

function HistorySheet({
    conversations,
    activeConversation,
    open,
    onOpenChange,
}: {
    conversations: ConversationSummary[];
    activeConversation: ChatConversation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[86vw] gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b p-4 pr-10">
                    <SheetTitle>Historial</SheetTitle>
                    <SheetDescription>
                        Continúa una consulta anterior o empieza una nueva.
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
}: {
    message: ChatMessage;
    userInitial: string;
    speechSupported: boolean;
    isSpeaking: boolean;
    onToggleSpeak: (id: number, rawMessage: string) => void;
}) {
    const isUser = message.role === 'user';
    const canSpeak = !isUser && speechSupported;
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
                        'flex min-w-0 flex-col gap-1',
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
                    <MessageActions className="-mt-1 px-1">
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
              .filter((suggestion) => !isGenericProfileQuestion(suggestion))
              .slice(0, 3)
        : [];
}

function isGenericProfileQuestion(suggestion: string): boolean {
    return /(?:de paso|durante el d[ií]a|solo(?:\s+por)?\s+el d[ií]a|quedar(?:te|ás)\s+a\s+dormir|eres\s+(?:visitante|turista))/iu.test(
        suggestion,
    );
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
