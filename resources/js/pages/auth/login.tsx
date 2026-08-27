import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Iniciar sesión" />

            <Card>
                <CardHeader>
                    <CardTitle>Inicia sesión</CardTitle>
                    <CardDescription>
                        Ingresa tus datos para continuar en Guaranda Go.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...store.form()} resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <FieldGroup>
                                <Field data-invalid={Boolean(errors.email)}>
                                    <FieldLabel htmlFor="email">
                                        Correo electrónico
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="correo@ejemplo.com"
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                    <InputError message={errors.email} />
                                </Field>

                                <Field data-invalid={Boolean(errors.password)}>
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
                                        required
                                        autoComplete="current-password"
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                    <InputError message={errors.password} />
                                </Field>

                                <Field className="flex-row items-center gap-2">
                                    <Checkbox id="remember" name="remember" />
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
                                        disabled={processing}
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

                    {status && (
                        <p role="status" className="mt-5 text-sm text-success">
                            {status}
                        </p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
