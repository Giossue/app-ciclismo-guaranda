import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
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
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth, CatalogOption } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    genders,
    mustVerifyEmail,
    status,
}: {
    genders: CatalogOption[];
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    return (
        <>
            <Head title="Configuración de perfil" />

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
                            Perfil
                        </h1>
                        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                            Actualiza tus datos personales y correo electrónico
                        </p>
                    </div>
                </div>

                {/* Form fields */}
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="name"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    defaultValue={user.name}
                                    name="name"
                                    required
                                    autoComplete="given-name"
                                    placeholder="Nombre"
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-12 rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="last_name"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Apellido
                                </Label>
                                <Input
                                    id="last_name"
                                    defaultValue={user.last_name ?? ''}
                                    name="last_name"
                                    required
                                    autoComplete="family-name"
                                    placeholder="Apellido"
                                    aria-invalid={Boolean(errors.last_name)}
                                    className="h-12 rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="gender_id"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Género
                                </Label>
                                <Select
                                    name="gender_id"
                                    defaultValue={
                                        user.gender_id === null
                                            ? undefined
                                            : String(user.gender_id)
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="gender_id"
                                        className="h-12 w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-color)] focus:border-[#b2f000] focus:ring-[#b2f000]/10"
                                        aria-invalid={Boolean(errors.gender_id)}
                                    >
                                        <SelectValue placeholder="Selecciona tu género" />
                                    </SelectTrigger>
                                    <SelectContent className="border-[var(--input-border)] bg-[var(--bg-card-color)] text-[var(--text-color)]">
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

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="birth_date"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Fecha de nacimiento
                                </Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    defaultValue={user.birth_date ?? ''}
                                    name="birth_date"
                                    required
                                    autoComplete="bday"
                                    aria-invalid={Boolean(errors.birth_date)}
                                    className="h-12 rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                />
                                <InputError message={errors.birth_date} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="pl-0.5 text-xs font-bold text-[var(--text-secondary)]"
                                >
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Correo electrónico"
                                    aria-invalid={Boolean(errors.email)}
                                    className="h-12 rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus-visible:border-[#b2f000] focus-visible:ring-4 focus-visible:ring-[#b2f000]/10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {mustVerifyEmail &&
                                user.email_verified_at === null && (
                                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-xs text-yellow-400">
                                        <p>
                                            Tu correo electrónico no está
                                            verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="underline decoration-yellow-500/50 transition-colors duration-200 hover:text-white"
                                            >
                                                Haz clic aquí para reenviar el
                                                correo de verificación.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 font-bold text-[#b2f000]">
                                                Se envió un nuevo enlace de
                                                verificación a tu correo.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase shadow-md transition-all duration-300 hover:bg-[#9ad000] hover:shadow-[0_8px_20px_rgba(178,240,0,0.15)] active:scale-[0.99]"
                            >
                                Guardar cambios
                            </Button>
                        </>
                    )}
                </Form>

                {/* Account Deactivation section */}
                <div className="border-t border-[var(--input-border)]/40 pt-4">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Configuración de perfil',
            href: edit(),
        },
    ],
};
