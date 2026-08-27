import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-9 shrink-0 object-cover" />
            <div className="grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    Guaranda Go
                </span>
            </div>
        </>
    );
}
