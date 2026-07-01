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
    'min-h-28 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

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
            <Head title="Asistente IA" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-secondary/45 p-5 shadow-sm shadow-primary/10 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Asistente IA"
                        description="Consulta recomendaciones de rutas, POIs, dificultad, clima o preparación. El agente vive en n8n y solo funciona online."
                    />
                    <Button variant="outline" asChild>
                        <Link href="/chat?new=1" prefetch>
                            <Plus data-icon="inline-start" />
                            Nueva conversación
                        </Link>
                    </Button>
                </div>

                {!isOnline && (
                    <Alert variant="destructive">
                        <WifiOff />
                        <AlertTitle>Chat no disponible sin conexión</AlertTitle>
                        <AlertDescription>
                            El asistente depende de n8n y requiere conexión a
                            internet. Tus rutas descargadas siguen disponibles
                            offline, pero el chat no se sincroniza localmente.
                        </AlertDescription>
                    </Alert>
                )}

                {!webhookConfigured && (
                    <Alert>
                        <Bot />
                        <AlertTitle>Webhook n8n pendiente</AlertTitle>
                        <AlertDescription>
                            Configura `GUARANDA_GO_N8N_WEBHOOK_URL` en el
                            servidor. La URL no se expone al frontend ni al APK.
                        </AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <Card className="border-primary/10 bg-card/95">
                        <CardHeader>
                            <CardTitle>Historial</CardTitle>
                            <CardDescription>
                                El historial persistente lo administra n8n
                                mediante el nodo de agente/memoria.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {conversations.map((conversation) => (
                                <Link
                                    key={conversation.id}
                                    href={`/chat?conversation=${conversation.id}`}
                                    prefetch
                                    className={cn(
                                        'rounded-2xl border border-primary/10 bg-card p-3 text-sm transition-colors hover:bg-accent/70',
                                        activeConversation?.id ===
                                            conversation.id &&
                                            'bg-secondary text-secondary-foreground shadow-sm shadow-primary/10',
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <strong>
                                            {conversation.title ??
                                                `Conversación ${conversation.id}`}
                                        </strong>
                                        <Badge variant="outline">
                                            {conversation.messages_count}
                                        </Badge>
                                    </div>
                                    {conversation.last_message && (
                                        <p className="mt-1 line-clamp-2 text-muted-foreground">
                                            {conversation.last_message}
                                        </p>
                                    )}
                                </Link>
                            ))}

                            {conversations.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Laravel no guarda conversaciones nuevas; n8n
                                    se encarga de la memoria externa.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-primary/10 bg-card/95">
                        <CardHeader>
                            <div className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-secondary/45 p-5 shadow-sm shadow-primary/10 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="w-fit"
                                    >
                                        <Bot data-icon="inline-start" />
                                        n8n externo
                                    </Badge>
                                    <CardTitle>
                                        {activeConversation?.title ??
                                            'Nueva conversación'}
                                    </CardTitle>
                                    <CardDescription>
                                        Laravel solo actúa como proxy seguro; la
                                        memoria y persistencia viven en n8n.
                                    </CardDescription>
                                </div>
                                {activeConversation && (
                                    <Form
                                        {...ChatController.destroy.form(
                                            activeConversation.id,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                disabled={processing}
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
                            <div className="flex max-h-[420px] min-h-64 flex-col gap-3 overflow-y-auto rounded-[1.75rem] border border-primary/10 bg-gradient-to-b from-secondary/30 to-background/70 p-3">
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
                                            Pregunta por rutas recomendadas,
                                            preparación, POIs o alertas
                                            visibles.
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
                                                Ruta de contexto opcional
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
                                                            Sin ruta específica
                                                        </SelectItem>
                                                        {routes.map((route) => (
                                                            <SelectItem
                                                                key={route.id}
                                                                value={String(
                                                                    route.id,
                                                                )}
                                                            >
                                                                {route.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.route_id}
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
                                                className={textareaClass}
                                                placeholder="Ej. ¿Qué ruta me recomiendas para una salida familiar este fin de semana?"
                                                aria-invalid={Boolean(
                                                    errors.message,
                                                )}
                                                disabled={
                                                    !canSend || processing
                                                }
                                            />
                                            <InputError
                                                message={errors.message}
                                            />
                                        </div>

                                        <CardFooter className="px-0 pb-0">
                                            <Button
                                                disabled={
                                                    !canSend || processing
                                                }
                                            >
                                                <Send data-icon="inline-start" />
                                                Enviar a n8n
                                            </Button>
                                        </CardFooter>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </section>
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
                    'max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm shadow-sm',
                    isUser
                        ? 'rounded-br-md bg-primary text-primary-foreground shadow-primary/20'
                        : 'rounded-bl-md border border-primary/10 bg-card',
                )}
            >
                <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                    <span>{isUser ? 'Tú' : 'Asistente'}</span>
                    {message.provider && <span>· {message.provider}</span>}
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
            title: 'Asistente IA',
            href: '/chat',
        },
    ],
};
