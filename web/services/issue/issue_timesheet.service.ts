import { API_BASE_URL } from "helpers/common.helper";
import { APIService } from "services/api.service";
import { ITimesheetFilter } from "@plane/types";

export class timeSheetservice extends APIService {
    constructor() {
        super(API_BASE_URL)
    }
    async createTimerecord(
        workspaceSlug: string,
        projectId: string,
        issueId: string,
        data: any
    ): Promise<any> {
        return this.post(`/api/workspaces/${workspaceSlug}/timesheet/${projectId}/issue/${issueId}/create`, data)
            .then((response) => response?.data)
            .catch((error) => {
                console.log(error)
                throw error?.response?.data;
            });
    }

    async getTimesheet(
        issueId: string,
        workspaceSlug: string,
        projectId: string,
        created_at:string): Promise<any> {
        return this.get(`/api/workspaces/${workspaceSlug}/timesheet/${projectId}/issue/${issueId}`,{params: {created_at: created_at}})
            .then((response) => response?.data)
            .catch((error) => {
                console.log(error)
                throw error?.response?.data;
            });
    }
    async filterTimesheet(
        issueId: string,
        workspaceSlug: string,
        projectId: string,
        ): Promise<any> {
        return this.get(`/api/workspaces/${workspaceSlug}/timesheet/${projectId}/issue/${issueId}`)
            .then((response) => response?.data)
            .catch((error) => {
                console.log(error)
                throw error?.response?.data;
            });
    }




}