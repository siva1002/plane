import { observer } from "mobx-react"
import { Timesheet } from "components/issues/timesheet/timesheet"
import { useRouter } from "next/router";


import { Controller, useForm } from "react-hook-form";
// hooks
import { useMember,useCalendarView } from "hooks/store";
// components
import { SelectAssignee } from "components/issues/timesheet";
import { Calendar } from "components/issues/timesheet/select/calendar-dropdown";
import { useState } from "react";

export const ProjectTimeSheet = observer(() => {
    const [weekCount, setCount] = useState(0)
    const [layouttype,selectedLayout]=useState('week')

    const {
        control,
        watch,
        getValues,
    } = useForm({
        defaultValues: {
            member: '',
            view: ''
        },
        mode: "onChange",
        reValidateMode: "onChange",
    });
    // store hooks
    const {
        project: { projectMemberIds },
        getUserDetails
    } = useMember();
    const memebers = projectMemberIds?.map(member => getUserDetails(member));
    const incrementCount = () => {
        setCount(weekCount + 1);
    };
    const decrementCount = () => {
        if (weekCount > 0) {
            setCount(weekCount - 1);

        }
    };
    const issueCalendarView = useCalendarView();
    const handleLayoutChange=(key:string)=>{
        selectedLayout(key)
        issueCalendarView.updateCalendarPayload(
            layouttype === "month"
              ? issueCalendarView.calendarFilters.activeMonthDate
              : issueCalendarView.calendarFilters.activeWeekDate
          );
    }
    return <>
        <div className=" flex border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4 justify-end gap-6">
            <div className="flex">
                <button type="button" className="grid place-items-center" onClick={incrementCount}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-left "><path d="m15 18-6-6 6-6"></path></svg></button>
                <button type="button" className="grid place-items-center" onClick={decrementCount}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-right "><path d="m9 18 6-6-6-6"></path></svg></button>
            </div>
            <div className="w-32">
                <Controller
                    name="member"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <SelectAssignee assginees={memebers} value={value} onChange={onChange} />
                    )}
                />
            </div>
            <div>
                <Calendar onChange={handleLayoutChange} value={layouttype} />
            </div>
        </div>
        {watch('member') && <Timesheet addtimesheet={false} user={getValues('member')} week={weekCount} layout={layouttype}/>}

    </>

})