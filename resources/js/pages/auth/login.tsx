import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { register } from '@/routes';
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

            <div className="flex w-full flex-col items-center gap-5">
                <header className="text-center">
                    <h1
                        id="login-title"
                        className="font-display text-2xl leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-3xl"
                    >
                        Inicia sesión
                    </h1>
                </header>
                <Card
                    aria-labelledby="login-title"
                    className="w-full gap-6 py-6 lg:max-w-md"
                >
                    <CardContent>
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
                            {({ processing }) => (
                                <FieldGroup>
                                    <Field>
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
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </Field>

                                    <Field>
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
                                        />
                                    </Field>

                                    <Field className="flex-row items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                        />
                                        <FieldLabel
                                            htmlFor="remember"
                                            className="cursor-pointer text-sm font-normal"
                                        >
                                            Recordarme
                                        </FieldLabel>
                                    </Field>

                                    <Field>
                                        <Button
                                            type="submit"
                                            disabled={processing || !canSubmit}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Iniciar sesión
                                        </Button>
                                        <FieldDescription className="text-center">
                                            ¿No tienes una cuenta?{' '}
                                            <Link href={register()}>
                                                Crea una cuenta
                                            </Link>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function firstError(errors: Record<string, string>): string | undefined {
    return Object.values(errors).find(
        (message): message is string =>
            typeof message === 'string' && message.length > 0,
    );
}
