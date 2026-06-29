"""
URL configuration for hint_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from hints.views import HintViewSet
from hints.problem_views import ProblemViewSet
from hints.code_views import CodeViewSet
from hints.auth_views import AuthViewSet
from hints.social_views import LeaderboardViewSet, ForumPostViewSet, SolutionShareViewSet

router = DefaultRouter()
router.register(r'hints', HintViewSet, basename='hint')
router.register(r'problems', ProblemViewSet, basename='problem')
router.register(r'code', CodeViewSet, basename='code')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'forums', ForumPostViewSet, basename='forum')
router.register(r'solutions', SolutionShareViewSet, basename='solution')

from hints.analytics_views import AnalyticsViewSet
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

from hints.sheet_views import ProblemSheetViewSet
router.register(r'sheets', ProblemSheetViewSet, basename='sheet')

from hints.daily_views import DailyProblemViewSet
router.register(r'daily', DailyProblemViewSet, basename='daily')

def root_view(request):
    return JsonResponse({
        "name": "Hint Generation API",
        "status": "ok",
        "routes": [
            "/api/hints/", 
            "/api/problems/", 
            "/api/code/", 
            "/api/auth/", 
            "/admin/"
        ]
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
