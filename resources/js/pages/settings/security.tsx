import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Ajustes de seguridad" />

            <div className="ueb-page flex flex-col gap-5 md:w-full">
                {/* Header with back button */}
                <div className="flex items-center gap-3 border-b border-[var(--input-border)]/40 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-11 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--input-border)] hover:text-[var(--text-color)]"
                    >
                        <Link href="/menu" replace>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-base leading-none font-black text-[var(--text-color)]">
                            Seguridad
                        </h1>
                        <p className="mt-1 text-[var(--fs-caption)] text-[var(--text-secondary)]">
                            Administra tu contraseña, doble factor y accesos
                        </p>
                    </div>
                </div>

                {/* Update Password Form */}
                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="flex flex-col gap-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="current_password"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Contraseña actual
                                </Label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="h-12 w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                    autoComplete="current-password"
                                    placeholder="Contraseña actual"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Nueva contraseña
                                </Label>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="h-12 w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                    autoComplete="new-password"
                                    placeholder="Nueva contraseña"
                                    passwordrules={props.passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Confirmar contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="h-12 w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                    autoComplete="new-password"
                                    placeholder="Confirmar contraseña"
                                    passwordrules={props.passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                disabled={processing}
                                data-test="update-password-button"
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase shadow-md transition-all duration-300 hover:bg-[#9ad000] hover:shadow-[0_8px_20px_rgba(178,240,0,0.15)] active:scale-[0.99]"
                            >
                                Actualizar contraseña
                            </Button>
                        </>
                    )}
                </Form>

                {/* Two Factor Authentication Section */}
                <div className="border-t border-[var(--input-border)]/40 pt-4">
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </div>

                {/* Passkeys Section */}
                <div className="border-t border-[#2c302c]/40 pt-4">
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </div>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Ajustes de seguridad',
            href: edit(),
        },
    ],
};
