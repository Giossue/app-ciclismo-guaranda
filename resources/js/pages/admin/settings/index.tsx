import { Head } from '@inertiajs/react';
import {
    AppWindow,
    CheckCircle2,
    CircleAlert,
    Database,
    Plug,
    Rocket,
    ServerCog,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import SystemSettingsController from '@/actions/App/Http/Controllers/Admin/SystemSettingsController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type SettingValue = string | number | boolean | null;

type SettingSection =
    'application' | 'drivers' | 'integrations' | 'security' | 'deployment';

type Settings = Partial<Record<SettingSection, Record<string, SettingValue>>>;

type Props = {
    settings: Settings;
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
        description: 'n8n, PostGIS y almacenamiento.',
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
    n8n_webhook_configured: 'Webhook n8n configurado',
    n8n_timeout_seconds: 'Tiempo de espera de n8n',
    postgis_available: 'PostGIS disponible',
    public_storage_linked: 'Almacenamiento público enlazado',
    app_key_configured: 'APP_KEY configurada',
    https_url: 'URL pública con HTTPS',
    mailer: 'Correo',
    run_seeders: 'Ejecución de seeders',
    mobile_server_url_env: 'Servidor para la app móvil',
    migrations_table_exists: 'Tabla de migraciones',
};

export default function AdminSettingsIndex({ settings }: Props) {
    const availableSections = sections.filter(
        (section) => settings[section.id],
    );
    const [activeSection, setActiveSection] = useState<SettingSection>(
        availableSections[0]?.id ?? 'application',
    );
    const selectedSection =
        availableSections.find((section) => section.id === activeSection) ??
        availableSections[0];
    const selectedValues = selectedSection
        ? (settings[selectedSection.id] ?? {})
        : {};

    return (
        <>
            <Head title="Configuración" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Configuración operativa"
                        description="Consulta el estado del entorno y de los servicios conectados. Los valores sensibles no se exponen."
                    />
                    <Badge variant="outline">
                        <ServerCog data-icon="inline-start" />
                        {String(settings.application?.environment ?? 'Entorno')}
                    </Badge>
                </div>

                <section className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                    <nav
                        aria-label="Secciones de configuración"
                        className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
                    >
                        {availableSections.map((section) => {
                            const Icon = section.icon;
                            const selected = section.id === selectedSection?.id;

                            return (
                                <Button
                                    key={section.id}
                                    type="button"
                                    variant={selected ? 'secondary' : 'ghost'}
                                    className="h-auto min-w-48 shrink-0 justify-start px-3 py-3 text-left lg:w-full"
                                    aria-current={selected ? 'page' : undefined}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <Icon data-icon="inline-start" />
                                    <span className="flex min-w-0 flex-col gap-1">
                                        <span>{section.label}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {section.description}
                                        </span>
                                    </span>
                                </Button>
                            );
                        })}
                    </nav>

                    {selectedSection ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedSection.label}</CardTitle>
                                <CardDescription>
                                    {selectedSection.description} Valores leídos
                                    del entorno actual.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="divide-y divide-border">
                                    {Object.entries(selectedValues).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <dt className="text-sm text-foreground">
                                                    {valueLabels[key] ?? key}
                                                </dt>
                                                <dd className="text-sm text-muted-foreground sm:text-right">
                                                    <SettingValue
                                                        value={value}
                                                    />
                                                </dd>
                                            </div>
                                        ),
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    ) : null}
                </section>
            </div>
        </>
    );
}

function SettingValue({ value }: { value: SettingValue }) {
    if (typeof value === 'boolean') {
        return (
            <Badge variant={value ? 'success' : 'destructive'}>
                {value ? (
                    <CheckCircle2 data-icon="inline-start" />
                ) : (
                    <CircleAlert data-icon="inline-start" />
                )}
                {value ? 'Disponible' : 'No disponible'}
            </Badge>
        );
    }

    return <span>{String(value ?? 'Sin datos')}</span>;
}

AdminSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Configuración',
            href: SystemSettingsController.url(),
        },
    ],
};
