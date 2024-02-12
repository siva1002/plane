import { useCurrentTime } from "hooks/use-current-time"
import { observer } from "mobx-react-lite";
import { IUser } from "@plane/types";
import moment from "moment";



export const WeeklyCalendar = observer(() => {
    var currentDate = moment();
    var weekStart = currentDate.clone().startOf('week');
    var days = [];
    for (var i = 0; i <= 6; i++) {
        days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
    }
    return <>
        {days.map(day =>
            <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100" aria-disabled={true}>{day}</div>
        )}
    </>

})