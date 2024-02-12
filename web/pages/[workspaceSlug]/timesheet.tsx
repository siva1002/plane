import React, { Fragment, ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { Tab } from "@headlessui/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";

// hooks
import { useApplication, useProject, useUser } from "hooks/store";
// layouts
import { AppLayout } from "layouts/app-layout";
// components
import { WorkspaceTimesheetHeader } from "components/headers";
import { EmptyState, getEmptyStateImagePath } from "components/empty-state";
import { Timesheet } from "components/issues/timesheet/timesheet";
// constants
import { EUserWorkspaceRoles } from "constants/workspace";
// type
import { NextPageWithLayout } from "lib/types";


const TimesheetPage: NextPageWithLayout = observer(() => {
  // theme
  const { resolvedTheme } = useTheme();
  // store hooks
  const {
    commandPalette: { toggleCreateProjectModal },
    eventTracker: { setTrackElement },
  } = useApplication();
  const {
    membership: { currentWorkspaceRole },
    currentUser,
  } = useUser();
  const { workspaceProjectIds } = useProject();
  const route=useRouter();

  const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light";
  const EmptyStateImagePath = getEmptyStateImagePath("onboarding", "analytics", isLightMode);
  const isEditingAllowed = !!currentWorkspaceRole && currentWorkspaceRole >= EUserWorkspaceRoles.MEMBER;
  


  return (
    <>
      {workspaceProjectIds && workspaceProjectIds.length > 0 ? (
        <div className="flex h-full flex-col overflow-hidden bg-custom-background-100">
         <Timesheet/>
        </div>
      ) : (
        <EmptyState
          image={EmptyStateImagePath}
          title="Track progress, workloads, and allocations. Spot trends, remove blockers, and move work faster"
          description="See scope versus demand, estimates, and scope creep. Get performance by team members and teams, and make sure your project runs on time."
          primaryButton={{
            text: "Create Cycles and Modules first",
            onClick: () => {
              setTrackElement("ANALYTICS_EMPTY_STATE");
              toggleCreateProjectModal(true);
            },
          }}
          comicBox={{
            title: "Analytics works best with Cycles + Modules",
            description:
              "First, timebox your issues into Cycles and, if you can, group issues that span more than a cycle into Modules. Check out both on the left nav.",
          }}
          size="lg"
          disabled={!isEditingAllowed}
        />
      )}
    </>
  );
});

TimesheetPage.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout header={<WorkspaceTimesheetHeader />}>{page}</AppLayout>;
};

export default TimesheetPage;
