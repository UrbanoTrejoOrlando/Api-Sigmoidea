import numpy as np
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from .models import SigmoidParameters
from .serializers import SigmoidParametersSerializer

class SigmoidParametersViewSet(viewsets.ModelViewSet):
    queryset = SigmoidParameters.objects.all().order_by('-created_at')
    serializer_class = SigmoidParametersSerializer

@api_view(['POST'])
def calculate_sigmoid(request):
    """
    Calcula valores de función sigmoidea con parámetros personalizados
    """
    try:
        data = request.data
        
        # Parámetros por defecto
        x_shift = data.get('x_shift', 0.0)
        steepness = data.get('steepness', 1.0)
        x_range_start = data.get('x_range_start', -10.0)
        x_range_end = data.get('x_range_end', 10.0)
        num_points = data.get('num_points', 100)
        
        # Generar puntos x
        x_values = np.linspace(x_range_start, x_range_end, num_points)
        
        # Calcular función sigmoidea: f(x) = 1 / (1 + e^(-steepness*(x - x_shift)))
        sigmoid_values = 1 / (1 + np.exp(-steepness * (x_values - x_shift)))
        
        # Guardar parámetros en la base de datos
        params = SigmoidParameters.objects.create(
            x_shift=x_shift,
            steepness=steepness
        )
        
        response_data = {
            'parameters': {
                'id': params.id,
                'x_shift': x_shift,
                'steepness': steepness,
                'x_range': [x_range_start, x_range_end],
                'num_points': num_points
            },
            'data': [
                {'x': float(x), 'y': float(y)} 
                for x, y in zip(x_values, sigmoid_values)
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
def get_sigmoid_data(request, param_id):
    """
    Obtiene datos de sigmoidea basados en parámetros guardados
    """
    try:
        params = SigmoidParameters.objects.get(id=param_id)
        
        # Generar datos
        x_values = np.linspace(-10, 10, 100)
        sigmoid_values = 1 / (1 + np.exp(-params.steepness * (x_values - params.x_shift)))
        
        response_data = {
            'parameters': {
                'id': params.id,
                'x_shift': params.x_shift,
                'steepness': params.steepness,
                'created_at': params.created_at
            },
            'data': [
                {'x': float(x), 'y': float(y)} 
                for x, y in zip(x_values, sigmoid_values)
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except SigmoidParameters.DoesNotExist:
        return Response(
            {'error': 'Parámetros no encontrados'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def demonstrate_nonlinear_separability(request):
    """
    Demuestra separabilidad no lineal usando sigmoidea
    """
    try:
        # Crear datos de ejemplo no linealmente separables
        np.random.seed(42)
        n_points = 200
        
        # Generar datos en forma de anillo
        radius_inner = 2
        radius_outer = 5
        
        # Puntos clase 0 (interior)
        theta = np.random.uniform(0, 2*np.pi, n_points//2)
        r = radius_inner + np.random.normal(0, 0.3, n_points//2)
        x1_inner = r * np.cos(theta)
        x2_inner = r * np.sin(theta)
        y_inner = np.zeros(n_points//2)
        
        # Puntos clase 1 (exterior)
        theta = np.random.uniform(0, 2*np.pi, n_points//2)
        r = radius_outer + np.random.normal(0, 0.3, n_points//2)
        x1_outer = r * np.cos(theta)
        x2_outer = r * np.sin(theta)
        y_outer = np.ones(n_points//2)
        
        # Combinar datos
        x1 = np.concatenate([x1_inner, x1_outer])
        x2 = np.concatenate([x2_inner, x2_outer])
        y = np.concatenate([y_inner, y_outer])
        
        # Aplicar transformación no lineal (distancia al origen)
        r_transformed = np.sqrt(x1**2 + x2**2)
        
        # Aplicar sigmoidea para clasificación
        # Punto de decisión en radio 3.5
        decision_boundary = 3.5
        steepness = 2.0
        probabilities = 1 / (1 + np.exp(-steepness * (r_transformed - decision_boundary)))
        
        predictions = (probabilities > 0.5).astype(int)
        accuracy = np.mean(predictions == y)
        
        response_data = {
            'explanation': 'Demostración de separabilidad no lineal usando transformación radial y función sigmoidea',
            'decision_boundary': decision_boundary,
            'steepness': steepness,
            'accuracy': float(accuracy),
            'original_data': [
                {'x1': float(x1), 'x2': float(x2), 'class': int(cls), 'radius': float(rad)}
                for x1, x2, cls, rad in zip(x1, x2, y, r_transformed)
            ],
            'predictions': [
                {'radius': float(rad), 'probability': float(prob), 'predicted_class': int(pred)}
                for rad, prob, pred in zip(r_transformed, probabilities, predictions)
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

def frontend_view(request):
    """Vista para servir el frontend principal"""
    return render(request, 'frontend.html')