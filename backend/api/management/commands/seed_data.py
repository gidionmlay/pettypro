from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Organization, Wallet, Category, Expense
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seed initial data for PettyPro'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Ensure an Organization exists
        org, created = Organization.objects.get_or_create(name="PettyPro Main")
        if created:
            self.stdout.write(f'Created Organization: {org.name}')

        # 2. Ensure a Wallet exists for this organization
        wallet, created = Wallet.objects.get_or_create(organization=org)
        if created:
            wallet.balance = 5000.00
            wallet.save()
            self.stdout.write(f'Created Wallet with balance: {wallet.balance}')

        # 3. Create Default Categories
        categories = ['Office Supplies', 'Travel', 'Meals', 'Utilities', 'Maintenance', 'Entertainment']
        for cat_name in categories:
            cat, created = Category.objects.get_or_create(organization=org, name=cat_name)
            if created:
                self.stdout.write(f'Created Category: {cat_name}')

        # 4. Create some sample expenses if none exist
        if Expense.objects.count() <= 1:
            users = User.objects.all()
            if not users:
                self.stdout.write('No users found. Please register a user first.')
                return

            user = users.first()
            cats = list(Category.objects.all())
            
            # Create expenses for the last 7 days
            for i in range(10):
                days_ago = random.randint(0, 7)
                amount = random.uniform(10, 200)
                Expense.objects.create(
                    wallet=wallet,
                    user=user,
                    category=random.choice(cats) if cats else None,
                    note=f"Sample Expense {i+1}",
                    amount=amount,
                    status='APPROVED',
                    expense_date=timezone.now() - timezone.timedelta(days=days_ago)
                )
                wallet.balance -= amount
                wallet.save()
            
            self.stdout.write('Created sample expenses')

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
