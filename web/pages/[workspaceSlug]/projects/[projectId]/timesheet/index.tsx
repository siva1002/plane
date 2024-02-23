
import { ReactElement } from "react";
// components
import { ProjectLayoutRoot } from "components/issues";
import { WorkspaceTimesheetHeader } from "components/headers";
import { ProjectTimeSheet } from "./timesheet";
// types
import { NextPageWithLayout } from "lib/types";
// layouts
import { AppLayout } from "layouts/app-layout";

const ProjectTimesheetPage: NextPageWithLayout = () => (
  <div className="h-full w-full">
    <ProjectTimeSheet />
  </div>
);

ProjectTimesheetPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<WorkspaceTimesheetHeader />} withProjectWrapper>
      {page }
    </AppLayout>
  );
};

export default ProjectTimesheetPage;


