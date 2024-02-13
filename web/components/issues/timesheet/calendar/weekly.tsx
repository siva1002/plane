import { observer } from "mobx-react-lite";
import moment from "moment";
import { FC } from "react";
import { timeSheetservice } from "services/issue";



type Props={
    data:string[]
}


export const WeeklyCalendar:FC<Props> = observer((props) => {
    const {data}=props
    console.log(data)
    var currentDate = moment();
    var weekStart = currentDate.clone().startOf('week');
    var weekEnd = currentDate.clone().endOf('week');
    var days = [];
    const timeSheet = new timeSheetservice()
    
    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
    }

    return <>
        {days.map(day =>
            <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100" aria-disabled={true}>{day}</div>
        )}
    </>

})