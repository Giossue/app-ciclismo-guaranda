import { Form, Head, Link } from '@inertiajs/react';
import {
    Bot,
    MessageSquareText,
    Plus,
    Send,
    Trash2,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ChatController from '@/actions/App/Http/Controllers/Cyclist/ChatController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { MobileTabs } from '@/components/mobile-tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    'min-h-24 w-full rounded-lg border border-input bg-card px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

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

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Asistente"
                        description="Haz preguntas rápidas sobre rutas, preparación, clima o puntos útiles."
                    />
                    <Button variant="outline" asChild>
                        <Link href="/chat?new=1" replace prefetch>
                            <Plus data-icon="inline-start" />
                            Nueva consulta
                        </Link>
                    </Button>
                </div>

                {!isOnline && (
                    <Alert variant="destructive">
                        <WifiOff />
                        <AlertTitle>Chat sin conexión</AlertTitle>
                        <AlertDescription>
                            Vuelve a conectarte para enviar mensajes. Las rutas
                            descargadas siguen disponibles.
                        </AlertDescription>
                    </Alert>
                )}

                {!webhookConfigured && (
                    <Alert>
                        <Bot />
                        <AlertTitle>Asistente no disponible</AlertTitle>
                        <AlertDescription>
                            Intenta nuevamente más tarde.
                        </AlertDescription>
                    </Alert>
                )}

                <MobileTabs
                    defaultValue="chat"
                    items={[
                        {
                            value: 'chat',
                            label: 'Chat',
                            content: (
                                <Card className="overflow-hidden">
                                    <CardHeader>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex flex-col gap-1">
                                                <Badge
                                                    variant="secondary"
                                                    className="w-fit"
                                                >
                                                    <Bot data-icon="inline-start" />
                                                    Guía online
                                                </Badge>
                                                <CardTitle>
                                                    {activeConversation?.title ??
                                                        'Nueva consulta'}
                                                </CardTitle>
                                                <CardDescription>
                                                    Escribe una pregunta
                                                    concreta para recibir una
                                                    respuesta más útil.
                                                </CardDescription>
                                            </div>
                                            {activeConversation && (
                                                <Form
                                                    {...ChatController.destroy.form(
                                                        activeConversation.id,
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            variant="outline"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Trash2 data-icon="inline-start" />
                                                            Ocultar
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex h-[44svh] min-h-72 flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                                            {latestMessages.map((message) => (
                                                <MessageBubble
                                                    key={`${message.role}-${message.id}`}
                                                    message={message}
                                                />
                                            ))}

                                            {latestMessages.length === 0 && (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                                    <MessageSquareText />
                                                    <p>
                                                        Pregunta por rutas,
                                                        preparación o lugares
                                                        útiles.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <Form
                                            {...ChatController.store.form()}
                                            options={{ preserveScroll: true }}
                                            className="grid gap-3"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="route_id">
                                                            Ruta opcional
                                                        </Label>
                                                        <Select
                                                            name="route_id"
                                                            defaultValue="none"
                                                        >
                                                            <SelectTrigger
                                                                id="route_id"
                                                                className="w-full"
                                                                aria-invalid={Boolean(
                                                                    errors.route_id,
                                                                )}
                                                            >
                                                                <SelectValue placeholder="Sin ruta específica" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectItem value="none">
                                                                        Sin ruta
                                                                        específica
                                                                    </SelectItem>
                                                                    {routes.map(
                                                                        (
                                                                            route,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    route.id
                                                                                }
                                                                                value={String(
                                                                                    route.id,
                                                                                )}
                                                                            >
                                                                                {
                                                                                    route.name
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError
                                                            message={
                                                                errors.route_id
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="message">
                                                            Mensaje
                                                        </Label>
                                                        <textarea
                                                            id="message"
                                                            name="message"
                                                            required
                                                            className={
                                                                textareaClass
                                                            }
                                                            placeholder="Ej. ¿Qué ruta me recomiendas para una salida familiar?"
                                                            aria-invalid={Boolean(
                                                                errors.message,
                                                            )}
                                                            disabled={
                                                                !canSend ||
                                                                processing
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.message
                                                            }
                                                        />
                                                    </div>

                                                    <CardFooter className="px-0 pb-0">
                                                        <Button
                                                            disabled={
                                                                !canSend ||
                                                                processing
                                                            }
                                                            className="w-full"
                                                        >
                                                            <Send data-icon="inline-start" />
                                                            Enviar
                                                        </Button>
                                                    </CardFooter>
                                                </>
                                            )}
                                        </Form>
                                    </CardContent>
                                </Card>
                            ),
                        },
                        {
                            value: 'history',
                            label: 'Historial',
                            badge: conversations.length,
                            content: (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Historial</CardTitle>
                                        <CardDescription>
                                            Consultas anteriores disponibles
                                            para continuar rápidamente.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        {conversations.map((conversation) => (
                                            <Link
                                                key={conversation.id}
                                                href={`/chat?conversation=${conversation.id}`}
                                                replace
                                                prefetch
                                                className={cn(
                                                    'rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/70',
                                                    activeConversation?.id ===
                                                        conversation.id &&
                                                        'border-primary bg-secondary text-secondary-foreground',
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <strong>
                                                        {conversation.title ??
                                                            `Consulta ${conversation.id}`}
                                                    </strong>
                                                    <Badge variant="outline">
                                                        {
                                                            conversation.messages_count
                                                        }
                                                    </Badge>
                                                </div>
                                                {conversation.last_message && (
                                                    <p className="mt-1 line-clamp-2 text-muted-foreground">
                                                        {
                                                            conversation.last_message
                                                        }
                                                    </p>
                                                )}
                                            </Link>
                                        ))}

                                        {conversations.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Aún no hay consultas anteriores.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[88%] rounded-lg border px-3 py-2 text-sm',
                    isUser
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card',
                )}
            >
                <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                    <span>{isUser ? 'Tú' : 'Asistente'}</span>
                    {message.sent_at && (
                        <span>
                            · {new Date(message.sent_at).toLocaleString()}
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
