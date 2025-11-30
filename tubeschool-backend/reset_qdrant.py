"""
Script to reset Qdrant collections (delete and recreate with proper indexes)
Run this if you're getting index-related errors
"""
from app.services.vector_service import VectorService
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("🔄 Resetting Qdrant collections...")
    print("⚠️  This will delete all existing data!")

    confirm = input("Continue? (yes/no): ")

    if confirm.lower() == 'yes':
        vector_service = VectorService()
        vector_service.reset_collections()
        print("✅ Done! Collections reset with proper indexes.")
    else:
        print("❌ Cancelled.")