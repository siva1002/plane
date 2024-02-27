import { observer } from "mobx-react-lite"
import { FC } from "react";
import moment from "moment"
import { timeSheetservice } from "services/issue";
import { useRouter } from "next/router";
import useSWR from 'swr'
import { DayRecord } from "./viewrecor";
import { useIssues } from "hooks/store";
import { EIssuesStoreType } from "constants/issue";
// import { DayTimesheet } from "./day-tile";


import { IUserLite } from "@plane/types";

type Props = {
    week: number
    user: IUserLite | null;
}

export const CalendarViewtimesheet: FC<Props> = observer((props) => {
    const { week: month, user } = props
    const route = useRouter()
    var currentDate = moment().subtract(month, 'months');
    var monthStart = currentDate.clone().startOf('month');
    var monthEnd = currentDate.clone().endOf('month');

    const enddate = monthEnd.format()
    const startdate = monthStart.format()
    const { workspaceSlug, projectId } = route.query as { workspaceSlug: string, projectId: string }
    const timeSheet = new timeSheetservice()
    const { issues } = useIssues(EIssuesStoreType.PROFILE);
    // const { data:issuedata, isLoading } = useSWR(
    //     workspaceSlug && user?.id ? `CURRENT_WORKSPACE_PROFILE_ISSUES_${workspaceSlug}_${user?.id}_all-issues` : null,
    //     async () => {
    //         if (workspaceSlug && user?.id) {
    //             return await issues.fetchIssues(workspaceSlug, undefined, "init-loader", user?.id, 'all-issues');
    //         }
    //     }
    // );

    const { data: timesheetdata, isLoading: timesheetloader } = useSWR(
        workspaceSlug && projectId ? `PROJECT_TIMESHEET_${workspaceSlug}_${projectId}_month_{${month}}` : null,
        async () => {
            if (projectId) {
                return await timeSheet.getProjectTimesheet(workspaceSlug, projectId, `${startdate},${enddate}`, user?.id)
            }
        })

    var days = []
    for (var i = 0; i <= 30; i++) {
        days.push(moment(monthStart).add(i, 'days'));
    }
    const filterddata = days.map((monthday) => timesheetdata?.filter(d => d.created_at.includes(monthday.format('yyyy-MM-DD'))))
    return <>
        {!timesheetloader && <div className="grid h-full w-full  grid-cols-5 divide-y-[0.5px] divide-custom-border-200">
            {filterddata.map(data =>
                <div className="relative flex h-full min-h-44 w-full flex-col bg-custom-background-90 border" key={data?.created_at}>
                    <h1></h1>
                    <h1 className="flex items-center justify-end flex-shrink-0 px-2 py-1.5 text-right text-xs text-custom-text-300 bg-custom-background-100 " >{days[filterddata.indexOf(data)].format('ll')}</h1>
                    <div className="flex justify-center  ">
                        {data.length ? <DayRecord data={data} /> : <p></p>}
                    </div>
                </div>
            )
            }
        </div>
        }
    </>
})