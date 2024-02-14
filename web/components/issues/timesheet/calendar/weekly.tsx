import { observer } from "mobx-react-lite";
import moment, { weekdays } from "moment";
import { FC } from "react";
import { timeSheetservice } from "services/issue";
import { TIssue } from "@plane/types";
import { useRouter } from "next/router";
import useSWR from 'swr'
import { DayRecord } from "./viewrecor";
type Props = {
    issueObj: TIssue
}

export const WeeklyCalendar: FC<Props> = observer((props) => {
    const { issueObj } = props
    var currentDate = moment();
    var weekStart = currentDate.clone().startOf('week');
    var weekEnd = currentDate.clone().endOf('week');
    const enddate = weekEnd.format()
    const startdate = weekStart.format()
    const route = useRouter()
    var days = []
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    const timeSheet = new timeSheetservice()
    const { data, isLoading } = useSWR(
        workspaceSlug && issueObj.id ? `USER_TIMESHEET_${workspaceSlug}_${issueObj.id}` : null,
        async () => {
            if (issueObj.id) {
                return await timeSheet.getTimesheet(issueObj.id, workspaceSlug, issueObj.project_id, `${startdate},${enddate}`)
            }
        })
    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days').format('yyyy-MM-DD'));
    }
    const filteredata=days.map((weekday)=>data?.filter(d=>d.created_at.includes(weekday)))
    
    return <>
        {!isLoading && filteredata.map(d => 

            <td className="h-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100" aria-disabled={true}>
                <span>
                    <div className="bg-custom-background-90 w-[10rem] flex-row justify-center">
                        <DayRecord data={d} />
                        {/* <p>{data.filter(item => item.created_at.includes(d))}</p> */}
                    </div>
                </span>
            </td>

        )}
    </>

})