import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearance } from '@/hooks/use-appearance';
import type {
    ContentLayout,
    NavbarStyle,
    SidebarCollapsible,
    SidebarVariant,
} from '@/hooks/use-layout-preferences';
import { useLayoutPreferences } from '@/hooks/use-layout-preferences';

const toggleClassName = 'w-full [&>[data-slot=toggle-group-item]]:flex-1';

export function LayoutPreferencesPanel() {
    const { appearance, updateAppearance } = useAppearance();
    const { preferences, updatePreferences, resetPreferences } =
        useLayoutPreferences();

    const reset = () => {
        resetPreferences();
        updateAppearance('system');
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label="Abrir preferencias de interfaz"
                >
                    <Settings />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="max-h-[calc(100dvh-1.5rem)] w-80 overflow-y-auto"
            >
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-medium">Preferencias</h2>
                    <p className="text-sm text-muted-foreground">
                        Personaliza la interfaz de Guaranda Go.
                    </p>
                </div>

                <FieldGroup className="mt-5 gap-4">
                    <Field>
                        <FieldLabel>Modo de tema</FieldLabel>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            size="sm"
                            value={appearance}
                            onValueChange={(value) => {
                                if (value) {
                                    updateAppearance(
                                        value as 'light' | 'dark' | 'system',
                                    );
                                }
                            }}
                            className={toggleClassName}
                        >
                            <ToggleGroupItem
                                value="light"
                                aria-label="Usar tema claro"
                            >
                                Claro
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="dark"
                                aria-label="Usar tema oscuro"
                            >
                                Oscuro
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="system"
                                aria-label="Usar el tema del sistema"
                            >
                                Sistema
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </Field>

                    <PreferenceToggle<ContentLayout>
                        label="Diseño de página"
                        value={preferences.contentLayout}
                        onValueChange={(contentLayout) =>
                            updatePreferences({ contentLayout })
                        }
                        options={[
                            ['centered', 'Centrado'],
                            ['full-width', 'Ancho completo'],
                        ]}
                    />
                    <PreferenceToggle<NavbarStyle>
                        label="Comportamiento de cabecera"
                        value={preferences.navbarStyle}
                        onValueChange={(navbarStyle) =>
                            updatePreferences({ navbarStyle })
                        }
                        options={[
                            ['sticky', 'Fija'],
                            ['scroll', 'Desplazable'],
                        ]}
                    />
                    <PreferenceToggle<SidebarVariant>
                        label="Estilo de sidebar"
                        value={preferences.sidebarVariant}
                        onValueChange={(sidebarVariant) =>
                            updatePreferences({ sidebarVariant })
                        }
                        options={[
                            ['inset', 'Inset'],
                            ['sidebar', 'Sidebar'],
                            ['floating', 'Flotante'],
                        ]}
                    />
                    <PreferenceToggle<SidebarCollapsible>
                        label="Colapso de sidebar"
                        value={preferences.sidebarCollapsible}
                        onValueChange={(sidebarCollapsible) =>
                            updatePreferences({ sidebarCollapsible })
                        }
                        options={[
                            ['icon', 'Icono'],
                            ['offcanvas', 'Ocultable'],
                        ]}
                    />

                    <Button type="button" variant="outline" onClick={reset}>
                        Restablecer valores
                    </Button>
                </FieldGroup>
            </PopoverContent>
        </Popover>
    );
}

function PreferenceToggle<T extends string>({
    label,
    value,
    options,
    onValueChange,
}: {
    label: string;
    value: T;
    options: readonly [T, string][];
    onValueChange: (value: T) => void;
}) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={value}
                onValueChange={(nextValue) => {
                    if (nextValue) {
                        onValueChange(nextValue as T);
                    }
                }}
                className={toggleClassName}
            >
                {options.map(([optionValue, optionLabel]) => (
                    <ToggleGroupItem
                        key={optionValue}
                        value={optionValue}
                        aria-label={`${label}: ${optionLabel}`}
                    >
                        {optionLabel}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </Field>
    );
}
