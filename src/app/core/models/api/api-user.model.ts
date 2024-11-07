export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    companyId: number;
    token: string;
    redirectUrl?: string;
}
