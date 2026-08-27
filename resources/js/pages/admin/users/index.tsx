import { Form, Head, router, usePage } from '@inertiajs/react';
import { Ellipsis, KeyRound, Pencil, Power, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
    active: boolean;
    birth_date: string | null;
    created_at: string | null;
    deleted_at: string | null;
    email: string;
    email_verified_at: string | null;
    gender: CatalogOption | null;
    gender_id: number | null;
    id: number;
    last_name: string | null;
    name: string;
    role: CatalogOption | null;
    role_id: number | null;
};

type PaginatedUsers = {
    current_page: number;
    data: ManagedUser[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type UserFilters = {
    per_page: number;
    role: string;
    search: string;
    status: string;
};

type PageProps = {
    auth: Auth;
};

type Props = {
    filters: UserFilters;
    genders: CatalogOption[];
    roles: CatalogOption[];
    users: PaginatedUsers;
};

export default function AdminUsersIndex({
    filters,
    genders,
    roles,
    users,
}: Props) {
    const { auth } = usePage<PageProps>().props;

    const changeQuery = (query: DataTableQuery) => {
        router.get(UserController.index.url(), query, {
            only: ['users', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedUser>[] = [
        {
            id: 'user',
            label: 'Usuario',
            hideable: false,
            cell: (user) => (
                <div className="flex min-w-48 flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                        {user.name} {user.last_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>
            ),
        },
        {
            id: 'role',
            label: 'Rol',
            cell: (user) =>
                user.role ? (
                    <Badge variant="outline">{user.role.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">Sin rol</span>
                ),
        },
        {
            id: 'status',
            label: 'Estado',
            cell: (user) => (
                <Badge variant={user.active ? 'secondary' : 'destructive'}>
                    {user.active ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            id: 'gender',
            label: 'Género',
            cell: (user) => (
                <span className="text-muted-foreground">
                    {user.gender?.name ?? 'Sin registro'}
                </span>
            ),
        },
        {
            id: 'registeredAt',
            label: 'Registro',
            cell: (user) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatDate(user.created_at)}
                </span>
            ),
        },
        {
            id: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-14 text-right',
            cellClassName: 'text-right',
            cell: (user) => (
                <UserRowActions
                    user={user}
                    roles={roles}
                    genders={genders}
                    isCurrentUser={auth.user?.id === user.id}
                />
            ),
        },
    ];

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Usuarios"
                    description="Administra los accesos, roles y estado de las cuentas de Guaranda Go."
                />

                <DataTable
                    title="Usuarios registrados"
                    description="Busca y filtra las cuentas registradas en el sistema."
                    data={users.data}
                    columns={columns}
                    getRowId={(user) => user.id}
                    emptyMessage="No hay usuarios que coincidan con los filtros seleccionados."
                    searchPlaceholder="Buscar por nombre o correo"
                    query={filters}
                    onQueryChange={changeQuery}
                    filters={[
                        {
                            id: 'role',
                            label: 'Filtrar por rol',
                            placeholder: 'Todos los roles',
                            options: roles.map((role) => ({
                                label: role.name,
                                value: String(role.id),
                            })),
                        },
                        {
                            id: 'status',
                            label: 'Filtrar por estado',
                            placeholder: 'Todos los estados',
                            options: [
                                { label: 'Activos', value: 'active' },
                                { label: 'Inactivos', value: 'inactive' },
                            ],
                        },
                    ]}
                    pagination={{
                        currentPage: users.current_page,
                        from: users.from,
                        lastPage: users.last_page,
                        perPage: users.per_page,
                        to: users.to,
                        total: users.total,
                    }}
                />
            </div>
        </>
    );
}

function UserRowActions({
    genders,
    isCurrentUser,
    roles,
    user,
}: {
    genders: CatalogOption[];
    isCurrentUser: boolean;
    roles: CatalogOption[];
    user: ManagedUser;
}) {
    const [editOpen, setEditOpen] = useState(false);

    if (isCurrentUser) {
        return <Badge>Tu cuenta</Badge>;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para ${user.name} ${user.last_name}`}
                    >
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                            <Pencil />
                            Editar usuario
                        </DropdownMenuItem>
                        <Form
                            {...UserController.sendPasswordResetLink.form(
                                user.id,
                            )}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <DropdownMenuItem asChild disabled={processing}>
                                    <button
                                        type="submit"
                                        disabled={processing || !user.active}
                                    >
                                        <KeyRound />
                                        Enviar recuperación
                                    </button>
                                </DropdownMenuItem>
                            )}
                        </Form>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {user.active ? (
                        <Form
                            {...UserController.destroy.form(user.id)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <DropdownMenuItem
                                    asChild
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    <button type="submit" disabled={processing}>
                                        <Power />
                                        Deshabilitar
                                    </button>
                                </DropdownMenuItem>
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...UserController.restore.form(user.id)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <DropdownMenuItem asChild disabled={processing}>
                                    <button type="submit" disabled={processing}>
                                        <RotateCcw />
                                        Reactivar
                                    </button>
                                </DropdownMenuItem>
                            )}
                        </Form>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar usuario</DialogTitle>
                        <DialogDescription>
                            Actualiza el perfil y acceso de {user.name}{' '}
                            {user.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <UserEditForm
                        user={user}
                        roles={roles}
                        genders={genders}
                        onSuccess={() => setEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

function UserEditForm({
    genders,
    onSuccess,
    roles,
    user,
}: {
    genders: CatalogOption[];
    onSuccess: () => void;
    roles: CatalogOption[];
    user: ManagedUser;
}) {
    return (
        <Form
            {...UserController.update.form(user.id)}
            onSuccess={onSuccess}
            options={{ preserveScroll: true }}
            className="flex flex-col gap-5"
        >
            {({ errors, processing }) => (
                <>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field data-invalid={Boolean(errors.name)}>
                            <FieldLabel htmlFor={`name-${user.id}`}>
                                Nombre
                            </FieldLabel>
                            <Input
                                id={`name-${user.id}`}
                                name="name"
                                defaultValue={user.name}
                                required
                                aria-invalid={Boolean(errors.name)}
                            />
                            <InputError message={errors.name} />
                        </Field>

                        <Field data-invalid={Boolean(errors.last_name)}>
                            <FieldLabel htmlFor={`last_name-${user.id}`}>
                                Apellido
                            </FieldLabel>
                            <Input
                                id={`last_name-${user.id}`}
                                name="last_name"
                                defaultValue={user.last_name ?? ''}
                                required
                                aria-invalid={Boolean(errors.last_name)}
                            />
                            <InputError message={errors.last_name} />
                        </Field>

                        <Field data-invalid={Boolean(errors.email)}>
                            <FieldLabel htmlFor={`email-${user.id}`}>
                                Correo electrónico
                            </FieldLabel>
                            <Input
                                id={`email-${user.id}`}
                                type="email"
                                name="email"
                                defaultValue={user.email}
                                required
                                aria-invalid={Boolean(errors.email)}
                            />
                            <InputError message={errors.email} />
                        </Field>

                        <Field data-invalid={Boolean(errors.birth_date)}>
                            <FieldLabel htmlFor={`birth_date-${user.id}`}>
                                Fecha de nacimiento
                            </FieldLabel>
                            <DatePicker
                                id={`birth_date-${user.id}`}
                                name="birth_date"
                                defaultValue={user.birth_date ?? ''}
                                required
                                aria-invalid={Boolean(errors.birth_date)}
                            />
                            <InputError message={errors.birth_date} />
                        </Field>

                        <Field data-invalid={Boolean(errors.gender_id)}>
                            <FieldLabel htmlFor={`gender_id-${user.id}`}>
                                Género
                            </FieldLabel>
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
                                    id={`gender_id-${user.id}`}
                                    aria-invalid={Boolean(errors.gender_id)}
                                >
                                    <SelectValue placeholder="Selecciona género" />
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
                        </Field>

                        <Field data-invalid={Boolean(errors.role_id)}>
                            <FieldLabel htmlFor={`role_id-${user.id}`}>
                                Rol
                            </FieldLabel>
                            <Select
                                name="role_id"
                                defaultValue={
                                    user.role_id === null
                                        ? undefined
                                        : String(user.role_id)
                                }
                                required
                            >
                                <SelectTrigger
                                    id={`role_id-${user.id}`}
                                    aria-invalid={Boolean(errors.role_id)}
                                >
                                    <SelectValue placeholder="Selecciona rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={String(role.id)}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role_id} />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Guardar cambios
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: '/admin/users',
        },
    ],
};
