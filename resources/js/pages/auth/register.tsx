import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="given-name"
                                    name="name"
                                    placeholder="Nombre"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Apellido</Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="family-name"
                                    name="last_name"
                                    placeholder="Apellido"
                                    aria-invalid={Boolean(errors.last_name)}
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender_id">Género</Label>
                                <Select name="gender_id" required>
                                    <SelectTrigger
                                        id="gender_id"
                                        className="w-full"
                                        tabIndex={3}
                                        aria-invalid={Boolean(errors.gender_id)}
                                    >
                                        <SelectValue placeholder="Selecciona tu género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {genders.map((gender) => (
                                                <SelectItem
                                                    key={gender.id}
                                                    value={String(gender.id)}
                                                >
                                                    {gender.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">
                                    Fecha de nacimiento
                                </Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    required
                                    tabIndex={4}
                                    autoComplete="bday"
                                    name="birth_date"
                                    aria-invalid={Boolean(errors.birth_date)}
                                />
                                <InputError message={errors.birth_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={5}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    aria-invalid={Boolean(errors.email)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Contraseña segura"
                                    passwordrules={passwordRules}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.currentTarget.value)
                                    }
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={7}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirmar contraseña"
                                    passwordrules={passwordRules}
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
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <PasswordChecklist checks={passwordChecks} />

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={8}
                                data-test="register-user-button"
                                disabled={!passwordIsReady || processing}
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink href={login()} tabIndex={9}>
                                Inicia sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
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
        {
            label: 'Mínimo 12 caracteres',
            valid: password.length >= 12,
        },
        {
            label: 'Incluye mayúsculas y minúsculas',
            valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
        },
        {
            label: 'Incluye al menos un número',
            valid: /\d/.test(password),
        },
        {
            label: 'Incluye un símbolo',
            valid: /[^A-Za-z0-9]/.test(password),
        },
        {
            label: 'La confirmación coincide',
            valid: password.length > 0 && password === confirmation,
        },
    ];
}

function PasswordChecklist({ checks }: { checks: PasswordCheck[] }) {
    return (
        <div className="grid gap-3 rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-start gap-2 text-sm">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                    Valida tu contraseña antes de enviar. La revisión contra
                    contraseñas filtradas se confirma en el servidor al crear la
                    cuenta.
                </p>
            </div>
            <ul className="grid gap-2">
                {checks.map((check) => (
                    <li
                        key={check.label}
                        className="flex items-center gap-2 text-sm"
                    >
                        {check.valid ? (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        ) : (
                            <XCircle className="size-4 text-muted-foreground" />
                        )}
                        <span
                            className={
                                check.valid
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground'
                            }
                        >
                            {check.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

Register.layout = {
    title: 'Crear una cuenta',
    description: 'Completa tus datos para usar Guaranda Go',
};
