import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToastMessage } from '@/hooks/use-toast-message';
import { home, register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    useToastMessage(status);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const canSubmit = email.trim().length > 0 && password.length > 0;

    return (
        <>
            <Head title="Iniciar sesión" />

            <Card
                aria-labelledby="login-title"
                className="w-full gap-0 overflow-hidden rounded-[var(--radius-map)] py-0 lg:grid lg:min-h-[34rem] lg:grid-cols-2"
            >
                <section className="relative hidden overflow-hidden bg-[var(--map-background)] p-10 text-inverse-foreground lg:flex lg:flex-col lg:justify-between">
                    <LoginTerrain />

                    <Link
                        href={home()}
                        className="relative flex w-fit items-center gap-3 rounded-md text-inverse-foreground outline-none"
                        aria-label="Ir al inicio de Guaranda Go"
                    >
                        <AppLogoIcon className="size-12 shrink-0" />
                        <span className="text-lg font-black tracking-[-0.04em]">
                            Guaranda{' '}
                            <span className="text-brand-accent">Go</span>
                        </span>
                    </Link>

                    <div className="relative flex max-w-sm flex-col gap-5">
                        <p className="text-xs font-black tracking-[0.14em] text-brand-accent uppercase">
                            Cicloturismo en Bolívar
                        </p>
                        <h2 className="font-display text-4xl leading-[1.05] font-black tracking-[-0.055em] text-inverse-foreground">
                            Tu próxima ruta comienza aquí.
                        </h2>
                        <p className="max-w-xs text-base leading-relaxed text-inverse-muted-foreground">
                            Explora rutas oficiales, prepárate para zonas sin
                            conexión y registra cada recorrido por la provincia.
                        </p>
                    </div>

                    <p className="relative max-w-xs text-xs leading-relaxed font-bold tracking-[0.08em] text-inverse-muted-foreground uppercase">
                        Rutas claras · Mapas offline · Seguimiento GPS
                    </p>
                </section>

                <section className="flex min-w-0 flex-col justify-center py-6 sm:py-8 lg:py-10">
                    <CardHeader className="items-center px-5 text-center sm:px-8 lg:px-12">
                        <Link
                            href={home()}
                            className="mb-2 flex items-center gap-2 rounded-md text-foreground outline-none lg:hidden"
                            aria-label="Ir al inicio de Guaranda Go"
                        >
                            <AppLogoIcon className="size-12 shrink-0" />
                            <span className="font-display text-lg font-black tracking-[-0.04em]">
                                Guaranda <span className="text-link">Go</span>
                            </span>
                        </Link>
                        <CardTitle>
                            <h1 id="login-title">Bienvenido de nuevo</h1>
                        </CardTitle>
                        <CardDescription className="max-w-md text-balance">
                            Ingresa tus credenciales para continuar tu próxima
                            aventura en bicicleta.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-5 px-5 sm:px-8 lg:px-12">
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            onError={(errors) =>
                                toast.error('No se pudo iniciar sesión', {
                                    description:
                                        firstError(errors) ??
                                        'Revisa tus datos e inténtalo nuevamente.',
                                })
                            }
                        >
                            {({ processing, errors }) => (
                                <FieldGroup className="gap-4">
                                    <Field data-invalid={Boolean(errors.email)}>
                                        <FieldLabel htmlFor="email">
                                            Correo electrónico
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            required
                                            autoComplete="email"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            placeholder="nombre@correo.com"
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={
                                                errors.email
                                                    ? 'email-error'
                                                    : undefined
                                            }
                                        />
                                        <InputError
                                            id="email-error"
                                            message={errors.email}
                                        />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(errors.password)}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <FieldLabel htmlFor="password">
                                                Contraseña
                                            </FieldLabel>
                                            {canResetPassword && (
                                                <Link
                                                    href={request()}
                                                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                                >
                                                    ¿La olvidaste?
                                                </Link>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            required
                                            autoComplete="current-password"
                                            placeholder="Ingresa tu contraseña"
                                            aria-invalid={Boolean(
                                                errors.password,
                                            )}
                                            aria-describedby={
                                                errors.password
                                                    ? 'password-error'
                                                    : undefined
                                            }
                                        />
                                        <InputError
                                            id="password-error"
                                            message={errors.password}
                                        />
                                    </Field>

                                    <Field className="min-h-[var(--control-height)] flex-row items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                        />
                                        <FieldLabel
                                            htmlFor="remember"
                                            className="flex min-h-[var(--control-height)] flex-1 cursor-pointer items-center text-sm font-normal"
                                        >
                                            Recordarme
                                        </FieldLabel>
                                    </Field>

                                    <Field>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="min-h-[var(--control-height)] w-full"
                                            disabled={processing || !canSubmit}
                                            data-test="login-button"
                                        >
                                            {processing && (
                                                <Spinner data-icon="inline-start" />
                                            )}
                                            Iniciar sesión
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            )}
                        </Form>
                    </CardContent>

                    <CardFooter className="mt-5 justify-center px-5 sm:px-8 lg:px-12">
                        <FieldDescription className="text-center">
                            ¿Aún no tienes una cuenta?{' '}
                            <Link href={register()}>Crear cuenta</Link>
                        </FieldDescription>
                    </CardFooter>
                </section>
            </Card>
        </>
    );
}

function LoginTerrain() {
    return (
        <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 460 560"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M-30 170C72 101 149 164 245 110C330 62 407 97 505 40"
                className="stroke-primary/35"
                strokeWidth="1.5"
            />
            <path
                d="M-35 214C70 143 154 205 254 151C341 104 416 137 510 82"
                className="stroke-primary/25"
                strokeWidth="1.5"
            />
            <path
                d="M-60 448C49 365 118 443 218 374C309 312 389 350 512 260"
                className="stroke-inverse-foreground/10"
                strokeWidth="1.5"
            />
            <path
                d="M-53 501C54 415 136 493 231 426C319 363 403 401 516 316"
                className="stroke-inverse-foreground/10"
                strokeWidth="1.5"
            />
            <path
                d="M70 348C132 318 174 281 225 294C285 308 318 375 389 352"
                className="stroke-primary"
                strokeWidth="2"
                strokeDasharray="5 9"
            />
            <circle cx="70" cy="348" r="5" className="fill-primary" />
            <circle cx="389" cy="352" r="5" className="fill-primary" />
        </svg>
    );
}

function firstError(errors: Record<string, string>): string | undefined {
    return Object.values(errors).find(
        (message): message is string =>
            typeof message === 'string' && message.length > 0,
    );
}
