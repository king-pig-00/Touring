export interface CompanyInfo extends DepartmentListItem {
    info: {
        orgInfoId: number;
        email: string;
        description: string;
        generalPhone: string;
        fax: string;
        address: string;
        address2: string;
        city: string;
        country: string;
        state: string;
        zipCode: string;
        logo: string;
        website: string;
        administrator: string;
        timeZone: string;
    };
}

export interface DepartmentListItem {
    orgId: number;
    parentOrgId: number;
    orgName: string;
}
