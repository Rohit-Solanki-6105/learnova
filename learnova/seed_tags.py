import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learnova.settings')
django.setup()


from courses.models import Tag

def delete_all_tags():
    Tag.objects.all().delete()
    print("Deleted all tags")

def seed_tags(count=10000):
    print(f"Starting to seed {count} tags...")
    
    prefixes = ['Web', 'Data', 'Cloud', 'Mobile', 'AI', 'Neural', 'Cyber', 'Digital', 'Quantum', 'Bio', 'Nano', 'Dev', 'Ops', 'Full', 'Back', 'Front', 'Smart', 'Global', 'Future', 'Secure']
    suffixes = ['Dev', 'Science', 'Security', 'Ops', 'Design', 'Architecture', 'Management', 'Intelligence', 'Analytics', 'Framework', 'Engine', 'Systems', 'Computing', 'Network', 'Expert', 'Mastery', 'Basics', 'Pro', 'Elite', 'Solutions']
    
    existing_tags = set(Tag.objects.values_list('name', flat=True))
    tags_to_create = []
    seen_names = set()
    
    attempts = 0
    max_attempts = count * 10
    
    while len(tags_to_create) < count and attempts < max_attempts:
        attempts += 1
        
        # Create a name like "QuantumSystems-1234" or "AI-Mastery-5678"
        name = f"{random.choice(prefixes)}{random.choice(suffixes)}-{random.randint(1000, 999999)}"
        name = name[:50] # max_length is 50
        
        if name not in existing_tags and name not in seen_names:
            tags_to_create.append(Tag(name=name))
            seen_names.add(name)
            
            if len(tags_to_create) % 1000 == 0:
                print(f"Generated {len(tags_to_create)} unique names...")

    if tags_to_create:
        print(f"Bulk creating {len(tags_to_create)} tags in database...")
        Tag.objects.bulk_create(tags_to_create, ignore_conflicts=True)
        print("Done!")
    else:
        print("No new tags to create.")

if __name__ == "__main__":
    # seed_tags(400)
    delete_all_tags()
