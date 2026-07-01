import { Head } from '@inertiajs/react';
import { CheckCircle2, CircleAlert, ServerCog } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type SettingValue = string | number | boolean | null;

type Settings = Record<string, Record<string, SettingValue>>;

type Props = {
    settings: Settings;
};

const labels: Record<string, string> = {
    application: 'Aplicación',
    drivers: 'Servicios de Laravel',
    integrations: 'Integraciones',
    security: 'Seguridad',
    deployment: 'Despliegue',
};

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
    n8n_timeout_seconds: 'Tiempo de espera n8n',
    postgis_available: 'PostGIS disponible',
    public_storage_linked: 'Almacenamiento público enlazado',
    app_key_configured: 'APP_KEY configurada',
    https_url: 'APP_URL HTTPS',
    mailer: 'Correo',
    run_seeders: 'RUN_SEEDERS',
    mobile_server_url_env: 'URL móvil',
    migrations_table_exists: 'Tabla de migraciones',
};

export default function AdminSettingsIndex({ settings }: Props) {
    return (
        <>
            <Head title="Configuración" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Configuración operativa"
                        description="Estado real del entorno Laravel, Dokploy, PostGIS, n8n, storage, colas, sesiones y despliegue."
                    />
                    <Badge variant="secondary">
                        <ServerCog data-icon="inline-start" />
                        Producción
                    </Badge>
                </div>

                <section className="grid gap-4 lg:grid-cols-2">
                    {Object.entries(settings).map(([section, values]) => (
                        <Card key={section}>
                            <CardHeader>
                                <CardTitle>
                                    {labels[section] ?? section}
                                </CardTitle>
                                <CardDescription>
                                    Valores de configuración leídos desde el
                                    entorno actual. No se exponen secretos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {Object.entries(values).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                                    >
                                        <div className="grid gap-1">
                                            <span className="text-sm font-medium">
                                                {valueLabels[key] ?? key}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {key}
                                            </span>
                                        </div>
                                        <SettingBadge value={value} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </>
    );
}

function SettingBadge({ value }: { value: SettingValue }) {
    if (typeof value === 'boolean') {
        return (
            <Badge variant={value ? 'secondary' : 'destructive'}>
                {value ? (
                    <CheckCircle2 data-icon="inline-start" />
                ) : (
                    <CircleAlert data-icon="inline-start" />
                )}
                {value ? 'Sí' : 'No'}
            </Badge>
        );
    }

    return <Badge variant="outline">{String(value ?? 'Sin datos')}</Badge>;
}

AdminSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Configuración',
            href: '/admin/settings',
        },
    ],
};
