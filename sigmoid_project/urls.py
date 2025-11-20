from django.contrib import admin
from django.urls import path, include
from sigmoid_api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('sigmoid_api.urls')),
    path('', views.frontend_view, name='home'),  # Página principal
]