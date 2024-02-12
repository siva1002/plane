import APIService from "services/api.service";
import { API_BASE_URL } from "helpers/common.helper";

class IssueService extends APIService{
    constructor() {
        super(API_BASE_URL);
      }
      async getTimesheet(workspace_slug:string, issue_id:string,project_id:string): Promise<any>{
        return this.get(`api/ workspaces/${workspace_slug}/timesheet/${project_id}/issue/${issue_id}/`, {
          })
            .then((response) => response?.data)
            .catch((error) => {
              throw error?.response;
            });
      }

      async createTimesheet(workspace_slug:string, issue_id:string,project_id:string): Promise<any>{
        return this.get(`api/ workspaces/${workspace_slug}/timesheet/${project_id}/issue/${issue_id}/`, {
          })
            .then((response) => response?.data)
            .catch((error) => {
              throw error?.response;
            });
      }
      
    }


