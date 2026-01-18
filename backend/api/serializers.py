from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.db import transaction
from django.contrib.auth.models import User
from .models import Organization, Wallet, Category, Expense



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class CustomRegisterSerializer(RegisterSerializer):
    username = None

    def save(self, request):
        user = super().save(request)
        with transaction.atomic():
            org = Organization.objects.create(
                name=f"{user.first_name or user.email}'s Org",
                owner=user
            )
            Wallet.objects.create(
                organization=org,
                balance=0.00
            )
            # Create default categories
            default_categories = ['Office Supplies', 'Travel', 'Meals']
            for cat_name in default_categories:
                Category.objects.create(organization=org, name=cat_name)
        return user

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class WalletSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'organization', 'organization_name', 'balance', 'last_updated']
        read_only_fields = ['balance', 'last_updated']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'wallet', 'user', 'user_name', 'category', 'category_name', 'note', 'amount', 'status', 'expense_date', 'created_at']
        read_only_fields = ['status', 'created_at', 'user', 'wallet']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than zero.")
        return value

    def validate_category(self, value):
        # Handle None/null - category is optional
        if not value:
            return None
        # Validate ownership only if category is provided
        if value.organization.owner != self.context['request'].user:
            raise serializers.ValidationError("Invalid category.")
        return value

class DashboardSerializer(serializers.Serializer):
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_expenses = ExpenseSerializer(many=True)
