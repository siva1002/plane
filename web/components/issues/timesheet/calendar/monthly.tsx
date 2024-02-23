import { observer } from "mobx-react-lite"
import { FC } from "react";
import moment from "moment"
import { timeSheetservice } from "services/issue";
import { TIssue } from "@plane/types";
import { useRouter } from "next/router";
import useSWR from 'swr'
import { DayRecord } from "./viewrecor";
import { useIssues} from "hooks/store";
import { EIssuesStoreType } from "constants/issue";
// import { DayTimesheet } from "./day-tile";


import { IUserLite } from "@plane/types";

type Props = {
    week: number
    user: IUserLite | null;
}

export const CalendarViewtimesheet: FC<Props> = observer((props) => {
    const { week,user } = props
    const route=useRouter()
    var currentDate = moment().subtract(week, 'm');
    var weekStart = currentDate.clone().startOf('month');
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    const timeSheet = new timeSheetservice()
    const { issues } = useIssues(EIssuesStoreType.PROFILE);
    const { data:issuedata, isLoading } = useSWR(
        workspaceSlug && user?.id ? `CURRENT_WORKSPACE_PROFILE_ISSUES_${workspaceSlug}_${user?.id}_all-issues` : null,
        async () => {
            if (workspaceSlug && user?.id) {
                return await issues.fetchIssues(workspaceSlug, undefined, "init-loader", user?.id, 'all-issues');
            }
        }
    );
    console.log(issuedata,"monthly issues")

    // const { data, isLoading } = useSWR(
    //     workspaceSlug && issueObj.id ? `USER_TIMESHEET_${workspaceSlug}_${issueObj.id}` : null,
    //     async () => {
    //         if (issueObj.id) {
    //             return await timeSheet.getTimesheet(issueObj.id, workspaceSlug, issueObj.project_id, `${startdate},${enddate}`,user)
    //         }
    //     })
    console.log(weekStart)
    var days = []
    for (var i = 0; i <= 30; i++) {
        days.push(moment(weekStart).add(i, 'days').format('yyyy-MM-DD'));
    }
    return <>
    <div className="grid h-full w-full grid-cols-7 divide-y-[0.5px] divide-custom-border-200">
        {days.map(day => 
            <div className="w-[8rem] h-[8rem] border">
            <h1>{day}</h1>
            {/* <DayTimesheet issueObj={issuedata} user={user?.id} day={day} /> */}
            
            </div>
            )
        }
    </div>
    </>
})