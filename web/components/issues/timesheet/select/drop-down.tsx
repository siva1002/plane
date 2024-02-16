import { useProject } from "hooks/store";
import { observer } from "mobx-react-lite";
import { SelectProject } from "./select-project";
import { useForm } from "react-hook-form";
import { IProjectSelect } from "@plane/types";
import { Controller} from "react-hook-form";
{/* <Controller
      name="id"
      control={control}
      render={({ field: { value, onChange } }) => (
        <SelectProject
          value={value}
          onChange={(val: string) => {
            if (params.id === val) setValue("id", null);
            onChange(val);
          }}
          params={params}
          projects={workspaceProjectIds ?? []}
        />
      )} */}

     
    