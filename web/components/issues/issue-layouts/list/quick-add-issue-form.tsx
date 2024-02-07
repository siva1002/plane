import { FC, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
// hooks
import { useProject } from "hooks/store";
import useToast from "hooks/use-toast";
import useKeypress from "hooks/use-keypress";
import useOutsideClickDetector from "hooks/use-outside-click-detector";
// constants
import { TIssue, IProject } from "@plane/types";
// types
import { createIssuePayload } from "helpers/issue.helper";

interface IInputProps {
  formKey: string;
  register: any;
  setFocus: any;
  projectDetail: IProject | null;
}
const Inputs: FC<IInputProps> = (props) => {
  const { formKey, register, setFocus, projectDetail } = props;

  useEffect(() => {
    setFocus(formKey);
  }, [formKey, setFocus]);

  return (
    <div className="flex w-full items-center gap-3">
      <div className="text-xs font-medium text-custom-text-400">{projectDetail?.identifier ?? "..."}</div>
      <input
        type="text"
        autoComplete="off"
        placeholder="Issue Title"
        {...register(formKey, {
          required: "Issue title is required.",
        })}
        className="w-full rounded-md bg-transparent px-2 py-3 text-sm font-medium leading-5 text-custom-text-200 outline-none"
      />
    </div>
  );
};

interface IListQuickAddIssueForm {
  prePopulatedData?: Partial<TIssue>;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: TIssue,
    viewId?: string
  ) => Promise<TIssue | undefined>;
  viewId?: string;
}

const defaultValues: Partial<TIssue> = {
  name: "",
};

export const ListQuickAddIssueForm: FC<IListQuickAddIssueForm> = observer((props) => {
  const { prePopulatedData, quickAddCallback, viewId } = props;
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // hooks
  const { getProjectById } = useProject();

  const projectDetail = (projectId && getProjectById(projectId.toString())) || undefined;

  const ref = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  useKeypress("Escape", handleClose);
  useOutsideClickDetector(ref, handleClose);
  const { setToastAlert } = useToast();

  const {
    reset,
    handleSubmit,
    setFocus,
    register,
    formState: { errors, isSubmitting },
  } = useForm<TIssue>({ defaultValues });

  useEffect(() => {
    if (!isOpen) reset({ ...defaultValues });
  }, [isOpen, reset]);

  const onSubmitHandler = async (formData: TIssue) => {
    if (isSubmitting || !workspaceSlug || !projectId) return;

    reset({ ...defaultValues });

    const payload = createIssuePayload(projectId.toString(), {
      ...(prePopulatedData ?? {}),
      ...formData,
    });

    try {
      quickAddCallback &&
        (await quickAddCallback(workspaceSlug.toString(), projectId.toString(), { ...payload }, viewId));
      setToastAlert({
        type: "success",
        title: "Success!",
        message: "Issue created successfully.",
      });
    } catch (err: any) {
      setToastAlert({
        type: "error",
        title: "Error!",
        message: err?.message || "Some error occurred. Please try again.",
      });
    }
  };

  return (
    <div
      className={`border-b border-t border-custom-border-200 bg-custom-background-100 ${
        errors && errors?.name && errors?.name?.message ? `border-red-500 bg-red-500/10` : ``
      }`}
    >
      {isOpen ? (
        <div className="shadow-custom-shadow-sm">
          <form
            ref={ref}
            onSubmit={handleSubmit(onSubmitHandler)}
            className="flex w-full items-center gap-x-3 border-[0.5px] border-t-0 border-custom-border-100 bg-custom-background-100 px-3"
          >
            <Inputs formKey={"name"} register={register} setFocus={setFocus} projectDetail={projectDetail ?? null} />
          </form>
          <div className="px-3 py-2 text-xs italic text-custom-text-200">{`Press 'Enter' to add another issue`}</div>
        </div>
      ) : (
        <div
          className="flex w-full cursor-pointer items-center gap-2 p-3 py-3 text-custom-primary-100"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="h-3.5 w-3.5 stroke-2" />
          <span className="text-sm font-medium text-custom-primary-100">New Issue</span>
        </div>
      )}
    </div>
  );
});
