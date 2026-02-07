<div align="center">
  
  <img src="assets/logo.svg" width="200" alt="SafRAG Logo" style="display: inline-block; vertical-align: middle; margin-right: 20px;"/>
  
  <p style="font-size: 24px; font-weight: bold;">SafRAG: Provably Secure Retrieval-Augmented Generation</p>

  [简体中文](README.md) | [English](README_EN.md)

  [![Paper](https://img.shields.io/badge/Paper-arXiv-red)](https://arxiv.org/abs/2508.01084)
  ![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

<div align="center">
  <img src="assets/framework.png" alt="AgentMark Overview"/>
</div>

---

**SafRAG** is a Retrieval-Augmented Generation (RAG) system featuring **Permission Control** and **Hierarchical Encryption**, designed to address data security and privacy concerns in enterprise RAG applications.

By introducing a strict **Access Control Layer** and **Hierarchical Encryption** mechanism, SafRAG ensures that only authorized users can retrieve and access specific knowledge base content, preventing sensitive information leakage during the RAG retrieval process.

### Key Features

*   **🛡️ Hierarchical Permission Control**: Implements level-based access control for users and documents, ensuring secure information flow.
*   **🔒 Hierarchical Encryption**: Adopts hierarchical encryption for documents of different sensitivity levels during storage and indexing, ensuring data security at rest and in transit.
*   **🧠 Efficient RAG Engine**: Built on **LlamaIndex** and **ChromaDB**, supporting high-performance vector retrieval and LLM generation.
*   **🖥️ Full-Stack Architecture**:
    *   **Frontend**: Modern interactive interface built with Next.js.
    *   **Backend**: Spring Boot providing robust business logic and authentication services.
    *   **RAG Service**: Python (FastAPI) providing core AI retrieval capabilities.
*   **📦 Containerized Deployment**: Provides complete Docker Compose support for one-click startup of all services (MinIO, MySQL, ChromaDB, Web App).

### Quick Start

#### Prerequisites

*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   OpenAI API Key (or compatible LLM service)

#### Installation

1.  **Clone Repository**

    ```bash
    git clone https://github.com/Dwinovo/SafRAG
    cd SafRAG
    ```

2.  **Configure Environment Variables**

    Copy the example configuration file and fill in your configuration (especially `OPENAI_API_KEY`):

    ```bash
    cp .env.example .env
    # Edit .env file, fill in your API Key and other configurations
    ```

3.  **Start Services**

    Start all services with one click using Docker Compose:

    ```bash
    docker-compose up -d
    ```

4.  **Access Application**

    *   **Web Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **MinIO Console**: [http://localhost:9001](http://localhost:9001) (See `.env` for default credentials)

### System Architecture

*   **Client**: Next.js (Port 3000) - User Interface, responsible for document upload, chat interaction, and management.
*   **Server**: Spring Boot (Port 8080) - Core business system, managing user permissions, knowledge base metadata, and security policies.
*   **RAG Engine**: Python/FastAPI (Port 8000) - Responsible for document chunking, vector embedding, and retrieval generation.
*   **Infrastructure**:
    *   **MySQL**: Stores business data (users, permissions, metadata).
    *   **MinIO**: Object storage, used for storing original documents.
    *   **ChromaDB**: Vector database, storing Embedding indexes.

---

### License

[MIT](LICENSE) © 2025 SafRAG Contributors

### Citation

This project is based on the core ideas of the following paper:

```bibtex
@article{zhou2025provably,
  title={Provably secure retrieval-augmented generation},
  author={Zhou, Pengcheng and Feng, Yinglun and Yang, Zhongliang},
  journal={arXiv preprint arXiv:2508.01084},
  year={2025}
}
```
