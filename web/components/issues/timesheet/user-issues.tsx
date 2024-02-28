import React from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useIssues, useUser, useProject, useMember } from "hooks/store";
import { useTheme } from "next-themes";
import { EIssuesStoreType } from "constants/issue";
import { IssueTimeSheetModal } from "./issue-view/timesheetmodal";
import { Tooltip } from "@plane/ui";
import useSWR from 'swr'
import { WeeklyCalendar } from "./calendar/weekly";
import { LayersIcon } from "lucide-react";
import { useState } from "react";
import moment from "moment";
import { EmptyState, getEmptyStateImagePath } from "components/empty-state";
import { IUserLite } from "@plane/types";



interface IProfileIssuesPage {
    type: "assigned" | "subscribed" | "created";
    user: IUserLite | null;
    addtimesheet: boolean;
    week: number
}

export const AllIssues = observer((props: IProfileIssuesPage) => {
    const { type, user, addtimesheet, week } = props;
    const { currentUser } = useUser()
    const route = useRouter()
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    const { issues } = useIssues(EIssuesStoreType.PROFILE);
    const { resolvedTheme } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const [pickedDate, setDate] = useState(moment().date())
    const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light";
    const emptyStateImage = getEmptyStateImagePath("all-issues", "custom-view", isLightMode);
    const { getProjectById } = useProject()
    const { data, isLoading } = useSWR(
        workspaceSlug && user?.id ? `CURRENT_WORKSPACE_PROFILE_ISSUES_${workspaceSlug}_${user?.id}_${type}` : null,
        async () => {
            if (workspaceSlug && user?.id) {
                return await issues.fetchIssues(workspaceSlug, undefined, "init-loader", user?.id, type);
            }
        }
    );

    const handleClick = (day: Date) => {
        if (addtimesheet) {
            setShowModal(true);
            setDate(day)
        }
    };

    const handleClose = () => {
        setShowModal(false)
        setDate(Date.now())
    }
    var currentDate = week < 0 ? moment() : moment().subtract(week, 'w');
    var weekStart = currentDate.clone().startOf('week');
    var days = [];

    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days'));
        
    }
    return <>
        {!isLoading && data?.length ? <div>
            <div className="relative  border-b border-custom-border-200 overflow-auto">
                <table className="divide-custom-border-200 overflow-y-auto">
                    <thead className="sticky top-0 left-0 z-[1] border-b-[0.5px] border-custom-border-100">
                        <th className="sticky left-0 z-[1] h-11 w-[16rem] min-w-[8rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
                            <span className="flex h-full w-full flex-grow items-center justify-center px-4 py-2.5">
                                <LayersIcon className="mr-1.5 h-4 w-4 text-custom-text-400" />
                                Issue
                            </span>
                        </th>
                        {days.map(day =>
                            <th className="h-11 w-full min-w-[8rem] items-center bg-custom-background-90 text-sm font-medium px-4 py-1 border border-b-0 border-t-0 border-custom-border-100">
                                <span className="flex h-full w-full flex-grow items-center justify-center px-4 py-2.5"
                                    onClick={() => handleClick(day)}>
                                    {day.format("MMMM Do,dddd")}
                                </span>
                            </th>
                        )}
                        <th className="sticky right-0 z-[1] h-11 w-[16rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
                            <span className="flex h-full w-full flex-grow items-center justify-center px-4 py-2.5">
                                WorkedHour
                            </span>
                        </th>
                    </thead>
                    {data.map(issueDetail =>
                        <tr>
                            <td className="sticky left-0 z-[1] h-11 w-[26rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
                                <Tooltip tooltipHeading="Project" tooltipContent={getProjectById(issueDetail.project_id)?.name}>
                                    <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100">
                                        {issueDetail.name}
                                    </div>
                                </Tooltip>
                            </td >
                            <WeeklyCalendar issueObj={issueDetail} user={user?.id} week={week} />

                        </tr>
                    )}
                </table>
                {showModal && <IssueTimeSheetModal handleClose={() => handleClose()} isOpen={showModal} key={""} pickedDay={pickedDate}  />}

            </div>

        </div> : <EmptyState
            image={emptyStateImage}
            title="No Issue to create timesheet"
            size="sm"
        />}
    </>
})

