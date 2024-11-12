export interface CompanyInfo {
    companyId: number;
    companyName: string;
    email: string;
    companyDescription: string;
    generalPhone: string;
    fax: string;
    address: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
    companyLogo: string;
    companyWebsite: string;
    administrator: string;
    timeZone: string;
}

export interface DepartmentListItem {
    departmentId: number;
    companyId: number;
    parentDepartmentId: number;
    departmentName: string;
}