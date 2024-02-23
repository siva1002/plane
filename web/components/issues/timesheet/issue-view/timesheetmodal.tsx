import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";
import { LayoutPanelTop } from "lucide-react";
import { ParentIssuesListModal } from "components/issues/parent-issues-list-modal";

// ui
import { Button, Input, CustomMenu, TextArea } from "@plane/ui";
import { DateDropdown } from "components/dropdowns";
// hooks
import useToast from "hooks/use-toast";
// types
import { timeSheetservice } from "services/issue";
import { useProject, useWorkspace } from "hooks/store";
import { ISearchIssueResponse } from "@plane/types";
import { TIssue } from "@plane/types";
import { TimeSelectProject } from "../select/select-project";

//helpers
import { renderFormattedPayloadDate } from "helpers/date-time.helper";
import moment from "moment";

type Props = {
  isOpen: boolean;
  pickedDay: Date;
  handleClose: () => void;
  onSubmit?: () => Promise<void>;
};
type TTimesheetFormValues = {
  workedhours: number;
  description: string;
  issue: string;
  project_id: string;
  created_at: string;
};
export const IssueTimeSheetModal: React.FC<Props> = (props) => {
  const { isOpen, handleClose, pickedDay } = props;
  const route = useRouter();
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { workspaceSlug } = route.query as { workspaceSlug: string };
  const service = new timeSheetservice();
  const { currentWorkspace } = useWorkspace();
  const { workspaceProjectIds: workspaceProjectIds } = useProject();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setFocus,
    watch,
  } = useForm<TTimesheetFormValues>({
    defaultValues: {
      workedhours: 0,
      description: "",
      issue: "",
      project_id: "",
      created_at: moment(pickedDay).format("YYYY-MM-DD"),
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { setToastAlert } = useToast();
  const [IssueListModalOpen, ListModalOpen] = useState(false);
  // hooks
  const [selectedParentIssue, setSelectedParentIssue] = useState<ISearchIssueResponse | null>(null);
  const projectId = watch("project_id");
  useEffect(() => {
    setIsCreateLoading(false);
  }, [isOpen]);
  useEffect(() => {
    setFocus("workedhours");
  }, [setFocus]);
  const onClose = () => {
    setIsCreateLoading(false);
    handleClose();
  };
  const handleFormSubmit = async (recorddata: TTimesheetFormValues) => {
    const payload = {
      workedhour: recorddata.workedhours,
      description: recorddata.description,
      workspace: currentWorkspace?.id,
      project: recorddata.project_id,
      issue: recorddata.issue,
      created_at: recorddata.created_at,
    };
    const response = await service.createTimerecord(workspaceSlug, recorddata.project_id, recorddata.issue, payload);
    onClose();
  };
  const onChange = (formData: Partial<TIssue>) => {
    console.log(formData);
  };
  const handleFormChange = () => {
    if (!onChange) return;
    if (watch("issue") || watch("project_id")) onChange(watch());
  };
  return (
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

        <div className="fixed  inset-0 z-10 overflow-y-auto my-[10rem]">
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
                      <h3 className="text-xl font-medium 2xl:text-2xl">
                        <span className="break-words font-medium text-custom-text-100">
                          {!isSubmitting ? "Timesheet" : "Submiting"}
                        </span>
                      </h3>
                    </span>
                    <Controller
                        control={control}
                        name="created_at"
                        render={({ field: { value, onChange } }) => (
                          <div className="h-7">
                            <DateDropdown
                              value={value}
                              onChange={(date) => {
                                onChange(date ? renderFormattedPayloadDate(pickedDay) : null);
                                handleFormChange();
                              }}
                              buttonVariant="border-with-text"
                              // maxDate={moment(pickedDay).format('DD-MM-YYY') ?? undefined}
                              tabIndex={10}
                              disabled={true}
                            />
                          </div>
                        )}
                      />
                  </div>
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-row">
                    <div className="mb-5">
                      
                      <Controller
                        control={control}
                        name="workedhours"
                        render={({ field: { value, onChange } }) => (
                          <Input
                            type="number"
                            value={value}
                            onChange={onChange}
                            placeholder="Worked hours"
                            className="w-full text-sm font-medium"
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Controller
                        control={control}
                        name="description"
                        render={({ field: { value, onChange } }) => (
                          <TextArea
                            value={value}
                            onChange={onChange}
                            hasError={Boolean(errors.description)}
                            placeholder="Description"
                            className="h-24 w-full resize-none text-sm"
                          />
                        )}
                      />
                    </div>
                    <div className="flex my-5 gap-5">
                      <div>
                        {
                          <Controller
                            name="project_id"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <TimeSelectProject
                                value={value ?? undefined}
                                onChange={onChange}
                                projects={workspaceProjectIds ?? undefined}
                              />
                            )}
                          />
                        }
                      </div>
                      <CustomMenu
                        customButton={
                          <button
                            type="button"
                            className="flex items-center justify-between gap-1 w-full cursor-pointer rounded border-[0.5px] border-custom-border-300 text-custom-text-200 px-2 py-1 text-xs hover:bg-custom-background-80"
                          >
                            {watch("issue") ? (
                              <div className="flex items-center gap-1 text-custom-text-200">
                                <LayoutPanelTop className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {selectedParentIssue &&
                                    `${selectedParentIssue.project__identifier}-
                                  ${selectedParentIssue.sequence_id}`}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-custom-text-300">
                                <LayoutPanelTop className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">Issue</span>
                              </div>
                            )}
                          </button>
                        }
                        placement="bottom-start"
                        tabIndex={15}
                      >
                        <CustomMenu.MenuItem className="!p-1" onClick={() => ListModalOpen(true)}>
                          Select Issue
                        </CustomMenu.MenuItem>
                      </CustomMenu>
                      <Controller
                        control={control}
                        name="issue"
                        render={({ field: { onChange } }) => (
                          <ParentIssuesListModal
                            isOpen={IssueListModalOpen}
                            handleClose={() => ListModalOpen(false)}
                            onChange={(issue) => {
                              onChange(issue.id);
                              handleFormChange();
                              setSelectedParentIssue(issue);
                            }}
                            projectId={projectId}
                          />
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="neutral-primary" size="sm" type="submit">
                        Submit
                      </Button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
