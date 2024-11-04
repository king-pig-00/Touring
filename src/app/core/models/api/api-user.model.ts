export interface SignedUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    redirectUrl?: string;
}

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
}
