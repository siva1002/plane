import React from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useIssues,useUser } from "hooks/store";
import { EIssuesStoreType } from "constants/issue";


interface IProfileIssuesPage {
    type: "assigned" | "subscribed" | "created" ;
}

export const AllIssues = observer((props: IProfileIssuesPage) => {
    const { type } = props;
    const route = useRouter()
    const { workspaceSlug } = route.query as { workspaceSlug: string }
    const { issues:Issues } = useIssues(EIssuesStoreType.PROFILE);
    const {currentUser}=useUser()
    console.log(Issues.fetchIssues(workspaceSlug,undefined,'init-loader',currentUser?.id,type).then((res)=> res))
    return <>
        Hi
    </>
})

