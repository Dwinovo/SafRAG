import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL_PATH = os.getenv("EMBEDDING_MODEL_PATH")
