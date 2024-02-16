import { CustomSelect } from "@plane/ui";
import { TIssue } from "@plane/types";
type Props={
  value: string | null;
  onChange: (val: string) => void;
  issues:TIssue[];
}

export const SelectIssues: React.FC<Props> = (props) => {
    const { value, onChange,issues } = props;
    console.log(value)
    return (
        <CustomSelect
          value={value}
          label={value && value.length > 0
            ? issues
                ?.filter((i) => value.includes(i.id))
                .map((i) => i.name)
                .join("")
            : "All issues"}
          onChange={onChange}
          maxHeight="lg"
        >
          {issues?.map((issue) => {
            return (
              <CustomSelect.Option key={issue?.id} value={issue?.id} className="overflow:scroll">
                {issue?.name}
              </CustomSelect.Option>
            );
          })}
        </CustomSelect>
      );
}