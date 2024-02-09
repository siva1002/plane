import { CustomSelect } from "@plane/ui";
import { IProject,IProjectLite } from "@plane/types";
import { useProject } from "hooks/store";import { get } from "lodash";

type Props={
  value: string | null;
  onChange: (val: string) => void;
  projects:string[] | undefined
}

export const SelectProject: React.FC<Props> = (props) => {
    const { value, onChange,projects } = props;
    const {getProjectById}=useProject()
    return (
        <CustomSelect
          value={value}
          label={value && value.length > 0
            ? projects
                ?.filter((p) => value.includes(p))
                .map((p) => getProjectById(p)?.name)
                .join("")
            : "All projects"}
          onChange={onChange}
          maxHeight="lg"
        >
          {projects?.map((project) => {
            const p=getProjectById(project)
            return (
              <CustomSelect.Option key={p?.id} value={p?.id}>
                {p?.name}
              </CustomSelect.Option>
            );
          })}
        </CustomSelect>
      );
}