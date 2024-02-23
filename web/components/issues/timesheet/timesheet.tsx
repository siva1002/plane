import { observer } from "mobx-react-lite";
import { AllIssues } from "./user-issues";
import { DEFAULT_GLOBAL_VIEWS_LIST } from "constants/workspace";
import { useState } from "react";
import { useUser, useMember } from "hooks/store";
import { CalendarViewtimesheet } from "./calendar/monthly";

type Props = {
  addtimesheet: boolean
  user: string
  week: number
  layout: string
}

export const Timesheet = observer((props: Props) => {
  const { addtimesheet, user, week, layout } = props
  console.log(layout, "timesheet props")
  const [type, Switchtype] = useState('all-issues')
  const handleType = (key: string) => {
    Switchtype(key)
  }
  const { getUserDetails } = useMember()
  return <>

    {layout != 'month' ?
      <div className="">
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
        <AllIssues type={type} user={getUserDetails(user)} addtimesheet={addtimesheet} week={week} />
      </div>
      :<CalendarViewtimesheet week={week} user={getUserDetails(user)} />}
  </>
})
