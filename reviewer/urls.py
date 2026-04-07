from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/review/', views.review_code, name='review_code'),
]
