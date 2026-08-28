import { Head } from '@inertiajs/react';
import { AppWindow, Database, Plug, Rocket, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SystemSettingsController from '@/actions/App/Http/Controllers/Admin/SystemSettingsController';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

    return (
        <>
            <Head title="Información técnica" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Información técnica"
                    description="Estado actual de la aplicación y sus servicios. Los valores sensibles no se exponen."
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
