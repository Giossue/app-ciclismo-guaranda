import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
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

            <h1 className="sr-only">Configuración de perfil</h1>

            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title="Perfil"
                    description="Actualiza tus datos personales y correo electrónico"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>

                                <Input
                                    id="name"
                                    defaultValue={user.name}
                                    name="name"
                                    required
                                    autoComplete="given-name"
                                    placeholder="Nombre"
                                    aria-invalid={Boolean(errors.name)}
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Apellido</Label>

                                <Input
                                    id="last_name"
                                    defaultValue={user.last_name ?? ''}
                                    name="last_name"
                                    required
                                    autoComplete="family-name"
                                    placeholder="Apellido"
                                    aria-invalid={Boolean(errors.last_name)}
                                />

                                <InputError message={errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender_id">Género</Label>
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
                                        className="w-full"
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
                                    defaultValue={user.birth_date ?? ''}
                                    name="birth_date"
                                    required
                                    autoComplete="bday"
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
                                    defaultValue={user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Correo electrónico"
                                    aria-invalid={Boolean(errors.email)}
                                />

                                <InputError message={errors.email} />
                            </div>

                            {mustVerifyEmail &&
                                user.email_verified_at === null && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Tu correo electrónico no está
                                            verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Haz clic aquí para reenviar el
                                                correo de verificación.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-primary">
                                                Se envió un nuevo enlace de
                                                verificación a tu correo.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Guardar
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
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
