import { Form, Head, usePage } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import type { Auth, CatalogOption } from '@/types';

type ManagedUser = {
    id: number;
    role_id: number | null;
    gender_id: number | null;
    name: string;
    last_name: string | null;
    birth_date: string | null;
    email: string;
    email_verified_at: string | null;
    active: boolean;
    deleted_at: string | null;
    role: CatalogOption | null;
    gender: CatalogOption | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedUsers = {
    data: ManagedUser[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type PageProps = {
    auth: Auth;
};

type Props = {
    users: PaginatedUsers;
    roles: CatalogOption[];
    genders: CatalogOption[];
};

export default function AdminUsersIndex({ users, roles, genders }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Usuarios"
                    description="Administra roles, perfil y estado de las cuentas de Guaranda Go"
                />

                <div className="grid gap-4">
                    {users.data.map((user) => {
                        const isCurrentUser = auth.user?.id === user.id;

                        return (
                            <Card key={user.id}>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle>
                                                {user.name} {user.last_name}
                                            </CardTitle>
                                            <CardDescription>
                                                {user.email}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={
                                                    user.active
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                            >
                                                {user.active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                            {user.role && (
                                                <Badge variant="outline">
                                                    {user.role.name}
                                                </Badge>
                                            )}
                                            {isCurrentUser && (
                                                <Badge>Tu cuenta</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <Form
                                        {...UserController.update.form(user.id)}
                                        options={{ preserveScroll: true }}
                                        className="grid gap-4 sm:grid-cols-2"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`name-${user.id}`}
                                                    >
                                                        Nombre
                                                    </Label>
                                                    <Input
                                                        id={`name-${user.id}`}
                                                        name="name"
                                                        defaultValue={user.name}
                                                        required
                                                        disabled={isCurrentUser}
                                                        aria-invalid={Boolean(
                                                            errors.name,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`last_name-${user.id}`}
                                                    >
                                                        Apellido
                                                    </Label>
                                                    <Input
                                                        id={`last_name-${user.id}`}
                                                        name="last_name"
                                                        defaultValue={
                                                            user.last_name ?? ''
                                                        }
                                                        required
                                                        disabled={isCurrentUser}
                                                        aria-invalid={Boolean(
                                                            errors.last_name,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.last_name
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`email-${user.id}`}
                                                    >
                                                        Correo electrónico
                                                    </Label>
                                                    <Input
                                                        id={`email-${user.id}`}
                                                        type="email"
                                                        name="email"
                                                        defaultValue={
                                                            user.email
                                                        }
                                                        required
                                                        disabled={isCurrentUser}
                                                        aria-invalid={Boolean(
                                                            errors.email,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={errors.email}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`birth_date-${user.id}`}
                                                    >
                                                        Fecha de nacimiento
                                                    </Label>
                                                    <Input
                                                        id={`birth_date-${user.id}`}
                                                        type="date"
                                                        name="birth_date"
                                                        defaultValue={
                                                            user.birth_date ??
                                                            ''
                                                        }
                                                        required
                                                        disabled={isCurrentUser}
                                                        aria-invalid={Boolean(
                                                            errors.birth_date,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.birth_date
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`gender_id-${user.id}`}
                                                    >
                                                        Género
                                                    </Label>
                                                    <Select
                                                        name="gender_id"
                                                        defaultValue={
                                                            user.gender_id ===
                                                            null
                                                                ? undefined
                                                                : String(
                                                                      user.gender_id,
                                                                  )
                                                        }
                                                        required
                                                        disabled={isCurrentUser}
                                                    >
                                                        <SelectTrigger
                                                            id={`gender_id-${user.id}`}
                                                            className="w-full"
                                                            aria-invalid={Boolean(
                                                                errors.gender_id,
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecciona género" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {genders.map(
                                                                    (
                                                                        gender,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                gender.id
                                                                            }
                                                                            value={String(
                                                                                gender.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                gender.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={
                                                            errors.gender_id
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`role_id-${user.id}`}
                                                    >
                                                        Rol
                                                    </Label>
                                                    <Select
                                                        name="role_id"
                                                        defaultValue={
                                                            user.role_id ===
                                                            null
                                                                ? undefined
                                                                : String(
                                                                      user.role_id,
                                                                  )
                                                        }
                                                        required
                                                        disabled={isCurrentUser}
                                                    >
                                                        <SelectTrigger
                                                            id={`role_id-${user.id}`}
                                                            className="w-full"
                                                            aria-invalid={Boolean(
                                                                errors.role_id,
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecciona rol" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {roles.map(
                                                                    (role) => (
                                                                        <SelectItem
                                                                            key={
                                                                                role.id
                                                                            }
                                                                            value={String(
                                                                                role.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                role.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={errors.role_id}
                                                    />
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                                                    <Button
                                                        disabled={
                                                            processing ||
                                                            isCurrentUser
                                                        }
                                                        data-test={`admin-update-user-${user.id}`}
                                                    >
                                                        Guardar cambios
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>

                                    <div className="flex flex-wrap gap-2">
                                        <Form
                                            {...UserController.sendPasswordResetLink.form(
                                                user.id,
                                            )}
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    variant="outline"
                                                    disabled={
                                                        processing ||
                                                        isCurrentUser ||
                                                        !user.active
                                                    }
                                                    data-test={`admin-reset-user-password-${user.id}`}
                                                >
                                                    Enviar enlace de
                                                    recuperación
                                                </Button>
                                            )}
                                        </Form>

                                        {user.active ? (
                                            <Form
                                                {...UserController.destroy.form(
                                                    user.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        variant="destructive"
                                                        disabled={
                                                            processing ||
                                                            isCurrentUser
                                                        }
                                                        data-test={`admin-disable-user-${user.id}`}
                                                    >
                                                        Deshabilitar
                                                    </Button>
                                                )}
                                            </Form>
                                        ) : (
                                            <Form
                                                {...UserController.restore.form(
                                                    user.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        variant="secondary"
                                                        disabled={
                                                            processing ||
                                                            isCurrentUser
                                                        }
                                                        data-test={`admin-enable-user-${user.id}`}
                                                    >
                                                        Reactivar
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-sm text-muted-foreground">
                    Mostrando {users.from ?? 0}–{users.to ?? 0} de {users.total}{' '}
                    usuarios.
                </div>
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: '/admin/users',
        },
    ],
};
