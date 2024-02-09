import { observer } from "mobx-react-lite";
import { useIssues, useUser } from "hooks/store";
import { EIssuesStoreType } from "constants/issue";
import { useRouter } from "next/router";
import { ProfileIssuesPage } from "components/profile/profile-issues";
import { AllIssues } from "./user-issues";
import { DEFAULT_GLOBAL_VIEWS_LIST } from "constants/workspace";
import { useState } from "react";


export const Timesheet = observer(() => {
  const [type, Switchtype] = useState('all-issues')
  const handleType = (key: string) => {
    console.log(key)
    Switchtype(key)
  }
  return <>
    <div className="flex w-full items-center overflow-x-auto px-4">
      {DEFAULT_GLOBAL_VIEWS_LIST.map((tab) => (
        <div onClick={() => { handleType(tab.key) }}>
          <span
            className={`flex min-w-min flex-shrink-0 whitespace-nowrap border-b-2 p-3 text-sm font-medium outline-none border-transparent hover:border-custom-border-200 hover:text-custom-text-400 `}>
            {tab.label}
          </span>
        </div>
      ))}
    </div>
    <AllIssues type={type} />

  </>
})
