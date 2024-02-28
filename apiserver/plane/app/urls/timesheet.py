from django.urls import path
from plane.app.views  import (TimesheetView,TimeSheetCreateView,ProjectTimesheet)

urlpatterns=[
    
    path(
        'workspaces/<str:slug>/timesheet/<uuid:project_id>/issue/<uuid:pk>',
        TimesheetView.as_view({"get":"get"})),
    
    path('workspaces/<str:slug>/timesheet/<uuid:project_id>/issue/<uuid:pk>/create',
         TimeSheetCreateView.as_view()),
    
    path('workspaces/<str:slug>/projects/<uuid:project_id>/timesheet',
         ProjectTimesheet.as_view()),
    
    path('workspaces/<str:slug>/timesheet/<uuid:project_id>/issue/<uuid:issue>/<uuid:pk>/',
         TimeSheetCreateView.as_view())
    ]