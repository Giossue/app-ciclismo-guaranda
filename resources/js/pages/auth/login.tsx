import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email Input */}
                            <div className="grid gap-1">
                                <Label htmlFor="email" className="sr-only">
                                    Correo electrónico
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="Correo electrónico"
                                        className="h-13 pl-12"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-1">
                                <Label htmlFor="password" className="sr-only">
                                    Contraseña
                                </Label>
                                <div className="relative flex items-center">
                                    <Lock className="pointer-events-none absolute left-4 z-10 size-5 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Contraseña"
                                        className="h-13 pl-12"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me and Password Reset Row */}
                            <div className="flex items-center justify-between px-0.5">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-xs font-semibold text-muted-foreground"
                                    >
                                        Recordarme
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        className="text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground"
                                        tabIndex={5}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black tracking-wider text-primary-foreground uppercase shadow-md transition-all duration-300 hover:-translate-y-[1px] hover:bg-[var(--primary-hover)] hover:shadow-[0_8px_20px_var(--glow-color)] active:translate-y-0 active:scale-[0.99]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="text-primary-foreground" />
                                ) : (
                                    <>
                                        <span>Iniciar sesión</span>
                                        <ArrowRight className="size-4.5" />
                                    </>
                                )}
                            </Button>

                            {/* Social Login Separator */}
                            <div className="flex items-center gap-3 py-1.5 text-[var(--fs-caption)] font-black tracking-widest text-muted-foreground uppercase">
                                <div className="h-px flex-1 bg-border" />
                                <span>O inicia sesión con</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:shadow active:scale-95"
                                    aria-label="Iniciar sesión con Google"
                                >
                                    <svg
                                        className="size-5 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:shadow active:scale-95"
                                    aria-label="Iniciar sesión con Facebook"
                                >
                                    <svg
                                        className="size-5.5 fill-[#1877F2]"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:shadow active:scale-95"
                                    aria-label="Iniciar sesión con Apple"
                                >
                                    <svg
                                        className="size-5.5 fill-foreground"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.13.01.27.02.4.02.83 0 1.95-.5 2.41-1.35z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Create account link */}
                            <div className="mt-1 text-center">
                                <Link
                                    href={register()}
                                    className="font-sans text-xs font-bold tracking-widest text-primary uppercase underline underline-offset-4 transition-colors duration-150 hover:text-[var(--primary-hover)]"
                                    tabIndex={5}
                                >
                                    Crear cuenta nueva
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-success">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Inicia sesión en tu cuenta',
    description: 'Ingresa tu correo y contraseña para continuar',
};
