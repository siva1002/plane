#Third party imports
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

#In house imports
from .base import BaseViewSet
from plane.db.models import (TimeSheet,ProjectMember,Issue)
from plane.app.views.base import BaseAPIView
from ..serializers import TimeSheetSerializer
from ..permissions.timesheet import (TimesheetLitePermission)
from ..permissions.project import (ProjectEntityPermission)
from plane.utils.timesheet_filter import timesheet_filter





Admin=20
Member=15
viewer=10
guest=5
timesheet_filter_fields=['created_at', 'updated_at']
class TimesheetView(BaseViewSet):
    model=TimeSheet
    
    permission_classes=[
        TimesheetLitePermission
        ]
    
    filterset_fields = [
       "assignees",
       "created_at"
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
        issuefilter=timesheet_filter(
                    self.request.query_params, 
                    "GET")
        if (issuefilter):
            issue_timesheet_queryset=issue_timesheet_queryset.filter(**issuefilter).order_by("created_at")
        
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
        return Response(data={"data":timesheet.errors},status=status.HTTP_206_PARTIAL_CONTENT)
    
    def patch(self,request,*args,**kwargs):
        instance=TimeSheet.objects.get(id=kwargs.get('pk'))
        timesheet=TimeSheetSerializer(instance=instance,
                                      data=request.data,
                                      context={"user":self.request.user})
        if timesheet.is_valid():
            timesheet.save()
            return Response(data={"data":timesheet.data,"message":"Record Update"},status=status.HTTP_201_CREATED)
        return Response(data={"data":timesheet.errors},status=status.HTTP_206_PARTIAL_CONTENT)
        

class ProjectTimesheet(BaseAPIView):
    model=TimeSheet

    permission_classes=[ProjectEntityPermission]
    serializer_clas=TimeSheetSerializer

    def get_queryset(self):
        project_id=self.kwargs.get('project_id')
        project_timesheet=TimeSheet.objects.filter(project=project_id)
        return project_timesheet
    
    def get(self, request, *args, **kwargs):
        ''' Get timesheet according to project'''
        timesheet_query_set=self.get_queryset()
        issuefilter=timesheet_filter(
                    self.request.query_params, 
                    "GET")
        if (issuefilter):
            issue_timesheet_queryset=timesheet_query_set.filter(**issuefilter).order_by("created_at")
        issue_timesheet=TimeSheetSerializer(
                                issue_timesheet_queryset,
                                many=True)
        return Response(data=issue_timesheet.data,status=status.HTTP_200_OK)



        

        
    