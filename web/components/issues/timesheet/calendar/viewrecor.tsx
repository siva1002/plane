import { FC, useState, Fragment } from "react"
import { observer } from "mobx-react"
import { TIssueTimesheetRecord } from "@plane/types"
import { Tooltip } from "@plane/ui";
import { Dialog, Transition } from "@headlessui/react";
type Props = {
    data: [TIssueTimesheetRecord]
}

export const DayRecord: FC<Props> = observer((props) => {
    const { data } = props
    const [timeRecord, setTimerecord] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const Showmodal = (data: any) => {
        setTimerecord(data)
        setIsOpen(true)
    }

    const onClose = () => {
        setIsOpen(false)
        setTimerecord([])
    }

    return <>{
        <div>

            {data.length <2 ? data.map(record =>
                <Tooltip tooltipHeading="Description" tooltipContent={record.description}>
                    <div className="h-full w-full cursor-pointer truncate px-4 py-2.5 text-left text-[0.825rem] text-custom-text-100">
                        {record.workedhour}
                    </div>
                </Tooltip>


            ) : data.length >= 2 ? <div onClick={() => Showmodal(data)} >{data.length}</div>
                : <p></p>
            }
            <div>

            </div>
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-20" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
                    </Transition.Child>

                    <div className="fixed  inset-0 z-10 overflow-y-auto my-[18rem]">
                        <div className="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform rounded-lg border border-custom-border-200 bg-custom-background-100 text-left shadow-custom-shadow-md transition-all sm:w-full mx-4 sm:max-w-4xl">
                                    <div className="flex flex-col gap-6 p-6">
                                        <div className="flex w-full items-center justify-start gap-6">
                                            <span className="flex items-center justify-start">
                                                <h3 className="text-xl font-medium 2xl:text-2xl"><span className="break-words font-medium text-custom-text-100">
                                                    {/* {!isSubmitting ? "Timesheet" : "Submiting"} */}
                                                    <div className="flex-row gap-20">
                                                        {timeRecord.map(record =>

                                                            <div className="bg-custom-background-90 flex-row justify-center mb-3 w-[30rem] p-2 text-m ">{record.workedhour}-{record.description}</div>
                                                        )}
                                                    </div>

                                                </span></h3>
                                            </span>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>


    }
    </>
})