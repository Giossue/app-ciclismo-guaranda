import { Form, Head } from '@inertiajs/react';
import {
    AppWindow,
    Bot,
    Database,
    Plug,
    Rocket,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AssistantConfigurationController from '@/actions/App/Http/Controllers/Admin/AssistantConfigurationController';
import SystemSettingsController from '@/actions/App/Http/Controllers/Admin/SystemSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type SettingValue = string | number | boolean | null;

type SettingSection =
    'application' | 'drivers' | 'integrations' | 'security' | 'deployment';

type Settings = Partial<Record<SettingSection, Record<string, SettingValue>>>;

type Props = {
    assistantConfiguration: AssistantConfiguration;
    settings: Settings;
};

type AssistantConfiguration = {
    chat_model: string | null;
    chat_reasoning_effort: string;
    vision_model: string | null;
    vision_reasoning_effort: string;
};

type SettingSectionOption = {
    id: SettingSection;
    label: string;
    description: string;
    icon: LucideIcon;
};

const sections: SettingSectionOption[] = [
    {
        id: 'application',
        label: 'Aplicación',
        description: 'Identidad, zona horaria e idioma.',
        icon: AppWindow,
    },
    {
        id: 'drivers',
        label: 'Servicios',
        description: 'Base de datos, caché, sesiones y colas.',
        icon: Database,
    },
    {
        id: 'integrations',
        label: 'Integraciones',
        description: 'Asistente, PostGIS y almacenamiento.',
        icon: Plug,
    },
    {
        id: 'security',
        label: 'Seguridad',
        description: 'Claves, HTTPS y correo.',
        icon: ShieldCheck,
    },
    {
        id: 'deployment',
        label: 'Despliegue',
        description: 'Entorno, migraciones y aplicación móvil.',
        icon: Rocket,
    },
];

const valueLabels: Record<string, string> = {
    name: 'Nombre',
    environment: 'Ambiente',
    debug: 'Depuración activa',
    url: 'URL pública',
    timezone: 'Zona horaria',
    locale: 'Idioma',
    database: 'Base de datos',
    session: 'Sesiones',
    cache: 'Caché',
    queue: 'Colas',
    filesystem: 'Archivos',
    openai_configured: 'Asistente OpenAI configurado',
    openai_vision_configured: 'Descripción IA de imágenes configurada',
    openai_timeout_seconds: 'Tiempo de espera del asistente',
    postgis_available: 'PostGIS disponible',
    postgis_runtime: 'Runtime PostGIS',
    pgvector_available: 'pgvector disponible para instalar',
    pgvector_runtime: 'Runtime pgvector',
    public_storage_linked: 'Almacenamiento público enlazado',
    app_key_configured: 'APP_KEY configurada',
    https_url: 'URL pública con HTTPS',
    mailer: 'Correo',
    run_seeders: 'Ejecución de seeders',
    mobile_server_url_env: 'Servidor para la app móvil',
    migrations_table_exists: 'Tabla de migraciones',
};

export default function AdminSettingsIndex({
    assistantConfiguration,
    settings,
}: Props) {
    const availableSections = sections.filter(
        (section) => settings[section.id],
    );

    return (
        <>
            <Head title="Información técnica" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Información técnica"
                    description="Estado actual de la aplicación y sus servicios. Los valores sensibles no se exponen."
                />

                <AssistantConfigurationForm
                    configuration={assistantConfiguration}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Estado del sistema</CardTitle>
                        <CardDescription>
                            Valores leídos del entorno actual para diagnóstico
                            administrativo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {availableSections.map((section, index) => {
                            const Icon = section.icon;
                            const values = settings[section.id] ?? {};

                            return (
                                <section
                                    key={section.id}
                                    aria-labelledby={`settings-${section.id}-title`}
                                    className="flex flex-col gap-4"
                                >
                                    {index > 0 ? <Separator /> : null}
                                    <header className="flex items-start gap-3 pt-1">
                                        <Icon
                                            aria-hidden="true"
                                            className="mt-0.5 text-muted-foreground"
                                        />
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <h2
                                                id={`settings-${section.id}-title`}
                                                className="text-base text-foreground"
                                            >
                                                {section.label}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {section.description}
                                            </p>
                                        </div>
                                    </header>
                                    <dl className="grid gap-x-8 sm:grid-cols-2">
                                        {Object.entries(values).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex min-w-0 items-center justify-between gap-4 border-b py-3"
                                                >
                                                    <dt className="text-sm text-foreground">
                                                        {valueLabels[key] ??
                                                            key}
                                                    </dt>
                                                    <dd className="min-w-0 text-right text-sm text-muted-foreground">
                                                        <SettingValue
                                                            value={value}
                                                        />
                                                    </dd>
                                                </div>
                                            ),
                                        )}
                                    </dl>
                                </section>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function AssistantConfigurationForm({
    configuration,
}: {
    configuration: AssistantConfiguration;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <Bot
                        aria-hidden="true"
                        className="mt-0.5 text-muted-foreground"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                        <CardTitle>Asistente de Guaranda Go</CardTitle>
                        <CardDescription>
                            Define el modelo y nivel de razonamiento del chat.
                            La clave de OpenAI nunca se muestra ni se edita
                            aquí.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form
                    {...AssistantConfigurationController.update.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    data-invalid={Boolean(errors.chat_model)}
                                >
                                    <FieldLabel htmlFor="assistant-chat-model">
                                        Modelo del chat
                                    </FieldLabel>
                                    <Select
                                        name="chat_model"
                                        defaultValue={
                                            configuration.chat_model ??
                                            'gpt-5.6-luna'
                                        }
                                    >
                                        <SelectTrigger
                                            id="assistant-chat-model"
                                            aria-invalid={Boolean(
                                                errors.chat_model,
                                            )}
                                        >
                                            <SelectValue placeholder="Selecciona el modelo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gpt-5.6-luna">
                                                GPT-5.6 Luna · económico
                                            </SelectItem>
                                            <SelectItem value="gpt-5.6-terra">
                                                GPT-5.6 Terra · equilibrado
                                            </SelectItem>
                                            <SelectItem value="gpt-5.6-sol">
                                                GPT-5.6 Sol · máxima capacidad
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Luna es la opción de costo contenido
                                        para el uso cotidiano.
                                    </FieldDescription>
                                    <InputError message={errors.chat_model} />
                                </Field>

                                <Field
                                    data-invalid={Boolean(
                                        errors.chat_reasoning_effort,
                                    )}
                                >
                                    <FieldLabel htmlFor="assistant-reasoning-effort">
                                        Esfuerzo de razonamiento
                                    </FieldLabel>
                                    <Select
                                        name="chat_reasoning_effort"
                                        defaultValue={
                                            configuration.chat_reasoning_effort
                                        }
                                    >
                                        <SelectTrigger
                                            id="assistant-reasoning-effort"
                                            aria-invalid={Boolean(
                                                errors.chat_reasoning_effort,
                                            )}
                                        >
                                            <SelectValue placeholder="Selecciona el esfuerzo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Sin razonamiento
                                            </SelectItem>
                                            <SelectItem value="low">
                                                Bajo
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Medio
                                            </SelectItem>
                                            <SelectItem value="high">
                                                Alto
                                            </SelectItem>
                                            <SelectItem value="xhigh">
                                                Muy alto
                                            </SelectItem>
                                            <SelectItem value="max">
                                                Máximo
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Medio equilibra calidad, costo y tiempo
                                        de respuesta.
                                    </FieldDescription>
                                    <InputError
                                        message={errors.chat_reasoning_effort}
                                    />
                                </Field>
                            </FieldGroup>

                            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                                Las fotos editoriales nuevas de rutas y POIs se
                                describen con{' '}
                                <span className="text-foreground">
                                    {configuration.vision_model ??
                                        'gpt-5.6-luna'}
                                </span>{' '}
                                con esfuerzo{' '}
                                <span className="text-foreground">
                                    {configuration.vision_reasoning_effort}
                                </span>
                                . No se envían imágenes de incidencias de
                                ciclistas.
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Guardar configuración
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

function SettingValue({ value }: { value: SettingValue }) {
    if (typeof value === 'boolean') {
        return <span>{value ? 'Disponible' : 'No disponible'}</span>;
    }

    return <span>{String(value ?? 'Sin datos')}</span>;
}

AdminSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Información técnica',
            href: SystemSettingsController.url(),
        },
    ],
};
