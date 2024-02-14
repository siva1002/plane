import { FC } from "react"
import { observer } from "mobx-react"
import { TIssueTimesheetRecord } from "@plane/types"

type Props = {
    data: [TIssueTimesheetRecord]
}

export const DayRecord: FC<Props> = observer((props) => {
    const { data } = props
    console.log(data)

    return <>{
        data.length ?data.map(record => 
            <div>
                <p>{record.workedhour}</p>
                <p>{record.description}</p>
            </div>

        ) :<p></p>
    }
    </>
})