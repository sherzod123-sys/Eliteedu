# apps/blog/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from django.shortcuts import get_object_or_404
from .models import BlogPost, Comment, BlogPostReaction
from .serializers import BlogPostSerializer, CommentSerializer


# ==================== UMUMIY VIEWLAR ====================

class BlogPostListView(APIView):  # ← TO'G'RI NOM
    parser_classes = [MultiPartParser, FormParser]

    def get_authenticators(self):
        return [JWTAuthentication()] if self.request.method == 'POST' else []

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method == 'POST' else [permissions.AllowAny()]

    def get(self, request):
        posts = BlogPost.objects.filter(status='published').order_by('-published_at')
        serializer = BlogPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if getattr(request.user, 'role', None) not in ['teacher', 'admin']:
            return Response({"error": "Faqat o'qituvchilar yozishi mumkin"}, status=status.HTTP_403_FORBIDDEN)

        serializer = BlogPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user, status='published')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogPostDetailView(APIView):  # ← TO'G'RI NOM
    parser_classes = [MultiPartParser, FormParser]

    def get_authenticators(self):
        return [JWTAuthentication()] if self.request.method in ['PUT', 'PATCH', 'DELETE'] else []

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method in ['PUT', 'PATCH', 'DELETE'] else [permissions.AllowAny()]

    def get_object(self, slug):
        return get_object_or_404(BlogPost, slug=slug)

    def get(self, request, slug):
        post = self.get_object(slug)
        if post.status != 'published' and (not request.user.is_authenticated or request.user != post.author):
            return Response({"error": "Maqola topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        post.views_count += 1
        post.save(update_fields=['views_count'])
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data)

    def put(self, request, slug):
        post = self.get_object(slug)
        if request.user != post.author and not request.user.is_staff:
            return Response({"error": "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        serializer = BlogPostSerializer(post, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, slug):
        post = self.get_object(slug)
        if request.user != post.author and not request.user.is_staff:
            return Response({"error": "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        serializer = BlogPostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        post = self.get_object(slug)
        if request.user != post.author and not request.user.is_staff:
            return Response({"error": "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response({"message": "Maqola o'chirildi"}, status=status.HTTP_204_NO_CONTENT)


class BlogPostReactionView(APIView):  # ← TO'G'RI NOM
    """
    VAQTINCHA: Authentication va permission'ni butunlay o'chirib qo'yamiz
    Keyin kerak bo'lganda yoqamiz
    """
    authentication_classes = []  # VAQTINCHA O'CHIQ
    permission_classes = []      # VAQTINCHA O'CHIQ

    def post(self, request, slug):
        """
        DEBUG REJIM: Har qanday so'rovni qabul qilamiz
        """
        print("\n" + "="*100)
        print("🎯 BLOGPOST REACTION VIEW - ICHIDA")
        print("="*100)
        print(f"📌 Slug: {slug}")
        print(f"👤 User object: {request.user}")
        print(f"🔐 Is authenticated: {request.user.is_authenticated}")
        print(f"🆔 User ID: {getattr(request.user, 'id', 'N/A')}")
        print(f"👥 Username: {getattr(request.user, 'username', 'Anonymous')}")
        
        # Session
        if hasattr(request, 'session'):
            print(f"💾 Session key: {request.session.session_key}")
        else:
            print("💾 No session attribute")
        
        # Cookies
        print(f"🍪 Cookies: {list(request.COOKIES.keys())}")
        
        # Headers
        print(f"📨 Auth header: {request.headers.get('Authorization', 'None')}")
        print(f"🛡️ X-CSRFToken: {request.headers.get('X-CSRFToken', 'None')}")
        
        # Request data
        print(f"📦 Request data: {request.data}")
        print(f"📝 Raw POST: {request.POST}")
        print(f"🔧 Method: {request.method}")
        print("="*100 + "\n")
        
        try:
            # Postni olish
            post = get_object_or_404(BlogPost, slug=slug, status='published')
            reaction_type = request.data.get('reaction', 'like')
            
            # VAQTINCHA: Har qanday holatda ham ishlaydi
            if request.user.is_authenticated:
                # Login qilgan foydalanuvchi uchun reaction saqlash
                reaction, created = BlogPostReaction.objects.update_or_create(
                    post=post, 
                    user=request.user,
                    defaults={'reaction': reaction_type}
                )
                message = "Login qilgan foydalanuvchi - reaction saqlandi"
                user_status = "authenticated"
            else:
                # Login qilmagan foydalanuvchi uchun faqat sonlarni ko'rsatish
                message = "Login qilmagan foydalanuvchi - faqat sonlar"
                user_status = "anonymous"
                created = False
            
            # Like/dislike sonlarini yangilash
            post.likes_count = post.reactions.filter(reaction='like').count()
            post.dislikes_count = post.reactions.filter(reaction='dislike').count()
            post.save(update_fields=['likes_count', 'dislikes_count'])
            
            return Response({
                "status": "success",
                "message": message,
                "data": {
                    "likes": post.likes_count,
                    "dislikes": post.dislikes_count,
                    "your_reaction": reaction_type if request.user.is_authenticated else None,
                    "created": created if request.user.is_authenticated else False,
                    "post": {
                        "title": post.title,
                        "slug": post.slug
                    }
                },
                "debug": {
                    "user_status": user_status,
                    "user_id": getattr(request.user, 'id', None),
                    "username": getattr(request.user, 'username', 'Anonymous'),
                    "view_reached": True,
                    "post_found": True
                }
            })
            
        except Exception as e:
            print(f"❌ ERROR in reaction view: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Xatolik: {str(e)}",
                "debug": {
                    "error": str(e),
                    "view_reached": True,
                    "post_found": False
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlogPostCommentsView(APIView):  # ← TO'G'RI NOM
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug, status='published')
        comments = Comment.objects.filter(post=post).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Izoh qoldirish uchun tizimga kiring"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(BlogPost, slug=slug, status='published')
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== TEACHER VIEWLAR ====================

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) in ['teacher', 'admin']


class TeacherBlogListView(APIView):
    permission_classes = [IsTeacher]
    # Rasm yuklash va forma ma'lumotlarini o'qish uchun parserlar
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        # Faqat login qilgan o'qituvchining hamma bloglarini olamiz
        posts = BlogPost.objects.filter(author=request.user).order_by('-created_at')
        serializer = BlogPostSerializer(posts, many=True, context={'request': request})
        
        # MUHIM: Dashboard 'results' kalitini kutmoqda
        return Response({
            "count": posts.count(),
            "results": serializer.data
        })

    def post(self, request):
        # Yangi blog qo'shish funksiyasi
        serializer = BlogPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Muallifni avtomatik biriktiramiz va statusini 'published' qilamiz
            serializer.save(author=request.user, status='published')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Blog Error:", serializer.errors) # Xatoni terminalda ko'rish uchun
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherBlogCRUDView(APIView):  # ← TO'G'RI NOM
    permission_classes = [IsTeacher]

    def get_object(self, pk):
        return get_object_or_404(BlogPost, pk=pk, author=self.request.user)

    def get(self, request, pk):
        post = self.get_object(pk)
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        post = self.get_object(pk)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        post = self.get_object(pk)
        serializer = BlogPostSerializer(post, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        post = self.get_object(pk)
        serializer = BlogPostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)