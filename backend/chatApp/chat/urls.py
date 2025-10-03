from django.urls import path
from . import views

urlpatterns = [
    path("",views.home),
    path("Register/",views.register),
    path("users_list/",views.users_list),
    path("Login/",views.login),
    path("search_user/",views.search_user),
    path("add_fake_messages/", views.add_fake_messages),
    path("fetch_message/",views.fetching_messages),
]