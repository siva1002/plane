import { observer } from "mobx-react-lite";
import moment from "moment";
import { FC, useState } from "react";
import { timeSheetservice } from "services/issue";
import { TIssue } from "@plane/types";
import { useRouter } from "next/router";
import useSWR from 'swr'
import { DayRecord } from "./viewrecor";
import { reduce } from "lodash";
type Props = {
    issueObj: TIssue
    user: string | undefined
    week: number
}
export const WeeklyCalendar: FC<Props> = observer((props) => {
    let days = []
    const route = useRouter()
    const { issueObj, user, week } = props
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    var currentDate = moment().subtract(week, 'w');
    var weekStart = currentDate.clone().startOf('week');
    var weekEnd = currentDate.clone().endOf('week');
    const enddate = weekEnd.format()
    const startdate = weekStart.format()
    const timeSheet = new timeSheetservice()

    const { data, isLoading } = useSWR(
        workspaceSlug ? `USER_TIMESHEET_${workspaceSlug}_${issueObj.id}_${user}_${week}` : null,
        async () => {
            return await timeSheet.getTimesheet(issueObj.id, workspaceSlug, issueObj.project_id, `${startdate},${enddate}`, user)
        })
    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days').format('yyyy-MM-DD'));
    }
    const filteredData = days.map((weekday) => data?.filter(d => d.created_at.includes(weekday)))
    const workedhours = data?.reduce((acc: number, d) => {
        return d['workedhour'] + acc
    }, 0)
    return <>
        {!isLoading && filteredData.map(d =>
            <td className="h-full cursor-pointer truncate text-left text-[0.825rem] text-custom-text-100" aria-disabled={true}>
                <span>
                    <div className="bg-custom-background-90 w-[10rem] flex-row justify-center">
                        <DayRecord data={d} />
                    </div>
                </span>
            </td>
        )}
        <td className="sticky right-0 z-[1] h-11 w-[26rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
            <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100">
                {workedhours}
            </div>
        </td>
    </>

})