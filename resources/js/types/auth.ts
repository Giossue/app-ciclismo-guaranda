export type CatalogOption = {
    id: number;
    name: string;
};

export type User = {
    id: number;
    role_id: number | null;
    gender_id: number | null;
    name: string;
    last_name: string | null;
    birth_date: string | null;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    active: boolean;
    role: CatalogOption | null;
    gender: CatalogOption | null;
    two_factor_enabled?: boolean;
    created_at: string | null;
    updated_at: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
