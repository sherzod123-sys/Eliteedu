from rest_framework import serializers
from .models import TypingTest, TypingResult, ArenaLeaderboard

class TypingTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypingTest
        fields = ['id', 'title', 'text', 'language', 'difficulty', 'word_count', 'created_at']


class TypingResultSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)
    
    class Meta:
        model = TypingResult
        fields = [
            'id', 'user', 'user_name', 'test', 'test_title',
            'wpm', 'accuracy', 'time_taken', 'errors', 
            'is_arena', 'created_at'
        ]
        read_only_fields = ['user']
    
    def create(self, validated_data):
        result = super().create(validated_data)
        
        # Arena rejimida bo'lsa, leaderboard yangilash
        if result.is_arena:
            arena, created = ArenaLeaderboard.objects.get_or_create(user=result.user)
            arena.total_arena_tests += 1
            
            # Eng yaxshi natijani yangilash
            if result.wpm > arena.best_wpm or (
                result.wpm == arena.best_wpm and result.accuracy > arena.best_accuracy
            ):
                arena.best_wpm = result.wpm
                arena.best_accuracy = result.accuracy
            
            arena.save()
        
        return result


class ArenaLeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = ArenaLeaderboard
        fields = ['id', 'username', 'full_name', 'avatar', 'best_wpm', 'best_accuracy', 'total_arena_tests', 'last_updated']
    
    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.user.avatar and hasattr(obj.user.avatar, 'url'):
            return request.build_absolute_uri(obj.user.avatar.url) if request else obj.user.avatar.url
        return None


class GeneralLeaderboardSerializer(serializers.Serializer):
    """Umumiy reyting - barcha testlar"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    avatar = serializers.URLField(allow_null=True)
    avg_wpm = serializers.FloatField()
    avg_accuracy = serializers.FloatField()
    total_tests = serializers.IntegerField()
    best_wpm = serializers.IntegerField()