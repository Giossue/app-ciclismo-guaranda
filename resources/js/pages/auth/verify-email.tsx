// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToastMessage } from '@/hooks/use-toast-message';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    useToastMessage(
        status === 'verification-link-sent'
            ? 'Se envió un nuevo enlace de verificación a tu correo electrónico.'
            : undefined,
    );

    return (
        <>
            <Head title="Verificación de correo" />

            <Form {...send.form()} className="flex flex-col gap-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Reenviar correo de verificación
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Cerrar sesión
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verificación de correo',
    description:
        'Verifica tu correo haciendo clic en el enlace que acabamos de enviarte.',
};
