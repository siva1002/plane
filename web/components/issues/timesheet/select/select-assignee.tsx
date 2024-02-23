import { CustomSelect } from "@plane/ui";
import { IUserLite } from "@plane/types";
type Props={
  value: string | null;
  onChange: (val: string) => void;
  assginees:IUserLite[] | undefined;
}

export const SelectAssignee: React.FC<Props> = (props) => {
    const { value, onChange,assginees } = props;

    return (
        <CustomSelect
          value={value}
          label={value && value.length > 0
            ? assginees
                ?.filter((i) => value.includes(i.id))
                .map((i) => i.first_name)
                .join("")
            : "Member"}
          onChange={onChange}
          maxHeight="lg"
        >
          {assginees?.map((assignee) => {
            return (
              <CustomSelect.Option key={assignee?.id} value={assignee?.id} className="overflow:scroll">
                {assignee.first_name}
              </CustomSelect.Option>
            );
          })}
        </CustomSelect>
      );
}