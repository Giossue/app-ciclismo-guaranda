import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { homePath, mainNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Auth, BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

type PageProps = {
    auth: Auth;
};

const activeItemStyles = 'bg-secondary text-secondary-foreground';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();
    const navItems = mainNavItems(auth);
    const startPath = homePath(auth);
    const userFullName = auth.user
        ? [auth.user.name, auth.user.last_name].filter(Boolean).join(' ')
        : '';

    return (
        <>
            <div className="border-b border-sidebar-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 size-9"
                                >
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Menú de navegación
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="size-6 fill-current text-sidebar-foreground" />
                                </SheetHeader>
                                {auth.user && (
                                    <div className="mx-4 rounded-2xl border bg-card p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            Bienvenido/a
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <UserInfo user={auth.user} />
                                        </div>
                                    </div>
                                )}
                                <div className="flex h-full flex-1 flex-col gap-4 p-4 text-sm">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="flex items-center gap-2 rounded-2xl px-3 py-2 font-semibold transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        >
                                            {item.icon && (
                                                <item.icon className="size-5" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={startPath}
                        prefetch
                        className="flex items-center gap-2"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-6 hidden h-full items-center gap-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch gap-2">
                                {navItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer rounded-2xl px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 size-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute right-3 bottom-0 left-3 h-0.5 translate-y-px rounded-sm bg-primary" />
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {auth.user && (
                            <p className="hidden text-sm text-muted-foreground sm:block">
                                Hola,{' '}
                                <span className="font-medium text-foreground">
                                    {userFullName}
                                </span>
                            </p>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-2xl p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={userFullName}
                                        />
                                        <AvatarFallback className="rounded-2xl bg-secondary text-secondary-foreground">
                                            {getInitials(userFullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-muted-foreground md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
