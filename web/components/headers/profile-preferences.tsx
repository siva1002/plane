// components
import { Breadcrumbs } from "@plane/ui";

export const ProfilePreferencesHeader = () => (
  <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
    <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
      <div>
        <Breadcrumbs>
          <Breadcrumbs.BreadcrumbItem type="text" label="My Profile Preferences" />
        </Breadcrumbs>
      </div>
    </div>
  </div>
);
