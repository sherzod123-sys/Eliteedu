from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Max, Count, Q
from .models import TypingTest, TypingResult, ArenaLeaderboard
from .serializers import TypingTestSerializer, TypingResultSerializer
from .serializers import (
    TypingTestSerializer, TypingResultSerializer, 
    ArenaLeaderboardSerializer, GeneralLeaderboardSerializer
)

class TypingTestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TypingTest.objects.filter(is_active=True)
    serializer_class = TypingTestSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='random')
    def random(self, request):
        language = request.query_params.get('language')
        difficulty = request.query_params.get('difficulty')

        filters = {'is_active': True}
        if language:
            filters['language'] = language
        if difficulty:
            filters['difficulty'] = difficulty

        test = TypingTest.objects.filter(**filters).order_by('?').first()

        if not test:
            return Response({
                'ok': False,
                'message': 'Bazada bunday test topilmadi',
                'data': []
            }, status=status.HTTP_200_OK)

        serializer = TypingTestSerializer(test)
        return Response({
            'ok': True,
            'data': [serializer.data]
        })



class TypingResultViewSet(viewsets.ModelViewSet):
    serializer_class = TypingResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return TypingResult.objects.all()
        return TypingResult.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        user_results = TypingResult.objects.filter(user=request.user)

        stats = user_results.aggregate(
            avg_wpm=Avg('wpm'),
            avg_accuracy=Avg('accuracy'),
            best_wpm=Max('wpm'),
            total_tests=Count('id')
        )

        arena_stats = user_results.filter(is_arena=True).aggregate(
            arena_avg_wpm=Avg('wpm'),
            arena_best_wpm=Max('wpm'),
            arena_tests=Count('id')
        )

        stats.update(arena_stats)

        recent_results = TypingResultSerializer(
            user_results.order_by('-created_at')[:10],
            many=True
        ).data

        return Response({
            'stats': stats,
            'recent_results': recent_results
        })



class TypingResultViewSet(viewsets.ModelViewSet):
    """Typing natijalar"""
    queryset = TypingResult.objects.all()
    serializer_class = TypingResultSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return TypingResult.objects.all()
        return TypingResult.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Foydalanuvchi statistikasi"""
        user_results = TypingResult.objects.filter(user=request.user)
        
        stats = user_results.aggregate(
            avg_wpm=Avg('wpm'),
            avg_accuracy=Avg('accuracy'),
            best_wpm=Max('wpm'),
            total_tests=Count('id')
        )
        
        arena_stats = user_results.filter(is_arena=True).aggregate(
            arena_avg_wpm=Avg('wpm'),
            arena_best_wpm=Max('wpm'),
            arena_tests=Count('id')
        )
        
        stats.update(arena_stats)
        
        recent_results = TypingResultSerializer(
            user_results.order_by('-created_at')[:10],
            many=True
        ).data
        
        return Response({
            'stats': stats,
            'recent_results': recent_results
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def arena_leaderboard(request):
    """Arena reytingi - TOP 50"""
    leaderboard = ArenaLeaderboard.objects.select_related('user').order_by(
        '-best_wpm', '-best_accuracy'
    )[:50]
    
    serializer = ArenaLeaderboardSerializer(
        leaderboard, 
        many=True, 
        context={'request': request}
    )
    
    try:
        user_rank = ArenaLeaderboard.objects.filter(user=request.user).first()
        user_position = ArenaLeaderboard.objects.filter(
            Q(best_wpm__gt=user_rank.best_wpm) | 
            Q(best_wpm=user_rank.best_wpm, best_accuracy__gt=user_rank.best_accuracy)
        ).count() + 1 if user_rank else None
    except:
        user_position = None
    
    return Response({
        'results': serializer.data,
        'user_position': user_position
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def general_leaderboard(request):
    """Umumiy reyting - barcha testlar"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    users = User.objects.filter(
        role='student',
        typing_results__isnull=False
    ).annotate(
        avg_wpm=Avg('typing_results__wpm'),
        avg_accuracy=Avg('typing_results__accuracy'),
        total_tests=Count('typing_results'),
        best_wpm=Max('typing_results__wpm')
    ).order_by('-avg_wpm', '-avg_accuracy')[:50]
    
    results = []
    for user in users:
        results.append({
            'user_id': user.id,
            'username': user.username,
            'full_name': user.full_name or user.username,
            'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
            'avg_wpm': round(user.avg_wpm, 1),
            'avg_accuracy': round(user.avg_accuracy, 1),
            'total_tests': user.total_tests,
            'best_wpm': user.best_wpm
        })
    
    serializer = GeneralLeaderboardSerializer(results, many=True)
    
    return Response({
        'results': serializer.data
    })