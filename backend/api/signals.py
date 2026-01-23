from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Expense, Wallet, Profile
from django.contrib.auth.models import User
from .serializers import ExpenseSerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

def get_dashboard_data(user):
    wallet = Wallet.objects.filter(organization__owner=user).first()
    if not wallet:
        return {}

    today = timezone.now()
    start_of_week = today - timedelta(days=today.weekday())
    
    today_expense = Expense.objects.filter(
        wallet=wallet, 
        status='APPROVED',
        expense_date__date=today.date()
    ).exclude(note="Wallet Top-up").aggregate(Sum('amount'))['amount__sum'] or 0

    monthly_expense = Expense.objects.filter(
        wallet=wallet,
        status='APPROVED',
        expense_date__year=today.year,
        expense_date__month=today.month
    ).exclude(note="Wallet Top-up").aggregate(Sum('amount'))['amount__sum'] or 0

    monthly_income = Expense.objects.filter(
        wallet=wallet,
        status='APPROVED',
        note="Wallet Top-up",
        expense_date__year=today.year,
        expense_date__month=today.month
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    recent_expenses = Expense.objects.filter(wallet=wallet).order_by('-created_at')[:5]

    chart_data = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        amount = Expense.objects.filter(
            wallet=wallet,
            status='APPROVED',
            expense_date__date=day_date.date()
        ).exclude(note="Wallet Top-up").aggregate(Sum('amount'))['amount__sum'] or 0
        chart_data.append({"name": days[i], "amount": float(amount)})

    prev_month_date = today.replace(day=1) - timedelta(days=1)
    prev_monthly_expense = Expense.objects.filter(
        wallet=wallet,
        status='APPROVED',
        expense_date__year=prev_month_date.year,
        expense_date__month=prev_month_date.month
    ).exclude(note="Wallet Top-up").aggregate(Sum('amount'))['amount__sum'] or 0
    
    expense_trend = 0
    if prev_monthly_expense > 0:
        expense_trend = ((float(monthly_expense) - float(prev_monthly_expense)) / float(prev_monthly_expense)) * 100

    return {
        "balance": float(wallet.balance),
        "today_expense": float(today_expense),
        "monthly_expense": float(monthly_expense),
        "monthly_income": float(monthly_income),
        "expense_trend": f"{expense_trend:.1f}%",
        "recent_expenses": ExpenseSerializer(recent_expenses, many=True).data,
        "chart_data": chart_data
    }

def get_expenses_data(user):
    expenses = Expense.objects.filter(user=user).order_by('-created_at')
    return ExpenseSerializer(expenses, many=True).data

@receiver(post_save, sender=Expense)
@receiver(post_delete, sender=Expense)
def notify_dashboard_update(sender, instance, **kwargs):
    user = instance.user
    if user:
        channel_layer = get_channel_layer()
        dashboard_data = get_dashboard_data(user)
        expenses_data = get_expenses_data(user)
        
        async_to_sync(channel_layer.group_send)(
            f"dashboard_user_{user.id}",
            {
                "type": "dashboard_update",
                "data": {
                    "dashboard": dashboard_data,
                    "expenses": expenses_data
                 }
            }
        )

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    instance.profile.save()
