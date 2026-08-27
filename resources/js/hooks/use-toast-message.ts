import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type ToastMessageType = 'error' | 'success';

export function useToastMessage(
    message: string | null | undefined,
    type: ToastMessageType = 'success',
): void {
    const previousMessage = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        if (!message || previousMessage.current === message) {
            return;
        }

        previousMessage.current = message;

        if (type === 'error') {
            toast.error(message, { id: `feedback-error-${message}` });

            return;
        }

        toast.success(message, { id: `feedback-success-${message}` });
    }, [message, type]);
}
