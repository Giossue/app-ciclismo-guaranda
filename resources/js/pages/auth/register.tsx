import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Lock,
    Mail,
    ShieldAlert,
    User,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Nombre & Apellido Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Nombre */}
                                <div className="grid gap-1">
                                    <Label htmlFor="name" className="sr-only">
                                        Nombre
                                    </Label>
                                    <div className="relative flex items-center">
                                        <User className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
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
                                            className="h-13 pl-12"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Apellido */}
                                <div className="grid gap-1">
                                    <Label
                                        htmlFor="last_name"
                                        className="sr-only"
                                    >
                                        Apellido
                                    </Label>
                                    <div className="relative flex items-center">
                                        <User className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                        <Input
                                            id="last_name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="family-name"
                                            name="last_name"
                                            placeholder="Apellido"
                                            aria-invalid={Boolean(
                                                errors.last_name,
                                            )}
                                            className="h-13 pl-12"
                                        />
                                    </div>
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            {/* Género & Fecha Nacimiento Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Género */}
                                <div className="grid gap-1">
                                    <Label
                                        htmlFor="gender_id"
                                        className="sr-only"
                                    >
                                        Género
                                    </Label>
                                    <div className="relative flex items-center">
                                        <User className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                        <Select name="gender_id" required>
                                            <SelectTrigger
                                                id="gender_id"
                                                className="h-13 w-full pl-12 text-left font-normal"
                                                tabIndex={3}
                                                aria-invalid={Boolean(
                                                    errors.gender_id,
                                                )}
                                            >
                                                <SelectValue placeholder="Género" />
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
                                    </div>
                                    <InputError message={errors.gender_id} />
                                </div>

                                {/* Fecha de nacimiento */}
                                <div className="grid gap-1">
                                    <Label
                                        htmlFor="birth_date"
                                        className="sr-only"
                                    >
                                        Fecha de nacimiento
                                    </Label>
                                    <div className="relative flex items-center">
                                        <Calendar className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            required
                                            tabIndex={4}
                                            autoComplete="bday"
                                            name="birth_date"
                                            aria-invalid={Boolean(
                                                errors.birth_date,
                                            )}
                                            className="h-13 pl-12"
                                        />
                                    </div>
                                    <InputError message={errors.birth_date} />
                                </div>
                            </div>

                            {/* Correo electrónico */}
                            <div className="grid gap-1">
                                <Label htmlFor="email" className="sr-only">
                                    Correo electrónico
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={5}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="Correo electrónico"
                                        aria-invalid={Boolean(errors.email)}
                                        className="h-13 pl-12"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Contraseña & Confirmación Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Contraseña */}
                                <div className="grid gap-1">
                                    <Label
                                        htmlFor="password"
                                        className="sr-only"
                                    >
                                        Contraseña
                                    </Label>
                                    <div className="relative flex items-center">
                                        <Lock className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                        <PasswordInput
                                            id="password"
                                            required
                                            tabIndex={6}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Contraseña"
                                            passwordrules={passwordRules}
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                errors.password,
                                            )}
                                            className="h-13 pl-12"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Confirmar contraseña */}
                                <div className="grid gap-1">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="sr-only"
                                    >
                                        Confirmar contraseña
                                    </Label>
                                    <div className="relative flex items-center">
                                        <Lock className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                        <PasswordInput
                                            id="password_confirmation"
                                            required
                                            tabIndex={7}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Confirmar"
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
                                            className="h-13 pl-12"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <PasswordChecklist checks={passwordChecks} />

                            <Button
                                type="submit"
                                className="mt-1 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black tracking-wider text-primary-foreground uppercase shadow-md transition-all duration-300 hover:-translate-y-[1px] hover:bg-[var(--primary-hover)] hover:shadow-[0_8px_20px_var(--glow-color)] active:translate-y-0 active:scale-[0.99]"
                                tabIndex={8}
                                data-test="register-user-button"
                                disabled={!passwordIsReady || processing}
                            >
                                {processing ? (
                                    <Spinner className="text-primary-foreground" />
                                ) : (
                                    <>
                                        <span>Crear cuenta</span>
                                        <ArrowRight className="size-4.5" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="mt-1 text-center text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                href={login()}
                                className="font-sans text-xs font-bold tracking-widest text-primary uppercase underline underline-offset-4 transition-colors duration-150 hover:text-[var(--primary-hover)]"
                                tabIndex={9}
                            >
                                Inicia sesión
                            </Link>
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
        <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                    Valida tu contraseña antes de enviar. La revisión contra
                    contraseñas filtradas se confirma en el servidor al crear la
                    cuenta.
                </p>
            </div>
            <ul className="grid gap-1.5">
                {checks.map((check) => (
                    <li
                        key={check.label}
                        className="flex items-center gap-2 text-xs"
                    >
                        {check.valid ? (
                            <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                            <XCircle className="size-4 text-muted-foreground" />
                        )}
                        <span
                            className={
                                check.valid
                                    ? 'font-bold text-foreground'
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
