from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'parameters', views.SigmoidParametersViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('calculate/', views.calculate_sigmoid, name='calculate-sigmoid'),
    path('data/<int:param_id>/', views.get_sigmoid_data, name='get-sigmoid-data'),
    path('demo/nonlinear-separability/', views.demonstrate_nonlinear_separability, name='nonlinear-separability'),
]