from django.contrib import admin
from .models import TypingTest, TypingResult, ArenaLeaderboard

@admin.register(TypingTest)
class TypingTestAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'difficulty', 'word_count', 'is_active', 'created_at']
    list_filter = ['language', 'difficulty', 'is_active']
    search_fields = ['title', 'text']

@admin.register(TypingResult)
class TypingResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'test', 'wpm', 'accuracy', 'is_arena', 'created_at']
    list_filter = ['is_arena', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']

@admin.register(ArenaLeaderboard)
class ArenaLeaderboardAdmin(admin.ModelAdmin):
    list_display = ['user', 'best_wpm', 'best_accuracy', 'total_arena_tests', 'last_updated']
    search_fields = ['user__username']
    readonly_fields = ['last_updated']