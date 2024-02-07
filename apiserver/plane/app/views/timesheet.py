#Third party imports
from rest_framework.response import Response
from rest_framework import status

#In house imports
from .base import BaseViewSet
from plane.db.models import (TimeSheet,ProjectMember)
from plane.app.views.base import BaseAPIView
from ..serializers import TimeSheetSerializer
from plane.utils.issue_filters import issue_filters
from ..permissions.timesheet import (TimesheetLitePermission)
from ..permissions.project import (ProjectEntityPermission)





Admin=20
Member=15
viewer=10
guest=5
class TimesheetView(BaseViewSet):
    model=TimeSheet
    
    permission_classes=[
        TimesheetLitePermission
        ]
    filterset_fields = [
       "assignees",
    ]
    serializer_class=TimeSheetSerializer

    
    def is_projectadmin(self):
        project=self.kwargs.get('project_id')
        is_admin=ProjectMember.objects.filter(member__in=[self.request.user],project=project,role__in=[Admin]).exists()
        return is_admin

    
    def get_queryset(self):
        issue=self.kwargs.get('pk')
        issue_timesheet=super().get_queryset().select_related('actor','issue')
        return issue_timesheet.filter(issue=issue)

    def get(self,*args,**kwargs):
        issue_timesheet_queryset=self.get_queryset()
        issuefilter=issue_filters(
                           self.request.query_params, 
                           "GET")
        if (issuefilter 
            and 
            self.
            is_projectadmin()
           ):
            manipulated_filter = {key.replace(key, f"issue__{key}"): issuefilter.get(key) 
                                  for key in issuefilter}
            issue_timesheet_queryset=issue_timesheet_queryset.filter(**manipulated_filter)
        issue_timesheet=TimeSheetSerializer(
                                issue_timesheet_queryset,
                                many=True)
        return Response(data=issue_timesheet.data,status=status.HTTP_200_OK)

class TimeSheetCreateView(BaseAPIView):
    model=TimeSheet

    permission_classes=[
        TimesheetLitePermission
        ]
    
    serializer_clas=TimeSheetSerializer


    def post(self,request,*args,**kwargs):
        timesheet=TimeSheetSerializer(data=request.data,context={"user":self.request.user})
        if timesheet.is_valid():
            timesheet.save()
            return Response(data={"data":timesheet.data,"message":"Record Created"},status=status.HTTP_201_CREATED)
        return Response(data={"data":timesheet.errors},status=status.HTTP_204_NO_CONTENT)
        

class ProjectTimesheet(BaseAPIView):
    model=TimeSheet

    permission_classes=[ProjectEntityPermission]
    serializer_clas=TimeSheetSerializer

    def get_queryset(self):
        project_id=self.kwargs.get('project_id')
        project_timesheet=super().get_queryset().select_related('actor','issue')
        return project_timesheet.filter(project=project_id)
    
    def get(self, request, *args, **kwargs):
        ''' Get timesheet according to project'''
        timesheet_query_set=self.get_queryset()
        issue_timesheet=TimeSheetSerializer(
                                timesheet_query_set,
                                many=True)
        return Response(data=issue_timesheet.data,status=status.HTTP_200_OK)



        

        
    