from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import LearningResource

def seed_resources():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if resources are already seeded
        if db.query(LearningResource).count() > 0:
            print("Database already contains learning resources. Skipping seed.")
            return

        print("Seeding database with sample learning resources...")
        
        sample_resources = [
            # Mathematics
            LearningResource(
                title="Algebra Fundamentals and Equations",
                subject="Mathematics",
                type="notes",
                url_or_path="https://example.com/math/algebra_notes.pdf",
                description="Comprehensive study notes covering linear equations, quadratic formulas, factorization, and basic variable manipulation."
            ),
            LearningResource(
                title="Understanding Calculus: Limits & Derivatives",
                subject="Mathematics",
                type="video",
                url_or_path="https://www.youtube.com/embed/tIeHLnjs5U8",
                description="Visual step-by-step video guide explaining limits, rates of change, derivatives, and real-world calculus applications."
            ),
            LearningResource(
                title="Maths Class 12 Term-II Exam Paper",
                subject="Mathematics",
                type="paper",
                url_or_path="https://example.com/math/class12_math_paper.pdf",
                description="Previous year CBSE Board Exam question paper containing sections on integrations, vectors, and three-dimensional geometry."
            ),
            # Science
            LearningResource(
                title="Cell Biology and Photosynthesis Guide",
                subject="Science",
                type="notes",
                url_or_path="https://example.com/science/cell_biology.pdf",
                description="Short notes explaining eukaryotic vs prokaryotic cells, organelle functions, and chemical equations of light-dependent photosynthesis."
            ),
            LearningResource(
                title="Newton's Laws of Motion Explained",
                subject="Science",
                type="video",
                url_or_path="https://www.youtube.com/embed/kKKM8Y-g7lk",
                description="High-quality animation demonstrating Newton's First, Second, and Third laws with interactive physics examples."
            ),
            LearningResource(
                title="General Physics & Chemistry Sample Paper",
                subject="Science",
                type="paper",
                url_or_path="https://example.com/science/science_mock_paper.pdf",
                description="Syllabus-aligned mock paper covering chemical reactions, periodic table trends, reflection of light, and Ohm's law."
            ),
            # Programming
            LearningResource(
                title="Introduction to Python Programming",
                subject="Programming",
                type="notes",
                url_or_path="https://example.com/coding/python_basics.pdf",
                description="Beginner-friendly cheat sheet for python syntax, variables, lists, dictionaries, functions, and file I/O operations."
            ),
            LearningResource(
                title="Data Structures: Lists, Stacks & Queues",
                subject="Programming",
                type="video",
                url_or_path="https://www.youtube.com/embed/RBSGKlAxfok",
                description="Educational tutorial covering implementation, operations, time complexity, and memory layout of linear data structures."
            ),
            LearningResource(
                title="AP Computer Science Mock Exam Coding Problems",
                subject="Programming",
                type="paper",
                url_or_path="https://example.com/coding/ap_comp_sci.pdf",
                description="Compilation of coding questions testing logic, recursion, object-oriented concepts, and basic algorithms in Python/Java."
            ),
            # General Knowledge
            LearningResource(
                title="World Geography: Continents, Oceans & Capitals",
                subject="General Knowledge",
                type="notes",
                url_or_path="https://example.com/gk/world_geography.pdf",
                description="Fact sheet containing coordinates, maps, populations, and capital cities of countries across all seven continents."
            ),
            LearningResource(
                title="A History of Space Exploration",
                subject="General Knowledge",
                type="video",
                url_or_path="https://www.youtube.com/embed/XjT2vLz330Q",
                description="Documentary tracing milestones in aerospace history from Sputnik, Apollo moon landings, to the James Webb Space Telescope."
            )
        ]
        
        db.bulk_save_objects(sample_resources)
        db.commit()
        print(f"Successfully seeded {len(sample_resources)} resources!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_resources()
