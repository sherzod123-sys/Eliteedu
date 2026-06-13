from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TypingTestViewSet, TypingResultViewSet,
    arena_leaderboard, general_leaderboard
)

router = DefaultRouter()
router.register('tests', TypingTestViewSet, basename='typing-test')
router.register('results', TypingResultViewSet, basename='typing-result')

urlpatterns = [
    # ❌ BU QATORNI O'CHIRING - Router avtomatik yaratadi!
    # path('tests/random/', TypingTestViewSet.as_view({'get': 'random'}), name='test-random'),
    
    # Router yo'llari
    path('', include(router.urls)),
    
    # Leaderboard
    path('leaderboard/arena/', arena_leaderboard, name='arena-leaderboard'),
    path('leaderboard/general/', general_leaderboard, name='general-leaderboard'),
]