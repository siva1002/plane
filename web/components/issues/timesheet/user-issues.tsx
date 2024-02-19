import React from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useIssues, useUser,useProject} from "hooks/store";
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



interface IProfileIssuesPage {
    type: "assigned" | "subscribed" | "created";
}

export const AllIssues = observer((props: IProfileIssuesPage) => {
    const { type } = props;
    const route = useRouter()
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    const { issues } = useIssues(EIssuesStoreType.PROFILE);
    const { currentUser } = useUser()
    const { resolvedTheme } = useTheme();

    const {getProjectById}=useProject()
    const { data, isLoading } = useSWR(
        workspaceSlug && currentUser?.id ? `CURRENT_WORKSPACE_PROFILE_ISSUES_${workspaceSlug}_${currentUser?.id}_${type}` : null,
        async () => {
            if (workspaceSlug && currentUser?.id) {
                return await issues.fetchIssues(workspaceSlug, undefined, "init-loader", currentUser?.id, type);
            }
        }
    );
    const [showModal, setShowModal] = useState(false);
    const [pickedDate,setDate]=useState(moment().date())
    const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light";
    const emptyStateImage = getEmptyStateImagePath("all-issues", "custom-view", isLightMode);
    const handleClick = (day:Date) => {
        // setIssue({ "project_id": project_id, "id": issueid, "workspaceslug": workspaceSlug, issue_name: issuename })

        setShowModal(true);
        setDate(day)
    };

    const handleClose = () => {
        setShowModal(false)
        setDate(Date.now())
    }
    var currentDate = moment();
    var weekStart = currentDate.clone().startOf('week');
    var weekEnd = currentDate.clone().endOf('week');
    var days = [];

    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days'));
    }
    return <>
        {!isLoading && data?.length ? <div>
            <div className="group relative flex border-b border-custom-border-200">
                <table className="divide-x-[0.5px] divide-custom-border-200 overflow-y-auto">
                    <thead className="sticky top-0 left-0 z-[1] border-b-[0.5px] border-custom-border-100">
                        <th className="sticky left-0 z-[1] h-11 w-[16rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
                            <span className="flex h-full w-full flex-grow items-center justify-center px-4 py-2.5">
                                <LayersIcon className="mr-1.5 h-4 w-4 text-custom-text-400" />
                                Issue
                            </span>
                        </th>
                        {days.map(day =>
                            <th className="sticky left-0 z-[1] h-11 w-[26rem] items-center bg-custom-background-90 text-sm font-medium before:absolute before:h-full before:right-0 before:border-[0.5px]  before:border-custom-border-100">
                                <span className="flex h-full w-full flex-grow items-center justify-center px-4 py-2.5"
                                onClick={() => handleClick(day)}>
                                    {day.format("MMMM Do,dddd")}
                                </span>
                            </th>
                        )}

                    </thead>

                    {data.map(issueDetail =>
                        <tr>
                            <td className="sticky group left-0 h-11  w-[16rem] flex items-center bg-custom-background-100 text-sm after:absolute after:w-full after:bottom-[-1px] after:border after:border-l-0 after:border-custom-border-100 before:absolute before:h-full before:right-0 before:border before:border-l-0 before:border-custom-border-100">
                                <Tooltip tooltipHeading="Project" tooltipContent={getProjectById(issueDetail.project_id)?.name}>
                                    <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100">
                                        {issueDetail.name}
                                    </div>
                                </Tooltip>
                            </td >
                            <WeeklyCalendar issueObj={issueDetail} />
                        </tr>
                    )}
                </table>
                {showModal && <IssueTimeSheetModal handleClose={() => handleClose()} isOpen={showModal} key={""} pickedDay={pickedDate} />}

            </div>

        </div> :<EmptyState
              image={emptyStateImage}
            title="No Issue to create timesheet"
              size="sm"
            />}
    </>
})

