import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiRoutes, StorageService } from '@app/core';
import { CompanyInfo } from '../../models';

@Injectable({
    providedIn: 'root',
})
export class CompanySettingsApiService {
    private http = inject(HttpClient);
    private storageService = inject(StorageService);

    bearerToken = this.storageService.getItem('authToken');

    headers = new HttpHeaders({
        Authorization: `Bearer ${this.bearerToken}`,
    });

    getCompanyInfo(companyId: number) {
        let params = new HttpParams();
        params = params.append('id', companyId);
        return this.http.get<{
            success: boolean;
            data: CompanyInfo;
            errors?: string[];
        }>(`${ApiRoutes.company}GetCompanyInfo`, {
            headers: this.headers,
            params: params,
        });
    }

    // saveCompanyInfo(config: CompanyInfoConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyInfo;
    //         error?: string;
    //     }>(`${ApiRoutes.company}SaveCompanyInfo`, config);
    // }

    // getDepartmentsForCompany(companyID: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyID', companyID);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyDepartmentListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetDepartmentsForCompany`, {
    //         params: params,
    //     });
    // }
    // saveDepartment(config: CompanyDepartmentConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyDepartmentListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}SaveDepartment`, config);
    // }

    // deleteDepartment(id: number, isActive: boolean) {
    //     const config = {
    //         id,
    //         isActive,
    //     };
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyDepartmentListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}DeleteDepartment`, config);
    // }

    // getPositionsForDepartment(companyID: string, departmentId: number) {
    //     let params = new HttpParams();
    //     params = params.append('companyID', companyID);
    //     params = params.append('departmentId', departmentId);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyPositionListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetPositionsForDepartment`, {
    //         params: params,
    //     });
    // }

    // getPositionDetail(positionId: number, companyID: string) {
    //     let params = new HttpParams();
    //     params = params.append('positionId', positionId);
    //     params = params.append('companyID', companyID);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyPositionDetail;
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetPositionDetail`, {
    //         params: params,
    //     });
    // }

    // savePosition(config: CompanyPositionConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyPositionListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}SavePosition`, config);
    // }

    // deletePosition(id: number, isActive: boolean) {
    //     const config = {
    //         id,
    //         isActive,
    //     };
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyPositionListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}DeletePosition`, config);
    // }

    // getPayRateList(companyID: string, positionId: number) {
    //     let params = new HttpParams();
    //     params = params.append('companyID', companyID);
    //     params = params.append('positionId', positionId);
    //     return this.http.get<{
    //         success: boolean;
    //         data: PayRateListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetPayrateListForPosition`, {
    //         params: params,
    //     });
    // }

    // savePayRate(config: PayRateConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: PayRateListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}SavePayrate`, config);
    // }

    // deletePayRate(id: number, isActive: boolean) {
    //     const config = {
    //         id,
    //         isActive,
    //     };
    //     return this.http.post<{
    //         success: boolean;
    //         data: PayRateListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}DeletePayrate`, config);
    // }

    // getCompanyLocationList(companyUniqueID: string, locationType: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyUniqueID', companyUniqueID);
    //     if (locationType !== '') {
    //         params = params.append('locationType', locationType);
    //     }
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyLocationListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetLocationList`, {
    //         params: params,
    //     });
    // }

    // getQualificationList(companyUniqueID: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyUniqueID', companyUniqueID);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyQualificationListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetQualificationList`, {
    //         params: params,
    //     });
    // }

    // saveQualification(config: CompanyQualificationConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyQualificationListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}SaveQualification`, config);
    // }

    // deleteQualification(qualificationId: number, isActive: boolean) {
    //     let params = new HttpParams();
    //     params = params.append('qualificationId', qualificationId);
    //     params = params.append('isActive', isActive);

    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyLocationListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}DeleteQualification`, undefined, {
    //         params: params,
    //     });
    // }

    // getJobList(companyUniqueID: string, isActive: boolean) {
    //     let params = new HttpParams();
    //     params = params.append('CompanyUniqueID', companyUniqueID);
    //     params = params.append('IsActive', isActive);

    //     return this.http.get<{
    //         success: boolean;
    //         data: Job[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetJobList`, {
    //         params: params,
    //     });
    // }

    // getJobApplicationList(
    //     companyUniqueID: string,
    //     isActive: boolean,
    //     fromDate?: string,
    //     toDate?: string
    // ) {
    //     let params = new HttpParams();
    //     params = params.append('CompanyUniqueID', companyUniqueID);
    //     params = params.append('IsActive', isActive);
    //     params = fromDate ? params.append('FromDate', fromDate) : params;
    //     params = toDate ? params.append('ToDate', toDate) : params;

    //     return this.http.get<{
    //         success: boolean;
    //         data: JobApplicationModel[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetJobApplicationList`, {
    //         params: params,
    //     });
    // }

    // getJobApplicationListForJob(jobId: number, isActive: boolean) {
    //     let params = new HttpParams();
    //     params = params.append('JobId', jobId);
    //     params = params.append('IsActive', isActive);

    //     return this.http.get<{
    //         success: boolean;
    //         data: JobApplicationModel[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetJobApplicationListForJob`, {
    //         params: params,
    //     });
    // }

    // deleteJob(jobId: number, isActive: boolean) {
    //     let params = new HttpParams();
    //     params = params.append('JobId', jobId);
    //     params = params.append('IsActive', isActive);

    //     return this.http.post<{
    //         success: boolean;
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}DeleteJob`, null, { params });
    // }

    // getCompanySpecialLicenseList(companyUniqueID: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyUniqueID', companyUniqueID);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanySpecialLicenseListItem[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetSpecialLicenseList`, {
    //         params: params,
    //     });
    // }

    // saveCompanySpecialLicenseList(config: CompanySpecialLicenseConfig) {
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyLocationListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}SaveSpecialLicense`, config);
    // }

    // deleteSpecialLicense(specialLicenseId: number, isActive: boolean) {
    //     const config = {
    //         specialLicenseId: specialLicenseId,
    //         isActive: isActive,
    //     };
    //     return this.http.post<{
    //         success: boolean;
    //         data: CompanyLocationListItem[];
    //         error?: string;
    //     }>(`${ApiRoutes.company}DeleteSpecialLicense`, config);
    // }

    // getOrganizationChart(companyUniqueID: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyUniqueID', companyUniqueID);
    //     return this.http.get<{
    //         success: boolean;
    //         data: CompanyOrgChart[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetOrganizationChart`, {
    //         params: params,
    //     });
    // }

    // getOrganizationChartUsersByDepartment(departmentId: number) {
    //     let params = new HttpParams();
    //     params = params.append('departmentId', departmentId);
    //     return this.http.get<{
    //         success: boolean;
    //         data: OrgChartUser[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetOrganizationChartUsersByDepartment`, {
    //         params: params,
    //     });
    // }

    // getOrganizationChartUsersByPosition(positionId: number) {
    //     let params = new HttpParams();
    //     params = params.append('positionId', positionId);
    //     return this.http.get<{
    //         success: boolean;
    //         data: OrgChartUser[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetOrganizationChartUsersByPosition`, {
    //         params: params,
    //     });
    // }

    // getOrganizationChartTotalStaffByDepartment(departmentId: number) {
    //     let params = new HttpParams();
    //     params = params.append('departmentId', departmentId);
    //     return this.http.get<{
    //         success: boolean;
    //         data: OrgChartUser[];
    //         errors?: string[];
    //     }>(`${ApiRoutes.company}GetOrganizationTotalStaffByDepartment`, {
    //         params: params,
    //     });
    // }
}
