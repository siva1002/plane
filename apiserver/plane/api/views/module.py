# Python imports
import json

# Django imports
from django.db.models import Count, Prefetch, Q, F, Func, OuterRef
from django.utils import timezone
from django.core import serializers

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from .base import BaseAPIView, WebhookMixin
from plane.app.permissions import ProjectEntityPermission
from plane.db.models import (
    Project,
    Module,
    ModuleLink,
    Issue,
    ModuleIssue,
    IssueAttachment,
    IssueLink,
)
from plane.api.serializers import (
    ModuleSerializer,
    ModuleIssueSerializer,
    IssueSerializer,
)
from plane.bgtasks.issue_activites_task import issue_activity


class ModuleAPIEndpoint(WebhookMixin, BaseAPIView):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions related to module.

    """

    model = Module
    permission_classes = [
        ProjectEntityPermission,
    ]
    serializer_class = ModuleSerializer
    webhook_event = "module"

    def get_queryset(self):
        return (
            Module.objects.filter(project_id=self.kwargs.get("project_id"))
            .filter(workspace__slug=self.kwargs.get("slug"))
            .select_related("project")
            .select_related("workspace")
            .select_related("lead")
            .prefetch_related("members")
            .prefetch_related(
                Prefetch(
                    "link_module",
                    queryset=ModuleLink.objects.select_related(
                        "module", "created_by"
                    ),
                )
            )
            .annotate(
                total_issues=Count(
                    "issue_module",
                    filter=Q(
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                ),
            )
            .annotate(
                completed_issues=Count(
                    "issue_module__issue__state__group",
                    filter=Q(
                        issue_module__issue__state__group="completed",
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                )
            )
            .annotate(
                cancelled_issues=Count(
                    "issue_module__issue__state__group",
                    filter=Q(
                        issue_module__issue__state__group="cancelled",
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                )
            )
            .annotate(
                started_issues=Count(
                    "issue_module__issue__state__group",
                    filter=Q(
                        issue_module__issue__state__group="started",
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                )
            )
            .annotate(
                unstarted_issues=Count(
                    "issue_module__issue__state__group",
                    filter=Q(
                        issue_module__issue__state__group="unstarted",
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                )
            )
            .annotate(
                backlog_issues=Count(
                    "issue_module__issue__state__group",
                    filter=Q(
                        issue_module__issue__state__group="backlog",
                        issue_module__issue__archived_at__isnull=True,
                        issue_module__issue__is_draft=False,
                    ),
                )
            )
            .order_by(self.kwargs.get("order_by", "-created_at"))
        )

    def post(self, request, slug, project_id):
        project = Project.objects.get(pk=project_id, workspace__slug=slug)
        serializer = ModuleSerializer(
            data=request.data,
            context={
                "project_id": project_id,
                "workspace_id": project.workspace_id,
            },
        )
        if serializer.is_valid():
            serializer.save()
            module = Module.objects.get(pk=serializer.data["id"])
            serializer = ModuleSerializer(module)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, slug, project_id, pk):
        module = Module.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        serializer = ModuleSerializer(
            module,
            data=request.data,
            context={"project_id": project_id},
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, slug, project_id, pk=None):
        if pk:
            queryset = self.get_queryset().get(pk=pk)
            data = ModuleSerializer(
                queryset,
                fields=self.fields,
                expand=self.expand,
            ).data
            return Response(
                data,
                status=status.HTTP_200_OK,
            )
        return self.paginate(
            request=request,
            queryset=(self.get_queryset()),
            on_results=lambda modules: ModuleSerializer(
                modules,
                many=True,
                fields=self.fields,
                expand=self.expand,
            ).data,
        )

    def delete(self, request, slug, project_id, pk):
        module = Module.objects.get(
            workspace__slug=slug, project_id=project_id, pk=pk
        )
        module_issues = list(
            ModuleIssue.objects.filter(module_id=pk).values_list(
                "issue", flat=True
            )
        )
        issue_activity.delay(
            type="module.activity.deleted",
            requested_data=json.dumps(
                {
                    "module_id": str(pk),
                    "module_name": str(module.name),
                    "issues": [str(issue_id) for issue_id in module_issues],
                }
            ),
            actor_id=str(request.user.id),
            issue_id=None,
            project_id=str(project_id),
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
        )
        module.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ModuleIssueAPIEndpoint(WebhookMixin, BaseAPIView):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions related to module issues.

    """

    serializer_class = ModuleIssueSerializer
    model = ModuleIssue
    webhook_event = "module_issue"
    bulk = True

    permission_classes = [
        ProjectEntityPermission,
    ]

    def get_queryset(self):
        return (
            ModuleIssue.objects.annotate(
                sub_issues_count=Issue.issue_objects.filter(
                    parent=OuterRef("issue")
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(module_id=self.kwargs.get("module_id"))
            .filter(project__project_projectmember__member=self.request.user)
            .select_related("project")
            .select_related("workspace")
            .select_related("module")
            .select_related("issue", "issue__state", "issue__project")
            .prefetch_related("issue__assignees", "issue__labels")
            .prefetch_related("module__members")
            .order_by(self.kwargs.get("order_by", "-created_at"))
            .distinct()
        )

    def get(self, request, slug, project_id, module_id):
        order_by = request.GET.get("order_by", "created_at")
        issues = (
            Issue.issue_objects.filter(issue_module__module_id=module_id)
            .annotate(
                sub_issues_count=Issue.issue_objects.filter(
                    parent=OuterRef("id")
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(bridge_id=F("issue_module__id"))
            .filter(project_id=project_id)
            .filter(workspace__slug=slug)
            .select_related("project")
            .select_related("workspace")
            .select_related("state")
            .select_related("parent")
            .prefetch_related("assignees")
            .prefetch_related("labels")
            .order_by(order_by)
            .annotate(
                link_count=IssueLink.objects.filter(issue=OuterRef("id"))
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                attachment_count=IssueAttachment.objects.filter(
                    issue=OuterRef("id")
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
        )
        return self.paginate(
            request=request,
            queryset=(issues),
            on_results=lambda issues: IssueSerializer(
                issues,
                many=True,
                fields=self.fields,
                expand=self.expand,
            ).data,
        )

    def post(self, request, slug, project_id, module_id):
        issues = request.data.get("issues", [])
        if not len(issues):
            return Response(
                {"error": "Issues are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        module = Module.objects.get(
            workspace__slug=slug, project_id=project_id, pk=module_id
        )

        issues = Issue.objects.filter(
            workspace__slug=slug, project_id=project_id, pk__in=issues
        ).values_list("id", flat=True)

        module_issues = list(ModuleIssue.objects.filter(issue_id__in=issues))

        update_module_issue_activity = []
        records_to_update = []
        record_to_create = []

        for issue in issues:
            module_issue = [
                module_issue
                for module_issue in module_issues
                if str(module_issue.issue_id) in issues
            ]

            if len(module_issue):
                if module_issue[0].module_id != module_id:
                    update_module_issue_activity.append(
                        {
                            "old_module_id": str(module_issue[0].module_id),
                            "new_module_id": str(module_id),
                            "issue_id": str(module_issue[0].issue_id),
                        }
                    )
                    module_issue[0].module_id = module_id
                    records_to_update.append(module_issue[0])
            else:
                record_to_create.append(
                    ModuleIssue(
                        module=module,
                        issue_id=issue,
                        project_id=project_id,
                        workspace=module.workspace,
                        created_by=request.user,
                        updated_by=request.user,
                    )
                )

        ModuleIssue.objects.bulk_create(
            record_to_create,
            batch_size=10,
            ignore_conflicts=True,
        )

        ModuleIssue.objects.bulk_update(
            records_to_update,
            ["module"],
            batch_size=10,
        )

        # Capture Issue Activity
        issue_activity.delay(
            type="module.activity.created",
            requested_data=json.dumps({"modules_list": str(issues)}),
            actor_id=str(self.request.user.id),
            issue_id=None,
            project_id=str(self.kwargs.get("project_id", None)),
            current_instance=json.dumps(
                {
                    "updated_module_issues": update_module_issue_activity,
                    "created_module_issues": serializers.serialize(
                        "json", record_to_create
                    ),
                }
            ),
            epoch=int(timezone.now().timestamp()),
        )

        return Response(
            ModuleIssueSerializer(self.get_queryset(), many=True).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, slug, project_id, module_id, issue_id):
        module_issue = ModuleIssue.objects.get(
            workspace__slug=slug,
            project_id=project_id,
            module_id=module_id,
            issue_id=issue_id,
        )
        module_issue.delete()
        issue_activity.delay(
            type="module.activity.deleted",
            requested_data=json.dumps(
                {
                    "module_id": str(module_id),
                    "issues": [str(module_issue.issue_id)],
                }
            ),
            actor_id=str(request.user.id),
            issue_id=str(issue_id),
            project_id=str(project_id),
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
