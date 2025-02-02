#django imports
from django.db.models import (Q)

#In House imports
from plane.db.models import (ProjectMember,
                             IssueAssignee)

#Third party imports
from rest_framework.permissions import BasePermission,SAFE_METHODS

Admin=20
Member=15
viewer=10
guest=5

class TimesheetLitePermission(BasePermission):
    def has_permission(self, request, view):

        if request.user.is_anonymous:
            return False
        
        if request.method in SAFE_METHODS:
            issue_permission=ProjectMember.objects.filter(
                workspace__slug=view.kwargs.get('slug'),
                member=request.user,
                project_id=view.kwargs.get("project_id"),
                is_active=True,
            ).exists()

            return issue_permission
        
        if request.method in ['POST','UPDATE','PUT']:
            issue=view.kwargs.get('pk')
            issueassignee=IssueAssignee.objects.filter(assignee=request.user,issue=issue).exists()
            return issueassignee