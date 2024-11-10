export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    companyId: number;
    positionId: number;
    phoneNumber: string;
    city: string;
    address: string;
    address2: string;
    countryId: number;
    state: string;
    zipcode: string;
    token?: string;
    redirectUrl?: string;
}
