import { FC } from "react";
import { useRouter } from "next/router";
// ui
import { Breadcrumbs } from "@plane/ui";
import { Settings } from "lucide-react";
// hooks
import { observer } from "mobx-react-lite";
// components
import { SidebarHamburgerToggle } from "components/core/sidebar/sidebar-menu-hamburger-toggle";

export interface IWorkspaceSettingHeader {
  title: string;
}

export const WorkspaceSettingHeader: FC<IWorkspaceSettingHeader> = observer((props) => {
  const { title } = props;
  const router = useRouter();

  const { workspaceSlug } = router.query;

  return (
    <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
        <SidebarHamburgerToggle/>
        <div>
          <Breadcrumbs>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              label="Settings"
              icon={<Settings className="h-4 w-4 text-custom-text-300" />}
              link={`/${workspaceSlug}/settings`}
            />
            <Breadcrumbs.BreadcrumbItem type="text" label={title} />
          </Breadcrumbs>
        </div>
      </div>
    </div>
  );
});
