# apps/courses/signals.py — YANGI FAYL YARATISH KERAK!

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Course, Module, Lesson, Quiz, Enrollment
from apps.users.models import User
import logging

logger = logging.getLogger(__name__)


# ============================================================
# SIGNAL 1: Yangi MODUL qo'shilganda
# ============================================================
@receiver(post_save, sender=Module)
def module_created_notification(sender, instance, created, **kwargs):
    """
    Admin paneldan yangi modul qo'shilganda,
    kursga yozilgan barcha talabalarni xabardor qilish
    """
    if created:
        course = instance.course
        enrolled_students = Enrollment.objects.filter(course=course).select_related('user')
        
        logger.info(f"Yangi modul yaratildi: {instance.title} (Kurs: {course.title})")
        logger.info(f"Xabardor qilinadigan talabalar: {enrolled_students.count()} ta")
        
        # Har bir talabaga bildirishnoma yuborish (agar Notification modeli bo'lsa)
        try:
            from apps.notifications.models import Notification
            for enrollment in enrolled_students:
                Notification.objects.create(
                    user=enrollment.user,
                    title=f"Yangi modul qo'shildi: {course.title}",
                    message=f"'{instance.title}' moduli '{course.title}' kursiga qo'shildi. Hoziroq ko'ring!",
                    notification_type='course_update'
                )
                logger.info(f"Bildirishnoma yuborildi: {enrollment.user.username}")
        except ImportError:
            logger.warning("Notification modeli topilmadi. Bildirishnoma yuborilmadi.")


# ============================================================
# SIGNAL 2: Yangi DARS qo'shilganda
# ============================================================
@receiver(post_save, sender=Lesson)
def lesson_created_notification(sender, instance, created, **kwargs):
    """
    Admin paneldan yangi dars qo'shilganda,
    kursga yozilgan barcha talabalarni xabardor qilish
    """
    if created:
        module = instance.module
        course = module.course
        enrolled_students = Enrollment.objects.filter(course=course).select_related('user')
        
        logger.info(f"Yangi dars yaratildi: {instance.title} (Modul: {module.title}, Kurs: {course.title})")
        logger.info(f"Xabardor qilinadigan talabalar: {enrolled_students.count()} ta")
        
        try:
            from apps.notifications.models import Notification
            for enrollment in enrolled_students:
                Notification.objects.create(
                    user=enrollment.user,
                    title=f"Yangi dars: {course.title}",
                    message=f"'{instance.title}' darsi '{module.title}' moduliga qo'shildi!",
                    notification_type='new_lesson'
                )
                logger.info(f"Bildirishnoma yuborildi: {enrollment.user.username}")
        except ImportError:
            logger.warning("Notification modeli topilmadi.")


# ============================================================
# SIGNAL 3: Yangi TEST qo'shilganda
# ============================================================
@receiver(post_save, sender=Quiz)
def quiz_created_notification(sender, instance, created, **kwargs):
    """
    Admin paneldan yangi test qo'shilganda,
    kursga yozilgan barcha talabalarni xabardor qilish
    """
    if created:
        lesson = instance.lesson
        course = lesson.module.course
        enrolled_students = Enrollment.objects.filter(course=course).select_related('user')
        
        logger.info(f"Yangi test yaratildi: {instance.title} (Dars: {lesson.title}, Kurs: {course.title})")
        logger.info(f"Xabardor qilinadigan talabalar: {enrolled_students.count()} ta")
        
        try:
            from apps.notifications.models import Notification
            for enrollment in enrolled_students:
                Notification.objects.create(
                    user=enrollment.user,
                    title=f"Yangi test: {course.title}",
                    message=f"'{instance.title}' testi '{lesson.title}' darsiga qo'shildi. Testni yechishga tayyormisiz?",
                    notification_type='new_quiz'
                )
                logger.info(f"Bildirishnoma yuborildi: {enrollment.user.username}")
        except ImportError:
            logger.warning("Notification modeli topilmadi.")


# ============================================================
# SIGNAL 4: KURS YANGILANGANDA (Admin nashr qilganda)
# ============================================================
@receiver(post_save, sender=Course)
def course_published_notification(sender, instance, created, **kwargs):
    """
    Kurs draft'dan published holatiga o'tganda,
    barcha yozilgan talabalarni xabardor qilish
    """
    if not created and instance.status == 'published':
        enrolled_students = Enrollment.objects.filter(course=instance).select_related('user')
        
        logger.info(f"Kurs nashr qilindi: {instance.title}")
        logger.info(f"Xabardor qilinadigan talabalar: {enrolled_students.count()} ta")
        
        try:
            from apps.notifications.models import Notification
            for enrollment in enrolled_students:
                Notification.objects.create(
                    user=enrollment.user,
                    title=f"Kurs yangilandi: {instance.title}",
                    message=f"'{instance.title}' kursi yangilandi va nashr qilindi! Yangi darslar mavjud.",
                    notification_type='course_update'
                )
                logger.info(f"Bildirishnoma yuborildi: {enrollment.user.username}")
        except ImportError:
            logger.warning("Notification modeli topilmadi.")


# ============================================================
# SIGNAL 5: MODUL O'CHIRILGANDA
# ============================================================
@receiver(post_delete, sender=Module)
def module_deleted_notification(sender, instance, **kwargs):
    """
    Admin modul o'chirganda talabalarni xabardor qilish
    """
    course = instance.course
    enrolled_students = Enrollment.objects.filter(course=course).select_related('user')
    
    logger.warning(f"Modul o'chirildi: {instance.title} (Kurs: {course.title})")
    
    try:
        from apps.notifications.models import Notification
        for enrollment in enrolled_students:
            Notification.objects.create(
                user=enrollment.user,
                title=f"Modul o'chirildi: {course.title}",
                message=f"'{instance.title}' moduli '{course.title}' kursidan o'chirildi.",
                notification_type='course_update'
            )
    except ImportError:
        pass