import { observer } from "mobx-react-lite";
import { ProjectAppliedFiltersRoot } from "../issue-layouts";
import { AllIssues } from "./user-issues";
import { DEFAULT_GLOBAL_VIEWS_LIST } from "constants/workspace";
import { useState } from "react";


export const Timesheet = observer(() => {
  const [type, Switchtype] = useState('all-issues')
  const handleType = (key: string) => {
    Switchtype(key)
  }
  return <>
  <ProjectAppliedFiltersRoot/>
    <div className="group relative flex border-b border-custom-border-200">
      <div className="flex w-full items-center overflow-x-auto px-4">
        {DEFAULT_GLOBAL_VIEWS_LIST.map((tab) => (
          <div onClick={() => { handleType(tab.key) }}>
            <span
              className={`flex min-w-min flex-shrink-0 whitespace-nowrap border-b-2 p-3 text-sm font-medium outline-none 
            ${tab.key === type
                  ? "border-custom-primary-100 text-custom-primary-100"
                  : "border-transparent hover:border-custom-border-200 hover:text-custom-text-400"
                }`}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
    <AllIssues type={type} />

  </>
})
