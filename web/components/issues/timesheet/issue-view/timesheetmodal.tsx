import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm, Controller } from 'react-hook-form';
// ui
import { Button, Input } from "@plane/ui";
// hooks
import useToast from "hooks/use-toast";
// types
import { useIssues } from "hooks/store/use-issues";
import { TIssue } from "@plane/types";
import { useProject } from "hooks/store";
import { TIssueTimesheet } from "@plane/types";


type Props = {
  isOpen: boolean;
  handleClose: () => void;
  data?: TIssue;
  onSubmit?: () => Promise<void>;
};
type TTimesheetFormValues = {
  workedhours: number;
  description: string;
};
export const IssueTimeSheetModal: React.FC<Props> = (props) => {
  const { data, isOpen, handleClose } = props;
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    setFocus,
  } = useForm<TTimesheetFormValues>({
    defaultValues: {
      workedhours: 0,
      description: ""
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { setToastAlert } = useToast();
  // hooks
  const { getProjectById } = useProject();

  useEffect(() => {
    setIsCreateLoading(false);
  }, [isOpen]);
  useEffect(() => {
    setFocus("workedhours");
  }, [setFocus]);
  // // if (!dataId && !data) return null;

  // const issue = data ? data : issueMap[dataId!];

  const onClose = () => {
    setIsCreateLoading(false);
    handleClose();
  };
  const handleFormSubmit = async (data: TTimesheetFormValues) => {

    console.log(data); // Here you can handle the form data
    const payload: TIssueTimesheet = {
      duration: data.workedhours,
      description: data.description,
      issueid: ''
    };

    onClose();
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-custom-background-100 text-left shadow-custom-shadow-md transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex w-full items-center justify-start gap-6">
                    <span className="flex items-center justify-start">
                      <h3 className="text-xl font-medium 2xl:text-2xl">Update timesheet</h3>
                    </span>
                  </div>
                  <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div>
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
                          <Input
                            type="text"
                            value={value}
                            onChange={onChange}
                            placeholder="Description"
                            className="w-full text-sm font-medium"
                          />
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="neutral-primary" size="sm" type="submit" >
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
