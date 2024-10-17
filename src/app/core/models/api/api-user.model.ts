export interface User {
    token: string;
    userInfo: {
        firstName: string;
        lastName: string;
        email: string;
        userid: number;
    };
}
