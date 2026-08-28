import { Form, Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { CatalogOption } from '@/types';

type Props = {
    genders: CatalogOption[];
    passwordRules: string;
};

export default function Register({ genders, passwordRules }: Props) {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const passwordChecks = useMemo(
        () => buildPasswordChecks(password, passwordConfirmation),
        [password, passwordConfirmation],
    );
    const passwordIsReady = passwordChecks.every((check) => check.valid);

    return (
        <>
            <Head title="Crear cuenta" />

            <div className="flex w-full flex-col items-center gap-5">
                <header className="text-center">
                    <h1
                        id="register-title"
                        className="font-display text-2xl leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-3xl"
                    >
                        Crea tu cuenta
                    </h1>
                </header>
                <Card
                    aria-labelledby="register-title"
                    className="w-full gap-6 py-6 lg:px-2"
                >
                    <CardContent className="lg:px-6">
                        <Form
                            {...store.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FieldGroup className="lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5">
                                    <Field data-invalid={Boolean(errors.name)}>
                                        <FieldLabel htmlFor="name">
                                            Nombre
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            autoComplete="given-name"
                                            placeholder="Ej. María"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(errors.last_name)}
                                    >
                                        <FieldLabel htmlFor="last_name">
                                            Apellido
                                        </FieldLabel>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            name="last_name"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Ej. González"
                                            aria-invalid={Boolean(
                                                errors.last_name,
                                            )}
                                        />
                                        <InputError
                                            message={errors.last_name}
                                        />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(errors.gender_id)}
                                    >
                                        <FieldLabel htmlFor="gender_id">
                                            Género
                                        </FieldLabel>
                                        <Select name="gender_id" required>
                                            <SelectTrigger
                                                id="gender_id"
                                                aria-invalid={Boolean(
                                                    errors.gender_id,
                                                )}
                                            >
                                                <SelectValue placeholder="Selecciona tu género" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {genders.map((gender) => (
                                                        <SelectItem
                                                            key={gender.id}
                                                            value={String(
                                                                gender.id,
                                                            )}
                                                        >
                                                            {gender.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.gender_id}
                                        />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(
                                            errors.birth_date,
                                        )}
                                    >
                                        <FieldLabel htmlFor="birth_date">
                                            Fecha de nacimiento
                                        </FieldLabel>
                                        <DatePicker
                                            id="birth_date"
                                            name="birth_date"
                                            required
                                            autoComplete="bday"
                                            placeholder="Selecciona tu fecha de nacimiento"
                                            aria-invalid={Boolean(
                                                errors.birth_date,
                                            )}
                                        />
                                        <InputError
                                            message={errors.birth_date}
                                        />
                                    </Field>

                                    <Field
                                        className="lg:col-span-2"
                                        data-invalid={Boolean(errors.email)}
                                    >
                                        <FieldLabel htmlFor="email">
                                            Correo electrónico
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="nombre@correo.com"
                                            aria-invalid={Boolean(errors.email)}
                                        />
                                        <InputError message={errors.email} />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(errors.password)}
                                    >
                                        <FieldLabel htmlFor="password">
                                            Contraseña
                                        </FieldLabel>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            passwordrules={passwordRules}
                                            placeholder="Crea una contraseña segura"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                errors.password,
                                            )}
                                        />
                                        <InputError message={errors.password} />
                                    </Field>

                                    <Field
                                        data-invalid={Boolean(
                                            errors.password_confirmation,
                                        )}
                                    >
                                        <FieldLabel htmlFor="password_confirmation">
                                            Confirmar contraseña
                                        </FieldLabel>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            passwordrules={passwordRules}
                                            placeholder="Repite tu contraseña"
                                            value={passwordConfirmation}
                                            onChange={(event) =>
                                                setPasswordConfirmation(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                errors.password_confirmation,
                                            )}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </Field>

                                    <div className="lg:col-span-2">
                                        <PasswordChecklist
                                            checks={passwordChecks}
                                        />
                                    </div>

                                    <Field className="lg:col-span-2 lg:mx-auto lg:max-w-sm">
                                        <Button
                                            type="submit"
                                            className="font-bold"
                                            disabled={
                                                !passwordIsReady || processing
                                            }
                                            data-test="register-user-button"
                                        >
                                            {processing && <Spinner />}
                                            Crear cuenta
                                        </Button>
                                        <FieldDescription className="text-center">
                                            ¿Ya tienes una cuenta?{' '}
                                            <Link href={login()}>
                                                Inicia sesión
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

type PasswordCheck = {
    label: string;
    valid: boolean;
};

function buildPasswordChecks(
    password: string,
    confirmation: string,
): PasswordCheck[] {
    return [
        { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
        {
            label: 'Incluye mayúsculas y minúsculas',
            valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
        },
        { label: 'Incluye al menos un número', valid: /\d/.test(password) },
        { label: 'Incluye un símbolo', valid: /[^A-Za-z0-9]/.test(password) },
        {
            label: 'La confirmación coincide',
            valid: password.length > 0 && password === confirmation,
        },
    ];
}

function PasswordChecklist({ checks }: { checks: PasswordCheck[] }) {
    return (
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {checks.map((check) => (
                <li key={check.label} className="flex items-center gap-2">
                    {check.valid ? (
                        <CheckCircle2 className="size-4 text-success" />
                    ) : (
                        <XCircle className="size-4" />
                    )}
                    <span>{check.label}</span>
                </li>
            ))}
        </ul>
    );
}
