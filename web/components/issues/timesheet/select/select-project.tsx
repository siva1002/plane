import { CustomSelect } from "@plane/ui";
import { useProject } from "hooks/store";import { get } from "lodash";

type Props={
  value: string | null;
  onChange: (val: string) => void;
  projects:string[] | undefined
}

export const TimeSelectProject: React.FC<Props> = (props) => {
    const { value, onChange,projects } = props;
    const {getProjectById}=useProject()
    return (
        <CustomSelect className=""
          value={value}
          label={value && value.length > 0
            ? projects
                ?.filter((p) => value.includes(p))
                .map((p) => getProjectById(p)?.name)
                .join("")
            : "Project"}
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