from datetime import timedelta
from rest_framework import viewsets, permissions, status, views, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from dj_rest_auth.registration.views import RegisterView
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum
from .models import Organization, Wallet, Category, Expense, Profile
from .serializers import (
    WalletSerializer, CategorySerializer, ExpenseSerializer, DashboardSerializer,
    CustomRegisterSerializer, ProfileSerializer
)

class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer

class DashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet = Wallet.objects.filter(organization__owner=request.user).first()
        if not wallet:
            return Response({"error": "No wallet configured"}, status=status.HTTP_404_NOT_FOUND)

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

        # Aggregate weekly chart data
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

        # Today vs Yesterday Trend
        yesterday_date = today - timedelta(days=1)
        yesterday_expense = Expense.objects.filter(
            wallet=wallet,
            status='APPROVED',
            expense_date__date=yesterday_date.date()
        ).exclude(note="Wallet Top-up").aggregate(Sum('amount'))['amount__sum'] or 0
        
        today_trend = 0
        if yesterday_expense > 0:
            today_trend = ((float(today_expense) - float(yesterday_expense)) / float(yesterday_expense)) * 100

        # Trend calculation (Current Month vs Previous Month)
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

        data = {
            "balance": float(wallet.balance),
            "today_expense": float(today_expense),
            "monthly_expense": float(monthly_expense),
            "monthly_income": float(monthly_income),
            "today_trend": f"{today_trend:+.1f}%",
            "expense_trend": f"{expense_trend:+.1f}%",
            "recent_expenses": ExpenseSerializer(recent_expenses, many=True).data,
            "chart_data": chart_data
        }
        
        return Response(data)

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wallet.objects.filter(organization__owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def topup(self, request, pk=None):
        wallet = self.get_object()
        
        # Verify ownership
        if wallet.organization.owner != request.user:
            return Response({"error": "You do not have permission to top up this wallet."}, 
                            status=status.HTTP_403_FORBIDDEN)
        amount = request.data.get('amount')
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            wallet.balance +=  amount
            wallet.save()
            
            # Log as a special 'income' expense or audit log (Simplified here)
            Expense.objects.create(
                wallet=wallet,
                user=request.user,
                category=None,
                note="Wallet Top-up",
                amount=amount, # Logic might differ if tracking income vs expense
                status='APPROVED'
            )

        return Response(WalletSerializer(wallet).data)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(organization__owner=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category')
        if category:
            wallet = Wallet.objects.filter(organization=category.organization).first()
        else:
            wallet = Wallet.objects.filter(organization__owner=self.request.user).first()
            
        if not wallet:
            raise serializers.ValidationError({"detail": "No wallet found for this user/category."})

        amount = serializer.validated_data['amount']

        with transaction.atomic():
            # Lock wallet row for update
            try:
                wallet_obj = Wallet.objects.select_for_update().get(id=wallet.id)
            except Wallet.DoesNotExist:
                raise serializers.ValidationError({"detail": "Wallet no longer exists."})
            
            if wallet_obj.balance < amount:
                raise serializers.ValidationError({
                    "amount": f"Insufficient wallet balance. Available: {float(wallet_obj.balance):,.2f} TZS"
                })
            
            wallet_obj.balance -= amount
            wallet_obj.save()
            
            serializer.save(user=self.request.user, wallet=wallet_obj, status='APPROVED')

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
