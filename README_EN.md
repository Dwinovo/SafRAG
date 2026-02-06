# SafRAG: Provably Secure Retrieval-Augmented Generation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-supported-green.svg)](docker-compose.yml)

[中文版本](README.md)

---

**SafRAG** is a Retrieval-Augmented Generation (RAG) system featuring **Permission Control** and **Hierarchical Encryption**. Designed based on the theoretical framework of [Provably secure retrieval-augmented generation](https://arxiv.org/abs/2508.01084), it addresses data security and privacy concerns in enterprise RAG applications.

By introducing a strict Level-based Access Control layer and hierarchical encryption mechanisms, SafRAG ensures that only authorized users can retrieve and access specific knowledge base content, preventing sensitive information leakage during the RAG retrieval process.

### Key Features

*   **🛡️ Hierarchical Permission Control**: Implements level-based access control for users and documents, ensuring secure information flow.
*   **🔒 Hierarchical Encryption**: Adopts hierarchical encryption for documents of different sensitivity levels during storage and indexing.
*   **🧠 Efficient RAG Engine**: Built on **LlamaIndex** and **ChromaDB**, supporting high-performance vector retrieval and LLM generation.
*   **🖥️ Full-Stack Architecture**:
    *   **Frontend**: Modern UI built with Next.js.
    *   **Backend**: Spring Boot providing robust business logic and authentication.
    *   **RAG Service**: Python (FastAPI) powering core AI retrieval capabilities.
*   **📦 Containerized Deployment**: Full Docker Compose support for one-click deployment of all services (MinIO, MySQL, ChromaDB, Web App).

### Citation

This project implements the core ideas from the following paper:

> **Provably secure retrieval-augmented generation**
> *Pengcheng Zhou, Yinglun Feng, Zhongliang Yang*
> arXiv preprint arXiv:2508.01084, 2025

```bibtex
@article{zhou2025provably,
  title={Provably secure retrieval-augmented generation},
  author={Zhou, Pengcheng and Feng, Yinglun and Yang, Zhongliang},
  journal={arXiv preprint arXiv:2508.01084},
  year={2025}
}
```

### Quick Start

#### Prerequisites

*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   OpenAI API Key (or compatible LLM service)

#### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/SafRAG.git
    cd SafRAG
    ```

2.  **Configure Environment Variables**

    Copy the example configuration file and fill in your settings (especially `OPENAI_API_KEY`):

    ```bash
    cp .env.example .env
    # Edit .env file with your API Key and other configs
    ```

3.  **Start Services**

    Launch all services using Docker Compose:

    ```bash
    docker-compose up -d
    ```

4.  **Access the Application**

    *   **Web UI**: [http://localhost:3000](http://localhost:3000)
    *   **MinIO Console**: [http://localhost:9001](http://localhost:9001) (See `.env` for credentials)
    *   **API Docs**: [http://localhost:8080/doc.html](http://localhost:8080/doc.html) (Depending on configuration)

### System Architecture

*   **Client**: Next.js (Port 3000) - User Interface for document management and chat.
*   **Server**: Spring Boot (Port 8080) - Core business system managing user permissions, metadata, and security policies.
*   **RAG Engine**: Python/FastAPI (Port 8000) - Handles document chunking, vector embeddings, and retrieval generation.
*   **Infrastructure**:
    *   **MySQL**: Stores business data (Users, Permissions, Metadata).
    *   **MinIO**: Object storage for raw documents.
    *   **ChromaDB**: Vector database for embedding indexes.

---

### License

[MIT](LICENSE) © 2025 SafRAG Contributors
